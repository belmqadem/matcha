// src/types/chat.ts
export interface Conversation {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture_id?: number;
  profile_picture_url?: string;
  is_online: boolean;
  last_message: string;
  last_message_at: string;
  last_message_sender_id: string;
  unread_count: number;
}

export interface BlockedUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture_id?: number;
  profile_picture_url?: string;
  blocked_at: string;
}

export interface Message {
  id: number;
  from: string;
  to?: string;
  content: string;
  sentAt: string;
  isRead: boolean;
}

export interface DateProposal {
  receiver_id: string;
  scheduled_at: string;
  location?: string;
}

export interface MessageGroup {
  date: string;
  messages: Message[];
}

export type ConfirmAction = 'block' | 'unblock' | 'unmatch' | null;

export type SidebarTab = 'messages' | 'blocked';
