import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { useCurrency } from "@/providers/CurrencyProvider";
import { trpc } from "@/providers/trpc";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  Check,
  Clock,
  Package,
  Truck,
  XCircle,
  RefreshCw,
  Eye,
  User,
  ShoppingBag,
  RotateCw,
  X,
  Filter,
  ShoppingCart,
  Receipt,
  Plus,
  Wallet,
  Tag,
  Hash,
  Globe,
  Banknote,
  Calendar,
  Info,
  Code2,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* ====================== HELPERS ====================== */
const parseKeterangan = (str: string) => {
  if (!str) return "";
  try {
    if (str.trim().startsWith("{") || str.trim().startsWith("[")) {
      const obj = JSON.parse(str);
      return obj.message || obj.error_msg || obj.sn || obj.note || "Sistem membatalkan transaksi ini.";
    }
  } catch (e) { /* ignore */ }
  return str;
};

const extractPagination = (apiData: any) => {
  if (!apiData) return { totalPages: 1, total: 0, page: 1 };
  // cuba dari pagination, meta, atau root
  const pag = apiData.pagination || apiData.meta || apiData;
  return {
    totalPages: pag.totalPages ?? pag.pageCount ?? 1,
    total: pag.total ?? 0,
    page: pag.page ?? 1,
  };
};

