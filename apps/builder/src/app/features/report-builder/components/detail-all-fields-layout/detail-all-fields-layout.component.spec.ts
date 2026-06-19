import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideReportBuilderI18nTesting } from '@builder/features/report-builder/testing/report-builder-i18n.testing';
import { DetailAllFieldsLayoutComponent } from './detail-all-fields-layout.component';
import { ReportBuilderFacade } from '@builder/features/report-builder/facades/report-builder.facade';

describe('DetailAllFieldsLayoutComponent', () => {
  let fixture: ComponentFixture<DetailAllFieldsLayoutComponent>;
  let component: DetailAllFieldsLayoutComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailAllFieldsLayoutComponent],
      providers: [provideReportBuilderI18nTesting()],
    }).compileComponents();

    const state = TestBed.inject(ReportBuilderFacade);
    const report = state.selectedReport()!;

    fixture = TestBed.createComponent(DetailAllFieldsLayoutComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('allColumns', report.columns);
    fixture.componentRef.setInput('fieldIds', report.columns.slice(0, 3).map((column) => column.id));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
