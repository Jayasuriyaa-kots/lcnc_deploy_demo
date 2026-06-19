import { Injectable } from '@angular/core';
import { FORM_BUILDER_LANG } from '@builder/features/form-builder/lang/form-builder.en';
import { BuilderField, BuilderFieldProperties } from '@builder/features/form-builder/models/form-builder.models';

type FieldType = BuilderField['type'];

@Injectable({ providedIn: 'root' })
export class FormBuilderFieldPolicyService {
  private readonly text = FORM_BUILDER_LANG.fieldPolicy;
  private readonly choiceTypes = new Set<FieldType>(['Dropdown', 'Radio', 'Multi Select', 'Checkbox']);
  private readonly textRuleTypes = new Set<FieldType>(['Name', 'Email', 'Phone', 'Short Text', 'Single Line', 'Url']);
  private readonly numericTypes = new Set<FieldType>(['Number', 'Percent', 'Decimal', 'Currency']);
  private readonly dateTypes = new Set<FieldType>(['Date Picker', 'Date', 'Time', 'Date-Time']);
  private readonly editorTypes = new Set<FieldType>(['Long Text', 'Multi Line', 'Rich Text']);
  private readonly uploadTypes = new Set<FieldType>(['File Upload', 'Image', 'Video', 'Audio']);
  private readonly mobileInputTypes = new Set<FieldType>(['Signature', 'Phone', 'Url']);
  private readonly uniqueTypes = new Set<FieldType>([
    'Name',
    'Email',
    'Phone',
    'Short Text',
    'Single Line',
    'Url',
    'Number',
    'Date',
    'Date Picker',
    'Time',
    'Date-Time',
    'Percent',
    'Decimal',
    'Currency'
  ]);
  private readonly lookupTypes = new Set<FieldType>(['Dropdown', 'Radio', 'Multi Select', 'Checkbox', 'Address']);
  private readonly initialValueTypes = new Set<FieldType>([
    'Email',
    'Phone',
    'Short Text',
    'Single Line',
    'Number',
    'Date',
    'Date Picker',
    'Time',
    'Date-Time',
    'Percent',
    'Decimal',
    'Currency'
  ]);
  private readonly decimalTypes = new Set<FieldType>(['Decimal', 'Percent', 'Currency']);

