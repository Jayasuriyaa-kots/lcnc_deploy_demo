import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { QoConfirmDialogService } from '@qo/ui-components';
import { WorkflowPaletteMode } from '../models/workflow-editor-palette.config';
import { WorkflowBuilderI18nService } from './workflow-builder-i18n.service';

@Injectable({ providedIn: 'root' })
export class WorkflowEditorNavigationService {
  private readonly router = inject(Router);
  private readonly confirmDialog = inject(QoConfirmDialogService);
  private readonly i18n = inject(WorkflowBuilderI18nService);

  async goBack(paletteMode: WorkflowPaletteMode): Promise<void> {
    await this.router.navigate(this.routeForPaletteMode(paletteMode));
  }

  canLeaveEditor(isDirty: boolean): boolean | Promise<boolean> {
    if (!isDirty) {
      return true;
    }

    return this.confirmDialog.confirm(
      this.i18n.scope('confirm.leaveWorkflow.title'),
      this.i18n.scope('editor.unsavedLeaveConfirm'),
      {
        confirmLabel: this.i18n.scope('confirm.leaveWorkflow.confirmLabel'),
        cancelLabel: this.i18n.scope('confirm.leaveWorkflow.cancelLabel'),
        danger: true,
      }
    );
  }

  protectBrowserUnload(event: BeforeUnloadEvent, isDirty: boolean): void {
    if (!isDirty) {
      return;
    }

    event.preventDefault();
    event.returnValue = '';
  }

  private routeForPaletteMode(paletteMode: WorkflowPaletteMode): string[] {
    if (paletteMode === 'events') {
      return ['/workflow-builder/events'];
    }

    if (paletteMode === 'scheduler') {
      return ['/workflow-builder/scheduler'];
    }

    return ['/workflow-builder/form-actions'];
  }
}
