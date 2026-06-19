import { ReportBuilderI18nService } from './report-builder-i18n.service';

import { inject, Injectable, computed, signal } from '@angular/core';
import { ReportBuilderAsset, ReportBuilderColumn } from '@builder/features/report-builder/facades/report-builder.facade';
import { ReportExportService } from './report-export.service';
import { ReportPreviewStyleService } from './report-preview-style.service';
import {
  CanvasItemFieldStyle,
  PreviewRecord,
  ReportDetailCanvasItem,
  ReportDetailTab,
} from '../models/report-builder.models';
import { QoConfirmDialogService } from '@qo/ui-components';

/**
 * Component-scoped service. Must be listed in the host component's `providers` array.
 * Call `connect()` once in the host constructor to wire input signals.
 */
@Injectable()
export class ReportPreviewDetailService {
  private readonly i18n = inject(ReportBuilderI18nService);

  private readonly confirmDialog   = inject(QoConfirmDialogService);
  private readonly exportService   = inject(ReportExportService);
  private readonly styleService    = inject(ReportPreviewStyleService);

  // ── Mirrored input signals (set by host component via effect) ──────────────
  readonly report          = signal<ReportBuilderAsset | null>(null);
  readonly visibleColumns  = signal<ReportBuilderColumn[]>([]);
  readonly detailBlocks    = signal<Array<{ id: string; title: string; fieldIds: string[]; sourceFormId: string }>>([]);
  readonly detailTabsInput = signal<ReportDetailTab[]>([]);
  readonly displayColumns  = signal<ReportBuilderColumn[]>([]);
  readonly previewRows     = signal<PreviewRecord[]>([]);

  // ── Owned UI state ─────────────────────────────────────────────────────────
  readonly detailPanelOpen    = signal(false);
  readonly detailPanelWidth   = signal(460);
  readonly activeDetailRowId  = signal<number | null>(null);
  readonly activeDetailTabId  = signal<string | null>(null);
  readonly detailMoreMenuOpen = signal(false);
  readonly customDetailTabState = signal<Record<string, number>>({});

  private readonly MIN_WIDTH = 280;
  private readonly MAX_WIDTH = 900;

  // ── Computed ───────────────────────────────────────────────────────────────
  /**
   * Computes detail layout mode from the current report state.
   */
  readonly detailLayoutMode = computed<'all-fields' | 'block-view' | 'tab-view'>(() => {
    const mode = this.report()?.settings?.detailLayoutMode;
    if (mode === 'all_fields'    || mode === 'all-fields')  return 'all-fields';
    if (mode === 'block_layout'  || mode === 'block-view')  return 'block-view';
    if (mode === 'custom_layout' || mode === 'tab-view')    return 'tab-view';
    return 'all-fields';
  });

  /**
   * Computes active detail row from the current report state.
   */
  readonly activeDetailRow = computed<PreviewRecord | null>(() => {
    const id = this.activeDetailRowId();
    return id === null ? null : (this.previewRows().find(r => r.id === id) ?? null);
  });

  /**
   * Computes all fields resolved from the current report state.
   */
  readonly allFieldsResolved = computed(() => {
    const layout = this.report()?.settings.allFieldsLayout;
    return layout?.fieldIds?.length ? layout.fieldIds : this.visibleColumns().map(c => c.id);
  });

  /**
   * Computes block layout resolved from the current report state.
   */
  readonly blockLayoutResolved = computed(() => {
    const layout = this.report()?.settings.blockLayout;
    return layout?.length ? layout : this.detailBlocks();
  });

