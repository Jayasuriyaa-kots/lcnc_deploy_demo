import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormBuilderFacadeService } from '@builder/features/form-builder/services/form-builder-facade.service';
import { FormBuilderFieldFactoryService } from '@builder/features/form-builder/services/form-builder-field-factory.service';
import { FormBuilderSubmissionStorageService } from '@builder/features/form-builder/services/form-builder-submission-storage.service';
import { FormBuilderI18nService } from '@builder/features/form-builder/services/form-builder-i18n.service';
import { getBuilderStatusPresentation } from '@builder/shared/utils/builder-status.util';
import { BuilderAction, BuilderField, LibraryField } from '@builder/features/form-builder/models/form-builder.models';
import { FieldDropEvent } from '@builder/features/form-builder/components/form-fields-list/form-fields-list.component';
import { CreateWizardResult } from '@builder/features/form-builder/containers';
import { FormSettings } from '@builder/features/form-builder/components/form-preview-modal/form-preview-modal.component';
import { QoConfirmDialogConfig, QoToastService } from '@qo/ui-components';

@Injectable()
export class FormBuilderPageFacade {
  private readonly state = inject(FormBuilderFacadeService);
  private readonly fieldFactory = inject(FormBuilderFieldFactoryService);
  private readonly submissionStorage = inject(FormBuilderSubmissionStorageService);
  private readonly toast = inject(QoToastService);
  private readonly i18n = inject(FormBuilderI18nService);

  readonly t = this.i18n.t.bind(this.i18n);
  readonly datasourceOptions = this.state.datasourceOptions;
  readonly createWizardOpen = this.state.createWizardOpen;
  readonly previewOpen = this.state.previewOpen;
  readonly minDesktopWidth = 1024;
  readonly hasDesktopViewport = signal(this.readViewportWidth() >= this.minDesktopWidth);

  readonly sidePanel = signal<'none' | 'library' | 'inspector'>('none');
  readonly selectedField = signal<BuilderField | null>(null);
  readonly librarySearch = signal('');
  readonly submissionsViewerOpen = signal(false);
  readonly confirmConfig = signal<QoConfirmDialogConfig | null>(null);
  private pendingConfirmAction: (() => void) | null = null;

  readonly currentForm = computed(() => this.state.selectedForm());
  readonly rows = computed(() => this.currentForm()?.fields ?? []);
  readonly actions = computed(() => this.currentForm()?.actions ?? []);
  readonly existingFormNames = computed(() => this.state.formItems().map((item) => item.name));
  readonly showSidePanel = computed(() => {
    const panel = this.sidePanel();
    return panel === 'library' || (panel === 'inspector' && !!this.selectedField());
  });
  readonly formSettings = computed<FormSettings>(() => {
    return this.currentForm()?.settings ?? {
      formLayout: 'Single Column',
      labelPlacement: 'Top',
      showSectionBorders: false,
      submitBehavior: 'Show Message',
      duplicateDetection: 'None',
    };
  });
  readonly formMeta = computed(() => {
    const form = this.currentForm();
    const status = getBuilderStatusPresentation(form?.status ?? 'draft');
    return {
      name: form?.name ?? '',
      description: form?.description ?? '',
      datasourceLabel: form?.datasourceLabel ?? '',
      queryLabel: form?.queryLabel ?? '',
      fieldCount: this.rows().length,
      status: status.badgeLabel.toLowerCase(),
    };
  });
  readonly currentFormSubmissions = computed(() => {
    const form = this.currentForm();
    if (!form) return null;
    return this.submissionStorage.getSubmissionsForForm({
      formId: form.id,
      formName: form.name,
    });
  });

  constructor() {
    // Only react to persisted form changes — never track selectedField/sidePanel here.
    // Reading and writing the same signal inside an effect causes an infinite loop (page hang).
    effect(() => {
      const form = this.state.selectedForm();

      untracked(() => {
        const selectedId = this.selectedField()?.id;
        const nextSelected = selectedId
          ? (form?.fields.find((field) => field.id === selectedId) ?? null)
          : null;

        this.selectedField.set(nextSelected ? this.fieldFactory.cloneField(nextSelected) : null);

        if (this.sidePanel() === 'inspector' && !nextSelected) {
          this.sidePanel.set('none');
        }
      });
    });
  }

  isFormSettingsOpen(): boolean {
    return this.state.formSettingsOpen();
  }

  onFieldSelected(field: BuilderField): void {
    this.selectedField.set(this.fieldFactory.cloneField(field));
    this.sidePanel.set('inspector');
  }

  onFieldInspect(field: BuilderField): void {
    this.selectedField.set(this.fieldFactory.cloneField(field));
    this.sidePanel.set('inspector');
  }

  onFieldChanged(field: BuilderField): void {
    const form = this.currentForm();
    if (!form) return;
    const nextField = this.fieldFactory.cloneField(field);
    this.state.updateField(form.id, nextField);
    this.selectedField.set(nextField);
  }

  onFieldDeleted(fieldId: string): void {
    const form = this.currentForm();
    if (!form) return;
    const field = this.rows().find((row) => row.id === fieldId);
    if (!field) return;
    this.pendingConfirmAction = () => this.performFieldDeletion(fieldId);
    this.confirmConfig.set({
      title: this.i18n.scope('confirm.deleteFieldTitle'),
      message: this.i18n.scope('confirm.deleteFieldMessage', { fieldLabel: field.label }),
      confirmLabel: this.i18n.common('delete'),
      cancelLabel: this.i18n.common('cancel'),
      danger: true,
    });
  }

