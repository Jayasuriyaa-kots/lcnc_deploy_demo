import { BuilderField } from '@builder/features/form-builder/models/form-builder.models';
import { FormBuilderFieldPolicyService } from './form-builder-field-policy.service';

function field(type: string, properties: Partial<BuilderField['properties']> = {}): BuilderField {
  return {
    id: 'field_1',
    label: type,
    type,
    icon: 'short_text',
    binding: 'field_1',
    properties: {
      defaultValue: '',
      allowMultipleFiles: false,
      ...properties
    }
  } as BuilderField;
}

describe('FormBuilderFieldPolicyService', () => {
  let policy: FormBuilderFieldPolicyService;

  beforeEach(() => {
    policy = new FormBuilderFieldPolicyService();
  });

  it('classifies supported field capabilities', () => {
    expect(policy.isChoiceField(field('Multi Select'))).toBeTrue();
    expect(policy.isNumericField(field('Currency'))).toBeTrue();
    expect(policy.isDateField(field('Date-Time'))).toBeTrue();
    expect(policy.hasUploadSettings(field('Image'))).toBeTrue();
    expect(policy.hasMobileInputSettings(field('Signature'))).toBeTrue();
  });

  it('returns false for unsupported capability checks', () => {
    expect(policy.isChoiceField(field('Short Text'))).toBeFalse();
    expect(policy.isNumericField(field('Email'))).toBeFalse();
    expect(policy.canUseLookup(field('Currency'))).toBeFalse();
    expect(policy.canUseDecimalPlaces(field('Number'))).toBeFalse();
  });

  it('resolves format options by field type', () => {
    expect(policy.getFormatOptions(field('Time'))).toContain('HH:mm:ss');
    expect(policy.getFormatOptions(field('Currency'))).toContain('INR #,##0.00');
    expect(policy.getFormatOptions(field('Short Text'))).toEqual(['Default', 'Compact', 'Detailed']);
  });

  it('resolves initial value mode and date input labels', () => {
    expect(policy.getInitialValueMode(field('Date Picker'))).toBe('none');
    expect(policy.getInitialValueMode(field('Date Picker', { defaultValue: 'zoho.currentdate' }))).toBe('current');
    expect(policy.getInitialValueMode(field('Date Picker', { defaultValue: '2026-06-03' }))).toBe('specific');
    expect(policy.getSpecificInitialLabel(field('Date-Time'))).toBe('Choose Date & Time');
    expect(policy.getCurrentInitialToken(field('Time'))).toBe('zoho.currenttime');
    expect(policy.getInitialValueInputType(field('Date-Time'))).toBe('datetime-local');
  });

  it('uses safe upload and duration defaults when properties are missing', () => {
    expect(policy.getFileUploadType(field('File Upload'))).toBe('Single file');
    expect(policy.getFileUploadType(field('File Upload', { allowMultipleFiles: true }))).toBe('Multiple files');
    expect(policy.getImageUploadType(field('Image'))).toBe('Single image');
    expect(policy.getDurationPart(field('Audio'), 'mins')).toBe(1);
    expect(policy.getDurationPart(field('Video'), 'secs')).toBe(30);
  });
});