  /**
   * Computes tab layout resolved from the current report state.
   */
  readonly tabLayoutResolved = computed(() => {
    const detailTabs = this.detailTabsInput();
    if (detailTabs.length) {
      return detailTabs.map(tab => ({
        id: tab.id,
        title: tab.title,
        sourceFormId: tab.blocks[0]?.sourceFormId ?? this.report()?.sourceFormId ?? '',
        fieldIds: [...(tab.blocks[0]?.fieldIds ?? [])],
        blocks: tab.blocks,
      }));
    }
    const layout = this.report()?.settings.tabLayout;
    if (layout?.length) return layout;
    return [{ id: 'overview', title: this.i18n.t('detailLayout.overview'), sourceFormId: this.report()?.sourceFormId ?? '', fieldIds: this.allFieldsResolved() }];
  });

  /**
   * Computes detail tabs from the current report state.
   */
  readonly detailTabs = computed(() => {
    const tabs = this.detailTabsInput();
    if (tabs.length) return tabs;
    const blocks = this.detailBlocks();
    if (blocks.length) {
      return [{ id: 'overview', title: this.i18n.t('detailLayout.overview'), blocks: blocks.map(b => ({
        id: b.id,
        title: b.title || this.toTitleCase(b.sourceFormId || 'details'),
        sourceFormId: b.sourceFormId,
        fieldIds: b.fieldIds,
      })) }];
    }
    const r = this.report();
    return [{ id: 'overview', title: this.i18n.t('detailLayout.overview'), blocks: [{ id: 'default-main',
      title: r?.sourceFormLabel || this.i18n.t('detailLayout.mainRecord'),
      sourceFormId: r?.sourceFormId ?? '',
      fieldIds: this.visibleColumns().map(c => c.id),
    }] }];
  });

  /**
   * Computes active detail tab from the current report state.
   */
  readonly activeDetailTab = computed(() => {
    const tabs = this.detailTabs();
    const id   = this.activeDetailTabId();
    return tabs.find(t => t.id === id) ?? tabs[0] ?? null;
  });

  /**
   * Computes active simple tab from the current report state.
   */
  readonly activeSimpleTab = computed(() => {
    const tabs = this.tabLayoutResolved();
    const id   = this.activeDetailTabId();
    return tabs.find(t => t.id === id) ?? tabs[0] ?? null;
  });

  // Named blocks only. The first block holds the tab-level direct fields and is
  // rendered separately by `activeSimpleTabFields`, so it is skipped here to avoid
  // duplicating those fields both as plain rows and inside a block.
  /**
   * Computes active tab blocks from the current report state.
   */
  readonly activeTabBlocks = computed(() => {
    const row = this.activeDetailRow();
    const tab = this.activeSimpleTab();
    if (!row || !tab) return [];
    const blocks = tab.blocks ?? [];
    const directFieldIds = tab.fieldIds ?? [];
    const firstBlockFieldIds = blocks[0]?.fieldIds ?? [];
    const firstBlockIsDirectFields =
      directFieldIds.length > 0 &&
      directFieldIds.length === firstBlockFieldIds.length &&
      directFieldIds.every((fieldId, index) => fieldId === firstBlockFieldIds[index]);
    const namedBlocks = firstBlockIsDirectFields ? blocks.slice(1) : blocks;
    return namedBlocks.map(block => ({
      id: block.id,
      title: block.title || this.i18n.t('detailLayout.details'),
      columns: (block.columns ?? [block.fieldIds]).map(col => col.map(fieldId => ({
        fieldId,
        label: this.getColumnLabel(fieldId),
        value: this.getDetailFieldValue(row, fieldId, block.sourceFormId || tab.sourceFormId),
      }))),
      fields: block.fieldIds.map(fieldId => ({
        fieldId,
        label: this.getColumnLabel(fieldId),
        value: this.getDetailFieldValue(row, fieldId, block.sourceFormId || tab.sourceFormId),
      })),
    }));
  });

