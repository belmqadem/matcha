// src/services/dateService.ts
import type { DatesResponse, DateEntry } from '@/types/date';

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(body.error ?? body.message ?? `Request failed (${res.status})`);
  return body as T;
}

export const dateService = {
  getDates: () =>
    fetch('/api/dates', { credentials: 'include' }).then((res) =>
      handleResponse<DatesResponse>(res),
    ),

  proposeDate: (data: { receiver_id: string; scheduled_at: string; location?: string }) =>
    fetch('/api/dates', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((res) => handleResponse<{ date: DateEntry }>(res)),

  respondToDate: (id: number, status: 'accepted' | 'declined') =>
    fetch(`/api/dates/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then((res) => handleResponse<{ date: DateEntry }>(res)),

  cancelDate: (id: number) =>
    fetch(`/api/dates/${id}`, { method: 'DELETE', credentials: 'include' }).then((res) =>
      handleResponse<{ date: DateEntry }>(res),
    ),
};
