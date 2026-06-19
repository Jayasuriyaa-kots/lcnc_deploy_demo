import { EndpointSubtableComponent } from './endpoint-subtable.component';
import {
  createSmokeFixture,
  smokeTestData
} from '../../../../testing/component-smoke-test.helpers';

describe('EndpointSubtableComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(EndpointSubtableComponent, {
      inputs: {
        endpoints: smokeTestData.usageEndpoints
      }
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
