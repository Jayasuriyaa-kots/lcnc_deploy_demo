import { EditUserModalComponent } from './edit-user-modal.component';
import {
  createSmokeFixture,
  smokeTestData
} from '../../../../testing/component-smoke-test.helpers';
import { FormControl } from '@angular/forms';

describe('EditUserModalComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(EditUserModalComponent, {
      inputs: {
        user: smokeTestData.user,
        accountStatusControl: new FormControl(true)
      }
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
