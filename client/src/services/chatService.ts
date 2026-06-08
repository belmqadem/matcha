// src/services/chatService.ts
import type { Conversation, BlockedUser, Message, DateProposal } from '@/types/chat';

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(body.error ?? body.message ?? `Request failed (${res.status})`);
  return body as T;
}

export const chatService = {
  getUser: (id: string) =>
    fetch(`/api/users/${id}`, { credentials: 'include' }).then(res => handleResponse<any>(res)),

  conversations: () =>
    fetch('/api/chat/conversations', { credentials: 'include' }).then(res => handleResponse<{ conversations: Conversation[] }>(res)),

  messages: (userId: string, page = 1) =>
    fetch(`/api/chat/${userId}?page=${page}&limit=30`, { credentials: 'include' }).then(res => handleResponse<{ messages: any[], total: number }>(res)),

  markRead: (userId: string) =>
    fetch(`/api/chat/${userId}/read`, { method: 'POST', credentials: 'include' }).then(res => handleResponse<{ message: string }>(res)),

  blocked: () =>
    fetch('/api/profile/me/blocked', { credentials: 'include' }).then(res => handleResponse<{ blocked: BlockedUser[] }>(res)),

  block: (id: string) =>
    fetch(`/api/blocks/${id}`, { method: 'POST', credentials: 'include' }).then(res => handleResponse<{ blocked: boolean }>(res)),

  unblock: (id: string) =>
    fetch(`/api/blocks/${id}`, { method: 'DELETE', credentials: 'include' }).then(res => handleResponse<{ blocked: boolean }>(res)),

  unmatch: (id: string) =>
    fetch(`/api/likes/${id}`, { method: 'DELETE', credentials: 'include' }).then(res => handleResponse<{ liked: false, connected: false }>(res)),

  proposeDate: (data: DateProposal) =>
    fetch('/api/dates', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => handleResponse<any>(res)),
};
