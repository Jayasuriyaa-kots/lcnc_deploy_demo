export interface PaymentModel {
  id: string;
  method: string;
  amount: string;
  date: string;
  reference: string;
  note: string;
}

export interface RecordPaymentPayload {
  invoice: string;
  amount: string;
  paymentDate: string;
  referenceNumber: string;
  paymentMethod: string;
}