  onFieldMoved(event: { fieldId: string; direction: -1 | 1 }): void {
    const form = this.currentForm();
    if (!form) return;
    const movedField = this.state.moveField(form.id, event.fieldId, event.direction);
    if (movedField) this.selectedField.set(this.fieldFactory.cloneField(movedField));
  }

  onFieldDropped(event: FieldDropEvent): void {
    const form = this.currentForm();
    if (!form) return;
    const movedField = this.state.reorderFields(form.id, event.previousIndex, event.currentIndex);
    if (movedField) this.selectedField.set(this.fieldFactory.cloneField(movedField));
  }

  onFieldAdded(libField: LibraryField): void {
    const form = this.currentForm();
    if (!form) return;
    const nextField = this.fieldFactory.createFieldFromLibrary(libField, this.rows());
    this.state.addField(form.id, nextField);
    this.selectedField.set(this.fieldFactory.cloneField(nextField));
    this.sidePanel.set('inspector');
  }

  openFieldLibrary(): void {
    this.sidePanel.set('library');
  }

  closePanel(): void {
    this.sidePanel.set('none');
  }

  openCreateWizard(): void {
    this.state.openCreateWizard();
  }

  cancelCreateWizard(): void {
    this.state.closeCreateWizard();
  }

  openPreview(): void {
    if (this.currentForm()) this.state.openPreview();
  }

  closePreview(): void {
    this.state.closePreview();
  }

  openSubmissionsViewer(): void {
    this.submissionsViewerOpen.set(true);
  }

  closeSubmissionsViewer(): void {
    this.submissionsViewerOpen.set(false);
  }

  openSettings(): void {
    this.state.openFormSettings();
  }

  closeSettings(): void {
    this.state.closeFormSettings();
  }

  onFormCreated(result: CreateWizardResult): void {
    this.state.createForm({
      name: result.name,
      description: result.description,
      datasourceId: result.datasourceId,
      queryId: result.queryId,
      columnMappings: result.columnMappings,
    });
  }

  onSettingsSaved(data: { name: string; description: string; settings: FormSettings }): void {
    const form = this.currentForm();
    if (!form) return;
    this.state.updateFormMeta(form.id, { name: data.name, description: data.description });
    this.state.updateFormSettings(form.id, data.settings);
    this.state.closeFormSettings();
  }

  onDescriptionChange(newDesc: string): void {
    const form = this.currentForm();
    if (form) this.state.updateFormMeta(form.id, { description: newDesc });
  }

  onActionsChanged(actions: BuilderAction[]): void {
    const form = this.currentForm();
    if (form) this.state.updateFormActions(form.id, actions);
  }

  publishForm(): void {
    const form = this.currentForm();
    if (!form) return;
    this.pendingConfirmAction = () => {
      this.state.publishForm(form.id);
      this.toast.success(this.i18n.scope('toast.formPublished'));
    };
    this.confirmConfig.set({
      title: this.i18n.scope('confirm.publishFormTitle'),
      message: this.i18n.scope('confirm.publishFormMessage', { formName: form.name }),
      confirmLabel: this.i18n.common('saveAndPublish'),
      cancelLabel: this.i18n.common('cancel'),
      danger: false,
    });
  }

  clearCurrentFormSubmissions(): void {
    const form = this.currentForm();
    if (!form) return;
    const recordCount = this.currentFormSubmissions()?.records.length ?? 0;
    this.pendingConfirmAction = () => {
      this.submissionStorage.clearSubmissionsForForm({
        formId: form.id,
        formName: form.name,
      });
      this.toast.success(this.i18n.scope('toast.submissionsCleared'));
    };
    this.confirmConfig.set({
      title: this.i18n.scope('confirm.clearSubmissionsTitle'),
      message: this.i18n.scope('confirm.clearSubmissionsMessage', { count: recordCount, formName: form.name }),
      confirmLabel: this.i18n.common('clear'),
      cancelLabel: this.i18n.common('cancel'),
      danger: true,
    });
  }

  confirmPendingAction(): void {
    if (!this.pendingConfirmAction) {
      this.cancelPendingAction();
      return;
    }
    this.pendingConfirmAction();
    this.cancelPendingAction();
  }

  cancelPendingAction(): void {
    this.pendingConfirmAction = null;
    this.confirmConfig.set(null);
  }

  onEscape(): void {
    if (this.confirmConfig()) {
      this.cancelPendingAction();
      return;
    }
    if (this.previewOpen()) {
      this.closePreview();
      return;
    }
    if (this.submissionsViewerOpen()) {
      this.closeSubmissionsViewer();
      return;
    }
    if (this.isFormSettingsOpen()) {
      this.closeSettings();
      return;
    }
    if (this.sidePanel() !== 'none') {
      this.closePanel();
    }
  }

  onWindowResize(): void {
    this.hasDesktopViewport.set(this.readViewportWidth() >= this.minDesktopWidth);
  }

  private performFieldDeletion(fieldId: string): void {
    const form = this.currentForm();
    if (!form) return;
    const currentRows = this.rows();
    const currentIndex = currentRows.findIndex((row) => row.id === fieldId);
    this.state.removeField(form.id, fieldId);

    if (this.selectedField()?.id === fieldId) {
      const remainingRows = currentRows.filter((row) => row.id !== fieldId);
      const nextField = remainingRows[currentIndex] ?? remainingRows[currentIndex - 1] ?? null;
      this.selectedField.set(nextField ? this.fieldFactory.cloneField(nextField) : null);
      if (!nextField) this.sidePanel.set('none');
    }

    this.toast.success(this.i18n.scope('toast.fieldDeleted'));
  }

  private readViewportWidth(): number {
    return typeof window === 'undefined' ? this.minDesktopWidth : window.innerWidth;
  }
}
