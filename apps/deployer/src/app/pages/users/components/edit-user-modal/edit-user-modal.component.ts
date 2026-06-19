import { ChangeDetectionStrategy, Component, input, output, inject } from '@angular/core';
import { DeployerI18nService } from '../../../../services/deployer-i18n.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  QoButtonComponent,
  QoFormFieldComponent,
  QoInputComponent,
  QoModalComponent,
  QoToggleComponent
} from '@qo/ui-components';
import { UserModel } from '../../models';

@Component({
  selector: 'app-edit-user-modal',
  standalone: true,
  imports: [ReactiveFormsModule, QoButtonComponent, QoFormFieldComponent, QoInputComponent, QoModalComponent, QoToggleComponent],
  templateUrl: './edit-user-modal.component.html',
  styleUrl: './edit-user-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditUserModalComponent {
  readonly i18n = inject(DeployerI18nService);
  readonly user = input.required<UserModel>();
  readonly accountStatusControl = input.required<FormControl<boolean | null>>();
  readonly close = output<void>();
  readonly save = output<void>();
  readonly resetPassword = output<void>();

  firstName(): string {
    return this.user().name.split(' ')[0] ?? this.user().name;
  }

  lastName(): string {
    return this.user().name.split(' ').slice(1).join(' ') || this.user().name;
  }
}
