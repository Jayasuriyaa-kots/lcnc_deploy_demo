import { PasswordResetDialogComponent } from './password-reset-dialog.component';
import {
  createSmokeFixture,
  smokeTestData
} from '../../../../testing/component-smoke-test.helpers';

describe('PasswordResetDialogComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(PasswordResetDialogComponent, {
      inputs: {
        user: smokeTestData.user
      }
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
