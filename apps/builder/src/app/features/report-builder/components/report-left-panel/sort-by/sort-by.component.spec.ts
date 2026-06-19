import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideReportBuilderI18nTesting } from '@builder/features/report-builder/testing/report-builder-i18n.testing';
import { ReportLeftSortByComponent } from '@builder/features/report-builder/components/report-left-panel/sort-by/sort-by.component';
import { ReportBuilderFacade } from '@builder/features/report-builder/facades/report-builder.facade';

describe('ReportLeftSortByComponent', () => {
  let fixture: ComponentFixture<ReportLeftSortByComponent>;
  let component: ReportLeftSortByComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportLeftSortByComponent],
      providers: [provideReportBuilderI18nTesting()],
    }).compileComponents();

    const state = TestBed.inject(ReportBuilderFacade);
    const report = state.selectedReport()!;

    fixture = TestBed.createComponent(ReportLeftSortByComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('allColumns', report.columns);
    fixture.componentRef.setInput('sortCriteria', report.settings.sortCriteria);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
