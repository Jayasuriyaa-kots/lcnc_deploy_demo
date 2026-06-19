import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BuilderContextFacadeService } from '@qo/api-client';
import {
  QoAvatarBadgeComponent,
  QoButtonComponent,
  QoCheckboxComponent,
  QoConfirmDialogComponent,
  QoConfirmDialogConfig
} from '@qo/ui-components';
import { AssignUserModalComponent } from '../components/assign-user-modal.component';
import { NewRoleModalComponent } from '../components/new-role-modal.component';
import { BuilderRoleUserViewModel } from '../models/builder-user-management.models';
import { BuilderUserManagementFacadeService } from '../facades/builder-user-management.facade';

@Component({
  selector: 'app-deployment-user-management-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    QoButtonComponent,
    QoCheckboxComponent,
    QoAvatarBadgeComponent,
    QoConfirmDialogComponent,
    AssignUserModalComponent,
    NewRoleModalComponent
  ],
  templateUrl: './deployment-user-management-page.component.html',
  styleUrl: './deployment-user-management-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeploymentUserManagementPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly builderContextFacade = inject(BuilderContextFacadeService);
  readonly facade = inject(BuilderUserManagementFacadeService);

  assignUsersForm = new FormGroup<Record<string, FormControl<boolean>>>({});
  readonly newRoleForm = this.formBuilder.nonNullable.group({
    roleName: ['', [Validators.required, Validators.minLength(2)]]
  });
  readonly confirmConfig = signal<QoConfirmDialogConfig | null>(null);
  private readonly pendingRemovalUser = signal<BuilderRoleUserViewModel | null>(null);

  readonly builderContext = this.builderContextFacade.context;
  readonly roles = this.facade.rolesForCurrentApplication;
  readonly selectedRole = this.facade.selectedRole;
  readonly usersForSelectedRole = this.facade.usersForSelectedRole;
  readonly availableUsersForSelectedRole = this.facade.availableUsersForSelectedRole;
  readonly permissionSections = this.facade.permissionSections;
  readonly assignUserModalOpen = this.facade.assignUserModalOpen;
  readonly newRoleModalOpen = this.facade.newRoleModalOpen;

  constructor() {
    effect(() => {
      const applicationId = this.builderContextFacade.applicationId();
      const organisationId = this.builderContextFacade.organisationId();

      if (!applicationId || !organisationId) {
        return;
      }

      this.facade.load(applicationId, organisationId);
    });
  }

  selectRole(roleId: string): void {
    this.facade.selectRole(roleId);
  }

  roleCount(roleId: string): number {
    return this.facade.roleCount(roleId);
  }

  openAssignUserModal(): void {
    this.facade.openAssignUserModal();

    if (this.assignUserModalOpen()) {
      this.assignUsersForm = this.buildAssignUsersForm();
    }
  }

  closeAssignUserModal(): void {
    this.assignUsersForm = this.buildAssignUsersForm([]);
    this.facade.closeAssignUserModal();
  }

  assignUsers(userIds: string[]): void {
    this.facade.assignUsersToSelectedRole(userIds);
    this.assignUsersForm = this.buildAssignUsersForm([]);
  }

  openNewRoleModal(): void {
    this.newRoleForm.reset({ roleName: '' });
    this.facade.openNewRoleModal();
  }

  closeNewRoleModal(): void {
    this.newRoleForm.reset({ roleName: '' });
    this.facade.closeNewRoleModal();
  }

  createRole(roleName: string): void {
    this.facade.createRole(roleName);
    this.newRoleForm.reset({ roleName: '' });
  }

  promptRemoveUser(user: BuilderRoleUserViewModel): void {
    this.pendingRemovalUser.set(user);
    this.confirmConfig.set({
      title: 'Remove user from role',
      message: `Remove ${user.name} from the ${this.selectedRole()?.name ?? 'selected'} role?`,
      confirmLabel: 'Remove',
      cancelLabel: 'Cancel',
      danger: true
    });
  }

  confirmRemoveUser(): void {
    const pendingUser = this.pendingRemovalUser();

    if (pendingUser) {
      this.facade.removeUserFromSelectedRole(pendingUser.id);
    }

    this.cancelRemoveUser();
  }

  cancelRemoveUser(): void {
    this.pendingRemovalUser.set(null);
    this.confirmConfig.set(null);
  }

  togglePermission(permissionId: string, action: 'view' | 'create' | 'edit' | 'delete'): void {
    this.facade.togglePermission(permissionId, action);
  }

  fieldPermissionNote(permissionId: string): string {
    const permission = this.permissionSections()
      .flatMap((section) => section.permissions)
      .find((item) => item.id === permissionId);

    return permission ? this.facade.fieldPermissionNote(permission) : '';
  }

  private buildAssignUsersForm(
    users: BuilderRoleUserViewModel[] = this.availableUsersForSelectedRole()
  ): FormGroup<Record<string, FormControl<boolean>>> {
    const controls: Record<string, FormControl<boolean>> = {};

    for (const user of users) {
      controls[user.id] = new FormControl(false, { nonNullable: true });
    }

    return new FormGroup<Record<string, FormControl<boolean>>>(controls);
  }
}
