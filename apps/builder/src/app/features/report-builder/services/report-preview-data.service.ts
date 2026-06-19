import { inject, Injectable, computed, effect, signal } from '@angular/core';
import { ReportBuilderAsset, ReportBuilderColumn } from '@builder/features/report-builder/facades/report-builder.facade';
import { ReportBuilderI18nService } from './report-builder-i18n.service';
import { ReportColumnMenuService } from './report-column-menu.service';
import { ReportPreviewSearchService } from './report-preview-search.service';
import { ReportPreviewSortGroupService } from './report-preview-sort-group.service';
import { PreviewRecord } from '../models/report-builder.models';
import { QoConfirmDialogService } from '@qo/ui-components';
import {
  PreviewAction,
  buildActionsFromGroup,
  buildGroupedRows,
  filterRows,
  resolveColumnId,
  seedSearchRows,
  sortRows,
} from './report-preview-data.helpers';

/**
 * Component-scoped coordinator for the report preview's row data and read pipeline
 * (filter → sort → page → group). Sort/group config and search state live in the
 * two sub-services this feeds and re-exposes. List all three in the host `providers`.
 */
@Injectable()
export class ReportPreviewDataService {
  private readonly i18n           = inject(ReportBuilderI18nService);
  private readonly confirmDialog  = inject(QoConfirmDialogService);
  private readonly colMenuService = inject(ReportColumnMenuService);
  private readonly search         = inject(ReportPreviewSearchService);
  private readonly sortGroup      = inject(ReportPreviewSortGroupService);

  readonly report         = signal<ReportBuilderAsset | null>(null);
  readonly visibleColumns = signal<ReportBuilderColumn[]>([]);
  readonly records        = signal<PreviewRecord[]>([]);
  readonly pageSize       = signal<number>(20);
  readonly viewport       = signal<'desktop' | 'tablet' | 'mobile'>('desktop');

  readonly previewRows      = signal<PreviewRecord[]>([]);
  readonly previewSelection = signal<number[]>([]);
  readonly currentPage      = signal(1);
  readonly collapsedGroups  = signal<Set<string>>(new Set());
  readonly rowHeight        = signal<'compact' | 'comfortable' | 'expanded'>('comfortable');
  readonly editModalOpen    = signal(false);
  readonly editModalRowId   = signal<number | null>(null);
  readonly editModalValues  = signal<Record<string, string>>({});

  readonly searchRows            = this.search.searchRows;
  readonly searchPanelOpen       = this.search.searchPanelOpen;
  readonly inlineSearchOpen      = this.search.inlineSearchOpen;
  readonly inlineSearchQuery     = this.search.inlineSearchQuery;
  readonly searchOperatorOptions = this.search.searchOperatorOptions;
  readonly closeSearchPanel      = (): void => this.search.closeSearchPanel();
  readonly toggleSearchRow       = (id: string, checked: boolean): void => this.search.toggleSearchRow(id, checked);
  readonly updateSearchOperator  = (id: string, op: string): void => this.search.updateSearchOperator(id, op);
  readonly updateSearchValue     = (id: string, value: string): void => this.search.updateSearchValue(id, value);
  readonly applySearchPanel      = (): void => this.search.applySearchPanel();
  readonly toggleInlineSearch    = (): void => this.search.toggleInlineSearch();
  readonly clearInlineSearch     = (): void => this.search.clearInlineSearch();

  readonly effectiveSortCriteria      = this.sortGroup.effectiveSortCriteria;
  readonly effectiveGroupConfig       = this.sortGroup.effectiveGroupConfig;
  readonly activeSortDescriptors      = this.sortGroup.activeSortDescriptors;
  readonly activeGroupColumnLabel     = this.sortGroup.activeGroupColumnLabel;
  readonly activeGroupDirectionSymbol = this.sortGroup.activeGroupDirectionSymbol;
  readonly applySort        = (columnId: string, direction: 'asc' | 'desc'): void => this.sortGroup.applySort(columnId, direction);
  readonly applyGroup       = (columnId: string, direction: 'asc' | 'desc'): void => this.sortGroup.applyGroup(columnId, direction);
  readonly clearSorting     = (): void => this.sortGroup.clearSorting();
  readonly toggleSortingChip  = (): void => this.sortGroup.toggleSortingChip();
  readonly toggleGroupingChip = (): void => this.sortGroup.toggleGroupingChip();

  private readonly rowActionIconMap = { edit: 'edit', duplicate: 'content_copy', delete: 'delete' };
  private readonly defaultActions: PreviewAction[] = [
    { key: 'edit',      label: this.i18n.common('edit'),      icon: this.rowActionIconMap.edit      },
    { key: 'duplicate', label: this.i18n.common('duplicate'), icon: this.rowActionIconMap.duplicate },
    { key: 'delete',    label: this.i18n.common('delete'),    icon: this.rowActionIconMap.delete    },
  ];

