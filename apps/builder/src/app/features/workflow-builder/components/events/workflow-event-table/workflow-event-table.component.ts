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
import { WorkflowEventListItem } from '../../../models/workflow-builder-ui.model';
import { WorkflowEventTriggerBadgeComponent } from '../workflow-event-trigger-badge';
import { WORKFLOW_LANGUAGE } from '../../../services/workflow-language';

@Component({
  selector: 'app-workflow-event-table',
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
    WorkflowEventTriggerBadgeComponent,
  ],
  templateUrl: './workflow-event-table.component.html',
  styleUrl: './workflow-event-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowEventTableComponent {
  readonly lang = WORKFLOW_LANGUAGE;
  events = input<WorkflowEventListItem[]>([]);
  edit = output<string>();
  delete = output<string>();

  eventRows(): TableRow[] {
    return this.events() as unknown as TableRow[];
  }

  eventRow(row: TableRow): WorkflowEventListItem {
    return row as unknown as WorkflowEventListItem;
  }
}
