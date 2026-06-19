import { inject, ChangeDetectionStrategy, Component, HostBinding, HostListener, computed, effect, input, output, signal } from '@angular/core';
import { ReportBuilderAsset, ReportBuilderColumn } from '@builder/features/report-builder/facades/report-builder.facade';
import { ReportPreviewFacade }    from '@builder/features/report-builder/facades/report-preview.facade';
import { ReportPreviewDataService }      from '@builder/features/report-builder/services/report-preview-data.service';
import { ReportPreviewSearchService }    from '@builder/features/report-builder/services/report-preview-search.service';
import { ReportPreviewSortGroupService } from '@builder/features/report-builder/services/report-preview-sort-group.service';
import { ReportPreviewDetailService }    from '@builder/features/report-builder/services/report-preview-detail.service';
import { ReportColumnMenuService }       from '@builder/features/report-builder/services/report-column-menu.service';
import { ReportRowContextMenuService }   from '@builder/features/report-builder/services/report-row-context-menu.service';
import { PreviewRecord, QuickViewCanvasElement, QuickViewCustomSlot, ReportDetailCanvasItem, ReportDetailTab } from '@builder/features/report-builder/models/report-builder.models';
import { type SearchDrawerEvent } from '../report-search-drawer/report-search-drawer.component';
import { type EditModalEvent } from '../report-edit-modal/report-edit-modal.component';
import { type TableEvent } from '../report-preview-table/report-preview-table.component';
import { ReportSearchDrawerComponent } from '../report-search-drawer/report-search-drawer.component';
import { ReportEditModalComponent } from '../report-edit-modal/report-edit-modal.component';
import { ReportPreviewTableComponent } from '../report-preview-table/report-preview-table.component';
import { QoIconComponent, QoButtonComponent, QoCheckboxComponent, QoInputComponent, QoSelectComponent } from '@qo/ui-components';


