import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideReportBuilderI18nTesting } from '@builder/features/report-builder/testing/report-builder-i18n.testing';
import { ReportPreviewModalComponent } from '@builder/features/report-builder/components/report-preview-modal/report-preview-modal.component';
import { ReportBuilderFacade } from '@builder/features/report-builder/facades/report-builder.facade';

describe('ReportPreviewModalComponent', () => {
  let fixture: ComponentFixture<ReportPreviewModalComponent>;
  let component: ReportPreviewModalComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportPreviewModalComponent],
      providers: [provideReportBuilderI18nTesting()],
    }).compileComponents();

    const state = TestBed.inject(ReportBuilderFacade);
    const report = state.selectedReport()!;

    fixture = TestBed.createComponent(ReportPreviewModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('report', report);
    fixture.componentRef.setInput(
      'visibleColumns',
      report.columns.filter((column) => column.visible)
    );
    fixture.componentRef.setInput('records', state.buildPreviewRecords(report));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
