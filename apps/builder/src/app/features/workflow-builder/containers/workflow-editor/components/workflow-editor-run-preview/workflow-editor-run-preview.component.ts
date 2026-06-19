import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { QoIconComponent } from '@qo/ui-components';
import { WORKFLOW_LANGUAGE } from '../../../../services/workflow-language';

@Component({
  selector: 'app-workflow-editor-run-preview',
  standalone: true,
  imports: [CommonModule, TranslocoDirective, QoIconComponent],
  templateUrl: './workflow-editor-run-preview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowEditorRunPreviewComponent {
  readonly lang = WORKFLOW_LANGUAGE;
  readonly previewJson = input.required<string>();
  readonly closePreview = output<void>();
}
