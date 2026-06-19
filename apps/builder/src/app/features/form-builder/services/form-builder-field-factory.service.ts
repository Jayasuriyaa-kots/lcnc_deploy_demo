import { Injectable } from '@angular/core';
import { BuilderField, BuilderFieldProperties } from '@builder/features/form-builder/models/form-builder.models';
import {
  BuilderDatasourceColumnOption,
  createBuilderFieldProperties,
  getBuilderFieldDefinition,
  suggestFieldTypeForColumn
} from '@builder/features/form-builder/config/form-builder.config';
import type { LibraryField } from '@builder/features/form-builder/models/form-builder.models';

// Stateless utility for field creation, cloning, and naming helpers.
@Injectable({ providedIn: 'root' })
export class FormBuilderFieldFactoryService {
  // Creates a BuilderField from a library item dragged from the palette.
  createFieldFromLibrary(libField: LibraryField, existingRows: BuilderField[]): BuilderField {
    const label = this.getNextLabel(libField.label, existingRows);
    const linkName = this.slugify(label);
    return {
      id: `field_${Math.random().toString(36).slice(2, 10)}`,
      label,
      type: libField.type,
      icon: getBuilderFieldDefinition(libField.type).icon,
      binding: linkName,
      properties: createBuilderFieldProperties({
        fieldType: libField.type,
        linkName,
        label,
        placeholder: libField.placeholder
      })
    };
  }

  // Creates a BuilderField from a datasource column definition.
  createFieldFromColumn(
    column: BuilderDatasourceColumnOption,
    fieldType = suggestFieldTypeForColumn(column)
  ): BuilderField {
    const resolvedFieldType = fieldType || suggestFieldTypeForColumn(column);
    const definition = getBuilderFieldDefinition(resolvedFieldType);
    const properties: BuilderFieldProperties = createBuilderFieldProperties({
      fieldType: resolvedFieldType,
      linkName: column.id,
      label: column.label,
      placeholder: column.placeholder,
      required: column.required,
      unique: column.unique,
      lookup: column.lookup,
      options: column.options
    });

    return {
      id: this.createId(),
      label: column.label,
      type: resolvedFieldType,
      icon: definition.icon,
      binding: column.id,
      properties
    };
  }

  // Deep-clones a field so callers cannot mutate existing state by reference.
  cloneField(field: BuilderField): BuilderField {
    return {
      ...field,
      properties: {
        ...field.properties,
        options: [...field.properties.options],
        choices: Array.isArray(field.properties.choices)
          ? field.properties.choices.map((choice) =>
              typeof choice === 'string' ? choice : ({ ...choice })
            )
          : [],
        allowedDays: [...field.properties.allowedDays],
        dateTimeAllowedDays: [...(field.properties.dateTimeAllowedDays ?? [])],
        prefixChoices: [...field.properties.prefixChoices],
        suffixChoices: [...field.properties.suffixChoices],
        displayFieldsName: field.properties.displayFieldsName
          ? { ...field.properties.displayFieldsName }
          : undefined,
        displayFieldsAddress: field.properties.displayFieldsAddress
          ? { ...field.properties.displayFieldsAddress }
          : undefined,
        richTextToolbar: field.properties.richTextToolbar
          ? { ...field.properties.richTextToolbar }
          : undefined
      }
    };
  }

  // Converts a display label into a binding-safe slug.
  slugify(value: string): string {
    return (value || 'field')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'field';
  }

  // Derives a short two-letter code from a form name.
  getShortCode(name: string): string {
    const parts = name.split(/\s+/).filter(Boolean);
    return (parts[0]?.[0] ?? 'N') + (parts[1]?.[0] ?? parts[0]?.[1] ?? 'F');
  }

  // Generates a UUID and optionally prefixes it for field ids.
  createUuid(prefix?: string): string {
    const base =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
            const random = Math.floor(Math.random() * 16);
            const value = char === 'x' ? random : ((random & 0x3) | 0x8);
            return value.toString(16);
          });
    return prefix ? `${prefix}_${base}` : base;
  }

  // Creates a new field-scoped id.
  private createId(): string {
    return this.createUuid('field');
  }

  // Adds a numeric suffix when another field already uses the same label.
  private getNextLabel(base: string, existingRows: BuilderField[]): string {
    const count = existingRows.filter((row) => row.label.startsWith(base)).length;
    return count === 0 ? base : `${base} ${count + 1}`;
  }
}
