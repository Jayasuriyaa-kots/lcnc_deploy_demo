import { ApplicationCardComponent } from './application-card.component';
import {
  createSmokeFixture,
  smokeTestData
} from '../../../../testing/component-smoke-test.helpers';

describe('ApplicationCardComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(ApplicationCardComponent, {
      inputs: {
        application: smokeTestData.application
      }
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
