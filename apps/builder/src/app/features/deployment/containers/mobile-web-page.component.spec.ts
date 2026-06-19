import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { MobileWebPageComponent } from '@builder/features/deployment/containers/mobile-web-page.component';
import { DeploymentFacadeService } from '@builder/features/deployment/facades/deployment.facade';
import { DeploymentExportService } from '@builder/features/deployment/services/deployment-export.service';

function buildFacadeMock(): Partial<DeploymentFacadeService> {
  return {
    showPreview: signal(false),
    previewFullScreen: signal(false),
    runtimeMode: signal('preview'),
    saveState: signal('idle'),
    primaryClickBehaviour: signal('selectors'),
    topDependencySource: signal('left'),
    showPreviewColumnDropdown: signal(false),
    showPreviewFiltersPanel: signal(false),
    showPreviewSortPanel: signal(false),
    selectedEnvironmentId: signal(''),
    customDomain: signal(''),
    basePath: signal(''),
    leftHeaderOptions: signal([]),
    rightHeaderOptions: signal([]),
    primaryPages: signal([]),
    leftPageGroups: signal([]),
    topPageGroups: signal([]),
    footerOptions: signal([]),
    leftFooterButtons: signal([]),
    rightFooterButtons: signal([]),
    workspaceTypes: signal([]),
    environments: signal([]),
    activeLayoutPayload: signal({ layout: { header: { leftOptions: [], rightOptions: [] }, footer: { leftFooter: { buttons: [] }, rightFooter: { buttons: [] } }, navigation: { primaryPages: [], leftPagesByPrimaryId: {}, subPagesByLeftPageId: {}, topTabPagesBySourceId: {} }, workspace: { workspaceTypes: [] }, pageTargets: {} } } as never),
    layoutJson: signal('{}'),
    saveButtonLabel: signal('Save & Deploy'),
    runtimeTitle: signal('Deployed App Layout'),
    runtimeEyebrow: signal('Preview'),
    runtimeLeftFooterButtons: signal([]),
    runtimeRightFooterButtons: signal([]),
    previewPrimaryPages: signal([]),
    selectedPreviewPrimaryPage: signal(null),
    previewNavigationPages: signal([]),
    selectedPreviewLeftPage: signal(null),
    previewSubPages: signal([]),
    selectedPreviewSubPage: signal(null),
    previewTopTabs: signal([]),
    selectedPreviewTopTab: signal(null),
    previewDataset: signal({ columns: [], rows: [] }),
    previewDepartments: signal([]),
    previewSortMode: signal('name-asc'),
    previewViewMode: signal('grid'),
    previewSearchQuery: signal(''),
    previewFilters: signal({ activeOnly: false, department: '', joinedFrom: '', joinedTo: '', newJoinersOnly: false, onLeaveOnly: false }),
    pageTargets: signal({}),
    openConfigPageId: signal(null),
    currentPageTargetType: signal(null),
    currentPageTargetName: signal(''),
    currentPageWidgets: signal([]),
    currentPageCanvasHeight: signal(300),
    currentTargetForm: signal(null),
    showcasePanelOpen: signal(false),
    showcaseActiveModule: signal('forms'),
    showcaseForms: signal([]),
    showcaseReports: signal([]),
    showcasePages: signal([]),
    selectedShowcaseForm: signal(null),
    showFormRuntimeModal: signal(false),
    formRuntimeValues: signal({}),
    formRuntimeErrors: signal({}),
    formRuntimeSubmitting: signal(false),
    workflowExecutionOpen: signal(false),
    workflowExecutionSteps: signal([]),
    workflowExecutionCurrentStep: signal(0),
    workflowExecutionComplete: signal(false),
    workflowExecutionFormName: signal(''),
    mobilePreviewPages: signal([]),
    mobileNavigationOptions: signal([]),
    mobileBottomNavItems: signal([]),
    mobileSettings: signal([]),
    mobileAssetUploads: signal([]),
    mobileCallouts: signal([]),
    roles: signal([]),
    users: signal([]),
    permissionGroups: signal([]),
    fieldPermissions: signal([]),
    colourTokens: signal([]),
    behaviourSettings: signal([]),
    selectPreviewPage: jasmine.createSpy('selectPreviewPage'),
    selectPreviewLeftPage: jasmine.createSpy('selectPreviewLeftPage'),
    selectPreviewSubPage: jasmine.createSpy('selectPreviewSubPage'),
    selectPreviewTopTab: jasmine.createSpy('selectPreviewTopTab'),
    openPreview: jasmine.createSpy('openPreview'),
    closePreview: jasmine.createSpy('closePreview'),
    closePreviewFiltersPanel: jasmine.createSpy('closePreviewFiltersPanel'),
    closePreviewSortPanel: jasmine.createSpy('closePreviewSortPanel'),
    togglePreviewFilter: jasmine.createSpy('togglePreviewFilter'),
    applyPreviewFilters: jasmine.createSpy('applyPreviewFilters'),
    setPreviewSortMode: jasmine.createSpy('setPreviewSortMode'),
    setPreviewViewMode: jasmine.createSpy('setPreviewViewMode'),
    updatePreviewDepartmentFilter: jasmine.createSpy('updatePreviewDepartmentFilter'),
    updatePreviewJoinedFilter: jasmine.createSpy('updatePreviewJoinedFilter'),
  };
}

describe('MobileWebPageComponent', () => {
  let component: MobileWebPageComponent;
  let fixture: ComponentFixture<MobileWebPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileWebPageComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: DeploymentFacadeService, useValue: buildFacadeMock() },
        { provide: DeploymentExportService, useValue: jasmine.createSpyObj('DeploymentExportService', ['exportCsv', 'exportPdf', 'exportJson']) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MobileWebPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
