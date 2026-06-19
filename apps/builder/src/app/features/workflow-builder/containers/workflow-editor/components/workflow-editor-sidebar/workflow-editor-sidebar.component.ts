import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { QoButtonComponent, QoEmptyStateComponent, QoIconComponent, QoInputComponent } from '@qo/ui-components';
import { WorkflowPaletteGroup, WorkflowPaletteNode } from '../../../../models/workflow-editor-palette.config';
import { WORKFLOW_LANGUAGE } from '../../../../services/workflow-language';

export interface WorkflowEditorPaletteDragStart {
  event: DragEvent;
  node: WorkflowPaletteNode;
}

@Component({
  selector: 'app-workflow-editor-sidebar',
  standalone: true,
  imports: [CommonModule, TranslocoDirective, TranslocoPipe, QoButtonComponent, QoEmptyStateComponent, QoIconComponent, QoInputComponent],
  templateUrl: './workflow-editor-sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowEditorSidebarComponent {
  readonly lang = WORKFLOW_LANGUAGE;
  readonly workflowName = input(this.lang.editor.workflowEditor);
  readonly workflowStatusLabel = input('draft');
  readonly workflowVersionLabel = input('v1');
  readonly paletteSearch = input('');
  readonly paletteEmpty = input(false);
  readonly paletteGroups = input<WorkflowPaletteGroup[]>([]);
  readonly saving = input(false);

  readonly back = output<void>();
  readonly paletteSearchChange = output<string>();
  readonly paletteDragStart = output<WorkflowEditorPaletteDragStart>();
  readonly saveWorkflow = output<void>();
}
