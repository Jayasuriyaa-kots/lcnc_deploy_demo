import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideReportBuilderI18nTesting } from '@builder/features/report-builder/testing/report-builder-i18n.testing';
import { ReportCenterPreviewComponent } from '@builder/features/report-builder/components/report-center-preview/report-center-preview.component';
import { ReportBuilderFacade } from '@builder/features/report-builder/facades/report-builder.facade';

describe('ReportCenterPreviewComponent', () => {
  let fixture: ComponentFixture<ReportCenterPreviewComponent>;
  let component: ReportCenterPreviewComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportCenterPreviewComponent],
      providers: [provideReportBuilderI18nTesting()],
    }).compileComponents();

    const state = TestBed.inject(ReportBuilderFacade);
    const report = state.selectedReport()!;

    fixture = TestBed.createComponent(ReportCenterPreviewComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('report', report);
    fixture.componentRef.setInput(
      'visibleColumns',
      report.columns.filter((column) => column.visible)
    );
    fixture.componentRef.setInput('quickLayout', 'list');
    fixture.componentRef.setInput('records', state.buildPreviewRecords(report));
    fixture.componentRef.setInput('previewSelection', []);
    fixture.componentRef.setInput('selectedCount', 0);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
