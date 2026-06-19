import { NotificationsPanelHostComponent } from './notifications-panel-host.component';
import { createSmokeFixture } from '../../../../testing/component-smoke-test.helpers';

describe('NotificationsPanelHostComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(NotificationsPanelHostComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
