import { Injectable, inject, signal } from '@angular/core';
import { BillingTaxModel } from '../models';
import { SettingsFacadeService } from '../../services/settings-facade.service';

@Injectable({ providedIn: 'root' })
export class BillingTaxSettingsFacadeService {
  private readonly facade = inject(SettingsFacadeService);

  readonly billing = this.facade.billing;
  readonly currentPlan = this.facade.currentPlan;
  readonly lastTaxDetailsSave = signal<Pick<BillingTaxModel, 'gstNumber' | 'tanNumber' | 'panNumber'> | null>(null);
  readonly lastBillingDetailsSave = signal<Pick<BillingTaxModel, 'billingContactName' | 'billingEmail'> | null>(null);

  saveTaxDetails(details: Pick<BillingTaxModel, 'gstNumber' | 'tanNumber' | 'panNumber'>): void {
    this.lastTaxDetailsSave.set(details);
  }

  saveBillingDetails(details: Pick<BillingTaxModel, 'billingContactName' | 'billingEmail'>): void {
    this.lastBillingDetailsSave.set(details);
  }
}
