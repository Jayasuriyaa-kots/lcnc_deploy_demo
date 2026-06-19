import { DatasourceCardComponent } from './datasource-card.component';
import { createStandaloneComponent } from '../../testing/standalone-component-smoke-test';

describe('DatasourceCardComponent', () => {
  it('creates', async () => expect(await createStandaloneComponent(DatasourceCardComponent)).toBeTruthy());
});