const getStatusConfig = (status: string) => {
  switch ((status || "").toLowerCase()) {
    case "success":
    case "delivered":
    case "completed":
    case "shipped":
      return { label: "Success", icon: Check, bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" };
    case "pending":
      return { label: "Pending", icon: Clock, bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" };
    case "processing":
      return { label: "Processing", icon: Truck, bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" };
    case "failed":
    case "gagal":
      return { label: "Failed", icon: XCircle, bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" };
    case "refund":
      return { label: "Refund", icon: RefreshCw, bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" };
    case "cancelled":
    case "expired":
      return { label: "Cancelled", icon: XCircle, bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/30" };
    default:
      return { label: status || "Unknown", icon: Package, bg: "bg-white/5", text: "text-white/60", border: "border-white/10" };
  }
};

const getStatusLabel = (status: string) => getStatusConfig(status).label;

const statusOptions = [
  { value: "Semua Status", label: "Semua" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "success", label: "Success" },
  { value: "failed", label: "Failed" },
  { value: "refund", label: "Refund" },
  { value: "cancelled", label: "Cancelled" },
];

/* ====================== COMPONENT ====================== */
export default function AdminOrders() {
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState<"orders" | "transactions">("orders");

  // --- Orders State ---
  const [orderPage, setOrderPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [orderSearch, setOrderSearch] = useState("");
  const [debouncedOrderSearch, setDebouncedOrderSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // --- Transactions State ---
  const [trxPage, setTrxPage] = useState(1);
  const [trxSearch, setTrxSearch] = useState("");
  const [debouncedTrxSearch, setDebouncedTrxSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustNote, setAdjustNote] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedOrderSearch(orderSearch), 400);
    return () => clearTimeout(timer);
  }, [orderSearch]);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTrxSearch(trxSearch), 400);
    return () => clearTimeout(timer);
  }, [trxSearch]);

  // --- Queries ---
  const { data: statsData, refetch: refetchStats } = trpc.orders.adminStats.useQuery();
  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    refetch: refetchOrders,
  } = trpc.orders.adminList.useQuery(
    {
      page: orderPage,
      limit: 20,
      status: statusFilter === "Semua Status" ? undefined : statusFilter,
      search: debouncedOrderSearch || undefined,
    },
    { keepPreviousData: true }
  );

  const {
    data: trxData,
    isLoading: isLoadingTrx,
    refetch: refetchTrx,
  } = trpc.transactions.adminList.useQuery(
    {
      page: trxPage,
      limit: 20,
      type: typeFilter,
      search: debouncedTrxSearch || undefined,
    },
    { keepPreviousData: true }
  );

  const { data: usersData } = trpc.users.list.useQuery({ limit: 100 });
  const utils = trpc.useUtils();

  // --- Mutations ---
  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: (_, { status }) => {
      toast.success(`Status diubah ke ${getStatusLabel(status)}`);
      setUpdatingId(null);
      if (selectedOrder) setSelectedOrder({ ...selectedOrder, status });
      refetchOrders();
      refetchStats();
    },
    onError: (error) => {
      toast.error(error.message);
      setUpdatingId(null);
    },
  });

  const syncAllPendingMutation = trpc.orders.syncAllPending.useMutation({
    onSuccess: (res: any) => {
      if (res?.updatedCount > 0) {
        toast.success(`Sinkron ${res.updatedCount} pesanan.`);
      } else {
        toast.info(res?.message || "Tiada pending.");
      }
      refetchOrders();
      refetchStats();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateBalanceMutation = trpc.users.updateBalance.useMutation({
    onSuccess: () => {
      toast.success("Baki dikemaskini!");
      setShowAdjustModal(false);
      setAdjustAmount("");
      setAdjustNote("");
      refetchTrx();
    },
    onError: (err) => toast.error(err.message),
  });

  // --- Handlers ---
  const handleStatusChange = (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  const handleAdjustBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !adjustAmount || isNaN(Number(adjustAmount))) {
      toast.error("Pilih pengguna dan isi jumlah.");
      return;
    }
    updateBalanceMutation.mutate({
      userId: selectedUserId,
      amount: Number(adjustAmount),
      type: "add",
      notes: adjustNote || "Penyelarasan baki manual",
    });
  };

  // --- Data & Pagination ---
  const orders = (ordersData?.data || []).map((o: any) => ({
    ...o,
    normalizedStatus: o.status === "delivered" ? "success" : o.status === "shipped" ? "processing" : o.status,
  }));
  const ordersPagination = extractPagination(ordersData);
  const transactions = trxData?.data || [];
  const trxPagination = extractPagination(trxData);

  const globalStats = {
    total: statsData?.totalOrders || ordersPagination.total || 0,
    pending: statsData?.pendingOrders || 0,
    processing: statsData?.processingOrders || 0,
    success: statsData?.completedOrders || 0,
    failed: statsData?.failedOrders || 0,
    refund: statsData?.refundOrders || 0,
  };

  // Debug helper (boleh buang bila dah ok)
  console.log("Orders pagination:", ordersPagination);
  console.log("Trx pagination:", trxPagination);

  /* ====================== RENDER ====================== */
  return (
    <AdminLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        {/* HEADER & TABS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Hub Pesanan & Transaksi</h1>
            <p className="text-sm text-white/50 mt-1">Semua data lengkap – pesanan, transaksi, dan baki</p>
          </div>
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-[#14192B] border border-white/10 self-start md:self-auto">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "orders" ? "bg-[#38BDF8] text-white shadow-md shadow-sky-500/20" : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <ShoppingCart className="h-4 w-4" /> Pesanan
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "transactions" ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Receipt className="h-4 w-4" /> Transaksi
            </button>
          </div>
        </div>

        {/* ==================== TAB: ORDERS ==================== */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {/* Sync & Refresh */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => syncAllPendingMutation.mutate()}
                disabled={syncAllPendingMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-xs transition-all disabled:opacity-50 shadow-md"
              >
                <RotateCw className={`h-4 w-4 ${syncAllPendingMutation.isPending ? "animate-spin" : ""}`} />
                Sync Provider
              </button>
              <button
                onClick={() => { refetchOrders(); refetchStats(); }}
                disabled={isLoadingOrders}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#14192B] border border-white/10 text-xs font-semibold text-white/70 hover:text-white"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoadingOrders ? "animate-spin" : ""}`} />
                Muat Semula
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "Semua", key: "Semua Status", count: globalStats.total, color: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.1)", text: "text-white" },
                { label: "Pending", key: "pending", count: globalStats.pending, color: "rgba(255,184,0,0.1)", border: "rgba(255,184,0,0.2)", text: "text-amber-400" },
                { label: "Processing", key: "processing", count: globalStats.processing, color: "rgba(56,189,248,0.1)", border: "rgba(56,189,248,0.2)", text: "text-sky-400" },
                { label: "Success", key: "success", count: globalStats.success, color: "rgba(0,200,100,0.1)", border: "rgba(0,200,100,0.2)", text: "text-emerald-400" },
                { label: "Failed", key: "failed", count: globalStats.failed, color: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)", text: "text-red-400" },
                { label: "Refund", key: "refund", count: globalStats.refund, color: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.2)", text: "text-amber-400" },
              ].map((stat) => {
                const isActive = statusFilter === stat.key;
                return (
                  <button
                    key={stat.label}
                    onClick={() => { setStatusFilter(stat.key); setOrderPage(1); }}
                    className="p-4 rounded-2xl flex flex-col items-center justify-center transition-all duration-300"
                    style={{
                      background: stat.color,
                      border: isActive ? "1.5px solid #38BDF8" : `1px solid ${stat.border}`,
                      boxShadow: isActive ? "0 0 15px rgba(56,189,248,0.2)" : "none",
                    }}
                  >
                    <p className={`text-2xl font-bold ${stat.text}`}>{stat.count}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50 mt-1">{stat.label}</p>
                  </button>
                );
              })}
            </div>

            {/* Search & Filter */}
            <div className="p-4 rounded-2xl bg-[#14192B] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Cari Invoice, ID Game, User..."
                  className="w-full h-10 pl-10 pr-10 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#38BDF8]"
                />
                {orderSearch && (
                  <button onClick={() => setOrderSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto hide-scrollbar">
                <span className="text-xs text-white/40 flex items-center gap-1 shrink-0 mr-1"><Filter className="h-3.5 w-3.5" /> Status:</span>
                {statusOptions.map((s) => {
                  const isActive = statusFilter === s.value;
                  return (
                    <button
                      key={s.value}
                      onClick={() => { setStatusFilter(s.value); setOrderPage(1); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${isActive ? "bg-[#38BDF8] text-white font-bold" : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"}`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Orders List */}
            <div className="rounded-2xl bg-[#14192B] border border-white/5 p-5">
              {isLoadingOrders ? (
                <div className="py-16 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-[#38BDF8]" /><p className="text-sm text-white/40 mt-3">Memuatkan pesanan...</p></div>
              ) : orders.length === 0 ? (
                <div className="py-16 text-center space-y-3"><Package className="h-12 w-12 mx-auto text-white/10" /><p className="text-sm text-white/40">Tiada pesanan</p></div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order: any) => {
                    const isUpdating = updatingId === order.id;
                    const currentStatus = String(order.status || "pending").toLowerCase();
                    const statusConfig = getStatusConfig(currentStatus);
                    const StatusIcon = statusConfig.icon;
                    const invId = String(order.id);
                    const parsedKet = parseKeterangan(order.keterangan);
                    const isFailedOrCancelled = currentStatus === "cancelled" || currentStatus === "failed";
                    const priceMyr = Number(order.totalMyr || order.price_myr || 0);
                    const profitMyr = Number(order.profitMyr || 0);
                    const totalIdr = Number(order.totalIdr || order.total || 0);
                    const providerTrxId = order.providerTrxId || "";
                    const providerStatus = order.providerStatus || "";
                    const gameSlug = order.gameSlug || "";
                    const zoneId = order.zoneId || "";

                    return (
                      <div
                        key={invId}
                        className={`flex flex-col lg:flex-row lg:items-center justify-between p-4 gap-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all ${isUpdating ? "opacity-50" : ""}`}
                      >
                        <div className="flex items-start lg:items-center gap-4 flex-1 min-w-0">
                          <div className={`hidden sm:flex flex-shrink-0 items-center justify-center w-10 h-10 rounded-xl border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                            <StatusIcon className="w-5 h-5" />
                          </div>
                          <div className="space-y-1.5 w-full min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-bold text-sky-400">#{invId.slice(0, 16)}</span>
                              <span className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} px-2 py-0.5 rounded-md text-[10px] font-bold border`}>{statusConfig.label}</span>
                              {providerStatus && <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/5 text-white/60 border border-white/10">Provider: {providerStatus}</span>}
                            </div>
                            <p className="font-bold text-sm text-white truncate">{order.serviceName || order.service_name || "-"}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/50">
                              {gameSlug && <span className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded"><Globe className="h-3 w-3 text-white/30" /><code className="text-purple-400">{gameSlug}</code></span>}
                              {zoneId && <span className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded"><Hash className="h-3 w-3 text-white/30" /><code className="text-blue-400">{zoneId}</code></span>}
                              <span className="flex items-center gap-1"><User className="h-3 w-3 text-white/30" />{order.username || order.telegramId || "Pelanggan"}</span>
                              <span>Target: <code className="text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded">{order.gameUserId || order.target_user_id || "-"}</code></span>
                            </div>
                            {providerTrxId && <div className="flex items-center gap-1 text-[10px] text-white/40"><Tag className="h-3 w-3" /><span className="font-mono">{providerTrxId}</span></div>}
                            {isFailedOrCancelled && parsedKet && (
                              <div className="text-[11px] text-red-400 mt-2 flex items-start gap-1 bg-red-500/10 p-2 rounded-lg border border-red-500/20"><XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" /><span>Keterangan: {parsedKet}</span></div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 border-t border-white/5 lg:border-t-0 pt-3 lg:pt-0 min-w-[200px]">
                          <div className="text-right">
                            <p className="font-bold text-base text-emerald-400">RM {priceMyr.toFixed(2)}</p>
                            <div className="flex items-center gap-2 mt-1 text-[10px]">
                              <span className="text-white/40 flex items-center gap-0.5"><Banknote className="h-3 w-3" /> IDR {totalIdr.toLocaleString()}</span>
                              {profitMyr > 0 && <span className="text-sky-400 font-bold">+RM {profitMyr.toFixed(2)}</span>}
                            </div>
                            {order.createdAt && (
                              <p className="text-[10px] text-white/40 flex items-center gap-1 justify-end mt-0.5"><Calendar className="h-3 w-3" />{new Date(order.createdAt).toLocaleString("ms-MY", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedOrder(order)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-sky-400"><Eye className="h-4 w-4" /></button>
                            <select
                              className="h-9 rounded-lg text-xs px-2 cursor-pointer font-bold bg-[#0B0F19] text-white border border-white/10"
                              value={currentStatus}
                              onChange={(e) => handleStatusChange(invId, e.target.value)}
                              disabled={isUpdating}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="success">Success</option>
                              <option value="failed">Failed</option>
                              <option value="refund">Refund</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Orders Pagination */}
              {ordersPagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 text-xs text-white/50">
                  <span>Halaman {orderPage} daripada {ordersPagination.totalPages} (Jumlah: {ordersPagination.total})</span>
                  <div className="flex items-center gap-2">
                    <button disabled={orderPage <= 1} onClick={() => setOrderPage((p) => p - 1)} className="p-2 rounded-lg bg-white/5 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
                    <button disabled={orderPage >= ordersPagination.totalPages} onClick={() => setOrderPage((p) => p + 1)} className="p-2 rounded-lg bg-white/5 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB: TRANSACTIONS ==================== */}
        {activeTab === "transactions" && (
          <div className="space-y-6">
            {/* Actions & Filter */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input
                    type="text"
                    value={trxSearch}
                    onChange={(e) => setTrxSearch(e.target.value)}
                    placeholder="Cari ID, pengguna, produk..."
                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
                  {[
                    { id: "all", label: "Semua" },
                    { id: "deposit", label: "Deposit" },
                    { id: "api", label: "API Order" },
                    { id: "order", label: "Direct Order" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => { setTypeFilter(f.id); setTrxPage(1); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${typeFilter === f.id ? "bg-emerald-500 text-white font-bold" : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAdjustModal(true)}
                  className="flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-500/10"
                >
                  <Plus className="h-4 w-4" /> Deposit / Laraskan Baki
                </button>
                <button
                  onClick={() => refetchTrx()}
                  disabled={isLoadingTrx}
                  className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#14192B] border border-white/10 text-sm text-white/70 hover:text-white hover:border-white/20"
                >
                  <RefreshCw className={`h-4 w-4 text-white/40 ${isLoadingTrx ? "animate-spin" : ""}`} />
                  Muat Semula
                </button>
              </div>
            </div>

            {/* Transactions List */}
            <div className="rounded-2xl bg-[#14192B] border border-white/5 p-5">
              {isLoadingTrx ? (
                <div className="py-16 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-400" /><p className="text-sm text-white/40 mt-3">Memuatkan transaksi...</p></div>
              ) : transactions.length === 0 ? (
                <div className="py-16 text-center space-y-3"><Receipt className="h-12 w-12 mx-auto text-white/10" /><p className="text-sm text-white/40">Tiada rekod transaksi</p></div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx: any) => {
                    const isDeposit = (tx.keterangan || "").toLowerCase().includes("deposit") || (tx.type === "deposit");
                    const isApi = (tx.keterangan || "").toLowerCase().includes("via api") || (tx.type === "api");
                    const statusConfig = getStatusConfig(tx.status);
                    const invId = String(tx.id);
                    const priceMyr = Number(tx.price_myr || tx.totalMyr || 0);
                    const profitMyr = Number(tx.profitMyr || 0);
                    const totalIdr = Number(tx.totalIdr || 0);
                    const username = tx.username || tx.telegramId || `User ${tx.target_user_id || "System"}`;
                    const serviceName = tx.serviceName || tx.service_name || "";
                    const gameSlug = tx.gameSlug || "";
                    const zoneId = tx.zoneId || "";
                    const keterangan = tx.keterangan || "";
                    const providerTrxId = tx.providerTrxId || "";
                    const providerStatus = tx.providerStatus || "";

                    return (
                      <div
                        key={invId}
                        className="flex flex-col lg:flex-row lg:items-center justify-between p-4 gap-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group"
                      >
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10">
                            {isDeposit ? <Wallet className="h-5 w-5 text-emerald-400" /> : isApi ? <Code2 className="h-5 w-5 text-purple-400" /> : <ShoppingCart className="h-5 w-5 text-sky-400" />}
                          </div>
                          <div className="space-y-1.5 w-full min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-bold text-sky-400">#{invId.slice(0, 14)}</span>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>{statusConfig.label}</span>
                              {providerStatus && <span className="px-2 py-0.5 rounded-md text-[10px] bg-white/5 text-white/60 border border-white/10">Provider: {providerStatus}</span>}
                            </div>
                            <p className="font-bold text-sm text-white truncate">{serviceName || keterangan || "Transaksi"}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/50">
                              <span className="flex items-center gap-1"><User className="h-3 w-3 text-white/30" />{username}</span>
                              {gameSlug && <span className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded"><Globe className="h-3 w-3 text-white/30" /><code className="text-purple-400">{gameSlug}</code></span>}
                              {zoneId && <span className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded"><Hash className="h-3 w-3 text-white/30" /><code className="text-blue-400">{zoneId}</code></span>}
                              {providerTrxId && <span className="flex items-center gap-1 text-[10px] text-white/40"><Tag className="h-3 w-3" /><span className="font-mono">{providerTrxId}</span></span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 border-t border-white/5 lg:border-t-0 pt-3 lg:pt-0 min-w-[180px]">
                          <div className="text-right">
                            <p className={`font-bold text-base ${isDeposit ? "text-emerald-400" : "text-white"}`}>{isDeposit ? "+" : "-"} RM {priceMyr.toFixed(2)}</p>
                            {totalIdr > 0 && <span className="text-white/40 text-[10px] flex items-center gap-0.5"><Banknote className="h-3 w-3" /> IDR {totalIdr.toLocaleString()}</span>}
                            {profitMyr > 0 && <span className="text-sky-400 text-[10px] font-bold mt-0.5 block">+RM {profitMyr.toFixed(2)} profit</span>}
                            <p className="text-[10px] text-white/40 flex items-center gap-1 justify-end mt-0.5"><Calendar className="h-3 w-3" />{new Date(tx.created_at).toLocaleString("ms-MY", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                          </div>
                          <button onClick={() => setSelectedTransaction(tx)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-sky-400"><Eye className="h-4 w-4" /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Transactions Pagination */}
              {trxPagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 text-xs text-white/50">
                  <span>Halaman {trxPage} daripada {trxPagination.totalPages} (Jumlah: {trxPagination.total})</span>
                  <div className="flex items-center gap-2">
                    <button disabled={trxPage <= 1} onClick={() => setTrxPage((p) => p - 1)} className="p-2 rounded-lg bg-white/5 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
                    <button disabled={trxPage >= trxPagination.totalPages} onClick={() => setTrxPage((p) => p + 1)} className="p-2 rounded-lg bg-white/5 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== DIALOGS ==================== */}
        {/* Order Detail Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="bg-[#14192B] border border-white/10 text-white max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-white font-bold"><ShoppingBag className="h-5 w-5 text-sky-400" /> Detail Pesanan</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-1">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-xs text-white/50">Ubah Status</span>
                  <select
                    className="h-8 rounded-lg text-xs px-2 font-bold bg-[#0B0F19] text-white border border-white/10"
                    value={String(selectedOrder.status || "pending").toLowerCase()}
                    onChange={(e) => handleStatusChange(String(selectedOrder.id), e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                    <option value="refund">Refund</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                  {[
                    { label: "Invoice ID", value: `#${selectedOrder.id}`, mono: true, color: "text-sky-400" },
                    { label: "Produk", value: selectedOrder.serviceName || selectedOrder.service_name || "-" },
                    { label: "Game Slug", value: selectedOrder.gameSlug || "-", color: "text-purple-400" },
                    { label: "User ID Game", value: selectedOrder.gameUserId || selectedOrder.target_user_id || "-", mono: true, color: "text-amber-400" },
                    { label: "Zone ID", value: selectedOrder.zoneId || "-", mono: true, color: "text-blue-400" },
                    { label: "Pelanggan", value: selectedOrder.telegramId || selectedOrder.username || "-" },
                    { label: "Status", value: getStatusLabel(selectedOrder.status) },
                    { label: "Provider Status", value: selectedOrder.providerStatus || "-" },
                    { label: "Provider Trx ID", value: selectedOrder.providerTrxId || "-", mono: true },
                    { label: "Harga (MYR)", value: `RM ${Number(selectedOrder.totalMyr || selectedOrder.price_myr || 0).toFixed(2)}`, color: "text-emerald-400" },
                    { label: "Total (IDR)", value: `IDR ${(selectedOrder.totalIdr || selectedOrder.total || 0).toLocaleString()}` },
                    { label: "Profit (MYR)", value: `RM ${Number(selectedOrder.profitMyr || 0).toFixed(2)}`, color: "text-sky-400" },
                    { label: "Profit (IDR)", value: `IDR ${(selectedOrder.profitIdr || 0).toLocaleString()}` },
                    { label: "Tarikh", value: selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString("ms-MY") : "-" },
                    { label: "Keterangan", value: parseKeterangan(selectedOrder.keterangan) || selectedOrder.notes || "-" },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between border-b border-white/5 pb-1.5 last:border-0">
                      <span className="text-white/40">{item.label}</span>
                      <span className={`font-bold text-right max-w-[60%] break-all ${item.mono ? "font-mono" : ""} ${item.color || "text-white"}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Transaction Detail Dialog */}
        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent className="bg-[#14192B] border border-white/10 text-white max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-white font-bold"><Receipt className="h-5 w-5 text-sky-400" /> Detail Transaksi</DialogTitle>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-1">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                  {[
                    { label: "ID Transaksi", value: `#${selectedTransaction.id}`, mono: true, color: "text-sky-400" },
                    { label: "Pengguna", value: selectedTransaction.username || selectedTransaction.telegramId || selectedTransaction.target_user_id || "-" },
                    { label: "Jenis", value: (() => {
                      const k = (selectedTransaction.keterangan || "").toLowerCase();
                      if (k.includes("deposit")) return "Deposit / TopUp";
                      if (k.includes("via api")) return "API Order";
                      return "Direct Order";
                    })() },
                    { label: "Status", value: getStatusLabel(selectedTransaction.status) },
                    { label: "Provider Status", value: selectedTransaction.providerStatus || "-" },
                    { label: "Provider Trx ID", value: selectedTransaction.providerTrxId || "-", mono: true },
                    { label: "Produk", value: selectedTransaction.serviceName || selectedTransaction.service_name || "-" },
                    { label: "Game Slug", value: selectedTransaction.gameSlug || "-", color: "text-purple-400" },
                    { label: "User ID Game", value: selectedTransaction.gameUserId || selectedTransaction.target_user_id || "-", mono: true, color: "text-amber-400" },
                    { label: "Zone ID", value: selectedTransaction.zoneId || "-", mono: true, color: "text-blue-400" },
                    { label: "Jumlah (MYR)", value: `RM ${Number(selectedTransaction.price_myr || selectedTransaction.totalMyr || 0).toFixed(2)}`, color: Number(selectedTransaction.price_myr || selectedTransaction.totalMyr || 0) > 0 ? "text-emerald-400" : "text-white" },
                    { label: "Total (IDR)", value: selectedTransaction.totalIdr ? `IDR ${Number(selectedTransaction.totalIdr).toLocaleString()}` : "-" },
                    { label: "Profit (MYR)", value: selectedTransaction.profitMyr ? `RM ${Number(selectedTransaction.profitMyr).toFixed(2)}` : "-", color: "text-sky-400" },
                    { label: "Profit (IDR)", value: selectedTransaction.profitIdr ? `IDR ${Number(selectedTransaction.profitIdr).toLocaleString()}` : "-" },
                    { label: "Keterangan", value: selectedTransaction.keterangan || "-" },
                    { label: "Catatan (Notes)", value: selectedTransaction.notes || "-" },
                    { label: "Tarikh", value: selectedTransaction.created_at ? new Date(selectedTransaction.created_at).toLocaleString("ms-MY") : "-" },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between border-b border-white/5 pb-1.5 last:border-0">
                      <span className="text-white/40">{item.label}</span>
                      <span className={`font-bold text-right max-w-[60%] break-all ${item.mono ? "font-mono" : ""} ${item.color || "text-white"}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Adjust Balance Modal */}
        <Dialog open={showAdjustModal} onOpenChange={setShowAdjustModal}>
          <DialogContent className="bg-[#14192B] border border-white/10 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-white flex items-center gap-2"><Wallet className="h-5 w-5 text-emerald-400" /> Penyelarasan Baki</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdjustBalance} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1">Pilih Pengguna</label>
                <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-400">
                  <option value="" className="bg-[#14192B]">-- Pilih Pengguna --</option>
                  {(usersData?.data || []).map((u: any) => (
                    <option key={u.id} value={u.id} className="bg-[#14192B]">{u.name || u.email || u.username} ({u.id.slice(0, 8)}) - Baki: RM {(u.accountBalance || 0).toFixed(2)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1">Jumlah Tambah (MYR)</label>
                <input type="number" step="0.01" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} placeholder="Contoh: 50.00" className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1">Catatan</label>
                <input type="text" value={adjustNote} onChange={(e) => setAdjustNote(e.target.value)} placeholder="Contoh: Deposit manual" className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-400" />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <button type="button" onClick={() => setShowAdjustModal(false)} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white/70 font-semibold">Batal</button>
                <button type="submit" disabled={updateBalanceMutation.isPending} className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs text-white font-bold transition-all">{updateBalanceMutation.isPending ? "Kemaskini..." : "Simpan Baki"}</button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}