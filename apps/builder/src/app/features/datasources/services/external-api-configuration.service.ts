import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  ExternalApiConfigurationValue,
  ExternalApiFieldSchema,
  ExternalApiMappingValue,
  ExternalApiSchema,
} from '@builder/features/datasources/models/external-api-schemas';
import { ExternalApiSchemaFacade } from '@builder/features/datasources/facades/external-api-schema.facade';
import { DatasourcesPersistenceService } from './datasources-persistence.service';

@Injectable({ providedIn: 'root' })
export class ExternalApiConfigurationService {
  private readonly fb = inject(FormBuilder);
  private readonly schemas = inject(ExternalApiSchemaFacade);
  private readonly persistence = inject(DatasourcesPersistenceService);
  private readonly storageKey = 'external-api-configurations';

  createDynamicForm(
    connectorKey: string,
    initialValue: ExternalApiConfigurationValue | null
  ): { schema: ExternalApiSchema | null; form: FormGroup; activeMappingTab: string } {
    const form = this.fb.nonNullable.group({});
    const schema = this.schemas.schema(connectorKey);
    if (!schema) {
      return { schema: null, form, activeMappingTab: 'requestMappings' };
    }

    const value = initialValue ?? {};
    for (const section of schema.sections) {
      for (const field of section.fields) {
        const hasInitialField = Object.prototype.hasOwnProperty.call(value, field.key);
        if (field.type === 'mappingList') {
          const mappings = this.mappingValues(hasInitialField ? value[field.key] : field.mappingDefaults);
          form.addControl(field.key, this.fb.array(mappings.map((mapping) => this.mappingGroup(mapping))));
          continue;
        }

        const fieldValue = hasInitialField
          ? this.explicitValue(field, value[field.key])
          : this.preferMeaningful(field.defaultValue, this.emptyValue(field));
        form.addControl(
          field.key,
          this.fb.nonNullable.control(
            fieldValue as string | boolean | number,
            field.required ? [Validators.required] : []
          )
        );
      }
    }

    const activeMappingTab =
      schema.sections.flatMap((section) => section.fields).find((field) => field.type === 'mappingList')?.key ??
      'requestMappings';
    return { schema, form, activeMappingTab };
  }

  save(storageKey: string, value: ExternalApiConfigurationValue, fallbackConnectorKey?: string): void {
    const configurations = this.read();
    configurations[storageKey] = value;
    if (fallbackConnectorKey) {
      configurations[fallbackConnectorKey] = value;
    }
    this.write(configurations);
  }

  load(storageKey: string, fallbackKeys: string[] = []): ExternalApiConfigurationValue | null {
    const configurations = this.read();
    const keys = [storageKey, ...fallbackKeys].filter((key, index, all) => !!key && all.indexOf(key) === index);
    return keys
      .map((key) => configurations[key] ?? null)
      .find((value): value is ExternalApiConfigurationValue => !!value) ?? null;
  }

  private read(): Record<string, ExternalApiConfigurationValue> {
    if (!this.persistence.isAvailable()) {
      return {};
    }
    try {
      const raw = this.persistence.getItem(this.storageKey);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? parsed as Record<string, ExternalApiConfigurationValue>
        : {};
    } catch {
      return {};
    }
  }

  private write(configurations: Record<string, ExternalApiConfigurationValue>): void {
    try {
      this.persistence.setItem(this.storageKey, JSON.stringify(configurations));
    } catch {
      // Storage can be unavailable in restricted preview environments.
    }
  }

  private mappingValues(value: unknown): ExternalApiMappingValue[] {
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

  private mappingGroup(mapping: Partial<ExternalApiMappingValue>): FormGroup {
    return this.fb.nonNullable.group({
      sourcePath: [mapping.sourcePath ?? ''],
      targetField: [mapping.targetField ?? ''],
      fieldType: [mapping.fieldType ?? 'Text'],
      required: [mapping.required ?? false],
    });
  }

  private explicitValue(field: ExternalApiFieldSchema, value: unknown): string | boolean | number {
    if (value === null || value === undefined) {
      return this.emptyValue(field);
    }
    if (field.type === 'checkbox' || field.type === 'toggle') {
      return typeof value === 'boolean' ? value : Boolean(value);
    }
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
      ? value
      : this.emptyValue(field);
  }

  private emptyValue(field: ExternalApiFieldSchema): string | boolean {
    return field.type === 'checkbox' || field.type === 'toggle' ? false : '';
  }

  private preferMeaningful<T>(...values: Array<T | null | undefined>): T | null | undefined {
    return values.find((value) =>
      typeof value === 'string' ? value.trim().length > 0 : Array.isArray(value) ? value.length > 0 : value != null
    ) ?? values[values.length - 1];
  }
}
