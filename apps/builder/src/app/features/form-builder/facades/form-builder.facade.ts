import { Injectable, computed, signal } from '@angular/core';
import { injectBrowserStorage } from '@builder/core/services/browser-storage.service';
import { BuilderAction, BuilderField } from '@builder/features/form-builder/models/form-builder.models';
import {
  BuilderColumnFieldMapping,
  BuilderDatasourceOption
} from '@builder/features/form-builder/config/form-builder.config';
import { FormBuilderAsset } from '../services/form-builder-asset.model';
import { FormBuilderSeedService } from '../services/form-builder-seed.service';
import { FormBuilderFieldFactoryService } from '../services/form-builder-field-factory.service';

export type { FormBuilderAsset } from '../services/form-builder-asset.model';

// Facade owns all form-builder state/signals and orchestration.
// Pure computation is delegated to seed and field factory services.
@Injectable({ providedIn: 'root' })
export class FormBuilderFacade {
  private readonly formsStorageKey = 'qo.builder.form-builder.forms.v2';
  private readonly selectedFormStorageKey = 'qo.builder.form-builder.selected-form.v1';
  private readonly storage = injectBrowserStorage();
  private readonly seed: FormBuilderSeedService;
  private readonly fieldFactory: FormBuilderFieldFactoryService;

  readonly datasourceOptions: BuilderDatasourceOption[];

  private readonly formsState = signal<FormBuilderAsset[]>([]);
  private readonly selectedFormIdState = signal('');
  private readonly createWizardOpenState = signal(false);
  private readonly formSettingsOpenState = signal(false);
  private readonly previewOpenState = signal(false);


  readonly forms = this.formsState.asReadonly();
  readonly formItems = computed(() =>
    this.formsState().map(
      ({ description, datasourceId, datasourceLabel, queryId, queryLabel, queryText,
         queryQualifiedName, expectedDatasourceInput, fieldMappings, userId, jwtToken,
         createdAt, modifiedAt, fields, settings, actions, ...item }) => item
    )
  );
  readonly selectedForm = computed(
    () => this.formsState().find((form) => form.id === this.selectedFormIdState()) ?? this.formsState()[0] ?? null
  );
  readonly createWizardOpen = computed(() => this.createWizardOpenState());
  readonly formSettingsOpen = computed(() => this.formSettingsOpenState());
  readonly previewOpen = computed(() => this.previewOpenState());

  constructor(seed: FormBuilderSeedService, fieldFactory: FormBuilderFieldFactoryService) {
    this.seed = seed;
    this.fieldFactory = fieldFactory;
    this.datasourceOptions = this.seed.datasourceOptions;
    this.formsState.set(this.loadFormsState());
    this.selectedFormIdState.set(this.loadSelectedFormId());
  }


  // Selects a form and stores the choice so refresh keeps the same form open.
  selectForm(formId: string): void {
    this.selectedFormIdState.set(formId);
    this.persistSelectedFormId(formId);
  }

  // Opens the form creation wizard.
  openCreateWizard(): void { this.createWizardOpenState.set(true); }
  // Closes the form creation wizard.
  closeCreateWizard(): void { this.createWizardOpenState.set(false); }

  // Opens settings and optionally switches the active form first.
  openFormSettings(formId?: string): void {
    if (formId) {
      this.selectedFormIdState.set(formId);
      this.persistSelectedFormId(formId);
    }
    this.formSettingsOpenState.set(true);
  }
  // Closes the form settings modal.
  closeFormSettings(): void { this.formSettingsOpenState.set(false); }

  // Opens the preview modal for the selected form.
  openPreview(): void { this.previewOpenState.set(true); }
  // Closes the preview modal.
  closePreview(): void { this.previewOpenState.set(false); }

  // No-op wrapper: all mutations auto-persist, kept for backward compatibility.
  saveFormsState(): void {
    this.persistForms(this.formsState());
    this.persistSelectedFormId(this.selectedFormIdState());
  }


