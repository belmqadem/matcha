// src/hooks/useConversations.ts
import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import { chatService } from '@/services/chatService';
import type { Conversation, BlockedUser } from '@/types/chat';

interface UseConversationsReturn {
  convos: Conversation[];
  blockedUsers: BlockedUser[];
  loading: boolean;
  setConvos: React.Dispatch<React.SetStateAction<Conversation[]>>;
  setBlockedUsers: React.Dispatch<React.SetStateAction<BlockedUser[]>>;
}

export function useConversations(activeConvoId: string | null): UseConversationsReturn {
  const { socket } = useSocket();
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Keep a ref so socket handler always reads the latest activeConvoId without re-subscribing
  const activeConvoIdRef = useRef(activeConvoId);
  useEffect(() => { activeConvoIdRef.current = activeConvoId; }, [activeConvoId]);

  // Initial fetch
  useEffect(() => {
    Promise.all([
      chatService.blocked().catch(() => ({ blocked: [] as BlockedUser[] })),
      chatService.conversations().catch(() => ({ conversations: [] as Conversation[] })),
    ]).then(([blockedData, convosData]) => {
      setBlockedUsers(blockedData.blocked);
      setConvos(convosData.conversations);
    }).finally(() => setLoading(false));
  }, []);

  // Socket: update conversation list when a message arrives
  useEffect(() => {
    if (!socket) return;

    const onReceive = (msg: { id: number; from: string; content: string; sentAt: string }) => {
      setConvos((prev) =>
        prev.map((c) =>
          c.id === msg.from
            ? {
                ...c,
                last_message: msg.content,
                last_message_at: msg.sentAt,
                last_message_sender_id: msg.from,
                unread_count: c.id === activeConvoIdRef.current ? 0 : c.unread_count + 1,
              }
            : c,
        ),
      );
    };

    socket.on('chat:receive', onReceive);
    return () => { socket.off('chat:receive', onReceive); };
  }, [socket]);

  return { convos, blockedUsers, loading, setConvos, setBlockedUsers };
}
