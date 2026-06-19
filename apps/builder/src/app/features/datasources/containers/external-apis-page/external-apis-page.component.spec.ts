import { ExternalApisPageComponent } from './external-apis-page.component';
import { createStandaloneComponent } from '../../testing/standalone-component-smoke-test';

describe('ExternalApisPageComponent', () => {
  it('creates', async () => expect(await createStandaloneComponent(ExternalApisPageComponent)).toBeTruthy());
});
