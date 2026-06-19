import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  QoButtonComponent,
  QoFormFieldComponent,
  QoInputComponent,
  QoModalComponent,
  QoSelectComponent,
  SelectOption
} from '@qo/ui-components';
import { AddOrganisationFormGroup } from '../../models/organisation.model';
import { DeployerI18nService } from '../../../../services/deployer-i18n.service';

@Component({
  selector: 'app-add-organisation-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    QoButtonComponent,
    QoFormFieldComponent,
    QoInputComponent,
    QoModalComponent,
    QoSelectComponent
  ],
  templateUrl: './add-organisation-modal.component.html',
  styleUrl: './add-organisation-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddOrganisationModalComponent {
  readonly i18n = inject(DeployerI18nService);
  readonly form = input.required<AddOrganisationFormGroup>();
  readonly entityTypes = input.required<readonly string[]>();
  readonly entityTypeOptions = computed<SelectOption[]>(() =>
    this.entityTypes().map((type) => ({
      label: type,
      value: type
    }))
  );

  readonly close = output<void>();
  readonly submitOrganisation = output<void>();

  controlError(
    controlName: keyof AddOrganisationFormGroup['controls']
  ): string | undefined {
    const control = this.form().controls[controlName];

    if (!control.touched || !control.invalid) {
      return undefined;
    }

    if (control.errors?.['required']) {
      return this.i18n.translate('validation.fieldRequired');
    }

    if (control.errors?.['email']) {
      return this.i18n.translate('validation.emailInvalid');
    }

    return this.i18n.translate('validation.checkThisField');
  }
}
