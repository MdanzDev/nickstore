import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useCurrency } from "@/providers/CurrencyProvider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import UserDashboardLayout from "./UserDashboardLayout";
import {
  Wallet,
  Receipt,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Zap,
  ArrowRight,
  TrendingUp,
  Users,
  Gift,
  Star,
  Sparkles,
  ChevronRight,
  AlertCircle,
  ArrowUpRight,
  History,
  CreditCard,
  RefreshCw,
  Eye,
  Copy,
  Check,
  ShoppingCart,
  Crown,
  Target,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const QUICK_ACTIONS = [
  { 
    label: "Top Up Saldo", 
    icon: Wallet, 
    path: "/deposit", 
    color: "from-emerald-500 to-green-600",
    badge: "Instan"
  },
  { 
    label: "Beli Produk", 
    icon: ShoppingCart, 
    path: "/products", 
    color: "from-primary to-amber-500",
    badge: "73 Game"
  },
  { 
    label: "Riwayat", 
    icon: History, 
    path: "/dashboard/transactions", 
    color: "from-blue-500 to-cyan-500",
    badge: "Lihat"
  },
  { 
    label: "API & Dev", 
    icon: Zap, 
    path: "/dashboard/api", 
    color: "from-purple-500 to-pink-500",
    badge: "Docs"
  },
];

/* ─────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────── */
function DashboardSkeleton() {
  return (
    <UserDashboardLayout>
      <div className="space-y-6 animate-pulse">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </UserDashboardLayout>
  );
}

/* ─────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────── */
function StatCard({ 
  icon, 
  label, 
  value, 
  color = "text-white",
  bgColor = "bg-white/[0.02]",
  trend,
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: number; 
  color?: string;
  bgColor?: string;
  trend?: "up" | "down" | null;
}) {
  return (
    <div className={`p-5 text-center hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,107,0,0.1)] ${bgColor} border border-white/10 rounded-2xl`}>
      <div className={`${color} mb-3 flex justify-center`}>{icon}</div>
      <p className="text-2xl font-black text-white">{value}</p>
      <div className="flex items-center justify-center gap-1.5 mt-2">
        <p className="text-[9px] font-black uppercase tracking-widest text-white/50">{label}</p>
        {trend === "up" && <TrendingUp className="h-3 w-3 text-emerald-400" />}
        {trend === "down" && <TrendingUp className="h-3 w-3 text-red-400 rotate-180" />}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const config = useMemo(() => {
    switch (status?.toLowerCase()) {
      case "success":
      case "sukses":
      case "completed":
      case "delivered":
        return { 
          label: "Success", 
          className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]",
          icon: CheckCircle
        };
      case "pending":
        return { 
          label: "Pending", 
          className: "bg-[#D946EF]/10 text-[#D946EF] border-[#D946EF]/20 shadow-[0_0_10px_rgba(255,184,0,0.1)]",
          icon: Clock
        };
      case "processing":
      case "confirmed":
      case "shipped":
        return { 
          label: "Processing", 
          className: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]",
          icon: Zap
        };
      case "failed":
      case "cancelled":
        return { 
          label: "Failed", 
          className: "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(248,113,113,0.1)]",
          icon: XCircle
        };
      case "refund":
        return { 
          label: "Refund", 
          className: "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20 shadow-[0_0_10px_rgba(255,107,0,0.1)]",
          icon: AlertCircle
        };
      default:
        return { 
          label: status || "Unknown", 
          className: "bg-white/5 text-white/50 border-white/10",
          icon: AlertCircle
        };
    }
  }, [status]);

  const StatusIcon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[9px] font-black uppercase tracking-widest ${config.className}`}>
      <StatusIcon className="h-3 w-3" />
      {config.label}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function UserDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Queries
  const { data: ordersData, isLoading: ordersLoading } = trpc.orders.list.useQuery({ limit: 5 });
  const { data: ramsData, isLoading: balanceLoading } = trpc.rams.balance.useQuery();

  const isLoading = ordersLoading || balanceLoading;

  // Data extraction
  const orders = useMemo(() => ordersData?.data || [], [ordersData]);
  const liveBalanceMyr = ramsData?.data?.balance_myr ?? (user as any)?.balanceMyr ?? 0;
  const liveBalanceIdr = ramsData?.data?.balance_idr ?? (user as any)?.balanceIdr ?? 0;
  const formattedBalance = formatPrice(liveBalanceMyr, liveBalanceIdr);

  // Stats calculation
  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((o: any) => o.status === "pending").length,
    processing: orders.filter((o: any) => ["confirmed", "shipped", "processing"].includes(o.status)).length,
    success: orders.filter((o: any) => ["delivered", "completed", "success"].includes(o.status)).length,
    failed: orders.filter((o: any) => ["cancelled", "failed", "refund"].includes(o.status)).length,
  }), [orders]);

  // User role badge
  const roleBadge = useMemo(() => {
    const role = (user as any)?.roles?.[0] || "customer";
    
    switch (role?.toLowerCase()) {
      case "admin":
        return {
          label: "Admin",
          className: "bg-gradient-to-r from-rose-500 to-red-600 text-white border-none shadow-[0_0_15px_rgba(225,29,72,0.4)]",
          icon: Crown,
        };
      case "business":
        return {
          label: "Business Partner",
          className: "bg-gradient-to-r from-emerald-400 to-green-500 text-black border-none shadow-[0_0_15px_rgba(52,211,153,0.3)]",
          icon: Star,
        };
      case "platinum":
        return {
          label: "Platinum Partner",
          className: "bg-gradient-to-r from-cyan-400 to-blue-500 text-black border-none shadow-[0_0_15px_rgba(34,211,238,0.3)]",
          icon: Sparkles,
        };
      case "gold":
        return {
          label: "Gold Partner",
          className: "bg-gradient-to-r from-[#D946EF] to-[#8B5CF6] text-black border-none shadow-[0_0_15px_rgba(255,107,0,0.3)]",
          icon: Star,
        };
      default:
        return {
          label: "Customer",
          className: "bg-white/10 text-white/70 border-white/20",
          icon: Users,
        };
    }
  }, [user]);

  // Handlers
  const handleCopy = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      toast.success("Berhasil disalin!");
    } catch {
      toast.error("Gagal menyalin");
    }
  }, []);

  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const RoleIcon = roleBadge.icon;

  return (
    <UserDashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-white">Dashboard</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mt-1">
              Selamat datang kembali,{" "}
              <span className="text-[#D946EF]">{user?.name || "User"}</span>
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="border-white/10 hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/10 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            <span className="text-[10px] font-black uppercase tracking-widest">Refresh</span>
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-500 delay-100">
          {QUICK_ACTIONS.map((action, i) => (
            <button
              key={i}
              className="p-5 flex flex-col items-center gap-3 rounded-2xl bg-[#0B0A10]/80 border border-white/10 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.15)] group hover:border-[#8B5CF6]/30"
              onClick={() => navigate(action.path)}
            >
              <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white group-hover:text-[#D946EF] transition-colors">{action.label}</span>
              <div className="text-[8px] font-black uppercase tracking-widest text-white/40 bg-white/5 px-2 py-0.5 rounded">
                {action.badge}
              </div>
            </button>
          ))}
        </div>

        {/* Balance & Profile */}
        <div className="grid md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-left-4 duration-500 delay-150">
          {/* Profile Card */}
          <div className="p-6 rounded-2xl bg-[#0B0A10]/80 border border-white/10 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.1)]">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#D946EF] flex items-center justify-center shadow-[0_0_20px_rgba(255,107,0,0.3)]">
                  <span className="text-2xl font-black text-black">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div className="absolute -bottom-2 -right-2 h-6 w-6 rounded-xl bg-emerald-400 flex items-center justify-center shadow-[0_0_10px_rgba(52,211,153,0.5)] border-2 border-[#0B0A10]">
                  <Check className="h-3.5 w-3.5 text-black" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-xl text-white uppercase tracking-tight truncate">{user?.name || "User"}</p>
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest truncate mt-0.5">
                  {(user as any)?.email || "user@email.com"}
                </p>
                <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded border text-[9px] font-black uppercase tracking-widest ${roleBadge.className}`}>
                  <RoleIcon className="h-3 w-3" />
                  {roleBadge.label}
                </div>
              </div>
            </div>
          </div>

          {/* Balance Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0B0A10]/80 to-[#1a1310]/80 border border-[#8B5CF6]/20 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex items-center shadow-[0_0_30px_rgba(255,107,0,0.15)] group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#8B5CF6]/10 rounded-full blur-2xl group-hover:bg-[#8B5CF6]/20 transition-colors" />
            <div className="absolute bottom-0 right-10 w-24 h-24 bg-[#D946EF]/10 rounded-full blur-xl translate-y-1/2" />
            
            <div className="relative z-10 w-full flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-[#D946EF] uppercase tracking-widest flex items-center gap-2">
                  <Wallet className="h-3.5 w-3.5" /> 
                  Saldo Akun
                </p>
                <p className="text-3xl lg:text-5xl font-black text-white mt-2 tracking-tight">
                  {formattedBalance}
                </p>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-2">
                  Tersedia untuk transaksi
                </p>
              </div>
              
              <div className="hidden sm:flex h-20 w-20 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#D946EF] items-center justify-center shadow-[0_0_20px_rgba(255,107,0,0.3)] group-hover:scale-110 transition-transform duration-500">
                <Wallet className="h-10 w-10 text-black" />
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Stats */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Target className="h-4 w-4 text-[#D946EF]" />
              Ringkasan Transaksi
            </h2>
            <div className="px-3 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/60 flex items-center">
              <Clock className="h-3 w-3 mr-1.5 text-[#D946EF]" />
              Real-time
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard 
              icon={<Receipt className="h-5 w-5" />} 
              label="Total" 
              value={stats.total}
              bgColor="bg-white/[0.02]"
            />
            <StatCard 
              icon={<Clock className="h-5 w-5" />} 
              label="Menunggu" 
              value={stats.pending} 
              color="text-[#D946EF]"
              bgColor="bg-[#D946EF]/[0.02]"
            />
            <StatCard 
              icon={<Zap className="h-5 w-5" />} 
              label="Diproses" 
              value={stats.processing} 
              color="text-cyan-400"
              bgColor="bg-cyan-500/[0.02]"
              trend={stats.processing > 0 ? "up" : null}
            />
            <StatCard 
              icon={<CheckCircle className="h-5 w-5" />} 
              label="Sukses" 
              value={stats.success} 
              color="text-emerald-400"
              bgColor="bg-emerald-500/[0.02]"
            />
            <StatCard 
              icon={<XCircle className="h-5 w-5" />} 
              label="Gagal" 
              value={stats.failed} 
              color="text-red-400"
              bgColor="bg-red-500/[0.02]"
            />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
              <History className="h-4 w-4 text-[#D946EF]" />
              Riwayat Transaksi Terbaru
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[#8B5CF6] hover:text-[#D946EF] font-black uppercase tracking-widest text-[10px] hover:bg-white/[0.02]"
              onClick={() => navigate("/dashboard/transactions")}
            >
              Lihat Semua 
              <ChevronRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>

          <div className="rounded-[1.5rem] overflow-hidden bg-[#0B0A10]/80 border border-white/10 shadow-2xl backdrop-blur-xl">
            {orders.length === 0 ? (
              <div className="p-16 text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/5 mb-6 shadow-inner">
                  <Receipt className="h-10 w-10 text-white/20" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Belum Ada Transaksi</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-8 max-w-sm mx-auto">
                  Anda belum melakukan transaksi. Mulai top up sekarang dan dapatkan benefit member!
                </p>
                <Button onClick={() => navigate("/products")} className="bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] text-black font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform h-12 px-8">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Mulai Belanja
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      <th className="text-left p-5 font-black text-white/40 text-[9px] uppercase tracking-widest">
                        Invoice
                      </th>
                      <th className="text-left p-5 font-black text-white/40 text-[9px] uppercase tracking-widest">
                        Item
                      </th>
                      <th className="text-left p-5 font-black text-white/40 text-[9px] uppercase tracking-widest hidden md:table-cell">
                        Target ID
                      </th>
                      <th className="text-right p-5 font-black text-white/40 text-[9px] uppercase tracking-widest">
                        Total
                      </th>
                      <th className="text-center p-5 font-black text-white/40 text-[9px] uppercase tracking-widest">
                        Status
                      </th>
                      <th className="text-center p-5 font-black text-white/40 text-[9px] uppercase tracking-widest w-10">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order: any, index: number) => (
                      <tr 
                        key={String(order.id)} 
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="p-5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold text-white/80">
                              {String(order.id).slice(0, 16)}...
                            </span>
                            <button
                              onClick={() => handleCopy(String(order.id), String(order.id))}
                              className="text-white/40 hover:text-[#D946EF] transition-colors"
                              aria-label="Salin invoice"
                            >
                              {copiedField === String(order.id) ? (
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        
                        <td className="p-5">
                          <div className="max-w-[200px]">
                            <p className="text-xs font-black text-white uppercase tracking-tight truncate">
                              {String(order.notes || order.productName || "-")}
                            </p>
                            {order.keterangan && ["cancelled", "failed"].includes(order.status) && (
                              <p className="text-[9px] font-black uppercase tracking-widest text-red-400 mt-1.5 flex items-center gap-1.5">
                                <AlertCircle className="h-3 w-3" />
                                <span className="truncate">{order.keterangan}</span>
                              </p>
                            )}
                          </div>
                        </td>
                        
                        <td className="p-5 hidden md:table-cell">
                          <span className="font-mono text-[10px] font-bold text-[#D946EF] bg-[#D946EF]/10 px-2.5 py-1 rounded">
                            {order.gameUserId || "-"}
                            {order.zoneId ? ` (${order.zoneId})` : ""}
                          </span>
                        </td>
                        
                        <td className="p-5 text-right">
                          <span className="text-xs font-black text-emerald-400">
                            {formatPrice(
                              Number(order.totalMyr || 0), 
                              Number(order.totalIdr || 0)
                            )}
                          </span>
                        </td>
                        
                        <td className="p-5 text-center">
                          <StatusBadge status={String(order.status)} />
                        </td>
                        
                        <td className="p-5 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-white/10 text-white/50 hover:text-white"
                            onClick={() => navigate(`/order/${order.id}`)}
                            aria-label="Lihat detail"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Table Footer */}
            {orders.length > 0 && (
              <div className="p-4 border-t border-white/10 bg-white/[0.01] flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                  Menampilkan {orders.length} transaksi terbaru
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[9px] font-black uppercase tracking-widest text-[#8B5CF6] hover:text-[#D946EF] hover:bg-white/5 h-8"
                  onClick={() => navigate("/dashboard/transactions")}
                >
                  Lihat Semua
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Info */}
        <div className="grid md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
          {[
            {
              icon: Zap,
              title: "Proses Instan",
              desc: "Transaksi diproses otomatis",
              color: "text-[#D946EF]",
              bg: "bg-gradient-to-br from-[#D946EF]/20 to-[#8B5CF6]/20 border border-[#D946EF]/30",
            },
            {
              icon: Shield,
              title: "100% Aman",
              desc: "Data terenkripsi end-to-end",
              color: "text-emerald-400",
              bg: "bg-gradient-to-br from-emerald-400/20 to-green-600/20 border border-emerald-400/30",
            },
            {
              icon: Gift,
              title: "Promo Member",
              desc: "Diskon & cashback transaksi",
              color: "text-cyan-400",
              bg: "bg-gradient-to-br from-cyan-400/20 to-blue-600/20 border border-cyan-400/30",
            },
          ].map((item, i) => (
            <div key={i} className="p-5 rounded-2xl bg-[#0B0A10]/80 border border-white/10 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${item.bg}`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-tight">{item.title}</h3>
                  <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mt-1">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </UserDashboardLayout>
  );
}