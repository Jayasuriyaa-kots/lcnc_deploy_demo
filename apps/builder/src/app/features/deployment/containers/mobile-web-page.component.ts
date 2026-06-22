import { DragDropModule } from '@angular/cdk/drag-drop';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, NgZone, OnDestroy, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { QoButtonComponent, QoCheckboxComponent, QoIconComponent, QoStatusDotComponent } from '@qo/ui-components';
import { UiMediaWidgetComponent } from '@builder/features/page-builder/components/widget-showcase/media/ui-media/ui-media-widget.component';
import { CanvasWidget } from '@builder/features/page-builder/models/page-builder-canvas.model';
import { DeploymentFacadeService } from '../facades/deployment.facade';
import { DeploymentExportService } from '../services/deployment-export.service';
import {
  resolveDeploymentTableColumns,
  resolveDeploymentTableRows,
} from '../services/deployment-table-runtime.util';

interface MobilePreviewMetric {
  value: string;
  label: string;
}

@Component({
  selector: 'app-mobile-web-page',
  standalone: true,
  imports: [
    DragDropModule,
    QoButtonComponent,
    QoCheckboxComponent,
    QoIconComponent,
    QoStatusDotComponent,
    UiMediaWidgetComponent,
  ],
  templateUrl: './mobile-web-page.component.html',
  styleUrl: './mobile-web-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileWebPageComponent implements AfterViewInit, OnDestroy {
  private readonly facade = inject(DeploymentFacadeService);
  private readonly exportService = inject(DeploymentExportService);
  private readonly ngZone = inject(NgZone);

  readonly showPreview = this.facade.showPreview;
  readonly previewFullScreen = this.facade.previewFullScreen;
  readonly runtimeMode = this.facade.runtimeMode;
  readonly saveState = this.facade.saveState;
  readonly primaryClickBehaviour = this.facade.primaryClickBehaviour;
  readonly topDependencySource = this.facade.topDependencySource;
  readonly showPreviewColumnDropdown = this.facade.showPreviewColumnDropdown;
  readonly selectedEnvironmentId = this.facade.selectedEnvironmentId;
  readonly customDomain = this.facade.customDomain;
  readonly basePath = this.facade.basePath;
  readonly mobileLeftHeaderOptions = this.facade.mobileLeftHeaderOptions;
  readonly mobileRightHeaderOptions = this.facade.mobileRightHeaderOptions;
  readonly primaryPages = this.facade.primaryPages;
  readonly leftPageGroups = this.facade.leftPageGroups;
  readonly topPageGroups = this.facade.topPageGroups;
  readonly footerOptions = this.facade.footerOptions;
  readonly leftFooterButtons = this.facade.leftFooterButtons;
  readonly rightFooterButtons = this.facade.rightFooterButtons;
  readonly workspaceTypes = this.facade.workspaceTypes;
  readonly environments = this.facade.environments;
  readonly activeLayoutPayload = this.facade.activeLayoutPayload;
  readonly layoutJson = this.facade.layoutJson;
  readonly saveButtonLabel = this.facade.saveButtonLabel;
  readonly runtimeTitle = this.facade.runtimeTitle;
  readonly runtimeEyebrow = this.facade.runtimeEyebrow;
  readonly runtimeLeftFooterButtons = this.facade.runtimeLeftFooterButtons;
  readonly runtimeRightFooterButtons = this.facade.runtimeRightFooterButtons;
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

  readonly setPrimaryClickBehaviour = this.facade.setPrimaryClickBehaviour.bind(this.facade);
  readonly areOtherPageSelectorsEnabled = this.facade.areOtherPageSelectorsEnabled.bind(this.facade);
  readonly isLeftSelectorEnabled = this.facade.isLeftSelectorEnabled.bind(this.facade);
  readonly setTopDependencySource = this.facade.setTopDependencySource.bind(this.facade);
  readonly addPrimaryPage = this.facade.addPrimaryPage.bind(this.facade);
  readonly removePrimaryPage = this.facade.removePrimaryPage.bind(this.facade);
  readonly renamePrimaryPage = this.facade.renamePrimaryPage.bind(this.facade);
  readonly reorderPrimaryPages = this.facade.reorderPrimaryPages.bind(this.facade);
  readonly reorderLeftPages = this.facade.reorderLeftPages.bind(this.facade);
  readonly reorderLeftSubPages = this.facade.reorderLeftSubPages.bind(this.facade);
  readonly addLeftPage = this.facade.addLeftPage.bind(this.facade);
  readonly renameLeftPage = this.facade.renameLeftPage.bind(this.facade);
  readonly removeLeftPage = this.facade.removeLeftPage.bind(this.facade);
  readonly addLeftSubPage = this.facade.addLeftSubPage.bind(this.facade);
  readonly renameLeftSubPage = this.facade.renameLeftSubPage.bind(this.facade);
  readonly removeLeftSubPage = this.facade.removeLeftSubPage.bind(this.facade);
  readonly addTopTabPage = this.facade.addTopTabPage.bind(this.facade);
  readonly renameTopTabPage = this.facade.renameTopTabPage.bind(this.facade);
  readonly removeTopTabPage = this.facade.removeTopTabPage.bind(this.facade);
  readonly toggleMobileHeaderOption = this.facade.toggleMobileHeaderOption.bind(this.facade);
  readonly toggleFooterOption = this.facade.toggleFooterOption.bind(this.facade);
  readonly selectWorkspaceType = this.facade.selectWorkspaceType.bind(this.facade);
  readonly selectEnvironment = this.facade.selectEnvironment.bind(this.facade);
  readonly updateCustomDomain = this.facade.updateCustomDomain.bind(this.facade);
  readonly updateBasePath = this.facade.updateBasePath.bind(this.facade);
  readonly addFooterButton = this.facade.addFooterButton.bind(this.facade);
  readonly renameFooterButton = this.facade.renameFooterButton.bind(this.facade);
  readonly removeFooterButton = this.facade.removeFooterButton.bind(this.facade);
  readonly openDeployedApp = this.facade.openDeployedApp.bind(this.facade);
  readonly closePreview = this.facade.closePreview.bind(this.facade);
  readonly selectPreviewLeftPage = this.facade.selectPreviewLeftPage.bind(this.facade);
  readonly selectPreviewSubPage = this.facade.selectPreviewSubPage.bind(this.facade);
  readonly selectPreviewTopTab = this.facade.selectPreviewTopTab.bind(this.facade);
  readonly togglePreviewColumnDropdown = this.facade.togglePreviewColumnDropdown.bind(this.facade);
  readonly togglePreviewFiltersPanel = this.facade.togglePreviewFiltersPanel.bind(this.facade);
  readonly closePreviewFiltersPanel = this.facade.closePreviewFiltersPanel.bind(this.facade);
  readonly togglePreviewSortPanel = this.facade.togglePreviewSortPanel.bind(this.facade);
  readonly closePreviewSortPanel = this.facade.closePreviewSortPanel.bind(this.facade);
  readonly openPreviewEmployeeModal = this.facade.openPreviewEmployeeModal.bind(this.facade);
  readonly closePreviewEmployeeModal = this.facade.closePreviewEmployeeModal.bind(this.facade);

  // ── Page target configuration ──────────────────────────────────────────────
  readonly pageTargets = this.facade.pageTargets;
  readonly topTabPagesBySourceId = this.facade.topTabPagesBySourceId;
  readonly openConfigPageId = this.facade.openConfigPageId;
  readonly activeShowcaseReports = this.facade.activeShowcaseReports;
  readonly activeShowcasePages = this.facade.activeShowcasePages;
  readonly activeShowcaseForms = this.facade.activeShowcaseForms;
  readonly pageTargetLabels = this.facade.pageTargetLabels;
  readonly currentPageTargetType = this.facade.currentPageTargetType;
  readonly currentPageTargetName = this.facade.currentPageTargetName;
  readonly currentPageWidgets = this.facade.currentPageWidgets;
  readonly currentPageCanvasHeight = this.facade.currentPageCanvasHeight;
  readonly currentTargetForm = this.facade.currentTargetForm;

  readonly setPageTarget = this.facade.setPageTarget.bind(this.facade);
  readonly clearPageTarget = this.facade.clearPageTarget.bind(this.facade);
  readonly togglePageConfig = this.facade.togglePageConfig.bind(this.facade);
  readonly closePageConfig = this.facade.closePageConfig.bind(this.facade);

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
  /** 'contains' = Search button (partial match across all cells)
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

  // ── Native scroll-collapse engine ───────────────────────────────────────────
  // Transforms are applied directly to the DOM inside a requestAnimationFrame
  // loop, driven by a passive scroll listener running OUTSIDE the Angular zone.
  // Nothing here triggers change detection per frame — the chrome is glued to
  // the finger via GPU translate3d. Only the rare boolean states below flip
  // Angular signals (and only when they actually change).
  private scrollEl?: HTMLElement;
  private chromeEl?: HTMLElement;
  private chromeHeightPx = 0;
  private latestScrollTop = 0;
  private rafId: number | null = null;

  /** Mostly-expanded gate for secondary chrome (left selector, action panels). */
  readonly mobileNavVisible = signal(true);
  /** Full data mode: chrome fully collapsed — hide the bottom nav for an
   *  immersive, distraction-free data view. */
  readonly fullDataMode = signal(false);

  // ── Row virtualization (windowed rendering) ─────────────────────────────────
  // Only the rows in the current viewport (+ buffer) are ever in the DOM. The
  // total scroll height is preserved with top/bottom spacer rows. Driven by the
  // same rAF loop as the chrome collapse — constant ~30 DOM rows for any dataset
  // size (20k+), so scrolling stays at 60fps.
  @ViewChild('tableScroll') private tableScrollRef?: ElementRef<HTMLElement>;
  readonly rowHeight = signal(32);
  readonly renderStart = signal(0);
  readonly renderEnd = signal(40);
  private tableBodyTop = 0;
  private rowMeasured = false;
  private readonly RENDER_BUFFER = 12;

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
    this.renderStart.set(0);
    this.renderEnd.set(40);
    this.rowMeasured = false;
    const el = this.scrollEl;
    if (el && el.scrollTop > 0) el.scrollTop = 0;
  });
  @ViewChild('scrollContainer') private scrollContainerRef?: ElementRef<HTMLElement>;
  @ViewChild('controlsWrap') private controlsWrapRef?: ElementRef<HTMLElement>;
  private resizeObs?: ResizeObserver;
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

  readonly previewPages = this.facade.mobilePreviewPages;
  readonly bottomNavItems = this.facade.mobileBottomNavItems;
  readonly mobilePreviewCallouts = this.facade.mobilePreviewCallouts;

  readonly mobilePreviewTitle = computed(
    () =>
      this.selectedPreviewTopTab()?.label ??
      this.selectedPreviewSubPage()?.label ??
      this.selectedPreviewLeftPage()?.label ??
      this.selectedPreviewPrimaryPage()?.label ??
      'Dashboard'
  );

  readonly mobilePopupSubPages = computed(() => {
    const openPageId = this.openMobileSubmenuPageId();

    if (!openPageId) {
      return [];
    }

    return this.mobileLeftPageOptions().find((page) => page.id === openPageId)?.subPages ?? [];
  });

  readonly mobileTopPageOptions = computed(() => this.previewTopTabs());

  readonly mobileLeftPageOptions = computed(() => this.previewNavigationPages());

  readonly mobilePreviewMetrics = computed<MobilePreviewMetric[]>(() => {
    const dataset = this.previewDataset();
    const columns = dataset.columns;
    const rows = dataset.rows;
    const getColumn = (name: string) => columns.indexOf(name);
    const sumColumn = (name: string) => {
      const index = getColumn(name);

      if (index < 0) {
        return 0;
      }

      return rows.reduce((total, row) => total + Number.parseFloat(row[index] || '0'), 0);
    };
    const countColumnValue = (name: string, values: string[]) => {
      const index = getColumn(name);

      if (index < 0) {
        return 0;
      }

      return rows.filter((row) => values.includes(row[index])).length;
    };
    const uniqueColumnCount = (name: string) => {
      const index = getColumn(name);

      if (index < 0) {
        return 0;
      }

      return new Set(rows.map((row) => row[index]).filter(Boolean)).size;
    };

    if (columns.includes('Present')) {
      return [
        { value: String(sumColumn('Present')), label: 'Present' },
        { value: String(sumColumn('Absent')), label: 'Absent' },
        { value: `${Math.round(sumColumn('Coverage') / Math.max(rows.length, 1))}%`, label: 'Avg Coverage' },
      ];
    }

    if (columns.includes('Score')) {
      return [
        { value: String(Math.round(sumColumn('Score') / Math.max(rows.length, 1))), label: 'Avg Score' },
        { value: String(rows.length), label: 'Reviewed' },
        { value: String(uniqueColumnCount('Band')), label: 'Bands' },
      ];
    }

    if (columns.includes('Candidate')) {
      return [
        { value: String(rows.length), label: 'Candidates' },
        { value: String(countColumnValue('Status', ['Ready'])), label: 'Ready' },
        { value: String(countColumnValue('Status', ['Pending', 'In Progress'])), label: 'In Progress' },
      ];
    }

    if (columns.includes('Request')) {
      return [
        { value: String(rows.length), label: 'Requests' },
        { value: String(countColumnValue('Status', ['Approved'])), label: 'Approved' },
        { value: String(countColumnValue('Status', ['Pending', 'Review'])), label: 'Needs Review' },
      ];
    }

    if (columns.includes('Employee')) {
      return [
        { value: String(rows.length), label: 'Employees' },
        { value: String(uniqueColumnCount('Team')), label: 'Teams' },
        { value: String(countColumnValue('Status', ['Active'])), label: 'Active' },
      ];
    }

    if (columns.includes('Lead Id')) {
      return [
        { value: String(rows.length), label: 'Leads' },
        { value: String(uniqueColumnCount('Stage')), label: 'Stages' },
        { value: String(uniqueColumnCount('Owner')), label: 'Owners' },
      ];
    }

    if (columns.includes('Conversion')) {
      return [
        { value: String(sumColumn('Count')), label: 'Total' },
        { value: String(rows.length), label: 'Stages' },
        { value: `${Math.round(sumColumn('Conversion') / Math.max(rows.length, 1))}%`, label: 'Avg Conv.' },
      ];
    }

    if (columns.includes('Report')) {
      return [
        { value: String(rows.length), label: 'Reports' },
        { value: String(sumColumn('Users')), label: 'Users' },
        { value: String(countColumnValue('Trend', ['Up'])), label: 'Up Trend' },
      ];
    }

    if (columns.includes('Field')) {
      return [
        { value: String(rows.length), label: 'Fields' },
        { value: String(countColumnValue('Required', ['Yes'])), label: 'Required' },
        { value: String(uniqueColumnCount('Section')), label: 'Sections' },
      ];
    }

    return [
      { value: String(rows.length), label: 'Records' },
      { value: String(columns.length), label: 'Fields' },
      { value: String(uniqueColumnCount('Status')), label: 'Statuses' },
    ];
  });

  // ── Column-aware filters & sort ────────────────────────────────────────────
  readonly filterRows = signal<{ id: string; column: string; operator: string; value: string }[]>([]);
  readonly appliedFilterRows = signal<{ id: string; column: string; operator: string; value: string }[]>([]);
  readonly sortRows = signal<{ id: string; column: string; direction: 'asc' | 'desc' }[]>([]);
  readonly appliedSortRows = signal<{ id: string; column: string; direction: 'asc' | 'desc' }[]>([]);

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
        if (type === 'number') {
          cmp = parseFloat(av) - parseFloat(bv);
        } else if (type === 'date') {
          cmp = new Date(av).getTime() - new Date(bv).getTime();
        } else {
          cmp = av.localeCompare(bv, undefined, { sensitivity: 'base' });
        }
        if (cmp !== 0) return sort.direction === 'asc' ? cmp : -cmp;
      }
      return 0;
    });
  });

  readonly mobilePreviewRows = computed(() => {
    const mode = this.searchMode();
    let rows = this.sortedFilteredRows();

    if (mode === 'exact') {
      const exact = this.exactSearchValue();
      if (exact) {
        rows = rows.filter((row) => row[0]?.toLowerCase() === exact.toLowerCase());
      }
    } else {
      const query = this.mobileSearchQuery().trim().toLowerCase();
      if (query) {
        rows = rows.filter((row) => row.some((cell) => cell.toLowerCase().includes(query)));
      }
    }

    return rows;
  });

  readonly globalSearchResults = computed(() => {
    const query = this.mobileGlobalSearchQuery().trim().toLowerCase();
    if (!query) return [];
    return this.previewPrimaryPages().filter((p) => p.label.toLowerCase().includes(query));
  });

  readonly filterOperators = [
    { value: 'contains', label: 'contains' },
    { value: 'not_contains', label: 'does not contain' },
    { value: 'equals', label: 'equals' },
    { value: 'not_equals', label: 'not equals' },
    { value: 'starts_with', label: 'starts with' },
    { value: 'is_empty', label: 'is empty' },
  ];

  // ── Saved Views ────────────────────────────────────────────────────────────
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

  openMobileActionBar(): void {
    this.mobileActionBarOpen.set(true);
  }

  toggleMobileActionBar(): void {
    this.mobileExportMenuOpen.set(false);
    this.mobileActionBarOpen.update((open) => !open);
  }

  submitSearch(): void {
    // Contains search — use whatever is in the input box, partial match
    this.searchMode.set('contains');
    this.exactSearchValue.set('');
    this.mobileActionBarOpen.set(false);
  }

  selectSearchSuggestion(value: string): void {
    // Exact search — first-column must equal the suggestion exactly
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
      // Empty input — restore full dataset
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

  closeMobileExportMenu(): void {
    this.mobileExportMenuOpen.set(false);
  }

  toggleMobileAppSwitcher(): void {
    this.mobileAppSwitcherOpen.update((open) => !open);
    if (this.mobileAppSwitcherOpen()) {
      this.mobileMoreMenuOpen.set(false);
    }
  }

  closeMobileAppSwitcher(): void {
    this.mobileAppSwitcherOpen.set(false);
  }

  selectApplication(id: string): void {
    this.activeApplicationId.set(id);
  }

  toggleMobileGlobalSearch(): void {
    this.mobileGlobalSearchOpen.update((open) => !open);
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
    this.mobileProfileMenuOpen.update((open) => !open);
    if (this.mobileProfileMenuOpen()) {
      this.mobileGlobalSearchOpen.set(false);
      this.mobileGlobalSearchQuery.set('');
      this.mobileAppSwitcherOpen.set(false);
      this.mobileMoreMenuOpen.set(false);
    }
  }

  closeMobileProfileMenu(): void {
    this.mobileProfileMenuOpen.set(false);
  }

  handleSignOut(): void {
    this.isSignedIn.set(false);
    this.closeMobileProfileMenu();
  }

  handleSignIn(): void {
    this.isSignedIn.set(true);
    this.closeMobileProfileMenu();
  }

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

  closeMobileMoreMenu(): void {
    this.mobileMoreMenuOpen.set(false);
  }

  ngAfterViewInit(): void {
    // ── Wire up the native scroll-collapse engine ──────────────────────────
    this.scrollEl = this.scrollContainerRef?.nativeElement;
    this.chromeEl = this.controlsWrapRef?.nativeElement;
    if (this.chromeEl) {
      this.chromeHeightPx = this.chromeEl.offsetHeight;
      this.resizeObs = new ResizeObserver(() => {
        this.chromeHeightPx = this.chromeEl?.offsetHeight ?? 0;
        this.rowMeasured = false; // chrome height shifts the table body offset
        this.applyScroll();
      });
      this.resizeObs.observe(this.chromeEl);
      this.applyScroll();
    }
    // Passive listener + rAF, both outside Angular — zero CD per scroll frame.
    this.ngZone.runOutsideAngular(() => {
      this.scrollEl?.addEventListener('scroll', this.onScroll, { passive: true });
    });

    const el = this.tabsStripRef?.nativeElement;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    this.tabsHasRightOverflow.set(true);
    // Nudge: scroll right 15px then back to hint the strip is swipeable
    this.tabsHintTimer = setTimeout(() => {
      this.tabsNudging = true;
      el.scrollTo({ left: 15, behavior: 'smooth' });
      setTimeout(() => {
        el.scrollTo({ left: 0, behavior: 'smooth' });
        setTimeout(() => { this.tabsNudging = false; }, 600);
      }, 500);
    }, 900);
  }

  ngOnDestroy(): void {
    clearTimeout(this.tabsHintTimer);
    this.resizeObs?.disconnect();
    this.scrollEl?.removeEventListener('scroll', this.onScroll);
    if (this.rafId != null) cancelAnimationFrame(this.rafId);
  }

  onTabsScroll(event: Event): void {
    if (this.tabsNudging) return;
    const el = event.target as HTMLElement;
    const scrollLeft = el.scrollLeft;
    this.tabsHasLeftOverflow.set(scrollLeft > 4);
    this.tabsHasRightOverflow.set(scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  // ── Native scroll-collapse engine ───────────────────────────────────────────
  /** Passive scroll handler — only records position, then schedules a frame. */
  private readonly onScroll = (): void => {
    this.latestScrollTop = Math.max(0, this.scrollEl?.scrollTop ?? 0);
    if (this.rafId == null) {
      this.rafId = requestAnimationFrame(this.applyScroll);
    }
  };

  /** Runs on the animation frame (outside Angular). Maps scroll position
   *  directly to the chrome transform — collapseOffset = min(scrollTop, H). */
  private readonly applyScroll = (): void => {
    this.rafId = null;
    const scrollTop = this.latestScrollTop;
    const h = this.chromeHeightPx;
    const offset = h > 0 ? Math.min(scrollTop, h) : 0;

    // GPU-accelerated transform — direct DOM write, no Angular involved.
    if (this.chromeEl) {
      this.chromeEl.style.transform = `translate3d(0, ${-offset}px, 0)`;
      this.chromeEl.style.opacity = h > 0 ? `${1 - (offset / h) * 0.3}` : '1';
    }
    // Sticky column header rides up with the chrome, pinned at top:0 when gone.
    this.scrollEl?.style.setProperty('--table-top', `${Math.max(0, h - offset)}px`);

    // ── Compute the visible row window ─────────────────────────────────────
    if (!this.rowMeasured) this.measureTable();
    const rowH = this.rowHeight();
    const viewportH = this.scrollEl?.clientHeight ?? 0;
    const firstVisible = Math.floor((scrollTop - this.tableBodyTop) / rowH);
    const nextStart = Math.max(0, firstVisible - this.RENDER_BUFFER);
    const nextEnd = nextStart + Math.ceil(viewportH / rowH) + this.RENDER_BUFFER * 2;
    const rangeChanged = nextStart !== this.renderStart() || nextEnd !== this.renderEnd();

    // Rare boolean states — flip Angular signals only when they actually change.
    const navVisible = h === 0 ? true : offset < h * 0.5;
    const fullData = h > 0 && offset >= h - 1;
    const showTop = scrollTop > 1000 ? true : scrollTop < 500 ? false : this.showScrollTop();
    if (
      rangeChanged ||
      navVisible !== this.mobileNavVisible() ||
      fullData !== this.fullDataMode() ||
      showTop !== this.showScrollTop()
    ) {
      this.ngZone.run(() => {
        if (rangeChanged) {
          this.renderStart.set(nextStart);
          this.renderEnd.set(nextEnd);
        }
        this.mobileNavVisible.set(navVisible);
        this.fullDataMode.set(fullData);
        this.showScrollTop.set(showTop);
        if (fullData) this.closeAllActionPanels();
      });
    }
  };

  /** Measure a real row's height and the table body's offset within the scroll
   *  content. Both are needed to translate scrollTop into a row index. */
  private measureTable(): void {
    const scrollEl = this.scrollEl;
    const tableScroll = this.tableScrollRef?.nativeElement;
    if (!scrollEl || !tableScroll) return;
    const tbody = tableScroll.querySelector('tbody');
    const dataRow = tbody?.querySelector('tr:not(.mobile-app-table__spacer)') as HTMLElement | null;
    if (!tbody || !dataRow || dataRow.offsetHeight === 0) return;
    this.rowHeight.set(dataRow.offsetHeight);
    const bodyRect = tbody.getBoundingClientRect();
    const contRect = scrollEl.getBoundingClientRect();
    this.tableBodyTop = bodyRect.top - contRect.top + scrollEl.scrollTop;
    this.rowMeasured = true;
  }

  scrollToTop(): void {
    const el = this.scrollEl;
    if (!el) return;
    el.scrollTo({ top: 0, behavior: 'smooth' });
    this.showScrollTop.set(false);
    // The smooth scroll fires scroll events that drive applyScroll back to 0.
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

  openPreview(): void {
    if (!this.selectedPreviewPrimaryPage()) {
      const firstPage = this.previewPrimaryPages()[0];

      if (firstPage) {
        this.facade.selectPreviewPage(firstPage.id);
      }
    }

    this.facade.openPreview();
  }

  selectMobileSubmenuPage(id: string): void {
    this.selectPreviewSubPage(id);
    this.openMobileSubmenuPageId.set(null);
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

  readonly mobileLeftDrawerOpen = signal(false);

  openMobileLeftDrawer(): void { this.mobileLeftDrawerOpen.set(true); }
  closeMobileLeftDrawer(): void { this.mobileLeftDrawerOpen.set(false); }

  selectPreviewPage(id: string): void {
    this.facade.selectPreviewPage(id);
    this.openMobileSubmenuPageId.set(null);
    this.clearFilterState();
    if (this.mobileLeftPageOptions().length) {
      this.mobileLeftDrawerOpen.set(true);
    }
  }

  private exportFilename(): string {
    return (this.currentPageTargetName() || this.mobilePreviewTitle() || 'export')
      .trim()
      .replace(/[^a-z0-9]+/gi, '_')
      .replace(/^_+|_+$/g, '')
      .toLowerCase() || 'export';
  }

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

  // ── Filter methods ─────────────────────────────────────────────────────────
  addFilterRow(): void {
    this.filterRows.update((rows) => [
      ...rows,
      { id: crypto.randomUUID(), column: '', operator: 'contains', value: '' },
    ]);
  }

  removeFilterRow(id: string): void {
    this.filterRows.update((rows) => rows.filter((r) => r.id !== id));
  }

  updateFilterRowColumn(id: string, column: string): void {
    this.filterRows.update((rows) =>
      rows.map((r) => (r.id === id ? { ...r, column, value: '' } : r))
    );
  }

  updateFilterRowOperator(id: string, operator: string): void {
    this.filterRows.update((rows) =>
      rows.map((r) => (r.id === id ? { ...r, operator } : r))
    );
  }

  updateFilterRowValue(id: string, value: string): void {
    this.filterRows.update((rows) =>
      rows.map((r) => (r.id === id ? { ...r, value } : r))
    );
  }

  applyFilters(): void {
    this.appliedFilterRows.set([...this.filterRows()]);
    this.closePreviewFiltersPanel();
  }

  clearAllFilters(): void {
    this.filterRows.set([]);
    this.appliedFilterRows.set([]);
  }

  // ── Sort methods ───────────────────────────────────────────────────────────
  addSortRow(): void {
    this.sortRows.update((rows) => [
      ...rows,
      { id: crypto.randomUUID(), column: '', direction: 'asc' },
    ]);
  }

  removeSortRow(id: string): void {
    this.sortRows.update((rows) => rows.filter((r) => r.id !== id));
  }

  updateSortColumn(id: string, column: string): void {
    this.sortRows.update((rows) => rows.map((r) => (r.id === id ? { ...r, column } : r)));
  }

  updateSortDirection(id: string, direction: 'asc' | 'desc'): void {
    this.sortRows.update((rows) => rows.map((r) => (r.id === id ? { ...r, direction } : r)));
  }

  applySorts(): void {
    this.appliedSortRows.set([...this.sortRows()]);
    this.closePreviewSortPanel();
  }

  clearAllSorts(): void {
    this.sortRows.set([]);
    this.appliedSortRows.set([]);
  }

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

  // ── View methods ───────────────────────────────────────────────────────────
  toggleViewsDropdown(): void {
    this.viewsDropdownOpen.update((v) => !v);
  }

  closeViewsDropdown(): void {
    this.viewsDropdownOpen.set(false);
  }

  openViewBuilder(): void {
    this.viewDraftName.set('');
    this.viewDraftFilters.set([]);
    this.viewBuilderOpen.set(true);
    this.closeViewsDropdown();
  }

  closeViewBuilder(): void {
    this.viewBuilderOpen.set(false);
  }

  addViewDraftFilterRow(): void {
    this.viewDraftFilters.update((rows) => [
      ...rows,
      { id: crypto.randomUUID(), column: '', operator: 'contains', value: '' },
    ]);
  }

  removeViewDraftFilterRow(id: string): void {
    this.viewDraftFilters.update((rows) => rows.filter((r) => r.id !== id));
  }

  updateViewDraftFilterColumn(id: string, column: string): void {
    this.viewDraftFilters.update((rows) =>
      rows.map((r) => (r.id === id ? { ...r, column, value: '' } : r))
    );
  }

  updateViewDraftFilterOperator(id: string, operator: string): void {
    this.viewDraftFilters.update((rows) =>
      rows.map((r) => (r.id === id ? { ...r, operator } : r))
    );
  }

  updateViewDraftFilterValue(id: string, value: string): void {
    this.viewDraftFilters.update((rows) =>
      rows.map((r) => (r.id === id ? { ...r, value } : r))
    );
  }

  saveView(): void {
    const name = this.viewDraftName().trim();
    if (!name) return;
    const key = this.currentPageKey();
    const newView = {
      id: crypto.randomUUID(),
      name,
      filters: this.viewDraftFilters().filter(
        (f) => f.column && (f.operator === 'is_empty' || f.value.trim())
      ),
    };
    this._allPageViews.update((all) => ({
      ...all,
      [key]: [...(all[key] ?? []), newView],
    }));
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
