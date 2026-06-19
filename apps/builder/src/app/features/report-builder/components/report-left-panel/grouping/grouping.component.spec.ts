import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideReportBuilderI18nTesting } from '@builder/features/report-builder/testing/report-builder-i18n.testing';
import { ReportLeftGroupingComponent } from '@builder/features/report-builder/components/report-left-panel/grouping/grouping.component';
import { ReportBuilderFacade } from '@builder/features/report-builder/facades/report-builder.facade';

describe('ReportLeftGroupingComponent', () => {
  let fixture: ComponentFixture<ReportLeftGroupingComponent>;
  let component: ReportLeftGroupingComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportLeftGroupingComponent],
      providers: [provideReportBuilderI18nTesting()],
    }).compileComponents();

    const state = TestBed.inject(ReportBuilderFacade);
    const report = state.selectedReport()!;

    fixture = TestBed.createComponent(ReportLeftGroupingComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('allColumns', report.columns);
    fixture.componentRef.setInput('groupBy', report.settings.groupBy);
    fixture.componentRef.setInput('groupOrder', report.settings.groupOrder);
    fixture.componentRef.setInput(
      'showRecordCount',
      report.settings.showRecordCount
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
