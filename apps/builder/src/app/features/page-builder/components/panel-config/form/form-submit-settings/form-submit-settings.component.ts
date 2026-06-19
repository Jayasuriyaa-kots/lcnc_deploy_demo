import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  QoInputComponent,
  QoToggleComponent,
} from '@qo/ui-components';
import { FormSubmitTab } from '@builder/features/page-builder/models/page-builder-panel-state.model';
import {
  createDefaultFormWidgetSubmitConfig,
  FormWidgetSubmitConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';
import { injectPageBuilderTranslate } from '@builder/features/page-builder/services/page-builder-i18n.service';

type SubmitSettingsForm = FormGroup<{
  successMessage: FormControl<string>;
  submitButtonText: FormControl<string>;
  resetButtonText: FormControl<string>;
  allowPublicAccess: FormControl<boolean>;
}>;

@Component({
  selector: 'app-form-submit-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, QoInputComponent, QoToggleComponent, TranslocoPipe],
  templateUrl: './form-submit-settings.component.html',
  styleUrl: './form-submit-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormSubmitSettingsComponent {
  protected readonly t = injectPageBuilderTranslate();
  readonly activeTab = input<FormSubmitTab>('properties');
  readonly activeTabChange = output<FormSubmitTab>();
  readonly config = input<FormWidgetSubmitConfig>(createDefaultFormWidgetSubmitConfig());
  readonly configChange = output<FormWidgetSubmitConfig>();

  readonly form: SubmitSettingsForm = new FormGroup({
    successMessage: new FormControl('', { nonNullable: true }),
    submitButtonText: new FormControl('', { nonNullable: true }),
    resetButtonText: new FormControl('', { nonNullable: true }),
    allowPublicAccess: new FormControl(false, { nonNullable: true }),
  });
  private readonly formValue = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  constructor() {
    effect(() => {
      const config = {
        ...createDefaultFormWidgetSubmitConfig(),
        ...this.config(),
      };

      this.form.setValue(
        {
          successMessage: config.successMessage,
          submitButtonText: config.submitButtonText,
          resetButtonText: config.resetButtonText,
          allowPublicAccess: config.allowPublicAccess,
        },
        { emitEvent: false },
      );
    });

    effect(() => {
      const value = this.formValue();
      this.configChange.emit({
        successMessage: value.successMessage ?? '',
        submitButtonText: value.submitButtonText ?? '',
        resetButtonText: value.resetButtonText ?? '',
        allowPublicAccess: value.allowPublicAccess ?? false,
      });
    });
  }

  setTab(tab: FormSubmitTab): void {
    this.activeTabChange.emit(tab);
  }
}
