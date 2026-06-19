import { inject, Injectable, signal } from '@angular/core';
import { SelectOption } from '@qo/ui-components';
import { ReportBuilderI18nService } from './report-builder-i18n.service';
import { SearchRow, getSearchInputType } from './report-preview-data.helpers';

/**
 * Component-scoped service owning the report preview's search state: the
 * column-search panel rules and the inline (global) search query. Holds no row
 * data — the data service reads these signals to filter rows and seeds the
 * panel rows via {@link setRows}, so this service never depends on it.
 */
@Injectable()
export class ReportPreviewSearchService {
  private readonly i18n = inject(ReportBuilderI18nService);

  // ── State ──────────────────────────────────────────────────────────────────
  readonly searchTerms      = signal<Record<string, string>>({});
  readonly searchRows       = signal<SearchRow[]>([]);
  readonly searchPanelOpen  = signal(false);
  readonly inlineSearchOpen  = signal(false);
  readonly inlineSearchQuery = signal('');

  readonly searchOperatorOptions: SelectOption[] = [
    { value: 'is',               label: this.i18n.t('operators.is') },
    { value: 'is_not',           label: this.i18n.t('operators.isNot') },
    { value: 'contains',         label: this.i18n.t('operators.contains') },
    { value: 'does_not_contain', label: this.i18n.t('operators.doesNotContain') },
    { value: 'starts_with',      label: this.i18n.t('operators.startsWith') },
    { value: 'ends_with',        label: this.i18n.t('operators.endsWith') },
    { value: 'is_empty',         label: this.i18n.t('operators.isEmpty') },
    { value: 'is_not_empty',     label: this.i18n.t('operators.isNotEmpty') },
  ];

  // ── Inline search ──────────────────────────────────────────────────────────
  toggleInlineSearch(): void {
    if (this.inlineSearchOpen()) { this.inlineSearchQuery.set(''); this.inlineSearchOpen.set(false); }
    else                          { this.inlineSearchOpen.set(true); }
  }

  clearInlineSearch(): void { this.inlineSearchQuery.set(''); this.inlineSearchOpen.set(false); }

  // ── Search panel ───────────────────────────────────────────────────────────
  /** Opens the panel with the given pre-seeded rows (seeding owned by the data service). */
  setRows(rows: SearchRow[]): void {
    this.searchRows.set(rows);
    this.searchPanelOpen.set(true);
  }

  closeSearchPanel(): void { this.searchPanelOpen.set(false); }

  toggleSearchRow(id: string, checked: boolean): void {
    this.searchRows.update(rows => rows.map(r => r.id === id ? { ...r, enabled: checked } : r));
  }

  updateSearchOperator(id: string, op: string): void {
    this.searchRows.update(rows => rows.map(r => r.id === id ? { ...r, operator: op } : r));
  }

  updateSearchValue(id: string, value: string): void {
    this.searchRows.update(rows => rows.map(r => r.id === id ? { ...r, value } : r));
  }

  applySearchPanel(): void {
    const terms: Record<string, string> = {};
    this.searchRows().forEach(r => { if (r.enabled && r.value?.trim()) terms[r.columnId] = r.value.trim(); });
    this.searchTerms.set(terms);
    this.searchPanelOpen.set(false);
  }

  getSearchInputType(fieldType: string): string {
    return getSearchInputType(fieldType);
  }

  getSearchInputPlaceholder(fieldType: string): string {
    const t = getSearchInputType(fieldType);
    if (t === 'date') return this.i18n.t('filters.datePlaceholder');
    if (t === 'time') return this.i18n.t('filters.timePlaceholder');
    if (t === 'datetime-local') return this.i18n.t('filters.datetimePlaceholder');
    return this.i18n.t('filters.value');
  }
}
