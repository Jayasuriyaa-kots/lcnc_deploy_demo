import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideReportBuilderI18nTesting } from '@builder/features/report-builder/testing/report-builder-i18n.testing';
import { ReportLeftDataSourceComponent } from '@builder/features/report-builder/components/report-left-panel/data-source/data-source.component';
import { ReportBuilderFacade } from '@builder/features/report-builder/facades/report-builder.facade';

describe('ReportLeftDataSourceComponent', () => {
  let fixture: ComponentFixture<ReportLeftDataSourceComponent>;
  let component: ReportLeftDataSourceComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportLeftDataSourceComponent],
      providers: [provideReportBuilderI18nTesting()],
    }).compileComponents();

    const state = TestBed.inject(ReportBuilderFacade);
    const report = state.selectedReport()!;

    fixture = TestBed.createComponent(ReportLeftDataSourceComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('sourceFormId', report.sourceFormId);
    fixture.componentRef.setInput('datasourceOptions', state.sourceOptions);
    fixture.componentRef.setInput('sourceFormLabel', report.sourceFormLabel);
    fixture.componentRef.setInput('datasourceLabel', report.datasourceLabel);
    fixture.componentRef.setInput('tableLabel', report.tableLabel);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
