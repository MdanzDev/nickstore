import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, ShoppingCart, Check } from 'lucide-react';
import { useAdminOrders } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface OrderNotification {
  id: string;
  orderNumber: string;
  gameName: string;
  totalAmount: number;
  timestamp: Date;
}

const OrderNotification: React.FC = () => {
  const navigate = useNavigate();
  const { orders } = useAdminOrders();
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [previousOrdersCount, setPreviousOrdersCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check for new orders
  useEffect(() => {
    const currentCount = orders.length;
    
    if (currentCount > previousOrdersCount && previousOrdersCount > 0) {
      // New orders detected!
      const newOrders = orders.slice(0, currentCount - previousOrdersCount);
      
      newOrders.forEach(order => {
        const notification: OrderNotification = {
          id: order.$id!,
          orderNumber: order.order_number,
          gameName: order.game_name,
          totalAmount: typeof order.total_amount === 'string' ? parseFloat(order.total_amount) : order.total_amount,
          timestamp: new Date(),
        };
        
        setNotifications(prev => [notification, ...prev].slice(0, 10));
        setUnreadCount(prev => prev + 1);
        
        // Show browser notification
        if (Notification.permission === 'granted') {
          new Notification('New Order!', {
            body: `Order #${order.order_number} - ${order.game_name} - RM ${notification.totalAmount.toFixed(2)}`,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            silent: false,
          });
        }
      });
    }
    
    setPreviousOrdersCount(currentCount);
  }, [orders, previousOrdersCount]);

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleNotificationClick = () => {
    setShowDropdown(false);
    navigate(`/admin/orders`);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const formatCurrency = (amount: number) => {
    return `RM ${amount.toFixed(2)}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-lg hover:bg-slate-800 transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-400" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center bg-red-500 text-white text-xs px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h3 className="font-semibold text-white">New Orders</h3>
              {unreadCount > 0 && (
                <button
                  onClick={clearNotifications}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">All caught up!</p>
                  <p className="text-slate-500 text-xs mt-1">No new orders yet</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3 border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    onClick={handleNotificationClick}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">
                          {notif.gameName}
                        </p>
                        <p className="text-slate-400 text-xs">
                          #{notif.orderNumber} · {formatCurrency(notif.totalAmount)}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                          {new Date(notif.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notif.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700 rounded transition-all"
                      >
                        <X className="w-3 h-3 text-slate-500" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-3 border-t border-slate-800">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-slate-400 hover:text-white"
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/admin/orders');
                }}
              >
                View All Orders
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderNotification;
