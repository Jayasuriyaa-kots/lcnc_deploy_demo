import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideReportBuilderI18nTesting } from '@builder/features/report-builder/testing/report-builder-i18n.testing';
import { ReportDetailViewActionsComponent } from '@builder/features/report-builder/components/report-right-panel/detail-view/actions/actions.component';
import { REPORT_BUILDER_DETAIL_ACTION_GROUPS } from '@builder/report-builder/config';

describe('ReportDetailViewActionsComponent', () => {
  let fixture: ComponentFixture<ReportDetailViewActionsComponent>;
  let component: ReportDetailViewActionsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportDetailViewActionsComponent],
      providers: [provideReportBuilderI18nTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportDetailViewActionsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput(
      'detailActionGroups',
      REPORT_BUILDER_DETAIL_ACTION_GROUPS
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
