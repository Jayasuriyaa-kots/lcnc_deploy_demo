import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { RuntimeEngineService } from '@builder/runtime/services/runtime-engine.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { FormBuilderFacade } from '@builder/features/form-builder/facades/form-builder.facade';
import { ReportBuilderAsset, ReportBuilderFacade } from '@builder/features/report-builder/facades/report-builder.facade';
import { PageCanvasFacade } from '@builder/features/page-builder/facades/page-canvas.facade';
import { CanvasWidget } from '@builder/features/page-builder/models/page-builder-canvas.model';
import { PAGE_CANVAS_DEFAULT_WIDGETS } from '@builder/features/page-builder/data/page-canvas-default-widgets.data';
import { BrowserStorageService } from '@builder/core/services/browser-storage.service';
import {
  DEPLOYMENT_BEHAVIOUR_SETTINGS,
  DEPLOYMENT_COLOUR_TOKENS,
  DEPLOYMENT_FIELD_PERMISSIONS,
  DEPLOYMENT_MOBILE_ASSET_UPLOADS,
  DEPLOYMENT_MOBILE_BOTTOM_NAV_ITEMS,
  DEPLOYMENT_MOBILE_NAVIGATION_OPTIONS,
  DEPLOYMENT_MOBILE_PREVIEW_CALLOUTS,
  DEPLOYMENT_MOBILE_PREVIEW_PAGES,
  DEPLOYMENT_MOBILE_SETTINGS,
  DEPLOYMENT_PERMISSION_GROUPS,
  DEPLOYMENT_ROLE_TABS,
  DEPLOYMENT_ROLE_USERS,
} from '../data/deployment.mock';
import { DeploymentI18nService } from '../services/deployment-i18n.service';
import {
  type DeploymentEnvironment,
  type DeploymentRuntimeMode,
  type DeploymentSaveState,
  type DeploymentTheme,
  type DeploymentToggle,
  type FooterButton,
  type LeftPageGroup,
  type NavigationPage,
  type PageGroup,
  type PageTarget,
  type PreviewDataset,
  type PreviewFilters,
  type PreviewSortMode,
  type PreviewViewMode,
  type ShowcaseModule,
  type TopPageGroup,
  type WorkflowExecutionStep,
  type WorkspaceType,
} from '../models/deployment.models';

const SAVED_DESKTOP_LAYOUT_STORAGE_KEY = 'qo-deployment-desktop-layout-json';
const SAVED_MOBILE_LAYOUT_STORAGE_KEY = 'qo-deployment-mobile-layout-json';


const PREVIEW_IDS = {
  primaryDashboard: '9f77485d-9e67-4c90-9b13-e4fc9a271b57',
  primaryLeads: '3484c87b-2674-420d-8b59-d9159a05a88f',
  primaryFunnel: '099f6162-3aa8-4e7f-8896-af14484e6015',
  primaryAnalytics: 'ce778e1c-14d5-48f4-a967-0c314c17dfe8',
  leftEmployeePortal: '6b2fca61-21bb-4f83-bca0-0a50f7a55796',
  leftLeaveDashboard: 'd066da28-1b37-4ac3-af0d-96df493e0a41',
  leftAttendance: 'a0b1c2d3-e4f5-4567-89ab-cdef01234567',
  leftPerformance: 'b1c2d3e4-f5a6-4678-9abc-def012345678',
  leftRecruitment: 'c2d3e4f5-a6b7-4789-abcd-ef0123456789',
  leftTraining: 'd3e4f5a6-b7c8-4890-bcde-f01234567890',
  leftItSupport: 'e4f5a6b7-c8d9-4901-cdef-012345678901',
  leftTravelFinance: 'f5a6b7c8-d9e0-4012-defa-123456789012',
  leftWorkforceAnalytics: 'a6b7c8d9-e0f1-4123-efab-234567890123',
  topAttendanceSummary: '812ce0aa-6586-4418-a5b3-fcf7ea19e83a',
  topPerformanceMatrix: 'ef536f74-0461-4f0f-98d8-f2ef71b9187d',
  topAddEmployeeForm: '45039050-760d-4e27-af5c-d54a23f01174',
  topAllEmployees: '6ded45af-8300-48dc-86ef-a336b912c0f9',
  topActiveEmployees: '5a1ce465-4897-42a2-9b82-7e4dc345b9e6',
  topOnLeaveEmployees: '3dfec6ce-01d5-48f9-a3f2-08e42d9d638a',
  topNewJoiners: 'c6114011-f3c2-4904-855f-5cb7e486c476',
  tabLeaveAll: 'b7c8d9e0-f1a2-4234-89bc-345678901234',
  tabLeavePending: 'c8d9e0f1-a2b3-4345-8acd-456789012345',
  tabLeaveApproved: 'd9e0f1a2-b3c4-4456-8bde-567890123456',
  tabRecruitmentPipeline: 'e0f1a2b3-c4d5-4567-8cef-678901234567',
  tabHeadcount: 'f1a2b3c4-d5e6-4678-8dfa-789012345678',
  tabTrainingCalendar: 'a2b3c4d5-e6f7-4789-8eab-890123456789',
  tabItTickets: 'b3c4d5e6-f7a8-4890-8fbc-901234567890',
  tabTravelExpenses: 'c4d5e6f7-a8b9-4901-80cd-012345678901',
  subEmployeeRecords: '2d563d3e-0c02-4a60-a6a2-3f78fd1b1a25',
  subEmployeeOnboarding: 'f53d3f40-6d20-4c72-a0ef-273a4c5554f8',
  subEmployeesByDepartment: '85afba5f-c1d5-4a50-9896-736f5fae0372',
  subLeaveRequests: '383b45d1-78e1-4905-bc0e-6a2217a9d437',
  subLeaveCalendar: '1fd6a9c8-7849-4d7a-a59a-e4d4d893e753',
  settingsTool: '86c5d04b-64e3-4076-b2d3-87a063ba5c85',
  leftCustomFooterButton: '7e94766f-b6f7-4817-9130-2b1ebc86096e',
  leftExportFooterButton: 'f2a4ed17-7519-4474-8f31-afb019443a1b',
  rightCustomFooterButton: '5d0bbd94-9cff-4352-9609-ae05cfb6bc2d',
  productionEnvironment: 'f16cb2ea-4b8e-4592-9d1a-bd480604207a',
  stagingEnvironment: 'e48fa354-aea1-47a9-aae9-2323f6271d07',
  developmentEnvironment: '6b75dc89-4b6d-46bc-a98a-3dcbfb57fe63',
} as const;



@Injectable({ providedIn: 'root' })
export class DeploymentFacadeService {
  private readonly formBuilderFacade = inject(FormBuilderFacade);
  private readonly reportBuilderFacade = inject(ReportBuilderFacade);
  private readonly pageCanvasFacade = inject(PageCanvasFacade);
  private readonly browserStorage = inject(BrowserStorageService);
  private readonly i18n = inject(DeploymentI18nService);
  private readonly runtimeEngine = inject(RuntimeEngineService);

