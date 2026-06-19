import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, Validators } from '@angular/forms';
import {
  WORKFLOW_BUILDER_I18N_TESTING_PROVIDER,
  WORKFLOW_BUILDER_TRANSLOCO_TESTING_IMPORT,
} from '../../../testing/workflow-builder-i18n.testing';
import { WorkflowButtonCreateModalComponent } from './workflow-button-create-modal.component';

describe('WorkflowButtonCreateModalComponent', () => {
  let fixture: ComponentFixture<WorkflowButtonCreateModalComponent>;
  let component: WorkflowButtonCreateModalComponent;
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowButtonCreateModalComponent, WORKFLOW_BUILDER_TRANSLOCO_TESTING_IMPORT],
      providers: [WORKFLOW_BUILDER_I18N_TESTING_PROVIDER],
    }).compileComponents();

    formBuilder = TestBed.inject(FormBuilder);
    fixture = TestBed.createComponent(WorkflowButtonCreateModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput(
      'form',
      formBuilder.nonNullable.group({
        name: ['', Validators.required],
        actionType: ['workflow', Validators.required],
        linkedWorkflowId: ['', Validators.required],
        scope: ['Report', Validators.required],
        source: ['', Validators.required],
        usedIn: ['', Validators.required],
        status: ['active', Validators.required],
      })
    );
    fixture.componentRef.setInput('availableWorkflows', ['Employee Approval Flow']);
    fixture.detectChanges();
  });

  it('reports required field errors after touch', () => {
    component.form().markAllAsTouched();

    expect(component.fieldError('name', 'Name')).toBe('Name is required.');
    expect(component.fieldError('linkedWorkflowId', 'Linked workflow')).toBe('Linked workflow is required.');
  });

  it('builds linked workflow options from available workflows', () => {
    expect(component.workflowOptions()).toEqual([
      { label: 'Employee Approval Flow', value: 'Employee Approval Flow' },
    ]);
  });
});
