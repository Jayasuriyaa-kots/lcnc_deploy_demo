import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FormsService } from '@qo/api-client';
import { FormField, WorkflowDetail, WorkflowTriggerConfig } from '@qo/models';
import { BuilderField } from '@builder/features/form-builder/models/form-builder.models';
import { FormBuilderAsset, FormBuilderFacadeService } from '@builder/features/form-builder/services/form-builder-facade.service';
import { WORKFLOW_LANGUAGE } from './workflow-language';

export interface WorkflowFormQueryInput {
  key: string;
  label: string;
  type?: string;
  required?: boolean;
}

export interface WorkflowFormDatasourceQuery {
  datasourceId: string;
  datasourceLabel: string;
  queryId: string;
  queryLabel: string;
  queryText?: string;
  queryQualifiedName?: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  expectedInput: WorkflowFormQueryInput[];
  fieldMappings: Record<string, string>;
}

export interface WorkflowFormContext {
  fields: FormField[];
  datasourceQueries: WorkflowFormDatasourceQuery[];
}

type FormBuilderAssetWithQuery = FormBuilderAsset & {
  queryId?: string;
  queryLabel?: string;
  queryText?: string;
  queryQualifiedName?: string;
  expectedDatasourceInput?: unknown;
  fieldMappings?: unknown;
};

@Injectable({ providedIn: 'root' })
export class WorkflowFormContextService {
  private readonly lang = WORKFLOW_LANGUAGE;
  private readonly formBuilderFacade = inject(FormBuilderFacadeService);
  private readonly formsService = inject(FormsService);

  async loadContext(workflow: WorkflowDetail): Promise<WorkflowFormContext> {
    const formId = this.triggerConfigValue(workflow.triggerConfig, 'formId');

    if (!formId) {
      return { fields: [], datasourceQueries: [] };
    }

    const formBuilderForm = this.formBuilderFacade.forms().find((form) => form.id === formId);

    if (formBuilderForm) {
      const fields = formBuilderForm.fields.map((field) => this.toWorkflowField(field));

      return {
        fields,
        datasourceQueries: this.toDatasourceQueries(formBuilderForm as FormBuilderAssetWithQuery, fields),
      };
    }

    const forms = await firstValueFrom(this.formsService.getForms(workflow.appId));
    const legacyForm = forms.find((form) => form.id === formId);

    return {
      fields: legacyForm?.fields ?? [],
      datasourceQueries: [],
    };
  }

  private toWorkflowField(field: BuilderField): FormField {
    return {
      id: field.id,
      name: field.binding || field.properties.fieldLinkName || field.id,
      label: field.label,
      type: this.normalizeFieldType(field.type),
      required: field.properties.required === true || field.properties.mandatory === true,
      options: this.optionsForField(field),
      placeholder: field.properties.placeholder,
      defaultValue: field.properties.defaultValue ?? field.properties.initialValue,
    };
  }

  private toDatasourceQueries(form: FormBuilderAssetWithQuery, fields: readonly FormField[]): WorkflowFormDatasourceQuery[] {
    if (!form.datasourceId) {
      return [];
    }

    const queryId = form.queryId || `${form.datasourceId}_default_query`;
    const queryLabel = form.queryLabel || this.lang.fallbacks.formContext.defaultQuery;
    const queryText = form.queryText || undefined;

    return [
      {
        datasourceId: form.datasourceId,
        datasourceLabel: form.datasourceLabel || form.datasourceId,
        queryId,
        queryLabel,
        queryText,
        queryQualifiedName: form.queryQualifiedName || [form.datasourceLabel || form.datasourceId, queryLabel].join(' / '),
        method: this.methodFromQueryText(queryText),
        expectedInput: this.expectedInputForForm(form, fields),
        fieldMappings: this.fieldMappingsForForm(form, fields),
      },
    ];
  }

  private expectedInputForForm(form: FormBuilderAssetWithQuery, fields: readonly FormField[]): WorkflowFormQueryInput[] {
    if (Array.isArray(form.expectedDatasourceInput)) {
      return form.expectedDatasourceInput
        .map((input) => this.normalizeExpectedInput(input))
        .filter((input): input is WorkflowFormQueryInput => !!input);
    }

    return fields.map((field) => ({
      key: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
    }));
  }

  private fieldMappingsForForm(form: FormBuilderAssetWithQuery, fields: readonly FormField[]): Record<string, string> {
    if (form.fieldMappings && typeof form.fieldMappings === 'object' && !Array.isArray(form.fieldMappings)) {
      return Object.entries(form.fieldMappings as Record<string, unknown>).reduce<Record<string, string>>((mapping, [key, value]) => {
        if (typeof value === 'string') {
          mapping[key] = value;
        }

        return mapping;
      }, {});
    }

    return fields.reduce<Record<string, string>>((mapping, field) => {
      mapping[field.name] = field.name;
      return mapping;
    }, {});
  }

  private normalizeExpectedInput(value: unknown): WorkflowFormQueryInput | null {
    if (typeof value === 'string') {
      return { key: value, label: this.toTitle(value) };
    }

    if (!value || typeof value !== 'object') {
      return null;
    }

    const record = value as Record<string, unknown>;
    const key = this.asString(record['key'] ?? record['name'] ?? record['id'] ?? record['queryParam']);

    if (!key) {
      return null;
    }

    return {
      key,
      label: this.asString(record['label']) || this.toTitle(key),
      type: this.asString(record['type']) || undefined,
      required: record['required'] === true,
    };
  }

  private optionsForField(field: BuilderField): { label: string; value: string }[] | undefined {
    const choices = field.properties.choices;

    if (Array.isArray(choices) && choices.length) {
      return choices
        .map((choice) => {
          if (typeof choice === 'string') {
            return { label: choice, value: choice };
          }

          return {
            label: choice.label,
            value: choice.value || choice.label,
          };
        })
        .filter((choice) => !!choice.label);
    }

    if (field.properties.options?.length) {
      return field.properties.options.map((option) => ({ label: option, value: option }));
    }

    return undefined;
  }

  private normalizeFieldType(type: string): FormField['type'] {
    const normalized = type.toLowerCase();

    if (normalized.includes('email')) {
      return 'email';
    }

    if (['number', 'decimal', 'percent', 'currency'].some((candidate) => normalized.includes(candidate))) {
      return 'number';
    }

    if (['dropdown', 'select', 'radio', 'choice'].some((candidate) => normalized.includes(candidate))) {
      return normalized.includes('radio') ? 'radio' : 'select';
    }

    if (['checkbox', 'decision'].some((candidate) => normalized.includes(candidate))) {
      return 'checkbox';
    }

    if (['date', 'time'].some((candidate) => normalized.includes(candidate))) {
      return 'date';
    }

    return 'text';
  }

  private methodFromQueryText(queryText: string | undefined): WorkflowFormDatasourceQuery['method'] {
    const method = queryText?.trim().split(/\s+/)[0]?.toUpperCase();

    if (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
      return method;
    }

    return 'GET';
  }

  private triggerConfigValue(config: WorkflowTriggerConfig, key: string): string | null {
    const value = (config as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : null;
  }

  private asString(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  private toTitle(value: string): string {
    return value
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }
}
