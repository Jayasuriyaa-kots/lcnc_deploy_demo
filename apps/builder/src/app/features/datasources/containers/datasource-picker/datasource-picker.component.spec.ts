import { DatasourcePickerComponent } from './datasource-picker.component';
import { createStandaloneComponent } from '../../testing/standalone-component-smoke-test';

describe('DatasourcePickerComponent', () => {
  it('creates', async () => expect(await createStandaloneComponent(DatasourcePickerComponent)).toBeTruthy());
});
