import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AddUserModalComponent } from './add-user-modal.component';
import { createSmokeFixture } from '../../../../testing/component-smoke-test.helpers';

describe('AddUserModalComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(AddUserModalComponent, {
      inputs: {
        form: new FormGroup({
          firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
          lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
          email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
          phone: new FormControl('', { nonNullable: true }),
          department: new FormControl('Team Member', { nonNullable: true, validators: [Validators.required] }),
          profilePhotoDataUrl: new FormControl('', { nonNullable: true })
        })
      }
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
