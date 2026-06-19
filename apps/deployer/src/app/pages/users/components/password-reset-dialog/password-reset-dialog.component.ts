import { ChangeDetectionStrategy, Component, input, output, inject } from '@angular/core';
import { DeployerI18nService } from '../../../../services/deployer-i18n.service';
import { QoButtonComponent, QoModalComponent } from '@qo/ui-components';
import { UserModel } from '../../models';

@Component({
  selector: 'app-password-reset-dialog',
  standalone: true,
  imports: [QoButtonComponent, QoModalComponent],
  templateUrl: './password-reset-dialog.component.html',
  styleUrl: './password-reset-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PasswordResetDialogComponent {
  readonly i18n = inject(DeployerI18nService);
  readonly user = input.required<UserModel>();
  readonly close = output<void>();
  readonly send = output<void>();
}