  readonly showPreview = signal(false);
  readonly previewFullScreen = signal(false);
  readonly runtimeMode = signal<DeploymentRuntimeMode>('preview');
  readonly saveState = signal<DeploymentSaveState>('idle');
  readonly primaryClickBehaviour = signal<'direct' | 'selectors'>('selectors');
  readonly topDependencySource = signal<'left' | 'primary'>('left');
  readonly selectedPreviewPageId = signal<string | null>(null);
  readonly selectedPreviewLeftPageId = signal<string | null>(null);
  readonly selectedPreviewSubPageId = signal<string | null>(null);
  readonly selectedPreviewTopTabId = signal<string | null>(null);
  readonly showPreviewColumnDropdown = signal(false);
  readonly showPreviewFiltersPanel = signal(false);
  readonly showPreviewSortPanel = signal(false);
  readonly showPreviewToolsPanel = signal(false);
  readonly showPreviewEmployeeModal = signal(false);
  readonly previewSortMode = signal<PreviewSortMode>('name-asc');
  readonly previewViewMode = signal<PreviewViewMode>('list');
  readonly previewSearchQuery = signal('');
  readonly previewFilters = signal<PreviewFilters>({
    activeOnly: false,
    department: '',
    joinedFrom: '',
    joinedTo: '',
    newJoinersOnly: false,
    onLeaveOnly: false,
  });
  readonly selectedEnvironmentId = signal<string>(PREVIEW_IDS.productionEnvironment);
  readonly customDomain = signal('hr.acme.co');
  readonly basePath = signal('/app');
  readonly applicationId = signal('022b5481-2e30-4f52-9d7a-16596f84349e');
  readonly appName = signal(this.runtimeEngine.branding().appName);
  readonly logoUrl = signal(this.runtimeEngine.branding().logoUrl ?? '');
  readonly theme = signal<DeploymentTheme>(this.runtimeEngine.theme() as DeploymentTheme);
  readonly mockDatasets = signal<Record<string, PreviewDataset>>({});
  readonly roles = signal(DEPLOYMENT_ROLE_TABS);
  readonly users = signal(DEPLOYMENT_ROLE_USERS);
  readonly permissionGroups = signal(DEPLOYMENT_PERMISSION_GROUPS);
  readonly fieldPermissions = signal(DEPLOYMENT_FIELD_PERMISSIONS);
  readonly colourTokens = signal(DEPLOYMENT_COLOUR_TOKENS);
  readonly behaviourSettings = signal(DEPLOYMENT_BEHAVIOUR_SETTINGS);
  readonly mobilePreviewPages = signal(DEPLOYMENT_MOBILE_PREVIEW_PAGES);
  readonly mobileNavigationOptions = signal(DEPLOYMENT_MOBILE_NAVIGATION_OPTIONS);
  readonly mobileSettings = signal(DEPLOYMENT_MOBILE_SETTINGS);
  readonly mobileAssetUploads = signal(DEPLOYMENT_MOBILE_ASSET_UPLOADS);
  readonly mobileBottomNavItems = signal(DEPLOYMENT_MOBILE_BOTTOM_NAV_ITEMS);
  readonly mobilePreviewCallouts = signal(DEPLOYMENT_MOBILE_PREVIEW_CALLOUTS);

  // ── Mobile header state (independent from desktop) ──────────────────────────
  readonly mobileLeftHeaderOptions = signal<DeploymentToggle[]>(this.initMobileLeftHeaderOptions());
  readonly mobileRightHeaderOptions = signal<DeploymentToggle[]>(this.initMobileRightHeaderOptions());

  readonly mobileLayoutPayload = computed(() => ({
    header: {
      leftHeader: {
        showLogo: this.isMobileHeaderOptionChecked('left', 'logo'),
        showAppName: this.isMobileHeaderOptionChecked('left', 'app-name'),
        showAppSwitcher: this.isMobileHeaderOptionChecked('left', 'switcher'),
      },
      rightHeader: {
        showAdd: this.isMobileHeaderOptionChecked('right', 'add-button'),
        showGlobalSearch: this.isMobileHeaderOptionChecked('right', 'global-search'),
        showKnowledgeBase: this.isMobileHeaderOptionChecked('right', 'knowledge-base'),
        showNotifications: this.isMobileHeaderOptionChecked('right', 'notifications'),
        showAppSettings: this.isMobileHeaderOptionChecked('right', 'app-settings'),
        showAccountSettings: this.isMobileHeaderOptionChecked('right', 'account-settings'),
      },
    },
  }));

  readonly savedMobileLayoutPayload = signal<ReturnType<DeploymentFacadeService['mobileLayoutPayload']> | null>(
    this.readSavedMobileLayoutPayload()
  );

  // ── Page target state ──────────────────────────────────────────────────────
  readonly pageTargets = signal<Record<string, PageTarget>>(this.readSavedPageTargets());
  readonly openConfigPageId = signal<string | null>(null);

  // ── Showcase state ──────────────────────────────────────────────────────────
  readonly showcasePanelOpen = signal(false);
  readonly showcaseActiveModule = signal<ShowcaseModule>('forms');

  // ── Form runtime state ─────────────────────────────────────────────────────
  readonly selectedShowcaseFormId = signal<string | null>(null);
  readonly showFormRuntimeModal = signal(false);
  readonly formRuntimeValues = signal<Record<string, string>>({});
  readonly formRuntimeErrors = signal<Record<string, string>>({});
  readonly formRuntimeSubmitting = signal(false);

  // ── Workflow execution state ───────────────────────────────────────────────
  readonly workflowExecutionOpen = signal(false);
  readonly workflowExecutionSteps = signal<WorkflowExecutionStep[]>([]);
  readonly workflowExecutionCurrentStep = signal(-1);
  readonly workflowExecutionComplete = signal(false);
  readonly workflowExecutionFormName = signal('');

  // ── Showcase computed ──────────────────────────────────────────────────────
  readonly showcaseForms = computed(() => this.formBuilderFacade.forms());
  readonly showcaseReports = computed(() => this.reportBuilderFacade.reports());
  readonly showcasePages = computed(() => this.pageCanvasFacade.pages());
  readonly selectedShowcaseForm = computed(() => {
    const id = this.selectedShowcaseFormId();
    return id ? this.showcaseForms().find((f) => f.id === id) ?? null : null;
  });

  // ── Page target computed ───────────────────────────────────────────────────
  readonly activeShowcaseReports = computed(() =>
    this.reportBuilderFacade.reports().filter((r) => r.status === 'live')
  );
  readonly activeShowcasePages = computed(() =>
    this.pageCanvasFacade.pages().filter((p) => p.status === 'live')
  );
  readonly activeShowcaseForms = computed(() =>
    this.formBuilderFacade.forms().filter((f) => f.status === 'live')
  );
  readonly pageTargetLabels = computed<Record<string, string>>(() => {
    const targets = this.pageTargets();
    const reports = this.reportBuilderFacade.reports();
    const pages = this.pageCanvasFacade.pages();
    const forms = this.formBuilderFacade.forms();
    return Object.fromEntries(
      Object.entries(targets).map(([pageId, target]) => {
        let name = '';
        if (target.assetType === 'report') {
          name = reports.find((r) => r.id === target.assetId)?.name ?? '';
        } else if (target.assetType === 'page') {
          name = pages.find((p) => p.id === target.assetId)?.name ?? '';
        } else if (target.assetType === 'form') {
          name = forms.find((f) => f.id === target.assetId)?.name ?? '';
        }
        return [pageId, name];
      })
    );
  });
  readonly currentPageTarget = computed<PageTarget | null>(() => {
    const targets = this.pageTargets();
    const leftId = this.selectedPreviewLeftPage()?.id;
    const primaryId = this.selectedPreviewPrimaryPage()?.id;

    // If the left or primary page is explicitly a canvas page, it wins over tabs —
    // tabs are sub-navigation within report views, not overrides for canvas pages.
    const leftTarget = leftId ? targets[leftId] : null;
    if (leftTarget?.assetType === 'page') return leftTarget;
    const primaryTarget = primaryId ? targets[primaryId] : null;
    if (primaryTarget?.assetType === 'page') return primaryTarget;

    const candidates = [
      this.selectedPreviewTopTab()?.id,
      this.selectedPreviewSubPage()?.id,
      leftId,
      primaryId,
    ];
    for (const id of candidates) {
      if (id && targets[id]) return targets[id];
    }
    return null;
  });
  readonly currentPageTargetType = computed(() => this.currentPageTarget()?.assetType ?? null);
  readonly currentPageTargetName = computed(() => {
    const target = this.currentPageTarget();
    if (!target) return '';
    if (target.assetType === 'report') {
      return this.reportBuilderFacade.reports().find((r) => r.id === target.assetId)?.name ?? '';
    }
    if (target.assetType === 'page') {
      return this.pageCanvasFacade.pages().find((p) => p.id === target.assetId)?.name ?? '';
    }
    if (target.assetType === 'form') {
      return this.formBuilderFacade.forms().find((f) => f.id === target.assetId)?.name ?? '';
    }
    return '';
  });
  readonly currentTargetForm = computed(() => {
    const target = this.currentPageTarget();
    if (target?.assetType !== 'form') return null;
    return this.formBuilderFacade.forms().find((f) => f.id === target.assetId) ?? null;
  });
  private readonly pageContentRevision = signal(0);
  readonly currentPageWidgets = computed<CanvasWidget[]>(() => {
    this.pageContentRevision();
    const target = this.currentPageTarget();
    if (target?.assetType !== 'page') return [];

    const published = this.browserStorage.getJson<CanvasWidget[]>(`page-builder-published-widgets:${target.assetId}`);
    const draft = this.browserStorage.getJson<CanvasWidget[]>(`page-builder-draft-widgets:${target.assetId}`);
    const seeds = PAGE_CANVAS_DEFAULT_WIDGETS[target.assetId] ?? [];

    // A stored set is "stale" if it's a strict subset of the current seeds
    // (missing widgets added to seeds after the set was saved). In that case
    // fall through to seeds so new seed widgets always appear in the preview.
    const seedIds = new Set(seeds.map((w) => w.id));
    const isStaleSubset = (widgets: CanvasWidget[]): boolean =>
      widgets.length < seeds.length && widgets.every((w) => seedIds.has(w.id));

    const resolve = (primary: CanvasWidget[] | null, fallback: CanvasWidget[]): CanvasWidget[] => {
      if (!Array.isArray(primary) || !primary.length) return fallback;
      return isStaleSubset(primary) ? fallback : primary;
    };

    if (this.runtimeMode() === 'deployed') {
      return resolve(published, resolve(draft, seeds));
    }

    return resolve(draft, resolve(published, seeds));
  });
  readonly currentPageCanvasHeight = computed(() => {
    const widgets = this.currentPageWidgets();
    if (!widgets.length) return 300;
    return Math.max(...widgets.map((w: CanvasWidget) => w.y + w.height)) + 32;
  });

