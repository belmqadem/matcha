// src/pages/chat/ChatThread.tsx
import { useRef, useState } from 'react';
import {
  ArrowLeft, Send, Loader2, CalendarHeart, MoreVertical,
  Heart, Ban, UserX,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Avatar from '@/components/ui/Avatar';
import Bubble from '@/components/chat/Bubble';
import ActionsMenu from '@/components/chat/ActionsMenu';
import { groupMessagesByDate } from '@/utils/chat';
import type { Conversation, Message, ConfirmAction } from '@/types/chat';

interface ChatThreadProps {
  activeConvo: Conversation;
  myId: string;
  messages: Message[];
  loading: boolean;
  loadingOlder: boolean;
  hasOlder: boolean;
  forbidden: boolean;
  isBlocked: boolean;
  sending: boolean;
  threadRef: React.RefObject<HTMLDivElement | null>;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  onBack: () => void;
  onLoadOlder: () => void;
  onSend: (content: string) => void;
  onAskOut: () => void;
  onConfirmAction: (action: ConfirmAction) => void;
}

export default function ChatThread({
  activeConvo,
  myId,
  messages,
  loading,
  loadingOlder,
  hasOlder,
  forbidden,
  isBlocked,
  sending,
  threadRef,
  bottomRef,
  onBack,
  onLoadOlder,
  onSend,
  onAskOut,
  onConfirmAction,
}: ChatThreadProps) {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const groups = groupMessagesByDate(messages);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
    if (inputRef.current) {
      inputRef.current.style.height = '32px';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const photoUrl =
    activeConvo.profile_picture_url ??
    (activeConvo.profile_picture_id
      ? `/api/photos/${activeConvo.profile_picture_id}`
      : undefined);

  const inputDisabled = isForbiddenOrBlocked(forbidden, isBlocked);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border bg-surface shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="md:hidden p-2 rounded-full border border-border text-text-muted hover:bg-background transition-colors shrink-0"
          >
            <ArrowLeft size={17} />
          </button>

          <button
            onClick={() => navigate(`/profile/${activeConvo.id}`)}
            className="flex items-center gap-3 cursor-pointer group min-w-0"
          >
            <Avatar
              photoUrl={photoUrl}
              first={activeConvo.first_name}
              last={activeConvo.last_name}
              size="lg"
              online={isBlocked || forbidden ? false : activeConvo.is_online}
              grayscale={isBlocked}
            />
            <div className="min-w-0">
              <p className="font-black text-[17px] text-text group-hover:text-primary transition-colors truncate">
                {activeConvo.first_name} {activeConvo.last_name}
              </p>
              <p className="text-[12px] font-bold">
                {isBlocked ? (
                  <span className="text-error">Blocked</span>
                ) : activeConvo.is_online && !forbidden ? (
                  <span className="text-success">Active now</span>
                ) : (
                  <span className="text-text-muted">@{activeConvo.username}</span>
                )}
              </p>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isBlocked && !forbidden && (
            <button
              onClick={onAskOut}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-primary/25 bg-primary/10 text-primary text-[13px] font-black hover:bg-primary/20 transition-all"
            >
              <CalendarHeart size={16} />
              <span className="hidden sm:inline">Ask out</span>
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowActionsMenu((v) => !v)}
              className="p-2.5 rounded-full border border-border text-text-muted hover:border-primary/40 hover:text-primary transition-all bg-surface"
            >
              <MoreVertical size={17} />
            </button>
            {showActionsMenu && (
              <ActionsMenu
                firstName={activeConvo.first_name}
                iBlocked={isBlocked}
                onBlock={() => onConfirmAction('block')}
                onUnblock={() => onConfirmAction('unblock')}
                onUnmatch={() => onConfirmAction('unmatch')}
                onClose={() => setShowActionsMenu(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={threadRef}
        className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3 scrollbar-thin"
      >
        {isBlocked ? (
          <BlockedState firstName={activeConvo.first_name} onUnblock={() => onConfirmAction('unblock')} />
        ) : forbidden ? (
          <ForbiddenState firstName={activeConvo.first_name} />
        ) : loading ? (
          <div className="flex-1 flex justify-center items-center">
            <Loader2 size={30} className="text-primary animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <EmptyState firstName={activeConvo.first_name} />
        ) : (
          <>
            {hasOlder && (
              <div className="text-center pb-2">
                <button
                  onClick={onLoadOlder}
                  disabled={loadingOlder}
                  className="px-5 py-2 rounded-full bg-background border border-border text-[12px] font-bold text-text-muted hover:text-primary hover:border-primary transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {loadingOlder && <Loader2 size={13} className="animate-spin" />}
                  {loadingOlder ? 'Loading…' : 'Load older messages'}
                </button>
              </div>
            )}
            {groups.map((group) => (
              <div key={group.date} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-center my-3">
                  <span className="text-[10px] bg-background text-text-muted font-black uppercase tracking-[0.12em] px-4 py-1.5 rounded-full border border-border">
                    {group.date}
                  </span>
                </div>
                {group.messages.map((msg) => (
                  <div key={msg.id} className="msg-appear">
                    <Bubble msg={msg} mine={msg.from === myId} />
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-4 bg-surface border-t border-border shrink-0">
        <div
          className={`flex items-end gap-3 bg-background border-2 rounded-[22px] px-4 py-2.5 transition-all ${
            inputDisabled
              ? 'opacity-50 cursor-not-allowed border-border'
              : 'border-border focus-within:border-primary focus-within:bg-surface'
          }`}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={handleKeyDown}
            disabled={inputDisabled}
            placeholder={
              isBlocked
                ? 'You blocked this user.'
                : forbidden
                  ? 'You can no longer reply.'
                  : 'Type a message… (Enter to send)'
            }
            rows={1}
            maxLength={1000}
            className="flex-1 bg-transparent text-[15px] font-medium text-text placeholder-text-muted resize-none outline-none leading-relaxed py-1 disabled:cursor-not-allowed min-h-[32px]"
          />
          <div className="flex items-center gap-2 shrink-0 pb-0.5">
            {input.length > 900 && (
              <span className="text-[11px] font-black text-error">{1000 - input.length}</span>
            )}
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending || inputDisabled}
              className="w-9 h-9 rounded-full bg-primary text-surface flex items-center justify-center shadow-md shadow-primary/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              {sending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} className="ml-0.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Local state-display sub-components ───────────────────────────────────────

function isForbiddenOrBlocked(forbidden: boolean, isBlocked: boolean): boolean {
  return forbidden || isBlocked;
}

function BlockedState({ firstName, onUnblock }: { firstName: string; onUnblock: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
      <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center border border-border">
        <Ban size={28} className="text-text-muted" />
      </div>
      <h3 className="text-[18px] font-black text-text">You blocked this user</h3>
      <p className="text-[14px] font-medium text-text-muted max-w-[260px] leading-relaxed">
        You can't send or receive messages from <strong className="text-text">{firstName}</strong>.
      </p>
      <button
        onClick={onUnblock}
        className="mt-2 px-5 py-2.5 bg-surface border-2 border-border text-text font-bold rounded-full hover:border-primary hover:text-primary transition-all text-[14px]"
      >
        Unblock user
      </button>
    </div>
  );
}

function ForbiddenState({ firstName }: { firstName: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
      <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center border border-border">
        <UserX size={28} className="text-error" />
      </div>
      <h3 className="text-[18px] font-black text-text">Chat unavailable</h3>
      <p className="text-[14px] font-medium text-text-muted max-w-[280px] leading-relaxed">
        <strong className="text-text">{firstName}</strong> may have unmatched or blocked you.
      </p>
    </div>
  );
}

function EmptyState({ firstName }: { firstName: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
      <div className="text-5xl">💞</div>
      <p className="text-[15px] font-bold text-text-muted">
        You matched with <strong className="text-text">{firstName}</strong>!<br />
        <span className="font-medium">Be the first to say hi.</span>
      </p>
    </div>
  );
}

function NoConvoState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
      <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
        <Heart size={36} className="text-primary fill-primary/30" />
      </div>
      <div>
        <h3 className="font-black text-text text-xl mb-1.5">Your messages</h3>
        <p className="text-[14px] text-text-muted max-w-[260px] mx-auto font-medium leading-relaxed">
          Select a conversation to start chatting. Only mutual matches can message!
        </p>
      </div>
    </div>
  );
}

export { NoConvoState };
