import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideReportBuilderI18nTesting } from '@builder/features/report-builder/testing/report-builder-i18n.testing';
import { ReportQuickViewLayoutComponent } from '@builder/features/report-builder/components/report-right-panel/quick-view/layout/layout.component';

describe('ReportQuickViewLayoutComponent', () => {
  let fixture: ComponentFixture<ReportQuickViewLayoutComponent>;
  let component: ReportQuickViewLayoutComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportQuickViewLayoutComponent],
      providers: [provideReportBuilderI18nTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportQuickViewLayoutComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('quickLayout', 'list');
    fixture.componentRef.setInput('visibleCount', 5);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
