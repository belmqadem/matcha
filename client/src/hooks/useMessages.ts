// src/hooks/useMessages.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '@/context/SocketContext';
import { chatService } from '@/services/chatService';
import { normalizeMessage } from '@/utils/chat';
import type { Message, Conversation } from '@/types/chat';

interface UseMessagesReturn {
  messages: Message[];
  total: number;
  page: number;
  loading: boolean;
  loadingOlder: boolean;
  forbidden: boolean;
  loadOlder: () => Promise<void>;
  appendOptimistic: (msg: Message) => void;
  threadRef: React.RefObject<HTMLDivElement | null>;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}

export function useMessages(
  activeConvo: Conversation | null,
  isBlocked: boolean,
  onConvoUpdate: (convoId: string, patch: Partial<Conversation>) => void,
): UseMessagesReturn {
  const { socket } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  const threadRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch messages whenever active conversation changes
  useEffect(() => {
    if (!activeConvo) return;
    setMessages([]);
    setPage(1);
    setForbidden(false);
    if (isBlocked) return;

    setLoading(true);
    chatService
      .messages(activeConvo.id, 1)
      .then((d) => {
        setMessages((d.messages ?? []).map(normalizeMessage));
        setTotal(d.total ?? 0);
        chatService.markRead(activeConvo.id).catch(() => {});
        onConvoUpdate(activeConvo.id, { unread_count: 0 });
      })
      .catch((e: Error) => {
        const msg = e.message.toLowerCase();
        // Only mark as forbidden if it's an explicit connection/permission error,
        // not a 404 (which means no messages yet) or temporary failure
        if (msg.includes('not connected') || msg.includes('blocked') || msg.includes('unmatched')) {
          setForbidden(true);
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConvo?.id, isBlocked]);

  const scrollToBottom = useCallback(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (!loading && !forbidden && !isBlocked) {
      scrollToBottom();
      const id = setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
      return () => clearTimeout(id);
    }
  }, [messages.length, loading, forbidden, isBlocked, scrollToBottom]);

  // Socket: confirm optimistic message was delivered
  useEffect(() => {
    if (!socket) return;

    const onSent = (msg: { id: number; to: string; content: string; sentAt: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === -1 && m.content === msg.content ? { ...m, id: msg.id, sentAt: msg.sentAt } : m,
        ),
      );
    };

    const onError = () => {
      // Remove the pending optimistic message
      setMessages((prev) => prev.filter((m) => m.id !== -1));
    };

    // Incoming message — only append if it's for the active conversation
    const onReceive = (msg: {
      id: number;
      from: string;
      content: string;
      sentAt: string;
      isRead: boolean;
    }) => {
      if (!activeConvo || msg.from !== activeConvo.id) return;
      setMessages((prev) => [...prev, { ...msg, to: undefined }]);
      chatService.markRead(msg.from).catch(() => {});
    };

    socket.on('chat:sent', onSent);
    socket.on('chat:error', onError);
    socket.on('chat:receive', onReceive);

    return () => {
      socket.off('chat:sent', onSent);
      socket.off('chat:error', onError);
      socket.off('chat:receive', onReceive);
    };
  }, [socket, activeConvo]);

  const loadOlder = useCallback(async () => {
    if (!activeConvo || loadingOlder || messages.length >= total) return;
    setLoadingOlder(true);
    const nextPage = page + 1;
    const scrollEl = threadRef.current;
    const prevHeight = scrollEl?.scrollHeight ?? 0;
    try {
      const d = await chatService.messages(activeConvo.id, nextPage);
      const older = (d.messages ?? []).map(normalizeMessage);
      setMessages((prev) => [...older, ...prev]);
      setPage(nextPage);
      requestAnimationFrame(() => {
        if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight - prevHeight;
      });
    } finally {
      setLoadingOlder(false);
    }
  }, [activeConvo, loadingOlder, messages.length, total, page]);

  const appendOptimistic = useCallback((msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  return {
    messages,
    total,
    page,
    loading,
    loadingOlder,
    forbidden,
    loadOlder,
    appendOptimistic,
    threadRef,
    bottomRef,
  };
}