  /**
   * Computes active tab fields from the current report state.
   */
  readonly activeTabFields = computed(() => {
    const row = this.activeDetailRow();
    const tab = this.activeDetailTab();
    if (!row || !tab) return [];
    return tab.blocks.flatMap(block =>
      block.fieldIds.map(fieldId => {
        const prefixed = `${block.sourceFormId}__${fieldId}`;
        const col = this.visibleColumns().find(c => c.id === fieldId) ?? this.visibleColumns().find(c => c.id === prefixed);
        return {
          fieldId: `${block.id}::${fieldId}`,
          label:   col?.label || this.toTitleCase(fieldId),
          value:   row.fields[fieldId] ?? row.fields[prefixed] ?? '',
          blockTitle: block.title || this.i18n.t('detailLayout.details'),
        };
      })
    );
  });

  /**
   * Computes active all fields from the current report state.
   */
  readonly activeAllFields = computed(() => {
    const row = this.activeDetailRow();
    if (!row) return [];
    return this.allFieldsResolved().map(fieldId => ({
      fieldId,
      label: this.getColumnLabel(fieldId),
      value: this.getDetailFieldValue(row, fieldId),
    }));
  });

  // Tab-level direct fields, sourced from the tab's first (default) block only.
  // Named blocks are rendered separately by `activeTabBlocks`.
  /**
   * Computes active simple tab fields from the current report state.
   */
  readonly activeSimpleTabFields = computed(() => {
    const row = this.activeDetailRow();
    const tab = this.activeSimpleTab();
    if (!row || !tab) return [];
    const firstBlock = tab.blocks?.[0];
    const fieldIds = tab.fieldIds?.length ? tab.fieldIds : firstBlock?.fieldIds ?? [];
    if (!fieldIds.length) return [];
    const sourceFormId = tab.sourceFormId || firstBlock?.sourceFormId || (this.report()?.sourceFormId ?? '');
    return fieldIds.map(fieldId => {
      const prefixed = `${sourceFormId}__${fieldId}`;
      const col = this.visibleColumns().find(c => c.id === fieldId) ?? this.visibleColumns().find(c => c.id === prefixed);
      return { fieldId, label: col?.label || this.toTitleCase(fieldId), value: this.getDetailFieldValue(row, fieldId, sourceFormId) };
    });
  });

  /**
   * Computes active custom detail layout from the current report state.
   */
  readonly activeCustomDetailLayout = computed(() => {
    if (this.detailLayoutMode() !== 'tab-view') return null;
    const id      = this.report()?.settings.activeDetailCustomLayoutId ?? null;
    const layouts = this.report()?.settings.detailCustomLayouts ?? [];
    return layouts.find(l => l.id === id) ?? null;
  });

  /**
   * Computes has custom detail canvas from the current report state.
   */
  readonly hasCustomDetailCanvas = computed(() => !!this.activeCustomDetailLayout()?.canvasItems?.length);

  /**
   * Computes active custom layout fields from the current report state.
   */
  readonly activeCustomLayoutFields = computed(() => {
    if (this.detailLayoutMode() !== 'tab-view') return [];
    const row    = this.activeDetailRow();
    const layout = this.activeCustomDetailLayout();
    if (!row || !layout) return [];
    return layout.fieldIds.map(fieldId => ({
      fieldId,
      label: this.getColumnLabel(fieldId),
      value: row.fields[fieldId] ?? '-',
    }));
  });

  /**
   * Computes is custom detail layout from the current report state.
   */
  readonly isCustomDetailLayout = computed(() =>
    this.detailLayoutMode() === 'tab-view' && this.activeCustomLayoutFields().length > 0
  );

  // ── Custom canvas methods ──────────────────────────────────────────────────
  /**
   * Coordinates get custom canvas top level items for the report configuration workflow.
   */
  getCustomCanvasTopLevelItems(): ReportDetailCanvasItem[] {
    const items = this.activeCustomDetailLayout()?.canvasItems;
    if (!items?.length) return [];
    return items.filter(i => !i.parentTabItemId).sort((a, b) => a.y !== b.y ? a.y - b.y : a.x - b.x);
  }

