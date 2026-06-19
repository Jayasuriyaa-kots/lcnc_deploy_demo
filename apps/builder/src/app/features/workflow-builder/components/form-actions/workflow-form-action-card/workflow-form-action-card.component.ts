import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowDetail, WorkflowSummary } from '@qo/models';
import {
  QoWorkflowCardComponent,
  QoWorkflowMiniCanvasComponent,
  WorkflowBadgeStatus,
} from '@qo/ui-components';
import { WorkflowTriggerSummaryComponent } from '../workflow-trigger-summary';

@Component({
  selector: 'app-workflow-form-action-card',
  standalone: true,
  imports: [CommonModule, QoWorkflowCardComponent, QoWorkflowMiniCanvasComponent, WorkflowTriggerSummaryComponent],
  templateUrl: './workflow-form-action-card.component.html',
  styleUrl: './workflow-form-action-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowFormActionCardComponent {
  workflow = input.required<WorkflowSummary>();
  detail = input<WorkflowDetail | null>(null);
  selected = input<boolean>(false);
  historyCount = input<number>(0);

  select = output<string>();
  edit = output<string>();
  openHistory = output<string>();

  readonly historyLabel = computed(() => `Run History (${this.historyCount()})`);
  readonly hasHistory = computed(() => this.historyCount() > 0);
  readonly triggerSummary = computed(() => this.workflow().triggerLabel);
  readonly badgeStatus = computed<WorkflowBadgeStatus>(() => {
    switch (this.workflow().status) {
      case 'active':
        return 'published';
      case 'inactive':
        return 'inactive';
      case 'draft':
      default:
        return 'draft';
    }
  });
}
