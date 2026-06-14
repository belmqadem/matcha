// src/types/notification.ts
export type NotificationType =
  | 'like'
  | 'visit'
  | 'message'
  | 'match'
  | 'unlike'
  | 'date_proposed'
  | 'date_accepted'
  | 'date_declined'
  | 'date_cancelled';

export interface Notification {
  id: number;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
  from_id: string;
  from_username: string;
  from_first_name: string;
  from_last_name: string;
  from_profile_picture_id: string | null;
  from_profile_picture_url: string | null;
  count?: number;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unread_count: number;
}
