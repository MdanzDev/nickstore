import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  TrendingUp,
  Clock,
  DollarSign,
  Package,
  Gamepad2,
  CreditCard,
  Users,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { StatCard } from '@/components/admin/StatCard';
import { OrderTable } from '@/components/admin/OrderTable';
import { useOrderStats, useAdminOrders } from '@/hooks/useOrders';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { stats, loading: statsLoading, refresh: refreshStats } = useOrderStats();
  const { orders, loading: ordersLoading, updateOrderStatus, refresh: refreshOrders } = useAdminOrders();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refreshStats(), refreshOrders()]);
    setIsRefreshing(false);
  };

  // Get recent orders (last 5)
  const recentOrders = orders.slice(0, 5);

  // Helper function to convert string to number
  const toNumber = (value: number | string): number => {
    if (typeof value === 'string') {
      return parseFloat(value) || 0;
    }
    return value || 0;
  };

  // Prepare chart data (last 7 days)
  const chartData = React.useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at || '');
        return orderDate.toDateString() === date.toDateString();
      });
      
      const revenue = dayOrders
        .filter(o => o.status === 'success')
        .reduce((sum, o) => sum + toNumber(o.total_amount), 0);
      
      data.push({
        name: dayName,
        orders: dayOrders.length,
        revenue: revenue,
      });
    }
    
    return data;
  }, [orders]);

  // Prepare status distribution for pie chart
  const statusData = React.useMemo(() => {
    const pending = orders.filter(o => o.status === 'pending').length;
    const success = orders.filter(o => o.status === 'success').length;
    const failed = orders.filter(o => o.status === 'failed').length;
    
    return [
      { name: 'Pending', value: pending, color: '#f59e0b' },
      { name: 'Success', value: success, color: '#10b981' },
      { name: 'Failed', value: failed, color: '#ef4444' },
    ];
  }, [orders]);



  // Calculate percentage change (mock data for demonstration)
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0,
    };
  };

  // Mock previous day stats (for demonstration)
  const previousStats = {
    totalOrders: stats.totalOrders - 3,
    pendingOrders: stats.pendingOrders - 1,
    todayOrders: stats.todayOrders - 2,
    todayRevenue: stats.todayRevenue - 150,
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-950">
      <AdminSidebar />
      
      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Mobile Header Spacer */}
        <div className="h-16 lg:hidden" />
        
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-slate-400 mt-1">Welcome back! Here's what's happening today.</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                disabled={isRefreshing}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={() => navigate('/admin/orders')}
                className="bg-violet-500 hover:bg-violet-600 text-white"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                View All Orders
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          {statsLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" className="text-violet-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Total Orders"
                value={stats.totalOrders}
                icon={<ShoppingCart className="w-6 h-6" />}
                change={calculateChange(stats.totalOrders, previousStats.totalOrders)}
              />
              <StatCard
                title="Pending Orders"
                value={stats.pendingOrders}
                icon={<Clock className="w-6 h-6" />}
                change={calculateChange(stats.pendingOrders, previousStats.pendingOrders)}
              />
              <StatCard
                title="Today's Orders"
                value={stats.todayOrders}
                icon={<TrendingUp className="w-6 h-6" />}
                change={calculateChange(stats.todayOrders, previousStats.todayOrders)}
              />
              <StatCard
                title="Today's Revenue"
                value={`RM ${stats.todayRevenue.toFixed(2)}`}
                icon={<DollarSign className="w-6 h-6" />}
                change={calculateChange(stats.todayRevenue, previousStats.todayRevenue)}
              />
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Orders Chart */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Orders (Last 7 Days)</h3>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>Daily trend</span>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(value: number) => [`${value} orders`, 'Orders']}
                    />
                    <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Revenue (Last 7 Days)</h3>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>RM</span>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(value: number) => [`RM ${value.toFixed(2)}`, 'Revenue']}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#d946ef"
                      strokeWidth={2}
                      dot={{ fill: '#d946ef', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Second Row Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Order Status Distribution */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Order Status Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${value} orders`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-slate-400">{item.name}</span>
                    <span className="text-sm font-medium text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-5 h-5 text-violet-400" />
                    <span className="text-xs text-slate-500">Unique customers</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {new Set(orders.map(o => o.user_email)).size}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Total customers</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="w-5 h-5 text-fuchsia-400" />
                    <span className="text-xs text-slate-500">Total products sold</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {orders.reduce((sum, o) => sum + toNumber(o.quantity), 0)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Across all orders</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs text-slate-500">Average order value</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    RM {(stats.totalRevenue / (stats.totalOrders || 1)).toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Per order average</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <span className="text-xs text-slate-500">Completion rate</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {stats.totalOrders > 0 
                      ? ((stats.totalOrders - stats.pendingOrders) / stats.totalOrders * 100).toFixed(1)
                      : 0}%
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Orders completed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
              <Button
                variant="ghost"
                onClick={() => navigate('/admin/orders')}
                className="text-slate-400 hover:text-white"
              >
                View All
              </Button>
            </div>
            <OrderTable
              orders={recentOrders}
              loading={ordersLoading}
              onViewOrder={() => {}}
              onUpdateStatus={updateOrderStatus}
            />
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <button
              onClick={() => navigate('/admin/games')}
              className="flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-violet-500/50 transition-all hover:scale-[1.02] text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                <Gamepad2 className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">Manage Games</h4>
                <p className="text-sm text-slate-400">Add or edit games</p>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/admin/products')}
              className="flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-fuchsia-500/50 transition-all hover:scale-[1.02] text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 flex items-center justify-center group-hover:bg-fuchsia-500/20 transition-colors">
                <Package className="w-6 h-6 text-fuchsia-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">Manage Products</h4>
                <p className="text-sm text-slate-400">Add denominations</p>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/admin/payment-methods')}
              className="flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-emerald-500/50 transition-all hover:scale-[1.02] text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                <CreditCard className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">Payment Methods</h4>
                <p className="text-sm text-slate-400">Configure payments</p>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;