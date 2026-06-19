import { DatasourcesPageComponent } from './datasources-page.component';
import { createStandaloneComponent } from '../testing/standalone-component-smoke-test';

describe('DatasourcesPageComponent', () => {
  it('creates', async () => expect(await createStandaloneComponent(DatasourcesPageComponent)).toBeTruthy());
});
