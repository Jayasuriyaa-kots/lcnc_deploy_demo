export type { OrganisationSettingsModel } from './organisation-settings.model';
export {
  createOrganisationStatusOptions,
  createOrganisationTypeOptions
} from './organisation-settings.constants';

export interface SettingsAdminUser {
  initials: string;
  name: string;
  email: string;
  role: string;
}

export interface SettingsOrganisationSummaryItem {
  label: string;
  value: string;
  tone?: 'positive';
}
