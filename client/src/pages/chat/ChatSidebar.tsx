// src/pages/chat/ChatSidebar.tsx
import { Heart, Search, Ban, Loader2 } from 'lucide-react';
import ConvoItem from '@/components/chat/ConvoItem';
import BlockedItem from '@/components/chat/BlockedItem';
import type { Conversation, BlockedUser, SidebarTab } from '@/types/chat';

interface ChatSidebarProps {
  tab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  search: string;
  onSearchChange: (v: string) => void;
  convos: Conversation[];
  blockedUsers: BlockedUser[];
  activeConvoId: string | null;
  myId: string;
  loading: boolean;
  onSelectConvo: (convo: Conversation) => void;
  onUnblock: (id: string) => Promise<void>;
}

export default function ChatSidebar({
  tab,
  onTabChange,
  search,
  onSearchChange,
  convos,
  blockedUsers,
  activeConvoId,
  myId,
  loading,
  onSelectConvo,
  onUnblock,
}: ChatSidebarProps) {
  const filtered = search
    ? convos.filter((c) =>
        `${c.first_name} ${c.last_name} ${c.username}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : convos;

  return (
    <>
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <Heart size={20} className="text-primary fill-primary" />
          <h1 className="text-[22px] font-black text-text">Messages</h1>
        </div>

        {/* Tabs */}
        <div className="flex bg-background border border-border rounded-full p-1 mb-4">
          {(['messages', 'blocked'] as SidebarTab[]).map((t) => (
            <button
              key={t}
              onClick={() => onTabChange(t)}
              className={`flex-1 py-2 rounded-full text-[13px] font-black transition-all duration-200 capitalize ${
                tab === t
                  ? 'bg-surface shadow-sm text-text'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Search (messages tab only) */}
        {tab === 'messages' && (
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-background border border-border rounded-full pl-10 pr-4 py-2.5 text-[13px] font-bold text-text placeholder-text-muted focus:border-primary focus:bg-surface transition-all outline-none"
            />
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-0.5">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={26} className="text-primary animate-spin" />
          </div>
        ) : tab === 'messages' ? (
          filtered.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="text-4xl mb-3">💌</div>
              <p className="text-[14px] font-bold text-text-muted">
                {search ? 'No conversations match.' : 'Match with someone to start chatting!'}
              </p>
            </div>
          ) : (
            filtered.map((c) => (
              <ConvoItem
                key={c.id}
                convo={c}
                active={activeConvoId === c.id}
                myId={myId}
                onClick={() => onSelectConvo(c)}
              />
            ))
          )
        ) : blockedUsers.length === 0 ? (
          <div className="text-center py-12 px-6">
            <Ban size={36} className="text-border mx-auto mb-3" />
            <p className="text-[14px] font-bold text-text-muted">You haven't blocked anyone.</p>
          </div>
        ) : (
          blockedUsers.map((u) => (
            <BlockedItem key={u.id} user={u} onUnblock={onUnblock} />
          ))
        )}
      </div>
    </>
  );
}
