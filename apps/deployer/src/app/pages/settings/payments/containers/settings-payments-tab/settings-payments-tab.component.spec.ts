import { SettingsPaymentsTabComponent } from './settings-payments-tab.component';
import {
  createSmokeFixture,
  smokeTestData
} from '../../../../../testing/component-smoke-test.helpers';

describe('SettingsPaymentsTabComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(SettingsPaymentsTabComponent, {
      inputs: {
        paymentRows: smokeTestData.paymentRows,
        outstandingAmount: 'Rs 14,999',
        pendingCount: '1 invoice pending',
        dueDetail: 'INV-2026-004 - Due by 15 Apr 2026'
      }
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
