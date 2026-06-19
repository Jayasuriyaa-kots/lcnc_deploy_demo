import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeColor, QoBadgeComponent } from '../primitives/badge/badge.component';

export type WorkflowBadgeStatus =
  | 'draft'
  | 'published'
  | 'active'
  | 'inactive'
  | 'paused'
  | 'pending'
  | 'running'
  | 'failed'
  | 'completed';

@Component({
  selector: 'qo-workflow-status-badge',
  standalone: true,
  imports: [CommonModule, QoBadgeComponent],
  templateUrl: './workflow-status-badge.component.html',
  styleUrl: './workflow-status-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QoWorkflowStatusBadgeComponent {
  status = input<WorkflowBadgeStatus>('draft');

  readonly color = computed<BadgeColor>(() => {
    switch (this.status()) {
      case 'published':
      case 'active':
      case 'completed':
        return 'success';
      case 'draft':
      case 'paused':
      case 'pending':
      case 'running':
        return 'warning';
      case 'failed':
        return 'danger';
      case 'inactive':
      default:
        return 'default';
    }
  });

  readonly label = computed(() => this.status().replace(/_/g, ' '));
}