  /**
   * Coordinates get custom canvas tab children for the report configuration workflow.
   */
  getCustomCanvasTabChildren(tabItemId: string, tabKey: string): ReportDetailCanvasItem[] {
    const items = this.activeCustomDetailLayout()?.canvasItems;
    if (!items?.length) return [];
    return items.filter(i => i.parentTabItemId === tabItemId && i.parentTabKey === tabKey);
  }

  /**
   * Coordinates get custom canvas tab style for the report configuration workflow.
   */
  getCustomCanvasTabStyle(item: ReportDetailCanvasItem): Record<string, string | number> {
    return this.styleService.resolveCanvasTabStyle(item);
  }

  /**
   * Coordinates get custom canvas child field style for the report configuration workflow.
   */
  getCustomCanvasChildFieldStyle(item: ReportDetailCanvasItem): Record<string, string | number> {
    return this.styleService.resolveCanvasChildFieldStyle(item);
  }

  /**
   * Coordinates get custom canvas item style for the report configuration workflow.
   */
  getCustomCanvasItemStyle(item: ReportDetailCanvasItem): Record<string, string | number> {
    return this.styleService.resolveCanvasItemStyle(item);
  }

  /**
   * Coordinates get custom canvas field value for the report configuration workflow.
   */
  getCustomCanvasFieldValue(fieldId: string): string {
    const row = this.activeDetailRow();
    return row ? String(row.fields[fieldId] ?? '-') : '-';
  }

  /**
   * Coordinates get custom canvas active tab index for the report configuration workflow.
   */
  getCustomCanvasActiveTabIndex(tabItemId: string, maxTabs = 1): number {
    const idx = this.customDetailTabState()[tabItemId] ?? 0;
    return Math.max(0, Math.min(idx, Math.max(0, maxTabs - 1)));
  }

  /**
   * Coordinates is custom canvas tab active for the report configuration workflow.
   */
  isCustomCanvasTabActive(tabItemId: string, index: number): boolean {
    const layout = this.activeCustomDetailLayout();
    const tab    = layout?.canvasItems?.find(i => i.id === tabItemId && i.type === 'tab');
    return this.getCustomCanvasActiveTabIndex(tabItemId, tab?.tabLabels?.length ?? 1) === index;
  }

  /**
   * Coordinates switch custom canvas tab for the report configuration workflow.
   */
  switchCustomCanvasTab(tabItemId: string, index: number): void {
    this.customDetailTabState.update(state => ({ ...state, [tabItemId]: Math.max(0, index) }));
  }

  /**
   * Coordinates is custom canvas item visible for the report configuration workflow.
   */
  isCustomCanvasItemVisible(item: ReportDetailCanvasItem, allItems: ReportDetailCanvasItem[]): boolean {
    if (!item.parentTabItemId || !item.parentTabKey) return true;
    const parent = allItems.find(c => c.id === item.parentTabItemId && c.type === 'tab');
    if (!parent) return true;
    const labels      = parent.tabLabels?.length ? parent.tabLabels : [this.i18n.t('detailLayout.unnamedTab')];
    const activeIndex = this.getCustomCanvasActiveTabIndex(parent.id, labels.length);
    return (labels[activeIndex] ?? labels[0]) === item.parentTabKey;
  }

  // ── Style delegators ───────────────────────────────────────────────────────
  /**
   * Coordinates get custom detail field style for the report configuration workflow.
   */
  getCustomDetailFieldStyle(fieldId: string): Record<string, string | number> {
    const layouts = this.report()?.settings.detailCustomLayouts ?? [];
    const activeId = this.report()?.settings.activeDetailCustomLayoutId ?? null;
    if (this.detailLayoutMode() !== 'tab-view') return {};
    const style = this.styleService.resolveCustomDetailFieldStyle(fieldId, activeId, layouts);
    if (!style || style.styleMode !== 'styles') return {};
    return this.styleService.buildDetailFieldStyleObject(style);
  }

