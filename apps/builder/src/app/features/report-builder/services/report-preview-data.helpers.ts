import { ReportBuilderColumn, ReportSortCriterion } from '@builder/features/report-builder/facades/report-builder.facade';
import { PreviewRecord } from '../models/report-builder.models';

/** A resolved row-level action shown in menus/toolbars. */
export type PreviewAction = { key: 'edit' | 'duplicate' | 'delete'; label: string; icon: string };

/** A single configurable rule in the search panel. */
export type SearchRow = {
  id: string;
  columnId: string;
  label: string;
  fieldType: string;
  operator: string;
  value: string;
  enabled: boolean;
};

/** A group of toolbar actions as stored on a report's settings. */
export type ActionGroup = { title: string; items: Array<{ label: string; enabled: boolean }> };

/**
 * Pure, stateless transform helpers for the report preview data pipeline.
 * Extracted from `ReportPreviewDataService` so the service stays a thin stateful
 * coordinator and this logic can be unit-tested in isolation.
 */

/** Tests a single field value against a search operator + query. */
export function matchesOperator(rawValue: string, rawQuery: string, operator: string): boolean {
  const orig = String(rawValue ?? '').trim();
  const value = orig.toLowerCase();
  const query = String(rawQuery ?? '').trim().toLowerCase();
  switch (operator) {
    case 'is':               return value === query;
    case 'is_not':           return value !== query;
    case 'contains':         return value.includes(query);
    case 'does_not_contain': return !value.includes(query);
    case 'starts_with':      return value.startsWith(query);
    case 'ends_with':        return value.endsWith(query);
    case 'is_empty':         return orig.length === 0;
    case 'is_not_empty':     return orig.length > 0;
    default:                 return value.includes(query);
  }
}

/** Maps a field type string to the HTML input type to use for its search value. */
export function getSearchInputType(fieldType: string): string {
  const n = (fieldType || '').toLowerCase();
  if (n.includes('date') && n.includes('time')) return 'datetime-local';
  if (n.includes('date')) return 'date';
  if (n.includes('time')) return 'time';
  if (n.includes('number') || n.includes('currency') || n.includes('decimal')) return 'number';
  return 'text';
}

/** Normalizes a column reference (id/label, any casing/spacing) to a real column id. */
export function resolveColumnId(
  ref: string,
  visibleColumns: ReportBuilderColumn[],
  sampleRow: PreviewRecord | undefined
): string {
  const norm = String(ref ?? '').trim();
  if (!norm) return '';
  const n = norm.toLowerCase().replace(/[\s_-]+/g, '');
  const col = visibleColumns.find(c =>
    c.id.toLowerCase().replace(/[\s_-]+/g, '') === n ||
    c.label.toLowerCase().replace(/[\s_-]+/g, '') === n
  );
  if (col) return col.id;
  if (!sampleRow) return norm;
  return Object.keys(sampleRow.fields).find(k => k.toLowerCase().replace(/[\s_-]+/g, '') === n) ?? norm;
}

/** Filters rows by inline-column terms, search-panel rules, and a global inline query. */
export function filterRows(
  rows: PreviewRecord[],
  terms: Record<string, string>,
  panelRules: SearchRow[],
  inlineQuery: string
): PreviewRecord[] {
  const query = inlineQuery.trim().toLowerCase();
  return rows.filter(row =>
    Object.entries(terms).every(([colId, term]) => {
      if (!term) return true;
      return String(row.fields[colId] ?? '').toLowerCase().includes(term.toLowerCase());
    }) &&
    panelRules.every(rule => matchesOperator(String(row.fields[rule.columnId] ?? ''), rule.value, rule.operator)) &&
    (!query || Object.values(row.fields).some(v => String(v ?? '').toLowerCase().includes(query)))
  );
}

/** Stable multi-key sort of preview rows by the given criteria. */
export function sortRows(rows: PreviewRecord[], sorts: ReportSortCriterion[]): PreviewRecord[] {
  if (!sorts.length) return rows;
  return rows.sort((a, b) => {
    for (const sort of sorts) {
      const av = String(a.fields[sort.columnId] ?? '').toLowerCase();
      const bv = String(b.fields[sort.columnId] ?? '').toLowerCase();
      if (av < bv) return sort.direction === 'asc' ? -1 : 1;
      if (av > bv) return sort.direction === 'asc' ?  1 : -1;
    }
    return 0;
  });
}

/** Buckets rows into labelled groups for the given group config (already resolved). */
export function buildGroupedRows(
  rows: PreviewRecord[],
  resolvedColumnId: string,
  direction: 'asc' | 'desc',
  unspecifiedLabel: string
): Array<{ label: string; rows: PreviewRecord[] }> {
  const map = new Map<string, PreviewRecord[]>();
  rows.forEach(row => {
    const key = String(row.fields[resolvedColumnId] ?? unspecifiedLabel);
    const bucket = map.get(key) ?? [];
    bucket.push(row);
    map.set(key, bucket);
  });
  return [...map.keys()]
    .sort((a, b) => direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a))
    .map(label => ({ label, rows: map.get(label) ?? [] }));
}

/** Builds the initial set of search-panel rows from a report's saved filters/columns. */
export function seedSearchRows(
  filterRules: Array<{ id: string; columnId: string; operator?: string; value?: unknown }>,
  columnsById: Map<string, ReportBuilderColumn>,
  displayColumns: ReportBuilderColumn[],
  focusColumnId?: string
): SearchRow[] {
  const fieldType = (col: ReportBuilderColumn) => [col.fieldType, col.format].filter(Boolean).join(' ');

  const seeded: SearchRow[] = filterRules
    .map(rule => {
      const col = columnsById.get(rule.columnId);
      if (!col) return null;
      return {
        id: rule.id, columnId: rule.columnId, label: col.label, fieldType: fieldType(col),
        operator: (rule.operator || 'contains').toLowerCase(),
        value: typeof rule.value === 'string' ? rule.value : '',
        enabled: true,
      };
    })
    .filter((x): x is SearchRow => !!x);

  if (seeded.length) return seeded;

  if (focusColumnId) {
    const col = columnsById.get(focusColumnId);
    if (col) seeded.push({
      id: `search-${focusColumnId}`, columnId: focusColumnId, label: col.label,
      fieldType: fieldType(col), operator: 'contains', value: '', enabled: true,
    });
    return seeded;
  }

  displayColumns.forEach((col, i) => seeded.push({
    id: `search-${col.id}-${i}`, columnId: col.id, label: col.label,
    fieldType: fieldType(col), operator: 'contains', value: '', enabled: i === 0,
  }));
  return seeded;
}

/** Picks the enabled actions from a named action group, mapping labels via `labelToAction`. */
export function buildActionsFromGroup(
  groups: ActionGroup[],
  groupTitle: string,
  labelToAction: (label: string) => PreviewAction | null
): PreviewAction[] | null {
  const group = groups.find(g => g.title.toLowerCase() === groupTitle);
  if (!group) return null;
  return group.items
    .filter(i => i.enabled)
    .map(i => labelToAction(i.label.trim().toLowerCase()))
    .filter((a): a is PreviewAction => a !== null);
}
