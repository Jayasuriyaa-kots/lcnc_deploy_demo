import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  QoCheckboxComponent,
  QoButtonComponent,
  QoFormFieldComponent,
  QoInputComponent,
  QoSelectComponent,
  QoTextareaComponent,
  QoToggleComponent,
} from '@qo/ui-components';
import {
  ExternalApiConfigurationValue,
  ExternalApiFieldSchema,
  ExternalApiMappingValue,
  ExternalApiSchema,
  externalMappingFieldTypeOptions,
} from '@builder/features/datasources/models/external-api-schemas';
import { DatasourcesI18nService } from '@builder/features/datasources/services/datasources-i18n.service';

type DynamicIntegrationFormGroup = FormGroup;

@Component({
  selector: 'app-dynamic-integration-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    QoButtonComponent,
    QoCheckboxComponent,
    QoFormFieldComponent,
    QoInputComponent,
    QoSelectComponent,
    QoTextareaComponent,
    QoToggleComponent,
  ],
  templateUrl: './dynamic-integration-form.component.html',
  styleUrl: './dynamic-integration-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicIntegrationFormComponent {
  private readonly i18n = inject(DatasourcesI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
  readonly connectorKey = input.required<string>();
  readonly schema = input<ExternalApiSchema | null>(null);
  readonly form = input.required<DynamicIntegrationFormGroup>();
  readonly activeMappingTab = input('requestMappings');
  readonly activeMappingTabChange = output<string>();
  readonly valueChange = output<ExternalApiConfigurationValue>();
  readonly mappingFieldTypeOptions = externalMappingFieldTypeOptions;

  markAllAsTouched(): void {
    this.form().markAllAsTouched();
  }

  invalid(): boolean {
    return this.form().invalid || !this.schema();
  }

  getRawValue(): ExternalApiConfigurationValue {
    return this.form().getRawValue() as ExternalApiConfigurationValue;
  }

  fieldError(field: ExternalApiFieldSchema): string {
    const control = this.form().controls[field.key];
    if (!control || !field.required || !control.touched || !control.invalid) {
      return '';
    }
    return this.i18n.translate('dynamicForm.requiredError', { label: field.label });
  }

  controlValue(key: string): boolean {
    return Boolean(this.form().controls[key]?.value);
  }

  fieldTextValue(key: string): string | number | null {
    return this.textValue(this.form().controls[key]?.value);
  }

  fieldSelectValue(key: string): string | number | boolean | null | undefined {
    return this.selectValue(this.form().controls[key]?.value);
  }

  mappingTextValue(mapping: FormGroup, key: string): string | number | null {
    return this.textValue(mapping.controls[key]?.value);
  }

  mappingSelectValue(mapping: FormGroup, key: string): string | number | boolean | null | undefined {
    return this.selectValue(mapping.controls[key]?.value);
  }

  setBooleanValue(key: string, value: boolean): void {
    const control = this.form().controls[key] as FormControl<string | boolean | number> | undefined;
    if (!control) {
      return;
    }
    control.setValue(value);
    control.markAsDirty();
    this.emitValue();
  }

  onFieldValueChange(key: string, value: unknown): void {
    const control = this.form().controls[key] as FormControl<string | boolean | number> | undefined;
    if (!control) {
      return;
    }
    control.setValue(value as never);
    this.emitValue();
  }

  notifyMappingChange(): void {
    this.emitValue();
  }

  mappingRows(key: string): FormGroup[] {
    const control = this.form().controls[key];
    return control instanceof FormArray ? control.controls as FormGroup[] : [];
  }

  addMappingRow(key: string): void {
    const control = this.form().controls[key];
    if (!(control instanceof FormArray)) {
      return;
    }
    control.push(
      new FormGroup({
        sourcePath: new FormControl('', { nonNullable: true }),
        targetField: new FormControl('', { nonNullable: true }),
        fieldType: new FormControl('Text', { nonNullable: true }),
        required: new FormControl(false, { nonNullable: true }),
      })
    );
    this.emitValue();
  }

  removeMappingRow(key: string, index: number): void {
    const control = this.form().controls[key];
    if (!(control instanceof FormArray)) {
      return;
    }
    if (control.length === 1) {
      control.at(0).reset({ sourcePath: '', targetField: '', fieldType: 'Text', required: false });
      this.emitValue();
      return;
    }
    control.removeAt(index);
    this.emitValue();
  }

  private emitValue(): void {
    this.valueChange.emit(this.form().getRawValue() as ExternalApiConfigurationValue);
  }

  private textValue(value: unknown): string | number | null {
    if (typeof value === 'string' || typeof value === 'number') {
      return value;
    }

    return null;
  }

  private selectValue(value: unknown): string | number | boolean | null | undefined {
    if (value === null || value === undefined) {
      return value === null ? null : undefined;
    }

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return value as string | number | boolean;
    }

    return undefined;
  }

  nonMappingFields(section: ExternalApiSchema['sections'][number]): ExternalApiFieldSchema[] {
    return section.fields.filter((field) => field.type !== 'mappingList');
  }

  mappingFields(section: ExternalApiSchema['sections'][number]): ExternalApiFieldSchema[] {
    return section.fields.filter((field) => field.type === 'mappingList');
  }

  mappingTabTitle(field: ExternalApiFieldSchema): string {
    const baseLabel =
      field.key === 'requestMappings'
        ? this.i18n.translate('dynamicForm.request')
        : field.key === 'responseMappings'
          ? this.i18n.translate('dynamicForm.response')
          : field.label;
    return `${baseLabel} (${this.mappingRows(field.key).length})`;
  }

  activeMappingTabTitle(section: ExternalApiSchema['sections'][number]): string {
    const activeField = this.activeMappingField(section);
    return activeField ? this.mappingTabTitle(activeField) : '';
  }

  setActiveMappingTab(key: string): void {
    this.activeMappingTabChange.emit(key);
  }

  setActiveMappingTabByTitle(section: ExternalApiSchema['sections'][number], title: string): void {
    const field =
      this.mappingFields(section).find((item) => this.mappingTabTitle(item) === title) ??
      this.mappingFields(section).find((item) =>
        title.startsWith(
          item.key === 'requestMappings'
            ? this.i18n.translate('dynamicForm.request')
            : this.i18n.translate('dynamicForm.response')
        )
      );

    if (field) {
      this.activeMappingTabChange.emit(field.key);
    }
  }

  activeMappingField(section: ExternalApiSchema['sections'][number]): ExternalApiFieldSchema | null {
    const fields = this.mappingFields(section);
    if (!fields.length) {
      return null;
    }

    return fields.find((field) => field.key === this.activeMappingTab()) ?? fields[0] ?? null;
  }

  activeMappingFields(section: ExternalApiSchema['sections'][number]): ExternalApiFieldSchema[] {
    const field = this.activeMappingField(section);
    return field ? [field] : [];
  }

  mappingTypeOptions(field: ExternalApiFieldSchema) {
    return field.options?.length ? field.options : this.mappingFieldTypeOptions;
  }
}
