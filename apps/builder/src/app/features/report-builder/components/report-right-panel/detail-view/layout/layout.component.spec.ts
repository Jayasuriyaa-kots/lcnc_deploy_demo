import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideReportBuilderI18nTesting } from '@builder/features/report-builder/testing/report-builder-i18n.testing';
import { ReportDetailViewLayoutComponent } from '@builder/features/report-builder/components/report-right-panel/detail-view/layout/layout.component';

describe('ReportDetailViewLayoutComponent', () => {
  let fixture: ComponentFixture<ReportDetailViewLayoutComponent>;
  let component: ReportDetailViewLayoutComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportDetailViewLayoutComponent],
      providers: [provideReportBuilderI18nTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportDetailViewLayoutComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('detailLayout', 'all_fields');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
