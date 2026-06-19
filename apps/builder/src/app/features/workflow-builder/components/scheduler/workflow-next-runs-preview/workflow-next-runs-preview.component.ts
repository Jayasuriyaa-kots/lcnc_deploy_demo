import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { WORKFLOW_LANGUAGE } from '../../../services/workflow-language';

@Component({
  selector: 'app-workflow-next-runs-preview',
  standalone: true,
  imports: [CommonModule, TranslocoDirective],
  templateUrl: './workflow-next-runs-preview.component.html',
  styleUrl: './workflow-next-runs-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowNextRunsPreviewComponent {
  readonly lang = WORKFLOW_LANGUAGE;
  nextRuns = input<string[]>([]);
}
