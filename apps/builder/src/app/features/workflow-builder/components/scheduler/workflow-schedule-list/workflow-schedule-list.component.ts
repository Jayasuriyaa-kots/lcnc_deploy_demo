import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { QoEmptyStateComponent } from '@qo/ui-components';
import { WorkflowScheduleListItem } from '../../../models/workflow-builder-ui.model';
import { WorkflowScheduleRowComponent } from '../workflow-schedule-row';
import { WORKFLOW_LANGUAGE } from '../../../services/workflow-language';

@Component({
  selector: 'app-workflow-schedule-list',
  standalone: true,
  imports: [CommonModule, TranslocoDirective, QoEmptyStateComponent, WorkflowScheduleRowComponent],
  templateUrl: './workflow-schedule-list.component.html',
  styleUrl: './workflow-schedule-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowScheduleListComponent {
  readonly lang = WORKFLOW_LANGUAGE;
  schedules = input<WorkflowScheduleListItem[]>([]);
  toggleEnabled = output<string>();
  edit = output<string>();
  editCanvas = output<string>();
  delete = output<string>();
}
