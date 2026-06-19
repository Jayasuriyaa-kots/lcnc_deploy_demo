import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationsPanelComponent } from '../../components/notifications-panel/notifications-panel.component';
import { NotificationsFacadeService } from '../../services/notifications-facade.service';

@Component({
  selector: 'app-notifications-panel-host',
  standalone: true,
  imports: [NotificationsPanelComponent],
  templateUrl: './notifications-panel-host.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsPanelHostComponent {
  private readonly facade = inject(NotificationsFacadeService);

  readonly notifications = this.facade.notifications;

  close(): void {
    this.facade.close();
  }
}
