import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  QoConfirmDialogComponent,
  QoConfirmDialogConfig,
  QoConfirmDialogService,
  QoToastService,
  QoWorkflowPageHeaderComponent,
  QoWorkflowToolbarComponent,
} from '@qo/ui-components';
import { WorkflowActionButtonTableComponent } from '../../components/action-buttons/workflow-action-button-table';
import { WorkflowButtonCreateModalComponent } from '../../components/action-buttons/workflow-button-create-modal';
import { WorkflowBuilderFacadeService } from '../../services/workflow-builder-facade.service';
import { WorkflowBuilderI18nService } from '../../services/workflow-builder-i18n.service';
import { WORKFLOW_LANGUAGE } from '../../services/workflow-language';
import { WorkflowActionButtonListItem } from '../../models/workflow-builder-ui.model';

@Component({
  selector: 'app-workflow-action-buttons',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoDirective,
    QoConfirmDialogComponent,
    QoWorkflowPageHeaderComponent,
    QoWorkflowToolbarComponent,
    WorkflowActionButtonTableComponent,
    WorkflowButtonCreateModalComponent,
  ],
  templateUrl: './workflow-action-buttons.component.html',
  styleUrl: './workflow-action-buttons.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowActionButtonsComponent {
  readonly lang = WORKFLOW_LANGUAGE;
  readonly facade = inject(WorkflowBuilderFacadeService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toast = inject(QoToastService);
  private readonly confirmDialog = inject(QoConfirmDialogService);
  private readonly i18n = inject(WorkflowBuilderI18nService);
  readonly createModalOpen = signal(false);
  readonly editorMode = signal<'create' | 'edit'>('create');
  readonly editingActionId = signal<string | null>(null);
  readonly pendingDeleteActionId = signal<string | null>(null);
  readonly confirmConfig = signal<QoConfirmDialogConfig | null>(null);
  readonly saving = signal(false);
  readonly availableWorkflows = computed(() => {
    const names = this.facade.workflows().map((workflow) => workflow.name);
    const selectedWorkflowName = this.buttonForm?.controls.linkedWorkflowId.value;
    const fallbackNames = names.length ? names : [this.lang.fallbacks.actionButtons.employeeApprovalFlow];

    return selectedWorkflowName && !fallbackNames.includes(selectedWorkflowName)
      ? [selectedWorkflowName, ...fallbackNames]
      : fallbackNames;
  });
  readonly buttonForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    actionType: ['workflow', Validators.required],
    linkedWorkflowId: ['', Validators.required],
    scope: [this.lang.fallbacks.actionButtons.defaultScope as WorkflowActionButtonListItem['scope'], Validators.required],
    source: ['', Validators.required],
    usedIn: ['', Validators.required],
    status: ['active' as WorkflowActionButtonListItem['status'], Validators.required],
  });

  constructor() {
    this.facade.setActiveSection('action-buttons');
    void this.facade.initialize();
  }

  onCreateAction(): void {
    this.editorMode.set('create');
    this.editingActionId.set(null);
    this.buttonForm.reset({
      name: '',
      actionType: 'workflow',
      linkedWorkflowId: '',
      scope: this.lang.fallbacks.actionButtons.defaultScope,
      source: '',
      usedIn: '',
      status: 'active',
    });
    this.createModalOpen.set(true);
  }

  onSearchChange(query: string): void {
    this.facade.setSearch('action-buttons', query);
  }

  async closeCreateModal(): Promise<void> {
    if (this.saving()) {
      return;
    }

    if (this.buttonForm.dirty) {
      const confirmed = await this.confirmDialog.confirm(
        this.i18n.scope('confirm.unsavedChanges.title'),
        this.i18n.scope('confirm.discardActionButtonChanges'),
        {
          confirmLabel: this.i18n.scope('confirm.unsavedChanges.confirmLabel'),
          cancelLabel: this.i18n.scope('confirm.unsavedChanges.cancelLabel'),
          danger: true,
        }
      );

      if (!confirmed) {
        return;
      }
    }

    this.createModalOpen.set(false);
  }

  onEditAction(actionId: string): void {
    const action = this.facade.buttonActions().find((item) => item.id === actionId);
    if (!action) {
      return;
    }

    this.editorMode.set('edit');
    this.editingActionId.set(actionId);
    this.buttonForm.reset({
      name: action.actionName,
      actionType: 'workflow',
      linkedWorkflowId: action.linkedWorkflow,
      scope: action.scope,
      source: action.source,
      usedIn: action.usedIn,
      status: action.status,
    });
    this.createModalOpen.set(true);
  }

  onDeleteAction(actionId: string): void {
    const action = this.facade.buttonActions().find((item) => item.id === actionId);
    this.pendingDeleteActionId.set(actionId);
    this.confirmConfig.set({
      title: this.i18n.scope('confirm.deleteActionButton.title'),
      message: this.i18n.scope('confirm.deleteActionButton.message', {
        actionName: action?.actionName ?? this.i18n.scope('confirm.unnamedActionButton'),
      }),
      confirmLabel: this.i18n.scope('confirm.deleteActionButton.confirmLabel'),
      cancelLabel: this.i18n.scope('confirm.deleteActionButton.cancelLabel'),
      danger: true,
    });
  }

  async saveButton(): Promise<void> {
    if (this.buttonForm.invalid) {
      this.buttonForm.markAllAsTouched();
      return;
    }

    try {
      this.saving.set(true);
      const value = this.buttonForm.getRawValue();
      await this.facade.upsertActionButton({
        id: this.editingActionId(),
        actionName: value.name,
        linkedWorkflow: value.linkedWorkflowId,
        scope: value.scope,
        source: value.source,
        usedIn: value.usedIn,
        status: value.status,
      });
      const toastKey = this.editorMode() === 'create' ? 'buttonCreated' : 'buttonSaved';
      this.toast.success(
        this.i18n.scope(`toast.${toastKey}.title`),
        this.i18n.scope(`toast.${toastKey}.message`)
      );
      this.createModalOpen.set(false);
      this.editingActionId.set(null);
    } catch {
      this.toast.error(
        this.i18n.scope('toast.actionButtonSaveFailed.title'),
        this.i18n.scope('toast.actionButtonSaveFailed.message')
      );
    } finally {
      this.saving.set(false);
    }
  }

  async confirmDeleteAction(): Promise<void> {
    const actionId = this.pendingDeleteActionId();
    if (!actionId) {
      this.confirmConfig.set(null);
      return;
    }

    try {
      await this.facade.deleteActionButton(actionId);
      this.toast.success(this.i18n.scope('toast.buttonDeleted.title'), this.i18n.scope('toast.buttonDeleted.message'));
    } catch {
      this.toast.error(
        this.i18n.scope('toast.actionButtonDeleteFailed.title'),
        this.i18n.scope('toast.actionButtonDeleteFailed.message')
      );
    } finally {
      this.pendingDeleteActionId.set(null);
      this.confirmConfig.set(null);
    }
  }

  cancelDeleteAction(): void {
    this.pendingDeleteActionId.set(null);
    this.confirmConfig.set(null);
  }
}
