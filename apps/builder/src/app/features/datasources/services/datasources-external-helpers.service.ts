import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { fromEvent, map, startWith } from 'rxjs';
import {
  QueryReferenceRecord,
  QueryRegistryService,
} from '@builder/core/services/query-registry.service';
import {
  DatasourceAuthMode,
  DatasourceConfigFormValue,
  DatasourceConfigRuntimeTab,
  DatasourceConnectorId,
  DatasourceConnectorOption,
  DatasourceEditorTab,
  DatasourceFieldMapping,
  DatasourceFieldType,
  DatasourceHostEntry,
  DatasourceKeyValueEntry,
  DatasourceQueryRecord,
  DatasourceQueryResultTab,
  DatasourceSection,
  DatasourceSourceRecord,
  DatasourceWorkspace,
  DatasourceResultRow,
} from '@builder/features/datasources/models/datasource-dashboard.model';
import {
  ExternalApiConfigurationValue,
  ExternalApiFieldSchema,
  ExternalApiMappingValue,
  ExternalApiSchema,
} from '@builder/features/datasources/models/external-api-schemas';

import {
  DatasourceEditorForm,
  DatasourceSaveQueryForm,
  ExternalApiDynamicForm,
  ExternalApiMappingGroup,
  HostGroup,
  KeyValueGroup,
  SchemaFieldGroup,
} from '@builder/features/datasources/models/datasource-form-groups.types';

import { DatasourcesExternalStorageService } from '@builder/features/datasources/services/datasources-external-storage.service';

export abstract class DatasourcesExternalHelpersService extends DatasourcesExternalStorageService {
  protected firstLegacyExternalApiEndpoint(raw: Record<string, unknown>): Record<string, unknown> | null {
    const endpoints = raw.endpoints;
    if (!Array.isArray(endpoints) || !endpoints.length) {
      return null;
    }

    const first = endpoints[0];
    return first && typeof first === 'object' ? (first as Record<string, unknown>) : null;
  }

  protected legacyExternalApiMappingRows(value: unknown): ExternalApiMappingValue[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((item) => {
        if (!item || typeof item !== 'object') {
          return null;
        }

        const row = item as Record<string, unknown>;
        return {
          sourcePath: this.firstExternalApiString(row, ['sourcePath', 'responsePath', 'externalField', 'value', 'path']),
          targetField: this.firstExternalApiString(row, ['targetField', 'internalField', 'key', 'field']),
          fieldType: this.firstExternalApiString(row, ['fieldType', 'type'], 'Text'),
          required: Boolean(row.required),
        };
      })
      .filter((item): item is ExternalApiMappingValue => Boolean(item) && !!(item.sourcePath || item.targetField));
  }

  protected legacyExternalApiRequestMappings(
    requestHeadersValue: unknown,
    queryParametersValue: unknown
  ): ExternalApiMappingValue[] {
    const requestHeaders = this.legacyExternalApiMappingRows(requestHeadersValue);
    if (requestHeaders.length) {
      return requestHeaders;
    }

    return this.legacyExternalApiMappingRows(queryParametersValue);
  }

  protected legacyExternalApiResponseMappings(value: unknown): ExternalApiMappingValue[] {
    return this.legacyExternalApiMappingRows(value);
  }

  protected firstExternalApiString(
    value: Record<string, unknown>,
    keys: string[],
    fallback = ''
  ): string {
    for (const key of keys) {
      const candidate = value[key];
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate.trim();
      }
    }

    return fallback;
  }

  protected hasMeaningfulExternalApiConfiguration(value: ExternalApiConfigurationValue | null | undefined): boolean {
    if (!value) {
      return false;
    }

    return Object.values(value).some((entry) => this.hasMeaningfulExternalApiValue(entry));
  }

  protected mergeExternalApiConfigurations(
    base: ExternalApiConfigurationValue,
    overlay: ExternalApiConfigurationValue
  ): ExternalApiConfigurationValue {
    const merged: ExternalApiConfigurationValue = { ...base };

    for (const [key, value] of Object.entries(overlay)) {
      if (this.hasMeaningfulExternalApiValue(value)) {
        merged[key] = value as ExternalApiConfigurationValue[keyof ExternalApiConfigurationValue];
      }
    }

    return merged;
  }

  protected externalApiEmptyValue(field: ExternalApiFieldSchema): string | boolean | number {
    if (field.type === 'checkbox' || field.type === 'toggle') {
      return false;
    }

    if (field.type === 'number') {
      return '';
    }

    return '';
  }

  protected externalApiExplicitValue(field: ExternalApiFieldSchema, value: unknown): string | boolean | number {
    if (value === null || value === undefined) {
      return this.externalApiEmptyValue(field);
    }

    if (field.type === 'checkbox' || field.type === 'toggle') {
      return typeof value === 'boolean' ? value : Boolean(value);
    }

    if (field.type === 'number') {
      return typeof value === 'number' || typeof value === 'string' ? value : '';
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }

    return this.externalApiEmptyValue(field);
  }

  protected preferMeaningfulExternalApiValue<T>(...values: Array<T | null | undefined>): T | null | undefined {
    for (const value of values) {
      if (this.hasMeaningfulExternalApiValue(value)) {
        return value;
      }
    }

    return values[values.length - 1];
  }

  protected hasMeaningfulExternalApiValue(value: unknown): boolean {
    if (value === null || value === undefined) {
      return false;
    }

    if (typeof value === 'string') {
      return value.trim().length > 0;
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return true;
  }

  protected externalApiMappingValue(value: unknown): ExternalApiMappingValue[] {
    if (!Array.isArray(value)) {
      return [{ sourcePath: '', targetField: '', fieldType: 'Text', required: false }];
    }

    return value.map((entry) => ({
      sourcePath: typeof entry?.sourcePath === 'string' ? entry.sourcePath : '',
      targetField: typeof entry?.targetField === 'string' ? entry.targetField : '',
      fieldType: typeof entry?.fieldType === 'string' ? entry.fieldType : 'Text',
      required: Boolean(entry?.required),
    }));
  }

  protected createExternalApiMappingGroup(mapping: Partial<ExternalApiMappingValue> = {}): ExternalApiMappingGroup {
    return this.fb.nonNullable.group({
      sourcePath: [mapping.sourcePath ?? ''],
      targetField: [mapping.targetField ?? ''],
      fieldType: [mapping.fieldType ?? 'Text'],
      required: [mapping.required ?? false],
    });
  }

}
