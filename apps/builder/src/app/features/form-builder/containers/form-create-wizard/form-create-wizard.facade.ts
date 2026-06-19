import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { SelectOption } from '@qo/ui-components';
import {
  BuilderDatasourceOption,
  BuilderQueryOption,
  FORM_BUILDER_ALL_FIELDS,
  suggestFieldTypeForColumn
} from '@builder/features/form-builder/config/form-builder.config';
import { FormBuilderI18nService } from '@builder/features/form-builder/services/form-builder-i18n.service';
import { trimmedRequiredValidator, duplicateNameValidator } from './form-create-wizard-validators';
import type { CreateWizardResult } from './form-create-wizard.component';

interface DbQueryOption {
  key: string;
  datasourceId: string;
  queryId: string;
  label: string;
}

@Injectable()
export class FormCreateWizardFacade {
  private readonly i18n = inject(FormBuilderI18nService);

  readonly t = this.i18n.t.bind(this.i18n);
  readonly step = signal<1 | 2>(1);
  readonly formName = new FormControl('', { nonNullable: true, validators: [Validators.required, trimmedRequiredValidator()] });
  readonly formDescription = new FormControl('', { nonNullable: true });
  readonly selectedDatasourceId = signal('');
  readonly selectedQueryKey = signal('');
  readonly selectedFieldTypes = signal<Record<string, string>>({});

  private readonly datasourceOptions = signal<BuilderDatasourceOption[]>([]);
  private readonly existingFormNames = signal<string[]>([]);

  readonly selectedDatasource = computed(() =>
    this.datasourceOptions().find((source) => source.id === this.selectedDatasourceId()) ?? null
  );

  readonly queryOptions = computed<DbQueryOption[]>(() => {
    const datasource = this.selectedDatasource();
    if (!datasource) return [];
    return datasource.queries.map((query) => ({
      key: this.getQueryKey(datasource.id, query.id),
      datasourceId: datasource.id,
      queryId: query.id,
      label: query.qualifiedQueryName
    }));
  });

  readonly selectedQueryState = computed(() => {
    const key = this.selectedQueryKey();
    if (!key) return null;
    for (const source of this.datasourceOptions()) {
      const query = source.queries.find((item) => this.getQueryKey(source.id, item.id) === key);
      if (query) return { datasource: source, query };
    }
    return null;
  });

  readonly selectedQuery = computed<BuilderQueryOption | null>(() => this.selectedQueryState()?.query ?? null);
  readonly columns = computed(() => this.selectedQuery()?.columns ?? []);
  readonly selectedConnectionMeta = computed(() => {
    const selected = this.selectedQueryState();
    if (!selected) return null;
    return {
      qualifiedName: selected.query.qualifiedQueryName,
      datasourceLabel: selected.datasource.label,
      queryLabel: selected.query.label,
      queryText: selected.query.queryText,
      expectedInput: selected.query.expectedInput
    };
  });
  readonly availableFieldTypes = computed(() =>
    FORM_BUILDER_ALL_FIELDS.map((field) => ({ label: field.label, value: field.type }))
  );
  readonly datasourceSelectOptions = computed<SelectOption[]>(() =>
    this.datasourceOptions().map((datasource) => ({ label: datasource.label, value: datasource.id }))
  );
  readonly querySelectOptions = computed<SelectOption[]>(() =>
    this.queryOptions().map((query) => ({ label: query.label, value: query.key }))
  );

  constructor() {
    effect(() => {
      const names = this.existingFormNames();
      this.formName.setValidators([Validators.required, trimmedRequiredValidator(), duplicateNameValidator(names)]);
      this.formName.updateValueAndValidity({ emitEvent: false });
    });

    effect(() => {
      const datasources = this.datasourceOptions();
      const selectedDatasourceId = this.selectedDatasourceId();
      if (!datasources.length) { this.selectedDatasourceId.set(''); this.selectedQueryKey.set(''); this.selectedFieldTypes.set({}); return; }
      if (!selectedDatasourceId || !datasources.some((source) => source.id === selectedDatasourceId)) {
        this.selectedDatasourceId.set(datasources[0].id);
      }
    }, { allowSignalWrites: true });

    effect(() => {
      const options = this.queryOptions();
      const currentKey = this.selectedQueryKey();
      if (!options.length) { this.selectedQueryKey.set(''); this.selectedFieldTypes.set({}); return; }
      if (!currentKey || !options.some((option) => option.key === currentKey)) {
        this.applyQuerySelection(options[0].key);
      }
    }, { allowSignalWrites: true });
  }

