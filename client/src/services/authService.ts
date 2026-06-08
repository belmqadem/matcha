// src/services/authService.ts
import type { RegisterPayload, LoginPayload, AuthUser, FullUser } from '@/types/auth';

const BASE_URL = '/api/auth';

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(body.error ?? body.message ?? body.detail ?? body.msg ?? `Request failed (${res.status})`);
  return body as T;
}

export const authService = {
  register: (payload: RegisterPayload) =>
    fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then((res) => handleResponse<{ message: string }>(res)),

  login: (payload: LoginPayload) =>
    fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    }).then((res) => handleResponse<{ user: AuthUser }>(res)),

  me: () =>
    fetch('/api/users/me', {
      credentials: 'include',
    }).then((res) => handleResponse<{ user: FullUser }>(res)),

  verifyEmail: (token: string) =>
    fetch(`${BASE_URL}/verify/${token}`).then((res) =>
      handleResponse<{ message: string }>(res),
    ),

  logout: () =>
    fetch(`${BASE_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    }).then((res) => handleResponse<{ message: string }>(res)),

  forgotPassword: (email: string) =>
    fetch(`${BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).then((res) => handleResponse<{ message: string }>(res)),

  resetPassword: (token: string, password: string) =>
    fetch(`${BASE_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    }).then((res) => handleResponse<{ message: string }>(res)),

  resendVerification: (email: string) =>
    fetch(`${BASE_URL}/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).then((res) => handleResponse<{ message: string }>(res)),

  googleLogin: () => {
    window.location.href = '/api/auth/google';
  },

  login42: () => {
    window.location.href = '/api/auth/42';
  },
};
