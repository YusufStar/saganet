import { get, qs } from './client';
import type { Notification, NotificationListQuery, PaginatedResponse } from './types';

const NOTIF = '/api/notifications';

export const notificationsApi = {
  list: (query?: NotificationListQuery) =>
    get<PaginatedResponse<Notification>>(`${NOTIF}${qs(query as Record<string, unknown>)}`),

  get: (id: string) =>
    get<Notification>(`${NOTIF}/${id}`),
};
