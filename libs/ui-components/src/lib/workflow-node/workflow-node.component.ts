import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'qo-workflow-node',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workflow-node.component.html',
  styleUrl: './workflow-node.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QoWorkflowNodeComponent {
  label = input.required<string>();
  title = input.required<string>();
  description = input<string>('');
  type = input<string>('trigger');
  accentColor = input<string>('var(--qo-color-primary-500)');
  active = input<boolean>(false);

  readonly accentClass = computed(() => {
    const accent = this.accentColor();

    if (accent.includes('success')) {
      return 'workflow-node__accent--success';
    }

    if (accent.includes('info')) {
      return 'workflow-node__accent--info';
    }

    if (accent.includes('warning')) {
      return 'workflow-node__accent--warning';
    }

    return 'workflow-node__accent--primary';
  });
}
