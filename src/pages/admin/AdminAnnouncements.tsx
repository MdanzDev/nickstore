import { useState } from "react";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Megaphone,
  Plus,
  Trash2,
  Info,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "info" | "warning" | "success";
  createdAt: string;
  isActive: boolean;
}

const mockAnnouncements: Announcement[] = [
  { id: "1", title: "Maintenance Server", content: "Server akan di-maintenance pada tanggal 30 April 2026 pukul 02:00 WIB. Estimasi 30 menit.", type: "warning", createdAt: "2026-04-25", isActive: true },
  { id: "2", title: "Promo Cashback 10%", content: "Dapatkan cashback 10% untuk setiap transaksi minimal Rp 50.000. Berlaku hingga 5 Mei 2026.", type: "success", createdAt: "2026-04-20", isActive: true },
  { id: "3", title: "New Game Added", content: "Genshin Impact Crystals dan Honkai Star Rail Oneiric Shards sudah tersedia!", type: "info", createdAt: "2026-04-18", isActive: true },
];

const TYPE_CONFIG = {
  warning: { icon: AlertTriangle, color: "#FFB800", bg: "rgba(255,184,0,0.1)", border: "rgba(255,184,0,0.2)", label: "Warning" },
  success: { icon: CheckCircle2, color: "#00c864", bg: "rgba(0,200,100,0.1)", border: "rgba(0,200,100,0.2)", label: "Promo" },
  info:    { icon: Info, color: "#38BDF8", bg: "rgba(56,189,248,0.1)", border: "rgba(56,189,248,0.2)", label: "Info" },
};

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", type: "info" as "info" | "warning" | "success" });

  const handleCreate = () => {
    if (!form.title.trim() || !form.content.trim()) { toast.error("Judul dan konten wajib diisi"); return; }
    setAnnouncements([{ id: Date.now().toString(), ...form, createdAt: new Date().toISOString().split("T")[0], isActive: true }, ...announcements]);
    setShowCreate(false);
    setForm({ title: "", content: "", type: "info" });
    toast.success("Pengumuman berhasil dibuat!");
  };

  const handleDelete = (id: string) => {
    setAnnouncements(announcements.filter((a) => a.id !== id));
    toast.success("Pengumuman dihapus");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Pengumuman</h1>
            <p className="text-sm text-white/40 mt-1">Kelola pengumuman dan notifikasi platform</p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all ${showCreate ? "lg-btn-ghost" : "lg-btn-primary"}`}
          >
            {showCreate ? <><X className="h-4 w-4" /> Batal</> : <><Plus className="h-4 w-4" /> Buat Pengumuman</>}
          </button>
        </div>

        {/* Create Form */}
        {showCreate && (
          <div className="lg-card rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Buat Pengumuman Baru</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="lg-label">Judul</label>
                <input className="lg-input w-full h-11 px-4 rounded-xl text-sm" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Judul pengumuman..." />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="lg-label">Konten</label>
                <input className="lg-input w-full h-11 px-4 rounded-xl text-sm" value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Isi pengumuman..." />
              </div>
              <div className="space-y-1.5">
                <label className="lg-label">Tipe</label>
                <select className="lg-input w-full h-11 px-3 rounded-xl text-sm" value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as "info" | "warning" | "success" })}>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="success">Promo/Success</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button className="lg-btn-ghost px-5 py-2.5 rounded-xl text-sm font-bold" onClick={() => setShowCreate(false)}>Batal</button>
              <button className="lg-btn-primary px-5 py-2.5 rounded-xl text-sm font-black" onClick={handleCreate}>Publikasikan</button>
            </div>
          </div>
        )}

        {/* Announcement List */}
        <div className="space-y-3">
          {announcements.map((ann) => {
            const cfg = TYPE_CONFIG[ann.type];
            const CfgIcon = cfg.icon;
            return (
              <div key={ann.id} className="lg-card rounded-2xl p-5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                    <CfgIcon className="h-5 w-5" style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <h3 className="font-black text-white text-sm">{ann.title}</h3>
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                        {cfg.label}
                      </span>
                      {ann.isActive && (
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(0,200,100,0.1)", color: "#00c864", border: "1px solid rgba(0,200,100,0.2)" }}>
                          Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/50">{ann.content}</p>
                    <p className="text-[10px] text-white/30 mt-2 font-bold">{ann.createdAt}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(ann.id)}
                  className="p-2 rounded-xl hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20 shrink-0">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
