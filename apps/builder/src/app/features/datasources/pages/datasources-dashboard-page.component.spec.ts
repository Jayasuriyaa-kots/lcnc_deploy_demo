import { DatasourcesDashboardPageComponent } from './datasources-dashboard-page.component';
import { createStandaloneComponent } from '../testing/standalone-component-smoke-test';

describe('DatasourcesDashboardPageComponent', () => {
  it('creates', async () => expect(await createStandaloneComponent(DatasourcesDashboardPageComponent)).toBeTruthy());
});