  // ── Detail panel methods ───────────────────────────────────────────────────
  /**
   * Opens panel for the report configuration workflow.
   */
  openPanel(row: PreviewRecord): void {
    this.activeDetailRowId.set(row.id);
    this.detailPanelOpen.set(true);
    if (this.detailLayoutMode() === 'tab-view') {
      if (this.activeCustomLayoutFields().length === 0) {
        this.activeDetailTabId.set(this.tabLayoutResolved()[0]?.id ?? null);
      } else {
        this.activeDetailTabId.set(null);
        const state: Record<string, number> = {};
        (this.activeCustomDetailLayout()?.canvasItems ?? [])
          .filter(i => i.type === 'tab')
          .forEach(i => { state[i.id] = 0; });
        this.customDetailTabState.set(state);
      }
    } else {
      this.activeDetailTabId.set(this.detailTabs()[0]?.id ?? null);
    }
    this.detailMoreMenuOpen.set(false);
  }

  /**
   * Closes panel for the report configuration workflow.
   */
  closePanel(): void {
    this.detailPanelOpen.set(false);
    this.activeDetailRowId.set(null);
    this.activeDetailTabId.set(null);
    this.detailMoreMenuOpen.set(false);
  }

  /**
   * Coordinates switch tab for the report configuration workflow.
   */
  switchTab(tabId: string): void {
    this.activeDetailTabId.set(tabId);
  }

  /**
   * Toggles more menu for the report configuration workflow.
   */
  toggleMoreMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.detailMoreMenuOpen.set(!this.detailMoreMenuOpen());
  }

  /**
   * Deletes active row for the report configuration workflow.
   */
  async deleteActiveRow(): Promise<void> {
    const rowId = this.activeDetailRowId();
    if (rowId === null) return;
    const confirmed = await this.confirmDialog.confirm(
      this.i18n.t('confirmations.deleteRecordTitle'),
      this.i18n.t('confirmations.deleteRecordMessage')
    );
    if (!confirmed) return;
    this.detailMoreMenuOpen.set(false);
  }

  /**
   * Coordinates print active row for the report configuration workflow.
   */
  printActiveRow(): void {
    const row = this.activeDetailRow();
    if (!row) return;
    this.detailMoreMenuOpen.set(false);
    this.exportService.exportDetailRowPdf(
      this.activeTabFields().map(f => ({ label: f.label, value: f.value })),
      this.report()?.name ?? '',
      row.id
    );
  }

  /**
   * Coordinates is row active for the report configuration workflow.
   */
  isRowActive(rowId: number): boolean {
    return this.detailPanelOpen() && this.activeDetailRowId() === rowId;
  }

  /**
   * Coordinates on resize start for the report configuration workflow.
   */
  onResizeStart(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startW = this.detailPanelWidth();
    const onMove = (e: MouseEvent) => {
      const next = Math.min(this.MAX_WIDTH, Math.max(this.MIN_WIDTH, startW + (startX - e.clientX)));
      this.detailPanelWidth.set(next);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  // ── Field helpers (used by computeds above) ────────────────────────────────
  /**
   * Coordinates get detail field value for the report configuration workflow.
   */
  getDetailFieldValue(row: PreviewRecord, fieldId: string, sourceFormId?: string): string {
    const prefixed = sourceFormId ? `${sourceFormId}__${fieldId}` : '';
    const value    = row.fields[fieldId] ?? (prefixed ? row.fields[prefixed] : undefined);
    return (value === undefined || value === null || value === '') ? '-' : String(value);
  }

  /**
   * Coordinates get column label for the report configuration workflow.
   */
  getColumnLabel(fieldId: string): string {
    return this.visibleColumns().find(c => c.id === fieldId)?.label ?? this.toTitleCase(fieldId);
  }

  /**
   * Coordinates to title case for the report configuration workflow.
   */
  toTitleCase(value: string): string {
    return value.replace(/_/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
  }
}
