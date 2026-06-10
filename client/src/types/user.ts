export interface Photo {
  id: number;
  url: string;
  order_index?: number;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  age: number | null;
  birth_date: string | null;
  gender: string | null;
  sexual_preference: string | null;
  biography: string | null;
  location_city: string | null;
  latitude: number | null;
  longitude: number | null;
  fame_rating: number;
  tags: string[];
  photos: Photo[];
  profile_picture_id: number | null;
  is_online?: boolean;
  last_seen?: string | null;
}

export interface Visitor {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string | null;
  visited_at: string;
}

export interface Liker {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string | null;
  liked_at: string;
}

export interface BrowseUser {
  id: string;
  username: string;
  first_name: string;
  last_name?: string;
  birth_date?: string;
  photos?: Photo[];
  profile_picture_id?: number;
  is_online: boolean;
  last_seen?: string;
  distance_km?: number;
  location_city?: string;
  fame_rating: number;
  tags?: string[];
  liked_by_me: boolean;
  liked_me: boolean;
  is_connected: boolean;
}

export interface BrowseResponse {
  users: BrowseUser[];
  total: number;
  page?: number;
  limit?: number;
}

export interface LikeResponse {
  liked: boolean;
  connected: boolean;
}

export interface PublicProfile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  birth_date?: string;
  age: number | null;
  gender: string | null;
  sexual_preference: string | null;
  biography: string | null;
  location_city: string | null;
  fame_rating: number;
  tags: string[];
  photos: Photo[];
  profile_picture_id: number | null;
  is_online: boolean;
  last_seen: string | null;
  liked_by_me: boolean;
  liked_me: boolean;
  is_connected: boolean;
  is_blocked_by_me: boolean;
  is_fake_reported: boolean;
}
