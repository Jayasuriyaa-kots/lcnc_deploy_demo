import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QoIconComponent } from '@qo/ui-components';

export type WorkflowEditorFeedbackTone = 'info' | 'success' | 'warning' | 'danger';

export interface WorkflowEditorFeedbackPanel {
  messages: string[];
  status: string;
  title: string;
  tone: WorkflowEditorFeedbackTone;
}

@Component({
  selector: 'app-workflow-editor-feedback-panel',
  standalone: true,
  imports: [CommonModule, QoIconComponent],
  templateUrl: './workflow-editor-feedback-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowEditorFeedbackPanelComponent {
  readonly panel = input.required<WorkflowEditorFeedbackPanel>();
}
