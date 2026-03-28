import React, { useState, useMemo, useEffect } from 'react';
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
  Sparkles,
  Award,
} from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { StatCard } from '@/components/admin/StatCard';
import { OrderTable } from '@/components/admin/OrderTable';
import { useOrderStats, useAdminOrders } from '@/hooks/useOrders';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface ChartDataPoint {
  name: string;
  orders: number;
  revenue: number;
  trend: number;
}

interface StatusDataPoint {
  name: string;
  value: number;
  color: string;
  icon: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { stats, loading: statsLoading, refresh: refreshStats } = useOrderStats();
  const { orders, loading: ordersLoading, updateOrderStatus, refresh: refreshOrders } = useAdminOrders();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeChart, setActiveChart] = useState<'orders' | 'revenue'>('orders');
  const [animateNumbers, setAnimateNumbers] = useState(false);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  // Trigger number animation when stats load
  useEffect(() => {
    if (!statsLoading) {
      setAnimateNumbers(true);
      const timer = setTimeout(() => setAnimateNumbers(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [statsLoading]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refreshStats(), refreshOrders()]);
    setIsRefreshing(false);
  };

  const recentOrders = orders.slice(0, 5);

  const toNumber = (value: number | string): number => {
    if (typeof value === 'string') {
      return parseFloat(value) || 0;
    }
    return value || 0;
  };

  // Prepare chart data with trend indicators
  const chartData: ChartDataPoint[] = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result: ChartDataPoint[] = [];
    
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
      
      const previousOrders = i > 0 ? result[i - 1]?.orders || 0 : 0;
      
      result.push({
        name: dayName,
        orders: dayOrders.length,
        revenue: revenue,
        trend: dayOrders.length - previousOrders,
      });
    }
    
    return result;
  }, [orders]);

  // Status distribution
  const statusData: StatusDataPoint[] = useMemo(() => {
    const pending = orders.filter(o => o.status === 'pending').length;
    const success = orders.filter(o => o.status === 'success').length;
    const failed = orders.filter(o => o.status === 'failed').length;
    
    return [
      { name: 'Pending', value: pending, color: '#f59e0b', icon: '⏳' },
      { name: 'Success', value: success, color: '#10b981', icon: '✅' },
      { name: 'Failed', value: failed, color: '#ef4444', icon: '❌' },
    ];
  }, [orders]);

  // Calculate real percentage changes
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0,
    };
  };

  // Get previous period stats (7 days ago)
  const getPreviousStats = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const previousOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at || '');
      return orderDate < sevenDaysAgo;
    });
    
    return {
      totalOrders: previousOrders.length,
      pendingOrders: previousOrders.filter(o => o.status === 'pending').length,
      todayOrders: 0,
      todayRevenue: 0,
    };
  };

  const previousStats = getPreviousStats();

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
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              </div>
              <p className="text-slate-400">Welcome back! Here's what's happening today.</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                disabled={isRefreshing}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 transition-all duration-300 hover:scale-105"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={() => navigate('/admin/orders')}
                className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white transition-all duration-300 hover:scale-105 group"
              >
                <ShoppingCart className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
                View All Orders
              </Button>
            </div>
          </div>

          {/* Stats Grid with animations */}
          {statsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <LoadingSpinner size="lg" className="text-violet-500" />
                <div className="absolute inset-0 animate-ping rounded-full bg-violet-500/20" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="animate-fade-in-up animation-delay-100">
                <StatCard
                  title="Total Orders"
                  value={stats.totalOrders}
                  icon={<ShoppingCart className="w-6 h-6" />}
                  change={calculateChange(stats.totalOrders, previousStats.totalOrders)}
                />
              </div>
              <div className="animate-fade-in-up animation-delay-200">
                <StatCard
                  title="Pending Orders"
                  value={stats.pendingOrders}
                  icon={<Clock className="w-6 h-6" />}
                  change={calculateChange(stats.pendingOrders, previousStats.pendingOrders)}
                />
              </div>
              <div className="animate-fade-in-up animation-delay-300">
                <StatCard
                  title="Today's Orders"
                  value={stats.todayOrders}
                  icon={<TrendingUp className="w-6 h-6" />}
                  change={calculateChange(stats.todayOrders, previousStats.todayOrders)}
                />
              </div>
              <div className="animate-fade-in-up animation-delay-400">
                <StatCard
                  title="Today's Revenue"
                  value={`RM ${stats.todayRevenue.toFixed(2)}`}
                  icon={<DollarSign className="w-6 h-6" />}
                  change={calculateChange(stats.todayRevenue, previousStats.todayRevenue)}
                />
              </div>
            </div>
          )}

          {/* Chart Toggle */}
          <div className="flex gap-2 mb-4 animate-fade-in-up animation-delay-500">
            <Button
              variant={activeChart === 'orders' ? 'default' : 'outline'}
              onClick={() => setActiveChart('orders')}
              className={activeChart === 'orders' 
                ? 'bg-violet-500 hover:bg-violet-600' 
                : 'border-slate-700 text-slate-300 hover:bg-slate-800'
              }
            >
              Orders
            </Button>
            <Button
              variant={activeChart === 'revenue' ? 'default' : 'outline'}
              onClick={() => setActiveChart('revenue')}
              className={activeChart === 'revenue' 
                ? 'bg-violet-500 hover:bg-violet-600' 
                : 'border-slate-700 text-slate-300 hover:bg-slate-800'
              }
            >
              Revenue
            </Button>
          </div>

          {/* Main Chart */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8 animate-fade-in-up animation-delay-600 hover:border-violet-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {activeChart === 'orders' ? 'Orders' : 'Revenue'} (Last 7 Days)
              </h3>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>Daily trend</span>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={activeChart === 'orders' ? '#8b5cf6' : '#d946ef'} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={activeChart === 'orders' ? '#8b5cf6' : '#d946ef'} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
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
                    formatter={(value: number) => 
                      activeChart === 'orders' 
                        ? [`${value} orders`, 'Orders']
                        : [`RM ${value.toFixed(2)}`, 'Revenue']
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey={activeChart === 'orders' ? 'orders' : 'revenue'}
                    stroke={activeChart === 'orders' ? '#8b5cf6' : '#d946ef'}
                    strokeWidth={2}
                    fill="url(#gradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Second Row Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Order Status Distribution */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 animate-fade-in-up animation-delay-700 hover:border-violet-500/30 transition-all duration-300">
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
                      animationBegin={0}
                      animationDuration={1000}
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
                  <div key={item.name} className="flex items-center gap-2 transition-all duration-300 hover:scale-105">
                    <div className="w-3 h-3 rounded-full animate-pulse-slow" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-slate-400">{item.name}</span>
                    <span className="text-sm font-medium text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats with icons */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 lg:col-span-2 animate-fade-in-up animation-delay-800 hover:border-violet-500/30 transition-all duration-300">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4 transition-all duration-300 hover:bg-slate-800/70 hover:scale-[1.02]">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-5 h-5 text-violet-400 animate-pulse-slow" />
                    <span className="text-xs text-slate-500">Unique customers</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {new Set(orders.map(o => o.user_email)).size}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Total customers</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 transition-all duration-300 hover:bg-slate-800/70 hover:scale-[1.02]">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="w-5 h-5 text-fuchsia-400 animate-pulse-slow" />
                    <span className="text-xs text-slate-500">Total products sold</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {orders.reduce((sum, o) => sum + toNumber(o.quantity), 0)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Across all orders</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 transition-all duration-300 hover:bg-slate-800/70 hover:scale-[1.02]">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-5 h-5 text-emerald-400 animate-pulse-slow" />
                    <span className="text-xs text-slate-500">Average order value</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    RM {(stats.totalRevenue / (stats.totalOrders || 1)).toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Per order average</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 transition-all duration-300 hover:bg-slate-800/70 hover:scale-[1.02]">
                  <div className="flex items-center justify-between mb-2">
                    <Award className="w-5 h-5 text-amber-400 animate-pulse-slow" />
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
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden animate-fade-in-up animation-delay-900">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
              <Button
                variant="ghost"
                onClick={() => navigate('/admin/orders')}
                className="text-slate-400 hover:text-white transition-all duration-300 hover:translate-x-1"
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
              className="group flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-violet-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-left animate-fade-in-up animation-delay-1000"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-all duration-300 group-hover:scale-110">
                <Gamepad2 className="w-6 h-6 text-violet-400 transition-transform group-hover:rotate-12" />
              </div>
              <div>
                <h4 className="font-medium text-white group-hover:text-violet-400 transition-colors">Manage Games</h4>
                <p className="text-sm text-slate-400">Add or edit games</p>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/admin/products')}
              className="group flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-fuchsia-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-left animate-fade-in-up animation-delay-1100"
            >
              <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 flex items-center justify-center group-hover:bg-fuchsia-500/20 transition-all duration-300 group-hover:scale-110">
                <Package className="w-6 h-6 text-fuchsia-400 transition-transform group-hover:rotate-12" />
              </div>
              <div>
                <h4 className="font-medium text-white group-hover:text-fuchsia-400 transition-colors">Manage Products</h4>
                <p className="text-sm text-slate-400">Add denominations</p>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/admin/payment-methods')}
              className="group flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-left animate-fade-in-up animation-delay-1200"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all duration-300 group-hover:scale-110">
                <CreditCard className="w-6 h-6 text-emerald-400 transition-transform group-hover:rotate-12" />
              </div>
              <div>
                <h4 className="font-medium text-white group-hover:text-emerald-400 transition-colors">Payment Methods</h4>
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
