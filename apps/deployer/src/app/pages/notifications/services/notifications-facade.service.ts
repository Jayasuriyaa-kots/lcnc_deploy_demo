import { computed, Injectable, inject, signal } from '@angular/core';
import { createNotifications } from '../../../mock-data/notifications.mock';
import { DeployerI18nService } from '../../../services/deployer-i18n.service';

@Injectable({ providedIn: 'root' })
export class NotificationsFacadeService {
  private readonly i18n = inject(DeployerI18nService);

  readonly notifications = signal(createNotifications(this.i18n));
  readonly open = signal(false);
  readonly unreadCount = computed(() =>
    this.notifications().filter((notification) => notification.unread).length
  );

  toggle(): void {
    this.open.update((value) => !value);
  }

  close(): void {
    this.open.set(false);
  }
}
