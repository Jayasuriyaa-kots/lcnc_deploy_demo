import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { QoButtonComponent, QoIconComponent } from '@qo/ui-components';
import { WorkflowScheduleListItem } from '../../../models/workflow-builder-ui.model';
import { WORKFLOW_LANGUAGE } from '../../../services/workflow-language';

@Component({
  selector: 'app-workflow-schedule-row',
  standalone: true,
  imports: [CommonModule, TranslocoDirective, QoButtonComponent, QoIconComponent],
  templateUrl: './workflow-schedule-row.component.html',
  styleUrl: './workflow-schedule-row.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowScheduleRowComponent {
  readonly lang = WORKFLOW_LANGUAGE;
  schedule = input.required<WorkflowScheduleListItem>();
  toggleEnabled = output<string>();
  edit = output<string>();
  editCanvas = output<string>();
  delete = output<string>();
}
