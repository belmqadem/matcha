// src/services/authService.ts
import type { RegisterPayload, LoginPayload, AuthUser, FullUser } from '@/types/auth';

const BASE_URL = '/api/auth';

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(
      body.error ?? body.message ?? body.detail ?? body.msg ?? `Request failed (${res.status})`,
    );
  }
  return body as T;
}

export const authService = {
  register: async (payload: RegisterPayload) => {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ message: string }>(res);
  },

  login: async (payload: LoginPayload) => {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return handleResponse<{ user: AuthUser }>(res);
  },

  me: async () => {
    const res = await fetch('/api/users/me', {
      credentials: 'include',
    });
    return handleResponse<{ user: FullUser }>(res);
  },

  verifyEmail: async (token: string) => {
    const res = await fetch(`${BASE_URL}/verify/${token}`);
    return handleResponse<{ message: string }>(res);
  },

  logout: async () => {
    const res = await fetch(`${BASE_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    return handleResponse<{ message: string }>(res);
  },

  forgotPassword: async (email: string) => {
    const res = await fetch(`${BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse<{ message: string }>(res);
  },

  resetPassword: async (token: string, password: string) => {
    const res = await fetch(`${BASE_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    return handleResponse<{ message: string }>(res);
  },

  resendVerification: async (email: string) => {
    const res = await fetch(`${BASE_URL}/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse<{ message: string }>(res);
  },

  googleLogin: () => {
    window.location.href = '/api/auth/google';
  },

  login42: () => {
    window.location.href = '/api/auth/42';
  },
};
