import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideReportBuilderI18nTesting } from '@builder/features/report-builder/testing/report-builder-i18n.testing';
import { ReportQuickViewActionsComponent } from '@builder/features/report-builder/components/report-right-panel/quick-view/actions/actions.component';
import { REPORT_BUILDER_QUICK_ACTION_GROUPS } from '@builder/report-builder/config';

describe('ReportQuickViewActionsComponent', () => {
  let fixture: ComponentFixture<ReportQuickViewActionsComponent>;
  let component: ReportQuickViewActionsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportQuickViewActionsComponent],
      providers: [provideReportBuilderI18nTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportQuickViewActionsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput(
      'quickActionGroups',
      REPORT_BUILDER_QUICK_ACTION_GROUPS
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