  private nextPrimaryPageNumber = 1;
  private nextLeftPageNumber = 1;
  private nextSubPageNumber = 1;
  private nextTopTabPageNumber = 1;

  readonly leftHeaderOptions = signal<DeploymentToggle[]>([
    { id: 'logo', label: 'Show Logo', checked: true },
    { id: 'app-name', label: 'Show App Name', checked: true },
    { id: 'switcher', label: 'Application Switcher', checked: true },
  ]);

  readonly rightHeaderOptions = signal<DeploymentToggle[]>([
    { id: 'add-button', label: '+ Add Button', checked: true },
    { id: 'global-search', label: 'Global Search', checked: true },
    { id: 'knowledge-base', label: 'Knowledge Base', checked: false },
    { id: 'notifications', label: 'Notifications', checked: true },
    { id: 'app-settings', label: 'App Settings', checked: true },
    { id: 'account-settings', label: 'Account Settings', checked: true },
  ]);

  readonly primaryPages = signal<NavigationPage[]>(this.runtimeEngine.primaryPages());

  readonly leftPagesByPrimaryId = signal<Record<string, NavigationPage[]>>(this.runtimeEngine.leftPagesByPrimaryId());

  readonly subPagesByLeftPageId = signal<Record<string, NavigationPage[]>>(this.runtimeEngine.subPagesByLeftPageId());

  readonly leftPageGroups = computed<PageGroup[]>(() =>
    this.primaryPages().map((page) => {
      const leftPages = this.leftPagesByPrimaryId()[page.id] ?? [];
      const subPagesByLeftPageId = this.subPagesByLeftPageId();

      return {
        main: page,
        children: leftPages.map((leftPage) => {
          const subPages = subPagesByLeftPageId[leftPage.id] ?? [];

          return {
            page: leftPage,
            subPages,
            note: subPages.length ? undefined : 'No subpages - click + Subpage to add',
          };
        }),
        note: leftPages.length ? undefined : 'No left pages - click + Left Page to add',
      };
    })
  );

  readonly topTabPagesBySourceId = signal<Record<string, NavigationPage[]>>(this.runtimeEngine.topTabPagesBySourceId());

  readonly topPageGroups = computed<TopPageGroup[]>(() => {
    const sourcePages =
      this.topDependencySource() === 'left'
        ? this.leftPageGroups().flatMap((group) =>
            group.children.flatMap((leftPageGroup) =>
              leftPageGroup.subPages.length ? leftPageGroup.subPages : [leftPageGroup.page]
            )
          )
        : this.primaryPages();
    const tabPagesBySourceId = this.topTabPagesBySourceId();

    return sourcePages.map((source) => ({
      source,
      tabs: tabPagesBySourceId[source.id] ?? [],
    }));
  });

  readonly footerOptions = signal<DeploymentToggle[]>([
    { id: 'records', label: 'Total Records Count', checked: true },
    { id: 'pagination', label: 'Pagination (53/100)', checked: true },
    { id: 'columns', label: 'Column Dropdown', checked: true },
    { id: 'function-type', label: 'Function Type', checked: true },
    { id: 'numeric-display', label: 'Numeric Display', checked: true },
  ]);
  readonly leftFooterButtons = signal<FooterButton[]>([
    { id: PREVIEW_IDS.leftCustomFooterButton, label: 'Custom', type: 'custom' },
    { id: PREVIEW_IDS.leftExportFooterButton, label: 'Export', type: 'export' },
  ]);
  readonly rightFooterButtons = signal<FooterButton[]>([
    { id: PREVIEW_IDS.rightCustomFooterButton, label: 'Custom', type: 'custom' },
  ]);

  readonly workspaceTypes = signal<WorkspaceType[]>([
    {
      id: 'form',
      title: 'Form Type',
      icon: 'assignment',
      description: 'Enter data into forms and submit to database. Save, draft, clear, and submit actions.',
      active: false,
    },
    {
      id: 'report',
      title: 'Report Type',
      icon: 'insert_chart',
      description: 'View datasource records in card or list view. Supports custom views and action buttons.',
      active: true,
    },
    {
      id: 'custom',
      title: 'Custom Page Type',
      icon: 'web_asset',
      description: 'Mix forms, reports, and custom elements freely. Enables all optional sections.',
      active: false,
    },
  ]);

  readonly environments = signal<DeploymentEnvironment[]>([
    { id: PREVIEW_IDS.productionEnvironment, name: 'Production', url: 'hr.acme.co', status: 'Live', users: '127 users' },
    { id: PREVIEW_IDS.stagingEnvironment, name: 'Staging', url: 'staging.hr.acme.co', status: 'Testing', users: '8 users' },
    { id: PREVIEW_IDS.developmentEnvironment, name: 'Development', url: 'dev.hr.acme.co', status: 'In progress', users: '3 users' },
  ]);

