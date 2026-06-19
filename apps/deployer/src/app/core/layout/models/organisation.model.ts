import { FormControl, FormGroup } from '@angular/forms';

export interface Organisation {
  id: string;
  name: string;
  entityType: string;
  primaryOwnerEmail: string;
  billingEmail: string;
  additionalAdminUsers?: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface AddOrganisationFormValue {
  organisationName: string;
  entityType: string;
  primaryOwnerEmail: string;
  billingEmail: string;
  additionalAdminUsers: string;
}

export interface AddOrganisationFormControls {
  organisationName: FormControl<string>;
  entityType: FormControl<string>;
  primaryOwnerEmail: FormControl<string>;
  billingEmail: FormControl<string>;
  additionalAdminUsers: FormControl<string>;
}

export type AddOrganisationFormGroup = FormGroup<AddOrganisationFormControls>;
