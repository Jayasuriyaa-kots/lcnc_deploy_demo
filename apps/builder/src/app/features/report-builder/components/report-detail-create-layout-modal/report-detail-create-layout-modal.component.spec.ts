import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideReportBuilderI18nTesting } from '@builder/features/report-builder/testing/report-builder-i18n.testing';
import { ReportDetailCreateLayoutModalComponent } from './report-detail-create-layout-modal.component';
import { ReportBuilderFacade } from '@builder/features/report-builder/facades/report-builder.facade';

describe('ReportDetailCreateLayoutModalComponent', () => {
  let fixture: ComponentFixture<ReportDetailCreateLayoutModalComponent>;
  let component: ReportDetailCreateLayoutModalComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportDetailCreateLayoutModalComponent],
      providers: [provideReportBuilderI18nTesting()],
    }).compileComponents();

    const state = TestBed.inject(ReportBuilderFacade);
    const report = state.selectedReport()!;

    fixture = TestBed.createComponent(ReportDetailCreateLayoutModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('allColumns', report.columns);
    fixture.componentRef.setInput('initialFieldIds', report.columns.slice(0, 3).map((column) => column.id));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
