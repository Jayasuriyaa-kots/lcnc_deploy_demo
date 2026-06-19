import { Injectable, inject } from '@angular/core';
import { BrowserStorageService } from '@builder/core/services/browser-storage.service';
import {
  BuilderOrganisationUser,
  BuilderPermission,
  BuilderRole,
  BuilderRoleUser
} from '../models/builder-user-management.models';

interface StoredDeployerUsersState {
  users: BuilderOrganisationUser[];
  userMeta: Record<string, unknown>;
}

@Injectable({ providedIn: 'root' })
export class BuilderUserManagementStorageService {
  private readonly browserStorage = inject(BrowserStorageService);
  private readonly rolesKey = 'qo_builder_roles';
  private readonly roleUsersKey = 'qo_builder_role_users';
  private readonly permissionsKey = 'qo_builder_permissions';
  private readonly deployerUsersKeys = ['qo_users', 'qo.deployer.users.v1'] as const;

  getRoles(): BuilderRole[] {
    return this.browserStorage.getJson<BuilderRole[]>(this.rolesKey) ?? [];
  }

  saveRoles(roles: BuilderRole[]): void {
    this.browserStorage.setJson(this.rolesKey, roles);
  }

  getRoleUsers(): BuilderRoleUser[] {
    return this.browserStorage.getJson<BuilderRoleUser[]>(this.roleUsersKey) ?? [];
  }

  saveRoleUsers(roleUsers: BuilderRoleUser[]): void {
    this.browserStorage.setJson(this.roleUsersKey, roleUsers);
  }

  getPermissions(): BuilderPermission[] {
    return this.browserStorage.getJson<BuilderPermission[]>(this.permissionsKey) ?? [];
  }

  savePermissions(permissions: BuilderPermission[]): void {
    this.browserStorage.setJson(this.permissionsKey, permissions);
  }

  getOrganisationUsers(): BuilderOrganisationUser[] {
    for (const key of this.deployerUsersKeys) {
      const storedState = this.browserStorage.getJson<StoredDeployerUsersState | BuilderOrganisationUser[]>(key);

      if (Array.isArray(storedState)) {
        return storedState;
      }

      if (storedState && Array.isArray(storedState.users)) {
        return storedState.users;
      }
    }

    return [];
  }
}