  constructor() {
    // Feed the sort/group sub-service its inputs (keeps the dependency graph acyclic).
    effect(() => { this.sortGroup.report.set(this.report()); this.sortGroup.visibleColumns.set(this.visibleColumns()); });
    effect(() => {
      const total = this.totalPages();
      const page  = this.currentPage();
      if (page > total) this.currentPage.set(total);
      else if (page < 1) this.currentPage.set(1);
    });
  }

  readonly displayColumns = computed(() => this.colMenuService.displayColumns());

  readonly effectiveViewType = computed<'List View' | 'Card View'>(() => {
    const vp = this.viewport();
    if (vp === 'tablet' || vp === 'mobile') return 'Card View';
    return (this.report()?.viewType ?? 'List View') as 'List View' | 'Card View';
  });

  readonly resolvedPageSize = computed(() => {
    const p = Number(this.pageSize());
    return Number.isFinite(p) && p > 0 ? Math.floor(p) : 20;
  });

  readonly enabledRowActions = computed<PreviewAction[]>(() => {
    const groups = this.report()?.settings?.quickActionGroups ?? [];
    return buildActionsFromGroup(groups, 'single record', this.labelToAction)
      ?? buildActionsFromGroup(groups, 'right-click record', this.labelToAction)
      ?? this.defaultActions;
  });

  readonly enabledRightClickActions = computed<PreviewAction[]>(() => {
    const groups = this.report()?.settings?.quickActionGroups ?? [];
    return buildActionsFromGroup(groups, 'right-click record', this.labelToAction) ?? this.enabledRowActions();
  });

  readonly enabledMultipleSelectionActions = computed<PreviewAction[]>(() => {
    const groups = this.report()?.settings?.quickActionGroups ?? [];
    return buildActionsFromGroup(groups, 'multiple selection', this.labelToAction) ?? this.defaultActions;
  });

  readonly enabledDetailPanelActions = computed<PreviewAction[]>(() => {
    const groups = this.report()?.settings?.detailActionGroups ?? [];
    return buildActionsFromGroup(groups, 'detail view actions', this.labelToAction) ?? this.defaultActions;
  });

  readonly detailCanEdit      = computed(() => this.enabledDetailPanelActions().some(a => a.key === 'edit'));
  readonly detailCanDuplicate = computed(() => this.enabledDetailPanelActions().some(a => a.key === 'duplicate'));
  readonly detailCanDelete    = computed(() => this.enabledDetailPanelActions().some(a => a.key === 'delete'));

  readonly filteredRows = computed(() => {
    const panelRules = this.search.searchRows().filter(r =>
      r.enabled && (r.operator === 'is_empty' || r.operator === 'is_not_empty' || !!r.value?.trim())
    );
    return filterRows(this.previewRows(), this.search.searchTerms(), panelRules, this.search.inlineSearchQuery());
  });

  readonly sortedRows = computed(() => sortRows([...this.filteredRows()], this.sortGroup.effectiveSortCriteria()));

  readonly pagedRows = computed(() => {
    const rows  = this.sortedRows();
    const size  = this.resolvedPageSize();
    const start = (Math.min(this.currentPage(), this.totalPages()) - 1) * size;
    return rows.slice(start, start + size);
  });

