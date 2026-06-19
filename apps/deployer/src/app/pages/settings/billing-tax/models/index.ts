export type { BillingTaxModel } from './billing-tax.model';

export interface SettingsCurrentPlan {
  plan: string;
  billingCycle: string;
  nextInvoice: string;
  paymentMethod: string;
}
