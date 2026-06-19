import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-workflow-event-trigger-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workflow-event-trigger-badge.component.html',
  styleUrl: './workflow-event-trigger-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowEventTriggerBadgeComponent {
  trigger = input.required<string>();
}
