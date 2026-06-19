import { SettingsBillingTaxTabComponent } from './settings-billing-tax-tab.component';
import {
  createSmokeFixture,
  smokeTestData
} from '../../../../../testing/component-smoke-test.helpers';

describe('SettingsBillingTaxTabComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(SettingsBillingTaxTabComponent, {
      inputs: {
        currentPlan: smokeTestData.currentPlan
      }
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
