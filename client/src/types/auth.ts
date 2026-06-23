// src/types/auth.ts

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

// Alias for AuthContext compatibility
export type LoginCredentials = LoginPayload;

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

// Alias for AuthContext compatibility
export type User = FullUser;

export interface AuthResponse {
  user: FullUser;
}
