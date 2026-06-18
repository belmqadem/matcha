// src/hooks/useNotifications.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { notificationService } from '@/services/notificationService';
import { useSocket } from '@/context/SocketContext';
import type { Notification } from '@/types/notification';

export function useNotifications() {
  const { socket, decrementNotifications, markNotificationsRead } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const lastFetchTime = useRef(0);
  const fetchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchNotificationsRef = useRef<() => Promise<void>>(null as unknown as () => Promise<void>);
  const hasAutoMarked = useRef(false);

  const fetchNotifications = useCallback(async () => {
    const now = Date.now();
    const timeSinceLast = now - lastFetchTime.current;

    if (timeSinceLast < 1500) {
      if (fetchTimeout.current) return;
      fetchTimeout.current = setTimeout(() => {
        fetchTimeout.current = null;
        fetchNotificationsRef.current();
      }, 1500 - timeSinceLast);
      return;
    }

    lastFetchTime.current = now;
    if (fetchTimeout.current) {
      clearTimeout(fetchTimeout.current);
      fetchTimeout.current = null;
    }

    try {
      const data = await notificationService.getNotifications();
      const unique = Array.from(new Map(data.notifications.map((n) => [n.id, n])).values());
      setNotifications(unique);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotificationsRef.current = fetchNotifications;
  }, [fetchNotifications]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchNotifications();
    return () => {
      if (fetchTimeout.current) clearTimeout(fetchTimeout.current);
    };
  }, [fetchNotifications]);

  // Auto-mark all as read on mount, once, after the first successful fetch
  useEffect(() => {
    if (!loading && !hasAutoMarked.current) {
      hasAutoMarked.current = true;
      if (unreadCount > 0) {
        void notificationService
          .markAllAsRead()
          .then(() => {
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
            markNotificationsRead();
          })
          .catch(() => {
            markNotificationsRead();
          });
      }
    }
  }, [loading, unreadCount, markNotificationsRead]);

  useEffect(() => {
    if (!socket) return;
    const handleNewNotif = () => void fetchNotifications();
    socket.on('notification:new', handleNewNotif);
    return () => {
      socket.off('notification:new', handleNewNotif);
    };
  }, [socket, fetchNotifications]);

  const markOneAsRead = useCallback(
    async (id: number) => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      decrementNotifications();
      try {
        await notificationService.markOneAsRead(id);
      } catch {
        // optimistic update already applied — ignore API failure
      }
    },
    [decrementNotifications],
  );

  const deleteOne = useCallback(
    async (id: number) => {
      const target = notifications.find((n) => n.id === id);
      if (target && !target.is_read) decrementNotifications();
      setNotifications((prev) => prev.filter((x) => x.id !== id));
      try {
        await notificationService.deleteNotification(id);
      } catch {
        // optimistic update already applied — ignore API failure
      }
    },
    [notifications, decrementNotifications],
  );

  const markAllRead = useCallback(async () => {
    if (markingAll || unreadCount === 0) return;
    setMarkingAll(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    markNotificationsRead();
    try {
      await notificationService.markAllAsRead();
    } catch {
      await fetchNotifications();
    } finally {
      setMarkingAll(false);
    }
  }, [markingAll, unreadCount, fetchNotifications, markNotificationsRead]);

  return { notifications, loading, unreadCount, markOneAsRead, deleteOne, markAllRead };
}
