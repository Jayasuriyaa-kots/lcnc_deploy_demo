import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideReportBuilderI18nTesting } from '@builder/features/report-builder/testing/report-builder-i18n.testing';
import { ReportSettingsModalComponent } from '@builder/features/report-builder/components/report-settings-modal/report-settings-modal.component';

describe('ReportSettingsModalComponent', () => {
  let fixture: ComponentFixture<ReportSettingsModalComponent>;
  let component: ReportSettingsModalComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportSettingsModalComponent],
      providers: [provideReportBuilderI18nTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportSettingsModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('name', 'Employee Directory');
    fixture.componentRef.setInput('description', 'Smoke test report');
    fixture.componentRef.setInput('viewType', 'List View');
    fixture.componentRef.setInput('defaultLayout', 'Comfortable');
    fixture.componentRef.setInput('recordClickAction', 'View Record');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
