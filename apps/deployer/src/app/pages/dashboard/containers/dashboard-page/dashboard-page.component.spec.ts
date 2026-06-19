import { DashboardPageComponent } from './dashboard-page.component';
import { createSmokeFixture } from '../../../../testing/component-smoke-test.helpers';

describe('DashboardPageComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(DashboardPageComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
