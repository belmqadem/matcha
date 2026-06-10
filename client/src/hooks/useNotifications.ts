// src/hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '@/services/notificationService';
import { useSocket } from '@/context/SocketContext';
import type { Notification } from '@/types/notification';

export function useNotifications() {
  // Bring in the socket context to keep the global header badge in sync
  const { socket, decrementNotifications, markNotificationsRead } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getNotifications();
      // FIX 1: Deduplicate by ID to guarantee no repeated notifications
      const unique = Array.from(new Map(data.notifications.map((n) => [n.id, n])).values());
      setNotifications(unique);
    } catch (_) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // FIX 2: Listen for new real-time notifications to update the list live!
  useEffect(() => {
    if (!socket) return;
    const handleNewNotif = () => {
      fetchNotifications();
    };
    socket.on('notification:new', handleNewNotif);
    return () => { socket.off('notification:new', handleNewNotif); };
  }, [socket, fetchNotifications]);

  const markRead = useCallback(async (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    decrementNotifications(); // Sync the red dot in the AppHeader!
    try {
      await notificationService.markRead(id);
    } catch (_) {}
  }, [decrementNotifications]);

  const deleteOne = useCallback(async (id: number) => {
    const target = notifications.find(n => n.id === id);
    if (target && !target.is_read) {
      decrementNotifications(); // Remove badge if we delete an unread notification
    }
    setNotifications((prev) => prev.filter((x) => x.id !== id));
    try {
      await notificationService.deleteNotification(id);
    } catch (_) {}
  }, [notifications, decrementNotifications]);

  const markAllRead = useCallback(async () => {
    if (markingAll || unreadCount === 0) return;
    setMarkingAll(true);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    markNotificationsRead(); // Clear the AppHeader badge
    try {
      await notificationService.markAllRead();
    } catch (_) {
      await fetchNotifications();
    } finally {
      setMarkingAll(false);
    }
  }, [markingAll, unreadCount, fetchNotifications, markNotificationsRead]);

  return {
    notifications,
    loading,
    unreadCount,
    markRead,
    deleteOne,
    markAllRead
  };
}
