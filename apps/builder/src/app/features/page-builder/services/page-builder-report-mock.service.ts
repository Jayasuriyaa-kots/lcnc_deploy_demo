import { Injectable, computed, inject } from '@angular/core';
import { PageBuilderFormMockService, FormSubmissionRecord } from '@builder/features/page-builder/services/page-builder-form-mock.service';
import {
  ReportWidgetColumnPreview,
  ReportWidgetConfig,
  ReportWidgetRowPreview,
} from '@builder/features/page-builder/models/page-builder-canvas.model';

@Injectable({ providedIn: 'root' })
export class PageBuilderReportMockService {
  private readonly formMock = inject(PageBuilderFormMockService);

  readonly submissions = computed(() => this.formMock.submissions());

  getRows(config: ReportWidgetConfig): ReportWidgetRowPreview[] {
    const submissions = this.formMock.getSubmissions(config.sourceFormId);
    const baseRows = submissions.length
      ? submissions.map((submission) => ({
          id: submission.id,
          values: config.columns.map((column) => this.resolveColumnValue(column, submission, config.sourceFormId)),
        }))
      : config.rows;

    if (!config.filterConfigured || !config.filterCriteriaRows.length) {
      return baseRows;
    }

    return baseRows.filter((row) => this.matchesFilters(config, row));
  }

  getRowCount(config: ReportWidgetConfig): number {
    return this.getRows(config).length;
  }

  private resolveColumnValue(
    column: ReportWidgetColumnPreview,
    submission: FormSubmissionRecord,
    sourceFormId: string,
  ): string {
    const values = submission.values;

    if (column.sourceFieldId && values[column.sourceFieldId]) {
      return values[column.sourceFieldId];
    }

    if (values[column.id]) {
      return values[column.id];
    }

    if (column.id === 'employee_name' || column.id === 'full_name') {
      if (values.employee_name) {
        return values.employee_name;
      }

      const firstName = values.first_name?.trim() ?? '';
      const lastName = values.last_name?.trim() ?? '';
      const fullName = `${firstName} ${lastName}`.trim();
      return fullName || 'Saved record';
    }

    if (column.id === 'start_date') {
      return values.start_date || values.joining_date || values.log_date || 'Saved';
    }

    if (column.id === 'department') {
      return values.department || 'Saved';
    }

    if (column.id === 'leave_type') {
      return values.leave_type || 'Saved';
    }

    if (column.id === 'status') {
      if (sourceFormId === 'attendance-form') {
        return values.check_in ? 'Present' : 'Saved';
      }

      return 'Saved';
    }

    return 'Saved';
  }

  private matchesFilters(config: ReportWidgetConfig, row: ReportWidgetRowPreview): boolean {
    const activeRows = config.filterCriteriaRows.filter(
      (criteria) => criteria.field.trim() && criteria.operator.trim() && criteria.value.trim(),
    );

    if (!activeRows.length) {
      return true;
    }

    let result = this.matchesFilterRow(config, row, activeRows[0]);

    for (let index = 1; index < activeRows.length; index += 1) {
      const criteria = activeRows[index];
      const matches = this.matchesFilterRow(config, row, criteria);
      result = criteria.joiner === 'OR' ? result || matches : result && matches;
    }

    return result;
  }

  private matchesFilterRow(
    config: ReportWidgetConfig,
    row: ReportWidgetRowPreview,
    criteria: ReportWidgetConfig['filterCriteriaRows'][number],
  ): boolean {
    const columnIndex = config.columns.findIndex((column) => column.id === criteria.field);
    if (columnIndex === -1) {
      return true;
    }

    const actual = (row.values[columnIndex] ?? '').toLowerCase();
    const expected = criteria.value.trim().toLowerCase();

    switch (criteria.operator) {
      case 'notEquals':
        return actual !== expected;
      case 'contains':
        return actual.includes(expected);
      case 'equals':
      default:
        return actual === expected;
    }
  }
}
