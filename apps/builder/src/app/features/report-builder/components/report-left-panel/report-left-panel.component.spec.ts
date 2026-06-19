import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideReportBuilderI18nTesting } from '@builder/features/report-builder/testing/report-builder-i18n.testing';
import { ReportLeftPanelComponent } from '@builder/features/report-builder/components/report-left-panel/report-left-panel.component';
import { ReportBuilderFacade } from '@builder/features/report-builder/facades/report-builder.facade';

describe('ReportLeftPanelComponent', () => {
  let fixture: ComponentFixture<ReportLeftPanelComponent>;
  let component: ReportLeftPanelComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportLeftPanelComponent],
      providers: [provideReportBuilderI18nTesting()],
    }).compileComponents();

    const state = TestBed.inject(ReportBuilderFacade);
    const report = state.selectedReport()!;

    fixture = TestBed.createComponent(ReportLeftPanelComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('report', report);
    fixture.componentRef.setInput('allColumns', report.columns);
    fixture.componentRef.setInput('sourceOptions', state.sourceOptions);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
