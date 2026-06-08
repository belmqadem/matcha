import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    // Only connect if the user is fully authenticated and has set up their profile
    if (!user || !user.gender) return;

    const newSocket = io('/', { withCredentials: true, path: '/socket.io' });
    setSocket(newSocket);

    // Fetch initial counts on mount using our services
    const fetchInitialCounts = async () => {
      try {
        const [msgData, notifData] = await Promise.all([
          chatService.getUnreadCount(),
          notificationService.getNotifications()
        ]);

        setUnreadMessages(msgData.unread || 0);
        setUnreadNotifications(notifData.unread_count || 0);
      } catch (error) {
        console.error("Failed to fetch notification counts", error);
      }
    };

    newSocket.on('connect', fetchInitialCounts);

    // Real-time listeners
    newSocket.on('chat:receive', () => setUnreadMessages(prev => prev + 1));
    newSocket.on('notification:new', () => setUnreadNotifications(prev => prev + 1));

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const markMessagesRead = () => setUnreadMessages(0);
  const markNotificationsRead = () => setUnreadNotifications(0);

  return (
    <SocketContext.Provider value={{
      socket,
      unreadMessages,
      unreadNotifications,
      markMessagesRead,
      markNotificationsRead
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};
