import { Search, Ban, Loader2 } from 'lucide-react';

import ConvoItem from '@/components/chat/ConvoItem';
import BlockedItem from '@/components/chat/BlockedItem';
import type { Conversation, BlockedUser, SidebarTab } from '@/types/chat';

interface ChatSidebarProps {
  tab: SidebarTab;
  onTabChange: (_tab: SidebarTab) => void;
  search: string;
  onSearchChange: (_v: string) => void;
  convos: Conversation[];
  blockedUsers: BlockedUser[];
  activeConvoId: string | null;
  myId: string;
  loading: boolean;
  onSelectConvo: (_convo: Conversation) => void;
  onUnblock: (_id: string) => Promise<void>;
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
        `${c.first_name} ${c.last_name} ${c.username}`.toLowerCase().includes(search.toLowerCase()),
      )
    : convos;

  return (
    <>
      {/* Header */}
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-border shrink-0 z-10">
        {/* <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-primary fill-primary" />
          <h1 className="text-xl sm:text-[22px] font-black text-text">Messages</h1>
        </div> */}

        {/* Tabs */}
        <div className="flex bg-background border border-border rounded-full p-1 mb-3 sm:mb-4 shadow-sm">
          {(['messages', 'blocked'] as SidebarTab[]).map((t) => (
            <button
              key={t}
              onClick={() => onTabChange(t)}
              className={`flex-1 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-black transition-all duration-200 capitalize active:scale-95 ${
                tab === t
                  ? 'bg-surface shadow-md text-text'
                  : 'text-text-muted hover:text-text hover:bg-surface/50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Search (messages tab only) */}
        {tab === 'messages' && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-background border-2 border-border rounded-full pl-9 pr-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-text placeholder-text-muted focus:border-primary focus:bg-surface transition-all outline-none"
            />
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-2 sm:py-3 px-2 flex flex-col gap-1 scrollbar-thin">
        {loading ? (
          <div className="flex justify-center py-10 sm:py-12">
            <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 text-primary animate-spin" />
          </div>
        ) : tab === 'messages' ? (
          filtered.length === 0 ? (
            <div className="text-center py-10 sm:py-12 px-4 sm:px-6 animate-fade-in-up">
              <div className="text-3xl sm:text-4xl mb-3 opacity-60">📭</div>
              <p className="text-xs sm:text-sm font-bold text-text-muted">
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
          <div className="text-center py-10 sm:py-12 px-4 sm:px-6 animate-fade-in-up">
            <Ban className="w-8 h-8 sm:w-10 sm:h-10 text-border mx-auto mb-3" />
            <p className="text-xs sm:text-sm font-bold text-text-muted">
              You haven't blocked anyone.
            </p>
          </div>
        ) : (
          blockedUsers.map((u) => (
            <BlockedItem
              key={u.id}
              user={u}
              onUnblock={onUnblock}
              onClick={() => {
                onSelectConvo({
                  id: u.id,
                  username: u.username,
                  first_name: u.first_name,
                  last_name: u.last_name,
                  profile_picture_id: u.profile_picture_id,
                  profile_picture_url: u.profile_picture_url,
                  is_online: false,
                  last_message: '',
                  last_message_at: '',
                  last_message_sender_id: '',
                  unread_count: 0,
                });
              }}
            />
          ))
        )}
      </div>
    </>
  );
}
