import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, Validators } from '@angular/forms';
import {
  WORKFLOW_BUILDER_I18N_TESTING_PROVIDER,
  WORKFLOW_BUILDER_TRANSLOCO_TESTING_IMPORT,
} from '../../../testing/workflow-builder-i18n.testing';
import { WorkflowFlowCreateModalComponent } from './workflow-flow-create-modal.component';

describe('WorkflowFlowCreateModalComponent', () => {
  let fixture: ComponentFixture<WorkflowFlowCreateModalComponent>;
  let component: WorkflowFlowCreateModalComponent;
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowFlowCreateModalComponent, WORKFLOW_BUILDER_TRANSLOCO_TESTING_IMPORT],
      providers: [WORKFLOW_BUILDER_I18N_TESTING_PROVIDER],
    }).compileComponents();

    formBuilder = TestBed.inject(FormBuilder);
    fixture = TestBed.createComponent(WorkflowFlowCreateModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput(
      'form',
      formBuilder.nonNullable.group({
        formId: ['', Validators.required],
        recordEvent: ['record_edited', Validators.required],
        formEvent: ['', Validators.required],
        name: ['', [Validators.required, Validators.minLength(2)]],
      })
    );
    fixture.componentRef.setInput('formOptions', [{ label: 'Employee Form', value: 'employee_form' }]);
    fixture.detectChanges();
  });

  it('shows required errors after controls are touched', () => {
    component.form().markAllAsTouched();

    expect(component.fieldError('formId', 'Form')).toBe('Form is required.');
    expect(component.fieldError('formEvent', 'Form event')).toBe('Form event is required.');
  });

  it('marks the selected record event as touched', () => {
    component.selectRecordEvent('record_deleted');

    expect(component.selectedRecordEvent()).toBe('record_deleted');
    expect(component.form().get('recordEvent')?.touched).toBeTrue();
  });
});
