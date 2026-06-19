import { FORM_BUILDER_LANG } from '@builder/features/form-builder/lang/form-builder.en';
import { BuilderField, BuilderFieldProperties } from '@builder/features/form-builder/models/form-builder.models';
import { FormBuilderFieldPolicyService } from '@builder/features/form-builder/services/field-policy/form-builder-field-policy.service';
import { FormBuilderI18nService } from '@builder/features/form-builder/services/form-builder-i18n.service';
import { FormFieldInspectorUtilsService } from '../form-field-inspector-utils.service';
import {
  FormFieldInspectorContextOptions,
  InspectorQueryHandlers,
} from './inspector-query.handlers';

/** Field mutation helpers used by the inspector panels. */
export class InspectorMutationHandlers extends InspectorQueryHandlers {
  readonly multipleImagesUploadLabel = FORM_BUILDER_LANG.fieldPolicy.multipleImages;
  readonly multipleFilesUploadLabel = FORM_BUILDER_LANG.fieldPolicy.multipleFiles;

  constructor(
    private readonly utils: FormFieldInspectorUtilsService,
    fieldPolicy: FormBuilderFieldPolicyService,
    i18n: FormBuilderI18nService,
    private readonly emit: (field: BuilderField) => void,
    options: FormFieldInspectorContextOptions,
  ) {
    super(fieldPolicy, i18n, options);
  }

  updateLabel(field: BuilderField, value: string): void {
    field.label = value;
    field.properties.fieldLinkName = this.utils.slugify(field.label);
    this.syncBinding(field);
  }

  updateBindingName(field: BuilderField, value: string): void {
    field.properties.fieldLinkName = value;
    this.syncBinding(field);
  }

  updateProperty(field: BuilderField, key: keyof BuilderFieldProperties, value: string | number | boolean | string[]): void {
    (field.properties as unknown as Record<string, string | number | boolean | string[]>)[key] = value;
    this.utils.syncCompatProperties(field, key, value);
    this.emit(field);
  }

  updateStringArrayItem(
    field: BuilderField,
    key: 'prefixChoices' | 'suffixChoices' | 'options',
    index: number,
    value: string,
  ): void {
    const next = [...field.properties[key]];
    next[index] = value;
    field.properties[key] = next;
    if (key === 'options') {
      field.properties.choices = next.map((option) => ({ label: option, value: option }));
    }
    this.emit(field);
  }

  syncBinding(field: BuilderField): void {
    field.binding = this.utils.slugify(field.properties.fieldLinkName || field.label);
    this.emit(field);
  }

  addOption(field: BuilderField): void {
    field.properties.options = [
      ...field.properties.options,
      this.i18n.scope('fieldDefaults.optionNumber', { index: field.properties.options.length + 1 }),
    ];
    field.properties.choices = field.properties.options.map((option) => ({ label: option, value: option }));
    this.emit(field);
  }

  removeOption(field: BuilderField, index: number): void {
    const next = [...field.properties.options];
    next.splice(index, 1);
    field.properties.options = next.length ? next : [FORM_BUILDER_LANG.fieldDefaults.option1];
    field.properties.choices = field.properties.options.map((option) => ({ label: option, value: option }));
    this.emit(field);
  }

  addArrayOption(field: BuilderField, key: 'prefixChoices' | 'suffixChoices', label: string): void {
    field.properties[key] = [...field.properties[key], label];
    this.emit(field);
  }

  removeArrayOption(field: BuilderField, key: 'prefixChoices' | 'suffixChoices', index: number): void {
    const next = [...field.properties[key]];
    next.splice(index, 1);
    field.properties[key] = next;
    this.emit(field);
  }

  toggleAllowedDay(field: BuilderField, day: string, checked: boolean): void {
    const key: 'dateTimeAllowedDays' | 'allowedDays' = field.type === 'Date-Time' ? 'dateTimeAllowedDays' : 'allowedDays';
    const days = [...(field.properties[key] ?? [])];
    field.properties[key] = checked && !days.includes(day)
      ? [...days, day]
      : days.filter((value) => value !== day);
    this.emit(field);
  }

  updateDurationPart(field: BuilderField, part: 'mins' | 'secs', value: number): void {
    if (field.type === 'Audio') {
      this.updateProperty(field, part === 'mins' ? 'audioDurationMins' : 'audioDurationSecs', value);
      return;
    }
    this.updateProperty(field, part === 'mins' ? 'videoDurationMins' : 'videoDurationSecs', value);
  }

  updateToolbarFlag(field: BuilderField, key: string, checked: boolean): void {
    const toolbar = { ...(field.properties.richTextToolbar ?? {}) };
    toolbar[key] = checked;
    field.properties.richTextToolbar = toolbar;
    this.emit(field);
  }

  setInitialValueMode(field: BuilderField, mode: string): void {
    if (mode === 'current') {
      this.updateProperty(field, 'defaultValue', this.getCurrentInitialToken(field));
      return;
    }
    this.updateProperty(field, 'defaultValue', '');
  }
}
