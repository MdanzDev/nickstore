import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, RefreshCw, Search } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { OrderTable } from '@/components/admin/OrderTable';
import { OrderDetailModal } from '@/components/admin/OrderDetailModal';
import { useAdminOrders } from '@/hooks/useOrders';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Order, OrderStatus } from '@/types';

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { orders, loading, refresh, updateOrderStatus } = useAdminOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === '' ||
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.game_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user_game_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    await updateOrderStatus(orderId, status);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-950">
      <AdminSidebar />

      <main className="lg:ml-64 min-h-screen">
        <div className="h-16 lg:hidden" />

        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Orders</h1>
              <p className="text-slate-400 mt-1">Manage and track all orders</p>
            </div>
            <Button
              variant="outline"
              onClick={() => refresh()}
              disabled={loading}
              className="border-slate-700 text-slate-300 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-900/50 border-slate-700 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderStatus | 'all')}>
              <SelectTrigger className="w-full sm:w-48 bg-slate-900/50 border-slate-700 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders Table */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
            <OrderTable
              orders={filteredOrders}
              loading={loading}
              onViewOrder={handleViewOrder}
              onUpdateStatus={handleUpdateStatus}
            />
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6">
            {(['pending', 'processing', 'success', 'failed', 'cancelled'] as OrderStatus[]).map(
              (status) => {
                const count = orders.filter((o) => o.status === status).length;
                return (
                  <div
                    key={status}
                    className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 text-center"
                  >
                    <p className="text-2xl font-bold text-white">{count}</p>
                    <p className="text-sm text-slate-400 capitalize">{status}</p>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </main>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

export default Orders;
