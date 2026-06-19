import { Injectable, inject } from '@angular/core';
import { PreviewRecord, ReportJoin } from '@builder/features/report-builder/models/report-builder.models';
import {
  ReportBuilderAsset,
  ReportBuilderColumn,
  ReportBuilderFilterRule,
  ReportSortCriterion,
} from '@builder/features/report-builder/facades/report-builder.facade';
import { ReportSourceCatalogService } from '@builder/features/report-builder/services/report-source-catalog.service';

/**
 * Turns a report definition into the rows shown in its preview. Stateless: it
 * pulls raw rows from the source catalog, applies joins, maps columns, then
 * filters, groups and sorts. All inputs come from the passed report.
 */
@Injectable({ providedIn: 'root' })
export class ReportPreviewBuilderService {
  private readonly catalog = inject(ReportSourceCatalogService);

  /** Builds the final, filtered/grouped/sorted preview rows for a report. */
  buildPreviewRecords(report: ReportBuilderAsset | null): PreviewRecord[] {
    if (!report) {
      return [];
    }
    const records = this.createPreviewRecords(report);
    const filtered = this.filterPreviewRecords(records, report.filterRules);
    return this.applyGroupingAndSorting(filtered, {
      groupBy: report.settings.groupBy,
      groupOrder: report.settings.groupOrder,
      sortBy: report.settings.sortBy,
      sortOrder: report.settings.sortOrder,
      sortCriteria: report.settings.sortCriteria,
    });
  }

  /** Produces the unfiltered preview rows (datasource-backed or sample data). */
  private createPreviewRecords(report: ReportBuilderAsset): PreviewRecord[] {
    const columns = report.columns;

    const realDatasources = new Set(['flats_database', 'property_db', 'employees_form']);
    if (realDatasources.has(report.sourceFormId)) {
      return this.createJoinedDatasourcePreviewRecords(report, columns);
    }

    const mapFields = (values: Record<string, string>): Record<string, string> =>
      Object.fromEntries(
        columns.map((column) => [column.id, values[column.id] ?? this.getFallbackSampleValue(column.id)])
      );

    return [
      {
        id: 1,
        groupLabel: 'Punith K',
        fields: mapFields({
          employee_code: 'EMP-0001',
          full_name: 'Punith K',
          name: 'Punith K',
          employee_name: 'Punith K',
          requester_name: 'Punith K',
          email: 'punith.k@quantaops.com',
          work_email: 'punith.k@quantaops.com',
          requester_email: 'punith.k@quantaops.com',
          department: 'Housekeeping Services',
          designation: 'Supervisor',
          joining_date: '2026-03-24',
          salary_band: '11.2',
          profile_photo: 'Profile',
          address: 'Bangalore',
          phone: '9999000001',
          single_line: 'Housekeeping Services',
          multi_line: 'Friendly housekeeping staff ensure your apartment stays sparkling clean.',
          number: '1182',
          date: '2026-03-24',
          time: '12:22',
          drop_down: '2 BHK',
          radio: 'HSR',
          multi_select: 'Fridge, heater',
          checkbox: 'true',
          log_date: '2026-03-24',
          check_in: '09:04',
          check_out: '18:15',
          late_minutes: '2',
          status: 'Active',
          leave_type: 'Sick Leave',
          start_date: '2026-03-24',
          end_date: '2026-03-25',
          days: '2',
          approver: 'HR Manager',
        }),
      },
      {
        id: 2,
        groupLabel: 'Ajeeth Kumar',
        fields: mapFields({
          employee_code: 'EMP-0002',
          full_name: 'Ajeeth Kumar',
          name: 'Ajeeth Kumar',
          employee_name: 'Ajeeth Kumar',
          requester_name: 'Ajeeth Kumar',
          email: 'ajeethkumar1610@gmail.com',
          work_email: 'ajeethkumar1610@gmail.com',
          requester_email: 'ajeethkumar1610@gmail.com',
          department: 'Engineering',
          designation: 'Lead Developer',
          joining_date: '2026-03-23',
          salary_band: '13.5',
          profile_photo: 'Profile',
          address: 'Chennai',
          phone: '9999000002',
          single_line: 'HI I would Like to rent a Flat',
          multi_line: 'Easy move in and move out Effortless Transition Experience: No Sweat, No Stress',
          number: '8453',
          date: '2026-03-23',
          time: '12:19',
          drop_down: '1 BHK',
          radio: 'White Field',
          multi_select: 'Fridge, heater',
          checkbox: 'false',
          log_date: '2026-03-23',
          check_in: '09:12',
          check_out: '18:06',
          late_minutes: '12',
          status: 'Late',
          leave_type: 'Casual Leave',
          start_date: '2026-03-23',
          end_date: '2026-03-27',
          days: '4',
          approver: 'People Ops',
        }),
      },
    ];
  }

