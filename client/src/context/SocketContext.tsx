/* eslint-disable react-refresh/only-export-components */
// src/context/SocketContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import { chatService } from '@/services/chatService';
import { notificationService } from '@/services/notificationService';

interface SocketContextType {
  socket: Socket | null;
  unreadMessages: number;
  unreadNotifications: number;
  markMessagesRead: () => void;
  markNotificationsRead: () => void;
  decrementNotifications: () => void; // <-- ADD THIS
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (!user) return;

    const newSocket = io('/', {
      withCredentials: true,
      path: '/socket.io',
      transports: ['websocket'],
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(newSocket);

    let hasFetchedInitial = false;
    let disconnectedAt = 0;

    const fetchInitialCounts = async () => {
      try {
        const [msgData, notifData] = await Promise.all([
          chatService.getUnreadCount(),
          notificationService.getNotifications(),
        ]);
        setUnreadMessages(msgData.unread || 0);
        setUnreadNotifications(notifData.unread_count || 0);
        hasFetchedInitial = true;
      } catch {
        // silent — will retry on reconnect
      }
    };

    const onConnect = () => {
      const now = Date.now();
      const shouldFetch =
        !hasFetchedInitial || (disconnectedAt > 0 && now - disconnectedAt > 10000);
      if (shouldFetch) fetchInitialCounts();
      disconnectedAt = 0;
    };

    const onDisconnect = () => {
      disconnectedAt = Date.now();
    };

    newSocket.on('connect', onConnect);
    newSocket.on('disconnect', onDisconnect);
    newSocket.on('chat:receive', () => setUnreadMessages((prev) => prev + 1));
    newSocket.on('notification:new', () => setUnreadNotifications((prev) => prev + 1));

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [user]);

  const markMessagesRead = () => setUnreadMessages(0);
  const markNotificationsRead = () => setUnreadNotifications(0);

  // <-- ADD THIS FUNCTION
  const decrementNotifications = () => setUnreadNotifications((prev) => Math.max(0, prev - 1));

  return (
    <SocketContext.Provider
      value={{
        socket,
        unreadMessages,
        unreadNotifications,
        markMessagesRead,
        markNotificationsRead,
        decrementNotifications, // <-- EXPORT IT
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};
