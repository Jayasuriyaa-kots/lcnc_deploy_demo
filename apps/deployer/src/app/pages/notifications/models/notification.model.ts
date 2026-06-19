export type NotificationTone = 'info' | 'warning' | 'success' | 'danger';
export type NotificationCategory = 'invoice' | 'downtime' | 'quota' | 'user';

export interface NotificationModel {
  id: string;
  title: string;
  detail: string;
  time: string;
  unread: boolean;
  tone: NotificationTone;
  category: NotificationCategory;
}
