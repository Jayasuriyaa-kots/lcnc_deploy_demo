import { DatasourceDashboardComponent } from './datasource-dashboard.component';
import { createStandaloneComponent } from '../../testing/standalone-component-smoke-test';

describe('DatasourceDashboardComponent', () => {
  it('creates', async () => expect(await createStandaloneComponent(DatasourceDashboardComponent)).toBeTruthy());
});
