import { ExternalApisDashboardComponent } from './external-apis-dashboard.component';
import { createStandaloneComponent } from '../../testing/standalone-component-smoke-test';

describe('ExternalApisDashboardComponent', () => {
  it('creates', async () => expect(await createStandaloneComponent(ExternalApisDashboardComponent)).toBeTruthy());
});
