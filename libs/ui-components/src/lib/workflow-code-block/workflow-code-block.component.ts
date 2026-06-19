import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowFunctionLanguage } from '@quanta-ops/models';

@Component({
  selector: 'qo-workflow-code-block',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workflow-code-block.component.html',
  styleUrl: './workflow-code-block.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QoWorkflowCodeBlockComponent {
  code = input.required<string>();
  language = input<WorkflowFunctionLanguage>('javascript');
  title = input<string>('');

  readonly codeLines = computed(() => this.code().split('\n'));
}
