// src/pages/ChatPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';
import { useChatActions } from '@/hooks/useChatActions';
import { chatService } from '@/services/chatService';
import FloatingHearts from '@/components/FloatingHearts';
import ConfirmModal from '@/components/chat/ConfirmModal';
import ProposeModal from '@/components/chat/ProposeModal';
import ChatSidebar from '@/pages/chat/ChatSidebar';
import ChatThread, { NoConvoState } from '@/pages/chat/ChatThread';
import type { Conversation, ConfirmAction, SidebarTab } from '@/types/chat';

export default function ChatPage() {
  const { user: me } = useAuth();
  const { id: urlUserId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // UI-only state
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('messages');
  const [search, setSearch] = useState('');
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  // Data hooks
  const { convos, blockedUsers, loading, setConvos, setBlockedUsers } = useConversations(
    activeConvo?.id ?? null,
  );

  const isBlocked = activeConvo ? blockedUsers.some((b) => b.id === activeConvo.id) : false;

  const onConvoUpdate = (convoId: string, patch: Partial<Conversation>) => {
    setConvos((prev) => prev.map((c) => (c.id === convoId ? { ...c, ...patch } : c)));
  };

  const {
    messages, total, loading: loadingMsgs, loadingOlder, forbidden,
    loadOlder, appendOptimistic, threadRef, bottomRef,
  } = useMessages(activeConvo, isBlocked, onConvoUpdate);

  const {
    sending, error, clearError,
    sendMessage, handleBlock, handleUnblock, handleUnmatch, handleProposeDate,
  } = useChatActions({
    activeConvo, isBlocked, isForbidden: forbidden,
    appendOptimistic, setConvos, setBlockedUsers,
    setActiveConvo, setMobileView,
  });

  // Deep-link: open conversation from URL param
  useEffect(() => {
    if (!urlUserId || convos.length === 0) return;
    const target = convos.find((c) => c.id === urlUserId);
    if (target) { setActiveConvo(target); setMobileView('chat'); return; }

    chatService.getUser(urlUserId).then((userData) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const u: any = userData.user ?? userData;
      if (!u?.id) return;
      const stub: Conversation = {
        id: u.id, username: u.username,
        first_name: u.first_name, last_name: u.last_name,
        profile_picture_id: u.profile_picture_id,
        profile_picture_url: u.photos?.find((p: any) => p.id === u.profile_picture_id)?.url ?? u.photos?.[0]?.url,
        is_online: u.is_online, last_message: '',
        last_message_at: new Date().toISOString(),
        last_message_sender_id: '', unread_count: 0,
      };
      setConvos((prev) => prev.some((c) => c.id === stub.id) ? prev : [stub, ...prev]);
      setActiveConvo(stub);
      setMobileView('chat');
    }).catch(() => navigate('/chat'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlUserId, convos.length]);

  const selectConvo = (convo: Conversation) => {
    setActiveConvo(convo);
    setMobileView('chat');
  };

  const visibleConvos = convos.filter((c) => !blockedUsers.some((b) => b.id === c.id));

  return (
    <div className="relative h-screen flex flex-col bg-background font-primary overflow-hidden">
      {/* Keyframes injected once via index.css — see @keyframes floatHeart and msg-appear */}
      <FloatingHearts />

      {/* Error toast */}
      {error && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-error text-surface text-[13px] font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 max-w-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={clearError} className="hover:opacity-70 transition-opacity ml-1">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Confirm modals */}
      {confirmAction === 'block' && activeConvo && (
        <ConfirmModal
          title={`Block ${activeConvo.first_name}?`}
          description={`You won't be able to send or receive messages from ${activeConvo.first_name}. You can unblock them later.`}
          confirmLabel="Block" danger loading={false}
          onConfirm={async () => { await handleBlock(); setConfirmAction(null); }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
      {confirmAction === 'unblock' && activeConvo && (
        <ConfirmModal
          title={`Unblock ${activeConvo.first_name}?`}
          description={`You'll be able to send and receive messages from ${activeConvo.first_name} again.`}
          confirmLabel="Unblock" loading={false}
          onConfirm={async () => { await handleUnblock(); setConfirmAction(null); }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
      {confirmAction === 'unmatch' && activeConvo && (
        <ConfirmModal
          title={`Unmatch ${activeConvo.first_name}?`}
          description={`This will permanently remove your match with ${activeConvo.first_name}. This action cannot be undone.`}
          confirmLabel="Unmatch" danger loading={false}
          onConfirm={async () => { await handleUnmatch(); setConfirmAction(null); }}
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

      {/* Layout */}
      <div className="relative z-10 flex flex-1 overflow-hidden max-w-[1280px] w-full mx-auto py-5 px-4 sm:px-6 gap-5">

        {/* Sidebar */}
        <aside className={`w-full md:w-80 lg:w-96 shrink-0 flex flex-col bg-surface/90 backdrop-blur-md rounded-[28px] border border-border shadow-sm overflow-hidden ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}>
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

        {/* Thread */}
        <main className={`flex-1 flex flex-col bg-surface/95 backdrop-blur-md rounded-[28px] border border-border shadow-sm overflow-hidden min-w-0 ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
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
              onBack={() => setMobileView('list')}
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
