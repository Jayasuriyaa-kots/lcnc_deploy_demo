import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import {
  QoButtonComponent,
  QoEmptyStateComponent,
  QoTableColumnDirective,
  QoTableComponent,
  TableRow,
  QoWorkflowStatusBadgeComponent,
} from '@qo/ui-components';
import { WorkflowActionButtonListItem } from '../../../models/workflow-builder-ui.model';
import { WORKFLOW_LANGUAGE } from '../../../services/workflow-language';

@Component({
  selector: 'app-workflow-action-button-table',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoDirective,
    TranslocoPipe,
    QoButtonComponent,
    QoEmptyStateComponent,
    QoTableColumnDirective,
    QoTableComponent,
    QoWorkflowStatusBadgeComponent,
  ],
  templateUrl: './workflow-action-button-table.component.html',
  styleUrl: './workflow-action-button-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowActionButtonTableComponent {
  readonly lang = WORKFLOW_LANGUAGE;
  actions = input<WorkflowActionButtonListItem[]>([]);
  edit = output<string>();
  delete = output<string>();

  actionRows(): TableRow[] {
    return this.actions() as unknown as TableRow[];
  }

  actionRow(row: TableRow): WorkflowActionButtonListItem {
    return row as unknown as WorkflowActionButtonListItem;
  }
}
