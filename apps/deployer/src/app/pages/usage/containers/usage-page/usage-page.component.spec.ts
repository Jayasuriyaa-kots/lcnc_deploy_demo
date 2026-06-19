import { UsagePageComponent } from './usage-page.component';
import { createSmokeFixture } from '../../../../testing/component-smoke-test.helpers';

describe('UsagePageComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(UsagePageComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
