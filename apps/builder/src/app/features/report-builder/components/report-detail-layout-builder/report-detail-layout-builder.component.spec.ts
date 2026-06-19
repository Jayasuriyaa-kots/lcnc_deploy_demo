import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideReportBuilderI18nTesting } from '@builder/features/report-builder/testing/report-builder-i18n.testing';
import { ReportDetailLayoutBuilderComponent } from './report-detail-layout-builder.component';
import { ReportBuilderFacade } from '@builder/features/report-builder/facades/report-builder.facade';

describe('ReportDetailLayoutBuilderComponent', () => {
  let fixture: ComponentFixture<ReportDetailLayoutBuilderComponent>;
  let component: ReportDetailLayoutBuilderComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportDetailLayoutBuilderComponent],
      providers: [provideReportBuilderI18nTesting()],
    }).compileComponents();

    const state = TestBed.inject(ReportBuilderFacade);
    const report = state.selectedReport()!;

    fixture = TestBed.createComponent(ReportDetailLayoutBuilderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('allColumns', report.columns);
    fixture.componentRef.setInput('visibleColumns', report.columns.filter((column) => column.visible));
    fixture.componentRef.setInput('sourceFormId', report.sourceFormId);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
