import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideReportBuilderI18nTesting } from '@builder/features/report-builder/testing/report-builder-i18n.testing';
import {
  EditModalState,
  ReportEditModalComponent,
} from '@builder/features/report-builder/components/report-edit-modal/report-edit-modal.component';

describe('ReportEditModalComponent', () => {
  let fixture: ComponentFixture<ReportEditModalComponent>;
  let component: ReportEditModalComponent;

  const state: EditModalState = {
    reportLabel: 'Test Report',
    fields: [{ id: 'name', label: 'Name', value: 'Acme' }],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportEditModalComponent],
      providers: [provideReportBuilderI18nTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportEditModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('state', state);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emits a close event', () => {
    let emitted: unknown;
    component.event.subscribe((e) => (emitted = e));
    component.event.emit({ type: 'close' });
    expect(emitted).toEqual({ type: 'close' });
  });
});
