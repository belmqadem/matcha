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
  count: number;
  created_at: string;
  from_id: string | null;
  from_username: string | null;
  from_first_name: string | null;
  from_last_name: string | null;
  from_profile_picture_id: number | null;
  from_profile_picture_url: string | null;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unread_count: number;
}
