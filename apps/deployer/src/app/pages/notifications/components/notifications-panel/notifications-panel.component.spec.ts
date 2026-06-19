import { NotificationsPanelComponent } from './notifications-panel.component';
import {
  createSmokeFixture,
  smokeTestData
} from '../../../../testing/component-smoke-test.helpers';

describe('NotificationsPanelComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(NotificationsPanelComponent, {
      inputs: {
        notifications: smokeTestData.notifications
      }
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
