import { ChangeDetectionStrategy, Component, input, output, inject } from '@angular/core';
import { DeployerI18nService } from '../../../../services/deployer-i18n.service';
import { BadgeColor, QoBadgeComponent, QoButtonComponent } from '@qo/ui-components';
import { NotificationModel } from '../../models';

@Component({
  selector: 'app-notifications-panel',
  standalone: true,
  imports: [QoBadgeComponent, QoButtonComponent],
  
  templateUrl: './notifications-panel.component.html',
  styleUrl: './notifications-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsPanelComponent {
  readonly i18n = inject(DeployerI18nService);
  readonly notifications = input.required<NotificationModel[]>();
  readonly close = output<void>();

  badgeColorFor(notification: NotificationModel): BadgeColor {
    if (notification.tone === 'success') {
      return 'success';
    }

    if (notification.tone === 'danger') {
      return 'danger';
    }

    if (notification.tone === 'warning') {
      return 'warning';
    }

    return 'default';
  }
}
