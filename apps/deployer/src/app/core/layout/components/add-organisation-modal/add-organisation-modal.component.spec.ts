import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AddOrganisationModalComponent } from './add-organisation-modal.component';
import { createSmokeFixture } from '../../../../testing/component-smoke-test.helpers';
import { AddOrganisationFormGroup } from '../../models/organisation.model';

describe('AddOrganisationModalComponent', () => {
  it('should create', async () => {
    const form: AddOrganisationFormGroup = new FormGroup({
      organisationName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      entityType: new FormControl('Enterprise', { nonNullable: true, validators: [Validators.required] }),
      primaryOwnerEmail: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email]
      }),
      billingEmail: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email]
      }),
      additionalAdminUsers: new FormControl('', { nonNullable: true })
    });

    const fixture = await createSmokeFixture(AddOrganisationModalComponent, {
      inputs: {
        form,
        entityTypes: ['Enterprise', 'Startup']
      }
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
