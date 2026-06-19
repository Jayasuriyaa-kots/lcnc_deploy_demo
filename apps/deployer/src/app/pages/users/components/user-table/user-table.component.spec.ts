import { UserTableComponent } from './user-table.component';
import {
  createSmokeFixture,
  smokeTestData
} from '../../../../testing/component-smoke-test.helpers';

describe('UserTableComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(UserTableComponent, {
      inputs: {
        users: smokeTestData.users,
        userMeta: smokeTestData.userMeta
      }
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
