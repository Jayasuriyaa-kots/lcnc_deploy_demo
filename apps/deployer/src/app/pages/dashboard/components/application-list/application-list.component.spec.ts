import { ApplicationListComponent } from './application-list.component';
import {
  createSmokeFixture,
  smokeTestData
} from '../../../../testing/component-smoke-test.helpers';

describe('ApplicationListComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(ApplicationListComponent, {
      inputs: {
        applications: smokeTestData.applications
      }
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
