import { useState, useEffect, useCallback } from 'react';
import { ordersCollection, storageHelpers, generateOrderNumber } from '@/lib/appwrite';
import type { Order, OrderStatus } from '@/types';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (status?: OrderStatus) => {
    try {
      setLoading(true);
      const response = await ordersCollection.list(status);
      
      const ordersWithUrls = await Promise.all(
        response.documents.map(async (doc: any) => {
          const order = doc as unknown as Order;
          if (order.receipt_image_id) {
            try {
              order.receipt_image_url = storageHelpers.getFileView(order.receipt_image_id);
            } catch (e) {
              console.error('Error loading receipt:', e);
            }
          }
          return order;
        })
      );
      
      setOrders(ordersWithUrls);
      setError(null);
    } catch (err: any) {
      console.error('Fetch orders error:', err);
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrder = useCallback(async (orderId: string) => {
    try {
      const doc = await ordersCollection.get(orderId);
      const order = doc as unknown as Order;
      if (order.receipt_image_id) {
        order.receipt_image_url = storageHelpers.getFileView(order.receipt_image_id);
      }
      return order;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to fetch order');
    }
  }, []);

  const getOrderByNumber = useCallback(async (orderNumber: string) => {
    if (!orderNumber) return null;
    
    try {
      const response = await ordersCollection.list();
      const allOrders = response.documents;
      const foundOrder = allOrders.find((doc: any) => doc.order_number === orderNumber);
      
      if (foundOrder) {
        const order = foundOrder as unknown as Order;
        if (order.receipt_image_id) {
          order.receipt_image_url = storageHelpers.getFileView(order.receipt_image_id);
        }
        return order;
      }
      return null;
    } catch (err: any) {
      console.error('Get order by number error:', err);
      throw new Error(err.message || 'Failed to fetch order');
    }
  }, []);

  return { orders, loading, error, refresh: fetchOrders, getOrder, getOrderByNumber };
};

export const useCreateOrder = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = useCallback(async (orderData: Partial<Order>, receiptFile?: File) => {
    try {
      setLoading(true);
      
      let receiptImageId = '';
      if (receiptFile) {
        console.log('Uploading receipt image...');
        const upload = await storageHelpers.uploadFile(receiptFile, 'receipt');
        receiptImageId = upload.$id;
        console.log('Receipt uploaded with ID:', receiptImageId);
      }

      const orderNumber = generateOrderNumber();
      const now = new Date();
      const formattedDate = now.toISOString().slice(0, 19);
      
      const orderPayload = {
        ...orderData,
        order_number: orderNumber,
        receipt_image_id: receiptImageId,
        status: 'pending',
        price: String(orderData.price || 0),
        total_amount: String(orderData.total_amount || 0),
        quantity: String(orderData.quantity || 1),
        created_at: formattedDate,
        updated_at: formattedDate,
        completed_at: null,
        user_email: orderData.user_email && orderData.user_email.trim() !== '' ? orderData.user_email : null,
        user_phone: orderData.user_phone && orderData.user_phone.trim() !== '' ? orderData.user_phone : null,
        user_nickname: orderData.user_nickname && orderData.user_nickname.trim() !== '' ? orderData.user_nickname : null,
        user_game_server: orderData.user_game_server && orderData.user_game_server.trim() !== '' ? orderData.user_game_server : null,
      };
      
      console.log('Creating order with payload:', orderPayload);
      
      const newOrder = await ordersCollection.create(orderPayload);

      return { order: newOrder as unknown as Order, orderNumber };
    } catch (err: any) {
      console.error('Error creating order:', err);
      setError(err.message || 'Failed to create order');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createOrder, loading, error };
};

export const useAdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (status?: OrderStatus) => {
    try {
      setLoading(true);
      const response = await ordersCollection.list(status);
      
      const ordersWithUrls = await Promise.all(
        response.documents.map(async (doc: any) => {
          const order = doc as unknown as Order;
          if (order.receipt_image_id) {
            try {
              order.receipt_image_url = storageHelpers.getFileView(order.receipt_image_id);
            } catch (e) {
              console.error('Error loading receipt:', e);
            }
          }
          return order;
        })
      );
      
      setOrders(ordersWithUrls.sort((a, b) => 
        new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      ));
      setError(null);
    } catch (err: any) {
      console.error('Fetch orders error:', err);
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus, adminNotes?: string) => {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString().slice(0, 19),
      };
      
      if (status === 'success' || status === 'failed') {
        updateData.completed_at = new Date().toISOString().slice(0, 19);
      }
      
      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      console.log('Updating order with data:', updateData);
      const updated = await ordersCollection.update(orderId, updateData);
      await fetchOrders();
      return updated as unknown as Order;
    } catch (err: any) {
      console.error('Update error:', err);
      throw new Error(err.message || 'Failed to update order');
    }
  }, [fetchOrders]);

  const deleteOrder = useCallback(async (orderId: string) => {
    try {
      await ordersCollection.delete(orderId);
      await fetchOrders();
    } catch (err: any) {
      console.error('Delete error:', err);
      throw new Error(err.message || 'Failed to delete order');
    }
  }, [fetchOrders]);

  useEffect(() => {
    const unsubscribe = ordersCollection.subscribe(() => {
      // Just refresh orders, no need to use the payload
      fetchOrders();
    });
    return () => unsubscribe();
  }, [fetchOrders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, refresh: fetchOrders, updateOrderStatus, deleteOrder };
};

export const useOrderStats = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    todayOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  const toNumber = (value: number | string): number => {
    if (typeof value === 'string') {
      return parseFloat(value) || 0;
    }
    return value || 0;
  };

  const fetchStats = useCallback(async () => {
    try {
      const response = await ordersCollection.list();
      const allOrders = response.documents.map((doc: any) => doc as unknown as Order);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayOrders = allOrders.filter(order => {
        const orderDate = new Date(order.created_at || '');
        return orderDate >= today;
      });

      const pendingOrders = allOrders.filter(order => order.status === 'pending');
      const completedOrders = allOrders.filter(order => order.status === 'success');
      const todayCompleted = todayOrders.filter(order => order.status === 'success');

      const totalRevenue = completedOrders.reduce((sum, order) => sum + toNumber(order.total_amount), 0);
      const todayRevenue = todayCompleted.reduce((sum, order) => sum + toNumber(order.total_amount), 0);

      setStats({
        totalOrders: allOrders.length,
        pendingOrders: pendingOrders.length,
        todayOrders: todayOrders.length,
        totalRevenue: totalRevenue,
        todayRevenue: todayRevenue,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const unsubscribe = ordersCollection.subscribe(() => {
      fetchStats();
    });
    return () => unsubscribe();
  }, [fetchStats]);

  return { stats, loading, refresh: fetchStats };
};