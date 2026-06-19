import { DatasourceConfigOptionsComponent } from './datasource-config-options.component';
import { createStandaloneComponent } from '../../../testing/standalone-component-smoke-test';

describe('DatasourceConfigOptionsComponent', () => {
  it('creates', async () => expect(await createStandaloneComponent(DatasourceConfigOptionsComponent)).toBeTruthy());
});
