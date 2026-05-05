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
      credentials: 'include', // needed so the http-only cookie is stored
      body: JSON.stringify(payload),
    }).then((res) => handleResponse<{ user: AuthUser }>(res)),

  verifyEmail: (token: string) =>
    fetch(`${BASE_URL}/verify/${token}`).then((res) =>
      handleResponse<{ message: string }>(res),
    ),

  logout: () =>
    fetch(`${BASE_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    }).then((res) => handleResponse<{ message: string }>(res)),
};
