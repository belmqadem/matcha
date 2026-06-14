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
        className={`max-w-[85%] sm:max-w-[72%] px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-[15px] font-medium leading-relaxed shadow-sm break-words animate-[authPopIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)_both] ${
          mine
            ? 'bg-primary text-on-primary rounded-[20px] rounded-br-[5px]'
            : 'bg-surface text-text border border-border rounded-[20px] rounded-bl-[5px]'
        }`}
      >
        <p>{msg.content}</p>
        <div className={`flex items-center gap-1 mt-1 ${mine ? 'justify-end' : 'justify-start'}`}>
          <span
            className={`text-[0.6rem] sm:text-[10px] font-bold ${mine ? 'text-on-primary/70' : 'text-text-muted'}`}
          >
            {formatMessageTime(msg.sentAt)}
          </span>
          {mine &&
            (msg.isRead ? (
              <CheckCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-on-primary/90" />
            ) : (
              <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-on-primary/60" />
            ))}
        </div>
      </div>
    </div>
  );
}
