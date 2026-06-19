import { ExternalApisConnectorsComponent } from './external-apis-connectors.component';
import { createStandaloneComponent } from '../../testing/standalone-component-smoke-test';

describe('ExternalApisConnectorsComponent', () => {
  it('creates', async () => expect(await createStandaloneComponent(ExternalApisConnectorsComponent)).toBeTruthy());
});
