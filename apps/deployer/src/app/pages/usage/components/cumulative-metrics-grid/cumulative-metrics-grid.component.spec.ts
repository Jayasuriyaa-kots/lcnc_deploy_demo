import { CumulativeMetricsGridComponent } from './cumulative-metrics-grid.component';
import {
  createSmokeFixture,
  smokeTestData
} from '../../../../testing/component-smoke-test.helpers';

describe('CumulativeMetricsGridComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(CumulativeMetricsGridComponent, {
      inputs: {
        metrics: smokeTestData.cumulativeMetrics
      }
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
