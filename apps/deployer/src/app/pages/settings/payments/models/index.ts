export type { PaymentModel, RecordPaymentPayload } from './payment.model';

export interface SettingsPaymentRow {
  date: string;
  reference: string;
  amount: string;
  method: string;
  invoice: string;
  status: 'full' | 'partial' | 'settled';
}
