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

  const activeConvoIdRef = useRef(activeConvoId);
  useEffect(() => {
    activeConvoIdRef.current = activeConvoId;
  }, [activeConvoId]);

  useEffect(() => {
    Promise.all([
      chatService.blocked().catch(() => ({ blocked: [] as BlockedUser[] })),
      chatService.conversations().catch(() => ({ conversations: [] as Conversation[] })),
    ])
      .then(([blockedData, convosData]) => {
        // Normalize all IDs to strings so URL params always match
        const normalizedConvos = convosData.conversations.map((c) => ({
          ...c,
          id: String(c.id),
        }));
        const normalizedBlocked = blockedData.blocked.map((b) => ({
          ...b,
          id: String(b.id),
        }));
        setBlockedUsers(normalizedBlocked);
        setConvos(normalizedConvos);
        // Set loading AFTER state is staged in the same microtask flush
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
    // No .finally() — loading is set inside .then() so it's batched with the data
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onReceive = (msg: { id: number; from: string; content: string; sentAt: string }) => {
      setConvos((prev) => {
        const updated = prev.map((c) =>
          String(c.id) === String(msg.from)
            ? {
                ...c,
                last_message: msg.content,
                last_message_at: msg.sentAt,
                last_message_sender_id: msg.from,
                unread_count:
                  String(c.id) === String(activeConvoIdRef.current) ? 0 : c.unread_count + 1,
              }
            : c,
        );
        return updated.slice().sort(
          (a, b) =>
            new Date(b.last_message_at || 0).getTime() -
            new Date(a.last_message_at || 0).getTime(),
        );
      });
    };

    socket.on('chat:receive', onReceive);
    return () => {
      socket.off('chat:receive', onReceive);
    };
  }, [socket]);

  return { convos, blockedUsers, loading, setConvos, setBlockedUsers };
}
