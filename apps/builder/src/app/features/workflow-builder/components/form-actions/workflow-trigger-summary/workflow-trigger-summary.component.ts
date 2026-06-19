import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { WORKFLOW_LANGUAGE } from '../../../services/workflow-language';

@Component({
  selector: 'app-workflow-trigger-summary',
  standalone: true,
  imports: [CommonModule, TranslocoDirective],
  templateUrl: './workflow-trigger-summary.component.html',
  styleUrl: './workflow-trigger-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowTriggerSummaryComponent {
  readonly lang = WORKFLOW_LANGUAGE;
  triggerLabel = input.required<string>();
}
