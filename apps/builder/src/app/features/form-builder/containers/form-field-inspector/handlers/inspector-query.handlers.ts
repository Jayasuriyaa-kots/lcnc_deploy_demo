import { BuilderField, BuilderFieldProperties } from '@builder/features/form-builder/models/form-builder.models';
import { FormBuilderFieldPolicyService } from '@builder/features/form-builder/services/field-policy/form-builder-field-policy.service';
import { FormBuilderI18nService } from '@builder/features/form-builder/services/form-builder-i18n.service';
import {
  INSPECTOR_DATE_INITIAL_MODE_OPTIONS,
  INSPECTOR_ICON_MAP,
  INSPECTOR_TOOLBAR_DEFAULTS,
} from '../form-field-inspector.config';

export interface SelectOption {
  value: string | number | boolean;
  label: string;
  disabled?: boolean;
}

export interface FormFieldInspectorContextOptions {
  readonly visibilityOptions: readonly string[];
  readonly widthOptions: readonly BuilderFieldProperties['width'][];
  readonly countryCodes: readonly string[];
  readonly editorDisplayOptions: readonly string[];
  readonly decisionInitialOptions: readonly SelectOption[];
  readonly dateInitialModeOptions: readonly SelectOption[];
  readonly imageSourceOptions: readonly SelectOption[];
  readonly imageUploadTypeOptions: readonly SelectOption[];
  readonly fileUploadTypeOptions: readonly SelectOption[];
  readonly urlTargetOptions: readonly SelectOption[];
  readonly descriptionModeOptions: readonly SelectOption[];
  readonly fieldLayoutOptions: readonly string[];
  readonly toolbarOptionKeys: readonly string[];
  readonly weekdayOptions: readonly SelectOption[];
}

/** Read-only inspector helpers: policy checks, getters, and DOM input parsing. */
export class InspectorQueryHandlers {
  readonly visibilityOptions: readonly string[];
  readonly widthOptions: readonly BuilderFieldProperties['width'][];
  readonly countryCodes: readonly string[];
  readonly editorDisplayOptions: readonly string[];
  readonly decisionInitialOptions: readonly SelectOption[];
  readonly dateInitialModeOptions: readonly SelectOption[];
  readonly imageSourceOptions: readonly SelectOption[];
  readonly imageUploadTypeOptions: readonly SelectOption[];
  readonly fileUploadTypeOptions: readonly SelectOption[];
  readonly urlTargetOptions: readonly SelectOption[];
  readonly descriptionModeOptions: readonly SelectOption[];
  readonly fieldLayoutOptions: readonly string[];
  readonly toolbarOptionKeys: readonly string[];
  readonly weekdayOptions: readonly SelectOption[];

  constructor(
    protected readonly fieldPolicy: FormBuilderFieldPolicyService,
    protected readonly i18n: FormBuilderI18nService,
    options: FormFieldInspectorContextOptions,
  ) {
    this.visibilityOptions = options.visibilityOptions;
    this.widthOptions = options.widthOptions;
    this.countryCodes = options.countryCodes;
    this.editorDisplayOptions = options.editorDisplayOptions;
    this.decisionInitialOptions = options.decisionInitialOptions;
    this.dateInitialModeOptions = options.dateInitialModeOptions;
    this.imageSourceOptions = options.imageSourceOptions;
    this.imageUploadTypeOptions = options.imageUploadTypeOptions;
    this.fileUploadTypeOptions = options.fileUploadTypeOptions;
    this.urlTargetOptions = options.urlTargetOptions;
    this.descriptionModeOptions = options.descriptionModeOptions;
    this.fieldLayoutOptions = options.fieldLayoutOptions;
    this.toolbarOptionKeys = options.toolbarOptionKeys;
    this.weekdayOptions = options.weekdayOptions;
  }

  getFormatOptions(field: BuilderField): string[] {
    return this.fieldPolicy.getFormatOptions(field);
  }

  getInitialValueMode(field: BuilderField): 'none' | 'specific' | 'current' {
    return this.fieldPolicy.getInitialValueMode(field);
  }

  getSpecificInitialLabel(field: BuilderField): string {
    return this.fieldPolicy.getSpecificInitialLabel(field);
  }

  getCurrentInitialLabel(field: BuilderField): string {
    return this.fieldPolicy.getCurrentInitialLabel(field);
  }

  getCurrentInitialToken(field: BuilderField): string {
    return this.fieldPolicy.getCurrentInitialToken(field);
  }

  getInitialValueInputType(field: BuilderField): string {
    return this.fieldPolicy.getInitialValueInputType(field);
  }

