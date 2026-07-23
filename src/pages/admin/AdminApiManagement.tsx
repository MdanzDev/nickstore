import { useState } from "react";
import AdminLayout from "./AdminLayout";
import { trpc } from "@/providers/trpc";
import {
  Code2,
  Key,
  ShoppingCart,
  Wallet,
  Plus,
  RefreshCw,
  Copy,
  Check,
  Power,
  Trash2,
  ShieldAlert,
  Globe,
  CheckCircle2,
  Lock,
  ListOrdered,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Send
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminApiManagement() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [logsPage, setLogsPage] = useState(1);

  const { data: statsData, refetch: refetchStats } = trpc.apiManagement.stats.useQuery();
  const { data: keysData, refetch: refetchKeys } = trpc.apiManagement.listKeys.useQuery();
  const { data: logsData, refetch: refetchLogs } = trpc.apiManagement.logs.useQuery({ page: logsPage });
  const { data: usersData } = trpc.users.list.useQuery({ limit: 200 });

  const generateMutation = trpc.apiManagement.generateKey.useMutation({
    onSuccess: (res) => {
      setGeneratedKey(res.api_key);
      toast.success("Kunci API berjaya dijana!");
      refetchKeys();
      refetchStats();
    },
    onError: (err) => {
      toast.error(err.message || "Gagal menjana Kunci API");
    }
  });

  const toggleMutation = trpc.apiManagement.toggleKey.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      refetchKeys();
      refetchStats();
    },
    onError: (err) => {
      toast.error(err.message || "Gagal memutus sambungan kunci API");
    }
  });

  const deleteMutation = trpc.apiManagement.deleteKey.useMutation({
    onSuccess: () => {
      toast.success("Kunci API berjaya dihapuskan");
      refetchKeys();
      refetchStats();
    },
    onError: (err) => {
      toast.error(err.message || "Gagal menghapus kunci API");
    }
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchStats(), refetchKeys(), refetchLogs()]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error("Sila pilih pengguna untuk Kunci API ini.");
      return;
    }
    generateMutation.mutate({ userId: selectedUserId });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Kunci API disalin ke papan klip!");
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = statsData?.stats;
  const keys = keysData?.keys || [];
  const apiLogs = logsData?.logs || [];
  const logsPagination = logsData?.pagination;

  return (
    <AdminLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-2 pt-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Code2 className="h-6 w-6 text-[#38BDF8]" />
              <h1 className="text-2xl font-bold text-white tracking-tight">Pengurusan & Analytics API Integrator</h1>
            </div>
            <p className="text-sm text-white/50">Kawal selia Kunci API awam, pemantauan log permintaan & integrasi automatik</p>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => { setGeneratedKey(null); setShowGenerateModal(true); }}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-xs transition-all shadow-md shadow-sky-500/10"
            >
              <Plus className="h-4 w-4" /> Jana Key API Baru
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

        {/* 4 OVERVIEW STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#14192B] border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-white/50 mb-1">Jumlah Key API</p>
              <h3 className="text-2xl font-bold text-white">{stats?.totalKeys || 0}</h3>
              <p className="text-[11px] text-emerald-400 font-semibold mt-1">{stats?.activeKeys || 0} Aktif Beroperasi</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Key className="h-5 w-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#14192B] border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-white/50 mb-1">Pesanan via API</p>
              <h3 className="text-2xl font-bold text-white">{stats?.totalApiOrders || 0}</h3>
              <p className="text-[11px] text-white/40 mt-1">Transaksi Integrasi Automatik</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#14192B] border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-white/50 mb-1">Jualan via API (MYR)</p>
              <h3 className="text-2xl font-bold text-emerald-400">
                RM {Number(stats?.totalApiRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-white/40 mt-1">Nisbah Volume API</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Wallet className="h-5 w-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#14192B] border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-white/50 mb-1">Konfigurasi Rate Limit</p>
              <h3 className="text-sm font-bold text-white mb-0.5">Read: {stats?.readRateLimit || "60/min"}</h3>
              <h3 className="text-sm font-bold text-amber-400">Order: {stats?.orderRateLimit || "10/min"}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* MAIN API KEYS MANAGEMENT TABLE */}
        <div className="rounded-2xl bg-[#14192B] border border-white/5 p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-sky-400" />
              <h3 className="text-base font-bold text-white">Senarai Kunci API Integrator</h3>
            </div>
            <span className="text-xs text-white/40">{keys.length} Kunci Terdaftar</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-white/40 text-[11px] uppercase font-semibold">
                  <th className="pb-3 px-3">Prefix Kunci</th>
                  <th className="pb-3 px-3">Pengguna / Pemilik Akaun</th>
                  <th className="pb-3 px-3">Identiti Pengguna</th>
                  <th className="pb-3 px-3 text-center">Status</th>
                  <th className="pb-3 px-3 text-right">Tarikh Dicipta</th>
                  <th className="pb-3 px-3 text-right">Terakhir Digunakan</th>
                  <th className="pb-3 px-3 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {keys.length > 0 ? (
                  keys.map((k: any) => (
                    <tr key={k.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-3 px-3 font-mono text-xs font-bold text-sky-400">
                        {k.key_prefix}••••••••
                      </td>
                      <td className="py-3 px-3">
                        <p className="text-xs font-bold text-white">
                          {k.user?.username || k.user?.display_name || "Integrator"}
                        </p>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-0.5 text-[10px]">
                          {k.user?.email && (
                            <span className="text-white/60 flex items-center gap-1">
                              <Mail className="h-3 w-3 text-sky-400" /> {k.user.email}
                            </span>
                          )}
                          {k.user?.telegram_id && (
                            <span className="text-amber-400 flex items-center gap-1">
                              <Send className="h-3 w-3 text-amber-400" /> TG ID: {k.user.telegram_id}
                            </span>
                          )}
                          {!k.user?.email && !k.user?.telegram_id && (
                            <span className="text-white/40 font-mono">ID: {k.user_id}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {k.is_active ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Aktif
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold inline-flex items-center gap-1">
                            <Lock className="h-3 w-3" /> Nyahaktif
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right text-[11px] text-white/40">
                        {new Date(k.created_at).toLocaleDateString("ms-MY")}
                      </td>
                      <td className="py-3 px-3 text-right text-[11px] text-white/40">
                        {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString("ms-MY") : "Belum Pernah"}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => toggleMutation.mutate({ id: k.id, isActive: !k.is_active })}
                            title={k.is_active ? "Nyahaktifkan Kunci" : "Aktifkan Kunci"}
                            className={`p-1.5 rounded-lg border transition-all ${
                              k.is_active
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                            }`}
                          >
                            <Power className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Adakah anda pasti mahu menghapus Kunci API ini?")) {
                                deleteMutation.mutate({ id: k.id });
                              }
                            }}
                            title="Hapus Kunci API"
                            className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-white/40 text-sm">
                      Tiada Kunci API Integrator didaftarkan lagi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* API REQUEST & TRAFFIC LOGS */}
        <div className="rounded-2xl bg-[#14192B] border border-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ListOrdered className="h-5 w-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">Log Permintaan & Trafik API</h3>
            </div>
            <span className="text-xs text-white/40">Sejarah Panggilan API Realtime</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-white/40 text-[11px] uppercase font-semibold">
                  <th className="pb-3 px-3">Kaedah & Endpoint</th>
                  <th className="pb-3 px-3 text-center">Status Code</th>
                  <th className="pb-3 px-3">Produk</th>
                  <th className="pb-3 px-3 text-right">Jumlah (MYR)</th>
                  <th className="pb-3 px-3">Pengguna / TG ID</th>
                  <th className="pb-3 px-3 text-right">Masa & Tarikh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {apiLogs.length > 0 ? (
                  apiLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors text-xs">
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] mr-2">
                          {log.method}
                        </span>
                        <code className="text-white/80 font-mono">{log.endpoint}</code>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.statusCode === 200 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {log.statusText}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-white">
                        {log.productName}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                        RM {Number(log.priceMyr || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-white/70">
                        {log.userIdentifier}
                      </td>
                      <td className="py-3 px-3 text-right text-white/40 text-[11px]">
                        {new Date(log.createdAt).toLocaleDateString("ms-MY")} {new Date(log.createdAt).toLocaleTimeString("ms-MY", { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-white/40 text-sm">
                      Tiada log permintaan API dicatatkan lagi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* LOGS PAGINATION */}
          {logsPagination && logsPagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5 text-xs text-white/50">
              <span>Halaman {logsPage} daripada {logsPagination.totalPages}</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={logsPage <= 1}
                  onClick={() => setLogsPage(logsPage - 1)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={logsPage >= logsPagination.totalPages}
                  onClick={() => setLogsPage(logsPage + 1)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* PUBLIC API ENDPOINT DOCUMENTATION */}
        <div className="rounded-2xl bg-[#14192B] border border-white/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Status & Dokumentasi Endpoints API V1</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { method: "GET", path: "/api/v1/profile", desc: "Semak baki & maklumat akaun developer", limit: "60 req/min" },
              { method: "GET", path: "/api/v1/products", desc: "Senarai katalog produk & harga terkini", limit: "60 req/min" },
              { method: "POST", path: "/api/v1/order", desc: "Buat pesanan automatik via API", limit: "10 req/min" },
              { method: "POST", path: "/api/v1/order/status", desc: "Semak status pesanan semasa", limit: "60 req/min" },
            ].map((ep, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ep.method === 'GET' ? 'bg-sky-500/20 text-sky-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {ep.method}
                  </span>
                  <span className="text-[10px] text-white/40">{ep.limit}</span>
                </div>
                <p className="font-mono text-xs font-bold text-white">{ep.path}</p>
                <p className="text-[11px] text-white/50 leading-relaxed">{ep.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* GENERATE NEW API KEY MODAL */}
        <Dialog open={showGenerateModal} onOpenChange={setShowGenerateModal}>
          <DialogContent className="bg-[#14192B] border border-white/10 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Key className="h-5 w-5 text-sky-400" /> Jana Key API Developer Baru
              </DialogTitle>
            </DialogHeader>

            {generatedKey ? (
              <div className="space-y-4 pt-2">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                  <p className="font-bold mb-1 flex items-center gap-1">
                    <Check className="h-4 w-4" /> Kunci API Berjaya Dijana!
                  </p>
                  <p className="opacity-80">Sila salin Kunci API ini sekarang. Ia tidak akan ditunjukkan lagi untuk keselamatan.</p>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={generatedKey}
                    className="w-full h-11 pl-3 pr-12 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-sky-400 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(generatedKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white transition-all"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowGenerateModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white font-bold"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleGenerate} className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-white/70 block mb-1">Pilih Pengguna Developer</label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-sky-400"
                  >
                    <option value="" className="bg-[#14192B]">-- Pilih Pengguna --</option>
                    {(usersData?.data || []).map((u: any) => {
                      const userDisplay = u.username || u.name || u.email || (u.telegramId ? `TG: ${u.telegramId}` : u.id);
                      const secondary = u.email ? ` (${u.email})` : u.telegramId ? ` (TG: ${u.telegramId})` : "";
                      return (
                        <option key={u.id} value={u.id} className="bg-[#14192B]">
                          {userDisplay}{secondary}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-white/50">
                  Format Kunci: <code className="text-sky-400">kryz_live_...</code> (Enkripsi SHA-256)
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowGenerateModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white/70 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={generateMutation.isPending}
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-xs text-white font-bold transition-all"
                  >
                    {generateMutation.isPending ? "Menjana..." : "Jana Kunci API"}
                  </button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </AdminLayout>
  );
}
