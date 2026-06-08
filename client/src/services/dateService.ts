// src/services/dateService.ts

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(body.error ?? body.message ?? `Request failed (${res.status})`);
  return body as T;
}

export const dateService = {
  getDates: () =>
    fetch('/api/dates', { credentials: 'include' }).then((res) => handleResponse<any>(res)),

  proposeDate: (data: { receiver_id: string; scheduled_at: string; location?: string }) =>
    fetch('/api/dates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    }).then((res) => {
      if (res.status === 409) throw new Error("You already have a pending date with this person.");
      if (res.status === 403) throw new Error("You can only propose to connected users.");
      return handleResponse<any>(res);
    }),

  updateDateStatus: (id: number, status: 'accepted' | 'declined') =>
    fetch(`/api/dates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    }).then((res) => handleResponse<any>(res)),

  cancelDate: (id: number) =>
    fetch(`/api/dates/${id}`, { method: 'DELETE', credentials: 'include' }).then((res) => handleResponse<any>(res)),
};
