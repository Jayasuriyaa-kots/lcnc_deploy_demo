import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowExecutionSummary } from '@quanta-ops/models';
import { QoEmptyStateComponent } from '../feedback/empty-state/empty-state.component';
import { QoWorkflowStatusBadgeComponent } from '../workflow-status-badge/workflow-status-badge.component';

@Component({
  selector: 'qo-workflow-execution-history',
  standalone: true,
  imports: [CommonModule, QoEmptyStateComponent, QoWorkflowStatusBadgeComponent],
  templateUrl: './workflow-execution-history.component.html',
  styleUrl: './workflow-execution-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QoWorkflowExecutionHistoryComponent {
  runs = input<WorkflowExecutionSummary[]>([]);
  loading = input<boolean>(false);
  selectedRunId = input<string | null>(null);

  selectRun = output<string>();
}