  // Returns display format options for date, time, percent, and currency fields.
  getFormatOptions(field: BuilderField): string[] {
    if (field.type === 'Date Picker') return ['DD MMM YYYY', 'DD-MMM-YYYY', 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
    if (field.type === 'Time') return ['HH:mm', 'HH:mm:ss', 'hh:mm A', 'hh:mm:ss A'];
    if (field.type === 'Date-Time') return ['DD MMM YYYY HH:mm', 'DD-MMM-YYYY HH:mm', 'DD/MM/YYYY HH:mm', 'MM/DD/YYYY hh:mm A', 'YYYY-MM-DD HH:mm:ss'];
    if (field.type === 'Percent') return ['0%', '0.0%', '0.00%'];
    if (field.type === 'Currency') return ['#,##0.00', 'INR #,##0.00', '$ #,##0.00'];
    return [...this.text.fallbackFormats];
  }

  // Infers the initial value mode from the stored default value/token.
  getInitialValueMode(field: BuilderField): 'none' | 'specific' | 'current' {
    const value = (field.properties.defaultValue || '').trim().toLowerCase();
    if (!value) return 'none';
    return value.includes('current') ? 'current' : 'specific';
  }

  // Returns the field-specific label for manually chosen initial values.
  getSpecificInitialLabel(field: BuilderField): string {
    if (field.type === 'Time') return this.text.chooseTime;
    if (field.type === 'Date-Time') return this.text.chooseDateTime;
    return this.text.chooseDate;
  }

  // Returns the field-specific label for current date/time tokens.
  getCurrentInitialLabel(field: BuilderField): string {
    if (field.type === 'Time') return this.text.currentTime;
    if (field.type === 'Date-Time') return this.text.currentDateTime;
    return this.text.currentDate;
  }

  // Returns the stored token used to represent current date/time values.
  getCurrentInitialToken(field: BuilderField): string {
    if (field.type === 'Time') return 'zoho.currenttime';
    if (field.type === 'Date-Time') return 'zoho.currentdatetime';
    return 'zoho.currentdate';
  }

  // Chooses the native input type for date/time initial value controls.
  getInitialValueInputType(field: BuilderField): string {
    if (field.type === 'Time') return 'time';
    if (field.type === 'Date-Time') return 'datetime-local';
    return 'date';
  }

  // Checks whether the field should show option/choice settings.
  isChoiceField(field: BuilderField): boolean {
    return this.choiceTypes.has(field.type);
  }

  // Checks whether the field should show text validation settings.
  hasTextRules(field: BuilderField): boolean {
    return this.textRuleTypes.has(field.type);
  }

  // Checks whether the field should show long-text row settings.
  isLongTextField(field: BuilderField): boolean {
    return field.type === 'Long Text' || field.type === 'Multi Line';
  }

  // Checks whether the field should show numeric validation settings.
  isNumericField(field: BuilderField): boolean {
    return this.numericTypes.has(field.type);
  }

  // Checks whether the field should show date/time settings.
  isDateField(field: BuilderField): boolean {
    return this.dateTypes.has(field.type);
  }

  // Checks whether the field should show editor/rich text settings.
  hasEditorSettings(field: BuilderField): boolean {
    return this.editorTypes.has(field.type);
  }

  // Checks whether the field should show file/media upload settings.
  hasUploadSettings(field: BuilderField): boolean {
    return this.uploadTypes.has(field.type);
  }

  // Checks whether the field should show mobile QR/barcode settings.
  hasMobileInputSettings(field: BuilderField): boolean {
    return this.mobileInputTypes.has(field.type);
  }

  // Checks whether unique-value validation is allowed for the field.
  canUseUnique(field: BuilderField): boolean {
    return this.uniqueTypes.has(field.type);
  }

  // Checks whether lookup binding is allowed for the field.
  canUseLookup(field: BuilderField): boolean {
    return this.lookupTypes.has(field.type);
  }

  // Checks whether initial values are supported for the field.
  canUseInitialValue(field: BuilderField): boolean {
    return this.initialValueTypes.has(field.type);
  }

  // Checks whether decimal-place settings apply to the field.
  canUseDecimalPlaces(field: BuilderField): boolean {
    return this.decimalTypes.has(field.type);
  }

  // Checks whether the field participates in dashboard date behavior.
  isDashboardDateField(field: BuilderField): boolean {
    return field.type === 'Date' || field.type === 'Date Picker';
  }

  // Resolves file upload mode with legacy allowMultipleFiles fallback.
  getFileUploadType(field: BuilderField): NonNullable<BuilderFieldProperties['fileUploadType']> {
    return field.properties.fileUploadType ?? (field.properties.allowMultipleFiles ? this.text.multipleFiles : this.text.singleFile);
  }

  // Resolves image upload mode with legacy allowMultipleFiles fallback.
  getImageUploadType(field: BuilderField): NonNullable<BuilderFieldProperties['imageUploadType']> {
    return field.properties.imageUploadType ?? (field.properties.allowMultipleFiles ? this.text.multipleImages : this.text.singleImage);
  }

  // Reads either minutes or seconds from audio/video duration settings.
  getDurationPart(field: BuilderField, part: 'mins' | 'secs'): number {
    if (field.type === 'Audio') {
      return part === 'mins' ? (field.properties.audioDurationMins ?? 1) : (field.properties.audioDurationSecs ?? 0);
    }
    return part === 'mins' ? (field.properties.videoDurationMins ?? 0) : (field.properties.videoDurationSecs ?? 30);
  }
}
