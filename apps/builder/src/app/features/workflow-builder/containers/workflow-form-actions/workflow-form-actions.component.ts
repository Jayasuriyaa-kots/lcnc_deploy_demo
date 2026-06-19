import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  QoConfirmDialogService,
  QoToastService,
  QoWorkflowPageHeaderComponent,
  QoWorkflowToolbarComponent,
  SelectOption,
} from '@qo/ui-components';
import { FormBuilderFacadeService } from '@builder/features/form-builder/services/form-builder-facade.service';
import { WorkflowBuilderFacadeService } from '../../services/workflow-builder-facade.service';
import { WorkflowBuilderI18nService } from '../../services/workflow-builder-i18n.service';
import { WORKFLOW_LANGUAGE } from '../../services/workflow-language';
import { WorkflowFlowCreateModalComponent } from '../../components/form-actions/workflow-flow-create-modal';
import { WorkflowFormActionListComponent } from '../../components/form-actions/workflow-form-action-list';

@Component({
  selector: 'app-workflow-form-actions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoDirective,
    QoWorkflowPageHeaderComponent,
    QoWorkflowToolbarComponent,
    WorkflowFlowCreateModalComponent,
    WorkflowFormActionListComponent,
  ],
  templateUrl: './workflow-form-actions.component.html',
  styleUrl: './workflow-form-actions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowFormActionsComponent {
  readonly lang = WORKFLOW_LANGUAGE;
  readonly facade = inject(WorkflowBuilderFacadeService);
  private readonly formBuilderFacade = inject(FormBuilderFacadeService);
  private readonly router = inject(Router);
  private readonly toast = inject(QoToastService);
  private readonly confirmDialog = inject(QoConfirmDialogService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly i18n = inject(WorkflowBuilderI18nService);
  readonly createModalOpen = signal(false);
  readonly creating = signal(false);
  readonly createFlowForm = this.formBuilder.nonNullable.group({
    formId: ['', Validators.required],
    recordEvent: ['record_edited', Validators.required],
    formEvent: ['', Validators.required],
    name: ['', [Validators.required, Validators.minLength(2)]],
  });
  readonly formOptions = computed<SelectOption[]>(() => {
    const items = this.formBuilderFacade.formItems();

    if (!items.length) {
      return [{ label: this.lang.formLabels.managerAttendanceForm, value: 'manager_attendance_form' }];
    }

    return items.map((form) => ({
      label: form.name,
      value: form.id,
    }));
  });
  readonly executionCounts = computed(() => {
    const entries = this.facade.formActionWorkflows().map((workflow) => [
      workflow.id,
      this.facade.executionRuns()[workflow.id]?.length ?? 0,
    ]);

    return Object.fromEntries(entries);
  });

  constructor() {
    this.facade.setActiveSection('form-actions');
    void this.facade.initialize();
  }

  onCreateFlow(): void {
    this.createFlowForm.reset({
      formId: String(this.formOptions()[0]?.value ?? ''),
      recordEvent: 'record_edited',
      formEvent: '',
      name: '',
    });
    this.createModalOpen.set(true);
  }

  async closeCreateFlow(): Promise<void> {
    if (this.creating()) {
      return;
    }

    if (this.createFlowForm.dirty) {
      const confirmed = await this.confirmDialog.confirm(
        this.i18n.scope('confirm.unsavedChanges.title'),
        this.i18n.scope('confirm.discardWorkflowDraft'),
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

  async createFlow(): Promise<void> {
    if (this.createFlowForm.invalid) {
      this.createFlowForm.markAllAsTouched();
      return;
    }

    try {
      this.creating.set(true);
      const { formId, recordEvent, formEvent, name } = this.createFlowForm.getRawValue();
      const selectedForm = this.formOptions().find((option) => option.value === formId);
      const workflow = await this.facade.createFormActionWorkflow({
        formId,
        formName: selectedForm?.label ?? this.lang.formLabels.chooseForm,
        recordEvent,
        formEvent,
        name,
      });
      this.createModalOpen.set(false);
      await this.router.navigate(['/workflow-builder', workflow.id, 'edit']);
    } catch {
      this.toast.error(
        this.i18n.scope('toast.createFlowFailed.title'),
        this.i18n.scope('toast.createFlowFailed.message')
      );
    } finally {
      this.creating.set(false);
    }
  }

  onSearchChange(query: string): void {
    this.facade.setSearch('form-actions', query);
  }

  onSelectWorkflow(workflowId: string): void {
    void this.facade.selectWorkflow(workflowId);
  }

  onOpenHistory(workflowId: string): void {
    void this.facade.selectWorkflow(workflowId);
    this.toast.info(this.i18n.scope('toast.runHistory.title'), this.i18n.scope('toast.runHistory.message'));
  }

  onEditWorkflow(workflowId: string): void {
    void this.facade.selectWorkflow(workflowId);
    void this.router.navigate(['/workflow-builder', workflowId, 'edit']);
  }
}