  readonly layoutPayload = computed(() => ({
    layout: {
      applicationId: this.applicationId(),
      appName: this.appName(),
      footer: {
        centerFooter: {
          enabled: true,
          showColumnDropdown: this.isFooterOptionChecked('columns'),
          showPagination: this.isFooterOptionChecked('pagination'),
          showRecordCount: this.isFooterOptionChecked('records'),
        },
        enabled: true,
        leftFooter: {
          buttons: this.leftFooterButtons().map((button, index) => ({
            id: button.id,
            label: button.label,
            order: index,
            type: button.type,
          })),
          enabled: this.leftFooterButtons().length > 0,
        },
        rightFooter: {
          buttons: this.rightFooterButtons().map((button, index) => ({
            id: button.id,
            label: button.label,
            order: index,
            type: button.type,
          })),
          enabled: this.rightFooterButtons().length > 0,
        },
      },
      header: {
        enabled: true,
        leftHeader: {
          logoUrl: this.logoUrl(),
          showAppName: this.isHeaderOptionChecked('left', 'app-name'),
          showAppSwitcher: this.isHeaderOptionChecked('left', 'switcher'),
          showLogo: this.isHeaderOptionChecked('left', 'logo'),
        },
        rightHeader: {
          showAccountSettings: this.isHeaderOptionChecked('right', 'account-settings'),
          showAdd: this.isHeaderOptionChecked('right', 'add-button'),
          showAppSettings: this.isHeaderOptionChecked('right', 'app-settings'),
          showGlobalSearch: this.isHeaderOptionChecked('right', 'global-search'),
          showKnowledgeBase: this.isHeaderOptionChecked('right', 'knowledge-base'),
          showNotifications: this.isHeaderOptionChecked('right', 'notifications'),
        },
      },
      leftPageSelector: {
        dependsOn: 'primary_page_selector',
        enabled: this.areOtherPageSelectorsEnabled(),
        pages: this.leftPageGroups().map((group, index) => ({
          dependencyType: group.children.length ? 'page_selector' : 'direct_page',
          icon: group.main.icon,
          id: group.main.id,
          label: group.main.label,
          order: index,
          parentButtonId: '',
          subPages: group.children.map((child, childIndex) => ({
            id: child.page.id,
            label: child.page.label,
            order: childIndex,
            parentPageId: group.main.id,
            subPages: child.subPages.map((subPage, subPageIndex) => ({
              id: subPage.id,
              label: subPage.label,
              order: subPageIndex,
              parentPageId: child.page.id,
            })),
          })),
          targetPageId: group.main.id,
        })),
      },
      primaryPageSelector: {
        buttons: this.primaryPages().map((page, index) => ({
          dependencyType: this.primaryClickBehaviour() === 'direct' ? 'direct_page' : 'page_selector',
          icon: page.icon,
          id: page.id,
          label: page.label,
          order: index,
          ...(this.primaryClickBehaviour() === 'direct'
            ? { targetPageId: page.id }
            : {}),
        })),
        enabled: true,
      },
      rightSecondaryTool: {
        attributeMenuItems: [],
        collapsed: false,
        collapsible: true,
        dependsOn: 'right_tool_selector',
        enabled: true,
        showAttributeMenu: true,
        tools: [],
      },
      rightToolSelector: {
        collapsed: false,
        collapsible: true,
        dependencyType: 'direct_tool',
        enabled: true,
        tools: [{ icon: 'settings', id: PREVIEW_IDS.settingsTool, label: 'Settings', order: 0 }],
      },
      theme: this.theme(),
      topActionBar: {
        customButtons: [],
        enabled: true,
        prebuiltButtons: {
          showFilter: true,
          showSearch: true,
          showSort: true,
          showViewsDropdown: false,
        },
      },
      topPageSelector: {
        dependsOn: this.topDependencySource() === 'left' ? 'left_page_selector' : 'primary_page_selector',
        enabled: true,
        pages: this.topPageGroups().map((group, index) => ({
          id: group.source.id,
          label: group.source.label,
          order: index,
          parentButtonId: '',
          tabPages: group.tabs.map((tab, tabIndex) => ({
            id: tab.id,
            label: tab.label,
            order: tabIndex,
            parentPageId: group.source.id,
          })),
        })),
      },
      workspace: {
        defaultType: this.workspaceTypes().find((type) => type.active)?.id ?? 'report',
        scrollDirection: 'both',
      },
      mockData: {
        datasets: this.mockDatasets(),
      },
      pageTargets: this.pageTargets(),
      environment: {
        basePath: this.basePath(),
        customDomain: this.customDomain(),
        selectedEnvironmentId: this.selectedEnvironmentId(),
        environments: this.environments().map((environment, index) => ({
          id: environment.id,
          name: environment.name,
          order: index,
          selected: environment.id === this.selectedEnvironmentId(),
          status: environment.status,
          url: environment.url,
          users: environment.users,
        })),
      },
    },
    message: 'Layout configuration updated successfully',
    success: true,
  }));

  readonly savedLayoutPayload = signal<ReturnType<DeploymentFacadeService['layoutPayload']> | null>(
    this.readSavedLayoutPayload()
  );
  readonly activeLayoutPayload = computed(() => {
    if (this.runtimeMode() === 'deployed') {
      return this.savedLayoutPayload() ?? this.layoutPayload();
    }

    return this.layoutPayload();
  });
  readonly layoutJson = computed(() => JSON.stringify(this.layoutPayload(), null, 2));
  readonly savedLayoutJson = computed(() =>
    JSON.stringify(this.savedLayoutPayload() ?? this.layoutPayload(), null, 2)
  );
  readonly saveButtonLabel = computed(() => {
    const state = this.saveState();
    if (state === 'saving') return this.i18n.t('save.saving');
    if (state === 'saved') return this.i18n.t('save.saved');
    return this.i18n.t('save.saveAndDeploy');
  });
  readonly runtimeTitle = computed(() =>
    this.runtimeMode() === 'deployed'
      ? this.i18n.t('runtime.deployedTitle')
      : this.i18n.t('runtime.previewTitle')
  );
  readonly runtimeEyebrow = computed(() =>
    this.runtimeMode() === 'deployed'
      ? this.i18n.t('runtime.deployedEyebrow')
      : this.i18n.t('runtime.previewEyebrow')
  );
  readonly runtimeLeftFooterButtons = computed(() =>
    this.activeLayoutPayload().layout.footer.leftFooter.buttons.map((button) => ({
      id: button.id,
      label: button.label,
      type: button.type,
    }))
  );
  readonly runtimeRightFooterButtons = computed(() =>
    this.activeLayoutPayload().layout.footer.rightFooter.buttons.map((button) => ({
      id: button.id,
      label: button.label,
      type: button.type,
    }))
  );
  readonly previewPrimaryPages = computed(() => {
    const buttons = this.activeLayoutPayload().layout.primaryPageSelector.buttons;

    return buttons.map((button) => ({
      ...button,
      parentButtonId: '',
      subPages: [],
    }));
  });
  readonly selectedPreviewPrimaryPage = computed(() => {
    const pages = this.previewPrimaryPages();
    const selectedId = this.selectedPreviewPageId();

    return pages.find((page) => page.id === selectedId) ?? pages[0];
  });
  readonly previewNavigationPages = computed(() => {
    const layout = this.activeLayoutPayload().layout;

    if (!layout.leftPageSelector.enabled) {
      return [];
    }

    const primaryPageId = this.selectedPreviewPrimaryPage()?.id;
    return layout.leftPageSelector.pages.find((page) => page.id === primaryPageId)?.subPages ?? [];
  });
  readonly selectedPreviewLeftPage = computed(() => {
    const pages = this.previewNavigationPages();
    const selectedId = this.selectedPreviewLeftPageId();

    return pages.find((page) => page.id === selectedId) ?? pages[0] ?? null;
  });
  readonly previewSubPages = computed(() =>
    this.activeLayoutPayload().layout.leftPageSelector.enabled ? this.selectedPreviewLeftPage()?.subPages ?? [] : []
  );
  readonly selectedPreviewSubPage = computed(() => {
    const subPages = this.previewSubPages();
    const selectedId = this.selectedPreviewSubPageId();

    return subPages.find((subPage) => subPage.id === selectedId) ?? subPages[0];
  });
  readonly previewTopTabs = computed(() => {
    const topPageSelector = this.activeLayoutPayload().layout.topPageSelector;

    const sourceId =
      this.topDependencySource() === 'left'
        ? this.selectedPreviewSubPage()?.id ??
          this.selectedPreviewLeftPage()?.id ??
          topPageSelector.pages.find((p) => p.tabPages.length > 0)?.id
        : this.selectedPreviewPrimaryPage()?.id;

    if (!sourceId) {
      return [];
    }

    return topPageSelector.pages.find((page) => page.id === sourceId)?.tabPages ?? [];
  });
  readonly selectedPreviewTopTab = computed(() => {
    const tabs = this.previewTopTabs();
    const selectedId = this.selectedPreviewTopTabId();

    return tabs.find((tab) => tab.id === selectedId) ?? tabs[0];
  });
  readonly previewDataSourceId = computed(() => {
    const selectedTopTabId = this.selectedPreviewTopTab()?.id;

    if (selectedTopTabId) {
      return selectedTopTabId;
    }

    if (this.topDependencySource() === 'left') {
      return (
        this.selectedPreviewSubPage()?.id ??
        this.selectedPreviewLeftPage()?.id ??
        this.selectedPreviewPrimaryPage()?.id ??
        'default'
      );
    }

    return this.selectedPreviewPrimaryPage()?.id ?? 'default';
  });
  readonly rawPreviewDataset = computed<PreviewDataset>(() => {
    const target = this.currentPageTarget();

    if (target?.assetType === 'report') {
      const report = this.reportBuilderFacade.reports().find((r) => r.id === target.assetId);
      if (report) return this.reportToPreviewDataset(report);
    }

    if (target?.assetType === 'page') {
      const employeeReport = this.reportBuilderFacade.reports().find((r) => r.id === 'r1');
      return employeeReport ? this.reportToPreviewDataset(employeeReport) : { columns: [], rows: [] };
    }

    // No explicit target assigned — fall back to label-based matching
    const reports = this.reportBuilderFacade.reports();
    if (!reports.length) return { columns: [], rows: [] };

    const label =
      this.selectedPreviewTopTab()?.label ??
      this.selectedPreviewSubPage()?.label ??
      this.selectedPreviewLeftPage()?.label ??
      this.selectedPreviewPrimaryPage()?.label ??
      '';

    const report = this.findReportForLabel(reports, label) ?? reports[0];
    return this.reportToPreviewDataset(report);
  });
  readonly previewDepartments = computed(() => {
    const departmentIndex = this.rawPreviewDataset().columns.indexOf('Department');

    if (departmentIndex === -1) {
      return [];
    }

    return Array.from(new Set(this.rawPreviewDataset().rows.map((row) => row[departmentIndex]).filter(Boolean)));
  });
  readonly previewDataset = computed<PreviewDataset>(() => {
    const dataset = this.rawPreviewDataset();
    const filters = this.previewFilters();
    const query = this.previewSearchQuery().trim().toLowerCase();
    const statusIndex = dataset.columns.indexOf('Status');
    const departmentIndex = dataset.columns.indexOf('Department');
    const joinedIndex = dataset.columns.indexOf('Joined');

    const rows = dataset.rows.filter((row) => {
      if (query && !row.some((cell) => this.previewCellSearchText(cell).includes(query))) {
        return false;
      }

      const selectedStatuses = [
        filters.activeOnly ? 'Active' : '',
        filters.onLeaveOnly ? 'On Leave' : '',
        filters.newJoinersOnly ? 'New Joiner' : '',
      ].filter(Boolean);

      if (selectedStatuses.length && statusIndex !== -1 && !selectedStatuses.includes(row[statusIndex])) {
        return false;
      }

      if (filters.department && departmentIndex !== -1 && row[departmentIndex] !== filters.department) {
        return false;
      }

      if (joinedIndex !== -1 && !this.isJoinedDateInRange(row[joinedIndex], filters.joinedFrom, filters.joinedTo)) {
        return false;
      }

      return true;
    });

    return { ...dataset, rows: this.sortPreviewRows(rows, dataset.columns) };
  });

