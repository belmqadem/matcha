// src/pages/chat/ChatThread.tsx
import { useRef, useState } from 'react';
import {
  ArrowLeft,
  Send,
  Loader2,
  CalendarHeart,
  MoreVertical,
  Heart,
  Ban,
  UserX,
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
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const photoUrl =
    activeConvo.profile_picture_url ??
    (activeConvo.profile_picture_id ? `/api/photos/${activeConvo.profile_picture_id}` : undefined);

  const inputDisabled = isForbiddenOrBlocked(forbidden, isBlocked);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-5 py-3 sm:py-4 border-b border-border bg-surface shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onBack}
            className="md:hidden p-1.5 sm:p-2 rounded-full border-2 border-border text-text-muted hover:bg-background transition-colors shrink-0 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={() => navigate(`/profile/${activeConvo.id}`)}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0 text-left"
          >
            <Avatar
              photoUrl={photoUrl}
              first={activeConvo.first_name}
              last={activeConvo.last_name}
              size="md"
              online={isBlocked || forbidden ? false : activeConvo.is_online}
              grayscale={isBlocked}
            />
            <div className="min-w-0">
              <p className="font-black text-sm sm:text-base text-text group-hover:text-primary transition-colors truncate">
                {activeConvo.first_name} {activeConvo.last_name}
              </p>
              <p className="text-[0.65rem] sm:text-xs font-bold truncate">
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

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {!isBlocked && !forbidden && (
            <button
              onClick={onAskOut}
              className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs sm:text-sm font-black hover:bg-primary/20 transition-all active:scale-95"
            >
              <CalendarHeart className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Ask out</span>
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setShowActionsMenu((v) => !v)}
              className="p-1.5 sm:p-2 rounded-full border-2 border-border text-text-muted hover:border-primary hover:text-primary transition-all bg-surface active:scale-95"
            >
              <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
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
        className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 sm:py-5 flex flex-col gap-3 sm:gap-4 scrollbar-thin"
      >
        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : messages.length > 0 ? (
          <>
            {hasOlder && (
              <div className="text-center pb-2">
                <button
                  onClick={onLoadOlder}
                  disabled={loadingOlder}
                  className="px-4 sm:px-5 py-2 rounded-full bg-background border border-border text-[0.65rem] sm:text-xs font-bold text-text-muted hover:text-primary hover:border-primary transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto active:scale-95"
                >
                  {loadingOlder && <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />}
                  {loadingOlder ? 'Loading…' : 'Load older messages'}
                </button>
              </div>
            )}
            {groups.map((group) => (
              <div key={group.date} className="flex flex-col gap-1.5 sm:gap-2">
                <div className="flex items-center justify-center my-2 sm:my-3">
                  <span className="text-[0.6rem] sm:text-[10px] bg-background text-text-muted font-black uppercase tracking-widest px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-border shadow-sm">
                    {group.date}
                  </span>
                </div>
                {group.messages.map((msg) => (
                  <div key={msg.id} className="animate-fade-in-up">
                    <Bubble msg={msg} mine={msg.from === myId} />
                  </div>
                ))}
              </div>
            ))}
          </>
        ) : isBlocked ? (
          <BlockedState
            firstName={activeConvo.first_name}
            onUnblock={() => onConfirmAction('unblock')}
          />
        ) : forbidden ? (
          <ForbiddenState firstName={activeConvo.first_name} />
        ) : (
          <EmptyState firstName={activeConvo.first_name} />
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 sm:px-5 py-3 sm:py-4 bg-surface border-t border-border shrink-0 z-20">
        <div
          className={`flex items-end gap-2 sm:gap-3 bg-background border-2 rounded-2xl sm:rounded-3xl px-3 sm:px-4 py-2 sm:py-2.5 transition-all ${
            inputDisabled
              ? 'opacity-50 cursor-not-allowed border-border'
              : 'border-border focus-within:border-primary focus-within:bg-surface'
          }`}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={inputDisabled}
            placeholder={
              isBlocked
                ? 'You blocked this user.'
                : forbidden
                  ? 'You can no longer reply.'
                  : 'Type a message…'
            }
            rows={Math.min(input.split('\n').length, 4)}
            maxLength={1000}
            className="flex-1 bg-transparent text-sm sm:text-base font-medium text-text placeholder-text-muted resize-none outline-none leading-relaxed py-1.5 disabled:cursor-not-allowed scrollbar-thin"
          />
          <div className="flex items-center gap-2 shrink-0 pb-1 sm:pb-1.5">
            {input.length > 900 && (
              <span className="text-[0.65rem] sm:text-xs font-black text-error">
                {1000 - input.length}
              </span>
            )}
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending || inputDisabled}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-surface flex items-center justify-center shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <Send className="w-4 h-4 sm:w-4 sm:h-4 ml-0.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* --- Local States --- */

function isForbiddenOrBlocked(forbidden: boolean, isBlocked: boolean): boolean {
  return forbidden || isBlocked;
}

function BlockedState({ firstName, onUnblock }: { firstName: string; onUnblock: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 sm:gap-3 animate-fade-in-up">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-background flex items-center justify-center border border-border">
        <Ban className="w-6 h-6 sm:w-8 sm:h-8 text-text-muted" />
      </div>
      <h3 className="text-base sm:text-lg font-black text-text">You blocked this user</h3>
      <p className="text-xs sm:text-sm font-medium text-text-muted max-w-[260px] leading-relaxed">
        You can't send or receive messages from <strong className="text-text">{firstName}</strong>.
      </p>
      <button
        onClick={onUnblock}
        className="mt-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-surface border-2 border-border text-text font-bold rounded-full hover:border-primary hover:text-primary transition-all text-xs sm:text-sm active:scale-95"
      >
        Unblock user
      </button>
    </div>
  );
}

function ForbiddenState({ firstName }: { firstName: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 sm:gap-3 animate-fade-in-up">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-error/10 flex items-center justify-center border border-error/20">
        <UserX className="w-6 h-6 sm:w-8 sm:h-8 text-error" />
      </div>
      <h3 className="text-base sm:text-lg font-black text-text">Chat unavailable</h3>
      <p className="text-xs sm:text-sm font-medium text-text-muted max-w-[280px] leading-relaxed">
        <strong className="text-text">{firstName}</strong> may have unmatched or blocked you.
      </p>
    </div>
  );
}

function EmptyState({ firstName }: { firstName: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 sm:gap-4 animate-fade-in-up">
      <div className="text-4xl sm:text-5xl opacity-80">👋</div>
      <p className="text-sm sm:text-base font-bold text-text-muted leading-relaxed">
        You matched with <strong className="text-text">{firstName}</strong>!<br />
        <span className="font-medium">Be the first to say hi.</span>
      </p>
    </div>
  );
}

function NoConvoState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 sm:gap-4 text-center px-6 sm:px-8 animate-fade-in-up">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
        <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-primary fill-primary/30" />
      </div>
      <div>
        <h3 className="font-black text-text text-lg sm:text-xl mb-1 sm:mb-2">Your messages</h3>
        <p className="text-xs sm:text-sm text-text-muted max-w-[260px] mx-auto font-medium leading-relaxed">
          Select a conversation to start chatting. Only mutual matches can message!
        </p>
      </div>
    </div>
  );
}

export { NoConvoState };