  /** Builds preview rows from a real datasource, applying the report's joins. */
  private createJoinedDatasourcePreviewRecords(
    report: ReportBuilderAsset,
    columns: ReportBuilderColumn[]
  ): PreviewRecord[] {
    const primaryRows = this.catalog.getDatasourceRows(report.sourceFormId);
    const joinedRows = this.applyJoinsToRows(primaryRows, report.joins);

    return joinedRows.map((row, index) => {
      const fields = Object.fromEntries(
        columns.map((column) => [column.id, this.resolvePreviewColumnValue(row, column)])
      );
      return {
        id: index + 1,
        groupLabel: String(
          fields['property_code'] || fields['flats_unique_id'] || fields['tenant_name'] || `Record ${index + 1}`
        ),
        fields,
      };
    });
  }

  /** Applies a report's joins (inner/left/right/lookup) to the primary rows. */
  private applyJoinsToRows(
    primaryRows: Record<string, unknown>[],
    joins: ReportJoin[]
  ): Record<string, unknown>[] {
    let result = primaryRows.map((row) => ({ ...row }));

    for (const join of joins) {
      const targetRows = this.catalog.getDatasourceRows(join.targetFormId);
      const sourceKey = join.on.sourceField;
      const targetKey = join.on.targetField;

      if (!sourceKey || !targetKey) {
        continue;
      }

      if (join.joinType === 'right') {
        const next: Record<string, unknown>[] = [];
        for (const target of targetRows) {
          const targetValue = this.getValueByColumnId(target, targetKey);
          const matches = result.filter(
            (source) => this.getValueByColumnId(source, sourceKey) === targetValue
          );
          if (matches.length === 0) {
            next.push(this.prefixJoinedRow({}, target, join.targetFormId));
            continue;
          }
          for (const matched of matches) {
            next.push(this.prefixJoinedRow(matched, target, join.targetFormId));
          }
        }
        result = next;
        continue;
      }

      const next: Record<string, unknown>[] = [];
      for (const source of result) {
        const sourceValue = this.getValueByColumnId(source, sourceKey);
        const matches = targetRows.filter(
          (target) => this.getValueByColumnId(target, targetKey) === sourceValue
        );
        if (matches.length === 0) {
          if (join.joinType === 'inner') {
            continue;
          }
          if (join.joinType === 'left' || join.joinType === 'lookup') {
            next.push(this.prefixJoinedRow(source, {}, join.targetFormId));
          }
          continue;
        }
        if (join.joinType === 'lookup') {
          next.push(this.prefixJoinedRow(source, matches[0], join.targetFormId));
          continue;
        }
        for (const matched of matches) {
          next.push(this.prefixJoinedRow(source, matched, join.targetFormId));
        }
      }
      result = next;
    }

    return result;
  }

  /** Merges a joined row into a source row, prefixing joined columns by form id. */
  private prefixJoinedRow(
    source: Record<string, unknown>,
    joined: Record<string, unknown>,
    targetFormId: string
  ): Record<string, unknown> {
    const prefixed = { ...source };
    const targetColumns = this.catalog.sourceOptions.find((option) => option.id === targetFormId)?.columns ?? [];
    for (const column of targetColumns) {
      prefixed[`${targetFormId}__${column.id}`] = this.getValueByColumnId(joined, column.id);
    }
    return prefixed;
  }

  /** Reads a row value by column id, tolerating un-normalised raw keys. */
  private getValueByColumnId(row: Record<string, unknown>, columnId: string): string {
    const direct = row[columnId];
    if (direct !== undefined && direct !== null) {
      return String(direct);
    }
    const matchedKey = Object.keys(row).find((key) => this.catalog.normalizeFlatColumnId(key) === columnId);
    if (!matchedKey) {
      return '';
    }
    const value = row[matchedKey];
    return value === undefined || value === null ? '' : String(value);
  }

  /** Reads a joined-column value by its already-prefixed id. */
  private resolveRowValueByColumnId(row: Record<string, unknown>, columnId: string): string {
    const value = row[columnId];
    if (value === undefined || value === null) {
      return '';
    }
    return String(value);
  }

  /** Resolves a column's value for a row (joined columns use their prefixed id). */
  private resolvePreviewColumnValue(row: Record<string, unknown>, column: ReportBuilderColumn): string {
    if (column.source === 'joined') {
      return this.resolveRowValueByColumnId(row, column.id);
    }
    return this.getValueByColumnId(row, column.id);
  }

