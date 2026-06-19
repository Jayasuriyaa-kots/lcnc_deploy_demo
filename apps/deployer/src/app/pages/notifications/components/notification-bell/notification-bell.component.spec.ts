import { NotificationBellComponent } from './notification-bell.component';
import {
  createSmokeFixture,
  smokeTestData
} from '../../../../testing/component-smoke-test.helpers';

describe('NotificationBellComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(NotificationBellComponent, {
      inputs: {
        unreadCount: smokeTestData.notifications.length
      }
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
