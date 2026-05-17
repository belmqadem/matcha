const BASE_URL = '/api/auth';

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture_id: number | null;
}

export interface FullUser extends AuthUser {
  gender: string | null;
  sexual_preference: string | null;
  biography: string | null;
  fame_rating: number;
  location_city: string | null;
  is_online: boolean;
  last_seen: string | null;
  birth_date: string | null;
  created_at: string;
  tags: string[];
  photos: { id: number; url: string; order_index: number; created_at: string }[];
}

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(body.error ?? body.message ?? body.detail ?? body.msg ?? `Request failed (${res.status})`);
  return body as T;
}

export const authApi = {
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
