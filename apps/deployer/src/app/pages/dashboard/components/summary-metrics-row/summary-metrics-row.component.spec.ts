import { SummaryMetricsRowComponent } from './summary-metrics-row.component';
import {
  createSmokeFixture,
  smokeTestData
} from '../../../../testing/component-smoke-test.helpers';

describe('SummaryMetricsRowComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(SummaryMetricsRowComponent, {
      inputs: {
        kpis: smokeTestData.dashboardKpis
      }
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
