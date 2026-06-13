// src/services/notificationService.ts
import type { NotificationsResponse } from '@/types/notification';

const BASE_URL = '/api/notifications';

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(body.error ?? body.message ?? `Request failed (${res.status})`);
  return body as T;
}

export const notificationService = {
  getNotifications: () =>
    fetch(BASE_URL, { credentials: 'include' }).then((res) =>
      handleResponse<NotificationsResponse>(res),
    ),

  markRead: (id: number) =>
    fetch(`${BASE_URL}/${id}/read`, { method: 'PATCH', credentials: 'include' }).then((res) =>
      handleResponse<{ id: number }>(res),
    ),

  deleteNotification: (id: number) =>
    fetch(`${BASE_URL}/${id}`, { method: 'DELETE', credentials: 'include' }).then((res) =>
      handleResponse<{ deleted: boolean }>(res),
    ),

  markAllRead: () =>
    fetch(`${BASE_URL}/read-all`, { method: 'PATCH', credentials: 'include' }).then((res) =>
      handleResponse<{ updated: number }>(res),
    ),
};
