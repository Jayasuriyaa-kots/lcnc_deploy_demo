import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideReportBuilderI18nTesting } from '@builder/features/report-builder/testing/report-builder-i18n.testing';
import {
  CreateReportResult,
  ReportCreateWizardComponent,
} from '@builder/features/report-builder/components/report-create-wizard/report-create-wizard.component';
import { ReportBuilderFacade } from '@builder/features/report-builder/facades/report-builder.facade';

describe('ReportCreateWizardComponent', () => {
  let fixture: ComponentFixture<ReportCreateWizardComponent>;
  let component: ReportCreateWizardComponent;
  let sourceOptions: ReportBuilderFacade['sourceOptions'];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportCreateWizardComponent],
      providers: [provideReportBuilderI18nTesting()],
    }).compileComponents();

    sourceOptions = TestBed.inject(ReportBuilderFacade).sourceOptions;

    fixture = TestBed.createComponent(ReportCreateWizardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('sourceOptions', sourceOptions);
    fixture.detectChanges(); // runs the effect: defaults the source + seeds columns
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emits `created` with the wizard config when finished', () => {
    let emitted: CreateReportResult | undefined;
    component.created.subscribe((config) => (emitted = config));

    // The effect already defaulted to the first source and pre-selected its
    // first columns, so the form is valid — finishing should emit.
    component.createReport();

    expect(emitted).toBeTruthy();
    expect(emitted?.sourceFormId).toBe(sourceOptions[0].id);
    expect(emitted?.name).toBe('New Report'); // default form value
    expect(emitted?.selectedColumnIds.length).toBeGreaterThan(0);
  });

  it('does not emit `created` when no fields are selected', () => {
    const createdSpy = jasmine.createSpy('created');
    component.created.subscribe(createdSpy);

    // Clear the pre-seeded fields → validation should block the emit.
    component.wizardSelectedColumnIds.set([]);
    component.createReport();

    expect(createdSpy).not.toHaveBeenCalled();
  });

  it('emits `cancelled` when the wizard is cancelled', () => {
    const cancelledSpy = jasmine.createSpy('cancelled');
    component.cancelled.subscribe(cancelledSpy);

    component.cancel();

    expect(cancelledSpy).toHaveBeenCalledTimes(1);
  });
});
