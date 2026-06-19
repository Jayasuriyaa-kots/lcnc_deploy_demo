import { DynamicIntegrationFormComponent } from './dynamic-integration-form.component';
import { createStandaloneComponent } from '../../testing/standalone-component-smoke-test';

describe('DynamicIntegrationFormComponent', () => {
  it('creates', async () => expect(await createStandaloneComponent(DynamicIntegrationFormComponent)).toBeTruthy());
});
