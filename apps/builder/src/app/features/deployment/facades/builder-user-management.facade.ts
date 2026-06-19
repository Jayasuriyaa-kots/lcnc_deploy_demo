import { computed, inject, Injectable, signal } from '@angular/core';
import { QoToastService } from '@qo/ui-components';
import {
  BuilderOrganisationUser,
  BuilderPermission,
  BuilderPermissionSection,
  BuilderPermissionSeedResource,
  BuilderRole,
  BuilderRoleUser,
  BuilderRoleUserViewModel
} from '../models/builder-user-management.models';
import { BuilderUserManagementStorageService } from '../services/builder-user-management-storage.service';

const DEFAULT_ROLE_NAMES = ['Viewer', 'Employee', 'Manager', 'Admin'] as const;

const PERMISSION_SEED_RESOURCES: BuilderPermissionSeedResource[] = [
  { resourceType: 'form', resourceId: 'form-add-employee', resourceName: 'Add Employee Form' },
  { resourceType: 'form', resourceId: 'form-leave-request', resourceName: 'Leave Request Form' },
  { resourceType: 'form', resourceId: 'form-attendance-entry', resourceName: 'Attendance Entry' },
  { resourceType: 'form', resourceId: 'form-performance-review', resourceName: 'Performance Review' },
  { resourceType: 'form', resourceId: 'form-exit-survey', resourceName: 'Exit Survey' },
  { resourceType: 'report', resourceId: 'report-employee-directory', resourceName: 'Employee Directory' },
  { resourceType: 'report', resourceId: 'report-attendance-summary', resourceName: 'Attendance Summary' },
  { resourceType: 'report', resourceId: 'report-leave-dashboard', resourceName: 'Leave Dashboard' },
  { resourceType: 'report', resourceId: 'report-performance-matrix', resourceName: 'Performance Matrix' },
  { resourceType: 'report', resourceId: 'report-payroll', resourceName: 'Payroll Report' },
  { resourceType: 'page', resourceId: 'page-hr-dashboard', resourceName: 'HR Dashboard' },
  { resourceType: 'page', resourceId: 'page-employee-portal', resourceName: 'Employee Portal' },
  { resourceType: 'page', resourceId: 'page-manager-view', resourceName: 'Manager View' },
  { resourceType: 'page', resourceId: 'page-analytics-board', resourceName: 'Analytics Board' },
  { resourceType: 'field', resourceId: 'field-annual-salary', resourceName: 'Annual Salary', note: 'Hidden from Viewer' },
  { resourceType: 'field', resourceId: 'field-national-id-pan', resourceName: 'National ID / PAN', note: 'Masked for Viewer' },
  { resourceType: 'field', resourceId: 'field-performance-score', resourceName: 'Performance Score', note: 'View only — no edit' }
];

@Injectable({ providedIn: 'root' })
export class BuilderUserManagementFacadeService {
  private readonly storage = inject(BuilderUserManagementStorageService);
  private readonly toast = inject(QoToastService);

  private readonly currentApplicationId = signal<string | null>(null);
  private readonly currentOrganisationId = signal<string | null>(null);
  private readonly organisationUsers = signal<BuilderOrganisationUser[]>([]);

  readonly roles = signal<BuilderRole[]>([]);
  readonly roleUsers = signal<BuilderRoleUser[]>([]);
  readonly permissions = signal<BuilderPermission[]>([]);
  readonly selectedRoleId = signal<string | null>(null);
  readonly assignUserModalOpen = signal(false);
  readonly newRoleModalOpen = signal(false);

  readonly selectedRole = computed(() =>
    this.rolesForCurrentApplication().find((role) => role.id === this.selectedRoleId()) ?? null
  );

  readonly rolesForCurrentApplication = computed(() => {
    const applicationId = this.currentApplicationId();

    if (!applicationId) {
      return [];
    }

    return this.roles()
      .filter((role) => role.applicationId === applicationId)
      .sort((left, right) => {
        const leftIndex = DEFAULT_ROLE_NAMES.indexOf(left.name as (typeof DEFAULT_ROLE_NAMES)[number]);
        const rightIndex = DEFAULT_ROLE_NAMES.indexOf(right.name as (typeof DEFAULT_ROLE_NAMES)[number]);

        if (leftIndex !== -1 || rightIndex !== -1) {
          return (leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex) -
            (rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex);
        }

        return left.createdAt.localeCompare(right.createdAt);
      });
  });

  readonly usersForSelectedRole = computed<BuilderRoleUserViewModel[]>(() => {
    const selectedRoleId = this.selectedRoleId();

    if (!selectedRoleId) {
      return [];
    }

    const assignedUserIds = new Set(
      this.roleUsers()
        .filter((roleUser) => roleUser.roleId === selectedRoleId && roleUser.applicationId === this.currentApplicationId())
        .map((roleUser) => roleUser.userId)
    );

    return this.organisationUsers()
      .filter((user) => assignedUserIds.has(user.id))
      .map((user) => ({
        ...user,
        initials: this.initialsForName(user.name)
      }));
  });

