import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideReportBuilderI18nTesting } from '@builder/features/report-builder/testing/report-builder-i18n.testing';
import { ReportCustomLayoutModalComponent } from '@builder/features/report-builder/components/report-custom-layout-modal/report-custom-layout-modal.component';
import { ReportBuilderFacade } from '@builder/features/report-builder/facades/report-builder.facade';

describe('ReportCustomLayoutModalComponent', () => {
  let fixture: ComponentFixture<ReportCustomLayoutModalComponent>;
  let component: ReportCustomLayoutModalComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportCustomLayoutModalComponent],
      providers: [provideReportBuilderI18nTesting()],
    }).compileComponents();

    const state = TestBed.inject(ReportBuilderFacade);
    const report = state.selectedReport()!;

    fixture = TestBed.createComponent(ReportCustomLayoutModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('allColumns', report.columns);
    fixture.componentRef.setInput('config', report.settings.quickViewCustomLayout);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
