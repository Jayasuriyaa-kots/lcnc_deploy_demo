import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { QoIconComponent } from '@qo/ui-components';
import { WORKFLOW_LANGUAGE } from '../../../../services/workflow-language';

@Component({
  selector: 'app-workflow-editor-zoom-controls',
  standalone: true,
  imports: [CommonModule, TranslocoDirective, QoIconComponent],
  templateUrl: './workflow-editor-zoom-controls.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowEditorZoomControlsComponent {
  readonly lang = WORKFLOW_LANGUAGE;
  readonly zoomLabel = input('100%');

  readonly zoomIn = output<void>();
  readonly zoomOut = output<void>();
  readonly resetZoom = output<void>();
}
