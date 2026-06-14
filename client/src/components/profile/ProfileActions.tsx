import { Heart, MessageCircle, Ban, Flag, AlertTriangle, Loader2 } from 'lucide-react';

interface ProfileActionsProps {
  isBlockedByMe: boolean;
  likedByMe: boolean;
  likedMe: boolean;
  isConnected: boolean;
  isFakeReported: boolean;
  likeLoading: boolean;
  blockLoading: boolean;
  actionError: string;
  onLike: () => void;
  onChat: () => void;
  onConfirmAction: (action: 'block' | 'unblock' | 'report') => void;
  firstName: string;
}

export function ProfileActions({
  isBlockedByMe,
  likedByMe,
  likedMe,
  isConnected,
  isFakeReported,
  likeLoading,
  blockLoading,
  actionError,
  onLike,
  onChat,
  onConfirmAction,
  firstName,
}: ProfileActionsProps) {
  return (
    <div className="bg-surface/85 backdrop-blur-md rounded-3xl p-4 border border-border/70 shadow-premium hover:shadow-glow/5 hover:border-primary/20 transition-all duration-500 flex flex-col gap-3 w-full shrink-0">
      {actionError && (
        <div className="bg-error/10 text-error text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 mb-1 animate-fade-in-up border border-error/20">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="truncate">{actionError}</span>
        </div>
      )}

      {/* Primary Action Button (Like / Match) */}
      {isBlockedByMe ? (
        <button
          disabled
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm sm:text-base bg-background/60 text-text-muted opacity-40 cursor-not-allowed border-none shadow-sm"
        >
          <Heart className="w-4 h-4 sm:w-5 sm:h-5" /> Blocked
        </button>
      ) : likedByMe ? (
        <button
          onClick={onLike}
          disabled={likeLoading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm sm:text-base bg-surface text-primary border-2 border-primary/40 hover:bg-primary/5 hover:border-primary/80 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer shadow-sm"
        >
          {likeLoading ? (
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
          ) : (
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-primary fill-current" />
          )}
          Unlike {firstName}
        </button>
      ) : (
        <button
          onClick={onLike}
          disabled={likeLoading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm sm:text-base bg-gradient-to-r from-primary via-[#ff6b8b] to-[#ff8e75] text-surface shadow-[0_4px_16px_rgba(233,64,87,0.3)] hover:shadow-[0_6px_20px_rgba(233,64,87,0.45)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer border-none"
        >
          {likeLoading ? (
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
          ) : (
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-surface fill-none" />
          )}
          {likedMe ? 'Match Now' : 'Send Like'}
        </button>
      )}

      {/* Chat Action Button */}
      <button
        onClick={onChat}
        disabled={!isConnected}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm sm:text-base transition-all duration-300 border-none active:scale-95 ${
          isConnected
            ? 'bg-text text-surface hover:bg-text/90 hover:-translate-y-0.5 cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]'
            : 'bg-background/50 text-text-muted opacity-60 cursor-not-allowed hover:shadow-none'
        }`}
      >
        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
        {isConnected ? 'Send Message' : 'Match to Chat'}
      </button>

      <div className="h-px bg-background/50 my-1" />

      {/* Secondary Administration Block / Report Buttons */}
      <div className="flex gap-2 w-full">
        <button
          onClick={() => onConfirmAction(isBlockedByMe ? 'unblock' : 'block')}
          disabled={blockLoading}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-xs border transition-all duration-200 active:scale-95 cursor-pointer ${
            isBlockedByMe
              ? 'bg-error/15 text-error border-error/30 hover:bg-error/25'
              : 'bg-background/40 text-text-muted border-border/60 hover:bg-background/80 hover:text-text'
          }`}
        >
          <Ban className="w-3.5 h-3.5" />
          {isBlockedByMe ? 'Unblock' : 'Block'}
        </button>

        <button
          onClick={() => !isFakeReported && onConfirmAction('report')}
          disabled={isFakeReported}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-xs border transition-all duration-200 active:scale-95 cursor-pointer ${
            isFakeReported
              ? 'bg-background/50 text-text-muted border-border/60 cursor-not-allowed'
              : 'bg-background/40 text-text-muted border-border/60 hover:bg-error/10 hover:text-error hover:border-error/20'
          }`}
        >
          <Flag className="w-3.5 h-3.5" />
          {isFakeReported ? 'Reported' : 'Report'}
        </button>
      </div>
    </div>
  );
}
