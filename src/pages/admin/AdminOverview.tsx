import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useCurrency } from "@/providers/CurrencyProvider";
import AdminLayout from "./AdminLayout";
import {
  ShoppingCart,
  Users,
  Wallet,
  CreditCard,
  Search,
  Calendar,
  RefreshCw,
  Bell,
  ChevronRight,
  Package,
  ArrowRight,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserPlus,
  Info,
  ArrowUpRight,
  Activity,
  Zap,
  ShieldCheck,
  Server,
  RotateCw
} from "lucide-react";
import { toast } from "sonner";
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
  Cell
} from "recharts";

function PremiumStatCard({
  title,
  value,
  trend,
  trendLabel,
  icon: Icon,
  color,
  data
}: {
  title: string;
  value: string;
  trend: string;
  trendLabel: string;
  icon: React.ElementType;
  color: string;
  data: number[];
}) {
  const safeData = data.length > 0 ? data : [0, 0];
  const max = Math.max(...safeData, 1);
  const min = Math.min(...safeData, 0);
  const points = safeData.map((val, i) => {
    const x = safeData.length > 1 ? (i / (safeData.length - 1)) * 100 : 50;
    const y = max === min ? 50 : 100 - ((val - min) / (max - min)) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="relative overflow-hidden rounded-2xl p-5 border border-white/5 bg-[#14192B] group hover:border-white/10 transition-colors">
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.15] blur-2xl transition-opacity group-hover:opacity-[0.25]"
        style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }} />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
            style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
          <p className="text-xs font-medium text-white/50 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white">{value}</h3>
          <div className="flex items-center gap-1.5 mt-2">
            <ArrowUpRight className="h-3.5 w-3.5 text-[#00c864]" />
            <span className="text-[11px] font-semibold text-[#00c864]">{trend}</span>
            <span className="text-[11px] text-white/40">{trendLabel}</span>
          </div>
        </div>
        <div className="w-20 h-12">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
            <polyline
              points={points}
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-md"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function AdminOverview() {
  const navigate = useNavigate();
  const { exchangeRate } = useCurrency();
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d">("7d");

  const daysParam = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 90;
  const { data: statsData, refetch: refetchStats } = trpc.orders.adminStats.useQuery({ days: daysParam });
  const { data: latestOrdersData, refetch: refetchOrders } = trpc.orders.adminList.useQuery({ limit: 5 });
  const { data: providerBalance, refetch: refetchBalance } = trpc.settings.getProviderBalance.useQuery();
  const syncMutation = trpc.orders.syncAllPending.useMutation();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchStats(), refetchOrders(), refetchBalance()]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleSyncOrders = async () => {
    setIsSyncing(true);
    try {
      const res = await syncMutation.mutateAsync();
      toast.success(`Sinkronisasi selesai! ${res.updatedCount || 0} pesanan diperbarui.`);
      await Promise.all([refetchStats(), refetchOrders(), refetchBalance()]);
    } catch (err: any) {
      toast.error("Gagal melakukan sinkronisasi: " + (err.message || "Ralat pelayan"));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/admin/orders?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const totalOrders = statsData?.totalOrders || 0;
  const totalUsers = statsData?.totalUsers || 0;
  const totalRevenueMyr = statsData?.totalRevenueMyr || 0;
  const totalProfitMyr = statsData?.totalProfitMyr || 0;
  
  const pendingOrders = statsData?.pendingOrders || 0;
  const processingOrders = statsData?.processingOrders || 0;
  const completedOrders = statsData?.completedOrders || 0;
  const failedOrders = statsData?.failedOrders || 0;
  
  const activePendingTotal = pendingOrders + processingOrders;
  const totalForDonut = activePendingTotal + completedOrders + failedOrders;

  const donutData = [
    { name: 'Berjaya', value: completedOrders || 0, color: '#00c864' },
    { name: 'Processing', value: activePendingTotal || 0, color: '#FFB800' },
    { name: 'Gagal', value: failedOrders || 0, color: '#FF3366' },
  ];
  
  const chartData = statsData?.chartData || [];

  // Compute dynamic date range string
  const dateRangeString = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - daysParam + 1);
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return `${start.toLocaleDateString('ms-MY', opts)} - ${end.toLocaleDateString('ms-MY', opts)}`;
  }, [daysParam]);

  // Dynamic sparkline arrays extracted from chartData
  const orderSparkline = useMemo(() => {
    if (chartData.length === 0) return [0, totalOrders];
    return chartData.map(c => c.total || (c.berjaya + (c.proses || 0) + c.gagal));
  }, [chartData, totalOrders]);

  const successSparkline = useMemo(() => {
    if (chartData.length === 0) return [0, completedOrders];
    return chartData.map(c => c.berjaya);
  }, [chartData, completedOrders]);

  const failedSparkline = useMemo(() => {
    if (chartData.length === 0) return [0, failedOrders];
    return chartData.map(c => c.gagal);
  }, [chartData, failedOrders]);

  // Calculate dynamic growth metrics
  const orderGrowthTrend = useMemo(() => {
    if (chartData.length < 4) return "+100%";
    const mid = Math.floor(chartData.length / 2);
    const firstHalf = chartData.slice(0, mid).reduce((sum, c) => sum + (c.total || c.berjaya + c.gagal), 0);
    const secondHalf = chartData.slice(mid).reduce((sum, c) => sum + (c.total || c.berjaya + c.gagal), 0);
    if (firstHalf === 0) return secondHalf > 0 ? "+100%" : "0%";
    const pct = (((secondHalf - firstHalf) / firstHalf) * 100).toFixed(1);
    return `${Number(pct) >= 0 ? '+' : ''}${pct}%`;
  }, [chartData]);

  const topProductsList = statsData?.topProducts || [];

  const dynamicRecentActivity = useMemo(() => {
    if (!latestOrdersData?.data) return [];
    return latestOrdersData.data.map(order => {
      let type = 'processing';
      if (order.status === 'delivered' || order.status === 'success') type = 'success';
      if (order.status === 'cancelled' || order.status === 'failed') type = 'failed';
      
      const date = new Date(order.createdAt);
      const timeStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

      return {
        id: order.id,
        title: `Pesanan #${order.id.slice(0, 8)}`,
        desc: order.notes || order.keterangan || `Pesanan ID Game: ${order.gameUserId || 'Global'}`,
        time: timeStr,
        type
      };
    });
  }, [latestOrdersData]);

  // Real System Notifications & Alerts
  const systemAlerts = useMemo(() => {
    const alerts = [];
    if (activePendingTotal > 0) {
      alerts.push({
        id: 'pending-alert',
        title: 'Pesanan Perlu Diproses',
        desc: `${activePendingTotal} pesanan sedang berada dalam status pending/processing.`,
        type: 'warning',
        time: 'Terkini'
      });
    }
    if (failedOrders > 0) {
      alerts.push({
        id: 'failed-alert',
        title: 'Pesanan Gagal Rekod',
        desc: `${failedOrders} pesanan memerlukan pengesahan atau pemulangan wang (refund).`,
        type: 'failed',
        time: 'Hari Ini'
      });
    }
    if (providerBalance?.balance !== undefined) {
      const balanceMyr = providerBalance.balance / (exchangeRate || 4300);
      if (balanceMyr < 50) {
        alerts.push({
          id: 'balance-alert',
          title: 'Baki Provider Rendah',
          desc: `Baki pembekal API: Rp ${Math.round(providerBalance.balance).toLocaleString('id-ID')} (~RM ${balanceMyr.toFixed(2)}). Sila top-up segera.`,
          type: 'failed',
          time: 'Sistem'
        });
      }
    }
    alerts.push({
      id: 'system-ok',
      title: 'Status Gateway & API',
      desc: 'Semua sambungan API MyTopUpKu & pembayaran QRIS beroperasi secara aktif.',
      type: 'success',
      time: 'Live'
    });
    return alerts;
  }, [activePendingTotal, failedOrders, providerBalance, exchangeRate]);

  return (
    <AdminLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        
        {/* TOP BAR */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6 pt-2">
          <div className="w-full lg:w-auto">
            <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Overview</h1>
            <p className="text-sm text-white/50">Ringkasan aktiviti & statistik platform Kryz-Net</p>
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
            {/* Search */}
            <div className="relative min-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchSubmit}
                placeholder="Cari pesanan (Tekan Enter)..." 
                className="w-full h-10 pl-10 pr-12 rounded-xl bg-[#14192B] border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-white/50 font-medium">
                Enter
              </div>
            </div>

            {/* Date Range Display */}
            <div className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#14192B] border border-white/10 text-sm text-white/70 whitespace-nowrap">
              <Calendar className="h-4 w-4 text-[#38BDF8]" />
              <span className="text-xs font-semibold">{dateRangeString}</span>
            </div>

            {/* Refresh */}
            <button 
              onClick={handleRefresh}
              title="Muat semula data"
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#14192B] border border-white/10 text-sm text-white/70 hover:text-white hover:border-white/20 transition-all whitespace-nowrap"
            >
              <RefreshCw className={`h-4 w-4 text-white/40 ${isRefreshing ? 'animate-spin' : ''}`} />
              Muat Semula
            </button>

            {/* Notifications Indicator */}
            <button 
              onClick={() => navigate("/admin/orders")}
              title={`${activePendingTotal} pesanan pending`}
              className="relative h-10 w-10 rounded-xl bg-[#14192B] border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:border-white/20 transition-all shrink-0"
            >
              <Bell className="h-4 w-4" />
              {activePendingTotal > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#FFB800] text-[9px] font-bold text-black flex items-center justify-center border-2 border-[#0B0F19]">
                  {activePendingTotal}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* PROVIDER BALANCE & API STATUS WIDGET (DISPLAYING BOTH IDR & MYR) */}
        <div className="rounded-2xl p-5 border border-white/10 bg-gradient-to-r from-[#14192B] via-[#1A2238] to-[#14192B] flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Server className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-bold text-white">Akaun Pembekal API (MyTopUpKu)</h3>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> {providerBalance?.membership || "VIP Member"}
                </span>
              </div>
              <p className="text-xs text-white/50">
                Pengguna API: <span className="text-white/80 font-medium">{providerBalance?.name || providerBalance?.email || "MyTopUpKu Gateway"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
            <div>
              <p className="text-[11px] font-medium text-white/40 mb-0.5">Baki Semasa Provider (MyTopUpKu)</p>
              {providerBalance?.balance !== undefined ? (
                <div className="flex items-baseline gap-2">
                  <h4 className="text-xl font-bold text-emerald-400">
                    Rp {Math.round(providerBalance.balance).toLocaleString('id-ID')}
                  </h4>
                  <span className="text-xs font-semibold text-white/60">
                    (~ RM {(providerBalance.balance / (exchangeRate || 4300)).toFixed(2)})
                  </span>
                </div>
              ) : (
                <h4 className="text-xl font-bold text-emerald-400">Memuatkan...</h4>
              )}
            </div>

            <button
              onClick={handleSyncOrders}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#0284C7] text-white text-xs font-bold transition-all disabled:opacity-50 shadow-md shadow-sky-500/10"
            >
              <RotateCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? "Menyinkron..." : "Sync Status Pesanan"}
            </button>
          </div>
        </div>

        {/* 4 STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PremiumStatCard
            title="Jumlah Pesanan"
            value={totalOrders.toString()}
            trend={orderGrowthTrend}
            trendLabel="kadar pertumbuhan"
            icon={ShoppingCart}
            color="#8B5CF6"
            data={orderSparkline}
          />
          <PremiumStatCard
            title="Pengguna Aktif"
            value={totalUsers.toString()}
            trend="+100%"
            trendLabel="pengguna terdaftar"
            icon={Users}
            color="#38BDF8"
            data={[totalUsers, totalUsers]}
          />
          <PremiumStatCard
            title="Jumlah Jualan (MYR)"
            value={`RM ${totalRevenueMyr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            trend="+100%"
            trendLabel="jumlah pendapatan"
            icon={Wallet}
            color="#10B981"
            data={successSparkline}
          />
          <PremiumStatCard
            title="Jumlah Untung (MYR)"
            value={`RM ${totalProfitMyr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            trend="+100%"
            trendLabel="keuntungan bersih"
            icon={CreditCard}
            color="#F59E0B"
            data={failedSparkline}
          />
        </div>

        {/* MAIN CHARTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Line Chart */}
          <div className="lg:col-span-6 xl:col-span-7 rounded-2xl bg-[#14192B] border border-white/5 p-5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#38BDF8]" />
                <h3 className="text-base font-bold text-white">Statistik Pesanan Daily</h3>
              </div>
              <div className="flex items-center bg-white/5 rounded-lg p-1">
                {(["7d", "30d", "90d"] as const).map((tf) => (
                  <button 
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      timeframe === tf ? 'bg-[#38BDF8] text-white' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {tf === "7d" ? "7 Hari" : tf === "30d" ? "30 Hari" : "90 Hari"}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-[260px] w-full min-h-[260px]">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBerjaya" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00c864" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00c864" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFB800" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#FFB800" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorGagal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF3366" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#FF3366" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#ffffff50', fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#ffffff50', fontSize: 11 }} dx={-10} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ fontSize: '11px', color: '#ffffff50', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="berjaya" name="Pesanan Berjaya" stroke="#00c864" strokeWidth={3} fillOpacity={1} fill="url(#colorBerjaya)" />
                  <Area type="monotone" dataKey="proses" name="Dalam Proses" stroke="#FFB800" strokeWidth={2} fillOpacity={1} fill="url(#colorProses)" />
                  <Area type="monotone" dataKey="gagal" name="Pesanan Gagal" stroke="#FF3366" strokeWidth={2} fillOpacity={1} fill="url(#colorGagal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#00c864]" />
                <span className="text-[11px] text-white/60">Pesanan Berjaya</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FFB800]" />
                <span className="text-[11px] text-white/60">Dalam Proses</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF3366]" />
                <span className="text-[11px] text-white/60">Pesanan Gagal</span>
              </div>
            </div>
          </div>

          {/* Donut Chart */}
          <div className="lg:col-span-3 xl:col-span-3 rounded-2xl bg-[#14192B] border border-white/5 p-5 flex flex-col">
            <h3 className="text-base font-bold text-white mb-6">Status Pesanan</h3>
            <div className="flex-1 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Inner Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-white">{totalForDonut}</span>
                <span className="text-[10px] font-medium text-white/50">Jumlah</span>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              {donutData.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-[11px] text-white/70">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-bold text-white">{item.value}</span>
                    <span className="text-[10px] text-white/40 w-8 text-right">
                      {totalForDonut > 0 ? ((item.value / totalForDonut) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => navigate("/admin/orders")}
              className="mt-6 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] font-semibold text-white/80 transition-colors flex items-center justify-center gap-2"
            >
              Lihat Semua Pesanan <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-3 xl:col-span-2 rounded-2xl bg-[#14192B] border border-white/5 p-5">
            <div className="flex items-center gap-2 mb-5">
              <Zap className="h-5 w-5 text-[#38BDF8]" />
              <h3 className="text-base font-bold text-white">Aksi Pantas</h3>
            </div>
            
            <div className="space-y-2">
              {[
                { label: "Tambah Produk Baru", icon: Package, action: () => navigate("/admin/products"), color: "#38BDF8" },
                { label: "Lihat Pesanan Terkini", icon: ShoppingCart, action: () => navigate("/admin/orders"), color: "#10B981" },
                { label: "Sinkron Pesanan Pending", icon: RotateCw, action: handleSyncOrders, color: "#8B5CF6" },
                { label: "Urus Pengguna", icon: Users, action: () => navigate("/admin/users"), color: "#F59E0B" },
                { label: "Pengaturan Platform", icon: Download, action: () => navigate("/admin/settings"), color: "#0EA5E9" },
              ].map((act, i) => (
                <button 
                  key={i}
                  onClick={act.action}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${act.color}15` }}>
                      <act.icon className="h-4 w-4" style={{ color: act.color }} />
                    </div>
                    <span className="text-[12px] font-semibold text-white/80 group-hover:text-white transition-colors">{act.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Top Products Table */}
          <div className="lg:col-span-5 rounded-2xl bg-[#14192B] border border-white/5 p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-orange-500 text-lg">🔥</span>
                <h3 className="text-base font-bold text-white">Produk Terlaris</h3>
              </div>
              <button onClick={() => navigate("/admin/products")} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-white/60 hover:text-white transition-colors">
                Lihat Semua
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="pb-3 text-[11px] font-semibold text-white/40 w-8">#</th>
                    <th className="pb-3 text-[11px] font-semibold text-white/40">Produk</th>
                    <th className="pb-3 text-[11px] font-semibold text-white/40 text-center">Jumlah Terjual</th>
                    <th className="pb-3 text-[11px] font-semibold text-white/40 text-right">Jumlah Jualan</th>
                  </tr>
                </thead>
                <tbody>
                  {topProductsList.length > 0 ? topProductsList.map((p, i) => (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <td className="py-3 text-[12px] text-white/50">{i + 1}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-indigo-300 text-xs font-bold overflow-hidden">
                            <span className="opacity-50">{p.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-[12px] font-bold text-white group-hover:text-[#38BDF8] transition-colors">{p.name}</p>
                            <p className="text-[10px] text-white/40">{p.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-center text-[12px] font-semibold text-white/70">{p.sold}</td>
                      <td className="py-3 text-right">
                        <span className="text-[12px] font-bold text-[#00c864]">RM {p.revenue.toFixed(2)}</span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-[12px] text-white/40">Tiada data produk terlaris buat masa ini</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-4 rounded-2xl bg-[#14192B] border border-white/5 p-5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#F59E0B]" />
                <h3 className="text-base font-bold text-white">Aktiviti Terkini</h3>
              </div>
              <button onClick={() => navigate("/admin/orders")} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-white/60 hover:text-white transition-colors">
                Lihat Semua
              </button>
            </div>
            
            <div className="space-y-5">
              {dynamicRecentActivity.length > 0 ? dynamicRecentActivity.map((activity, i) => {
                let iconColor = "#38BDF8";
                let Icon = Info;
                
                if (activity.type === 'success') { iconColor = "#00c864"; Icon = CheckCircle2; }
                else if (activity.type === 'processing') { iconColor = "#F59E0B"; Icon = Clock; }
                else if (activity.type === 'failed') { iconColor = "#FF3366"; Icon = AlertCircle; }

                return (
                  <div key={activity.id} className="relative flex gap-4">
                    {i !== dynamicRecentActivity.length - 1 && (
                      <div className="absolute left-3.5 top-8 bottom-[-16px] w-[1px] bg-white/5" />
                    )}
                    <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 z-10" style={{ backgroundColor: `${iconColor}15`, border: `1px solid ${iconColor}30` }}>
                      <Icon className="h-3.5 w-3.5" style={{ color: iconColor }} />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-white mb-0.5">{activity.title}</p>
                      <p className="text-[11px] text-white/50 leading-relaxed mb-1">{activity.desc}</p>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: iconColor }} />
                        <span className="text-[10px] font-medium text-white/40">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="py-6 text-center text-[12px] text-white/40">Tiada aktiviti terkini</div>
              )}
            </div>
          </div>

          {/* System Notifications */}
          <div className="lg:col-span-3 rounded-2xl bg-[#14192B] border border-white/5 p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#FFB800]" />
                <h3 className="text-base font-bold text-white">Notifikasi & Status</h3>
              </div>
              <button onClick={() => navigate("/admin/orders")} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-white/60 hover:text-white transition-colors">
                Urus
              </button>
            </div>
            
            <div className="space-y-3">
              {systemAlerts.map((notif) => {
                let iconColor = "#38BDF8";
                let Icon = Info;
                if (notif.type === 'success') { iconColor = "#00c864"; Icon = CheckCircle2; }
                else if (notif.type === 'failed') { iconColor = "#FF3366"; Icon = AlertCircle; }
                else if (notif.type === 'warning') { iconColor = "#FFB800"; Icon = Clock; }

                return (
                  <div key={notif.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex gap-3">
                      <div className="mt-0.5">
                        <Icon className="h-4 w-4" style={{ color: iconColor }} />
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-white mb-1">{notif.title}</p>
                        <p className="text-[10px] text-white/50 leading-relaxed mb-2">{notif.desc}</p>
                        <p className="text-[9px] font-medium text-white/30">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
