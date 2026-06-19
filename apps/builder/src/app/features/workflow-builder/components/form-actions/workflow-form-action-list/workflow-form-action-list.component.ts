import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { WorkflowDetail, WorkflowSummary } from '@qo/models';
import { QoEmptyStateComponent } from '@qo/ui-components';
import { WorkflowFormActionCardComponent } from '../workflow-form-action-card';
import { WORKFLOW_LANGUAGE } from '../../../services/workflow-language';

@Component({
  selector: 'app-workflow-form-action-list',
  standalone: true,
  imports: [CommonModule, TranslocoDirective, QoEmptyStateComponent, WorkflowFormActionCardComponent],
  templateUrl: './workflow-form-action-list.component.html',
  styleUrl: './workflow-form-action-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowFormActionListComponent {
  readonly lang = WORKFLOW_LANGUAGE;
  workflows = input<WorkflowSummary[]>([]);
  workflowDetails = input<Record<string, WorkflowDetail>>({});
  selectedWorkflowId = input<string | null>(null);
  executionCounts = input<Record<string, number>>({});

  select = output<string>();
  edit = output<string>();
  openHistory = output<string>();
}
