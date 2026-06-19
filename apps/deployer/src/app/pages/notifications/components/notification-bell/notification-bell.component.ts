import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { QoIconComponent, QoStatusDotComponent } from '@qo/ui-components';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [QoIconComponent, QoStatusDotComponent],
  
  templateUrl: './notification-bell.component.html',
  styleUrl: './notification-bell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationBellComponent {
  readonly unreadCount = input(0);
}
