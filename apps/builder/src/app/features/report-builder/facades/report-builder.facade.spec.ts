import { TestBed } from '@angular/core/testing';
import { provideReportBuilderI18nTesting } from '@builder/features/report-builder/testing/report-builder-i18n.testing';
import { ReportBuilderFacade } from '@builder/features/report-builder/facades/report-builder.facade';

// `CreateReportConfig` is not exported; derive it from the public method so the
// test stays in sync with the real signature without widening to `any`.
type CreateReportConfig = Parameters<ReportBuilderFacade['createReport']>[0];

describe('ReportBuilderFacade', () => {
  let facade: ReportBuilderFacade;

  beforeEach(() => {
    // The facade persists to localStorage; clear it so every spec starts from
    // the deterministic seed reports instead of a previous run's state.
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideReportBuilderI18nTesting()],
    });

    facade = TestBed.inject(ReportBuilderFacade);
  });

  /** Builds a valid wizard config off a real catalog source, with overrides. */
  function buildConfig(overrides: Partial<CreateReportConfig> = {}): CreateReportConfig {
    return {
      name: 'Quarterly Pipeline',
      sourceFormId: facade.sourceOptions[0].id,
      reportType: 'list',
      viewType: 'List View',
      cardLayout: 'card3',
      selectedColumnIds: [],
      ...overrides,
    };
  }

  it('should create', () => {
    expect(facade).toBeTruthy();
  });

  describe('createReport()', () => {
    it('prepends the new report to the reports list', () => {
      const before = facade.reports().length;

      facade.createReport(buildConfig());

      expect(facade.reports().length).toBe(before + 1);
      expect(facade.reports()[0].name).toBe('Quarterly Pipeline');
    });

    it('makes the new report the selected draft', () => {
      facade.createReport(buildConfig({ name: 'New Leads' }));

      const selected = facade.selectedReport();
      expect(selected?.name).toBe('New Leads');
      expect(selected?.status).toBe('draft');
    });

    it('closes the create wizard after a successful create', () => {
      facade.openCreateWizard();
      expect(facade.createWizardOpen()).toBeTrue();

      facade.createReport(buildConfig());

      expect(facade.createWizardOpen()).toBeFalse();
    });

    it('does nothing when the source form id is unknown', () => {
      const before = facade.reports().length;

      facade.createReport(buildConfig({ sourceFormId: 'does-not-exist' }));

      expect(facade.reports().length).toBe(before);
    });
  });
});
