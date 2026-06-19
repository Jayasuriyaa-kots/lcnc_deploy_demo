import { DatasourceQueryEditorComponent } from './datasource-query-editor.component';
import { createStandaloneComponent } from '../../testing/standalone-component-smoke-test';

describe('DatasourceQueryEditorComponent', () => {
  it('creates', async () => expect(await createStandaloneComponent(DatasourceQueryEditorComponent)).toBeTruthy());
});
