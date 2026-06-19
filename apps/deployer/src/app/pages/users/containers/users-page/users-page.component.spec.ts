import { UsersPageComponent } from './users-page.component';
import { createSmokeFixture } from '../../../../testing/component-smoke-test.helpers';

describe('UsersPageComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(UsersPageComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
