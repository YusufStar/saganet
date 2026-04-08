import type { NotificationListQuery } from '@/lib/api/types';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (query?: NotificationListQuery) => [...notificationKeys.all, 'list', query ?? {}] as const,
  detail: (id: string) => [...notificationKeys.all, id] as const,
};
