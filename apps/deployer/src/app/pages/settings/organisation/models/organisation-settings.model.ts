export interface OrganisationSettingsModel {
  entityName: string;
  registeredAddress: string;
  primaryOwner: string;
  primaryOwnerEmail: string;
  primaryOwnerPhone: string;
  admins: string[];
  organisationStatus: string;
  organisationType: string;
}
