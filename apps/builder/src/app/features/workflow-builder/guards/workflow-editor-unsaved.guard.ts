import { CanDeactivateFn } from '@angular/router';
import { WorkflowEditorComponent } from '../containers/workflow-editor';

export const workflowEditorUnsavedGuard: CanDeactivateFn<WorkflowEditorComponent> = (component) =>
  component.canLeaveEditor();
