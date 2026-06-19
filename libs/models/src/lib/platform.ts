export interface Organisation {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'suspended';
  createdAt: string;
  memberCount: number;
  appCount: number;
}

export interface PlatformUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'member';
  status: 'active' | 'invited' | 'disabled';
  lastActiveAt: string;
  organisationId: string;
}

export interface App {
  id: string;
  name: string;
  slug: string;
  description?: string;
  organisationId: string;
  status: 'development' | 'production' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  organisationId: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  date: string;
  pdfUrl?: string;
}

export interface DashboardMetrics {
  totalOrganisations: number;
  activeUsers: number;
  totalApps: number;
  apiRequestsToday: number;
  revenueThisMonth: number;
}

export type OrganisationStatus = 'active' | 'attention' | 'inactive';

export interface OrganisationModel {
  id: string;
  name: string;
  code: string;
  status: OrganisationStatus;
  apps: number;
  users: number;
}
