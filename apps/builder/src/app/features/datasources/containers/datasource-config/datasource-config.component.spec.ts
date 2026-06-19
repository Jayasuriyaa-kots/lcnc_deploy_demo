import { DatasourceConfigComponent } from './datasource-config.component';
import { createStandaloneComponent } from '../../testing/standalone-component-smoke-test';

describe('DatasourceConfigComponent', () => {
  it('creates', async () => expect(await createStandaloneComponent(DatasourceConfigComponent)).toBeTruthy());
});
