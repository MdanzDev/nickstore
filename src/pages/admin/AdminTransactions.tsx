import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { useCurrency } from "@/providers/CurrencyProvider";
import { trpc } from "@/providers/trpc";
import {
  Receipt,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Wallet,
  Code2,
  ShoppingCart,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Hash,
  Globe,
  Tag,
  Banknote,
  Calendar,
  Info,
  User,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminTransactions() {
  const { formatPrice } = useCurrency();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  // Manual Balance Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustNote, setAdjustNote] = useState("");

  const { data: usersData } = trpc.users.list.useQuery({ limit: 100 });

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, refetch } = trpc.transactions.adminList.useQuery({
    page,
    limit: 20,
    type: typeFilter,
    search: debouncedSearch || undefined,
  });

  const updateBalanceMutation = trpc.users.updateBalance.useMutation({
    onSuccess: () => {
      toast.success("Baki akaun pengguna berjaya dikemaskini!");
      setShowAdjustModal(false);
      setAdjustAmount("");
      setAdjustNote("");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Gagal mengemaskini baki");
    }
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleAdjustBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !adjustAmount || isNaN(Number(adjustAmount))) {
      toast.error("Sila pilih pengguna dan masukkan jumlah baki yang sah.");
      return;
    }

    updateBalanceMutation.mutate({
      userId: selectedUserId,
      amount: Number(adjustAmount),
      type: "add",
      notes: adjustNote || "Penyelarasan baki oleh Admin"
    });
  };

  const transactions = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;
  const totalCount = data?.pagination?.total || 0;

  // Helper untuk label status
  const getStatusConfig = (status: string) => {
    const s = (status || "").toLowerCase();
    if (["success", "sukses", "delivered", "completed", "shipped"].includes(s))
      return { label: "Berjaya", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" };
    if (["failed", "gagal", "cancelled", "expired"].includes(s))
      return { label: "Gagal/Batal", bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" };
    return { label: "Pending", bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" };
  };

  return (
    <AdminLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-2 pt-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="h-6 w-6 text-[#38BDF8]" />
              <h1 className="text-2xl font-bold text-white tracking-tight">Pengurusan Transaksi</h1>
            </div>
            <p className="text-sm text-white/50">Sejarah lengkap pergerakan baki, deposit, dan semua medan transaksi</p>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => setShowAdjustModal(true)}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-500/10"
            >
              <Plus className="h-4 w-4" /> Deposit / Laraskan Baki
            </button>

            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#14192B] border border-white/10 text-sm text-white/70 hover:text-white hover:border-white/20 transition-all whitespace-nowrap"
            >
              <RefreshCw className={`h-4 w-4 text-white/40 ${isRefreshing ? 'animate-spin' : ''}`} />
              Muat Semula
            </button>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="p-4 rounded-2xl bg-[#14192B] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari ID, pengguna, produk..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#38BDF8]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto hide-scrollbar">
            <span className="text-xs text-white/40 flex items-center gap-1 shrink-0 mr-1">
              <Filter className="h-3.5 w-3.5" /> Penapis:
            </span>
            {[
              { id: "all", label: "Semua" },
              { id: "deposit", label: "Deposit / TopUp" },
              { id: "api", label: "API Orders" },
              { id: "order", label: "Direct Orders" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => { setTypeFilter(f.id); setPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  typeFilter === f.id
                    ? "bg-[#38BDF8] text-white font-bold"
                    : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* TRANSACTIONS LIST (Kad, bukan table) */}
        <div className="rounded-2xl bg-[#14192B] border border-white/5 p-5">
          {isLoading ? (
            <div className="py-16 text-center text-white/40">Memuatkan rekod...</div>
          ) : transactions.length === 0 ? (
            <div className="py-16 text-center text-white/40">Tiada transaksi</div>
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
                const username = tx.username || tx.telegramId || `User ${tx.target_user_id || 'System'}`;
                const serviceName = tx.serviceName || tx.service_name || "";
                const gameSlug = tx.gameSlug || "";
                const zoneId = tx.zoneId || "";
                const keterangan = tx.keterangan || "";
                const notes = tx.notes || "";
                const providerTrxId = tx.providerTrxId || "";
                const providerStatus = tx.providerStatus || "";

                return (
                  <div
                    key={invId}
                    className="flex flex-col lg:flex-row lg:items-center justify-between p-4 gap-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group"
                  >
                    {/* Left info block */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Jenis transaksi icon */}
                      <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10">
                        {isDeposit ? (
                          <Wallet className="h-5 w-5 text-emerald-400" />
                        ) : isApi ? (
                          <Code2 className="h-5 w-5 text-purple-400" />
                        ) : (
                          <ShoppingCart className="h-5 w-5 text-sky-400" />
                        )}
                      </div>

                      <div className="space-y-1.5 w-full min-w-0">
                        {/* ID + Status badge */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-sky-400">#{invId.slice(0, 14)}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                            {statusConfig.label}
                          </span>
                          {providerStatus && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] bg-white/5 text-white/60 border border-white/10">
                              Provider: {providerStatus}
                            </span>
                          )}
                        </div>

                        {/* Service / Produk */}
                        <p className="font-bold text-sm text-white truncate">
                          {serviceName || keterangan || "Transaksi"}
                        </p>

                        {/* Metadata tags */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/50">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3 text-white/30" /> {username}
                          </span>
                          {gameSlug && (
                            <span className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded">
                              <Globe className="h-3 w-3 text-white/30" />
                              <code className="text-purple-400">{gameSlug}</code>
                            </span>
                          )}
                          {zoneId && (
                            <span className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded">
                              <Hash className="h-3 w-3 text-white/30" />
                              <code className="text-blue-400">{zoneId}</code>
                            </span>
                          )}
                          {providerTrxId && (
                            <span className="flex items-center gap-1 text-[10px] text-white/40">
                              <Tag className="h-3 w-3" />
                              <span className="font-mono">{providerTrxId}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right price/profit/date + action */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 border-t border-white/5 lg:border-t-0 pt-3 lg:pt-0 min-w-[180px]">
                      <div className="text-right">
                        <p className={`font-bold text-base ${isDeposit ? "text-emerald-400" : "text-white"}`}>
                          {isDeposit ? "+" : "-"} RM {priceMyr.toFixed(2)}
                        </p>
                        {totalIdr > 0 && (
                          <div className="flex items-center gap-2 mt-1 text-[10px]">
                            <span className="text-white/40 flex items-center gap-0.5">
                              <Banknote className="h-3 w-3" /> IDR {totalIdr.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {profitMyr > 0 && (
                          <span className="text-sky-400 text-[10px] font-bold mt-0.5 block">
                            +RM {profitMyr.toFixed(2)} profit
                          </span>
                        )}
                        <p className="text-[10px] text-white/40 flex items-center gap-1 justify-end mt-0.5">
                          <Calendar className="h-3 w-3" />
                          {new Date(tx.created_at).toLocaleString("ms-MY", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedTransaction(tx)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-sky-400 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 text-xs text-white/50">
              <span>Menunjukkan {transactions.length} daripada {totalCount} rekod</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-bold text-white px-2">Halaman {page} daripada {totalPages}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* TRANSACTION DETAIL DIALOG (All fields) */}
        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent className="bg-[#14192B] border border-white/10 text-white max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-white font-bold">
                <Receipt className="h-5 w-5 text-sky-400" /> Detail Transaksi
              </DialogTitle>
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
                    { label: "Status", value: getStatusConfig(selectedTransaction.status).label },
                    { label: "Provider Status", value: selectedTransaction.providerStatus || "-" },
                    { label: "Provider Trx ID", value: selectedTransaction.providerTrxId || "-", mono: true },
                    { label: "Servis / Produk", value: selectedTransaction.serviceName || selectedTransaction.service_name || "-" },
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
                      <span className={`font-bold text-right max-w-[60%] break-all ${item.mono ? "font-mono" : ""} ${item.color || "text-white"}`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ADJUST BALANCE MODAL (unchanged) */}
        <Dialog open={showAdjustModal} onOpenChange={setShowAdjustModal}>
          <DialogContent className="bg-[#14192B] border border-white/10 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Wallet className="h-5 w-5 text-emerald-400" /> Penyelarasan Baki Manual
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleAdjustBalance} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1">Pilih Pengguna</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="" className="bg-[#14192B]">-- Pilih Pengguna --</option>
                  {(usersData?.data || []).map((u: any) => (
                    <option key={u.id} value={u.id} className="bg-[#14192B]">
                      {u.name || u.email || u.username} ({u.id.slice(0, 8)}) - Baki: RM {(u.accountBalance || 0).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1">Jumlah Tambah (MYR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="Contoh: 50.00"
                  className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1">Catatan / Keterangan</label>
                <input
                  type="text"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="Contoh: Deposit manual via Bank Transfer"
                  className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white/70 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updateBalanceMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs text-white font-bold transition-all"
                >
                  {updateBalanceMutation.isPending ? "Kemaskini..." : "Simpan Baki"}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </AdminLayout>
  );
}