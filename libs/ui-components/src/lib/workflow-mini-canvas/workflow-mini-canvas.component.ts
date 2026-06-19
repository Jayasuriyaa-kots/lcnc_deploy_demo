import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowEdge, WorkflowNode } from '@quanta-ops/models';
import { QoWorkflowNodeComponent } from '../workflow-node/workflow-node.component';

@Component({
  selector: 'qo-workflow-mini-canvas',
  standalone: true,
  imports: [CommonModule, QoWorkflowNodeComponent],
  templateUrl: './workflow-mini-canvas.component.html',
  styleUrl: './workflow-mini-canvas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QoWorkflowMiniCanvasComponent {
  nodes = input<WorkflowNode[]>([]);
  connections = input<WorkflowEdge[]>([]);
  compact = input<boolean>(false);

  readonly orderedNodes = computed(() =>
    [...this.nodes()].sort((left, right) => left.position.x - right.position.x || left.position.y - right.position.y)
  );

  accentColor(type: string): string {
    switch (type) {
      case 'trigger':
        return 'var(--qo-color-success-500)';
      case 'delay':
        return 'var(--qo-color-neutral-300)';
      case 'email':
      case 'notification':
        return 'var(--qo-color-info-500)';
      case 'condition':
        return 'var(--qo-color-warning-500)';
      default:
        return 'var(--qo-color-primary-500)';
    }
  }

  nodeKindLabel(type: string): string {
    switch (type) {
      case 'trigger':
        return 'Entry Trigger';
      case 'email':
      case 'notification':
        return 'Notify';
      case 'custom_function':
        return 'Document';
      case 'delay':
        return 'End';
      default:
        return 'Action';
    }
  }

  nodeDescription(node: WorkflowNode): string {
    const source = node.config['summary'];

    if (typeof source === 'string' && source.trim().length > 0) {
      return source;
    }

    switch (node.type) {
      case 'trigger':
        return 'employees table';
      case 'database_write':
        return 'HR system sync';
      case 'email':
        return 'Welcome email';
      case 'notification':
        return 'Manager alert';
      case 'custom_function':
        return 'Offer letter';
      case 'delay':
        return 'Log completion';
      default:
        return node.type.replace('_', ' ');
    }
  }
}
