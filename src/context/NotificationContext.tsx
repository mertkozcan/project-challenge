import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import NotificationService, { Notification } from '../services/NotificationService';
import SocketService from '@/services/socket.service';
import { useAppSelector } from '@/store';
import { notifications } from '@mantine/notifications';

interface NotificationContextType {
  notificationsList: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const userId = useAppSelector((state) => state.auth.userInfo.userId);
  const [notificationsList, setNotificationsList] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await NotificationService.getNotifications();
      setNotificationsList(data);
      const count = await NotificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await NotificationService.markAsRead(id);
      setNotificationsList(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotificationsList(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await NotificationService.deleteNotification(id);
      setNotificationsList(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();

      const socket = SocketService.connect();
      if (socket) {
        socket.on('notification-received', (notification: Notification) => {
          setNotificationsList(prev => [notification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast notification
          notifications.show({
            title: notification.title,
            message: notification.message,
            color: 'blue',
          });
        });
      }

      return () => {
        if (socket) {
          socket.off('notification-received');
        }
      };
    }
  }, [userId]);

  return (
    <NotificationContext.Provider
      value={{
        notificationsList,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
