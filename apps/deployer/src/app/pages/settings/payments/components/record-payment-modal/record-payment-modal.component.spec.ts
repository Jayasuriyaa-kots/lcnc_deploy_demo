import { RecordPaymentModalComponent } from './record-payment-modal.component';
import { createSmokeFixture } from '../../../../../testing/component-smoke-test.helpers';

describe('RecordPaymentModalComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(RecordPaymentModalComponent, {
      inputs: {
        invoiceOptions: ['INV-2026-004'],
        paymentMethods: ['Bank Transfer'],
        invoiceOpen: false,
        paymentMethodOpen: false,
        selectedInvoice: 'INV-2026-004',
        selectedPaymentMethod: 'Bank Transfer',
        amountPlaceholder: 'Rs 14,999',
        paymentDateValue: '1 Apr 2026',
        paymentDateNativeValue: '2026-04-01'
      }
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
