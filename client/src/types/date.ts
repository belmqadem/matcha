// src/types/date.ts
export type DateStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';
export type MyRole = 'proposer' | 'receiver';

export interface DateEntry {
  id: number;
  proposer_id: string;
  receiver_id: string;
  scheduled_at: string;
  location: string | null;
  status: DateStatus;
  created_at: string;
  updated_at: string;
  my_role: MyRole;
  other_user_id: string;
  other_username: string;
  other_first_name: string;
  other_last_name: string;
  other_profile_picture_id: number | null;
  other_profile_picture_url: string | null;
}

export interface DatesResponse {
  dates: DateEntry[];
  upcoming: number;
  total: number;
}
