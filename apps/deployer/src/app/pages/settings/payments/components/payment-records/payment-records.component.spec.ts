import { PaymentRecordsComponent } from './payment-records.component';
import {
  createSmokeFixture,
  smokeTestData
} from '../../../../../testing/component-smoke-test.helpers';

describe('PaymentRecordsComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(PaymentRecordsComponent, {
      inputs: {
        payments: smokeTestData.paymentRows
      }
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
