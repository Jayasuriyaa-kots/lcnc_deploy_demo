import { TranslocoPipe } from '@jsverse/transloco';

import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  createDefaultTextBlockWidgetConfig,
  TextBlockWidgetConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';
import { QoInputComponent, QoSelectComponent, QoTextareaComponent, QoToggleComponent } from '@qo/ui-components';
import {
  getTextBlockWidgetPreset,
  TextBlockVariant,
} from '../../widget-showcase/text-block/text-block-widget.config';

interface TextBlockTypeOption {
  label: string;
  value: TextBlockVariant;
}

interface FilePickerOption {
  label: string;
  value: string;
}

interface DateFormatOption {
  label: string;
  value: string;
}

import { injectPageBuilderTranslate } from '@builder/features/page-builder/services/page-builder-i18n.service';

@Component({
  selector: 'app-text-block-settings-panel',
  standalone: true,
  imports: [ReactiveFormsModule, QoInputComponent, QoSelectComponent, QoTextareaComponent, QoToggleComponent,
    TranslocoPipe,
  ],
  templateUrl: './text-block-settings-panel.component.html',
  styleUrl: './text-block-settings-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextBlockSettingsPanelComponent {
  protected readonly t = injectPageBuilderTranslate();
  readonly config = input<TextBlockWidgetConfig>(createDefaultTextBlockWidgetConfig());
  readonly configChange = output<TextBlockWidgetConfig>();

  readonly inputTypeOptions: TextBlockTypeOption[] = [
    { label: 'None', value: 'none' },
    { label: 'Text', value: 'text' },
    { label: 'Number', value: 'number' },
    { label: 'Currency', value: 'currency' },
    { label: 'Email', value: 'email' },
    { label: 'URL', value: 'url' },
    { label: 'Password', value: 'password' },
    { label: 'Date', value: 'date' },
    { label: 'File Picker', value: 'file' },
    { label: 'Rich Text', value: 'richtext' },
  ];
  readonly fileTypeOptions: FilePickerOption[] = [
    { label: 'All Files', value: 'all' },
    { label: 'Documents', value: 'documents' },
    { label: 'Images', value: 'images' },
    { label: 'PDF', value: 'pdf' },
    { label: 'Spreadsheets', value: 'spreadsheets' },
  ];
  readonly dataFormatOptions: FilePickerOption[] = [
    { label: 'File', value: 'file' },
    { label: 'Base64', value: 'base64' },
    { label: 'URL', value: 'url' },
    { label: 'Metadata', value: 'metadata' },
  ];
  readonly dateFormatOptions: DateFormatOption[] = [
    { label: 'DD/MM/YYYY HH:mm', value: 'dd/mm/yyyy hh:mm' },
    { label: 'MM/DD/YYYY HH:mm', value: 'mm/dd/yyyy hh:mm' },
    { label: 'YYYY-MM-DD HH:mm', value: 'yyyy-mm-dd hh:mm' },
    { label: 'DD MMM YYYY HH:mm', value: 'dd mmm yyyy hh:mm' },
  ];

  readonly form;
  private readonly defaultValueChange;

  constructor(private readonly formBuilder: FormBuilder) {
    this.form = this.formBuilder.nonNullable.group({
      label: '',
      widgetName: '',
      labelColor: 'var(--qo-color-neutral-900)',
      labelFontSize: '14px',
      placeholder: '',
      defaultValue: '',
      overflowText: 'none' as TextBlockWidgetConfig['overflowText'],
      disableLinks: false,
      allowedFileTypes: 'all',
      dataFormat: 'file',
      maxFiles: 1,
      animateLoading: true,
      dateFormat: '',
      minDate: '',
      maxDate: '',
      inputType: 'text' as TextBlockVariant,
      required: false,
      readOnly: false,
      visible: true,
      disabled: false,
      minLength: null as number | null,
      maxLength: null as number | null,
      customRegex: '',
    });

    effect(() => {
      const nextConfig = {
        ...createDefaultTextBlockWidgetConfig(),
        ...(this.config() ?? {}),
      };

      this.form.setValue(
        {
          label: nextConfig.label,
          widgetName: nextConfig.widgetName,
          labelColor: nextConfig.labelColor,
          labelFontSize: nextConfig.labelFontSize,
          placeholder: nextConfig.placeholder,
          defaultValue: nextConfig.defaultValue,
          overflowText: nextConfig.overflowText,
          disableLinks: nextConfig.disableLinks,
          allowedFileTypes: nextConfig.allowedFileTypes,
          dataFormat: nextConfig.dataFormat,
          maxFiles: nextConfig.maxFiles,
          animateLoading: nextConfig.animateLoading,
          dateFormat: nextConfig.dateFormat,
          minDate: nextConfig.minDate,
          maxDate: nextConfig.maxDate,
          inputType: nextConfig.inputType,
          required: nextConfig.required,
          readOnly: nextConfig.readOnly,
          visible: nextConfig.visible,
          disabled: nextConfig.disabled,
          minLength: nextConfig.minLength,
          maxLength: nextConfig.maxLength,
          customRegex: nextConfig.customRegex,
        },
        { emitEvent: false },
      );
    });

    this.defaultValueChange = toSignal(this.form.controls.defaultValue.valueChanges, {
      initialValue: this.form.controls.defaultValue.value,
    });

    effect(() => {
      const value = this.defaultValueChange();
      if (!this.isLabelText()) {
        return;
      }

      if (value === this.config().defaultValue) {
        return;
      }

      this.emitConfig({ defaultValue: value });
    });
  }

  updateTextField(
    field:
      | 'label'
      | 'widgetName'
      | 'labelColor'
      | 'labelFontSize'
      | 'placeholder'
      | 'defaultValue'
      | 'dateFormat'
      | 'minDate'
      | 'maxDate'
      | 'customRegex',
    value: string,
  ): void {
    if (this.isDatePicker() && (field === 'defaultValue' || field === 'minDate' || field === 'maxDate')) {
      const nextConfig = this.getSanitizedDateConfig(field, value);

      this.form.controls.defaultValue.setValue(nextConfig.defaultValue, { emitEvent: false });
      this.form.controls.minDate.setValue(nextConfig.minDate, { emitEvent: false });
      this.form.controls.maxDate.setValue(nextConfig.maxDate, { emitEvent: false });

      this.emitConfig(nextConfig);
      return;
    }

    this.emitConfig({ [field]: value } as Partial<TextBlockWidgetConfig>);
  }

  updateInputType(value: string): void {
    const previousType = this.form.controls.inputType.value;
    const nextType = value as TextBlockVariant;
    const previousPlaceholder = this.form.controls.placeholder.value;
    const nextPlaceholder =
      previousPlaceholder === getTextBlockWidgetPreset(previousType).placeholder
        ? getTextBlockWidgetPreset(nextType).placeholder
        : previousPlaceholder;
    const previousLabel = this.form.controls.label.value;
    const nextLabel =
      previousLabel === getTextBlockWidgetPreset(previousType).label
        ? getTextBlockWidgetPreset(nextType).label
        : previousLabel;
    const previousDateFormat = this.form.controls.dateFormat.value;
    const nextDateFormat =
      nextType === 'date'
        ? previousDateFormat || 'dd/mm/yyyy hh:mm'
        : '';
    const nextMinDate = nextType === 'date' ? this.form.controls.minDate.value : '';
    const nextMaxDate = nextType === 'date' ? this.form.controls.maxDate.value : '';

    this.form.controls.inputType.setValue(nextType, { emitEvent: false });
    this.form.controls.label.setValue(nextLabel, { emitEvent: false });
    this.form.controls.placeholder.setValue(nextPlaceholder, { emitEvent: false });
    this.form.controls.dateFormat.setValue(nextDateFormat, { emitEvent: false });
    this.form.controls.minDate.setValue(nextMinDate, { emitEvent: false });
    this.form.controls.maxDate.setValue(nextMaxDate, { emitEvent: false });

    this.emitConfig({
      label: nextLabel,
      inputType: nextType,
      placeholder: nextPlaceholder,
      dateFormat: nextDateFormat,
      minDate: nextMinDate,
      maxDate: nextMaxDate,
    });
  }

  getInputTypeSelectValue(value: unknown): string {
    if (typeof value === 'string') {
      return value || this.form.controls.inputType.value;
    }

    if (value && typeof value === 'object' && 'value' in value) {
      const optionValue = (value as { value?: unknown }).value;
      return typeof optionValue === 'string' && optionValue ? optionValue : this.form.controls.inputType.value;
    }

    return this.form.controls.inputType.value;
  }

  toggleBooleanField(field: 'required' | 'readOnly' | 'visible' | 'disabled' | 'animateLoading' | 'disableLinks'): void {
    const nextValue = !this.form.controls[field].value;
    this.form.controls[field].setValue(nextValue, { emitEvent: false });
    this.emitConfig({ [field]: nextValue } as Partial<TextBlockWidgetConfig>);
  }

  onBooleanFieldChange(
    field: 'required' | 'readOnly' | 'visible' | 'disabled' | 'animateLoading',
    value: boolean,
  ): void {
    this.form.controls[field].setValue(value, { emitEvent: false });
    this.emitConfig({ [field]: value } as Partial<TextBlockWidgetConfig>);
  }

  updateNumericField(field: 'minLength' | 'maxLength' | 'maxFiles', value: string): void {
    const trimmedValue = value.trim();
    this.form.controls[field].setValue(
      field === 'maxFiles' ? Math.max(1, Number(trimmedValue || '1')) : trimmedValue ? Number(trimmedValue) : null,
      { emitEvent: false },
    );
    this.emitConfig({
      [field]: field === 'maxFiles' ? Math.max(1, Number(trimmedValue || '1')) : trimmedValue ? Number(trimmedValue) : null,
    } as Partial<TextBlockWidgetConfig>);
  }

  getNumericInputValue(value: unknown): string {
    if (typeof value === 'number') {
      return String(value);
    }

    if (typeof value === 'string') {
      return value;
    }

    if (value && typeof value === 'object' && 'value' in value) {
      const inputValue = (value as { value?: unknown }).value;

      if (typeof inputValue === 'number' || typeof inputValue === 'string') {
        return String(inputValue);
      }
    }

    return '';
  }

  updateFilePickerSelect(field: 'allowedFileTypes' | 'dataFormat', value: string): void {
    this.form.controls[field].setValue(value, { emitEvent: false });
    this.emitConfig({ [field]: value } as Partial<TextBlockWidgetConfig>);
  }

  updateDateFormat(value: string): void {
    this.form.controls.dateFormat.setValue(value, { emitEvent: false });
    this.emitConfig({ dateFormat: value });
  }

  updateOverflowText(value: TextBlockWidgetConfig['overflowText']): void {
    this.form.controls.overflowText.setValue(value, { emitEvent: false });
    this.emitConfig({ overflowText: value });
  }

  showInputTypeSelector(): boolean {
    return this.config().allowTypeSelection;
  }

  isDatePicker(): boolean {
    return this.form.controls.inputType.value === 'date';
  }

  isFilePicker(): boolean {
    return this.form.controls.inputType.value === 'file';
  }

  isLabelText(): boolean {
    return this.form.controls.inputType.value === 'labeltext';
  }

  private emitConfig(partial: Partial<TextBlockWidgetConfig>): void {
    this.configChange.emit({
      ...this.config(),
      allowTypeSelection: this.config().allowTypeSelection,
      ...this.form.getRawValue(),
      ...partial,
    });
  }

  private getSanitizedDateConfig(
    field: 'defaultValue' | 'minDate' | 'maxDate',
    value: string,
  ): Pick<TextBlockWidgetConfig, 'defaultValue' | 'minDate' | 'maxDate'> {
    const nextConfig = {
      defaultValue: this.form.controls.defaultValue.value,
      minDate: this.form.controls.minDate.value,
      maxDate: this.form.controls.maxDate.value,
      [field]: value,
    };

    if (nextConfig.minDate && nextConfig.maxDate && nextConfig.minDate > nextConfig.maxDate) {
      if (field === 'minDate') {
        nextConfig.maxDate = nextConfig.minDate;
      } else if (field === 'maxDate') {
        nextConfig.minDate = nextConfig.maxDate;
      }
    }

    if (nextConfig.defaultValue) {
      if (nextConfig.minDate && nextConfig.defaultValue < nextConfig.minDate) {
        nextConfig.defaultValue = nextConfig.minDate;
      }

      if (nextConfig.maxDate && nextConfig.defaultValue > nextConfig.maxDate) {
        nextConfig.defaultValue = nextConfig.maxDate;
      }
    }

    return nextConfig;
  }
}
