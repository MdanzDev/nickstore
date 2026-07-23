import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Gamepad2,
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function ResetPassword() {
  const navigate = useNavigate();

  // Detect if we have a recovery token in the URL (from Supabase email link)
  const [hasRecoveryToken, setHasRecoveryToken] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);

  // Step 1: Request reset email
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // Step 2: Set new password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Check URL hash for Supabase recovery token
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", "?"));
    const type = params.get("type");
    const accessToken = params.get("access_token");

    if ((type === "recovery" || type === "magiclink") && accessToken) {
      setHasRecoveryToken(true);
      sessionStorage.setItem("recovery_token", accessToken);
    }
    setTokenChecked(true);
  }, []);

  // Mutations
  const forgotMutation = trpc.auth.forgotPassword.useMutation({
    onSuccess: () => {
      setEmailSent(true);
      toast.success("Email reset telah dihantar!", {
        description: "Semak inbox atau folder spam anda.",
      });
    },
    onError: (err) => {
      toast.error(err.message || "Gagal menghantar email reset");
    },
  });

  const updatePasswordMutation = trpc.auth.updatePassword.useMutation({
    onSuccess: () => {
      toast.success("Password berjaya ditukar! 🎉", {
        description: "Anda akan dialihkan ke halaman login...",
        duration: 3000,
      });
      sessionStorage.removeItem("recovery_token");
      setTimeout(() => navigate("/login?message=password_reset"), 2500);
    },
    onError: (err) => {
      toast.error(err.message || "Gagal menukar password");
    },
  });

  const handleRequestReset = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast.error("Sila masukkan email yang sah");
        return;
      }
      forgotMutation.mutate({ email: email.trim().toLowerCase() });
    },
    [email, forgotMutation]
  );

  const handleUpdatePassword = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (newPassword.length < 8) {
        setPasswordError("Password mestilah sekurang-kurangnya 8 aksara");
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError("Password tidak sepadan");
        return;
      }
      setPasswordError("");
      updatePasswordMutation.mutate({ newPassword });
    },
    [newPassword, confirmPassword, updatePasswordMutation]
  );

  if (!tokenChecked) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden pt-24 pb-12">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-[#8B5CF6]/10 to-transparent blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-t from-[#D946EF]/5 to-transparent blur-[120px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-md relative z-10">
        <div className="rounded-[2rem] border border-white/10 bg-[#0B0A10]/80 backdrop-blur-xl shadow-2xl p-8 lg:p-10">
          {/* Header */}
          <div className="mb-10 animate-in slide-in-from-top-4 fade-in duration-500">
            <div className="flex items-center gap-3 mb-8 justify-center">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#D946EF] flex items-center justify-center shadow-[0_0_20px_rgba(255,107,0,0.3)]">
                <Gamepad2 className="h-6 w-6 text-black" />
              </div>
              <div>
                <span className="font-black text-xl tracking-wide uppercase text-white">Nick<span>Store</span></span>
                <p className="text-[10px] text-white/50 tracking-[0.2em] uppercase font-black">Platform Top Up #1 Malaysia</p>
              </div>
            </div>

            <div className="flex items-center justify-center mb-6">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#D946EF]/5 flex items-center justify-center border border-[#8B5CF6]/30 shadow-[0_0_30px_rgba(255,107,0,0.2)]">
                {hasRecoveryToken ? (
                  <ShieldCheck className="h-10 w-10 text-[#D946EF]" />
                ) : (
                  <KeyRound className="h-10 w-10 text-[#D946EF]" />
                )}
              </div>
            </div>

            <h1 className="text-2xl font-black text-center text-white tracking-tight uppercase">
              {hasRecoveryToken ? "Tetapkan Password Baru" : "Lupa Password?"}
            </h1>
            <p className="text-[10px] text-white/50 mt-2 text-center uppercase tracking-widest font-black">
              {hasRecoveryToken
                ? "Masukkan password baru untuk akun Anda"
                : "Masukkan email dan kami akan kirim tautan reset"}
            </p>
          </div>

          {/* ── STATE: Token present — show set new password form ── */}
          {hasRecoveryToken ? (
            <form
              onSubmit={handleUpdatePassword}
              className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500"
            >
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-xs font-black uppercase tracking-widest text-white/70 flex items-center gap-1">
                  Password Baru <span className="text-[#8B5CF6]">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 8 karakter"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError("");
                    }}
                    className={`pl-11 pr-11 h-12 bg-white/[0.02] border-white/10 text-white placeholder:text-white/30 rounded-xl transition-all focus:bg-white/[0.05] focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/50 ${passwordError ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/50" : ""}`}
                    disabled={updatePasswordMutation.isPending}
                    autoComplete="new-password"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-xs font-black uppercase tracking-widest text-white/70 flex items-center gap-1">
                  Sahkan Password <span className="text-[#8B5CF6]">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                  <Input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Masukkan ulang password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError("");
                    }}
                    className={`pl-11 pr-11 h-12 bg-white/[0.02] border-white/10 text-white placeholder:text-white/30 rounded-xl transition-all focus:bg-white/[0.05] focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/50 ${passwordError ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/50" : ""}`}
                    disabled={updatePasswordMutation.isPending}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-xs text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1 font-medium mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {passwordError}
                  </p>
                )}
              </div>

              {/* Password strength hint */}
              {newPassword && (
                <div className="space-y-1 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  {[
                    { ok: newPassword.length >= 8, label: "Minimal 8 karakter" },
                    { ok: /[A-Z]/.test(newPassword), label: "Ada huruf besar" },
                    { ok: /[0-9]/.test(newPassword), label: "Ada angka" },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${item.ok ? "text-emerald-500" : "text-white/30"}`}>
                      <CheckCircle2 className={`h-3.5 w-3.5 ${item.ok ? "text-emerald-500" : "text-white/20"}`} />
                      {item.label}
                    </div>
                  ))}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-14 mt-4 rounded-xl text-xs font-black tracking-widest uppercase bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] hover:from-[#D946EF] hover:to-[#8B5CF6] text-black transition-all duration-300 hover:scale-[1.02] shadow-[0_0_20px_rgba(255,107,0,0.3)] hover:shadow-[0_0_30px_rgba(255,184,0,0.5)] border-0"
                disabled={updatePasswordMutation.isPending}
              >
                {updatePasswordMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-black" />
                    Menyimpan...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    Simpan Password Baru
                  </span>
                )}
              </Button>
            </form>
          ) : emailSent ? (
            /* ── STATE: Email sent confirmation ── */
            <div className="text-center space-y-6 animate-in fade-in duration-500">
              <div className="flex items-center justify-center">
                <div className="h-20 w-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
              </div>
              <div>
                <p className="text-xl font-black text-white uppercase tracking-tight">Email Terkirim!</p>
                <p className="text-[10px] text-white/50 mt-3 font-medium uppercase tracking-widest leading-relaxed">
                  Cek inbox <span className="text-[#D946EF]">{email}</span> untuk tautan reset password. Periksa juga folder spam.
                </p>
              </div>
              <div className="pt-4 space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl bg-transparent border-white/10 text-white/70 hover:bg-white/[0.05] hover:text-white text-[10px] font-black tracking-widest uppercase"
                  onClick={() => {
                    setEmailSent(false);
                    forgotMutation.reset();
                  }}
                >
                  Coba Email Lain
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full h-12 rounded-xl bg-transparent text-[#D946EF] hover:bg-white/[0.05] hover:text-[#8B5CF6] text-[10px] font-black tracking-widest uppercase transition-colors" 
                  onClick={() => navigate("/login")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Login
                </Button>
              </div>
            </div>
          ) : (
            /* ── STATE: Request reset email form ── */
            <form
              onSubmit={handleRequestReset}
              className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500"
            >
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-xs font-black uppercase tracking-widest text-white/70 flex items-center gap-1">
                  Alamat Email <span className="text-[#8B5CF6]">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="contoh@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 bg-white/[0.02] border-white/10 text-white placeholder:text-white/30 rounded-xl transition-all focus:bg-white/[0.05] focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/50"
                    disabled={forgotMutation.isPending}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 rounded-xl text-xs font-black tracking-widest uppercase bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] hover:from-[#D946EF] hover:to-[#8B5CF6] text-black transition-all duration-300 hover:scale-[1.02] shadow-[0_0_20px_rgba(255,107,0,0.3)] hover:shadow-[0_0_30px_rgba(255,184,0,0.5)] border-0 mt-4"
                disabled={forgotMutation.isPending}
              >
                {forgotMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-black" />
                    Menghantar...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Kirim Tautan Reset
                  </span>
                )}
              </Button>

              <div className="flex items-center justify-center pt-4 border-t border-white/10 mt-6">
                <Link
                  to="/login"
                  className="text-[10px] font-black uppercase tracking-widest text-[#D946EF] hover:text-[#8B5CF6] transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
