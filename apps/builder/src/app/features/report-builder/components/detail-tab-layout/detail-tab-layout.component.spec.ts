import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideReportBuilderI18nTesting } from '@builder/features/report-builder/testing/report-builder-i18n.testing';
import { DetailTabLayoutComponent } from './detail-tab-layout.component';
import { ReportBuilderFacade } from '@builder/features/report-builder/facades/report-builder.facade';

describe('DetailTabLayoutComponent', () => {
  let fixture: ComponentFixture<DetailTabLayoutComponent>;
  let component: DetailTabLayoutComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailTabLayoutComponent],
      providers: [provideReportBuilderI18nTesting()],
    }).compileComponents();

    const state = TestBed.inject(ReportBuilderFacade);
    const report = state.selectedReport()!;

    fixture = TestBed.createComponent(DetailTabLayoutComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('allColumns', report.columns);
    fixture.componentRef.setInput('tabs', [
      {
        id: 'tab-1',
        title: 'Overview',
        sourceFormId: report.sourceFormId,
        fieldIds: report.columns.slice(0, 2).map((column) => column.id),
      },
    ]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
