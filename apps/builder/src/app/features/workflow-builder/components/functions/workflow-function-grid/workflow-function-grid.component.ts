import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { QoEmptyStateComponent } from '@qo/ui-components';
import { WorkflowFunctionCardItem } from '../../../models/workflow-builder-ui.model';
import { WorkflowFunctionCardComponent } from '../workflow-function-card';
import { WORKFLOW_LANGUAGE } from '../../../services/workflow-language';

@Component({
  selector: 'app-workflow-function-grid',
  standalone: true,
  imports: [CommonModule, TranslocoDirective, QoEmptyStateComponent, WorkflowFunctionCardComponent],
  templateUrl: './workflow-function-grid.component.html',
  styleUrl: './workflow-function-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowFunctionGridComponent {
  readonly lang = WORKFLOW_LANGUAGE;
  functions = input<WorkflowFunctionCardItem[]>([]);
  edit = output<string>();
  testRun = output<string>();
  duplicate = output<string>();
  delete = output<string>();
}
