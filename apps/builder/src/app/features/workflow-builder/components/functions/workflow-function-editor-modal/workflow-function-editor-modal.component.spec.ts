import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, Validators } from '@angular/forms';
import {
  WORKFLOW_BUILDER_I18N_TESTING_PROVIDER,
  WORKFLOW_BUILDER_TRANSLOCO_TESTING_IMPORT,
} from '../../../testing/workflow-builder-i18n.testing';
import { WorkflowFunctionEditorModalComponent } from './workflow-function-editor-modal.component';

describe('WorkflowFunctionEditorModalComponent', () => {
  let fixture: ComponentFixture<WorkflowFunctionEditorModalComponent>;
  let component: WorkflowFunctionEditorModalComponent;
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowFunctionEditorModalComponent, WORKFLOW_BUILDER_TRANSLOCO_TESTING_IMPORT],
      providers: [WORKFLOW_BUILDER_I18N_TESTING_PROVIDER],
    }).compileComponents();

    formBuilder = TestBed.inject(FormBuilder);
    fixture = TestBed.createComponent(WorkflowFunctionEditorModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput(
      'form',
      formBuilder.nonNullable.group({
        name: ['', Validators.required],
        language: ['javascript', Validators.required],
        description: ['', Validators.required],
        code: ['', Validators.required],
      })
    );
    fixture.detectChanges();
  });

  it('reports required field errors after touch', () => {
    component.form().markAllAsTouched();

    expect(component.fieldError('name', 'Name')).toBe('Name is required.');
    expect(component.fieldError('code', 'Function body')).toBe('Function body is required.');
  });

  it('does not report errors for untouched invalid fields', () => {
    expect(component.fieldError('name', 'Name')).toBeUndefined();
  });
});