import { ReportBuilderI18nService } from '../../services/report-builder-i18n.service';
@Component({
  selector: 'app-report-preview-modal',
  standalone: true,
  providers: [
    ReportPreviewFacade,
    ReportPreviewDataService,
    ReportPreviewSearchService,
    ReportPreviewSortGroupService,
    ReportPreviewDetailService,
    ReportColumnMenuService,
    ReportRowContextMenuService,
  ],
  imports: [QoIconComponent, QoButtonComponent, QoInputComponent,
    ReportSearchDrawerComponent, ReportEditModalComponent, ReportPreviewTableComponent,
  ],
  templateUrl: './report-preview-modal.component.html',
  styleUrl: './report-preview-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportPreviewModalComponent {
  private readonly i18n = inject(ReportBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  protected readonly common = this.i18n.common.bind(this.i18n);
  // ── Single facade injection (Facade pattern) ───────────────────────────────
  readonly facade = inject(ReportPreviewFacade);

  // Service shortcuts for internal use (not injected twice — just aliases)
  /**
   * Coordinates data for the report configuration workflow.
   */
  private get data()   { return this.facade.data; }
  /**
   * Coordinates detail for the report configuration workflow.
   */
  private get detail() { return this.facade.detail; }
  /**
   * Coordinates cols for the report configuration workflow.
   */
  private get cols()   { return this.facade.columns; }
  /**
   * Coordinates row ctx for the report configuration workflow.
   */
  private get rowCtx() { return this.facade.rowMenu; }

  // ── Inputs / Outputs ───────────────────────────────────────────────────────
  report          = input.required<ReportBuilderAsset>();
  visibleColumns  = input.required<ReportBuilderColumn[]>();
  detailBlocks    = input<Array<{ id: string; title: string; fieldIds: string[]; sourceFormId: string }>>([]);
  detailTabsInput = input<ReportDetailTab[]>([], { alias: 'detailTabs' });
  records         = input.required<PreviewRecord[]>();
  pageSize        = input<number>(20);
  asPage          = input<boolean>(false);
  viewport        = input<'desktop' | 'tablet' | 'mobile'>('desktop');
  closed          = output<void>();

  /**
   * Coordinates as page host for the report configuration workflow.
   */
  @HostBinding('class.as-page-host')    get asPageHost()       { return this.asPage(); }
  /**
   * Coordinates is tablet viewport for the report configuration workflow.
   */
  @HostBinding('class.viewport-tablet') get isTabletViewport() { return this.viewport() === 'tablet'; }
  /**
   * Coordinates is mobile viewport for the report configuration workflow.
   */
  @HostBinding('class.viewport-mobile') get isMobileViewport() { return this.viewport() === 'mobile'; }

  // ── UI-only signals ────────────────────────────────────────────────────────
  readonly exportMenuOpen = signal(false);
  readonly exportFormats  = ['XLSX', 'PDF', 'CSV'];

  /**
   * Initializes report preview modal component and wires its reactive state.
   */
  constructor() {
    // Sync component inputs into services (signal-mirroring pattern)
    effect(() => { const r = this.report(); this.data.report.set(r); this.detail.report.set(r); });
    effect(() => { const vc = this.visibleColumns(); this.data.visibleColumns.set(vc); this.detail.visibleColumns.set(vc); });
    effect(() => {
      this.data.records.set(this.records());
      this.data.pageSize.set(this.pageSize());
      this.data.viewport.set(this.viewport());
      this.detail.detailBlocks.set(this.detailBlocks());
      this.detail.detailTabsInput.set(this.detailTabsInput());
    });
    // Keep detail service in sync with derived state
    effect(() => this.detail.displayColumns.set(this.cols.displayColumns()));
    effect(() => this.detail.previewRows.set(this.data.previewRows()));
    // Reset rows on records change
    effect(() => { this.data.initRows(this.records() ?? []); });
  }

  // ── Sub-component view models (computed from service state) ────────────────
  /**
   * Computes table state from the current report state.
   */
  readonly tableState = computed(() => ({
    columns:               this.cols.displayColumns(),
    allColumns:            this.visibleColumns(),
    groupedRows:           this.data.groupedRows(),
    rowHeight:             this.data.rowHeight(),
    collapsedGroups:       this.data.collapsedGroups(),
    selectedRowIds:        this.data.previewSelection(),
    activeDetailRowId:     this.detail.activeDetailRowId(),
    columnMenuId:          this.cols.activeMenuId(),
    rowMenuId:             this.rowCtx.activeRowMenuId(),
    visibilityMenuOpen:    this.cols.visibilityMenuOpen(),
    sortDescriptors:       this.data.activeSortDescriptors(),
    effectiveSortCriteria: this.data.effectiveSortCriteria(),
    groupConfig:           this.data.effectiveGroupConfig(),
    groupColumnLabel:      this.data.activeGroupColumnLabel(),
    groupDirSymbol:        this.data.activeGroupDirectionSymbol(),
    rowActions:            this.data.enabledRowActions(),
    columnStyle:           (col: ReportBuilderColumn) => this.facade.getColumnStyle(col),
    isColumnPinned:        (id: string) => this.cols.isPinned(id),
    isColumnVisible:       (id: string) => this.cols.isVisible(id),
  }));

  /**
   * Computes search drawer state from the current report state.
   */
  readonly searchDrawerState = computed(() => ({
    rows:            this.data.searchRows(),
    operatorOptions: this.data.searchOperatorOptions,
  }));

  /**
   * Computes edit modal state from the current report state.
   */
  readonly editModalState = computed(() => ({
    reportLabel: this.report().sourceFormLabel || this.report().name,
    fields:      this.data.editModalFields(),
  }));

  // ── Card-view computed flags ───────────────────────────────────────────────
  // Resolved top-level view ('List View' | 'Card View'); also forced to cards on
  // tablet/mobile viewports by the data service.
  readonly effectiveViewType = this.data.effectiveViewType;
  // True when the card view should render the user-designed custom layout rather
  // than the built-in two-field card.
  /**
   * Computes is custom card view from the current report state.
   */
  readonly isCustomCardView  = computed(() =>
    this.data.effectiveViewType() === 'Card View' && this.report().settings.quickLayoutMode === 'custom'
  );
  // Custom layout built from a slot template (title/body/meta) rather than the
  // free-form canvas designer.
  /**
   * Computes is template custom card view from the current report state.
   */
  readonly isTemplateCustomCardView = computed(() =>
    this.isCustomCardView() && !!this.report().settings.quickViewCustomLayout.templateMode
  );
  // The "list" template variant (label/value rows) versus the default "block".
  /**
   * Computes is list template custom card view from the current report state.
   */
  readonly isListTemplateCustomCardView = computed(() =>
    this.isTemplateCustomCardView() &&
    (this.report().settings.quickViewCustomLayout.templateVariant ?? 'block') === 'list'
  );
  // Custom layout drawn on the free-form canvas (has positioned elements).
  /**
   * Computes has designed canvas layout from the current report state.
   */
  readonly hasDesignedCanvasLayout = computed(() =>
    this.isCustomCardView() && !this.isTemplateCustomCardView() &&
    !!this.report().settings.quickViewCustomLayout.canvasLayout?.elements?.length
  );

  // ── Signal proxies ─────────────────────────────────────────────────────────
  readonly sortedRows       = this.data.sortedRows;
  readonly displayColumns   = this.cols.displayColumns;
  readonly groupedRows      = this.data.groupedRows;
  readonly rangeStart       = this.data.rangeStart;
  readonly rangeEnd         = this.data.rangeEnd;
  readonly totalPages       = this.data.totalPages;
  readonly currentPage      = this.data.currentPage;
  readonly previewSelection = this.data.previewSelection;
  readonly rowHeight        = this.data.rowHeight;
  readonly inlineSearchOpen = this.data.inlineSearchOpen;
  readonly inlineSearchQuery = this.data.inlineSearchQuery;
  readonly searchPanelOpen  = this.data.searchPanelOpen;
  readonly editModalOpen    = this.data.editModalOpen;
  readonly enabledMultipleSelectionActions = this.data.enabledMultipleSelectionActions;
  readonly enabledRowActions               = this.data.enabledRowActions;
  readonly enabledRightClickActions        = this.data.enabledRightClickActions;
  // detail
  readonly detailPanelOpen       = this.detail.detailPanelOpen;
  readonly detailPanelWidth      = this.detail.detailPanelWidth;
  readonly activeDetailRowId     = this.detail.activeDetailRowId;
  readonly activeDetailTabId     = this.detail.activeDetailTabId;
  readonly detailMoreMenuOpen    = this.detail.detailMoreMenuOpen;
  readonly detailLayoutMode      = this.detail.detailLayoutMode;
  readonly activeDetailRow       = this.detail.activeDetailRow;
  readonly tabLayoutResolved     = this.detail.tabLayoutResolved;
  readonly blockLayoutResolved   = this.detail.blockLayoutResolved;
  readonly activeSimpleTab       = this.detail.activeSimpleTab;
  readonly activeSimpleTabFields = this.detail.activeSimpleTabFields;
  readonly activeTabBlocks       = this.detail.activeTabBlocks;
  readonly activeAllFields       = this.detail.activeAllFields;
  readonly isCustomDetailLayout  = this.detail.isCustomDetailLayout;
  readonly activeCustomDetailLayout  = this.detail.activeCustomDetailLayout;
  readonly hasCustomDetailCanvas     = this.detail.hasCustomDetailCanvas;
  readonly activeCustomLayoutFields  = this.detail.activeCustomLayoutFields;
  readonly detailCanEdit    = this.data.detailCanEdit;
  readonly detailCanDuplicate = this.data.detailCanDuplicate;
  readonly detailCanDelete  = this.data.detailCanDelete;
  // context menu
  readonly contextMenuOpen  = this.rowCtx.open;
  readonly contextMenuX     = this.rowCtx.x;
  readonly contextMenuY     = this.rowCtx.y;

  // ── Host listener ──────────────────────────────────────────────────────────
  /**
   * Coordinates on document click for the report configuration workflow.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.facade.closeAllMenus(event);
    this.exportMenuOpen.set(false);
  }

  /**
   * Coordinates on escape for the report configuration workflow.
   */
  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: KeyboardEvent): void {
    if (this.dismissOpenOverlay()) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  // ── Table event dispatcher (Command pattern) ───────────────────────────────
  /**
   * Coordinates handle table event for the report configuration workflow.
   */
  handleTableEvent(e: TableEvent): void {
    switch (e.type) {
      case 'rowClick':              this.facade.openRecordDetails(e.row); break;
      case 'contextMenu':           this.rowCtx.openContextMenu(e.row, e.event); break;
      case 'checkboxChange':        this.data.toggleRow(e.rowId); break;
      case 'selectAll':             this.data.toggleSelectAll(e.checked); break;
      case 'columnMenuToggle':      this.cols.toggleMenu(e.columnId, e.event); break;
      case 'rowMenuToggle':         this.rowCtx.toggleRowMenu(e.rowKey, e.event); break;
      case 'rowAction':             this.facade.runRowAction(e.action as 'edit' | 'duplicate' | 'delete', e.row); break;
      case 'sortApply':             this.data.applySort(e.columnId, e.direction); this.cols.closeMenu(); break;
      case 'groupApply':            this.data.applyGroup(e.columnId, e.direction); this.cols.closeMenu(); break;
      case 'hideColumn':            this.cols.hideColumn(e.columnId); this.cols.closeMenu(); break;
      case 'pinColumn':             this.cols.pinColumn(e.columnId); this.cols.closeMenu(); break;
      case 'unpinColumn':           this.cols.unpinColumn(e.columnId); this.cols.closeMenu(); break;
      case 'columnSearch':          this.data.openSearchPanel(e.columnId); this.cols.closeMenu(); break;
      case 'sortingChipToggle':     this.data.toggleSortingChip(); break;
      case 'sortingClear':          this.data.clearSorting(); break;
      case 'groupingChipToggle':    this.data.toggleGroupingChip(); break;
      case 'groupingClear':         this.data.clearGrouping(); break;
      case 'groupToggle':           this.data.toggleGroup(e.label); break;
      case 'collapseAll':           this.data.collapseAllGroups(); break;
      case 'expandAll':             this.data.expandAllGroups(); break;
      case 'visibilityMenuToggle':  this.cols.toggleVisibilityMenu(e.event); break;
      case 'columnVisibilityChange':this.cols.toggleVisibility(e.columnId, e.checked); break;
      case 'columnVisibilityDone':  this.cols.closeVisibilityMenu(); break;
    }
  }

  // ── Search drawer event dispatcher ────────────────────────────────────────
  /**
   * Coordinates handle search event for the report configuration workflow.
   */
  handleSearchEvent(e: SearchDrawerEvent): void {
    switch (e.type) {
      case 'close':          this.data.closeSearchPanel(); break;
      case 'apply':          this.data.applySearchPanel(); break;
      case 'rowToggle':      this.data.toggleSearchRow(e.id, e.checked); break;
      case 'operatorChange': this.data.updateSearchOperator(e.id, e.operator); break;
      case 'valueChange':    this.data.updateSearchValue(e.id, e.value); break;
    }
  }

  // ── Edit modal event dispatcher ───────────────────────────────────────────
  /**
   * Coordinates handle edit event for the report configuration workflow.
   */
  handleEditEvent(e: EditModalEvent): void {
    switch (e.type) {
      case 'close':       this.data.closeEditModal(); break;
      case 'save':        this.data.saveEditModal(); break;
      case 'fieldChange': this.data.updateEditValue(e.fieldId, e.value); break;
    }
  }

  // ── Export ─────────────────────────────────────────────────────────────────
  /**
   * Toggles export menu for the report configuration workflow.
   */
  toggleExportMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.exportMenuOpen.set(!this.exportMenuOpen());
  }
  /**
   * Selects export format for the report configuration workflow.
   */
  selectExportFormat(format: string): void {
    this.exportMenuOpen.set(false);
    this.facade.export(format);
  }

  /**
   * Coordinates dismiss open overlay for the report configuration workflow.
   */
  dismissOpenOverlay(): boolean {
    if (this.detailPanelOpen()) {
      this.closeDetailPanel();
      return true;
    }
    if (this.editModalOpen()) {
      this.data.closeEditModal();
      return true;
    }
    if (this.searchPanelOpen()) {
      this.data.closeSearchPanel();
      return true;
    }
    return false;
  }

  /**
   * Closes detail panel from event for the report configuration workflow.
   */
  closeDetailPanelFromEvent(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.closeDetailPanel();
  }

  // ── Template methods ───────────────────────────────────────────────────────
  /**
   * Coordinates print report for the report configuration workflow.
   */
  printReport(): void                                                { window.print(); }
  /**
   * Sets preview view type for the report configuration workflow.
   */
  setPreviewViewType(vt: 'List View' | 'Card View'): void           { this.report().viewType = vt; }
  /**
   * Sets row height for the report configuration workflow.
   */
  setRowHeight(height: 'compact' | 'comfortable' | 'expanded'): void { this.data.rowHeight.set(height); }
  /**
   * Toggles inline search for the report configuration workflow.
   */
  toggleInlineSearch(): void                                         { this.data.toggleInlineSearch(); }
  /**
   * Clears inline search for the report configuration workflow.
   */
  clearInlineSearch(): void                                          { this.data.clearInlineSearch(); }
  /**
   * Runs multiple selection action for the report configuration workflow.
   */
  runMultipleSelectionAction(a: 'edit' | 'duplicate' | 'delete'): void { this.facade.runMultiSelectionAction(a); }
  /**
   * Coordinates go to next page for the report configuration workflow.
   */
  goToNextPage(): void                                               { this.data.goToNextPage(); }
  /**
   * Coordinates go to previous page for the report configuration workflow.
   */
  goToPreviousPage(): void                                           { this.data.goToPreviousPage(); }
  // Detail panel
  /**
   * Opens record details for the report configuration workflow.
   */
  openRecordDetails(row: PreviewRecord): void                        { this.facade.openRecordDetails(row); }
  /**
   * Closes detail panel for the report configuration workflow.
   */
  closeDetailPanel(): void {
    this.detail.closePanel();
  }
  /**
   * Coordinates switch detail tab for the report configuration workflow.
   */
  switchDetailTab(id: string): void {
    this.detail.switchTab(id);
  }
  /**
   * Coordinates switch detail tab from event for the report configuration workflow.
   */
  switchDetailTabFromEvent(id: string, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.switchDetailTab(id);
  }
  /**
   * Toggles detail more menu for the report configuration workflow.
   */
  toggleDetailMoreMenu(e: MouseEvent): void                          { this.detail.toggleMoreMenu(e); }
  /**
   * Coordinates edit active detail row for the report configuration workflow.
   */
  editActiveDetailRow(): void                                        { this.facade.editActiveDetailRow(); }
  /**
   * Duplicates active detail row for the report configuration workflow.
   */
  duplicateActiveDetailRow(): void                                   { this.facade.duplicateActiveDetailRow(); }
  /**
   * Deletes active detail row for the report configuration workflow.
   */
  deleteActiveDetailRow(): void                                      { this.facade.deleteActiveDetailRow(); }
  /**
   * Coordinates print active detail row for the report configuration workflow.
   */
  printActiveDetailRow(): void                                       { this.facade.printActiveDetailRow(); }
  /**
   * Coordinates on detail panel resize start for the report configuration workflow.
   */
  onDetailPanelResizeStart(e: MouseEvent): void                      { this.detail.onResizeStart(e); }
  /**
   * Coordinates is detail row active for the report configuration workflow.
   */
  isDetailRowActive(id: number): boolean                             { return this.detail.isRowActive(id); }
  // Context menu
  /**
   * Coordinates get context menu row for the report configuration workflow.
   */
  getContextMenuRow(): PreviewRecord | null                          { return this.rowCtx.getContextMenuRow(this.data.previewRows()); }
  /**
   * Runs row action for the report configuration workflow.
   */
  runRowAction(a: 'edit' | 'duplicate' | 'delete', row: PreviewRecord): void { this.facade.runRowAction(a, row); }
  /**
   * Runs active detail action for the report configuration workflow.
   */
  runActiveDetailAction(a: 'edit' | 'duplicate' | 'delete'): void {
    const row = this.activeDetailRow();
    if (row) this.facade.runRowAction(a, row);
  }
  // Canvas / style
  /**
   * Coordinates get custom canvas top level items for the report configuration workflow.
   */
  getCustomCanvasTopLevelItems()                                     { return this.detail.getCustomCanvasTopLevelItems(); }
  /**
   * Coordinates get custom canvas tab children for the report configuration workflow.
   */
  getCustomCanvasTabChildren(id: string, key: string)                { return this.detail.getCustomCanvasTabChildren(id, key); }
  /**
   * Coordinates get custom canvas field value for the report configuration workflow.
   */
  getCustomCanvasFieldValue(f: string)                               { return this.detail.getCustomCanvasFieldValue(f); }
  /**
   * Coordinates get custom canvas active tab index for the report configuration workflow.
   */
  getCustomCanvasActiveTabIndex(id: string, max = 1)                 { return this.detail.getCustomCanvasActiveTabIndex(id, max); }
  /**
   * Coordinates is custom canvas tab active for the report configuration workflow.
   */
  isCustomCanvasTabActive(id: string, index: number)                 { return this.detail.isCustomCanvasTabActive(id, index); }
  /**
   * Coordinates switch custom canvas tab for the report configuration workflow.
   */
  switchCustomCanvasTab(id: string, index: number)                   { this.detail.switchCustomCanvasTab(id, index); }
  /**
   * Coordinates get custom canvas item style for the report configuration workflow.
   */
  getCustomCanvasItemStyle(item: ReportDetailCanvasItem)             { return this.detail.getCustomCanvasItemStyle(item); }
  /**
   * Coordinates get custom canvas tab style for the report configuration workflow.
   */
  getCustomCanvasTabStyle(item: ReportDetailCanvasItem)              { return this.detail.getCustomCanvasTabStyle(item); }
  /**
   * Coordinates get custom canvas child field style for the report configuration workflow.
   */
  getCustomCanvasChildFieldStyle(item: ReportDetailCanvasItem)       { return this.detail.getCustomCanvasChildFieldStyle(item); }
  /**
   * Coordinates get custom detail field style for the report configuration workflow.
   */
  getCustomDetailFieldStyle(f: string)                               { return this.detail.getCustomDetailFieldStyle(f); }
  /**
   * Coordinates get column label for the report configuration workflow.
   */
  getColumnLabel(f: string)                                          { return this.detail.getColumnLabel(f); }
  /**
   * Coordinates get detail field value for the report configuration workflow.
   */
  getDetailFieldValue(row: PreviewRecord, f: string, src?: string)   { return this.detail.getDetailFieldValue(row, f, src); }
  /**
   * Coordinates get column style for the report configuration workflow.
   */
  getColumnStyle(col: ReportBuilderColumn)                           { return this.facade.getColumnStyle(col); }

  // ── Custom card-view helpers (template/list/canvas/default slots) ───────────
  /** Card container style (background + padding) from the saved custom layout. */
  getCustomCardStyle()                                               { return this.facade.style.resolveCustomCardStyle(this.report().settings.quickViewCustomLayout.styles as unknown as Record<string, unknown>); }
  /** Per-slot style (alignment, background, padding) for a named slot. */
  getSlotStyle(slot: QuickViewCustomSlot)                            { return this.facade.style.resolveSlotStyle(this.report().settings.quickViewCustomLayout.styles as unknown as Record<string, unknown>, slot); }
  /** CSS modifier class selecting the image shape (square/circle/full). */
  getImageShapeClass()                                               { return `custom-card__image--${this.report().settings.quickViewCustomLayout.styles.imageShape}`; }
  /** Canvas container sizing (width/height) for the designed layout. */
  getDesignerContainerStyle()                                        { return this.facade.style.resolveDesignerContainerStyle(this.report().settings.quickViewCustomLayout.canvasLayout); }
  /** Positioned elements drawn on the custom-layout canvas. */
  getDesignerElements(): QuickViewCanvasElement[]                    { return this.report().settings.quickViewCustomLayout.canvasLayout?.elements ?? []; }
  /** Resolves a canvas element's text to the bound field value (or its label). */
  getDesignerElementText(row: PreviewRecord, el: QuickViewCanvasElement) { return this.facade.style.resolveDesignerElementText(row, el, this.report().settings.quickViewCustomLayout.slots); }
  /** Rows rendered as cards (sorted, filtered, grouped by the data service). */
  getCardRows(): PreviewRecord[]                                     { return this.data.sortedRows(); }
  /** Grid column template for the standard card view (1 col on mobile, else 2). */
  getCardGridTemplateColumns() {
    const rowCount = Math.max(1, this.data.sortedRows().length);
    const columnCount = this.viewport() === 'mobile' ? 1 : Math.min(2, rowCount);
    return `repeat(${columnCount}, minmax(0, 1fr))`;
  }
  /** First visible column shown as the standard card's heading. */
  cardPrimaryColumn()                                                { return this.data.cardPrimaryColumn(); }
  /** Second visible column shown as the standard card's body line. */
  cardSecondaryColumn()                                              { return this.data.cardSecondaryColumn(); }
  /** Stringified field value for a given column on a row. */
  getCardFieldValue(row: PreviewRecord, col: ReportBuilderColumn | null) { return this.data.getCardFieldValue(row, col); }
  /** Field value bound to a custom-layout slot (title/body/meta/image). */
  getCustomSlotValue(row: PreviewRecord, slot: QuickViewCustomSlot)  { return this.data.getCustomSlotValue(row, slot); }
  /** Display label for a custom-layout slot (column label, else slot name). */
  getCustomSlotLabel(slot: QuickViewCustomSlot)                      { return this.data.getCustomSlotLabel(slot); }
  /** Whether the given record id is in the current preview selection. */
  isPreviewRowSelected(id: number)                                   { return this.data.isRowSelected(id); }
}
