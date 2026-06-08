// src/components/chat/ConvoItem.tsx
import Avatar from '@/components/ui/Avatar';
import { formatTime } from '@/utils/chat';
import type { Conversation } from '@/types/chat';

interface ConvoItemProps {
  convo: Conversation;
  active: boolean;
  myId: string;
  onClick: () => void;
}

function photoUrl(convo: Conversation): string | undefined {
  return (
    convo.profile_picture_url ??
    (convo.profile_picture_id ? `/api/photos/${convo.profile_picture_id}` : undefined)
  );
}

export default function ConvoItem({ convo, active, myId, onClick }: ConvoItemProps) {
  const isMine = convo.last_message_sender_id === myId;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 rounded-2xl ${
        active
          ? 'bg-primary text-surface shadow-md'
          : 'hover:bg-surface border border-transparent hover:border-border bg-transparent'
      }`}
    >
      <Avatar
        photoUrl={photoUrl(convo)}
        first={convo.first_name}
        last={convo.last_name}
        online={convo.is_online}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className={`text-[15px] truncate ${active ? 'font-black text-surface' : 'font-bold text-text'}`}>
            {convo.first_name} {convo.last_name}
          </p>
          <span className={`text-[10px] font-semibold shrink-0 ${active ? 'text-surface/70' : 'text-text-muted'}`}>
            {formatTime(convo.last_message_at)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className={`text-[13px] truncate ${active ? 'text-surface/80 font-medium' : 'text-text-muted font-medium'}`}>
            {isMine && <span className="opacity-60">You: </span>}
            {convo.last_message || <em className="opacity-50">Say hello!</em>}
          </p>
          {convo.unread_count > 0 && !active && (
            <span className="shrink-0 bg-primary text-surface text-[10px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
              {convo.unread_count > 99 ? '99+' : convo.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
