// src/services/notificationService.ts

const BASE_URL = '/api/notifications';

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(body.error ?? body.message ?? `Request failed (${res.status})`);
  return body as T;
}

export const notificationService = {
  getNotifications: () =>
    fetch(BASE_URL, {
      credentials: 'include',
    }).then((res) => handleResponse<{ unread_count: number; notifications: any[] }>(res)),

  // Future notification methods (read-all, delete, etc.) will go here
};
