import { signal } from '@angular/core';
import { PageBuilderFormMockService } from '@builder/features/page-builder/services/page-builder-form-mock.service';
import { PageBuilderReportMockService } from '@builder/features/page-builder/services/page-builder-report-mock.service';
import {
  CanvasWidget,
  FormWidgetConfig,
  FormWidgetFieldPreview,
  ReportWidgetConfig,
  ReportWidgetRowPreview,
  buildPrintableReportMarkup,
  escapeCsvValue,
  getFormInputType,
  isSelectLikeField,
  slugifyReportLabel,
} from '@builder/features/page-builder/models/page-builder-canvas.model';

import { SelectOption } from '@qo/ui-components';

export abstract class PageBuilderWidgetRuntimeBase {
  protected abstract readonly formMock: PageBuilderFormMockService;
  protected abstract readonly reportMock: PageBuilderReportMockService;

  readonly reportSearchQueries = signal<Record<string, string>>({});
  readonly reportSearchOpenState = signal<Record<string, boolean>>({});

  protected getWidgetFieldSelectOptions(options: string[], placeholder?: string): SelectOption[] {
    const opts = options.map((opt) => ({ label: opt, value: opt }));
    return placeholder ? [{ label: placeholder, value: '' }, ...opts] : opts;
  }

  protected getWidgetFormFieldValue(widget: CanvasWidget, field: FormWidgetFieldPreview): string {
    return this.formMock.getFieldValue(widget.id, field.id);
  }

  protected onWidgetFormFieldInput(widget: CanvasWidget, field: FormWidgetFieldPreview, event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement | null;
    this.formMock.updateFieldValue(widget.id, field.id, target?.value ?? '');
  }

  protected onWidgetFormFieldValueChange(widget: CanvasWidget, field: FormWidgetFieldPreview, value: string | number): void {
    this.formMock.updateFieldValue(widget.id, field.id, String(value ?? ''));
  }

  protected submitWidgetForm(event: Event, widget: CanvasWidget, formConfig: FormWidgetConfig, stopPropagation = false): void {
    event.preventDefault();
    if (stopPropagation) {
      event.stopPropagation();
    }
    this.formMock.submitForm(widget.id, formConfig);
  }

  protected resetWidgetForm(event: Event, widget: CanvasWidget, formConfig: FormWidgetConfig, stopPropagation = false): void {
    event.preventDefault();
    if (stopPropagation) {
      event.stopPropagation();
    }
    this.formMock.resetDraft(widget.id, formConfig);
  }

  protected getFormSubmissionCount(formConfig: FormWidgetConfig): number {
    return this.formMock.getSubmissionCount(formConfig.formId);
  }

  protected showFormSuccessMessage(widget: CanvasWidget, formConfig: FormWidgetConfig): boolean {
    return this.formMock.wasLastSubmitted(widget.id) && !!formConfig.submitConfig.successMessage.trim();
  }

  protected getReportRows(widgetOrKey: CanvasWidget | string, reportConfig: ReportWidgetConfig): ReportWidgetRowPreview[] {
    const rows = this.reportMock.getRows(reportConfig);
    const query = this.getReportSearchQuery(this.getReportSearchKey(widgetOrKey)).trim().toLowerCase();

    if (!query) {
      return rows;
    }

    return rows.filter((row) => row.values.some((value) => value.toLowerCase().includes(query)));
  }

  protected getReportRowCount(widgetOrKey: CanvasWidget | string, reportConfig: ReportWidgetConfig): number {
    return this.getReportRows(widgetOrKey, reportConfig).length;
  }

  protected isReportSearchOpen(widgetId: string): boolean {
    return !!this.reportSearchOpenState()[widgetId];
  }

  protected getReportSearchQuery(widgetId: string): string {
    return this.reportSearchQueries()[widgetId] ?? '';
  }

  protected toggleReportSearch(widgetId: string): void {
    const nextOpen = !this.isReportSearchOpen(widgetId);
    this.reportSearchOpenState.update((state) => ({ ...state, [widgetId]: nextOpen }));

    if (!nextOpen) {
      this.reportSearchQueries.update((state) => ({ ...state, [widgetId]: '' }));
    }
  }

  protected onReportSearchInput(widgetId: string, event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.reportSearchQueries.update((state) => ({ ...state, [widgetId]: target?.value ?? '' }));
  }

  protected onReportSearchValueChange(widgetId: string, value: string): void {
    this.reportSearchQueries.update((state) => ({ ...state, [widgetId]: value ?? '' }));
  }

  protected printReport(widgetOrKey: CanvasWidget | string, reportConfig: ReportWidgetConfig): void {
    const rows = this.getReportRows(widgetOrKey, reportConfig);
    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=960,height=720');

    if (!printWindow) {
      return;
    }

    printWindow.document.write(buildPrintableReportMarkup(reportConfig, rows));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  protected exportReport(widgetOrKey: CanvasWidget | string, reportConfig: ReportWidgetConfig): void {
    const rows = this.getReportRows(widgetOrKey, reportConfig);
    const csvLines = [
      reportConfig.columns.map((column) => escapeCsvValue(column.label)).join(','),
      ...rows.map((row) => row.values.map((value) => escapeCsvValue(value)).join(',')),
    ];
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${slugifyReportLabel(reportConfig.reportLabel)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  protected getFormInputType(field: FormWidgetFieldPreview): string {
    return getFormInputType(field);
  }

  protected isSelectLikeField(field: FormWidgetFieldPreview): boolean {
    return isSelectLikeField(field);
  }

  private getReportSearchKey(widgetOrKey: CanvasWidget | string): string {
    return typeof widgetOrKey === 'string' ? widgetOrKey : widgetOrKey.id;
  }
}
