import { OrganisationDetailsFormComponent } from './organisation-details-form.component';
import {
  createSmokeFixture,
  smokeTestData
} from '../../../../../testing/component-smoke-test.helpers';

describe('OrganisationDetailsFormComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(OrganisationDetailsFormComponent, {
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
        organisationTypes: ['Enterprise Customer', 'IT Services'],
        organisationStatuses: ['Active', 'Inactive'],
        organisationTypeOpen: false,
        organisationStatusOpen: false,
        selectedOrganisationType: 'Enterprise Customer',
        selectedOrganisationStatus: 'Active'
      }
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
