import { queryOptions } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api/notifications';
import type { NotificationListQuery } from '@/lib/api/types';
import { notificationKeys } from './query-keys';

export const notificationListQuery = (query?: NotificationListQuery) =>
  queryOptions({
    queryKey: notificationKeys.list(query),
    queryFn: () => notificationsApi.list(query),
  });

export const notificationDetailQuery = (id: string) =>
  queryOptions({
    queryKey: notificationKeys.detail(id),
    queryFn: () => notificationsApi.get(id),
    enabled: !!id,
  });
