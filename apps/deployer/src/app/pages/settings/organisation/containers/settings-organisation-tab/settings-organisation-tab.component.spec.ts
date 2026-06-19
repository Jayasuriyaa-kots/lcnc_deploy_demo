import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SettingsOrganisationTabComponent } from './settings-organisation-tab.component';
import {
  createSmokeFixture,
  smokeTestData
} from '../../../../../testing/component-smoke-test.helpers';

describe('SettingsOrganisationTabComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(SettingsOrganisationTabComponent, {
      inputs: {
        organisation: {
          entityName: smokeTestData.organisation.name,
          registeredAddress: 'Operations Tower, Bengaluru',
          primaryOwner: 'Priya Sharma',
          primaryOwnerEmail: smokeTestData.organisation.primaryOwnerEmail,
          primaryOwnerPhone: '+91 98765 43210',
          admins: [],
          organisationStatus: 'Active',
          organisationType: 'Enterprise Customer'
        },
        adminUsers: smokeTestData.adminUsers,
        organisationSummary: smokeTestData.organisationSummary,
        addAdminOpen: false,
        addAdminForm: new FormGroup({
          firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
          lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
          email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
          phone: new FormControl('', { nonNullable: true }),
          department: new FormControl('Team Member', { nonNullable: true, validators: [Validators.required] }),
          profilePhotoDataUrl: new FormControl('', { nonNullable: true })
        }),
        organisationTypeOpen: false,
        organisationStatusOpen: false,
        selectedOrganisationType: 'Enterprise Customer',
        selectedOrganisationStatus: 'Active'
      }
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