  previewTabRowCount(id: string): number {
    const target = this.pageTargets()[id];
    if (target?.assetType === 'report') {
      const report = this.reportBuilderFacade.reports().find((r) => r.id === target.assetId);
      if (report) return this.reportBuilderFacade.buildPreviewRecords(report).length;
    }
    const tab = this.previewTopTabs().find((t) => t.id === id);
    if (!tab) return 0;
    const reports = this.reportBuilderFacade.reports();
    if (!reports.length) return 0;
    const report = this.findReportForLabel(reports, tab.label) ?? reports[0];
    return this.reportBuilderFacade.buildPreviewRecords(report).length;
  }
  private readonly destroyRef = inject(DestroyRef);

  setPrimaryClickBehaviour(behaviour: 'direct' | 'selectors'): void {
    this.primaryClickBehaviour.set(behaviour);
  }

  areOtherPageSelectorsEnabled(): boolean {
    return this.primaryClickBehaviour() === 'selectors';
  }

  isLeftSelectorEnabled(): boolean {
    return this.primaryClickBehaviour() === 'selectors' && this.topDependencySource() !== 'primary';
  }

  setTopDependencySource(source: 'left' | 'primary'): void {
    this.topDependencySource.set(source);
    this.selectedPreviewLeftPageId.set(null);
    this.selectedPreviewSubPageId.set(null);
    this.selectedPreviewTopTabId.set(null);
  }

  addPrimaryPage(): void {
    const id = crypto.randomUUID();
    const pageNumber = this.nextPrimaryPageNumber++;

    this.primaryPages.update((pages) => [
      ...pages,
      {
        id,
        label: `Page ${pageNumber}`,
        icon: 'web_asset',
        tone: 'green',
      },
    ]);
  }

  removePrimaryPage(id: string): void {
    this.primaryPages.update((pages) => pages.filter((page) => page.id !== id));
    const removedLeftPageIds = this.leftPagesByPrimaryId()[id]?.map((page) => page.id) ?? [];
    const removedSubPageIds = removedLeftPageIds.flatMap((leftPageId) =>
      this.subPagesByLeftPageId()[leftPageId]?.map((page) => page.id) ?? []
    );
    this.leftPagesByPrimaryId.update((leftPagesByPrimaryId) => {
      const { [id]: _removed, ...remaining } = leftPagesByPrimaryId;
      return remaining;
    });
    this.subPagesByLeftPageId.update((subPagesByLeftPageId) =>
      Object.fromEntries(
        Object.entries(subPagesByLeftPageId).filter(([leftPageId]) => !removedLeftPageIds.includes(leftPageId))
      )
    );
    this.topTabPagesBySourceId.update((tabPagesBySourceId) =>
      Object.fromEntries(
        Object.entries(tabPagesBySourceId).filter(
          ([sourceId]) =>
            sourceId !== id && !removedLeftPageIds.includes(sourceId) && !removedSubPageIds.includes(sourceId)
        )
      )
    );
  }

  renamePrimaryPage(id: string, label: string): void {
    this.primaryPages.update((pages) =>
      pages.map((page) => (page.id === id ? { ...page, label } : page))
    );
  }

