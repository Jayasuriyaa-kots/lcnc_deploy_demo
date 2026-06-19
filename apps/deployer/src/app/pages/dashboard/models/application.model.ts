export type DashboardKpiTone = 'positive' | 'neutral' | 'warning';
export type ApplicationStatus = 'live' | 'inactive' | 'warning';

export interface DashboardKpiModel {
  label: string;
  value: string;
  delta: string;
  tone: DashboardKpiTone;
}

export interface CreateApplicationPayload {
  name: string;
  type: string;
  primaryOwner: string;
  description: string;
  superAdminEmails: string[];
  adminEmails: string[];
}

export interface ApplicationModel {
  id: string;
  organisationId: string;
  name: string;
  type: string;
  primaryOwner: string;
  description: string;
  superAdminEmails: string[];
  adminEmails: string[];
  iconLabel: string;
  environment: string;
  status: ApplicationStatus;
  latency: string;
  lastActivity: string;
  users: string;
  dataUsage: string;
  version: string;
  healthy: boolean;
  createdAt: string;
}
