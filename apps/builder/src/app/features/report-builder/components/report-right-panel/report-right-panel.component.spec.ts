import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideReportBuilderI18nTesting } from '@builder/features/report-builder/testing/report-builder-i18n.testing';
import { ReportRightPanelComponent } from '@builder/features/report-builder/components/report-right-panel/report-right-panel.component';
import { ReportBuilderFacade } from '@builder/features/report-builder/facades/report-builder.facade';
import {
  REPORT_BUILDER_DETAIL_ACTION_GROUPS,
  REPORT_BUILDER_QUICK_ACTION_GROUPS,
} from '@builder/features/report-builder/config/report-builder.config';

describe('ReportRightPanelComponent', () => {
  let fixture: ComponentFixture<ReportRightPanelComponent>;
  let component: ReportRightPanelComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportRightPanelComponent],
      providers: [provideReportBuilderI18nTesting()],
    }).compileComponents();

    const state = TestBed.inject(ReportBuilderFacade);
    const report = state.selectedReport()!;

    fixture = TestBed.createComponent(ReportRightPanelComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('report', report);
    fixture.componentRef.setInput(
      'visibleCount',
      report.columns.filter((column) => column.visible).length
    );
    fixture.componentRef.setInput('pageSize', '20');
    fixture.componentRef.setInput(
      'quickActionGroups',
      REPORT_BUILDER_QUICK_ACTION_GROUPS
    );
    fixture.componentRef.setInput(
      'detailActionGroups',
      REPORT_BUILDER_DETAIL_ACTION_GROUPS
    );
    fixture.componentRef.setInput('reportConfigTab', 'quick');
    fixture.componentRef.setInput('reportConfigMode', 'layout');
    fixture.componentRef.setInput('quickLayout', 'list');
    fixture.componentRef.setInput('detailLayout', 'all_fields');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
