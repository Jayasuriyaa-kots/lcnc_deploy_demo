import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  QoButtonComponent,
  QoFileUploadComponent,
  QoFormFieldComponent,
  QoInputComponent,
  QoModalComponent
} from '@qo/ui-components';
import { CreateUserPayload, UserModel } from '../../models';
import { DeployerI18nService } from '../../../../services/deployer-i18n.service';

@Component({
  selector: 'app-add-user-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    QoButtonComponent,
    QoFileUploadComponent,
    QoFormFieldComponent,
    QoInputComponent,
    QoModalComponent
  ],
  templateUrl: './add-user-modal.component.html',
  styleUrl: './add-user-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddUserModalComponent {
  readonly i18n = inject(DeployerI18nService);
  readonly user = input<UserModel | null>(null);
  readonly organisationName = input(this.i18n.translate('organisations.noOrganisationSelected'));
  readonly department = input(this.i18n.translate('users.teamMember'));
  readonly showDepartmentField = input(true);
  readonly form = input.required<FormGroup>();
  readonly selectedPhotoName = input('');
  readonly noteText = input(
    this.i18n.translate('users.addUserModalNote')
  );
  readonly close = output<void>();
  readonly createUser = output<CreateUserPayload>();
  readonly saveChanges = output<CreateUserPayload>();
  readonly photoSelected = output<File>();
  readonly isEditMode = computed(() => !!this.user());
  readonly title = computed(() => (this.isEditMode() ? this.i18n.translate('users.editUser') : this.i18n.translate('users.addNewUserTitle')));
  readonly subtitle = computed(() =>
    this.isEditMode()
      ? this.i18n.translate('users.updateProfileDetails', { name: this.user()?.name ?? this.i18n.translate('users.selectedUser') })
      : this.i18n.translate('users.registerUserTo', { organisation: this.organisationName() })
  );
  readonly submitLabel = computed(() => (this.isEditMode() ? this.i18n.translate('users.saveChanges') : this.i18n.translate('users.addUser')));

  closeModal(): void {
    this.close.emit();
  }

  submit(): void {
    const form = this.form();

    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    const rawValue = this.form().getRawValue() as {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      department: string;
      profilePhotoDataUrl: string;
    };

    const payload: CreateUserPayload = {
      firstName: rawValue.firstName,
      lastName: rawValue.lastName,
      email: rawValue.email,
      phone: rawValue.phone,
      department: rawValue.department || this.department(),
      profilePhotoDataUrl: rawValue.profilePhotoDataUrl || undefined,
      status: this.user()?.status ?? 'active'
    };

    if (this.isEditMode()) {
      this.saveChanges.emit(payload);
      return;
    }

    this.createUser.emit(payload);
  }

  isSubmitDisabled(): boolean {
    return this.form().invalid;
  }

  onPhotoSelected(files: File[]): void {
    const file = files[0];

    if (!file) {
      return;
    }

    this.photoSelected.emit(file);
  }
}
