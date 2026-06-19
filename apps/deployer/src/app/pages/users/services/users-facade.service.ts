import { computed, inject, Injectable, signal } from '@angular/core';
import { QoToastService } from '@qo/ui-components';
import { OrganisationsFacadeService } from '../../../core/layout/services/organisations-facade.service';
import { DeployerI18nService } from '../../../services/deployer-i18n.service';
import { CreateUserPayload, UserMetaModel, UserModel } from '../models';
import { UsersStorageService } from './users-storage.service';

@Injectable({ providedIn: 'root' })
export class UsersFacadeService {
  private readonly usersStorageService = inject(UsersStorageService);
  private readonly organisationsFacade = inject(OrganisationsFacadeService);
  private readonly toast = inject(QoToastService);
  private readonly i18n = inject(DeployerI18nService);
  private readonly initialState = this.usersStorageService.loadState();

  readonly users = signal(this.initialState.users);
  readonly search = signal('');
  readonly activeFilter = signal(this.i18n.translate('users.all'));
  readonly addUserOpen = signal(false);
  readonly editingUserId = signal<string | null>(null);
  readonly resettingUserId = signal<string | null>(null);
  readonly userMeta = signal<Record<string, UserMetaModel>>(this.initialState.userMeta);
  readonly selectedOrganisation = this.organisationsFacade.selectedOrganisation;
  readonly selectedOrganisationUsers = computed(() => {
    const selectedOrganisationId = this.organisationsFacade.selectedOrganisationId();

    if (!selectedOrganisationId) {
      return [];
    }

    return this.users().filter((user) => user.organisationId === selectedOrganisationId);
  });
  readonly filteredUsers = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.selectedOrganisationUsers().filter((user) => {
      const matchesFilter =
        this.activeFilter() === this.i18n.translate('users.all') ||
        (this.activeFilter() === this.i18n.translate('users.active') && user.status === 'active') ||
        (this.activeFilter() === this.i18n.translate('users.inactive') && user.status === 'inactive');
      const matchesQuery =
        !query ||
        [user.name, user.email, user.phone].some((value) => value.toLowerCase().includes(query));
      return matchesFilter && matchesQuery;
    });
  });

  userById(id: string | null) {
    return this.users().find((user) => user.id === id) ?? null;
  }

  openEditUser(id: string): void {
    this.editingUserId.set(id);
  }

  addUser(payload: CreateUserPayload): void {
    const selectedOrganisationId = this.organisationsFacade.selectedOrganisationId();

    if (!selectedOrganisationId) {
      return;
    }

    const newUser = this.usersStorageService.createUser(payload, selectedOrganisationId);
    const newUserMeta = this.usersStorageService.createUserMeta(payload);

    this.users.update((users) => [newUser, ...users]);
    this.userMeta.update((currentMeta) => ({
      ...currentMeta,
      [newUser.id]: newUserMeta
    }));
    this.persistState();
    this.addUserOpen.set(false);
  }

  updateUser(userId: string, updatedData: Partial<UserModel> & { department?: string }): void {
    const existingUser = this.userById(userId);

    if (!existingUser) {
      return;
    }

    this.users.update((users) =>
      users.map((user) =>
        user.id === userId
          ? {
              ...user,
              ...updatedData,
              name: updatedData.name?.trim() || user.name,
              email: updatedData.email?.trim().toLowerCase() || user.email,
              phone: updatedData.phone?.trim() || this.i18n.translate('users.notProvided')
            }
          : user
      )
    );

    if (updatedData.department) {
      this.userMeta.update((currentMeta) => ({
        ...currentMeta,
        [userId]: {
          ...(currentMeta[userId] ?? { department: this.i18n.translate('users.teamMember'), lastLoginDetail: '' }),
          department: updatedData.department?.trim() || this.i18n.translate('users.teamMember')
        }
      }));
    }

    this.persistState();
    this.editingUserId.set(null);
  }

  toggleUserStatus(id: string): void {
    this.users.update((users) =>
      users.map((user) =>
        user.id === id
          ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
          : user
      )
    );
    this.persistState();
  }

  sendPasswordReset(userId: string): void {
    const user = this.userById(userId);

    if (!user) {
      return;
    }

    this.toast.success(this.i18n.translate('users.passwordReset', { email: user.email }));
  }

  private persistState(): void {
    this.usersStorageService.saveState({
      users: this.users(),
      userMeta: this.userMeta()
    });
  }
}
