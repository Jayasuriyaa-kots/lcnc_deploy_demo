import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { QoButtonComponent, QoWorkflowCodeBlockComponent } from '@qo/ui-components';
import { WorkflowFunctionCardItem } from '../../../models/workflow-builder-ui.model';
import { WORKFLOW_LANGUAGE } from '../../../services/workflow-language';

@Component({
  selector: 'app-workflow-function-card',
  standalone: true,
  imports: [CommonModule, TranslocoDirective, TranslocoPipe, QoButtonComponent, QoWorkflowCodeBlockComponent],
  templateUrl: './workflow-function-card.component.html',
  styleUrl: './workflow-function-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowFunctionCardComponent {
  readonly lang = WORKFLOW_LANGUAGE;
  item = input.required<WorkflowFunctionCardItem>();
  edit = output<string>();
  testRun = output<string>();
  duplicate = output<string>();
  delete = output<string>();
}