  getSpecificInitialValue(field: BuilderField): string {
    return this.getInitialValueMode(field) === 'specific' ? field.properties.defaultValue : '';
  }

  isChoiceField(field: BuilderField): boolean {
    return this.fieldPolicy.isChoiceField(field);
  }

  hasTextRules(field: BuilderField): boolean {
    return this.fieldPolicy.hasTextRules(field);
  }

  isLongTextField(field: BuilderField): boolean {
    return this.fieldPolicy.isLongTextField(field);
  }

  isNumericField(field: BuilderField): boolean {
    return this.fieldPolicy.isNumericField(field);
  }

  isDateField(field: BuilderField): boolean {
    return this.fieldPolicy.isDateField(field);
  }

  hasEditorSettings(field: BuilderField): boolean {
    return this.fieldPolicy.hasEditorSettings(field);
  }

  hasUploadSettings(field: BuilderField): boolean {
    return this.fieldPolicy.hasUploadSettings(field);
  }

  hasMobileInputSettings(field: BuilderField): boolean {
    return this.fieldPolicy.hasMobileInputSettings(field);
  }

  hasSecuritySettings(_field: BuilderField): boolean {
    return true;
  }

  canUseUnique(field: BuilderField): boolean {
    return this.fieldPolicy.canUseUnique(field);
  }

  canUseLookup(field: BuilderField): boolean {
    return this.fieldPolicy.canUseLookup(field);
  }

  canUseInitialValue(field: BuilderField): boolean {
    return this.fieldPolicy.canUseInitialValue(field);
  }

  canUseDecimalPlaces(field: BuilderField): boolean {
    return this.fieldPolicy.canUseDecimalPlaces(field);
  }

  isDashboardDateField(field: BuilderField): boolean {
    return this.fieldPolicy.isDashboardDateField(field);
  }

  getDescriptionMode(field: BuilderField): 'none' | 'tooltip' | 'helptext' {
    return field.properties.descriptionShow ?? field.properties.descriptionMode ?? 'none';
  }

  getWidth(field: BuilderField): BuilderFieldProperties['width'] {
    return field.properties.fieldSize ?? field.properties.width ?? 'Medium';
  }

  getInitialValue(field: BuilderField): string {
    return field.properties.initialValue ?? field.properties.defaultValue ?? '';
  }

  getDecisionInitialValue(field: BuilderField): boolean {
    return !!field.properties.decisionBoxInitialValue;
  }

  getFileUploadType(field: BuilderField): 'Single file' | 'Multiple files' {
    return this.fieldPolicy.getFileUploadType(field);
  }

  getImageUploadType(field: BuilderField): 'Single image' | 'Multiple images' {
    return this.fieldPolicy.getImageUploadType(field);
  }

  getDurationPart(field: BuilderField, part: 'mins' | 'secs'): number {
    return this.fieldPolicy.getDurationPart(field, part);
  }

  getToolbarFlag(field: BuilderField, key: string): boolean {
    return (field.properties.richTextToolbar ?? {})[key] ?? INSPECTOR_TOOLBAR_DEFAULTS[key] ?? false;
  }

  getDateInitialModeOptions(field: BuilderField): SelectOption[] {
    return INSPECTOR_DATE_INITIAL_MODE_OPTIONS.map((option) => ({
      label: option.value === 'specific'
        ? this.getSpecificInitialLabel(field)
        : option.value === 'current'
          ? this.getCurrentInitialLabel(field)
          : option.label,
      value: option.value,
    }));
  }

  inputValue(event: Event): string {
    return (event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null)?.value ?? '';
  }

  asString(value: unknown): string {
    return value == null ? '' : String(value);
  }

  asNumber(value: unknown): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  numberValue(event: Event): number {
    const value = Number(this.inputValue(event));
    return Number.isFinite(value) ? value : 0;
  }

  checkedValue(event: Event): boolean {
    return (event.target as HTMLInputElement | null)?.checked ?? false;
  }

  getBooleanString(value: boolean): string {
    return value ? 'true' : 'false';
  }

  parseBooleanString(value: string): boolean {
    return value === 'true';
  }

  getFieldIconName(icon: string): string {
    return INSPECTOR_ICON_MAP[icon] ?? 'info';
  }

  getSelectOptions(
    values: readonly (string | number | boolean)[] | null | undefined,
    includeEmptyLabel?: string,
  ): SelectOption[] {
    const options = (values ?? []).map((value) => ({ label: String(value), value }));
    return includeEmptyLabel ? [{ label: includeEmptyLabel, value: '' }, ...options] : options;
  }
}
