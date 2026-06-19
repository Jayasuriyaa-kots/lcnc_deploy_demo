import { workflowEditorUnsavedGuard } from './workflow-editor-unsaved.guard';
import { WorkflowEditorComponent } from '../containers/workflow-editor';

describe('workflowEditorUnsavedGuard', () => {
  it('delegates to the workflow editor leave check', () => {
    const component = {
      canLeaveEditor: jasmine.createSpy('canLeaveEditor').and.returnValue(true),
    } as unknown as WorkflowEditorComponent;

    expect(workflowEditorUnsavedGuard(component, {} as never, {} as never, {} as never)).toBeTrue();
    expect(component.canLeaveEditor).toHaveBeenCalled();
  });
});
