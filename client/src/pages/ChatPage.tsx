// src/pages/ChatPage.tsx
import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';
import { useChatActions } from '@/hooks/useChatActions';
import { useChatDeepLink } from '@/hooks/useChatDeepLink';

import ConfirmModal from '@/components/chat/ConfirmModal';
import ProposeModal from '@/components/chat/ProposeModal';
import ChatSidebar from '@/pages/chat/ChatSidebar';
import ChatThread, { NoConvoState } from '@/pages/chat/ChatThread';
import type { Conversation, ConfirmAction, SidebarTab } from '@/types/chat';

export default function ChatPage() {
  const { user: me } = useAuth();
  const { id: urlUserId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('messages');
  const [search, setSearch] = useState('');
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [deepLinkError, setDeepLinkError] = useState<string | null>(null);

  const { convos, blockedUsers, loading, setConvos, setBlockedUsers } = useConversations(
    activeConvo?.id ?? null,
  );

  const isBlocked = activeConvo
    ? blockedUsers.some((b) => String(b.id) === String(activeConvo.id))
    : false;

  const onConvoUpdate = useCallback(
    (convoId: string, patch: Partial<Conversation>) => {
      setConvos((prev) =>
        prev.map((c) => (String(c.id) === String(convoId) ? { ...c, ...patch } : c)),
      );
    },
    [setConvos],
  );

  const {
    messages,
    total,
    loading: loadingMsgs,
    loadingOlder,
    forbidden,
    loadOlder,
    appendOptimistic,
    threadRef,
    bottomRef,
  } = useMessages(activeConvo, onConvoUpdate);

  const {
    sending,
    sendMessage,
    handleBlock,
    handleUnblock,
    handleUnmatch,
    handleProposeDate,
  } = useChatActions({
    activeConvo,
    isBlocked,
    isForbidden: forbidden,
    appendOptimistic,
    setConvos,
    setBlockedUsers,
    setActiveConvo,
    setMobileView,
  });

  useChatDeepLink({
    urlUserId,
    convos,
    loading,
    setConvos,
    setActiveConvo,
    setMobileView,
    onError: setDeepLinkError,
  });

  const selectConvo = (convo: Conversation) => {
    setActiveConvo(convo);
    setMobileView('chat');
    navigate(`/chat/${convo.id}`, { replace: true });
  };

  const handleBack = () => {
    setMobileView('list');
    navigate('/chat', { replace: true });
  };

  const visibleConvos = convos.filter(
    (c) => !blockedUsers.some((b) => String(b.id) === String(c.id)),
  );

  return (
    <div className="flex flex-col relative overflow-hidden">
      {deepLinkError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-error text-surface text-xs sm:text-sm font-bold px-4 py-2 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl shadow-xl flex items-center gap-2 sm:gap-3 max-w-[90%] sm:max-w-sm animate-fade-in-up">
          <span className="truncate">{deepLinkError}</span>
          <button
            onClick={() => setDeepLinkError(null)}
            className="hover:opacity-70 transition-opacity ml-1 shrink-0 active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {confirmAction === 'block' && activeConvo && (
        <ConfirmModal
          title={`Block ${activeConvo.first_name}?`}
          description={`You won't be able to send or receive messages. You can unblock them later.`}
          confirmLabel="Block"
          danger
          loading={false}
          onConfirm={async () => {
            await handleBlock();
            setConfirmAction(null);
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {confirmAction === 'unblock' && activeConvo && (
        <ConfirmModal
          title={`Unblock ${activeConvo.first_name}?`}
          description={`You'll be able to send and receive messages again.`}
          confirmLabel="Unblock"
          loading={false}
          onConfirm={async () => {
            await handleUnblock();
            setConfirmAction(null);
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {confirmAction === 'unmatch' && activeConvo && (
        <ConfirmModal
          title={`Unmatch ${activeConvo.first_name}?`}
          description={`This will permanently remove your match. This action cannot be undone.`}
          confirmLabel="Unmatch"
          danger
          loading={false}
          onConfirm={async () => {
            await handleUnmatch();
            setConfirmAction(null);
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {showProposeModal && activeConvo && (
        <ProposeModal
          receiverName={activeConvo.first_name}
          onClose={() => setShowProposeModal(false)}
          onPropose={handleProposeDate}
        />
      )}

      {/* Main Flex Layout */}
      <div className="relative z-10 flex flex-1 min-h-0 overflow-hidden w-full max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 gap-3 sm:gap-5">
        {/* Sidebar */}
        <aside
          className={`w-full md:w-80 lg:w-96 shrink-0 flex flex-col min-h-0 bg-surface/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-border shadow-sm overflow-hidden ${
            mobileView === 'chat' ? 'hidden md:flex' : 'flex'
          }`}
        >
          <ChatSidebar
            tab={sidebarTab}
            onTabChange={setSidebarTab}
            search={search}
            onSearchChange={setSearch}
            convos={visibleConvos}
            blockedUsers={blockedUsers}
            activeConvoId={activeConvo?.id ?? null}
            myId={String(me?.id ?? '')}
            loading={loading}
            onSelectConvo={selectConvo}
            onUnblock={handleUnblock}
          />
        </aside>

        {/* Thread Area */}
        <main
          className={`flex-1 flex flex-col h-[calc(100vh-136px)] min-w-0 bg-surface/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-border shadow-sm overflow-hidden ${
            mobileView === 'list' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConvo ? (
            <ChatThread
              activeConvo={activeConvo}
              myId={String(me?.id ?? '')}
              messages={messages}
              loading={loadingMsgs}
              loadingOlder={loadingOlder}
              hasOlder={messages.length < total}
              forbidden={forbidden}
              isBlocked={isBlocked}
              sending={sending}
              threadRef={threadRef}
              bottomRef={bottomRef}
              onBack={handleBack}
              onLoadOlder={loadOlder}
              onSend={sendMessage}
              onAskOut={() => setShowProposeModal(true)}
              onConfirmAction={setConfirmAction}
            />
          ) : (
            <NoConvoState />
          )}
        </main>
      </div>
    </div>
  );
}