  reorderPrimaryPages(event: CdkDragDrop<NavigationPage[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    this.primaryPages.update((pages) => {
      const reorderedPages = [...pages];
      moveItemInArray(reorderedPages, event.previousIndex, event.currentIndex);
      return reorderedPages;
    });
  }

  reorderLeftPages(parentId: string, event: CdkDragDrop<LeftPageGroup[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    this.leftPagesByPrimaryId.update((leftPagesByPrimaryId) => {
      const reorderedPages = [...(leftPagesByPrimaryId[parentId] ?? [])];
      moveItemInArray(reorderedPages, event.previousIndex, event.currentIndex);

      return {
        ...leftPagesByPrimaryId,
        [parentId]: reorderedPages,
      };
    });
  }

  reorderLeftSubPages(parentId: string, event: CdkDragDrop<NavigationPage[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    this.subPagesByLeftPageId.update((subPagesByLeftPageId) => {
      const reorderedSubPages = [...(subPagesByLeftPageId[parentId] ?? [])];
      moveItemInArray(reorderedSubPages, event.previousIndex, event.currentIndex);

      return {
        ...subPagesByLeftPageId,
        [parentId]: reorderedSubPages,
      };
    });
  }

  addLeftPage(parentId: string): void {
    const id = crypto.randomUUID();
    const pageNumber = this.nextLeftPageNumber++;

    this.leftPagesByPrimaryId.update((leftPagesByPrimaryId) => ({
      ...leftPagesByPrimaryId,
      [parentId]: [
        ...(leftPagesByPrimaryId[parentId] ?? []),
        {
          id,
          label: `Left Page ${pageNumber}`,
          icon: 'article',
          tone: 'purple',
        },
      ],
    }));
  }

  renameLeftPage(parentId: string, id: string, label: string): void {
    this.leftPagesByPrimaryId.update((leftPagesByPrimaryId) => ({
      ...leftPagesByPrimaryId,
      [parentId]: (leftPagesByPrimaryId[parentId] ?? []).map((page) =>
        page.id === id ? { ...page, label } : page
      ),
    }));
  }

  removeLeftPage(parentId: string, id: string): void {
    const removedSubPageIds = this.subPagesByLeftPageId()[id]?.map((page) => page.id) ?? [];

    this.leftPagesByPrimaryId.update((leftPagesByPrimaryId) => ({
      ...leftPagesByPrimaryId,
      [parentId]: (leftPagesByPrimaryId[parentId] ?? []).filter((page) => page.id !== id),
    }));
    this.subPagesByLeftPageId.update((subPagesByLeftPageId) => {
      const { [id]: _removed, ...remaining } = subPagesByLeftPageId;
      return remaining;
    });
    this.topTabPagesBySourceId.update((tabPagesBySourceId) =>
      Object.fromEntries(
        Object.entries(tabPagesBySourceId).filter(
          ([sourceId]) => sourceId !== id && !removedSubPageIds.includes(sourceId)
        )
      )
    );
  }

  addLeftSubPage(parentId: string): void {
    const id = crypto.randomUUID();
    const pageNumber = this.nextSubPageNumber++;

    this.subPagesByLeftPageId.update((subPagesByPrimaryId) => ({
      ...subPagesByPrimaryId,
      [parentId]: [
        ...(subPagesByPrimaryId[parentId] ?? []),
        {
          id,
          label: `Sub Page ${pageNumber}`,
          icon: 'article',
          tone: 'purple',
        },
      ],
    }));
  }

  renameLeftSubPage(parentId: string, id: string, label: string): void {
    this.subPagesByLeftPageId.update((subPagesByPrimaryId) => ({
      ...subPagesByPrimaryId,
      [parentId]: (subPagesByPrimaryId[parentId] ?? []).map((page) =>
        page.id === id ? { ...page, label } : page
      ),
    }));
  }

  removeLeftSubPage(parentId: string, id: string): void {
    this.subPagesByLeftPageId.update((subPagesByPrimaryId) => ({
      ...subPagesByPrimaryId,
      [parentId]: (subPagesByPrimaryId[parentId] ?? []).filter((page) => page.id !== id),
    }));
    this.topTabPagesBySourceId.update((tabPagesBySourceId) => {
      const { [id]: _removed, ...remaining } = tabPagesBySourceId;
      return remaining;
    });
  }

  addTopTabPage(sourceId: string): void {
    const id = crypto.randomUUID();
    const pageNumber = this.nextTopTabPageNumber++;

    this.topTabPagesBySourceId.update((tabPagesBySourceId) => ({
      ...tabPagesBySourceId,
      [sourceId]: [
        ...(tabPagesBySourceId[sourceId] ?? []),
        {
          id,
          label: `Tab Page ${pageNumber}`,
          icon: 'tab',
          tone: 'blue',
        },
      ],
    }));
  }

  renameTopTabPage(sourceId: string, id: string, label: string): void {
    this.topTabPagesBySourceId.update((tabPagesBySourceId) => ({
      ...tabPagesBySourceId,
      [sourceId]: (tabPagesBySourceId[sourceId] ?? []).map((page) =>
        page.id === id ? { ...page, label } : page
      ),
    }));
  }

  removeTopTabPage(sourceId: string, id: string): void {
    this.topTabPagesBySourceId.update((tabPagesBySourceId) => ({
      ...tabPagesBySourceId,
      [sourceId]: (tabPagesBySourceId[sourceId] ?? []).filter((page) => page.id !== id),
    }));
  }

  toggleHeaderOption(zone: 'left' | 'right', id: string, checked: boolean): void {
    const target = zone === 'left' ? this.leftHeaderOptions : this.rightHeaderOptions;
    target.update((options) =>
      options.map((option) => (option.id === id ? { ...option, checked } : option))
    );
  }

  isHeaderOptionChecked(zone: 'left' | 'right', id: string): boolean {
    const options = zone === 'left' ? this.leftHeaderOptions() : this.rightHeaderOptions();
    return options.find((option) => option.id === id)?.checked ?? false;
  }

  toggleFooterOption(id: string, checked: boolean): void {
    this.footerOptions.update((options) =>
      options.map((option) => (option.id === id ? { ...option, checked } : option))
    );

    if (id === 'columns' && !checked) {
      this.showPreviewColumnDropdown.set(false);
    }
  }

  isFooterOptionChecked(id: string): boolean {
    return this.footerOptions().find((option) => option.id === id)?.checked ?? false;
  }

  selectWorkspaceType(id: string): void {
    this.workspaceTypes.update((types) =>
      types.map((type) => ({
        ...type,
        active: type.id === id,
      }))
    );
  }

  selectEnvironment(id: string): void {
    this.selectedEnvironmentId.set(id);
  }

  updateCustomDomain(value: string): void {
    this.customDomain.set(value);
  }

  updateBasePath(value: string): void {
    this.basePath.set(value);
  }

  addFooterButton(zone: 'left' | 'right'): void {
    const target = zone === 'left' ? this.leftFooterButtons : this.rightFooterButtons;
    const customCount = target().filter((button) => button.type === 'custom').length + 1;

    target.update((buttons) => [
      ...buttons,
      {
        id: crypto.randomUUID(),
        label: `Custom ${customCount}`,
        type: 'custom',
      },
    ]);
  }

  renameFooterButton(zone: 'left' | 'right', id: string, label: string): void {
    const target = zone === 'left' ? this.leftFooterButtons : this.rightFooterButtons;

    target.update((buttons) =>
      buttons.map((button) => (button.id === id ? { ...button, label } : button))
    );
  }

  removeFooterButton(zone: 'left' | 'right', id: string): void {
    const target = zone === 'left' ? this.leftFooterButtons : this.rightFooterButtons;

    target.update((buttons) => buttons.filter((button) => button.id !== id));
  }

  saveDeploymentLayout(showSavingState = true): void {
    if (showSavingState) {
      this.setSaveState('saving');
    }

    const payload = this.cloneLayoutPayload(this.layoutPayload());
    this.savedLayoutPayload.set(payload);
    this.persistSavedLayoutPayload(payload);

    if (showSavingState) {
      timer(350)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.setSaveState('saved'));
    }
  }

  saveMobileDeploymentLayout(showSavingState = true): void {
    if (showSavingState) {
      this.setSaveState('saving');
    }

    const payload = JSON.parse(JSON.stringify(this.mobileLayoutPayload())) as ReturnType<DeploymentFacadeService['mobileLayoutPayload']>;
    this.savedMobileLayoutPayload.set(payload);
    this.persistSavedMobileLayoutPayload(payload);

    if (showSavingState) {
      timer(350)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.setSaveState('saved'));
    }
  }

  toggleMobileHeaderOption(zone: 'left' | 'right', id: string, checked: boolean): void {
    const target = zone === 'left' ? this.mobileLeftHeaderOptions : this.mobileRightHeaderOptions;
    target.update((options) =>
      options.map((option) => (option.id === id ? { ...option, checked } : option))
    );
  }

  isMobileHeaderOptionChecked(zone: 'left' | 'right', id: string): boolean {
    const options = zone === 'left' ? this.mobileLeftHeaderOptions() : this.mobileRightHeaderOptions();
    return options.find((option) => option.id === id)?.checked ?? false;
  }

  openPreview(): void {
    this.pageContentRevision.update((revision) => revision + 1);
    this.runtimeMode.set('preview');
    this.previewFullScreen.set(true);
    this.showPreview.set(true);
  }

  openDeployedApp(): void {
    if (!this.savedLayoutPayload()) {
      this.saveDeploymentLayout(false);
    }

    this.pageContentRevision.update((revision) => revision + 1);
    this.runtimeMode.set('deployed');
    this.previewFullScreen.set(true);
    this.showPreview.set(true);
  }

  closePreview(): void {
    this.showPreview.set(false);
    this.showPreviewEmployeeModal.set(false);
    this.runtimeMode.set('preview');
  }

  selectPreviewPage(id: string): void {
    const isSelected = this.selectedPreviewPageId() === id;

    this.selectedPreviewPageId.set(isSelected ? null : id);
    this.selectedPreviewLeftPageId.set(null);
    this.selectedPreviewSubPageId.set(null);
    this.selectedPreviewTopTabId.set(null);
    this.showPreviewColumnDropdown.set(false);
  }

  selectPreviewLeftPage(id: string): void {
    const isSelected = this.selectedPreviewLeftPageId() === id;

    this.selectedPreviewLeftPageId.set(isSelected ? null : id);
    this.selectedPreviewSubPageId.set(null);
    this.selectedPreviewTopTabId.set(null);
    this.showPreviewColumnDropdown.set(false);
  }

  selectPreviewSubPage(id: string): void {
    this.selectedPreviewSubPageId.set(id);
    this.selectedPreviewTopTabId.set(null);
    this.showPreviewColumnDropdown.set(false);
  }

  selectPreviewTopTab(id: string): void {
    this.selectedPreviewTopTabId.set(id);
    this.showPreviewColumnDropdown.set(false);
  }

  togglePreviewColumnDropdown(): void {
    this.showPreviewColumnDropdown.update((isOpen) => !isOpen);
  }

  updatePreviewSearchQuery(value: string): void {
    this.previewSearchQuery.set(value);
  }

  togglePreviewFiltersPanel(): void {
    this.showPreviewFiltersPanel.update((isOpen) => {
      const nextOpen = !isOpen;

      if (nextOpen) {
        this.showPreviewSortPanel.set(false);
        this.showcasePanelOpen.set(false);
      }

      return nextOpen;
    });
  }

  closePreviewFiltersPanel(): void {
    this.showPreviewFiltersPanel.set(false);
  }

  togglePreviewFilter(filter: 'activeOnly' | 'onLeaveOnly' | 'newJoinersOnly'): void {
    this.previewFilters.update((filters) => ({ ...filters, [filter]: !filters[filter] }));
  }

  updatePreviewDepartmentFilter(value: string): void {
    this.previewFilters.update((filters) => ({ ...filters, department: value }));
  }

  updatePreviewJoinedFilter(boundary: 'joinedFrom' | 'joinedTo', value: string): void {
    this.previewFilters.update((filters) => ({ ...filters, [boundary]: value }));
  }

  applyPreviewFilters(): void {
    this.closePreviewFiltersPanel();
  }

  setPreviewSortMode(mode: PreviewSortMode): void {
    this.previewSortMode.set(mode);
  }

  togglePreviewSortPanel(): void {
    this.showPreviewSortPanel.update((isOpen) => {
      const nextOpen = !isOpen;

      if (nextOpen) {
        this.showPreviewFiltersPanel.set(false);
        this.showcasePanelOpen.set(false);
      }

      return nextOpen;
    });
  }

  closePreviewSortPanel(): void {
    this.showPreviewSortPanel.set(false);
  }

  setPreviewViewMode(mode: PreviewViewMode): void {
    this.previewViewMode.set(mode);
  }

  togglePreviewToolsPanel(): void {
    this.showPreviewToolsPanel.update((isOpen) => {
      if (!isOpen) {
        this.showcasePanelOpen.set(false);
      }
      return !isOpen;
    });
  }

  closePreviewToolsPanel(): void {
    this.showPreviewToolsPanel.set(false);
  }

  openPreviewEmployeeModal(): void {
    this.showPreviewEmployeeModal.set(true);
    this.showPreviewFiltersPanel.set(false);
    this.showPreviewSortPanel.set(false);
    this.showPreviewToolsPanel.set(false);
  }

  closePreviewEmployeeModal(): void {
    this.showPreviewEmployeeModal.set(false);
  }

  // ── Page target configuration ──────────────────────────────────────────────

  setPageTarget(pageId: string, assetId: string, assetType: 'report' | 'page' | 'form'): void {
    this.pageTargets.update((targets) => ({ ...targets, [pageId]: { assetId, assetType } }));
    this.openConfigPageId.set(null);
  }

  clearPageTarget(pageId: string): void {
    this.pageTargets.update((targets) => {
      const { [pageId]: _removed, ...remaining } = targets;
      return remaining;
    });
  }

  togglePageConfig(pageId: string): void {
    this.openConfigPageId.update((id) => (id === pageId ? null : pageId));
  }

  closePageConfig(): void {
    this.openConfigPageId.set(null);
  }

  // ── Showcase panel ─────────────────────────────────────────────────────────

  openShowcasePanel(module: ShowcaseModule = 'forms'): void {
    this.showcaseActiveModule.set(module);
    this.showcasePanelOpen.set(true);
    this.showPreviewFiltersPanel.set(false);
    this.showPreviewSortPanel.set(false);
    this.showPreviewToolsPanel.set(false);
  }

  closeShowcasePanel(): void {
    this.showcasePanelOpen.set(false);
  }

  toggleShowcasePanel(): void {
    if (this.showcasePanelOpen()) {
      this.closeShowcasePanel();
    } else {
      this.openShowcasePanel(this.showcaseActiveModule());
    }
  }

  setShowcaseModule(module: ShowcaseModule): void {
    this.showcaseActiveModule.set(module);
  }

  // ── Form runtime ───────────────────────────────────────────────────────────

  openFormRuntime(formId: string): void {
    const form = this.showcaseForms().find((f) => f.id === formId);
    if (!form) return;

    const initial: Record<string, string> = {};
    for (const field of form.fields) {
      initial[field.id] = '';
    }

    this.selectedShowcaseFormId.set(formId);
    this.formRuntimeValues.set(initial);
    this.formRuntimeErrors.set({});
    this.formRuntimeSubmitting.set(false);
    this.showcasePanelOpen.set(false);
    this.showFormRuntimeModal.set(true);
  }

  openPrimaryForm(): void {
    const forms = this.showcaseForms();
    const addEmployee = forms.find((f) => f.name.toLowerCase().includes('employee'));
    if (addEmployee) {
      this.openFormRuntime(addEmployee.id);
    } else if (forms[0]) {
      this.openFormRuntime(forms[0].id);
    } else {
      this.openPreviewEmployeeModal();
    }
  }

  closeFormRuntime(): void {
    this.showFormRuntimeModal.set(false);
    this.formRuntimeErrors.set({});
  }

  updateFormFieldValue(fieldId: string, value: string): void {
    this.formRuntimeValues.update((vals) => ({ ...vals, [fieldId]: value }));
    if (value.trim()) {
      this.formRuntimeErrors.update((errs) => {
        const { [fieldId]: _removed, ...remaining } = errs;
        return remaining;
      });
    }
  }

  submitFormRuntime(): void {
    const form = this.selectedShowcaseForm();
    if (!form) return;

    const errors: Record<string, string> = {};
    const values = this.formRuntimeValues();

    for (const field of form.fields) {
      const isRequired = field.properties.required || field.properties.mandatory;
      if (isRequired && !values[field.id]?.trim()) {
        errors[field.id] = `${field.label} is required`;
      }
    }

    if (Object.keys(errors).length) {
      this.formRuntimeErrors.set(errors);
      return;
    }

    this.formRuntimeSubmitting.set(true);

    timer(700)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.formRuntimeSubmitting.set(false);
        this.closeFormRuntime();
        this.triggerWorkflowExecution(form.name);
      });
  }

  // ── Workflow execution ─────────────────────────────────────────────────────

  closeWorkflowExecution(): void {
    this.workflowExecutionOpen.set(false);
  }

  private triggerWorkflowExecution(formName: string): void {
    const steps = this.buildWorkflowStepsForForm(formName);
    this.workflowExecutionFormName.set(formName);
    this.workflowExecutionSteps.set(steps);
    this.workflowExecutionCurrentStep.set(-1);
    this.workflowExecutionComplete.set(false);
    this.workflowExecutionOpen.set(true);
    this.animateWorkflowStep(0, steps.length);
  }

  private buildWorkflowStepsForForm(formName: string): WorkflowExecutionStep[] {
    const lower = formName.toLowerCase();
    let labels: string[];

    if (lower.includes('employee')) {
      labels = ['Form Created', 'Create Record', 'Send Email', 'Generate PDF', 'Done'];
    } else if (lower.includes('leave')) {
      labels = ['Form Created', 'Create Record', 'Notify Manager', 'Update Calendar', 'Done'];
    } else if (lower.includes('attendance')) {
      labels = ['Form Created', 'Create Record', 'Update Report', 'Done'];
    } else if (lower.includes('performance') || lower.includes('review')) {
      labels = ['Form Created', 'Create Record', 'Notify Reviewer', 'Done'];
    } else {
      labels = ['Form Created', 'Create Record', 'Done'];
    }

    return labels.map((label, index) => ({
      id: `wf_step_${index}`,
      label,
      status: 'pending',
    }));
  }

  private animateWorkflowStep(stepIndex: number, totalSteps: number): void {
    if (stepIndex >= totalSteps) {
      this.workflowExecutionComplete.set(true);
      return;
    }

    this.workflowExecutionCurrentStep.set(stepIndex);
    this.workflowExecutionSteps.update((steps) =>
      steps.map((step, i) => (i === stepIndex ? { ...step, status: 'running' } : step))
    );

    const runDelay = 500 + Math.floor(Math.random() * 300);
    timer(runDelay)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.workflowExecutionSteps.update((steps) =>
          steps.map((step, i) => (i === stepIndex ? { ...step, status: 'complete' } : step))
        );
        timer(180)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.animateWorkflowStep(stepIndex + 1, totalSteps));
      });
  }

  private reportToPreviewDataset(report: ReportBuilderAsset): PreviewDataset {
    const records = this.reportBuilderFacade.buildPreviewRecords(report);
    const columns = report.columns.filter((col) => col.visible !== false);
    return {
      columns: columns.map((col) => col.label),
      rows: records.map((record) => columns.map((col) => record.fields[col.id] ?? '')),
    };
  }

  private findReportForLabel(reports: ReportBuilderAsset[], label: string): ReportBuilderAsset | null {
    if (!label) return null;
    const lower = label.toLowerCase();

    // Report name contains the page label as a substring
    const byNameContains = reports.find((r) => r.name.toLowerCase().includes(lower));
    if (byNameContains) return byNameContains;

    // Page label contains a meaningful word from the report name
    return (
      reports.find((r) =>
        r.name
          .toLowerCase()
          .split(' ')
          .some((word) => word.length > 3 && lower.includes(word))
      ) ?? null
    );
  }

  private previewCellSearchText(cell: string): string {
    return cell.replace(/\|/g, ' ').toLowerCase();
  }

  private sortPreviewRows(rows: string[][], columns: string[]): string[][] {
    const sortMode = this.previewSortMode();
    const employeeIndex = columns.indexOf('Employee');
    const joinedIndex = columns.indexOf('Joined');
    const departmentIndex = columns.indexOf('Department');
    const sortedRows = [...rows];

    return sortedRows.sort((a, b) => {
      if (sortMode === 'name-desc') {
        return this.previewEmployeeName(b[employeeIndex] ?? '').localeCompare(this.previewEmployeeName(a[employeeIndex] ?? ''));
      }

      if (sortMode === 'joined-desc') {
        return (
          (this.parsePreviewDate(b[joinedIndex] ?? '')?.getTime() ?? 0) -
          (this.parsePreviewDate(a[joinedIndex] ?? '')?.getTime() ?? 0)
        );
      }

      if (sortMode === 'department') {
        return (a[departmentIndex] ?? '').localeCompare(b[departmentIndex] ?? '');
      }

      return this.previewEmployeeName(a[employeeIndex] ?? '').localeCompare(this.previewEmployeeName(b[employeeIndex] ?? ''));
    });
  }

  private previewEmployeeName(value: string): string {
    return value.split('|')[0] ?? value;
  }

  private isJoinedDateInRange(value: string, from: string, to: string): boolean {
    const joinedDate = this.parsePreviewDate(value);
    const fromDate = this.parsePreviewDate(from);
    const toDate = this.parsePreviewDate(to);

    if (!joinedDate) {
      return true;
    }

    if (fromDate && joinedDate < fromDate) {
      return false;
    }

    if (toDate && joinedDate > toDate) {
      return false;
    }

    return true;
  }

  private parsePreviewDate(value: string): Date | null {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    const numericMatch = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(trimmed);
    if (numericMatch) {
      const [, day, month, year] = numericMatch;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }

    const monthMatch = /^([A-Za-z]{3})\s+(\d{4})$/.exec(trimmed);
    if (monthMatch) {
      const month = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(
        monthMatch[1].toLowerCase()
      );

      return month === -1 ? null : new Date(Number(monthMatch[2]), month, 1);
    }

    return null;
  }

  private setSaveState(state: DeploymentSaveState): void {
    this.saveState.set(state);

    if (state === 'saved') {
      timer(1800)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.saveState.set('idle'));
    }
  }

  private readSavedLayoutPayload(): ReturnType<DeploymentFacadeService['layoutPayload']> | null {
    return this.browserStorage.getJson<ReturnType<DeploymentFacadeService['layoutPayload']>>(
      SAVED_DESKTOP_LAYOUT_STORAGE_KEY
    ) ?? null;
  }

  private readSavedPageTargets(): Record<string, PageTarget> {
    const saved = this.browserStorage.getJson<{ layout?: { pageTargets?: Record<string, PageTarget> } }>(
      SAVED_DESKTOP_LAYOUT_STORAGE_KEY
    );
    // Merge: config defaults fill every nav node; explicit user assignments override them.
    return { ...this.runtimeEngine.defaultPageTargets(), ...(saved?.layout?.pageTargets ?? {}) };
  }

  private persistSavedLayoutPayload(payload: ReturnType<DeploymentFacadeService['layoutPayload']>): void {
    this.browserStorage.setJson(SAVED_DESKTOP_LAYOUT_STORAGE_KEY, payload);
  }

  private cloneLayoutPayload(payload: ReturnType<DeploymentFacadeService['layoutPayload']>): ReturnType<DeploymentFacadeService['layoutPayload']> {
    return JSON.parse(JSON.stringify(payload));
  }

  private initMobileLeftHeaderOptions(): DeploymentToggle[] {
    const saved = this.browserStorage.getJson<ReturnType<DeploymentFacadeService['mobileLayoutPayload']>>(
      SAVED_MOBILE_LAYOUT_STORAGE_KEY
    );
    const lh = saved?.header?.leftHeader;
    return [
      { id: 'logo', label: 'Show Logo', checked: lh?.showLogo ?? true },
      { id: 'app-name', label: 'Show App Name', checked: lh?.showAppName ?? true },
      { id: 'switcher', label: 'Application Switcher', checked: lh?.showAppSwitcher ?? true },
    ];
  }

  private initMobileRightHeaderOptions(): DeploymentToggle[] {
    const saved = this.browserStorage.getJson<ReturnType<DeploymentFacadeService['mobileLayoutPayload']>>(
      SAVED_MOBILE_LAYOUT_STORAGE_KEY
    );
    const rh = saved?.header?.rightHeader;
    return [
      { id: 'add-button', label: '+ Add Button', checked: rh?.showAdd ?? false },
      { id: 'global-search', label: 'Global Search', checked: rh?.showGlobalSearch ?? true },
      { id: 'knowledge-base', label: 'Knowledge Base', checked: rh?.showKnowledgeBase ?? false },
      { id: 'notifications', label: 'Notifications', checked: rh?.showNotifications ?? false },
      { id: 'app-settings', label: 'App Settings', checked: rh?.showAppSettings ?? false },
      { id: 'account-settings', label: 'Account Settings', checked: rh?.showAccountSettings ?? true },
    ];
  }

  private readSavedMobileLayoutPayload(): ReturnType<DeploymentFacadeService['mobileLayoutPayload']> | null {
    return this.browserStorage.getJson<ReturnType<DeploymentFacadeService['mobileLayoutPayload']>>(
      SAVED_MOBILE_LAYOUT_STORAGE_KEY
    ) ?? null;
  }

  private persistSavedMobileLayoutPayload(payload: ReturnType<DeploymentFacadeService['mobileLayoutPayload']>): void {
    this.browserStorage.setJson(SAVED_MOBILE_LAYOUT_STORAGE_KEY, payload);
  }
}
