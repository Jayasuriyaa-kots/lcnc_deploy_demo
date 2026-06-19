import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { QoButtonComponent, QoIconComponent } from '@qo/ui-components';
import { CreateUserPayload, UserModel } from '../../models';
import { AddUserModalComponent } from '../../components/add-user-modal/add-user-modal.component';
import { UserFilterBarComponent } from '../../components/user-filter-bar/user-filter-bar.component';
import { UserTableComponent } from '../../components/user-table/user-table.component';
import { UsersFacadeService } from '../../services/users-facade.service';
import { DeployerI18nService } from '../../../../services/deployer-i18n.service';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [
    AddUserModalComponent,
    ReactiveFormsModule,
    QoButtonComponent,
    QoIconComponent,
    UserFilterBarComponent,
    UserTableComponent
  ],
  templateUrl: './users-page.component.html',
  styleUrl: './users-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly facade = inject(UsersFacadeService);
  readonly i18n = inject(DeployerI18nService);

  readonly users = this.facade.users;
  readonly search = this.facade.search;
  readonly activeFilter = this.facade.activeFilter;
  readonly addUserOpen = this.facade.addUserOpen;
  readonly editingUserId = this.facade.editingUserId;
  readonly userMeta = this.facade.userMeta;
  readonly selectedOrganisation = this.facade.selectedOrganisation;
  readonly selectedOrganisationUsers = this.facade.selectedOrganisationUsers;
  readonly filteredUsers = this.facade.filteredUsers;
  readonly editingUser = computed(() => this.facade.userById(this.editingUserId()));
  readonly userModalOpen = computed(() => this.addUserOpen() || !!this.editingUser());
  readonly selectedPhotoName = signal('');
  readonly userForm = this.formBuilder.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(1)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    department: [this.i18n.translate('users.teamMember'), [Validators.required]],
    profilePhotoDataUrl: ['']
  });
  readonly editingDepartment = computed(() => {
    const editingUser = this.editingUser();

    if (!editingUser) {
      return this.i18n.translate('users.teamMember');
    }

    return this.userMeta()[editingUser.id]?.department ?? this.i18n.translate('users.teamMember');
  });

  userById(id: string | null) {
    return this.facade.userById(id);
  }

  openAddUserModal(): void {
    this.userForm.reset(
      {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: this.i18n.translate('users.teamMember'),
        profilePhotoDataUrl: ''
      },
      { emitEvent: false }
    );
    this.selectedPhotoName.set('');
    this.editingUserId.set(null);
    this.addUserOpen.set(true);
  }

  addUser(payload: CreateUserPayload): void {
    this.facade.addUser(payload);
    this.resetUserFormState();
  }

  saveUserChanges(payload: CreateUserPayload): void {
    const editingUser = this.editingUser();

    if (!editingUser) {
      return;
    }

    this.facade.updateUser(editingUser.id, {
      name: `${payload.firstName} ${payload.lastName}`.trim(),
      email: payload.email,
      phone: payload.phone,
      profilePhotoDataUrl: payload.profilePhotoDataUrl,
      status: payload.status ?? editingUser.status,
        department: payload.department
      });
    this.resetUserFormState();
  }

  openEditUser(id: string): void {
    const user = this.userById(id);

    if (!user) {
      return;
    }

    const [firstName, ...lastNameParts] = user.name.split(' ');

    this.userForm.reset(
      {
        firstName: firstName ?? '',
        lastName: lastNameParts.join(' ') || '',
        email: user.email,
        phone: user.phone === this.i18n.translate('users.notProvided') ? '' : user.phone,
        department: this.userMeta()[user.id]?.department ?? this.i18n.translate('users.teamMember'),
        profilePhotoDataUrl: user.profilePhotoDataUrl ?? ''
      },
      { emitEvent: false }
    );
    this.selectedPhotoName.set(user.profilePhotoDataUrl ? this.i18n.translate('users.currentPhotoSelected') : '');
    this.facade.openEditUser(id);
  }

  closeUserModal(): void {
    this.resetUserFormState();
  }

  async handleUserPhotoSelected(file: File): Promise<void> {
    const dataUrl = await this.readFileAsDataUrl(file);

    this.userForm.controls.profilePhotoDataUrl.setValue(dataUrl);
    this.selectedPhotoName.set(file.name);
  }

  sendPasswordReset(userId: string): void {
    this.facade.sendPasswordReset(userId);
  }

  metaFor(user: UserModel): { department: string; lastLoginDetail: string } {
    return this.userMeta()[user.id] ?? { department: this.i18n.translate('users.teamMember'), lastLoginDetail: '' };
  }

  toggleUserStatus(id: string): void {
    this.facade.toggleUserStatus(id);
  }

  private resetUserFormState(): void {
    this.userForm.reset(
      {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: this.i18n.translate('users.teamMember'),
        profilePhotoDataUrl: ''
      },
      { emitEvent: false }
    );
    this.selectedPhotoName.set('');
    this.addUserOpen.set(false);
    this.editingUserId.set(null);
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
}
