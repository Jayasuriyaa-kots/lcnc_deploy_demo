import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, Validators } from '@angular/forms';
import {
  WORKFLOW_BUILDER_I18N_TESTING_PROVIDER,
  WORKFLOW_BUILDER_TRANSLOCO_TESTING_IMPORT,
} from '../../../testing/workflow-builder-i18n.testing';
import { WorkflowScheduleFormComponent } from './workflow-schedule-form.component';

describe('WorkflowScheduleFormComponent', () => {
  let fixture: ComponentFixture<WorkflowScheduleFormComponent>;
  let component: WorkflowScheduleFormComponent;
  let formBuilder: FormBuilder;

  function createForm() {
    return formBuilder.nonNullable.group({
      scheduleMode: ['specific', Validators.required],
      startDate: ['2026-05-28', Validators.required],
      time: ['09:00', Validators.required],
      repeat: ['daily', Validators.required],
      workflowName: ['', Validators.required],
      timezone: ['Asia/Kolkata', Validators.required],
      formId: [''],
      dateFieldId: [''],
      executeWorkflow: ['on_date'],
      offsetCount: ['0'],
      offsetUnit: ['days'],
      endMode: ['never'],
      endDate: [''],
      endAfterRuns: [''],
      processMode: ['always'],
      nextConnector: ['AND'],
      conditions: formBuilder.array([]),
    });
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowScheduleFormComponent, WORKFLOW_BUILDER_TRANSLOCO_TESTING_IMPORT],
      providers: [WORKFLOW_BUILDER_I18N_TESTING_PROVIDER],
    }).compileComponents();

    formBuilder = TestBed.inject(FormBuilder);
    fixture = TestBed.createComponent(WorkflowScheduleFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('form', createForm());
    fixture.componentRef.setInput('forms', [
      {
        id: 'form_employee',
        appId: 'app_hr_management',
        name: 'Employee Form',
        slug: 'employee-form',
        fields: [
          { id: 'dueDate', name: 'dueDate', label: 'Due Date', type: 'date' },
          { id: 'status', name: 'status', label: 'Status', type: 'text' },
        ],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
    fixture.detectChanges();
  });

  it('requires workflow name before submit in specific date mode', () => {
    component.form().markAllAsTouched();

    expect(component.canSubmit()).toBeFalse();
    expect(component.fieldError('workflowName', 'Workflow name')).toBe('Workflow name is required.');
  });

  it('requires form and date field before submit in date field mode', () => {
    fixture.componentRef.setInput('scheduleMode', 'dateField');
    fixture.detectChanges();
    component.form().markAllAsTouched();

    expect(component.canSubmit()).toBeFalse();
    expect(component.fieldError('formId', 'Form')).toBe('Form is required.');
  });

  it('allows submit when date field mode required fields are complete', () => {
    fixture.componentRef.setInput('scheduleMode', 'dateField');
    component.form().patchValue({
      formId: 'form_employee',
      dateFieldId: 'dueDate',
      time: '09:00',
      repeat: 'daily',
      workflowName: 'Due Reminder',
    });
    fixture.detectChanges();

    expect(component.canSubmit()).toBeTrue();
  });
});
