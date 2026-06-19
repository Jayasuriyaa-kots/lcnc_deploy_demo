import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { QoButtonComponent } from '@qo/ui-components';
import { WORKFLOW_LANGUAGE } from '../../../../services/workflow-language';

@Component({
  selector: 'app-workflow-editor-topbar',
  standalone: true,
  imports: [CommonModule, TranslocoDirective, TranslocoPipe, QoButtonComponent],
  templateUrl: './workflow-editor-topbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowEditorTopbarComponent {
  readonly lang = WORKFLOW_LANGUAGE;
  readonly workflowContextLabel = input(this.lang.editor.createdWithWorkflowEditor);
  readonly workflowStatusLabel = input('draft');
  readonly workflowVersionLabel = input('v1');
  readonly saveStateLabel = input(this.lang.editor.saved);
  readonly dirty = input(false);
  readonly canDeleteSelectedNode = input(false);
  readonly running = input(false);
  readonly saving = input(false);

  readonly deleteSelectedNode = output<void>();
  readonly validateWorkflow = output<void>();
  readonly testRunWorkflow = output<void>();
  readonly saveWorkflow = output<void>();
}