  readonly availableUsersForSelectedRole = computed<BuilderRoleUserViewModel[]>(() => {
    const assignedUserIds = new Set(this.usersForSelectedRole().map((user) => user.id));

    return this.organisationUsers()
      .filter((user) => !assignedUserIds.has(user.id))
      .map((user) => ({
        ...user,
        initials: this.initialsForName(user.name)
      }));
  });

  readonly permissionsForSelectedRole = computed(() => {
    const selectedRoleId = this.selectedRoleId();

    if (!selectedRoleId) {
      return [];
    }

    return this.permissions().filter(
      (permission) =>
        permission.roleId === selectedRoleId && permission.applicationId === this.currentApplicationId()
    );
  });

  readonly permissionSections = computed<BuilderPermissionSection[]>(() => {
    const permissions = this.permissionsForSelectedRole();

    return [
      { title: 'Forms', resourceType: 'form', permissions: permissions.filter((permission) => permission.resourceType === 'form') },
      { title: 'Reports', resourceType: 'report', permissions: permissions.filter((permission) => permission.resourceType === 'report') },
      { title: 'Pages', resourceType: 'page', permissions: permissions.filter((permission) => permission.resourceType === 'page') },
      { title: 'Field-level permissions', resourceType: 'field', permissions: permissions.filter((permission) => permission.resourceType === 'field') }
    ];
  });

  readonly roleCounts = computed(() =>
    this.rolesForCurrentApplication().map((role) => ({
      roleId: role.id,
      count: this.roleUsers().filter(
        (roleUser) =>
          roleUser.applicationId === role.applicationId &&
          roleUser.roleId === role.id
      ).length
    }))
  );

  load(applicationId: string, organisationId: string): void {
    this.currentApplicationId.set(applicationId);
    this.currentOrganisationId.set(organisationId);
    this.organisationUsers.set(
      this.storage.getOrganisationUsers().filter((user) => user.organisationId === organisationId)
    );

    let roles = this.storage.getRoles();
    const currentApplicationRoles = roles.filter((role) => role.applicationId === applicationId);

    if (currentApplicationRoles.length === 0) {
      const seededRoles = DEFAULT_ROLE_NAMES.map((roleName) =>
        this.createRoleRecord(applicationId, roleName, true)
      );
      roles = [...roles, ...seededRoles];
      this.storage.saveRoles(roles);
    }

    this.roles.set(roles);
    this.roleUsers.set(this.storage.getRoleUsers());

    let permissions = this.storage.getPermissions();

    for (const role of this.rolesForCurrentApplication()) {
      const existingRolePermissions = permissions.filter(
        (permission) => permission.applicationId === applicationId && permission.roleId === role.id
      );

      if (existingRolePermissions.length === 0) {
        const seededPermissions = PERMISSION_SEED_RESOURCES.map((resource) =>
          this.createPermissionRecord(applicationId, role, resource)
        );
        permissions = [...permissions, ...seededPermissions];
      }
    }

    this.permissions.set(permissions);
    this.storage.savePermissions(permissions);

    const nextSelectedRoleId = this.rolesForCurrentApplication().find(
      (role) => role.id === this.selectedRoleId()
    )?.id ?? this.rolesForCurrentApplication()[0]?.id ?? null;

    this.selectedRoleId.set(nextSelectedRoleId);
  }

  selectRole(roleId: string): void {
    this.selectedRoleId.set(roleId);
  }

  openAssignUserModal(): void {
    if (!this.selectedRole()) {
      this.toast.warning('Please select a role first.');
      return;
    }

    this.assignUserModalOpen.set(true);
  }

  closeAssignUserModal(): void {
    this.assignUserModalOpen.set(false);
  }

  openNewRoleModal(): void {
    this.newRoleModalOpen.set(true);
  }

  closeNewRoleModal(): void {
    this.newRoleModalOpen.set(false);
  }

  createRole(roleName: string): void {
    const applicationId = this.currentApplicationId();
    const trimmedRoleName = roleName.trim();

    if (!applicationId || !trimmedRoleName) {
      return;
    }

    const duplicateRole = this.rolesForCurrentApplication().some(
      (role) => role.name.toLowerCase() === trimmedRoleName.toLowerCase()
    );

    if (duplicateRole) {
      this.toast.error('A role with this name already exists.');
      return;
    }

    const role = this.createRoleRecord(applicationId, trimmedRoleName, false);
    const rolePermissions = PERMISSION_SEED_RESOURCES.map((resource) =>
      this.createPermissionRecord(applicationId, role, resource)
    );

    this.roles.update((currentRoles) => {
      const nextRoles = [...currentRoles, role];
      this.storage.saveRoles(nextRoles);
      return nextRoles;
    });

    this.permissions.update((currentPermissions) => {
      const nextPermissions = [...currentPermissions, ...rolePermissions];
      this.storage.savePermissions(nextPermissions);
      return nextPermissions;
    });

    this.selectedRoleId.set(role.id);
    this.newRoleModalOpen.set(false);
    this.toast.success('Role created successfully.');
  }

