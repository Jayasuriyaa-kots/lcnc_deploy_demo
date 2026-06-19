import { DragDropModule } from '@angular/cdk/drag-drop';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild, computed, inject, signal } from '@angular/core';
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
  readonly mobileAppSwitcherOpen = signal(false);
  readonly mobileNavVisible = signal(true);
  readonly mobileGlobalSearchOpen = signal(false);
  readonly mobileGlobalSearchQuery = signal('');
  readonly mobileProfileMenuOpen = signal(false);
  readonly mobileMoreMenuOpen = signal(false);
  readonly isSignedIn = signal(true);
  private lastScrollTop = 0;
  @ViewChild('scrollContainer') private scrollContainerRef?: ElementRef<HTMLElement>;
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
    const query = this.mobileSearchQuery().trim().toLowerCase();
    let rows = this.sortedFilteredRows();
    if (query) {
      rows = rows.filter((row) => row.some((cell) => cell.toLowerCase().includes(query)));
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
  }

  onTabsScroll(event: Event): void {
    if (this.tabsNudging) return;
    const el = event.target as HTMLElement;
    const scrollLeft = el.scrollLeft;
    this.tabsHasLeftOverflow.set(scrollLeft > 4);
    this.tabsHasRightOverflow.set(scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  onContentScroll(event: Event): void {
    const el = event.target as HTMLElement;
    const scrollTop = el.scrollTop;
    if (scrollTop > this.lastScrollTop && scrollTop > 180) {
      if (this.mobileNavVisible()) {
        this.mobileNavVisible.set(false);
        this.closeAllActionPanels();
      }
    } else if (scrollTop < this.lastScrollTop - 30 || scrollTop === 0) {
      if (!this.mobileNavVisible()) {
        this.mobileNavVisible.set(true);
      }
    }
    this.lastScrollTop = Math.max(0, scrollTop);
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
