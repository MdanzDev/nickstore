import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, RefreshCw, Search, Sparkles, Package, Clock, CheckCircle, XCircle, AlertTriangle, TrendingUp } from 'lucide-react';
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
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import type { Order, OrderStatus } from '@/types';

const statusIcons = {
  pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  processing: { icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  success: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  cancelled: { icon: AlertTriangle, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
};

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { orders, loading, refresh, updateOrderStatus } = useAdminOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  // Debounced search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIsSearching(true);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      setSearchQuery(value);
      setIsSearching(false);
    }, 300);
    
    setSearchTimeout(timeout);
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        searchQuery === '' ||
        order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.game_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.user_game_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.user_email?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // Status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      pending: 0,
      processing: 0,
      success: 0,
      failed: 0,
      cancelled: 0,
    };
    orders.forEach(order => {
      counts[order.status] = (counts[order.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    await updateOrderStatus(orderId, status);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <AdminSidebar />

      <main className="lg:ml-64 min-h-screen">
        <div className="h-16 lg:hidden" />

        <div className="p-6">
          {/* Header with animations */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-slide-up">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center animate-pulse-slow">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">Orders</h1>
              </div>
              <p className="text-slate-400">Manage and track all orders</p>
            </div>
            <Button
              variant="outline"
              onClick={() => refresh()}
              disabled={loading}
              className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-300 hover:scale-105"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Filters with animations */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-in-up animation-delay-100">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 transition-all duration-300" />
              <Input
                placeholder="Search by order number, game name, game ID, or email..."
                onChange={handleSearchChange}
                className="pl-12 py-6 bg-slate-900/50 border-slate-700 text-white text-base rounded-xl transition-all duration-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
                </div>
              )}
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderStatus | 'all')}>
              <SelectTrigger className="w-full sm:w-48 bg-slate-900/50 border-slate-700 text-white rounded-xl transition-all duration-300 focus:border-violet-500">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="all">All Status ({orders.length})</SelectItem>
                <SelectItem value="pending">Pending ({statusCounts.pending})</SelectItem>
                <SelectItem value="processing">Processing ({statusCounts.processing})</SelectItem>
                <SelectItem value="success">Success ({statusCounts.success})</SelectItem>
                <SelectItem value="failed">Failed ({statusCounts.failed})</SelectItem>
                <SelectItem value="cancelled">Cancelled ({statusCounts.cancelled})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          {!loading && filteredOrders.length > 0 && (
            <div className="mb-4 text-sm text-slate-500 animate-fade-in-up animation-delay-200">
              Found {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
            </div>
          )}

          {/* Orders Table */}
          {loading ? (
            <div className="flex items-center justify-center py-20 animate-fade-in-up">
              <div className="relative">
                <LoadingSpinner size="lg" className="text-violet-500" />
                <div className="absolute inset-0 animate-ping rounded-full bg-violet-500/20" />
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden animate-fade-in-up animation-delay-300 hover:border-violet-500/30 transition-all duration-300">
              <OrderTable
                orders={filteredOrders}
                loading={loading}
                onViewOrder={handleViewOrder}
                onUpdateStatus={handleUpdateStatus}
              />
            </div>
          )}

          {/* Status Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-8 animate-fade-in-up animation-delay-400">
            {Object.entries(statusCounts).map(([status, count]) => {
              const { icon: Icon, color, bg, border } = statusIcons[status as OrderStatus];
              return (
                <div
                  key={status}
                  className={`${bg} ${border} border rounded-xl p-4 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                  <p className="text-2xl font-bold text-white">{count}</p>
                  <p className={`text-sm capitalize ${color}`}>{status}</p>
                </div>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 animate-fade-in-up animation-delay-500 hover:border-violet-500/30 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Completion Rate</p>
                  <p className="text-xl font-bold text-white">
                    {orders.length > 0 
                      ? ((orders.filter(o => o.status === 'success').length / orders.length) * 100).toFixed(1)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 animate-fade-in-up animation-delay-600 hover:border-violet-500/30 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Orders</p>
                  <p className="text-xl font-bold text-white">{orders.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 animate-fade-in-up animation-delay-700 hover:border-violet-500/30 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Pending Actions</p>
                  <p className="text-xl font-bold text-white">{statusCounts.pending + statusCounts.processing}</p>
                </div>
              </div>
            </div>
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
