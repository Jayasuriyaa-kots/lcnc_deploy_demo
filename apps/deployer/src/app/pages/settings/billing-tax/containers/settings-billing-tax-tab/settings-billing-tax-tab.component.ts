import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { QoButtonComponent, QoFormFieldComponent, QoInputComponent } from '@qo/ui-components';
import { BillingTaxModel, SettingsCurrentPlan } from '../../models';
import { BillingTaxSettingsFacadeService } from '../../services/billing-tax-settings.service';
import { DeployerI18nService } from '../../../../../services/deployer-i18n.service';

@Component({
  selector: 'app-settings-billing-tax-tab',
  standalone: true,
  imports: [ReactiveFormsModule, QoButtonComponent, QoFormFieldComponent, QoInputComponent],
  templateUrl: './settings-billing-tax-tab.component.html',
  styleUrl: './settings-billing-tax-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsBillingTaxTabComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly billingTaxSettings = inject(BillingTaxSettingsFacadeService);
  readonly i18n = inject(DeployerI18nService);

  readonly billing = input.required<BillingTaxModel>();
  readonly currentPlan = input.required<SettingsCurrentPlan>();
  readonly billingTaxForm = this.formBuilder.nonNullable.group({
    gstNumber: [''],
    tanNumber: [''],
    panNumber: [''],
    billingContactName: [''],
    billingEmail: ['']
  });

  constructor() {
    effect(() => {
      this.billingTaxForm.patchValue(this.billing(), { emitEvent: false });
    });
  }

  saveTaxDetails(): void {
    const { gstNumber, tanNumber, panNumber } = this.billingTaxForm.getRawValue();

    this.billingTaxSettings.saveTaxDetails({ gstNumber, tanNumber, panNumber });
  }

  saveBillingDetails(): void {
    const { billingContactName, billingEmail } = this.billingTaxForm.getRawValue();

    this.billingTaxSettings.saveBillingDetails({ billingContactName, billingEmail });
  }
}
