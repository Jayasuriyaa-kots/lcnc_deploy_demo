import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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
import { WorkflowFunctionEditorModalComponent } from '../../components/functions/workflow-function-editor-modal';
import { WorkflowFunctionGridComponent } from '../../components/functions/workflow-function-grid';
import { WorkflowBuilderFacadeService } from '../../services/workflow-builder-facade.service';
import { WorkflowBuilderI18nService } from '../../services/workflow-builder-i18n.service';
import { WORKFLOW_LANGUAGE } from '../../services/workflow-language';
import { WorkflowFunctionCardItem } from '../../models/workflow-builder-ui.model';

@Component({
  selector: 'app-workflow-functions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoDirective,
    QoConfirmDialogComponent,
    QoWorkflowPageHeaderComponent,
    QoWorkflowToolbarComponent,
    WorkflowFunctionEditorModalComponent,
    WorkflowFunctionGridComponent,
  ],
  templateUrl: './workflow-functions.component.html',
  styleUrl: './workflow-functions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowFunctionsComponent {
  readonly lang = WORKFLOW_LANGUAGE;
  readonly facade = inject(WorkflowBuilderFacadeService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toast = inject(QoToastService);
  private readonly confirmDialog = inject(QoConfirmDialogService);
  private readonly i18n = inject(WorkflowBuilderI18nService);
  readonly editorOpen = signal(false);
  readonly editorMode = signal<'create' | 'edit'>('create');
  readonly editingFunctionId = signal<string | null>(null);
  readonly pendingDeleteFunctionId = signal<string | null>(null);
  readonly confirmConfig = signal<QoConfirmDialogConfig | null>(null);
  readonly saving = signal(false);
  readonly testingFunctionId = signal<string | null>(null);
  readonly functionForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    language: ['javascript' as WorkflowFunctionCardItem['language'], Validators.required],
    description: ['', Validators.required],
    code: ['', Validators.required],
  });

  constructor() {
    this.facade.setActiveSection('functions');
    void this.facade.initialize();
  }

  onCreateFunction(): void {
    this.editorMode.set('create');
    this.editingFunctionId.set(null);
    this.functionForm.reset({
      name: '',
      language: 'javascript',
      description: '',
      code: '',
    });
    this.editorOpen.set(true);
  }

  onSearchChange(query: string): void {
    this.facade.setSearch('functions', query);
  }

  onEditFunction(functionId: string): void {
    const item = this.facade.functionCards().find((card) => card.id === functionId);
    if (!item) {
      return;
    }

    this.editorMode.set('edit');
    this.editingFunctionId.set(functionId);
    this.functionForm.reset({
      name: item.name,
      language: item.language,
      description: item.description,
      code: item.code,
    });
    this.editorOpen.set(true);
  }

  async onTestRun(functionId: string): Promise<void> {
    try {
      this.testingFunctionId.set(functionId);
      await this.facade.testFunctionCard(functionId);
      this.toast.success(this.i18n.scope('toast.testRunPassed.title'), this.i18n.scope('toast.testRunPassed.message'));
    } catch {
      this.toast.error(
        this.i18n.scope('toast.functionTestRunFailed.title'),
        this.i18n.scope('toast.functionTestRunFailed.message')
      );
    } finally {
      this.testingFunctionId.set(null);
    }
  }

  async onDuplicateFunction(functionId: string): Promise<void> {
    try {
      await this.facade.duplicateFunctionCard(functionId);
      this.toast.success(
        this.i18n.scope('toast.functionDuplicated.title'),
        this.i18n.scope('toast.functionDuplicated.message')
      );
    } catch {
      this.toast.error(
        this.i18n.scope('toast.duplicateFunctionFailed.title'),
        this.i18n.scope('toast.duplicateFunctionFailed.message')
      );
    }
  }

  onDeleteFunction(functionId: string): void {
    const item = this.facade.functionCards().find((card) => card.id === functionId);
    this.pendingDeleteFunctionId.set(functionId);
    this.confirmConfig.set({
      title: this.i18n.scope('confirm.deleteFunction.title'),
      message: this.i18n.scope('confirm.deleteFunction.message', {
        functionName: item?.name ?? this.i18n.scope('confirm.unnamedFunction'),
      }),
      confirmLabel: this.i18n.scope('confirm.deleteFunction.confirmLabel'),
      cancelLabel: this.i18n.scope('confirm.deleteFunction.cancelLabel'),
      danger: true,
    });
  }

  async closeEditor(): Promise<void> {
    if (this.saving()) {
      return;
    }

    if (this.functionForm.dirty) {
      const confirmed = await this.confirmDialog.confirm(
        this.i18n.scope('confirm.unsavedChanges.title'),
        this.i18n.scope('confirm.discardFunctionChanges'),
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

    this.editorOpen.set(false);
  }

  async saveFunction(): Promise<void> {
    if (this.functionForm.invalid) {
      this.functionForm.markAllAsTouched();
      return;
    }

    try {
      this.saving.set(true);
      const value = this.functionForm.getRawValue();
      await this.facade.upsertFunctionCard({
        id: this.editingFunctionId(),
        name: value.name,
        language: value.language,
        description: value.description,
        code: value.code,
      });
      const toastKey = this.editorMode() === 'create' ? 'functionCreated' : 'functionSaved';
      this.toast.success(
        this.i18n.scope(`toast.${toastKey}.title`),
        this.i18n.scope(`toast.${toastKey}.message`)
      );
      this.editorOpen.set(false);
      this.editingFunctionId.set(null);
    } catch {
      this.toast.error(
        this.i18n.scope('toast.functionSaveFailed.title'),
        this.i18n.scope('toast.functionSaveFailed.message')
      );
    } finally {
      this.saving.set(false);
    }
  }

  async confirmDeleteFunction(): Promise<void> {
    const functionId = this.pendingDeleteFunctionId();
    if (!functionId) {
      this.confirmConfig.set(null);
      return;
    }

    try {
      await this.facade.deleteFunctionCard(functionId);
      this.toast.success(
        this.i18n.scope('toast.functionDeleted.title'),
        this.i18n.scope('toast.functionDeleted.message')
      );
    } catch {
      this.toast.error(
        this.i18n.scope('toast.functionDeleteFailed.title'),
        this.i18n.scope('toast.functionDeleteFailed.message')
      );
    } finally {
      this.pendingDeleteFunctionId.set(null);
      this.confirmConfig.set(null);
    }
  }

  cancelDeleteFunction(): void {
    this.pendingDeleteFunctionId.set(null);
    this.confirmConfig.set(null);
  }
}
