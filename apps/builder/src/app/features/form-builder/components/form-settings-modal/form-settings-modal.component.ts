import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FormSettings } from '@builder/features/form-builder/components/form-preview-modal/form-preview-modal.component';
import {
  QoBadgeComponent,
  QoButtonComponent,
  QoFormFieldComponent,
  QoInputComponent,
  QoModalComponent,
  QoSelectComponent,
  QoTextareaComponent,
  QoToggleComponent,
  SelectOption
} from '@qo/ui-components';
import { TranslocoPipe } from '@jsverse/transloco';
import { FormBuilderI18nService } from '@builder/features/form-builder/services/form-builder-i18n.service';

export interface FormSettingsMeta {
  name: string;
  description: string;
  datasourceLabel: string;
  queryLabel: string;
  fieldCount: number;
  status: string;
}

const DEFAULT_SETTINGS: FormSettings = {
  formLayout: 'Single Column',
  labelPlacement: 'Top',
  showSectionBorders: false,
  submitBehavior: 'Show Message',
  redirectUrl: '',
  duplicateDetection: 'None'
};

@Component({
  selector: 'app-form-settings-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    QoBadgeComponent,
    QoButtonComponent,
    QoFormFieldComponent,
    QoInputComponent,
    QoModalComponent,
    QoSelectComponent,
    QoTextareaComponent,
    QoToggleComponent,
    TranslocoPipe
  ],
  templateUrl: './form-settings-modal.component.html',
  styleUrl: './form-settings-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormSettingsModalComponent {
  private readonly formBuilder = inject(FormBuilder).nonNullable;
  private readonly i18n = inject(FormBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);

  get formLayoutOptions(): SelectOption[] {
    return [
      { label: this.i18n.t('settings.options.formLayout.singleColumn'), value: 'Single Column' },
      { label: this.i18n.t('settings.options.formLayout.twoColumn'), value: 'Two Column' },
      { label: this.i18n.t('settings.options.formLayout.multiSection'), value: 'Multi Section' },
    ];
  }

  get labelPlacementOptions(): SelectOption[] {
    return [
      { label: this.i18n.t('settings.options.labelPlacement.top'), value: 'Top' },
      { label: this.i18n.t('settings.options.labelPlacement.left'), value: 'Left' },
      { label: this.i18n.t('settings.options.labelPlacement.placeholderOnly'), value: 'Placeholder Only' },
    ];
  }

  get submitBehaviorOptions(): SelectOption[] {
    return [
      { label: this.i18n.t('settings.options.submitBehavior.showMessage'), value: 'Show Message' },
      { label: this.i18n.t('settings.options.submitBehavior.redirect'), value: 'Redirect' },
    ];
  }

  get duplicateDetectionOptions(): SelectOption[] {
    return [
      { label: this.i18n.t('settings.options.duplicateDetection.none'), value: 'None' },
      { label: this.i18n.t('settings.options.duplicateDetection.warn'), value: 'Warn' },
      { label: this.i18n.t('settings.options.duplicateDetection.block'), value: 'Block' },
    ];
  }

  readonly formName = input('');
  readonly formDescription = input('');
  readonly settings = input<FormSettings>(DEFAULT_SETTINGS);
  readonly meta = input<FormSettingsMeta>({
    name: '',
    description: '',
    datasourceLabel: '',
    queryLabel: '',
    fieldCount: 0,
    status: 'draft'
  });

  readonly closed = output<void>();
  readonly saved = output<{ name: string; description: string; settings: FormSettings }>();

  readonly settingsForm = this.formBuilder.group({
    draftName: [''],
    draftDescription: [''],
    formLayout: ['Single Column' as FormSettings['formLayout']],
    labelPlacement: ['Top' as FormSettings['labelPlacement']],
    showSectionBorders: [false],
    submitBehavior: ['Show Message' as FormSettings['submitBehavior']],
    redirectUrl: [''],
    duplicateDetection: ['None' as FormSettings['duplicateDetection']]
  });

  constructor() {
    // Rehydrates the modal form when parent name/description/settings inputs change.
    effect(() => {
      const currentSettings = this.settings();
      this.settingsForm.setValue(
        {
          draftName: this.formName(),
          draftDescription: this.formDescription(),
          formLayout: currentSettings.formLayout,
          labelPlacement: currentSettings.labelPlacement,
          showSectionBorders: currentSettings.showSectionBorders,
          submitBehavior: currentSettings.submitBehavior,
          redirectUrl: currentSettings.redirectUrl ?? '',
          duplicateDetection: currentSettings.duplicateDetection
        },
        { emitEvent: false }
      );
    }, { allowSignalWrites: true });
  }

  // Emits close without saving changes.
  close(): void {
    this.closed.emit();
  }

  // Narrows Qo select values before writing them to typed form controls.
  updateSelectValue(
    key: 'formLayout' | 'labelPlacement' | 'submitBehavior' | 'duplicateDetection',
    value: SelectOption['value']
  ): void {
    const nextValue = typeof value === 'string' ? value : '';
    switch (key) {
      case 'formLayout':
        this.settingsForm.controls.formLayout.setValue(nextValue as FormSettings['formLayout']);
        break;
      case 'labelPlacement':
        this.settingsForm.controls.labelPlacement.setValue(nextValue as FormSettings['labelPlacement']);
        break;
      case 'submitBehavior':
        this.settingsForm.controls.submitBehavior.setValue(nextValue as FormSettings['submitBehavior']);
        break;
      case 'duplicateDetection':
        this.settingsForm.controls.duplicateDetection.setValue(nextValue as FormSettings['duplicateDetection']);
        break;
    }
  }

  // Emits settings plus edited name/description, then closes the modal.
  save(): void {
    const formValue = this.settingsForm.getRawValue();
    const nextName = formValue.draftName.trim() || this.formName().trim() || this.meta().name.trim() || this.i18n.scope('settings.untitledForm');

    this.saved.emit({
      name: nextName,
      description: formValue.draftDescription,
      settings: {
        formLayout: formValue.formLayout,
        labelPlacement: formValue.labelPlacement,
        showSectionBorders: formValue.showSectionBorders,
        submitBehavior: formValue.submitBehavior,
        redirectUrl: formValue.redirectUrl ?? '',
        duplicateDetection: formValue.duplicateDetection
      }
    });
    this.close();
  }
}
