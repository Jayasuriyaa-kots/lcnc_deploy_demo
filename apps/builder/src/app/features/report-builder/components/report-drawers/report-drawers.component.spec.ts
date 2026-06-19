import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideReportBuilderI18nTesting } from '@builder/features/report-builder/testing/report-builder-i18n.testing';
import { ReportDrawersComponent } from '@builder/features/report-builder/components/report-drawers/report-drawers.component';
import { ReportBuilderFacade } from '@builder/features/report-builder/facades/report-builder.facade';

describe('ReportDrawersComponent', () => {
  let fixture: ComponentFixture<ReportDrawersComponent>;
  let component: ReportDrawersComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportDrawersComponent],
      providers: [provideReportBuilderI18nTesting()],
    }).compileComponents();

    const state = TestBed.inject(ReportBuilderFacade);
    const report = state.selectedReport()!;
    const visibleColumns = report.columns.filter((column) => column.visible);

    fixture = TestBed.createComponent(ReportDrawersComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('fieldConfigOpen', false);
    fixture.componentRef.setInput('searchPanelOpen', false);
    fixture.componentRef.setInput('bulkEditOpen', false);
    fixture.componentRef.setInput('allColumns', report.columns);
    fixture.componentRef.setInput('visibleColumns', visibleColumns);
    fixture.componentRef.setInput('quickLayout', 'list');
    fixture.componentRef.setInput(
      'cardFieldTextColor',
      report.settings.cardFieldTextColor
    );
    fixture.componentRef.setInput(
      'cardFieldFontSize',
      report.settings.cardFieldFontSize
    );
    fixture.componentRef.setInput('filters', report.filterRules);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
