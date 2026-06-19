import { NotificationModel } from '../pages/notifications/models';
import type { DeployerI18nService } from '../services/deployer-i18n.service';

type DeployerTranslator = Pick<DeployerI18nService, 'translate'>;

export const createNotifications = (i18n: DeployerTranslator): NotificationModel[] => [
  {
    id: 'n-1',
    title: i18n.translate('mockData.notificationOverdueInvoiceTitle'),
    detail: i18n.translate('mockData.notificationOverdueInvoiceDetail'),
    time: '6 min ago',
    unread: true,
    tone: 'warning',
    category: 'invoice'
  },
  {
    id: 'n-2',
    title: i18n.translate('mockData.notificationDowntimeTitle'),
    detail: i18n.translate('mockData.notificationDowntimeDetail'),
    time: '18 min ago',
    unread: true,
    tone: 'danger',
    category: 'downtime'
  },
  {
    id: 'n-3',
    title: i18n.translate('mockData.notificationQuotaTitle'),
    detail: i18n.translate('mockData.notificationQuotaDetail'),
    time: 'Today, 09:52',
    unread: true,
    tone: 'warning',
    category: 'quota'
  },
  {
    id: 'n-4',
    title: i18n.translate('mockData.notificationNewUserTitle'),
    detail: i18n.translate('mockData.notificationNewUserDetail'),
    time: 'Today, 08:27',
    unread: false,
    tone: 'info',
    category: 'user'
  }
];
