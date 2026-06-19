import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { DeploymentFacadeService } from '@builder/features/deployment/facades/deployment.facade';
import { FormBuilderFacade } from '@builder/features/form-builder/facades/form-builder.facade';
import { ReportBuilderFacade } from '@builder/features/report-builder/facades/report-builder.facade';
import { PageCanvasFacade } from '@builder/features/page-builder/facades/page-canvas.facade';
import { BrowserStorageService } from '@builder/core/services/browser-storage.service';

describe('DeploymentFacadeService', () => {
  let service: DeploymentFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DeploymentFacadeService,
        {
          provide: FormBuilderFacade,
          useValue: {
            forms: signal([]),
            publishedForms: signal([]),
          },
        },
        {
          provide: ReportBuilderFacade,
          useValue: {
            reports: signal([]),
            buildPreviewRecords: jasmine.createSpy('buildPreviewRecords').and.returnValue([]),
          },
        },
        {
          provide: PageCanvasFacade,
          useValue: {
            pages: signal([]),
            publishedPages: signal([]),
            getPageWidgets: jasmine.createSpy('getPageWidgets').and.returnValue(signal([])),
          },
        },
        {
          provide: BrowserStorageService,
          useValue: {
            getString: jasmine.createSpy('getString').and.returnValue(null),
            setString: jasmine.createSpy('setString'),
            getJson: jasmine.createSpy('getJson').and.returnValue(null),
            setJson: jasmine.createSpy('setJson'),
            remove: jasmine.createSpy('remove'),
          },
        },
      ],
    });

    service = TestBed.inject(DeploymentFacadeService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize saveState as idle', () => {
    expect(service.saveState()).toBe('idle');
  });

  it('should initialize runtimeMode as preview', () => {
    expect(service.runtimeMode()).toBe('preview');
  });
});