  assignUsersToSelectedRole(userIds: string[]): void {
    const applicationId = this.currentApplicationId();
    const selectedRoleId = this.selectedRoleId();

    if (!applicationId || !selectedRoleId || userIds.length === 0) {
      return;
    }

    const existingAssignments = new Set(
      this.roleUsers()
        .filter((roleUser) => roleUser.applicationId === applicationId && roleUser.roleId === selectedRoleId)
        .map((roleUser) => roleUser.userId)
    );

    const nextAssignments = userIds
      .filter((userId) => !existingAssignments.has(userId))
      .map((userId) => this.createRoleUserRecord(applicationId, selectedRoleId, userId));

    if (nextAssignments.length === 0) {
      this.toast.info('All selected users are already assigned to this role.');
      return;
    }

    this.roleUsers.update((currentRoleUsers) => {
      const updatedRoleUsers = [...currentRoleUsers, ...nextAssignments];
      this.storage.saveRoleUsers(updatedRoleUsers);
      return updatedRoleUsers;
    });

    this.assignUserModalOpen.set(false);
    this.toast.success('Users assigned successfully.');
  }

  removeUserFromSelectedRole(userId: string): void {
    const applicationId = this.currentApplicationId();
    const selectedRoleId = this.selectedRoleId();

    if (!applicationId || !selectedRoleId) {
      return;
    }

    this.roleUsers.update((currentRoleUsers) => {
      const updatedRoleUsers = currentRoleUsers.filter(
        (roleUser) =>
          !(
            roleUser.applicationId === applicationId &&
            roleUser.roleId === selectedRoleId &&
            roleUser.userId === userId
          )
      );
      this.storage.saveRoleUsers(updatedRoleUsers);
      return updatedRoleUsers;
    });

    this.toast.success('User removed from role.');
  }

  togglePermission(permissionId: string, action: 'view' | 'create' | 'edit' | 'delete'): void {
    this.permissions.update((currentPermissions) => {
      const updatedPermissions = currentPermissions.map((permission) => {
        if (permission.id !== permissionId) {
          return permission;
        }

        const nextValue = !permission[action];
        const nextPermission: BuilderPermission = {
          ...permission,
          [action]: nextValue
        };

        if (action === 'view' && !nextValue) {
          return {
            ...nextPermission,
            create: false,
            edit: false,
            delete: false
          };
        }

        if (action !== 'view' && nextValue) {
          return {
            ...nextPermission,
            view: true
          };
        }

        return nextPermission;
      });

      this.storage.savePermissions(updatedPermissions);
      return updatedPermissions;
    });
  }

  roleCount(roleId: string): number {
    return this.roleCounts().find((roleCount) => roleCount.roleId === roleId)?.count ?? 0;
  }

  fieldPermissionNote(permission: BuilderPermission): string {
    const seedResource = PERMISSION_SEED_RESOURCES.find(
      (resource) => resource.resourceType === 'field' && resource.resourceId === permission.resourceId
    );

    return seedResource?.note ?? '';
  }

  private createRoleRecord(applicationId: string, name: string, isDefault: boolean): BuilderRole {
    return {
      id: crypto.randomUUID(),
      applicationId,
      name,
      isDefault,
      createdAt: new Date().toISOString()
    };
  }

  private createRoleUserRecord(applicationId: string, roleId: string, userId: string): BuilderRoleUser {
    return {
      id: crypto.randomUUID(),
      applicationId,
      roleId,
      userId,
      createdAt: new Date().toISOString()
    };
  }

  private createPermissionRecord(
    applicationId: string,
    role: BuilderRole,
    resource: BuilderPermissionSeedResource
  ): BuilderPermission {
    const defaults = this.permissionDefaults(role.name, resource);

    return {
      id: crypto.randomUUID(),
      applicationId,
      roleId: role.id,
      resourceType: resource.resourceType,
      resourceId: resource.resourceId,
      resourceName: resource.resourceName,
      ...defaults
    };
  }

  private permissionDefaults(
    roleName: string,
    resource: BuilderPermissionSeedResource
  ): Pick<BuilderPermission, 'view' | 'create' | 'edit' | 'delete'> {
    if (!DEFAULT_ROLE_NAMES.includes(roleName as (typeof DEFAULT_ROLE_NAMES)[number])) {
      return {
        view: false,
        create: false,
        edit: false,
        delete: false
      };
    }

    if (roleName === 'Viewer') {
      if (resource.resourceType === 'field' && resource.resourceId === 'field-annual-salary') {
        return { view: false, create: false, edit: false, delete: false };
      }

      return { view: true, create: false, edit: false, delete: false };
    }

    if (roleName === 'Employee') {
      return { view: true, create: true, edit: false, delete: false };
    }

    if (roleName === 'Manager') {
      return { view: true, create: true, edit: true, delete: false };
    }

    return { view: true, create: true, edit: true, delete: true };
  }

  private initialsForName(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0] ?? '')
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
}
