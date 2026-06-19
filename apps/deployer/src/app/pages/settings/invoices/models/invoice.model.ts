export type InvoiceStatus = 'paid' | 'due' | 'overdue';

export interface InvoiceModel {
  id: string;
  invoiceNumber: string;
  date: string;
  billingPeriod: string;
  amount: string;
  status: InvoiceStatus;
}