  readonly groupedRows = computed(() => {
    const group = this.sortGroup.effectiveGroupConfig();
    const rows  = this.pagedRows();
    if (!group) return [{ label: '', rows }];
    const resolvedId = this.resolveColumnId(group.columnId);
    if (!resolvedId) return [{ label: '', rows }];
    return buildGroupedRows(rows, resolvedId, group.direction, this.i18n.t('filters.unspecified'));
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.sortedRows().length / this.resolvedPageSize())));
  readonly rangeStart = computed(() => !this.sortedRows().length ? 0 : (Math.min(this.currentPage(), this.totalPages()) - 1) * this.resolvedPageSize() + 1);
  readonly rangeEnd   = computed(() => Math.min(this.rangeStart() + this.pagedRows().length - 1, this.sortedRows().length));

  readonly editModalFields = computed(() => {
    const rowId = this.editModalRowId();
    if (rowId === null) return [];
    const row = this.previewRows().find(r => r.id === rowId);
    if (!row) return [];
    return this.displayColumns().map(col => ({
      id:    col.id,
      label: col.label,
      value: String(this.editModalValues()[col.id] ?? row.fields[col.id] ?? ''),
    }));
  });

  goToNextPage(): void     { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }
  goToPreviousPage(): void { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }

  isRowSelected(id: number): boolean { return this.previewSelection().includes(id); }

  toggleRow(id: number): void {
    this.previewSelection.update(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);
  }

  clearSelection(): void { this.previewSelection.set([]); }

  areAllVisibleRowsSelected(): boolean {
    const ids = this.groupedRows().flatMap(g => g.rows.map(r => r.id));
    return ids.length > 0 && ids.every(id => this.previewSelection().includes(id));
  }

  toggleSelectAll(checked: boolean): void {
    const ids = this.groupedRows().flatMap(g => g.rows.map(r => r.id));
    if (checked) { this.previewSelection.update(sel => [...new Set([...sel, ...ids])]); return; }
    const remove = new Set(ids);
    this.previewSelection.update(sel => sel.filter(id => !remove.has(id)));
  }

  initRows(records: PreviewRecord[]): void {
    this.previewRows.set(records.map(r => ({ ...r, fields: { ...r.fields } })));
    this.previewSelection.set([]);
    this.currentPage.set(1);
  }

  deleteRowsById(ids: number[], closeDetail: () => void, closeEdit: () => void): void {
    const idSet = new Set(ids);
    this.previewRows.update(rows => rows.filter(r => !idSet.has(r.id)));
    if (this.editModalRowId() !== null && idSet.has(this.editModalRowId()!)) closeEdit();
    this.previewSelection.set([]);
  }

  duplicateRows(sel: number[]): void {
    const source = this.previewRows().filter(r => sel.includes(r.id));
    if (!source.length) return;
    let nextId = (this.previewRows().reduce((m, r) => Math.max(m, r.id), 0)) + 1;
    const clones = source.map(r => ({ ...r, id: nextId++, fields: { ...r.fields } }));
    this.previewRows.update(rows => [...rows, ...clones]);
    this.previewSelection.set(clones.map(r => r.id));
  }

  async deleteSelected(): Promise<void> {
    const sel = this.previewSelection();
    if (!sel.length) return;
    const ok = await this.confirmDialog.confirm(
      this.i18n.t('confirmations.deleteSelectedRecordsTitle'),
      this.i18n.t('confirmations.deleteSelectedRecordsMessage', { count: sel.length })
    );
    if (ok) this.deleteRowsById(sel, () => {}, () => this.closeEditModal());
  }

  openEditModal(rowId: number): void {
    const row = this.previewRows().find(r => r.id === rowId);
    if (!row) return;
    const vals: Record<string, string> = {};
    this.displayColumns().forEach(col => { vals[col.id] = String(row.fields[col.id] ?? ''); });
    this.editModalRowId.set(rowId);
    this.editModalValues.set(vals);
    this.editModalOpen.set(true);
  }

  closeEditModal(): void {
    this.editModalOpen.set(false);
    this.editModalRowId.set(null);
    this.editModalValues.set({});
  }

  updateEditValue(fieldId: string, value: string): void {
    this.editModalValues.update(v => ({ ...v, [fieldId]: value }));
  }

  saveEditModal(): void {
    const rowId = this.editModalRowId();
    if (rowId === null) return;
    const updates = this.editModalValues();
    this.previewRows.update(rows => rows.map(r => r.id === rowId ? { ...r, fields: { ...r.fields, ...updates } } : r));
    this.closeEditModal();
  }

  clearGrouping(): void {
    this.sortGroup.clearGrouping();
    this.collapsedGroups.set(new Set());
  }

  toggleGroup(label: string): void {
    this.collapsedGroups.update(s => { const n = new Set(s); n.has(label) ? n.delete(label) : n.add(label); return n; });
  }
  isGroupCollapsed(label: string): boolean { return this.collapsedGroups().has(label); }
  collapseAllGroups(): void { this.collapsedGroups.set(new Set(this.groupedRows().map(g => g.label).filter(Boolean))); }
  expandAllGroups(): void   { this.collapsedGroups.set(new Set()); }

  openSearchPanel(focusColumnId?: string): void {
    const colMap = new Map(this.report()?.columns.map(c => [c.id, c]) ?? []);
    const seeded = seedSearchRows(this.report()?.filterRules ?? [], colMap, this.displayColumns(), focusColumnId);
    this.search.setRows(seeded);
  }

  cardPrimaryColumn(): ReportBuilderColumn | null   { return this.visibleColumns()[0] ?? null; }
  cardSecondaryColumn(): ReportBuilderColumn | null { return this.visibleColumns()[1] ?? this.visibleColumns()[0] ?? null; }

  getCardFieldValue(row: PreviewRecord, col: ReportBuilderColumn | null): string {
    return col ? String(row.fields[col.id] ?? '-') : '-';
  }

  getCustomSlotValue(row: PreviewRecord, slot: string): string {
    const colId = this.report()?.settings.quickViewCustomLayout.slots[slot];
    return colId ? String(row.fields[colId] ?? '') : '';
  }

  getCustomSlotLabel(slot: string): string {
    const colId = this.report()?.settings.quickViewCustomLayout.slots[slot];
    if (!colId) return slot.replace('_', ' ').toUpperCase();
    return (this.report()?.columns.find(c => c.id === colId)?.label ?? slot).toUpperCase();
  }

  resolveColumnId(ref: string): string {
    return resolveColumnId(ref, this.visibleColumns(), this.previewRows()[0]);
  }

  /** Resolves a single action label to a typed, localized action. Bound for passing to helpers. */
  private readonly labelToAction = (label: string): PreviewAction | null => {
    if (label === 'edit')      return { key: 'edit',      label: this.i18n.common('edit'),      icon: this.rowActionIconMap.edit };
    if (label === 'duplicate') return { key: 'duplicate', label: this.i18n.common('duplicate'), icon: this.rowActionIconMap.duplicate };
    if (label === 'delete')    return { key: 'delete',    label: this.i18n.common('delete'),    icon: this.rowActionIconMap.delete };
    return null;
  };
}
