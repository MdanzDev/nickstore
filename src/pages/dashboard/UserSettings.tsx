import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import UserDashboardLayout from "./UserDashboardLayout";
import { User, Camera, Copy, Check, MessageSquare, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function UserSettings() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [copied, setCopied] = useState(false);
  
  // OTP States
  const [otpMode, setOtpMode] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  // Password States
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      if (!otpMode) setPhone(user.phone || "");
    }
  }, [user, otpMode]);

  const updateMutation = trpc.users.updateMe.useMutation({
    onSuccess: () => {
      toast.success("Profil berhasil diperbarui!");
      refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Gagal memperbarui profil");
    },
  });

  const updatePasswordMutation = trpc.auth.updatePassword.useMutation({
    onSuccess: () => {
      toast.success("Kata laluan berjaya ditukar!");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error) => {
      toast.error(error.message || "Gagal menukar kata laluan");
    },
  });

  const requestOtpMutation = trpc.users.requestPhoneOtp.useMutation({
    onSuccess: () => {
      toast.success("OTP WhatsApp terkirim! Silakan periksa pesan Anda.");
      setOtpMode(true);
    },
    onError: (error) => {
      toast.error(error.message || "Gagal mengirim OTP.");
    },
  });

  const verifyOtpMutation = trpc.users.verifyPhoneOtp.useMutation({
    onSuccess: () => {
      toast.success("Nomor telepon berhasil diverifikasi dan disimpan!");
      setOtpMode(false);
      setOtpCode("");
      refresh();
    },
    onError: (error) => {
      toast.error(error.message || "OTP salah atau kedaluwarsa.");
    },
  });

  const unlinkTelegramMutation = trpc.users.unlinkTelegram.useMutation({
    onSuccess: () => {
      toast.success("Akaun Telegram berjaya dinyahpautkan.");
      refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Gagal menyahpautkan Telegram.");
    },
  });

  const handleSave = () => {
    if (!name.trim()) return toast.error("Username tidak boleh kosong");
    
    const payload: any = { name: name.trim() };
    if (email.trim() !== (user?.email || "")) {
      payload.email = email.trim();
    }
    
    if (phone.trim() !== (user?.phone || "")) {
       if (!phone.trim()) {
           payload.phone = "";
           updateMutation.mutate(payload);
       } else {
           requestOtpMutation.mutate({ phone: phone.trim() });
       }
    } else {
       updateMutation.mutate(payload);
    }
  };

  const handleVerifyOtp = () => {
    if (!otpCode || otpCode.length < 4) return toast.error("Masukkan kode OTP yang valid");
    verifyOtpMutation.mutate({ phone: phone.trim(), code: otpCode });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Disalin!");
  };

  const handleUpdatePassword = () => {
    if (newPassword.length < 8) return toast.error("Kata laluan mestilah sekurang-kurangnya 8 aksara");
    if (newPassword !== confirmPassword) return toast.error("Kata laluan tidak sepadan");
    updatePasswordMutation.mutate({ newPassword });
  };

  return (
    <UserDashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto relative z-10">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-white">Pengaturan</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mt-1">Kelola informasi profil dan akun Anda.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Profile */}
          <div className="p-8 rounded-[1.5rem] h-fit bg-[#0c101e]/80 border border-white/10 shadow-[0_0_30px_rgba(255,107,0,0.05)] backdrop-blur-xl hover:-translate-y-1 transition-transform duration-300">
            <h2 className="text-sm font-black uppercase tracking-tight text-white mb-6 flex items-center gap-2">
              <User className="h-4 w-4 text-[#FF6B00]" />
              Profil Saya
            </h2>
            <div className="space-y-6">
              <div className="flex items-center gap-5">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#FFB800] flex items-center justify-center shadow-[0_0_20px_rgba(255,107,0,0.3)]">
                  <span className="text-3xl font-black text-black">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <Button variant="outline" size="sm" className="h-9 rounded-xl border-white/10 hover:border-[#FF6B00]/50 hover:bg-[#FF6B00]/10 text-white transition-colors">
                    <Camera className="mr-2 h-3.5 w-3.5 text-[#FFB800]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Ubah Avatar</span>
                  </Button>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mt-2">Maksimal ukuran gambar 2MB.</p>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="username" className="text-[9px] font-black uppercase tracking-widest text-[#FFB800]">Username</Label>
                <Input id="username" value={name} onChange={(e) => setName(e.target.value)} disabled={otpMode} className="h-11 rounded-xl bg-white/5 border border-white/10 px-4 text-xs font-black uppercase tracking-widest text-white focus:border-[#FF6B00]/50 focus:ring-1 focus:ring-[#FF6B00]/50 transition-colors disabled:opacity-50" />
              </div>

              <div className="space-y-3 mt-4">
                <Label htmlFor="email" className="text-[9px] font-black uppercase tracking-widest text-[#FFB800]">Emel</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={otpMode} className="h-11 rounded-xl bg-white/5 border border-white/10 px-4 text-xs font-black uppercase tracking-widest text-white focus:border-[#FF6B00]/50 focus:ring-1 focus:ring-[#FF6B00]/50 transition-colors disabled:opacity-50" />
              </div>

              {!otpMode ? (
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-[9px] font-black uppercase tracking-widest text-[#FFB800]">Nomor Telepon / WhatsApp</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08XXXXXXXXXX" className="h-11 rounded-xl bg-white/5 border border-white/10 px-4 text-xs font-black uppercase tracking-widest text-white focus:border-[#FF6B00]/50 focus:ring-1 focus:ring-[#FF6B00]/50 transition-colors placeholder:text-white/20" />
                  {phone && phone !== user?.phone && (
                    <p className="text-[9px] font-black uppercase tracking-widest text-amber-500 mt-2">Nomor telepon baru memerlukan verifikasi OTP WhatsApp.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3 bg-[#FF6B00]/5 p-5 rounded-2xl border border-[#FF6B00]/20">
                  <Label htmlFor="otp" className="text-[9px] font-black uppercase tracking-widest text-[#FFB800]">Masukkan Kode OTP</Label>
                  <Input 
                    id="otp" 
                    value={otpCode} 
                    onChange={(e) => setOtpCode(e.target.value)} 
                    placeholder="123456" 
                    type="number"
                    className="h-11 rounded-xl bg-black/20 border border-white/10 px-4 text-center text-lg font-black tracking-[0.5em] text-white focus:border-[#FF6B00]/50 focus:ring-1 focus:ring-[#FF6B00]/50 transition-colors placeholder:text-white/20 placeholder:tracking-normal"
                  />
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/50 mt-2">
                    Kode 6-digit telah dikirim ke WhatsApp <span className="text-white">{phone}</span>.
                  </p>
                  <div className="flex gap-3 mt-5">
                    <Button 
                      className="h-11 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FFB800] text-black font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-transform flex-1"
                      onClick={handleVerifyOtp}
                      disabled={verifyOtpMutation.isPending}
                    >
                      Verifikasi OTP
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setOtpMode(false)}
                      disabled={verifyOtpMutation.isPending}
                      className="h-11 rounded-xl border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-white"
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              )}

              {!otpMode && (
                <Button
                  className="w-full h-12 mt-4 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FFB800] text-black font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-transform"
                  onClick={handleSave}
                  disabled={updateMutation.isPending || requestOtpMutation.isPending}
                >
                  <User className="mr-2 h-4 w-4" />
                  {phone !== (user?.phone || "") && phone.trim() !== "" ? "Verifikasi & Simpan" : "Simpan Perubahan"}
                </Button>
              )}
            </div>
          </div>

          {/* Account Info & Telegram Link */}
          <div className="space-y-6">
            <div className="p-8 rounded-[1.5rem] bg-[#0c101e]/80 border border-white/10 shadow-[0_0_30px_rgba(255,107,0,0.05)] backdrop-blur-xl hover:-translate-y-1 transition-transform duration-300">
              <h2 className="text-sm font-black uppercase tracking-tight text-white mb-6">Informasi Akun</h2>
              <div className="space-y-5">
                <div>
                  <Label className="text-[9px] font-black uppercase tracking-widest text-white/50">ID Pengguna</Label>
                  <div className="flex items-center mt-2">
                    <code className="bg-black/20 border border-white/5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-[#FFB800] break-all">{user?.id}</code>
                    <Button variant="ghost" size="icon" className="h-8 w-8 ml-2 text-white/40 hover:text-white hover:bg-white/5" onClick={() => handleCopy(user?.id || "")}>
                      {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-[9px] font-black uppercase tracking-widest text-white/50">Email Terdaftar</Label>
                  <p className="text-xs font-black uppercase tracking-widest text-white mt-1.5">{user?.email || "-"}</p>
                </div>
                <div>
                  <Label className="text-[9px] font-black uppercase tracking-widest text-white/50">Status WhatsApp</Label>
                  <div className="mt-1.5">
                    {user?.phone ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded border text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]">
                        <Check className="h-3 w-3" /> Terverifikasi ({user.phone})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded border text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border-amber-500/20">
                        Belum ditautkan
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-[1.5rem] bg-[#0c101e]/80 border border-white/10 shadow-[0_0_30px_rgba(255,107,0,0.05)] backdrop-blur-xl hover:-translate-y-1 transition-transform duration-300">
              <h2 className="text-sm font-black uppercase tracking-tight text-white mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#0088cc]" />
                Tautkan Telegram (Auto Sync)
              </h2>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-6">
                Pautkan akaun anda dengan Telegram Bot untuk menerima notifikasi transaksi & menguruskan akaun terus dari Telegram!
              </p>
              
              {user?.telegramId && !user.telegramId.startsWith('web_') ? (
                <div className="space-y-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start justify-between gap-4 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <Check className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Terhubung & Disinkronkan</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400/70 mt-1 font-mono">
                          Telegram ID: {user.telegramId}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    onClick={() => {
                      if (confirm("Adakah anda pasti ingin menyahpautkan akaun Telegram ini?")) {
                        unlinkTelegramMutation.mutate();
                      }
                    }}
                    disabled={unlinkTelegramMutation.isPending}
                    className="w-full h-10 rounded-xl border-red-500/30 hover:bg-red-500/10 text-red-400 hover:text-red-300 text-[10px] font-black uppercase tracking-widest"
                  >
                    {unlinkTelegramMutation.isPending ? "Nyahpautkan..." : "Nyahpautkan Akaun Telegram"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <a
                    href={`https://t.me/Topup_Kryz_bot?start=link_${user?.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-[#0088cc] hover:bg-[#0077bb] text-white font-black uppercase tracking-widest text-[10px] transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(0,136,204,0.3)]"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Hubungkan Telegram via Bot
                  </a>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Atau hantar arahan ini ke @Topup_Kryz_bot:</p>
                    <div className="flex items-center justify-center gap-2 font-mono text-xs font-bold text-[#FFB800] bg-black/40 p-2 rounded-lg border border-white/10">
                      <code>/start link_{user?.id}</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-white/50 hover:text-white"
                        onClick={() => handleCopy(`/start link_${user?.id}`)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    onClick={() => refresh()}
                    className="w-full h-8 text-[9px] font-black uppercase tracking-widest text-white/50 hover:text-white"
                  >
                    🔄 Semak Status Pautan
                  </Button>
                </div>
              )}
            </div>

            <div className="p-8 rounded-[1.5rem] bg-[#0c101e]/80 border border-white/10 shadow-[0_0_30px_rgba(255,107,0,0.05)] backdrop-blur-xl hover:-translate-y-1 transition-transform duration-300">
              <h2 className="text-sm font-black uppercase tracking-tight text-white mb-2">Ubah Kata Laluan</h2>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-6">
                Pastikan akaun anda selamat dengan menggunakan kata laluan yang kuat.
              </p>
              
              <div className="space-y-5">
                <div className="space-y-3">
                  <Label htmlFor="new-password" className="text-[9px] font-black uppercase tracking-widest text-[#FFB800]">Kata Laluan Baru</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="MIN. 8 AKSARA"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-11 pr-11 h-11 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-white focus:border-[#FF6B00]/50 focus:ring-1 focus:ring-[#FF6B00]/50 transition-colors placeholder:text-white/20"
                      disabled={updatePasswordMutation.isPending}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="confirm-password" className="text-[9px] font-black uppercase tracking-widest text-[#FFB800]">Sahkan Kata Laluan</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                    <Input
                      id="confirm-password"
                      type={showConfirm ? "text" : "password"}
                      placeholder="MASUKKAN SEMULA"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        updatePasswordMutation.reset();
                      }}
                      className={`pl-11 pr-11 h-11 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-white focus:border-[#FF6B00]/50 focus:ring-1 focus:ring-[#FF6B00]/50 transition-colors placeholder:text-white/20 ${confirmPassword && newPassword !== confirmPassword ? '!border-red-500/50 focus:!ring-red-500/50' : ''}`}
                      disabled={updatePasswordMutation.isPending}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-[9px] font-black uppercase tracking-widest text-red-400 mt-2 animate-in fade-in slide-in-from-top-1">
                      Katalaluan tidak sepadan
                    </p>
                  )}
                  {newPassword && newPassword.length > 0 && newPassword.length < 8 && (
                    <p className="text-[9px] font-black uppercase tracking-widest text-amber-500 mt-2 animate-in fade-in slide-in-from-top-1">
                      Kata laluan terlalu pendek (min. 8 aksara)
                    </p>
                  )}
                </div>

                {updatePasswordMutation.isError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest p-4 rounded-xl animate-in fade-in slide-in-from-top-1 flex items-start gap-3 shadow-[0_0_15px_rgba(248,113,113,0.1)]">
                    <div className="w-2 h-2 rounded-full bg-red-400 mt-1 shrink-0" />
                    <p>{updatePasswordMutation.error.message}</p>
                  </div>
                )}

                <Button
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FFB800] text-black font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-transform mt-4 disabled:opacity-50"
                  onClick={handleUpdatePassword}
                  disabled={updatePasswordMutation.isPending || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 8}
                >
                  {updatePasswordMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Simpan Kata Laluan
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  );
}