import { useState } from "react";
import AdminLayout from "./AdminLayout";
import { useCurrency } from "@/providers/CurrencyProvider";
import {
  Ticket,
  Plus,
  Trash2,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  Search,
  X,
  Megaphone,
  AlertTriangle,
  CheckCircle2,
  Info,
  Power
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "info" | "warning" | "success";
  createdAt: string;
  isActive: boolean;
}

const mockAnnouncements: Announcement[] = [
  { id: "1", title: "Maintenance Server Provider", content: "Server provider MyTopUpKu akan dikemas kini pada jam 02:00 pagi. Transaksi automatik diproses selepas maintenance.", type: "warning", createdAt: "2026-07-20", isActive: true },
  { id: "2", title: "Promosi Diskaun Topup API", content: "Dapatkan margin harga istimewa untuk integrator API yang memproses lebih 100 transaksi sehari.", type: "success", createdAt: "2026-07-15", isActive: true },
];

const EMPTY_VOUCHER_FORM = {
  code: "",
  type: "percentage" as "percentage" | "fixed",
  value: "",
  maxDiscount: "",
  minOrder: "",
  expiryDate: "",
  usageLimit: "",
};

export default function AdminVouchers() {
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState<"vouchers" | "announcements">("vouchers");

  // Vouchers State
  const [showCreateVoucher, setShowCreateVoucher] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [voucherForm, setVoucherForm] = useState(EMPTY_VOUCHER_FORM);
  const [voucherFilter, setVoucherFilter] = useState<"all" | "active" | "expired" | "exhausted" | "inactive">("all");
  const [voucherSearch, setVoucherSearch] = useState("");

  // Announcements State
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [showCreateAnno, setShowCreateAnno] = useState(false);
  const [annoForm, setAnnoForm] = useState({ title: "", content: "", type: "info" as "info" | "warning" | "success" });

  // tRPC Queries
  const vouchersQuery = trpc.vouchers.list.useQuery(undefined, { refetchOnWindowFocus: false });
  const createVoucherMutation = trpc.vouchers.create.useMutation({
    onSuccess: () => {
      vouchersQuery.refetch();
      setShowCreateVoucher(false);
      setVoucherForm(EMPTY_VOUCHER_FORM);
      toast.success("Kupon diskaun berjaya dicipta!");
    },
    onError: (error: any) => { toast.error(error.message || "Gagal mencipta kupon"); },
  });

  const toggleVoucherMutation = trpc.vouchers.toggleActive.useMutation({
    onSuccess: (data: any) => {
      vouchersQuery.refetch();
      toast.success(data.data?.isActive ? "Kupon diaktifkan" : "Kupon dinyahaktifkan");
    },
    onError: (error: any) => { toast.error(error.message || "Gagal mengubah status"); },
  });

  const deleteVoucherMutation = trpc.vouchers.delete.useMutation({
    onSuccess: () => { vouchersQuery.refetch(); toast.success("Kupon dihapus"); },
    onError: (error: any) => { toast.error(error.message || "Gagal menghapus kupon"); },
  });

  const handleCreateVoucher = () => {
    if (!voucherForm.code.trim() || !voucherForm.value || !voucherForm.expiryDate || !voucherForm.usageLimit) {
      toast.error("Lengkapkan semua medan wajib");
      return;
    }
    createVoucherMutation.mutate({
      code: voucherForm.code.toUpperCase().trim(),
      type: voucherForm.type,
      value: Number(voucherForm.value),
      maxDiscount: voucherForm.maxDiscount ? Number(voucherForm.maxDiscount) : undefined,
      minOrder: voucherForm.minOrder ? Number(voucherForm.minOrder) : undefined,
      expiryDate: voucherForm.expiryDate,
      usageLimit: Number(voucherForm.usageLimit),
    });
  };

  const handleCreateAnno = () => {
    if (!annoForm.title.trim() || !annoForm.content.trim()) {
      toast.error("Tajuk dan kandungan pengumuman wajib diisi");
      return;
    }
    setAnnouncements([{ id: Date.now().toString(), ...annoForm, createdAt: new Date().toISOString().split("T")[0], isActive: true }, ...announcements]);
    setShowCreateAnno(false);
    setAnnoForm({ title: "", content: "", type: "info" });
    toast.success("Pengumuman platform berjaya dicipta!");
  };

  const handleDeleteAnno = (id: string) => {
    setAnnouncements(announcements.filter((a) => a.id !== id));
    toast.success("Pengumuman dihapus");
  };

  const rawVouchers = vouchersQuery.data?.data || [];
  const filteredVouchers = rawVouchers.filter((v: any) => {
    if (voucherSearch && !v.code.toLowerCase().includes(voucherSearch.toLowerCase())) return false;
    if (voucherFilter === "active") return v.isActive;
    if (voucherFilter === "inactive") return !v.isActive;
    return true;
  });

  return (
    <AdminLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        
        {/* HEADER & HUB TAB SWITCHER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Kupon & Pengumuman Platform</h1>
            <p className="text-sm text-white/50 mt-1">Urus kode kupon diskaun promosi dan notifikasi pengumuman pelanggan</p>
          </div>

          {/* TAB BUTTONS */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-[#14192B] border border-white/10 self-start md:self-auto">
            <button
              onClick={() => setActiveTab("vouchers")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "vouchers"
                  ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Ticket className="h-4 w-4" /> Kode Kupon
            </button>
            <button
              onClick={() => setActiveTab("announcements")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "announcements"
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Megaphone className="h-4 w-4" /> Pengumuman Platform
            </button>
          </div>
        </div>

        {/* TAB 1: KODE KUPON */}
        {activeTab === "vouchers" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  value={voucherSearch}
                  onChange={(e) => setVoucherSearch(e.target.value)}
                  placeholder="Cari kod kupon..."
                  className="w-full h-10 pl-10 pr-10 rounded-xl bg-[#14192B] border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCreateVoucher(!showCreateVoucher)}
                  className="flex items-center gap-2 h-10 px-4 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-bold text-xs transition-all shadow-md shadow-amber-400/10"
                >
                  <Plus className="h-4 w-4" /> Cipta Kupon Baru
                </button>
                <button
                  onClick={() => vouchersQuery.refetch()}
                  disabled={vouchersQuery.isFetching}
                  className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#14192B] border border-white/10 text-sm text-white/70 hover:text-white"
                >
                  <RefreshCw className={`h-4 w-4 ${vouchersQuery.isFetching ? 'animate-spin' : ''}`} />
                  Muat Semula
                </button>
              </div>
            </div>

            {/* Create Voucher Form */}
            {showCreateVoucher && (
              <div className="p-6 rounded-2xl bg-[#14192B] border border-white/10 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-amber-400" /> Cipta Kode Kupon Promosi Baru
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-1">Kod Kupon</label>
                    <input
                      type="text"
                      placeholder="Contoh: KRYZDISKAUN10"
                      value={voucherForm.code}
                      onChange={(e) => setVoucherForm({ ...voucherForm, code: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-1">Jenis Diskaun</label>
                    <select
                      value={voucherForm.type}
                      onChange={(e) => setVoucherForm({ ...voucherForm, type: e.target.value as any })}
                      className="w-full h-10 px-3 rounded-xl bg-[#0B0F19] border border-white/10 text-sm text-white"
                    >
                      <option value="percentage">Peratusan (%)</option>
                      <option value="fixed">Jumlah Tetap (MYR)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-1">Nilai Diskaun</label>
                    <input
                      type="number"
                      placeholder={voucherForm.type === 'percentage' ? '10 (untuk 10%)' : '5.00'}
                      value={voucherForm.value}
                      onChange={(e) => setVoucherForm({ ...voucherForm, value: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-1">Had Penggunaan</label>
                    <input
                      type="number"
                      placeholder="Contoh: 100"
                      value={voucherForm.usageLimit}
                      onChange={(e) => setVoucherForm({ ...voucherForm, usageLimit: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-1">Tarikh Luput</label>
                    <input
                      type="date"
                      value={voucherForm.expiryDate}
                      onChange={(e) => setVoucherForm({ ...voucherForm, expiryDate: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-[#0B0F19] border border-white/10 text-sm text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setShowCreateVoucher(false)} className="px-4 py-2 rounded-xl bg-white/5 text-xs text-white/70 font-semibold">Batal</button>
                  <button onClick={handleCreateVoucher} disabled={createVoucherMutation.isPending} className="px-4 py-2 rounded-xl bg-amber-400 text-black text-xs font-bold">
                    {createVoucherMutation.isPending ? "Mencipta..." : "Simpan Kupon"}
                  </button>
                </div>
              </div>
            )}

            {/* Vouchers Table */}
            <div className="rounded-2xl bg-[#14192B] border border-white/5 p-5">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-white/40 text-[11px] uppercase font-semibold">
                      <th className="pb-3 px-3">Kod Kupon</th>
                      <th className="pb-3 px-3">Jenis & Nilai</th>
                      <th className="pb-3 px-3 text-center">Penggunaan</th>
                      <th className="pb-3 px-3 text-right">Tarikh Luput</th>
                      <th className="pb-3 px-3 text-center">Status</th>
                      <th className="pb-3 px-3 text-center">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredVouchers.map((v: any) => (
                      <tr key={v.id} className="hover:bg-white/[0.02] text-xs">
                        <td className="py-3 px-3 font-mono font-bold text-amber-400">{v.code}</td>
                        <td className="py-3 px-3 font-bold text-white">
                          {v.type === 'percentage' ? `${v.value}% OFF` : `RM ${Number(v.value).toFixed(2)} OFF`}
                        </td>
                        <td className="py-3 px-3 text-center text-white/70">
                          {v.usageCount} / {v.usageLimit}
                        </td>
                        <td className="py-3 px-3 text-right text-white/40 text-[11px]">
                          {v.expiryDate ? new Date(v.expiryDate).toLocaleDateString("ms-MY") : "-"}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${v.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {v.isActive ? 'Aktif' : 'Nyahaktif'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => toggleVoucherMutation.mutate({ id: v.id })}
                              className="p-1.5 rounded-lg bg-white/5 text-amber-400 hover:bg-white/10"
                            >
                              <Power className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => deleteVoucherMutation.mutate({ id: v.id })}
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PENGUMUMAN PLATFORM */}
        {activeTab === "announcements" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-orange-400" /> Senarai Pengumuman & Banner Notis
              </h3>
              <button
                onClick={() => setShowCreateAnno(!showCreateAnno)}
                className="flex items-center gap-2 h-10 px-4 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-500/10"
              >
                <Plus className="h-4 w-4" /> Cipta Pengumuman Baru
              </button>
            </div>

            {showCreateAnno && (
              <div className="p-6 rounded-2xl bg-[#14192B] border border-white/10 space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-1">Tajuk Pengumuman</label>
                    <input
                      type="text"
                      placeholder="Contoh: Maintenance Server Provider"
                      value={annoForm.title}
                      onChange={(e) => setAnnoForm({ ...annoForm, title: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-1">Kandungan Pengumuman</label>
                    <textarea
                      placeholder="Isi makluman..."
                      value={annoForm.content}
                      onChange={(e) => setAnnoForm({ ...annoForm, content: e.target.value })}
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white h-24"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-1">Jenis Notis</label>
                    <select
                      value={annoForm.type}
                      onChange={(e) => setAnnoForm({ ...annoForm, type: e.target.value as any })}
                      className="w-full h-10 px-3 rounded-xl bg-[#0B0F19] border border-white/10 text-sm text-white"
                    >
                      <option value="info">Info (Biru)</option>
                      <option value="warning">Amaran / Maintenance (Kuning)</option>
                      <option value="success">Promosi / Tawaran (Hijau)</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setShowCreateAnno(false)} className="px-4 py-2 rounded-xl bg-white/5 text-xs text-white/70 font-semibold">Batal</button>
                  <button onClick={handleCreateAnno} className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold">Simpan Pengumuman</button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="p-4 rounded-2xl bg-[#14192B] border border-white/5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${a.type === 'warning' ? 'bg-amber-500/20 text-amber-400' : a.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-sky-500/20 text-sky-400'}`}>
                        {a.type.toUpperCase()}
                      </span>
                      <h4 className="font-bold text-sm text-white">{a.title}</h4>
                    </div>
                    <p className="text-xs text-white/60">{a.content}</p>
                    <p className="text-[10px] text-white/30 pt-1">{a.createdAt}</p>
                  </div>
                  <button onClick={() => handleDeleteAnno(a.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}