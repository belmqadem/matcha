// src/components/chat/Bubble.tsx
import { Check, CheckCheck } from 'lucide-react';
import { formatMessageTime } from '@/utils/chat';
import type { Message } from '@/types/chat';

interface BubbleProps {
  msg: Message;
  mine: boolean;
}

export default function Bubble({ msg, mine }: BubbleProps) {
  return (
    <div className={`flex items-end gap-2 mb-1 ${mine ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`max-w-[72%] px-4 py-2.5 text-[15px] font-medium leading-relaxed shadow-sm break-words ${
          mine
            ? 'bg-primary text-surface rounded-[20px] rounded-br-[5px]'
            : 'bg-surface text-text border border-border rounded-[20px] rounded-bl-[5px]'
        }`}
      >
        <p>{msg.content}</p>
        <div className={`flex items-center gap-1 mt-1 ${mine ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-[10px] font-bold ${mine ? 'text-surface/60' : 'text-text-muted'}`}>
            {formatMessageTime(msg.sentAt)}
          </span>
          {mine &&
            (msg.isRead ? (
              <CheckCheck size={13} className="text-surface/80" />
            ) : (
              <Check size={13} className="text-surface/50" />
            ))}
        </div>
      </div>
    </div>
  );
}
