import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  QoAvatarBadgeComponent,
  QoButtonComponent,
  QoCheckboxComponent,
  QoModalComponent
} from '@qo/ui-components';
import { BuilderRoleUserViewModel } from '../models/builder-user-management.models';

@Component({
  selector: 'app-assign-user-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    QoModalComponent,
    QoButtonComponent,
    QoCheckboxComponent,
    QoAvatarBadgeComponent
  ],
  templateUrl: './assign-user-modal.component.html',
  styleUrl: './assign-user-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssignUserModalComponent {
  readonly form = input.required<FormGroup>();
  readonly users = input.required<BuilderRoleUserViewModel[]>();
  readonly roleName = input('selected');
  readonly close = output<void>();
  readonly assignUsers = output<string[]>();

  readonly hasAvailableUsers = computed(() => this.users().length > 0);

  closeModal(): void {
    this.close.emit();
  }

  submit(): void {
    const rawValue = this.form().getRawValue() as Record<string, boolean | null>;
    const selectedUserIds = Object.entries(rawValue)
      .filter(([, isSelected]) => !!isSelected)
      .map(([userId]) => userId);

    if (selectedUserIds.length === 0) {
      this.form().setErrors({ required: true });
      this.form().markAllAsTouched();
      return;
    }

    this.form().setErrors(null);
    this.assignUsers.emit(selectedUserIds);
  }
}
