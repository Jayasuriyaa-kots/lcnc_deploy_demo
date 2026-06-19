import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideReportBuilderI18nTesting } from '@builder/features/report-builder/testing/report-builder-i18n.testing';
import { ReportLeftFiltersComponent } from '@builder/features/report-builder/components/report-left-panel/filters/filters.component';
import { ReportBuilderFacade } from '@builder/features/report-builder/facades/report-builder.facade';

describe('ReportLeftFiltersComponent', () => {
  let fixture: ComponentFixture<ReportLeftFiltersComponent>;
  let component: ReportLeftFiltersComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportLeftFiltersComponent],
      providers: [provideReportBuilderI18nTesting()],
    }).compileComponents();

    const state = TestBed.inject(ReportBuilderFacade);
    const report = state.selectedReport()!;

    fixture = TestBed.createComponent(ReportLeftFiltersComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('allColumns', report.columns);
    fixture.componentRef.setInput('filterPresets', report.filterPresets);
    fixture.componentRef.setInput('filters', report.filterRules);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
