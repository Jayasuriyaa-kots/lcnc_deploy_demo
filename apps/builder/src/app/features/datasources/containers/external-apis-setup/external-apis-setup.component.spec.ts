import { ExternalApisSetupComponent } from './external-apis-setup.component';
import { createStandaloneComponent } from '../../testing/standalone-component-smoke-test';

describe('ExternalApisSetupComponent', () => {
  it('creates', async () => expect(await createStandaloneComponent(ExternalApisSetupComponent)).toBeTruthy());
});
