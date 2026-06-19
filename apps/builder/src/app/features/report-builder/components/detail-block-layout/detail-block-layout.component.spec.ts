import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideReportBuilderI18nTesting } from '@builder/features/report-builder/testing/report-builder-i18n.testing';
import { DetailBlockLayoutComponent } from './detail-block-layout.component';
import { ReportBuilderFacade } from '@builder/features/report-builder/facades/report-builder.facade';

describe('DetailBlockLayoutComponent', () => {
  let fixture: ComponentFixture<DetailBlockLayoutComponent>;
  let component: DetailBlockLayoutComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailBlockLayoutComponent],
      providers: [provideReportBuilderI18nTesting()],
    }).compileComponents();

    const state = TestBed.inject(ReportBuilderFacade);
    const report = state.selectedReport()!;

    fixture = TestBed.createComponent(DetailBlockLayoutComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('allColumns', report.columns);
    fixture.componentRef.setInput('blocks', [
      {
        id: 'block-1',
        title: 'Details',
        fieldIds: report.columns.slice(0, 2).map((column) => column.id),
        sourceFormId: report.sourceFormId,
      },
    ]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
