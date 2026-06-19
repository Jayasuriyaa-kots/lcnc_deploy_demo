import { DatasourceConfigConnectionComponent } from './datasource-config-connection.component';
import { createStandaloneComponent } from '../../../testing/standalone-component-smoke-test';

describe('DatasourceConfigConnectionComponent', () => {
  it('creates', async () => expect(await createStandaloneComponent(DatasourceConfigConnectionComponent)).toBeTruthy());
});