  // Creates a new datasource-backed form from wizard selections.
  createForm(config: {
    name: string;
    description: string;
    datasourceId: string;
    queryId: string;
    columnMappings: BuilderColumnFieldMapping[];
  }): void {
    const datasource = this.datasourceOptions.find((item) => item.id === config.datasourceId);
    const query = datasource?.queries.find((item) => item.id === config.queryId);
    if (!datasource || !query) return;

    const now = new Date().toISOString();
    const nextId = this.fieldFactory.createUuid();
    const newForm = this.seed.createSeedForm({
      id: nextId,
      shortCode: this.fieldFactory.getShortCode(config.name),
      name: config.name,
      status: 'draft',
      datasourceId: datasource.id,
      queryId: query.id,
      columnMappings: config.columnMappings,
      description: config.description.trim() || `Build and publish ${config.name} using ${datasource.label} and ${query.label}.`,
      createdAt: now,
      modifiedAt: now
    });

    this.setFormsState([newForm, ...this.formsState()]);
    this.selectedFormIdState.set(newForm.id);
    this.persistSelectedFormId(newForm.id);
    this.createWizardOpenState.set(false);
  }

  // Clones an existing form and gives the copied fields fresh ids.
  duplicateForm(formId: string): void {
    const existing = this.formsState().find((form) => form.id === formId);
    if (!existing) return;

    const duplicate: FormBuilderAsset = {
      ...this.cloneForm(existing),
      id: this.fieldFactory.createUuid(),
      name: `${existing.name} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      fields: existing.fields.map((field) => ({
        ...this.fieldFactory.cloneField(field),
        id: this.fieldFactory.createUuid('field')
      }))
    };

    this.setFormsState([duplicate, ...this.formsState()]);
    this.selectedFormIdState.set(duplicate.id);
    this.persistSelectedFormId(duplicate.id);
  }

  // Deletes a form and moves selection to the nearest remaining form.
  deleteForm(formId: string): void {
    const forms = this.formsState();
    const index = forms.findIndex((form) => form.id === formId);
    if (index === -1) return;

    const nextForms = forms.filter((form) => form.id !== formId);
    this.setFormsState(nextForms);

    if (this.selectedFormIdState() === formId) {
      const nextSelectedId = nextForms[index]?.id ?? nextForms[index - 1]?.id ?? '';
      this.selectedFormIdState.set(nextSelectedId);
      this.persistSelectedFormId(nextSelectedId);
    }
  }

  // Marks the selected form as live/published.
  publishForm(formId: string): void {
    this.updateFormMeta(formId, { status: 'live' });
  }

  // Updates the selected form status to draft/live.
  setFormStatus(formId: string, status: FormBuilderAsset['status']): void {
    this.updateFormMeta(formId, { status });
  }

  // Updates only top-level form metadata.
  updateFormMeta(formId: string, patch: Partial<Pick<FormBuilderAsset, 'name' | 'description' | 'status'>>): void {
    this.updateForm(formId, (form) => ({ ...form, ...patch }));
  }

  // Replaces form settings with a cloned settings object.
  updateFormSettings(formId: string, settings: FormBuilderAsset['settings']): void {
    this.updateForm(formId, (form) => ({ ...form, settings: { ...settings } }));
  }

  // Replaces action button configuration while avoiding shared references.
  updateFormActions(formId: string, actions: BuilderAction[]): void {
    this.updateForm(formId, (form) => ({ ...form, actions: actions.map((action) => ({ ...action })) }));
  }


  // Replaces one field after inspector edits.
  updateField(formId: string, updatedField: BuilderField): void {
    this.updateForm(formId, (form) => ({
      ...form,
      fields: form.fields.map((field) =>
        field.id === updatedField.id ? this.fieldFactory.cloneField(updatedField) : field
      )
    }));
  }

  // Appends a new field to the form canvas.
  addField(formId: string, field: BuilderField): void {
    this.updateForm(formId, (form) => ({
      ...form,
      fields: [...form.fields, this.fieldFactory.cloneField(field)]
    }));
  }

  // Removes a field by id from the form canvas.
  removeField(formId: string, fieldId: string): void {
    this.updateForm(formId, (form) => ({
      ...form,
      fields: form.fields.filter((field) => field.id !== fieldId)
    }));
  }

  // Moves a field one position up or down and returns the moved field.
  moveField(formId: string, fieldId: string, direction: -1 | 1): BuilderField | null {
    const form = this.formsState().find((item) => item.id === formId);
    if (!form) return null;

    const index = form.fields.findIndex((field) => field.id === fieldId);
    const targetIndex = index + direction;
    if (index === -1 || targetIndex < 0 || targetIndex >= form.fields.length) return null;

    const nextFields = [...form.fields];
    const [movedField] = nextFields.splice(index, 1);
    nextFields.splice(targetIndex, 0, movedField);

    this.updateForm(formId, (current) => ({
      ...current,
      fields: nextFields.map((field) => this.fieldFactory.cloneField(field))
    }));

    return movedField;
  }

  // Reorders fields after drag/drop and returns the moved field.
  reorderFields(formId: string, previousIndex: number, currentIndex: number): BuilderField | null {
    const form = this.formsState().find((item) => item.id === formId);
    if (!form || previousIndex === currentIndex) return null;

    const nextFields = [...form.fields];
    const [movedField] = nextFields.splice(previousIndex, 1);
    if (!movedField) return null;
    nextFields.splice(currentIndex, 0, movedField);

    this.updateForm(formId, (current) => ({
      ...current,
      fields: nextFields.map((field) => this.fieldFactory.cloneField(field))
    }));

    return movedField;
  }


  // Applies a single form mutation, refreshes modifiedAt, and persists.
  private updateForm(formId: string, updater: (form: FormBuilderAsset) => FormBuilderAsset): void {
    const forms = this.formsState();
    const index = forms.findIndex((form) => form.id === formId);
    if (index === -1) return;

    const nextForms = [...forms];
    nextForms[index] = {
      ...updater(this.cloneForm(nextForms[index])),
      modifiedAt: new Date().toISOString()
    };
    this.setFormsState(nextForms);
  }

  // Sets cloned form state so callers cannot mutate signal data by reference.
  private setFormsState(forms: FormBuilderAsset[]): void {
    const nextForms = forms.map((form) => this.cloneForm(form));
    this.formsState.set(nextForms);
    this.persistForms(nextForms);
  }

  // Loads forms from storage or falls back to bundled seed forms.
  private loadFormsState(): FormBuilderAsset[] {
    const parsed = this.storage.getJson<FormBuilderAsset[]>(this.formsStorageKey);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return this.seed.createDefaultForms();
    }
    return parsed.map((form) => this.cloneForm(form));
  }

  // Loads the last selected form id with the first seed form as fallback.
  private loadSelectedFormId(): string {
    const fallbackId = this.seed.createDefaultForms()[0]?.id ?? '';
    return this.storage.getString(this.selectedFormStorageKey) ?? fallbackId;
  }

  // Persists the full forms collection to browser storage.
  private persistForms(forms: FormBuilderAsset[]): void {
    this.storage.setJson(this.formsStorageKey, forms);
  }

  // Persists only the selected form id.
  private persistSelectedFormId(formId: string): void {
    this.storage.setString(this.selectedFormStorageKey, formId);
  }

  // Deep-clones a form to keep state updates immutable.
  private cloneForm(form: FormBuilderAsset): FormBuilderAsset {
    return {
      ...form,
      expectedDatasourceInput: (form.expectedDatasourceInput ?? []).map((item) => ({ ...item })),
      fieldMappings: (form.fieldMappings ?? []).map((mapping) => ({ ...mapping })),
      settings: { ...form.settings },
      actions: (form.actions ?? []).map((action) => ({ ...action })),
      fields: (form.fields ?? []).map((field) => this.fieldFactory.cloneField(field))
    };
  }
}