  /** Keeps only the records matching every active filter rule. */
  private filterPreviewRecords(
    records: PreviewRecord[],
    filterRules: ReportBuilderFilterRule[]
  ): PreviewRecord[] {
    const activeRules = filterRules.filter((rule) => this.ruleIsActive(rule));
    if (activeRules.length === 0) {
      return records;
    }
    return records.filter((record) => activeRules.every((rule) => this.recordMatchesRule(record, rule)));
  }

  /** Applies grouping (if configured) and multi-key sorting to the records. */
  private applyGroupingAndSorting(
    records: PreviewRecord[],
    settings: {
      groupBy: string;
      groupOrder: 'none' | 'asc' | 'desc';
      sortBy: string;
      sortOrder: 'asc' | 'desc';
      sortCriteria?: ReportSortCriterion[];
    }
  ): PreviewRecord[] {
    if (records.length === 0) {
      return [];
    }
    const sortCriteria = this.resolveSortCriteria(settings.sortCriteria, settings.sortBy, settings.sortOrder);

    if (settings.groupBy) {
      return this.applyGrouping(records, settings.groupBy, settings.groupOrder, sortCriteria);
    }

    const normalizedRecords = records.map((record) => ({
      ...record,
      groupLabel: record.groupLabel || 'Record',
    }));
    return this.applySortBy(normalizedRecords, sortCriteria);
  }

  /** Groups records by a field, orders the groups, and sorts within each group. */
  private applyGrouping(
    records: PreviewRecord[],
    groupBy: string,
    groupOrder: 'none' | 'asc' | 'desc',
    sortCriteria: ReportSortCriterion[]
  ): PreviewRecord[] {
    const groups = new Map<string, PreviewRecord[]>();
    for (const record of records) {
      const groupValue = this.resolveGroupValue(record, groupBy);
      const existing = groups.get(groupValue) ?? [];
      existing.push(record);
      groups.set(groupValue, existing);
    }

    const orderedKeys = [...groups.keys()];
    if (groupOrder === 'asc' || groupOrder === 'desc') {
      orderedKeys.sort((left, right) => this.compareValues(left, right));
      if (groupOrder === 'desc') {
        orderedKeys.reverse();
      }
    }

    return orderedKeys.flatMap((key) => {
      const groupRecords = groups.get(key) ?? [];
      const sortedGroupRecords = this.applySortBy(groupRecords, sortCriteria);
      return sortedGroupRecords.map((record) => ({ ...record, groupLabel: key }));
    });
  }

  /** Stable multi-key sort of records by the given sort criteria. */
  private applySortBy(records: PreviewRecord[], sortCriteria: ReportSortCriterion[]): PreviewRecord[] {
    if (!sortCriteria.length) {
      return [...records];
    }
    return [...records].sort((left, right) => {
      for (const criterion of sortCriteria) {
        const compared = this.compareValues(
          left.fields[criterion.columnId] ?? '',
          right.fields[criterion.columnId] ?? ''
        );
        if (compared !== 0) {
          return criterion.direction === 'desc' ? -compared : compared;
        }
      }
      return 0;
    });
  }

