export interface BuilderRole {
  id: string;
  applicationId: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
}

export interface BuilderRoleUser {
  id: string;
  applicationId: string;
  roleId: string;
  userId: string;
  createdAt: string;
}

export type BuilderPermissionResourceType = 'form' | 'report' | 'page' | 'field';

export interface BuilderPermission {
  id: string;
  applicationId: string;
  roleId: string;
  resourceType: BuilderPermissionResourceType;
  resourceId: string;
  resourceName: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface BuilderOrganisationUser {
  id: string;
  organisationId: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

export interface BuilderRoleUserViewModel extends BuilderOrganisationUser {
  initials: string;
}

export interface BuilderPermissionSeedResource {
  resourceType: BuilderPermissionResourceType;
  resourceId: string;
  resourceName: string;
  note?: string;
}

export interface BuilderPermissionSection {
  title: string;
  resourceType: BuilderPermissionResourceType;
  permissions: BuilderPermission[];
}
