import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QoWorkflowStatusBadgeComponent, WorkflowBadgeStatus } from '../workflow-status-badge/workflow-status-badge.component';
import { QoButtonComponent } from '@qo/ui-components';

@Component({
  selector: 'qo-workflow-card',
  standalone: true,
  imports: [CommonModule, QoButtonComponent, QoWorkflowStatusBadgeComponent],
  templateUrl: './workflow-card.component.html',
  styleUrl: './workflow-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QoWorkflowCardComponent {
  title = input.required<string>();
  status = input<WorkflowBadgeStatus>('draft');
  subtitle = input<string>('');
  meta = input<string>('');
  selected = input<boolean>(false);
  historyLabel = input<string>('Run History');

  edit = output<void>();
  openHistory = output<void>();
  toggle = output<void>();
}
