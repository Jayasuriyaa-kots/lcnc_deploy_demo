import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideReportBuilderI18nTesting } from '@builder/features/report-builder/testing/report-builder-i18n.testing';
import { ReportCreateLayoutModalComponent } from '@builder/features/report-builder/components/report-create-layout-modal/report-create-layout-modal.component';
import { ReportBuilderFacade } from '@builder/features/report-builder/facades/report-builder.facade';

describe('ReportCreateLayoutModalComponent', () => {
  let fixture: ComponentFixture<ReportCreateLayoutModalComponent>;
  let component: ReportCreateLayoutModalComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportCreateLayoutModalComponent],
      providers: [provideReportBuilderI18nTesting()],
    }).compileComponents();

    const state = TestBed.inject(ReportBuilderFacade);
    const report = state.selectedReport()!;

    fixture = TestBed.createComponent(ReportCreateLayoutModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('allColumns', report.columns);
    fixture.componentRef.setInput('config', report.settings.quickViewCustomLayout);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
