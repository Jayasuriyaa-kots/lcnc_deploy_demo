import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, NgZone, OnDestroy, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { QoIconComponent, QoStatusDotComponent } from '@qo/ui-components';
import { UiMediaWidgetComponent } from '@builder/features/page-builder/components/widget-showcase/media/ui-media/ui-media-widget.component';
import { CanvasWidget } from '@builder/features/page-builder/models/page-builder-canvas.model';
import { DeploymentFacadeService } from '../facades/deployment.facade';
import { DeploymentExportService } from '../services/deployment-export.service';
import {
  resolveDeploymentTableColumns,
  resolveDeploymentTableRows,
} from '../services/deployment-table-runtime.util';
import { MobileChromeScrollController } from '../services/mobile-chrome-scroll.controller';

@Component({
  selector: 'app-mobile-preview-page',
  standalone: true,
  imports: [QoIconComponent, QoStatusDotComponent, UiMediaWidgetComponent],
  templateUrl: './mobile-preview-page.component.html',
  styleUrl: './mobile-preview-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobilePreviewPageComponent implements AfterViewInit, OnDestroy {
  private readonly facade = inject(DeploymentFacadeService);
  private readonly exportService = inject(DeploymentExportService);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);

  // ── Facade signals ────────────────────────────────────────────────────────
  readonly mobileLeftHeaderOptions = this.facade.mobileLeftHeaderOptions;
  readonly mobileRightHeaderOptions = this.facade.mobileRightHeaderOptions;
  readonly activeLayoutPayload = this.facade.activeLayoutPayload;
  readonly previewPrimaryPages = this.facade.previewPrimaryPages;
  readonly selectedPreviewPrimaryPage = this.facade.selectedPreviewPrimaryPage;
  readonly previewNavigationPages = this.facade.previewNavigationPages;
  readonly selectedPreviewLeftPage = this.facade.selectedPreviewLeftPage;
  readonly previewSubPages = this.facade.previewSubPages;
  readonly selectedPreviewSubPage = this.facade.selectedPreviewSubPage;
  readonly previewTopTabs = this.facade.previewTopTabs;
  readonly selectedPreviewTopTab = this.facade.selectedPreviewTopTab;
  readonly previewDataset = this.facade.previewDataset;
  readonly showPreviewFiltersPanel = this.facade.showPreviewFiltersPanel;
  readonly showPreviewSortPanel = this.facade.showPreviewSortPanel;
  readonly showPreviewEmployeeModal = this.facade.showPreviewEmployeeModal;
  readonly currentPageTargetType = this.facade.currentPageTargetType;
  readonly currentPageTargetName = this.facade.currentPageTargetName;
  readonly currentPageWidgets = this.facade.currentPageWidgets;
  readonly currentTargetForm = this.facade.currentTargetForm;

  readonly selectPreviewLeftPage = this.facade.selectPreviewLeftPage.bind(this.facade);
  readonly selectPreviewSubPage = this.facade.selectPreviewSubPage.bind(this.facade);
  readonly selectPreviewTopTab = this.facade.selectPreviewTopTab.bind(this.facade);
  readonly togglePreviewFiltersPanel = this.facade.togglePreviewFiltersPanel.bind(this.facade);
  readonly closePreviewFiltersPanel = this.facade.closePreviewFiltersPanel.bind(this.facade);
  readonly togglePreviewSortPanel = this.facade.togglePreviewSortPanel.bind(this.facade);
  readonly closePreviewSortPanel = this.facade.closePreviewSortPanel.bind(this.facade);
  readonly openPreviewEmployeeModal = this.facade.openPreviewEmployeeModal.bind(this.facade);
  readonly closePreviewEmployeeModal = this.facade.closePreviewEmployeeModal.bind(this.facade);

  // ── Derived header visibility ─────────────────────────────────────────────
  readonly headerShowLogo = computed(() =>
    this.mobileLeftHeaderOptions().find((o) => o.id === 'logo')?.checked ?? true
  );
  readonly headerShowAppName = computed(() =>
    this.mobileLeftHeaderOptions().find((o) => o.id === 'app-name')?.checked ?? true
  );
  readonly headerShowSwitcher = computed(() =>
    this.mobileLeftHeaderOptions().find((o) => o.id === 'switcher')?.checked ?? true
  );
  readonly headerShowAddButton = computed(() =>
    this.mobileRightHeaderOptions().find((o) => o.id === 'add-button')?.checked ?? false
  );
  readonly headerShowSearch = computed(() =>
    this.mobileRightHeaderOptions().find((o) => o.id === 'global-search')?.checked ?? true
  );
  readonly headerShowKnowledgeBase = computed(() =>
    this.mobileRightHeaderOptions().find((o) => o.id === 'knowledge-base')?.checked ?? false
  );
  readonly headerShowNotifications = computed(() =>
    this.mobileRightHeaderOptions().find((o) => o.id === 'notifications')?.checked ?? false
  );
  readonly headerShowAppSettings = computed(() =>
    this.mobileRightHeaderOptions().find((o) => o.id === 'app-settings')?.checked ?? false
  );
  readonly headerShowAccount = computed(() =>
    this.mobileRightHeaderOptions().find((o) => o.id === 'account-settings')?.checked ?? true
  );

  readonly hasOverflowActions = computed(() =>
    this.headerShowAddButton() ||
    this.headerShowKnowledgeBase() ||
    this.headerShowNotifications() ||
    this.headerShowAppSettings() ||
    this.headerShowAccount()
  );

  // ── Local UI state ────────────────────────────────────────────────────────
  readonly mobileApplications = signal([
    { id: 'hr', label: 'HR Management', icon: 'users' },
    { id: 'crm', label: 'Sales CRM', icon: 'bar-chart-3' },
    { id: 'tracker', label: 'Project Tracker', icon: 'file-text' },
  ]);
  readonly activeApplicationId = signal('hr');
  readonly openMobileSubmenuPageId = signal<string | null>(null);
  readonly mobileActionBarOpen = signal(false);
  readonly mobileExportMenuOpen = signal(false);
  readonly mobileSearchQuery = signal('');
  /** 'contains' = Search button / typing (partial match across all cells)
   *  'exact'    = Suggestion click (exact match on first column only) */
  private readonly searchMode = signal<'contains' | 'exact'>('contains');
  private readonly exactSearchValue = signal('');
  readonly mobileAppSwitcherOpen = signal(false);
  /** Floating scroll-to-top button — appears only after scrolling down a bit */
  readonly showScrollTop = signal(false);
  readonly mobileGlobalSearchOpen = signal(false);
  readonly mobileGlobalSearchQuery = signal('');
  readonly mobileProfileMenuOpen = signal(false);
  readonly mobileMoreMenuOpen = signal(false);
  readonly isSignedIn = signal(true);
  readonly mobileLeftDrawerOpen = signal(false);
  @ViewChild('scrollContainer') private scrollContainerRef?: ElementRef<HTMLElement>;
  @ViewChild('controlsWrap') private controlsWrapRef?: ElementRef<HTMLElement>;
  @ViewChild('tableScroll') private tableScrollRef?: ElementRef<HTMLElement>;

  // ── Shared mobile scroll engine (single source of truth) ────────────────────
  // All scrolling, chrome-collapse and row-virtualization behaviour lives in
  // MobileChromeScrollController — the SAME engine the Deployment Mobile Web page
  // uses, so both pages scroll and feel byte-for-byte identical. The signals
  // below are owned here (so the template stays reactive) and handed to it.
  /** Mostly-expanded gate for secondary chrome (left selector, action panels). */
  readonly mobileNavVisible = signal(true);
  /** Full data mode: chrome fully collapsed — hide the bottom nav for an
   *  immersive, distraction-free data view. */
  readonly fullDataMode = signal(false);
  /** Measured data-row height + the rendered window bounds (virtualization). */
  readonly rowHeight = signal(32);
  readonly renderStart = signal(0);
  readonly renderEnd = signal(40);
  /** Mobile data presentation — rows (list) or cards. Persists for the session. */
  readonly mobileViewMode = signal<'list' | 'card'>('list');

  private readonly scrollEngine = new MobileChromeScrollController({
    ngZone: this.ngZone,
    rowHeight: this.rowHeight,
    renderStart: this.renderStart,
    renderEnd: this.renderEnd,
    mobileNavVisible: this.mobileNavVisible,
    fullDataMode: this.fullDataMode,
    showScrollTop: this.showScrollTop,
    onEnterFullData: () => this.closeAllActionPanels(),
  });

  /** The visible slice of rows plus spacer heights that hold the scroll height. */
  readonly windowedRows = computed(() => {
    const all = this.mobilePreviewRows();
    const total = all.length;
    const rowH = this.rowHeight();
    const start = Math.max(0, Math.min(this.renderStart(), total));
    const end = Math.max(start, Math.min(this.renderEnd(), total));
    return {
      rows: all.slice(start, end),
      topPad: start * rowH,
      bottomPad: Math.max(0, total - end) * rowH,
    };
  });

  // When the row set changes (search / filter / sort / page change), snap the
  // window and the scroll position back to the top so the new results show.
  private readonly _resetWindowOnData = effect(() => {
    this.mobilePreviewRows(); // track
    this.scrollEngine.resetToTop();
  });

  private touchStartX = 0;
  private touchStartY = 0;
  private touchScrollLeft = 0;
  private touchScrollTop = 0;
  private touchLocked: 'v' | 'h' | null = null;
  private readonly TOUCH_LOCK_THRESHOLD = 8;

  readonly tabsHasRightOverflow = signal(false);
  readonly tabsHasLeftOverflow = signal(false);
  @ViewChild('tabsStrip') private tabsStripRef?: ElementRef<HTMLElement>;
  private tabsNudging = false;
  private tabsHintTimer?: ReturnType<typeof setTimeout>;

  // ── Derived values ────────────────────────────────────────────────────────
  readonly mobilePreviewTitle = computed(
    () =>
      this.selectedPreviewTopTab()?.label ??
      this.selectedPreviewSubPage()?.label ??
      this.selectedPreviewLeftPage()?.label ??
      this.selectedPreviewPrimaryPage()?.label ??
      'Dashboard'
  );

  readonly mobileTopPageOptions = computed(() => this.previewTopTabs());
  readonly mobileLeftPageOptions = computed(() => this.previewNavigationPages());

  readonly mobilePopupSubPages = computed(() => {
    const openPageId = this.openMobileSubmenuPageId();
    if (!openPageId) return [];
    return this.mobileLeftPageOptions().find((page) => page.id === openPageId)?.subPages ?? [];
  });

  readonly globalSearchResults = computed(() => {
    const query = this.mobileGlobalSearchQuery().trim().toLowerCase();
    if (!query) return [];
    return this.previewPrimaryPages().filter((p) => p.label.toLowerCase().includes(query));
  });

  // ── Filter state ──────────────────────────────────────────────────────────
  readonly filterRows = signal<{ id: string; column: string; operator: string; value: string }[]>([]);
  readonly appliedFilterRows = signal<{ id: string; column: string; operator: string; value: string }[]>([]);
  readonly sortRows = signal<{ id: string; column: string; direction: 'asc' | 'desc' }[]>([]);
  readonly appliedSortRows = signal<{ id: string; column: string; direction: 'asc' | 'desc' }[]>([]);

  readonly filterOperators = [
    { value: 'contains', label: 'contains' },
    { value: 'not_contains', label: 'does not contain' },
    { value: 'equals', label: 'equals' },
    { value: 'not_equals', label: 'not equals' },
    { value: 'starts_with', label: 'starts with' },
    { value: 'is_empty', label: 'is empty' },
  ];

  readonly filteredDatasetRows = computed(() => {
    const filters = this.appliedFilterRows();
    const dataset = this.previewDataset();
    const activeFilters = filters.filter((f) => f.column && (f.operator === 'is_empty' || f.value.trim()));
    if (!activeFilters.length) return dataset.rows;
    return dataset.rows.filter((row) =>
      activeFilters.every((f) => {
        const colIdx = dataset.columns.indexOf(f.column);
        if (colIdx === -1) return true;
        const cell = String(row[colIdx] ?? '').toLowerCase();
        const val = f.value.toLowerCase();
        switch (f.operator) {
          case 'contains': return cell.includes(val);
          case 'not_contains': return !cell.includes(val);
          case 'equals': return cell === val;
          case 'not_equals': return cell !== val;
          case 'starts_with': return cell.startsWith(val);
          case 'is_empty': return cell.trim() === '';
          default: return true;
        }
      })
    );
  });

  readonly sortedFilteredRows = computed(() => {
    const sorts = this.appliedSortRows().filter((s) => s.column);
    const rows = [...this.filteredDatasetRows()];
    if (!sorts.length) return rows;
    const dataset = this.previewDataset();
    return rows.sort((a, b) => {
      for (const sort of sorts) {
        const idx = dataset.columns.indexOf(sort.column);
        if (idx === -1) continue;
        const av = String(a[idx] ?? '');
        const bv = String(b[idx] ?? '');
        const type = this.getColumnDataType(sort.column);
        let cmp = 0;
        if (type === 'number') cmp = parseFloat(av) - parseFloat(bv);
        else if (type === 'date') cmp = new Date(av).getTime() - new Date(bv).getTime();
        else cmp = av.localeCompare(bv, undefined, { sensitivity: 'base' });
        if (cmp !== 0) return sort.direction === 'asc' ? cmp : -cmp;
      }
      return 0;
    });
  });

  readonly mobilePreviewRows = computed(() => {
    let rows = this.sortedFilteredRows();
    if (this.searchMode() === 'exact') {
      const exact = this.exactSearchValue();
      if (exact) rows = rows.filter((row) => row[0]?.toLowerCase() === exact.toLowerCase());
    } else {
      const query = this.mobileSearchQuery().trim().toLowerCase();
      if (query) rows = rows.filter((row) => row.some((cell) => cell.toLowerCase().includes(query)));
    }
    return rows;
  });

  // ── Saved Views ───────────────────────────────────────────────────────────
  private readonly _allPageViews = signal<Record<string, {
    id: string;
    name: string;
    filters: { id: string; column: string; operator: string; value: string }[];
  }[]>>({});

  readonly viewsDropdownOpen = signal(false);
  readonly viewBuilderOpen = signal(false);
  readonly activeViewId = signal<string | null>(null);
  readonly viewDraftName = signal('');
  readonly viewDraftFilters = signal<{ id: string; column: string; operator: string; value: string }[]>([]);

  private currentPageKey(): string {
    const primary = this.selectedPreviewPrimaryPage()?.id ?? '';
    const left = this.selectedPreviewLeftPage()?.id ?? '';
    const sub = this.selectedPreviewSubPage()?.id ?? '';
    const tab = this.selectedPreviewTopTab()?.id ?? '';
    return [primary, left, sub, tab].filter(Boolean).join('::') || '__default__';
  }

  readonly savedViews = computed(() => this._allPageViews()[this.currentPageKey()] ?? []);

  private clearFilterState(): void {
    this.filterRows.set([]);
    this.appliedFilterRows.set([]);
    this.sortRows.set([]);
    this.appliedSortRows.set([]);
    this.activeViewId.set(null);
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  goBack(): void {
    void this.router.navigate(['/deployment/mobile']);
  }

  selectPreviewPage(id: string): void {
    this.facade.selectPreviewPage(id);
    this.openMobileSubmenuPageId.set(null);
    this.clearFilterState();
    if (this.mobileLeftPageOptions().length) {
      this.mobileLeftDrawerOpen.set(true);
    }
  }

  selectMobileTopPage(id: string): void {
    if (this.previewTopTabs().some((page) => page.id === id)) {
      this.selectPreviewTopTab(id);
      this.clearFilterState();
      return;
    }
    this.selectPreviewPage(id);
  }

  selectMobileLeftPage(id: string): void {
    const isOpen = this.openMobileSubmenuPageId() === id;
    const isSelected = this.selectedPreviewLeftPage()?.id === id;
    if (!isSelected) {
      this.selectPreviewLeftPage(id);
      this.clearFilterState();
    }
    const hasSubPages = this.mobileLeftPageOptions().some((page) => page.id === id && page.subPages.length > 0);
    this.openMobileSubmenuPageId.set(hasSubPages && !isOpen ? id : null);
    if (!hasSubPages) this.mobileLeftDrawerOpen.set(false);
  }

  selectMobileSubmenuPage(id: string): void {
    this.selectPreviewSubPage(id);
    this.openMobileSubmenuPageId.set(null);
  }

  // ── App switcher / search / profile ──────────────────────────────────────
  toggleMobileAppSwitcher(): void {
    this.mobileAppSwitcherOpen.update((o) => !o);
    if (this.mobileAppSwitcherOpen()) this.mobileMoreMenuOpen.set(false);
  }
  closeMobileAppSwitcher(): void { this.mobileAppSwitcherOpen.set(false); }
  selectApplication(id: string): void { this.activeApplicationId.set(id); }

  toggleMobileGlobalSearch(): void {
    this.mobileGlobalSearchOpen.update((o) => !o);
    if (this.mobileGlobalSearchOpen()) {
      this.mobileProfileMenuOpen.set(false);
      this.mobileAppSwitcherOpen.set(false);
      this.mobileMoreMenuOpen.set(false);
    } else {
      this.mobileGlobalSearchQuery.set('');
    }
  }

  closeMobileGlobalSearch(): void {
    this.mobileGlobalSearchOpen.set(false);
    this.mobileGlobalSearchQuery.set('');
  }

  toggleMobileProfileMenu(): void {
    this.mobileProfileMenuOpen.update((o) => !o);
    if (this.mobileProfileMenuOpen()) {
      this.mobileGlobalSearchOpen.set(false);
      this.mobileGlobalSearchQuery.set('');
      this.mobileAppSwitcherOpen.set(false);
      this.mobileMoreMenuOpen.set(false);
    }
  }

  closeMobileProfileMenu(): void { this.mobileProfileMenuOpen.set(false); }
  handleSignOut(): void { this.isSignedIn.set(false); this.closeMobileProfileMenu(); }
  handleSignIn(): void { this.isSignedIn.set(true); this.closeMobileProfileMenu(); }

  toggleMobileMoreMenu(): void {
    this.mobileMoreMenuOpen.update((open) => {
      const next = !open;
      if (next) {
        this.mobileGlobalSearchOpen.set(false);
        this.mobileGlobalSearchQuery.set('');
        this.mobileAppSwitcherOpen.set(false);
        this.mobileProfileMenuOpen.set(false);
      }
      return next;
    });
  }

  closeMobileMoreMenu(): void { this.mobileMoreMenuOpen.set(false); }

  // ── Action bar / export ───────────────────────────────────────────────────
  toggleMobileActionBar(): void {
    this.mobileExportMenuOpen.set(false);
    this.mobileActionBarOpen.update((o) => !o);
  }

  submitSearch(): void {
    // Contains search — partial match on whatever is in the input box
    this.searchMode.set('contains');
    this.exactSearchValue.set('');
    this.mobileActionBarOpen.set(false);
  }

  selectSearchSuggestion(value: string): void {
    // Exact search — first column must equal the suggestion exactly
    this.mobileSearchQuery.set(value);
    this.exactSearchValue.set(value);
    this.searchMode.set('exact');
    this.mobileActionBarOpen.set(false);
  }

  closeAllActionPanels(): void {
    this.mobileActionBarOpen.set(false);
    this.mobileExportMenuOpen.set(false);
    this.closePreviewFiltersPanel();
    this.closePreviewSortPanel();
    this.viewsDropdownOpen.set(false);
    this.closeViewBuilder();
  }

  updateMobileSearchQuery(query: string): void {
    this.mobileSearchQuery.set(query);
    // Typing resets to contains mode and clears any prior exact match
    this.searchMode.set('contains');
    this.exactSearchValue.set('');
    if (!query.trim()) {
      this.mobileActionBarOpen.set(false);
      return;
    }
    this.mobileExportMenuOpen.set(false);
    this.mobileActionBarOpen.set(true);
  }

  toggleMobileExportMenu(): void {
    this.mobileExportMenuOpen.update((open) => {
      const nextOpen = !open;
      if (nextOpen) {
        this.mobileActionBarOpen.set(false);
        this.closePreviewFiltersPanel();
        this.closePreviewSortPanel();
        this.viewsDropdownOpen.set(false);
      }
      return nextOpen;
    });
  }

  closeMobileExportMenu(): void { this.mobileExportMenuOpen.set(false); }

  exportCsv(): void {
    this.exportService.exportCsv(this.previewDataset(), this.exportFilename());
    this.closeMobileExportMenu();
  }

  exportPdf(): void {
    this.exportService
      .exportPdf(this.previewDataset(), this.exportFilename(), this.mobilePreviewTitle())
      .then(() => this.closeMobileExportMenu());
  }

  exportJson(): void {
    this.exportService.exportJson(this.previewDataset(), this.exportFilename());
    this.closeMobileExportMenu();
  }

  private exportFilename(): string {
    return (this.currentPageTargetName() || this.mobilePreviewTitle() || 'export')
      .trim()
      .replace(/[^a-z0-9]+/gi, '_')
      .replace(/^_+|_+$/g, '')
      .toLowerCase() || 'export';
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngAfterViewInit(): void {
    const tabsEl = this.tabsStripRef?.nativeElement;
    if (tabsEl && tabsEl.scrollWidth > tabsEl.clientWidth) {
      this.tabsHasRightOverflow.set(true);
      this.tabsHintTimer = setTimeout(() => {
        this.tabsNudging = true;
        tabsEl.scrollTo({ left: 15, behavior: 'smooth' });
        setTimeout(() => {
          tabsEl.scrollTo({ left: 0, behavior: 'smooth' });
          setTimeout(() => { this.tabsNudging = false; }, 600);
        }, 500);
      }, 900);
    }

    // Hand the view elements to the shared scroll engine (single source of truth).
    this.scrollEngine.attach(
      this.scrollContainerRef?.nativeElement,
      this.controlsWrapRef?.nativeElement,
      this.tableScrollRef?.nativeElement,
    );
  }

  ngOnDestroy(): void {
    clearTimeout(this.tabsHintTimer);
    this.scrollEngine.detach();
  }

  onTabsScroll(event: Event): void {
    if (this.tabsNudging) return;
    const el = event.target as HTMLElement;
    const scrollLeft = el.scrollLeft;
    this.tabsHasLeftOverflow.set(scrollLeft > 4);
    this.tabsHasRightOverflow.set(scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  scrollToTop(): void {
    this.scrollEngine.scrollToTop();
  }

  setMobileViewMode(mode: 'list' | 'card'): void {
    if (this.mobileViewMode() === mode) return;
    this.mobileViewMode.set(mode);
    // Cards and table rows have different heights — re-measure (keeping the same
    // record at the top, no scroll reset) so virtualization stays exact. Same
    // scroll engine/container; only the renderer changes.
    this.scrollEngine.remeasure();
  }

  /** Status-like column → render its value as a badge in card view. */
  isStatusColumn(col: string): boolean {
    return /status|stage|state/i.test(col);
  }

  onTouchStart(event: TouchEvent): void {
    const t = event.touches[0];
    if (!t) return;
    this.touchStartX = t.clientX;
    this.touchStartY = t.clientY;
    this.touchLocked = null;
    const el = this.scrollContainerRef?.nativeElement;
    if (el) {
      this.touchScrollLeft = el.scrollLeft;
      this.touchScrollTop = el.scrollTop;
    }
  }

  onTouchMove(event: TouchEvent): void {
    if (this.touchLocked) return;
    const t = event.touches[0];
    if (!t) return;
    const dx = Math.abs(t.clientX - this.touchStartX);
    const dy = Math.abs(t.clientY - this.touchStartY);
    if (dx + dy < this.TOUCH_LOCK_THRESHOLD) return;
    const el = this.scrollContainerRef?.nativeElement;
    if (!el) return;
    this.touchLocked = dy >= dx ? 'v' : 'h';
    if (this.touchLocked === 'v') {
      el.style.overflowX = 'hidden';
      el.scrollLeft = this.touchScrollLeft;
    } else {
      el.style.overflowY = 'hidden';
      el.scrollTop = this.touchScrollTop;
    }
  }

  onTouchEnd(): void {
    this.touchLocked = null;
    const el = this.scrollContainerRef?.nativeElement;
    if (el) {
      el.style.overflowX = 'auto';
      el.style.overflowY = 'auto';
    }
  }

  // ── Table widget helpers ──────────────────────────────────────────────────
  private readonly _tableCache = new Map<string, { cols: { key: string; label: string }[]; rows: string[][] }>();

  private _resolveTableData(widget: CanvasWidget) {
    const cached = this._tableCache.get(widget.id);
    if (cached) return cached;
    const config = widget.widgetProps?.tableConfig;
    if (!config) { const empty = { cols: [], rows: [] }; this._tableCache.set(widget.id, empty); return empty; }
    const rawRows = resolveDeploymentTableRows(config);
    const cols = resolveDeploymentTableColumns(config, rawRows);
    const rows = rawRows.slice(0, 100).map((row) => cols.map((col) => String(row[col.key] ?? '')));
    const result = { cols, rows };
    this._tableCache.set(widget.id, result);
    return result;
  }

  getVisibleTableColumns(widget: CanvasWidget): { key: string; label: string }[] {
    return this._resolveTableData(widget).cols;
  }

  getTableRows(widget: CanvasWidget): string[][] {
    return this._resolveTableData(widget).rows;
  }

  // ── Filter methods ────────────────────────────────────────────────────────
  addFilterRow(): void {
    this.filterRows.update((rows) => [...rows, { id: crypto.randomUUID(), column: '', operator: 'contains', value: '' }]);
  }
  removeFilterRow(id: string): void { this.filterRows.update((rows) => rows.filter((r) => r.id !== id)); }
  updateFilterRowColumn(id: string, column: string): void {
    this.filterRows.update((rows) => rows.map((r) => (r.id === id ? { ...r, column, value: '' } : r)));
  }
  updateFilterRowOperator(id: string, operator: string): void {
    this.filterRows.update((rows) => rows.map((r) => (r.id === id ? { ...r, operator } : r)));
  }
  updateFilterRowValue(id: string, value: string): void {
    this.filterRows.update((rows) => rows.map((r) => (r.id === id ? { ...r, value } : r)));
  }
  applyFilters(): void { this.appliedFilterRows.set([...this.filterRows()]); this.closePreviewFiltersPanel(); }
  clearAllFilters(): void { this.filterRows.set([]); this.appliedFilterRows.set([]); }

  // ── Sort methods ──────────────────────────────────────────────────────────
  addSortRow(): void {
    this.sortRows.update((rows) => [...rows, { id: crypto.randomUUID(), column: '', direction: 'asc' }]);
  }
  removeSortRow(id: string): void { this.sortRows.update((rows) => rows.filter((r) => r.id !== id)); }
  updateSortColumn(id: string, column: string): void {
    this.sortRows.update((rows) => rows.map((r) => (r.id === id ? { ...r, column } : r)));
  }
  updateSortDirection(id: string, direction: 'asc' | 'desc'): void {
    this.sortRows.update((rows) => rows.map((r) => (r.id === id ? { ...r, direction } : r)));
  }
  applySorts(): void { this.appliedSortRows.set([...this.sortRows()]); this.closePreviewSortPanel(); }
  clearAllSorts(): void { this.sortRows.set([]); this.appliedSortRows.set([]); }

  getColumnDataType(col: string): 'text' | 'number' | 'date' {
    const dataset = this.previewDataset();
    const idx = dataset.columns.indexOf(col);
    if (idx === -1) return 'text';
    for (const row of dataset.rows.slice(0, 20)) {
      const val = String(row[idx] ?? '').trim();
      if (!val) continue;
      if (!isNaN(Number(val))) return 'number';
      if (/^\d{4}[-/]\d{2}[-/]\d{2}/.test(val) || /\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/.test(val)) return 'date';
      return 'text';
    }
    return 'text';
  }

  getSortDirectionLabel(col: string, dir: 'asc' | 'desc'): string {
    if (!col) return dir === 'asc' ? 'Ascending' : 'Descending';
    const type = this.getColumnDataType(col);
    if (type === 'number') return dir === 'asc' ? '1→9' : '9→1';
    if (type === 'date') return dir === 'asc' ? 'Old→New' : 'New→Old';
    return dir === 'asc' ? 'A→Z' : 'Z→A';
  }

  // ── View methods ──────────────────────────────────────────────────────────
  toggleViewsDropdown(): void { this.viewsDropdownOpen.update((v) => !v); }
  closeViewsDropdown(): void { this.viewsDropdownOpen.set(false); }

  openViewBuilder(): void {
    this.viewDraftName.set('');
    this.viewDraftFilters.set([]);
    this.viewBuilderOpen.set(true);
    this.closeViewsDropdown();
  }
  closeViewBuilder(): void { this.viewBuilderOpen.set(false); }

  addViewDraftFilterRow(): void {
    this.viewDraftFilters.update((rows) => [...rows, { id: crypto.randomUUID(), column: '', operator: 'contains', value: '' }]);
  }
  removeViewDraftFilterRow(id: string): void {
    this.viewDraftFilters.update((rows) => rows.filter((r) => r.id !== id));
  }
  updateViewDraftFilterColumn(id: string, column: string): void {
    this.viewDraftFilters.update((rows) => rows.map((r) => (r.id === id ? { ...r, column, value: '' } : r)));
  }
  updateViewDraftFilterOperator(id: string, operator: string): void {
    this.viewDraftFilters.update((rows) => rows.map((r) => (r.id === id ? { ...r, operator } : r)));
  }
  updateViewDraftFilterValue(id: string, value: string): void {
    this.viewDraftFilters.update((rows) => rows.map((r) => (r.id === id ? { ...r, value } : r)));
  }

  saveView(): void {
    const name = this.viewDraftName().trim();
    if (!name) return;
    const key = this.currentPageKey();
    const newView = {
      id: crypto.randomUUID(),
      name,
      filters: this.viewDraftFilters().filter((f) => f.column && (f.operator === 'is_empty' || f.value.trim())),
    };
    this._allPageViews.update((all) => ({ ...all, [key]: [...(all[key] ?? []), newView] }));
    this.closeViewBuilder();
  }

  applyView(id: string): void {
    const view = this.savedViews().find((v) => v.id === id);
    if (!view) return;
    this.activeViewId.set(id);
    this.filterRows.set(view.filters.map((f) => ({ ...f })));
    this.appliedFilterRows.set(view.filters.map((f) => ({ ...f })));
    this.closeViewsDropdown();
  }

  clearView(): void {
    this.activeViewId.set(null);
    this.filterRows.set([]);
    this.appliedFilterRows.set([]);
    this.closeViewsDropdown();
  }

  deleteView(id: string): void {
    const key = this.currentPageKey();
    this._allPageViews.update((all) => ({
      ...all,
      [key]: (all[key] ?? []).filter((v) => v.id !== id),
    }));
    if (this.activeViewId() === id) this.clearView();
  }
}
