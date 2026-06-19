import { SettingsPageComponent } from './settings-page.component';
import { createSmokeFixture } from '../../../../testing/component-smoke-test.helpers';

describe('SettingsPageComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(SettingsPageComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
