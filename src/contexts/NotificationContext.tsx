import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAdminOrders } from '@/hooks/useOrders';

interface NotificationContextType {
  unreadCount: number;
  notifications: any[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { orders } = useAdminOrders();
  const [previousOrdersCount, setPreviousOrdersCount] = useState(0);

  // Check for new orders
  useEffect(() => {
    const currentCount = orders.length;
    
    if (currentCount > previousOrdersCount && previousOrdersCount > 0) {
      const newOrders = orders.slice(0, currentCount - previousOrdersCount);
      
      const newNotifications = newOrders.map(order => ({
        id: order.$id,
        orderNumber: order.order_number,
        gameName: order.game_name,
        totalAmount: order.total_amount,
        timestamp: new Date(),
        read: false,
      }));
      
      setNotifications(prev => [...newNotifications, ...prev]);
      setUnreadCount(prev => prev + newNotifications.length);
      
      // Show browser notification
      if (Notification.permission === 'granted') {
        newNotifications.forEach(notif => {
          new Notification('New Order!', {
            body: `Order #${notif.orderNumber} - ${notif.gameName} - RM ${notif.totalAmount}`,
            icon: '/icon-192.png',
          });
        });
      }
    }
    
    setPreviousOrdersCount(currentCount);
  }, [orders, previousOrdersCount]);

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{
      unreadCount,
      notifications,
      markAsRead,
      markAllAsRead,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
