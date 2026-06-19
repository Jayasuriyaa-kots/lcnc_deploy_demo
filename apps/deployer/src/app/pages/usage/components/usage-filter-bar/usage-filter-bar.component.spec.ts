import { UsageFilterBarComponent } from './usage-filter-bar.component';
import { createSmokeFixture } from '../../../../testing/component-smoke-test.helpers';

describe('UsageFilterBarComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(UsageFilterBarComponent, {
      inputs: {
        filters: ['Last 30 Days', 'All Applications', 'Export CSV']
      }
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
