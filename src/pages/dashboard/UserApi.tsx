import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import UserDashboardLayout from "./UserDashboardLayout";
import { Key, Copy, Check, EyeOff, Loader2, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";

export default function UserApi() {
  const [copied, setCopied] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  const { data: apiKeyData, isLoading, refetch } = trpc.users.getApiKey.useQuery();
  const generateApiKey = trpc.users.generateApiKey.useMutation({
    onSuccess: (data) => {
      setNewKey(data.api_key);
      toast.success("API Key berhasil dibuat!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Gagal membuat API Key: ${error.message}`);
    }
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Disalin ke clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    if (confirm("Perhatian: Menghasilkan kunci baru akan segera menonaktifkan kunci yang lama. Apakah Anda yakin ingin melanjutkan?")) {
      setNewKey(null);
      generateApiKey.mutate();
    }
  };

  return (
    <UserDashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Key className="w-6 h-6 text-amber-400" /> API Settings
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Kelola API Key Anda untuk integrasi layanan top-up secara otomatis via REST API V1.
            </p>
          </div>
        </div>

        {/* Security Warning Notice */}
        <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-4 flex gap-3 text-amber-200 text-sm">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-300">Pengingat Keamanan API Key V2</p>
            <p className="text-amber-200/80 leading-relaxed">
              Kunci API Anda kini disimpan secara aman menggunakan Hash (SHA-256). Kunci penuh hanya akan ditampilkan <strong>satu kali</strong> saat dibuat. Simpan kunci Anda di tempat yang aman. Kunci API memberikan akses langsung ke saldo akun Anda.
            </p>
          </div>
        </div>

        {/* Secret Key Displayed Once Alert */}
        {newKey && (
          <Card className="bg-emerald-950/40 border-emerald-500/50 p-6 space-y-4 rounded-xl shadow-lg shadow-emerald-950/20">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-lg">
              <Check className="w-5 h-5" /> API Key Baru Berhasil Dibuat
            </div>
            <p className="text-sm text-slate-300">
              Salin kunci ini sekarang. <strong>Anda tidak akan dapat melihat kunci ini lagi!</strong>
            </p>
            <div className="flex gap-2">
              <Input 
                value={newKey} 
                readOnly 
                className="font-mono text-sm bg-slate-900/80 border-emerald-500/40 text-emerald-300 tracking-wider"
              />
              <Button 
                onClick={() => handleCopy(newKey)} 
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex gap-2 shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Tersalin!" : "Salin Key"}
              </Button>
            </div>
          </Card>
        )}

        {/* Main API Key Status Card */}
        <Card className="bg-slate-900/70 border-slate-800 p-6 space-y-6 rounded-xl">
          <h2 className="text-lg font-semibold text-slate-200">Kunci API Aktif</h2>

          {isLoading ? (
            <div className="flex items-center gap-2 text-slate-400 py-4">
              <Loader2 className="w-5 h-5 animate-spin text-amber-400" /> Memuat data API Key...
            </div>
          ) : apiKeyData?.api_key ? (
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-slate-400">Prefix Kunci (Masked)</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input 
                    value={`${apiKeyData.api_key.key_prefix}****************...`} 
                    readOnly 
                    className="font-mono text-sm bg-slate-950/60 border-slate-800 text-slate-300"
                  />
                  <Button 
                    variant="outline"
                    onClick={handleRegenerate}
                    disabled={generateApiKey.isLoading}
                    className="border-amber-500/40 hover:bg-amber-500/10 text-amber-400 font-medium shrink-0 flex gap-2"
                  >
                    {generateApiKey.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                    Regenerate Key
                  </Button>
                </div>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-4 pt-2">
                <span>Terakhir Digunakan: {apiKeyData.api_key.last_used_at ? new Date(apiKeyData.api_key.last_used_at).toLocaleString("id-ID") : "Belum pernah"}</span>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <EyeOff className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-slate-300 font-medium">Belum Ada API Key</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Anda belum memiliki API Key yang aktif. Buat kunci API untuk menghubungkan aplikasi Anda dengan sistem top-up Kryz-Net.
                </p>
              </div>
              <Button 
                onClick={() => generateApiKey.mutate()} 
                disabled={generateApiKey.isLoading}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold"
              >
                {generateApiKey.isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Key className="w-4 h-4 mr-2" />}
                Buat API Key
              </Button>
            </div>
          )}
        </Card>

        {/* Documentation Card */}
        <Card className="bg-slate-900/40 border-slate-800 p-6 space-y-4 rounded-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-200">Dokumentasi Ringkas</h2>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => window.open('/docs', '_blank')}
              className="border-amber-500/40 hover:bg-amber-500/10 text-amber-400"
            >
              Lihat Dokumentasi Lengkap
            </Button>
          </div>
          <div className="space-y-3 text-sm text-slate-300">
            <p>Gunakan header <code>Authorization: Bearer kryz_live_...</code> pada setiap request API.</p>
            <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-slate-300 overflow-x-auto space-y-2 border border-slate-800">
              <div><span className="text-emerald-400">GET</span> /api/v1/profile - Cek saldo akun</div>
              <div><span className="text-emerald-400">GET</span> /api/v1/products - Daftar produk & harga</div>
              <div><span className="text-amber-400">POST</span> /api/v1/order - Order top-up (Sertakan Header: <code>Idempotency-Key</code>)</div>
              <div><span className="text-emerald-400">GET</span> /api/v1/order/:id - Cek status order</div>
              <div><span className="text-amber-400">POST</span> /api/v1/deposit - Request deposit saldo baru via QRIS</div>
            </div>
          </div>
        </Card>
      </div>
    </UserDashboardLayout>
  );
}
