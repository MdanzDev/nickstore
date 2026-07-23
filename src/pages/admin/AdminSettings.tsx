import { useState, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import { Switch } from "@/components/ui/switch";
import AdminLayout from "./AdminLayout";
import {
  Settings,
  Save,
  Loader2,
  ShieldAlert,
  Percent,
  Key,
  Mail,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

function SectionCard({ title, icon, iconColor = "#8B5CF6", children }: { title: string; icon: React.ReactNode; iconColor?: string; children: React.ReactNode }) {
  return (
    <div className="lg-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: `${iconColor}15`, border: `1px solid ${iconColor}25` }}>
          <div style={{ color: iconColor }} className="h-4 w-4">{icon}</div>
        </div>
        <h2 className="text-sm font-black uppercase tracking-widest text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function LgInput({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <label className="lg-label">{label}</label>
      <input className="lg-input w-full h-10 px-4 rounded-xl text-sm" {...props} />
    </div>
  );
}

export default function AdminSettings() {
  const { data: settingsData, isLoading, refetch } = trpc.settings.get.useQuery();
  const updateSettingsMutation = trpc.settings.update.useMutation({
    onSuccess: () => { toast.success("Pengaturan berhasil disimpan!"); refetch(); },
    onError: (err) => toast.error(err.message || "Gagal menyimpan pengaturan"),
  });

  const [markups, setMarkups] = useState({ customer: 4.5, gold: 2, platinum: 1.5, business: 1 });
  const [minSpend, setMinSpend] = useState({ gold: 500, platinum: 2000, business: 10000 });
  const [autoUpgrade, setAutoUpgrade] = useState(true);
  const [adminEmails, setAdminEmails] = useState("");
  const [providerApiKey, setProviderApiKey] = useState("");
  const [providerSecretKey, setProviderSecretKey] = useState("");

  useEffect(() => {
    if (settingsData?.data) {
      const d = settingsData.data;
      if (d.markups) setMarkups({ customer: d.markups.customer ?? 4.5, gold: d.markups.gold ?? 2, platinum: d.markups.platinum ?? 1.5, business: d.markups.business ?? 1 });
      if (d.role_settings) {
        setAutoUpgrade(d.role_settings.autoUpgrade ?? true);
        if (d.role_settings.minimumSpend) setMinSpend({ gold: d.role_settings.minimumSpend.gold ?? 500, platinum: d.role_settings.minimumSpend.platinum ?? 2000, business: d.role_settings.minimumSpend.business ?? 10000 });
      }
      if (Array.isArray(d.admin_emails)) setAdminEmails(d.admin_emails.join(", "));
      setProviderApiKey(d.provider_api_key || "");
      setProviderSecretKey(d.provider_secret_key || "");
    }
  }, [settingsData]);

  const handleSave = () => {
    const emailList = adminEmails.split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
    updateSettingsMutation.mutate({ markups, admin_emails: emailList, provider_api_key: providerApiKey, provider_secret_key: providerSecretKey, role_settings: { minimumSpend: minSpend, autoUpgrade } });
  };

  const isSaving = updateSettingsMutation.isPending;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Settings className="h-6 w-6 text-[#8B5CF6]" /> Pengaturan Platform
            </h1>
            <p className="text-sm text-white/40 mt-1">Konfigurasi markup, API keys, dan akses admin</p>
          </div>
          <button
            className="lg-btn-ghost flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
            onClick={() => refetch()} disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="py-24 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#8B5CF6]" />
            <p className="text-sm text-white/40 mt-3">Memuat konfigurasi sistem...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 pb-12">
            {/* Markup Config */}
            <SectionCard title="Markup Harga per Tier (%)" icon={<Percent />} iconColor="#34D399">
              <p className="text-xs text-white/40">Markup ditambahkan otomatis pada harga modal provider.</p>
              <div className="grid grid-cols-2 gap-4">
                <LgInput label="Customer / Guest" type="number" value={markups.customer} onChange={(e) => setMarkups({ ...markups, customer: Number(e.target.value) })} disabled={isSaving} />
                <LgInput label="Gold Partner" type="number" value={markups.gold} onChange={(e) => setMarkups({ ...markups, gold: Number(e.target.value) })} disabled={isSaving} />
                <LgInput label="Platinum Partner" type="number" value={markups.platinum} onChange={(e) => setMarkups({ ...markups, platinum: Number(e.target.value) })} disabled={isSaving} />
                <LgInput label="Business Partner" type="number" value={markups.business} onChange={(e) => setMarkups({ ...markups, business: Number(e.target.value) })} disabled={isSaving} />
              </div>
            </SectionCard>

            {/* Auto Upgrade Config */}
            <SectionCard title="Rules Upgrade Tier & Spends (MYR)" icon={<TrendingUp />} iconColor="#8B5CF6">
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div>
                  <p className="text-xs font-black text-white">Auto Upgrade System</p>
                  <p className="text-[10px] text-white/40 mt-0.5">Upgrade otomatis jika belanja melebihi minimum</p>
                </div>
                <Switch checked={autoUpgrade} onCheckedChange={setAutoUpgrade} disabled={isSaving} />
              </div>
              <div className="space-y-3">
                <LgInput label="Min. Belanja Gold Partner (MYR)" type="number" value={minSpend.gold} onChange={(e) => setMinSpend({ ...minSpend, gold: Number(e.target.value) })} disabled={isSaving || !autoUpgrade} />
                <LgInput label="Min. Belanja Platinum Partner (MYR)" type="number" value={minSpend.platinum} onChange={(e) => setMinSpend({ ...minSpend, platinum: Number(e.target.value) })} disabled={isSaving || !autoUpgrade} />
                <LgInput label="Min. Belanja Business Partner (MYR)" type="number" value={minSpend.business} onChange={(e) => setMinSpend({ ...minSpend, business: Number(e.target.value) })} disabled={isSaving || !autoUpgrade} />
              </div>
            </SectionCard>

            {/* Provider Credentials */}
            <SectionCard title="Kredensial Provider (Mytopupku)" icon={<Key />} iconColor="#D946EF">
              <p className="text-xs text-white/40">Untuk sinkronisasi produk & pemesanan real-time.</p>
              <div className="space-y-3">
                <LgInput label="Provider API Key" type="password" value={providerApiKey} onChange={(e) => setProviderApiKey(e.target.value)} placeholder="Masukkan API Key" disabled={isSaving} />
                <LgInput label="Provider Secret / Signature Key" type="password" value={providerSecretKey} onChange={(e) => setProviderSecretKey(e.target.value)} placeholder="Masukkan Secret Key" disabled={isSaving} />
              </div>
            </SectionCard>

            {/* Admin Emails */}
            <SectionCard title="Akses Administrator" icon={<Mail />} iconColor="#38BDF8">
              <p className="text-xs text-white/40">Daftar email Administrator. Pisahkan dengan koma (,).</p>
              <div className="space-y-1.5">
                <label className="lg-label">Email Administrator</label>
                <textarea
                  className="lg-input w-full min-h-[100px] px-4 py-3 rounded-xl text-sm resize-none"
                  value={adminEmails} onChange={(e) => setAdminEmails(e.target.value)}
                  placeholder="admin1@email.com, admin2@email.com" disabled={isSaving}
                />
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <ShieldAlert className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-red-400"><span className="font-black">Peringatan:</span> Kesalahan email dapat mengunci akses Admin Panel Anda.</p>
              </div>
            </SectionCard>

            {/* Actions */}
            <div className="md:col-span-2 flex justify-end gap-3">
              <button className="lg-btn-ghost px-6 py-2.5 rounded-xl text-sm font-bold" onClick={() => refetch()} disabled={isLoading || isSaving}>
                Reset Perubahan
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading || isSaving}
                className="lg-btn-primary px-6 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</> : <><Save className="h-4 w-4" /> Simpan Perubahan</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