  syncInputs(datasources: BuilderDatasourceOption[], names: string[]): void {
    this.datasourceOptions.set(datasources);
    this.existingFormNames.set(names);
  }

  selectQuery(key: string): void { this.applyQuerySelection(key); }
  selectDatasource(datasourceId: string): void { this.selectedDatasourceId.set(datasourceId); }
  updateFieldType(columnId: string, fieldType: string): void {
    this.selectedFieldTypes.update((current) => ({ ...current, [columnId]: fieldType }));
  }
  next(): void {
    if (this.step() === 1 && this.canContinue()) { this.step.set(2); return; }
    this.formName.markAsTouched();
    this.formName.updateValueAndValidity();
  }
  back(): void { this.step.set(1); }
  buildConfirmResult(): CreateWizardResult | null {
    const queryState = this.selectedQueryState();
    const name = this.formName.getRawValue().trim();
    if (!name || !queryState || !this.columns().length) { this.formName.markAsTouched(); return null; }
    return {
      name,
      description: this.formDescription.getRawValue().trim(),
      datasourceId: queryState.datasource.id,
      queryId: queryState.query.id,
      columnMappings: this.columns().map((column) => ({
        columnId: column.id,
        fieldType: this.getSelectedFieldType(column.id)
      }))
    };
  }
  resetWizard(): void {
    this.step.set(1);
    this.formName.reset('');
    this.formName.markAsPristine();
    this.formName.markAsUntouched();
    this.formDescription.reset('');
    const firstDatasource = this.datasourceOptions()[0];
    this.selectedDatasourceId.set(firstDatasource?.id ?? '');
    const firstOption = this.queryOptions()[0];
    this.applyQuerySelection(firstOption?.key ?? '');
  }
  canContinue(): boolean { return this.formName.valid && !!this.selectedQueryState(); }
  canCreate(): boolean { return this.canContinue() && this.columns().length > 0; }
  getSelectedFieldType(columnId: string): string { return this.selectedFieldTypes()[columnId] ?? ''; }
  getDisplayFieldType(columnId: string): string { return this.getSelectedFieldType(columnId); }
  isFieldTypeSelected(columnId: string, fieldType: string): boolean { return this.getDisplayFieldType(columnId) === fieldType; }
  hasFormNameError(): boolean { return this.formName.touched && this.formName.invalid; }
  getFormNameError(): string {
    if (!this.formName.touched) return '';
    if (this.formName.hasError('required') || this.formName.hasError('trimmedRequired')) return this.i18n.scope('createWizard.formNameRequired');
    if (this.formName.hasError('duplicateName')) return this.i18n.scope('createWizard.duplicateName');
    return '';
  }

  private applyQuerySelection(key: string): void {
    const nextSelection = this.resolveQueryByKey(key);
    if (!nextSelection) { this.selectedQueryKey.set(''); this.selectedFieldTypes.set({}); return; }
    this.selectedQueryKey.set(key);
    this.selectedFieldTypes.set(
      nextSelection.query.columns.reduce<Record<string, string>>((acc, column) => {
        acc[column.id] = suggestFieldTypeForColumn(column);
        return acc;
      }, {})
    );
  }

  private resolveQueryByKey(key: string): { datasource: BuilderDatasourceOption; query: BuilderQueryOption } | null {
    for (const source of this.datasourceOptions()) {
      const query = source.queries.find((item) => this.getQueryKey(source.id, item.id) === key);
      if (query) return { datasource: source, query };
    }
    return null;
  }

  private getQueryKey(datasourceId: string, queryId: string): string {
    return `${datasourceId}::${queryId}`;
  }
}
