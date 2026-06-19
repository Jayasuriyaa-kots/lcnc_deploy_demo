import { SettingsInvoicesTabComponent } from './settings-invoices-tab.component';
import {
  createSmokeFixture,
  smokeTestData
} from '../../../../../testing/component-smoke-test.helpers';

describe('SettingsInvoicesTabComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(SettingsInvoicesTabComponent, {
      inputs: {
        invoiceRows: smokeTestData.invoiceRows
      }
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
