import { BuilderField } from '@builder/features/form-builder/models/form-builder.models';

export type PreviewFieldControlSlug =
  | 'name-address'
  | 'phone'
  | 'choice'
  | 'rich-text'
  | 'media'
  | 'date-time'
  | 'primitives';

// Normalizes field type strings so routing tolerates spacing/casing variants.
function normalizeFieldType(field: BuilderField): string {
  return String(field.type ?? '').trim().toLowerCase().replace(/[\s_-]+/g, '');
}

// Normalizes field labels used by datasource-generated fields.
function normalizeFieldLabel(field: BuilderField): string {
  return String(field.label ?? '').trim().toLowerCase().replace(/[\s_-]+/g, '');
}

// Checks whether a field carries configured choice values.
function hasChoiceOptions(field: BuilderField): boolean {
  const choices = field.properties.choices;
  if (Array.isArray(choices) && choices.length > 0) {
    return true;
  }
  return (field.properties.options ?? []).length > 0;
}

// Detects dropdown-like fields even when datasource metadata uses lookup/select names.
function isDropdownLike(field: BuilderField): boolean {
  if (isMultiSelectLike(field)) {
    return false;
  }
  if (field.type === 'Dropdown') {
    return true;
  }
  const type = normalizeFieldType(field);
  const label = normalizeFieldLabel(field);
  return ['dropdown', 'dropdownlist', 'dropdownfield', 'picklist', 'select'].includes(type) ||
    field.properties.lookup === true ||
    type === 'lookup' ||
    ['dropdown', 'dropdownlist', 'picklist', 'select'].includes(label) ||
    (hasChoiceOptions(field) && ['choice', 'choices'].includes(label));
}

// Detects multiselect-like fields even when datasource metadata varies.
function isMultiSelectLike(field: BuilderField): boolean {
  const type = normalizeFieldType(field);
  const label = normalizeFieldLabel(field);
  return field.type === 'Multi Select' ||
    ['multiselect', 'multiplechoice', 'multichoice'].includes(type) ||
    ['multiselect', 'multiplechoice', 'multichoice'].includes(label);
}

// Maps a builder field type to the preview control bundle that should render it.
export function resolvePreviewFieldControlSlug(field: BuilderField): PreviewFieldControlSlug {
  if (field.type === 'Name' || field.type === 'Address') {
    return 'name-address';
  }
  if (field.type === 'Phone') {
    return 'phone';
  }
  if (isDropdownLike(field) || isMultiSelectLike(field) || ['Radio', 'Checkbox'].includes(field.type)) {
    return 'choice';
  }
  if (field.type === 'Rich Text') {
    return 'rich-text';
  }
  if (['File Upload', 'Image', 'Audio', 'Video'].includes(field.type)) {
    return 'media';
  }
  if (['Date Picker', 'Date', 'Time', 'Date-Time', 'Signature'].includes(field.type)) {
    return 'date-time';
  }
  return 'primitives';
}
