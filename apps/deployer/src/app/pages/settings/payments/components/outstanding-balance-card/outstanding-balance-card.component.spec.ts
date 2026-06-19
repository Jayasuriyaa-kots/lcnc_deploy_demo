import { OutstandingBalanceCardComponent } from './outstanding-balance-card.component';
import { createSmokeFixture } from '../../../../../testing/component-smoke-test.helpers';

describe('OutstandingBalanceCardComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(OutstandingBalanceCardComponent, {
      inputs: {
        amount: 'Rs 14,999',
        pendingCount: '1 invoice pending',
        dueDetail: 'INV-2026-004 - Due by 15 Apr 2026'
      }
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
