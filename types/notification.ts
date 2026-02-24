export type NotificationType =
  | 'ORDER_FILLED'
  | 'ALERT_TRIGGERED'
  | 'MARKET_RESOLVED'
  | 'MARKET_CLOSING_SOON'
  | 'PLATFORM_ANNOUNCEMENT';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  referenceId?: string;
  referenceType?: string;
  createdAt: string;
}
