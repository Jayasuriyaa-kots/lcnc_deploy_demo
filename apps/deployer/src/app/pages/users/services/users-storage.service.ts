import { inject, Injectable } from '@angular/core';
import { USER_RECORDS } from '../../../mock-data/users.mock';
import { DeployerI18nService } from '../../../services/deployer-i18n.service';
import { CreateUserPayload, UserMetaModel, UserModel } from '../models';

export interface StoredUsersState {
  users: UserModel[];
  userMeta: Record<string, UserMetaModel>;
}

@Injectable({ providedIn: 'root' })
export class UsersStorageService {
  private readonly i18n = inject(DeployerI18nService);
  private readonly storageKey = 'qo.deployer.users.v1';
  private readonly defaultUserMeta: Record<string, UserMetaModel> = {
    'u-1': { department: this.i18n.translate('users.departmentHrAdmin'), lastLoginDetail: '28 Mar 2026' },
    'u-2': { department: this.i18n.translate('users.departmentEngineering'), lastLoginDetail: '' },
    'u-3': { department: this.i18n.translate('users.departmentOperations'), lastLoginDetail: '' },
    'u-4': { department: this.i18n.translate('users.departmentFinance'), lastLoginDetail: '' },
    'u-5': { department: this.i18n.translate('users.departmentItSupport'), lastLoginDetail: '28 Mar 2026' }
  };

  loadState(): StoredUsersState {
    const fallbackState = {
      users: USER_RECORDS,
      userMeta: this.defaultUserMeta
    };

    if (!this.isStorageAvailable()) {
      return fallbackState;
    }

    const storedValue = window.localStorage.getItem(this.storageKey);

    if (!storedValue) {
      this.saveState(fallbackState);
      return fallbackState;
    }

    try {
      const parsedValue = JSON.parse(storedValue) as Partial<StoredUsersState>;

      if (!Array.isArray(parsedValue.users) || !parsedValue.userMeta) {
        this.saveState(fallbackState);
        return fallbackState;
      }

      return {
        users: parsedValue.users,
        userMeta: parsedValue.userMeta
      };
    } catch {
      this.saveState(fallbackState);
      return fallbackState;
    }
  }

  saveState(state: StoredUsersState): void {
    if (!this.isStorageAvailable()) {
      return;
    }

    window.localStorage.setItem(this.storageKey, JSON.stringify(state));
  }

  createUser(payload: CreateUserPayload, organisationId: string): UserModel {
    const firstName = payload.firstName.trim();
    const lastName = payload.lastName.trim();

    return {
      id: `u-${Date.now()}`,
      organisationId,
      name: `${firstName} ${lastName}`.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone.trim() || this.i18n.translate('users.notProvided'),
      status: payload.status ?? 'active',
      lastLogin: this.i18n.translate('users.justAdded'),
      sessionHours: '0 h',
      profilePhotoDataUrl: payload.profilePhotoDataUrl,
      createdAt: new Date().toISOString()
    };
  }

  createUserMeta(payload: CreateUserPayload): UserMetaModel {
    return {
      department: payload.department.trim() || this.i18n.translate('users.teamMember'),
      lastLoginDetail: ''
    };
  }

  private isStorageAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }
}
