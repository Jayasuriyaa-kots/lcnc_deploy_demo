import { UserFilterBarComponent } from './user-filter-bar.component';
import { createSmokeFixture } from '../../../../testing/component-smoke-test.helpers';

describe('UserFilterBarComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(UserFilterBarComponent, {
      inputs: {
        activeFilter: 'All',
        count: 5
      }
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
