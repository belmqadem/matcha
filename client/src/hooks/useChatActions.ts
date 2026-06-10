// src/hooks/useChatActions.ts
import { useCallback, useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import { chatService } from '@/services/chatService';
import type { Conversation, BlockedUser, Message, DateProposal } from '@/types/chat';

interface UseChatActionsParams {
  activeConvo: Conversation | null;
  isBlocked: boolean;
  isForbidden: boolean;
  appendOptimistic: (msg: Message) => void;
  setConvos: React.Dispatch<React.SetStateAction<Conversation[]>>;
  setBlockedUsers: React.Dispatch<React.SetStateAction<BlockedUser[]>>;
  setActiveConvo: (convo: Conversation | null) => void;
  setMobileView: (view: 'list' | 'chat') => void;
}

interface UseChatActionsReturn {
  sending: boolean;
  error: string;
  clearError: () => void;
  sendMessage: (content: string) => void;
  handleBlock: () => Promise<void>;
  handleUnblock: (id?: string) => Promise<void>;
  handleUnmatch: () => Promise<void>;
  handleProposeDate: (data: Omit<DateProposal, 'receiver_id'>) => Promise<void>;
}

export function useChatActions({
  activeConvo,
  isBlocked,
  isForbidden,
  appendOptimistic,
  setConvos,
  setBlockedUsers,
  setActiveConvo,
  setMobileView,
}: UseChatActionsParams): UseChatActionsReturn {
  const { socket } = useSocket();
  const { user: me } = useAuth();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const clearError = useCallback(() => setError(''), []);

  // Listen for socket errors and clear "sending" state
  useEffect(() => {
    if (!socket) return;

    const onSocketError = (data: { message: string }) => {
      setError(data.message || 'Failed to send message');
      setSending(false);
    };

    const onMessageSent = () => {
      setSending(false);
      setError('');
    };

    socket.on('chat:error', onSocketError);
    socket.on('chat:sent', onMessageSent);
    return () => {
      socket.off('chat:error', onSocketError);
      socket.off('chat:sent', onMessageSent);
    };
  }, [socket]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim() || !activeConvo || !me || sending || isForbidden || isBlocked) return;

      // Check socket connection
      if (!socket || !socket.connected) {
        setError('Connection lost. Please refresh the page.');
        return;
      }

      const optimistic: Message = {
        id: -1,
        from: String(me.id),
        content,
        sentAt: new Date().toISOString(),
        isRead: false,
      };
      appendOptimistic(optimistic);
      setSending(true);
      socket.emit('chat:send', { to: activeConvo.id, content });

      setConvos((prev) => {
        const updated = prev.map((c) =>
          c.id === activeConvo.id
            ? {
                ...c,
                last_message: content,
                last_message_at: optimistic.sentAt,
                last_message_sender_id: String(me.id),
              }
            : c,
        );
        return [...updated].sort(
          (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime(),
        );
      });

      // Fallback: clear "sending" state if socket doesn't confirm within 3s
      const timer = setTimeout(() => setSending(false), 3000);
      // The useMessages hook clears it on chat:sent — this is just insurance
      return () => clearTimeout(timer);
    },
    [activeConvo, me, sending, isForbidden, isBlocked, appendOptimistic, socket, setConvos],
  );

  const handleBlock = useCallback(async () => {
    if (!activeConvo) return;
    await chatService.block(activeConvo.id);
    setBlockedUsers((prev) => [
      ...prev,
      {
        id: activeConvo.id,
        username: activeConvo.username,
        first_name: activeConvo.first_name,
        last_name: activeConvo.last_name,
        profile_picture_id: activeConvo.profile_picture_id,
        profile_picture_url: activeConvo.profile_picture_url,
        blocked_at: new Date().toISOString(),
      },
    ]);
  }, [activeConvo, setBlockedUsers]);

  const handleUnblock = useCallback(
    async (id?: string) => {
      const targetId = id ?? activeConvo?.id;
      if (!targetId) return;
      await chatService.unblock(targetId);
      setBlockedUsers((prev) => prev.filter((u) => u.id !== targetId));
    },
    [activeConvo, setBlockedUsers],
  );

  const handleUnmatch = useCallback(async () => {
    if (!activeConvo) return;
    await chatService.unmatch(activeConvo.id);
    setConvos((prev) => prev.filter((c) => c.id !== activeConvo.id));
    setActiveConvo(null);
    setMobileView('list');
  }, [activeConvo, setConvos, setActiveConvo, setMobileView]);

  const handleProposeDate = useCallback(
    async (data: Omit<DateProposal, 'receiver_id'>) => {
      if (!activeConvo || !me) return;
      await chatService.proposeDate({ receiver_id: activeConvo.id, ...data });
      const formattedDate = new Date(data.scheduled_at).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      const content = `📅 I've proposed a date: ${formattedDate}${data.location ? ` at ${data.location}` : ''}`;
      socket?.emit('chat:send', { to: activeConvo.id, content });
      appendOptimistic({
        id: Math.random(),
        from: String(me.id),
        content,
        sentAt: new Date().toISOString(),
        isRead: false,
      });
    },
    [activeConvo, me, socket, appendOptimistic],
  );

  return {
    sending,
    error,
    clearError,
    sendMessage,
    handleBlock,
    handleUnblock,
    handleUnmatch,
    handleProposeDate,
  };
}