  /** Normalises sort criteria, falling back to the legacy single sortBy field. */
  private resolveSortCriteria(
    sortCriteria: ReportSortCriterion[] | undefined,
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ): ReportSortCriterion[] {
    const normalized = (sortCriteria ?? [])
      .filter((criterion) => !!criterion?.columnId)
      .map((criterion) => ({
        columnId: criterion.columnId,
        direction: (criterion.direction === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc',
      }));
    if (normalized.length) {
      return normalized;
    }
    if (!sortBy) {
      return [];
    }
    return [{ columnId: sortBy, direction: sortOrder }];
  }

  /** Resolves the group key value for a record. */
  private resolveGroupValue(record: PreviewRecord, groupBy: string): string {
    return String(record.fields[groupBy] ?? 'Ungrouped');
  }

  /** Compares two string values as dates, then numbers, then locale text. */
  private compareValues(left: string, right: string): number {
    const normalizedLeft = left.trim();
    const normalizedRight = right.trim();

    if (this.looksLikeDateValue(normalizedLeft) || this.looksLikeDateValue(normalizedRight)) {
      const leftDate = Date.parse(normalizedLeft);
      const rightDate = Date.parse(normalizedRight);
      if (!Number.isNaN(leftDate) && !Number.isNaN(rightDate)) {
        return leftDate - rightDate;
      }
    }

    const leftNumber = this.toComparableNumber(normalizedLeft);
    const rightNumber = this.toComparableNumber(normalizedRight);
    if (leftNumber !== null && rightNumber !== null) {
      return leftNumber - rightNumber;
    }

    return normalizedLeft.localeCompare(normalizedRight, undefined, { sensitivity: 'base', numeric: true });
  }

  /** Parses a numeric value from a string (stripping currency/grouping), else null. */
  private toComparableNumber(value: string): number | null {
    if (!value) {
      return null;
    }
    const cleaned = value.replace(/,/g, '').replace(/[^\d.-]/g, '');
    if (!cleaned || cleaned === '-' || cleaned === '.' || cleaned === '-.') {
      return null;
    }
    const parsed = Number(cleaned);
    return Number.isNaN(parsed) ? null : parsed;
  }

  /** Heuristic: does this string look like a date/time value? */
  private looksLikeDateValue(value: string): boolean {
    return /[-/:T]/.test(value);
  }

  /** Whether a filter rule is active (has a meaningful value/operator). */
  private ruleIsActive(rule: ReportBuilderFilterRule): boolean {
    if (!rule.columnId || !rule.operator) {
      return false;
    }
    if (typeof rule.value === 'string') {
      return (
        rule.value.trim().length > 0 ||
        ['isEmpty', 'isNotEmpty', 'isChecked', 'isUnchecked'].includes(rule.operator)
      );
    }
    return (
      String(rule.value.start ?? '').trim().length > 0 || String(rule.value.end ?? '').trim().length > 0
    );
  }

  /** Evaluates a single filter rule against a record. */
  private recordMatchesRule(record: PreviewRecord, rule: ReportBuilderFilterRule): boolean {
    const rawValue = String(record.fields[rule.columnId] ?? '');
    const normalized = rawValue.toLowerCase();

    if (rule.operator === 'isEmpty') {
      return rawValue.trim() === '';
    }
    if (rule.operator === 'isNotEmpty') {
      return rawValue.trim() !== '';
    }
    if (rule.operator === 'isChecked') {
      return normalized === 'true' || normalized === 'yes' || normalized === 'checked';
    }
    if (rule.operator === 'isUnchecked') {
      return normalized === 'false' || normalized === 'no' || normalized === 'unchecked';
    }

    if (typeof rule.value === 'string') {
      const expected = rule.value.toLowerCase().trim();
      switch (rule.operator) {
        case 'is':
          return normalized === expected;
        case 'isNot':
          return normalized !== expected;
        case 'contains':
          return normalized.includes(expected);
        case 'notContains':
          return !normalized.includes(expected);
        case 'startsWith':
          return normalized.startsWith(expected);
        case 'endsWith':
          return normalized.endsWith(expected);
        case 'greaterThan':
          return Number(rawValue) > Number(rule.value);
        case 'greaterThanOrEqual':
          return Number(rawValue) >= Number(rule.value);
        case 'lessThan':
          return Number(rawValue) < Number(rule.value);
        case 'lessThanOrEqual':
          return Number(rawValue) <= Number(rule.value);
        case 'before':
          return Date.parse(rawValue) < Date.parse(rule.value);
        case 'after':
          return Date.parse(rawValue) > Date.parse(rule.value);
        case 'onOrBefore':
          return Date.parse(rawValue) <= Date.parse(rule.value);
        case 'onOrAfter':
          return Date.parse(rawValue) >= Date.parse(rule.value);
        default:
          return true;
      }
    }

    if (rule.operator === 'between') {
      const start = String(rule.value.start ?? '');
      const end = String(rule.value.end ?? '');

      const rawAsDate = Date.parse(rawValue);
      const startAsDate = Date.parse(start);
      const endAsDate = Date.parse(end);
      if (!Number.isNaN(rawAsDate) && !Number.isNaN(startAsDate) && !Number.isNaN(endAsDate)) {
        return rawAsDate >= startAsDate && rawAsDate <= endAsDate;
      }

      const rawAsNumber = Number(rawValue);
      const startAsNumber = Number(start);
      const endAsNumber = Number(end);
      if (!Number.isNaN(rawAsNumber) && !Number.isNaN(startAsNumber) && !Number.isNaN(endAsNumber)) {
        return rawAsNumber >= startAsNumber && rawAsNumber <= endAsNumber;
      }
    }

    return true;
  }

  /** Provides a believable placeholder value for sample (non-datasource) data. */
  private getFallbackSampleValue(columnId: string): string {
    const normalized = columnId.toLowerCase();
    if (normalized.includes('email')) {
      return 'sample@quantaops.com';
    }
    if (normalized.includes('date')) {
      return '2026-03-24';
    }
    if (normalized.includes('time')) {
      return '09:00';
    }
    if (normalized.includes('phone')) {
      return '9999000000';
    }
    if (normalized.includes('status')) {
      return 'Active';
    }
    if (normalized.includes('name')) {
      return 'Sample Name';
    }
    if (normalized.includes('number') || normalized.includes('count') || normalized.includes('days')) {
      return '1';
    }
    return 'Sample';
  }
}
