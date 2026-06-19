export type { InvoiceModel } from './invoice.model';

export interface SettingsInvoiceRow {
  invoiceNumber: string;
  dateRaised: string;
  billingPeriod: string;
  amount: string;
  status: 'paid' | 'pending' | 'overdue';
}
