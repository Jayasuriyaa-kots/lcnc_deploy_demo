import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AddApplicationModalComponent } from './add-application-modal.component';
import { createSmokeFixture } from '../../../../testing/component-smoke-test.helpers';

describe('AddApplicationModalComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(AddApplicationModalComponent, {
      inputs: {
        applicationTypes: ['Internal Tool', 'Operations Control', 'Customer Portal'],
        primaryOwners: ['Priya Sharma', 'Arjun Mehta', 'Rina Kapoor'],
        applicationTypeOpen: false,
        primaryOwnerOpen: false,
        selectedApplicationType: 'Internal Tool',
        selectedPrimaryOwner: 'Priya Sharma',
        form: new FormGroup({
          name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
          description: new FormControl('', { nonNullable: true }),
          superAdminEmails: new FormControl('', { nonNullable: true }),
          adminEmails: new FormControl('', { nonNullable: true })
        })
      }
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
