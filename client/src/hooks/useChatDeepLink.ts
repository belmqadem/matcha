// src/hooks/useChatDeepLink.ts
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatService } from '@/services/chatService';
import type { Conversation } from '@/types/chat';

interface UseChatDeepLinkParams {
  urlUserId?: string;
  convos: Conversation[];
  loading: boolean; // ← add this
  setConvos: React.Dispatch<React.SetStateAction<Conversation[]>>;
  setActiveConvo: (_convo: Conversation) => void;
  setMobileView: (_view: 'list' | 'chat') => void;
  onError: (_msg: string) => void; // ← add this (already in ChatPage.tsx)
}

export function useChatDeepLink({
  urlUserId,
  convos,
  loading,
  setConvos,
  setActiveConvo,
  setMobileView,
  onError,
}: UseChatDeepLinkParams) {
  const navigate = useNavigate();
  const didRun = useRef(false); // ← run once per urlUserId

  useEffect(() => {
    didRun.current = false;
  }, [urlUserId]);

  useEffect(() => {
    if (!urlUserId || loading || didRun.current) return; // ← wait for load, not convos.length

    didRun.current = true;

    const target = convos.find((c) => String(c.id) === String(urlUserId));
    if (target) {
      setActiveConvo(target);
      setMobileView('chat');
      return;
    }

    // Not in list — fetch and create stub
    chatService
      .getUser(urlUserId)
      .then((userData) => {
        // Handle response structure: { profile: { user: {...} } }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = userData as any;
        const u = data.profile?.user ?? data.user ?? data;
        if (!u?.id) {
          navigate('/chat');
          return;
        }

        const stub: Conversation = {
          id: u.id,
          username: u.username,
          first_name: u.first_name,
          last_name: u.last_name,
          profile_picture_id: u.profile_picture_id,
          profile_picture_url:
            u.photos?.find(
              (p: { id: number | string; url: string }) => p.id === u.profile_picture_id,
            )?.url ??
            u.photos?.[0]?.url ??
            null,
          is_online: u.is_online,
          last_message: '',
          last_message_at: new Date().toISOString(),
          last_message_sender_id: '',
          unread_count: 0,
          is_connected: u.is_connected ?? false,
        };

        setConvos((prev) =>
          prev.some((c) => String(c.id) === String(stub.id)) ? prev : [stub, ...prev],
        );
        setActiveConvo(stub);
        setMobileView('chat');
      })
      .catch(() => {
        onError('Could not open that conversation.');
        navigate('/chat');
      });
  }, [urlUserId, loading, convos, navigate, setActiveConvo, setMobileView, setConvos, onError]);
}
