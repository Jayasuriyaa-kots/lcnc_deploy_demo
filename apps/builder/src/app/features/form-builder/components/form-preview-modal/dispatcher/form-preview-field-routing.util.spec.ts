import { BuilderField } from '@builder/features/form-builder/models/form-builder.models';
import { resolvePreviewFieldControlSlug } from './form-preview-field-routing.util';

function field(type: string): BuilderField {
  return { id: 'f1', label: 'Test', type, icon: 'short_text', binding: 'f1', properties: {} } as BuilderField;
}

describe('resolvePreviewFieldControlSlug', () => {
  it('routes choice field types to choice controls', () => {
    expect(resolvePreviewFieldControlSlug(field('Dropdown'))).toBe('choice');
    expect(resolvePreviewFieldControlSlug(field('Radio'))).toBe('choice');
    expect(resolvePreviewFieldControlSlug(field('Multi Select'))).toBe('choice');
  });

  it('routes date and signature fields to date-time controls', () => {
    expect(resolvePreviewFieldControlSlug(field('Date Picker'))).toBe('date-time');
    expect(resolvePreviewFieldControlSlug(field('Signature'))).toBe('date-time');
  });

  it('routes basic text fields to primitive controls', () => {
    expect(resolvePreviewFieldControlSlug(field('Short Text'))).toBe('primitives');
    expect(resolvePreviewFieldControlSlug(field('Email'))).toBe('primitives');
  });

  it('routes media field types to media controls', () => {
    expect(resolvePreviewFieldControlSlug(field('Image'))).toBe('media');
    expect(resolvePreviewFieldControlSlug(field('Audio'))).toBe('media');
  });
});
