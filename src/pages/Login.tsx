import { useState, useCallback, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import SeoHead from "@/components/SeoHead";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Gamepad2,
  Eye,
  EyeOff,
  ArrowLeft,
  LogIn,
  Mail,
  Lock,
  Zap,
  Shield,
  Gift,
  Users,
  Star,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Crown,
  Loader2,
  MessageCircle,
  ShoppingCart,
  Wallet,
  Check,
} from "lucide-react";
import { toast } from "sonner";

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  
  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loginError, setLoginError] = useState<string | null>(null);

  // Refs
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Check for redirect message
  useEffect(() => {
    const message = searchParams.get("message");
    if (message === "session_expired") {
      toast.info("Sesi Anda telah berakhir. Silakan login kembali.");
    } else if (message === "registered") {
      toast.success("Pendaftaran berhasil! Silakan login.");
    } else if (message === "password_reset") {
      toast.success("Password berhasil direset. Silakan login.");
    }
  }, [searchParams]);

  // Login mutation
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      toast.success("Login berhasil! 🎉", {
        description: "Mengalihkan ke halaman utama...",
        duration: 2000,
      });
      
      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }
      
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 500);
    },
    onError: (error) => {
      const message = error.message || "Login gagal";
      setLoginError(message);
      
      // Handle specific errors
      if (message.toLowerCase().includes("email")) {
        setErrors(prev => ({ ...prev, email: message }));
      } else if (message.toLowerCase().includes("password")) {
        setErrors(prev => ({ ...prev, password: message }));
      } else if (message.toLowerCase().includes("verify")) {
        toast.error("Email belum diverifikasi. Cek inbox Anda.", {
          duration: 5000,
          action: {
            label: "Kirim Ulang",
            onClick: () => toast.info("Fitur kirim ulang verifikasi segera hadir"),
          },
        });
      } else {
        toast.error(message, {
          description: "Periksa kembali email dan password Anda",
        });
      }
    },
  });

  // Telegram WebApp / Bot Login State
  const [awaitingTelegramBot, setAwaitingTelegramBot] = useState(false);
  const [telegramBotUrl, setTelegramBotUrl] = useState("");
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Telegram WebApp Mutation
  const telegramWebAppMutation = trpc.auth.telegramWebApp.useMutation({
    onSuccess: (data) => {
      toast.success(`Selamat datang, ${data.user?.username || 'Pengguna Telegram'}! 🎉`, {
        description: "Log masuk Telegram berjaya...",
      });
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 500);
    },
    onError: (error) => {
      toast.error(error.message || "Gagal log masuk via Telegram");
      setAwaitingTelegramBot(false);
    },
  });

  const setSessionTokenMutation = trpc.auth.setSessionToken.useMutation();

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const handleTelegramLogin = useCallback(async () => {
    const tgUser = (window.Telegram?.WebApp?.initDataUnsafe?.user as any) || null;
    const initDataRaw = window.Telegram?.WebApp?.initData || "";
    
    // 1. If running INSIDE Telegram WebApp
    if (tgUser && tgUser.id) {
      telegramWebAppMutation.mutate({
        telegram_id: String(tgUser.id),
        username: tgUser.username,
        first_name: tgUser.first_name,
        last_name: tgUser.last_name,
        initDataRaw,
      });
      return;
    }

    // 2. If running in a REGULAR BROWSER -> Use Telegram Bot Deep-Link Authentication
    try {
      setAwaitingTelegramBot(true);
      const API_BASE = "https://api.kryz-net.space";
      let res: Response;
      try {
        res = await fetch("/api/v1/auth/telegram-login-code", { method: "POST" });
        if (!res.ok) throw new Error("Relative fetch 404, fallback to backend URL");
      } catch {
        res = await fetch(`${API_BASE}/api/v1/auth/telegram-login-code`, { method: "POST" });
      }

      const data = await res.json();
      
      if (!data.success || !data.code) {
        toast.error(data.error || "Gagal menghasilkan kod log masuk Telegram");
        setAwaitingTelegramBot(false);
        return;
      }

      const botUrl = data.botUrl || `https://t.me/NickStore_bot?start=${data.code}`;
      setTelegramBotUrl(botUrl);

      // Open Telegram Bot in a new window/tab or app
      window.open(botUrl, "_blank");

      // Start polling for approval every 2 seconds
      stopPolling();
      const code = data.code;

      pollTimerRef.current = setInterval(async () => {
        try {
          let pollRes: Response;
          try {
            pollRes = await fetch(`/api/v1/auth/telegram-login-status?code=${code}`);
            if (!pollRes.ok) throw new Error("Relative fetch 404");
          } catch {
            pollRes = await fetch(`${API_BASE}/api/v1/auth/telegram-login-status?code=${code}`);
          }
          const pollData = await pollRes.json();

          if (pollData.success && pollData.approved && pollData.token) {
            stopPolling();
            setAwaitingTelegramBot(false);

            // Store cookie for auth.me & authedQuery context
            document.cookie = `external_jwt=${pollData.token}; path=/; max-age=86400; SameSite=Lax`;
            try {
              await setSessionTokenMutation.mutateAsync({ token: pollData.token });
            } catch {}

            toast.success(`Log masuk Telegram berjaya! 🎉`, {
              description: `Selamat datang, ${pollData.user?.username || 'Pengguna Telegram'}!`,
            });
            setTimeout(() => {
              window.location.href = redirectTo;
            }, 500);
          }
        } catch {
          // Ignore transient network errors during polling
        }
      }, 2000);

    } catch (err: any) {
      toast.error(err.message || "Ralat memulakan log masuk Telegram");
      setAwaitingTelegramBot(false);
    }
  }, [telegramWebAppMutation, setSessionTokenMutation, stopPolling, redirectTo]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  // Auto focus email input & auto-trigger WebApp login if opened in Telegram
  useEffect(() => {
    emailInputRef.current?.focus();
    if (window.Telegram?.WebApp?.initData) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      handleTelegramLogin();
    }
  }, []);

  // Validation
  const validateField = useCallback((field: string, value: string): string => {
    switch (field) {
      case "email":
        if (!value.trim()) return "Email wajib diisi";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Format email tidak valid";
        return "";
      
      case "password":
        if (!value) return "Password wajib diisi";
        if (value.length < 6) return "Password minimal 6 karakter";
        return "";
      
      default:
        return "";
    }
  }, []);

  // Handlers
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setLoginError(null);
    
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => {
        const next = { ...prev };
        if (error) next[field] = error;
        else delete next[field];
        return next;
      });
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field as keyof typeof formData]);
    setErrors(prev => {
      const next = { ...prev };
      if (error) next[field] = error;
      else delete next[field];
      return next;
    });
  }, [formData, validateField]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    // Validate all fields
    const newErrors: Record<string, string> = {};
    const emailError = validateField("email", formData.email);
    const passwordError = validateField("password", formData.password);
    
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    setTouched({ email: true, password: true });

    if (Object.keys(newErrors).length > 0) {
      toast.error("Mohon perbaiki data yang salah");
      return;
    }

    loginMutation.mutate({
      email: formData.email.trim(),
      password: formData.password,
      rememberMe,
    });
  }, [formData, rememberMe, validateField, loginMutation]);

  const isLoading = loginMutation.isPending;
  const hasErrors = Object.keys(errors).length > 0;
  const allFieldsFilled = formData.email && formData.password;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden pt-24 pb-12">
      <SeoHead
        title="Log Masuk Akaun | NickStore"
        description="Log masuk ke akaun NickStore anda untuk menguruskan pesanan topup game, baki wallet & transaksi secara pantas."
      />
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-[#8B5CF6]/10 to-transparent blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-t from-[#D946EF]/5 to-transparent blur-[120px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-0 rounded-[2rem] border border-white/10 bg-[#0B0A10]/80 backdrop-blur-xl shadow-2xl relative z-10">
        {/* Left - Form */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          {/* Header */}
          <div className="mb-10 animate-in slide-in-from-top-4 fade-in duration-500">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#D946EF] flex items-center justify-center shadow-[0_0_20px_rgba(255,107,0,0.3)]">
                <Gamepad2 className="h-6 w-6 text-black" />
              </div>
              <div>
                <span className="font-black text-xl tracking-wide uppercase text-white">Nick<span>Store</span></span>
                <p className="text-[10px] text-white/50 tracking-[0.2em] uppercase font-black">Platform Top Up #1 Malaysia</p>
              </div>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 uppercase tracking-tight">
              Selamat Datang
            </h1>
            <p className="text-sm text-white/50 mt-2 font-medium">
              Masuk untuk melanjutkan ke akun Anda
            </p>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-4 mt-6">
              {[
                { icon: Zap, text: "Proses Instan", color: "text-[#D946EF]" },
                { icon: Shield, text: "100% Aman", color: "text-[#D946EF]" },
                { icon: Users, text: "1.2K+ Member", color: "text-[#D946EF]" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/[0.02] border border-white/10 rounded-lg px-3 py-1.5">
                  <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                  <span className="text-[10px] text-white/70 font-black uppercase tracking-widest">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

            {/* Telegram WebApp / Bot One-Click Login Button */}
            <div className="space-y-4">
              {awaitingTelegramBot ? (
                <div className="p-4 rounded-2xl bg-[#0088cc]/10 border border-[#0088cc]/30 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-[#0088cc] shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white">Menunggu Pengesahan Telegram...</p>
                      <p className="text-[10px] text-white/60">Sila tekan 'Start' pada bot Telegram yang terbuka.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={telegramBotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center py-2 rounded-xl bg-[#0088cc] text-white font-bold text-xs"
                    >
                      Buka Bot Telegram Lagi
                    </a>
                    <button
                      type="button"
                      onClick={() => { stopPolling(); setAwaitingTelegramBot(false); }}
                      className="px-3 py-2 rounded-xl bg-white/10 text-white/70 hover:text-white text-xs font-bold"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={handleTelegramLogin}
                  disabled={telegramWebAppMutation.isPending}
                  className="w-full h-12 rounded-xl bg-[#0088cc] hover:bg-[#0077bb] text-white font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(0,136,204,0.3)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 border-0"
                >
                  {telegramWebAppMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      Menghubungkan Telegram...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-5 w-5" />
                      Masuk / Daftar via Telegram
                    </>
                  )}
                </Button>
              )}

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-white/10 w-full" />
                <span className="bg-[#0B0A10] px-3 text-[10px] font-black uppercase tracking-widest text-white/40 absolute shrink-0">
                  Atau dengan Email
                </span>
              </div>
            </div>

            {/* Error Alert */}
            {loginError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-start gap-3 animate-in slide-in-from-top-2 fade-in">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold uppercase tracking-wider text-[10px]">Login Gagal</p>
                <p className="text-xs mt-1 font-medium">{loginError}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-100">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-white/70">
                Email <span className="text-[#8B5CF6]">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                <Input
                  ref={emailInputRef}
                  id="email"
                  type="email"
                  placeholder="contoh@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className={`pl-11 h-12 bg-white/[0.02] border-white/10 text-white placeholder:text-white/30 rounded-xl transition-all focus:bg-white/[0.05] focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/50 ${
                    errors.email && touched.email
                      ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/50" 
                      : ""
                  }`}
                  disabled={isLoading}
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {formData.email && !errors.email && (
                  <Check className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                )}
              </div>
              {errors.email && touched.email && (
                <p id="email-error" className="text-xs text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1 font-medium">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-white/70">
                  Kata Sandi <span className="text-[#8B5CF6]">*</span>
                </Label>
                <Link
                  to="/reset-password"
                  className="text-[10px] text-[#D946EF] hover:text-[#8B5CF6] hover:underline font-black uppercase tracking-widest transition-colors"
                >
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan kata sandi"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  onBlur={() => handleBlur("password")}
                  className={`pl-11 pr-11 h-12 bg-white/[0.02] border-white/10 text-white placeholder:text-white/30 rounded-xl transition-all focus:bg-white/[0.05] focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/50 ${
                    errors.password && touched.password
                      ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/50" 
                      : ""
                  }`}
                  disabled={isLoading}
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
                  tabIndex={-1}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && touched.password && (
                <p id="password-error" className="text-xs text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1 font-medium">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-3 pt-2 pb-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={isLoading}
                className="border-white/20 data-[state=checked]:bg-[#8B5CF6] data-[state=checked]:border-[#8B5CF6]"
              />
              <Label htmlFor="remember" className="text-xs font-black uppercase tracking-widest text-white/50 cursor-pointer select-none hover:text-white/70 transition-colors">
                Ingat saya
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-14 rounded-xl text-xs font-black tracking-widest uppercase bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] hover:from-[#D946EF] hover:to-[#8B5CF6] text-black transition-all duration-300 hover:scale-[1.02] shadow-[0_0_20px_rgba(255,107,0,0.3)] hover:shadow-[0_0_30px_rgba(255,184,0,0.5)] border-0"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-black" />
                  Memproses...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-5 w-5" />
                  Masuk
                  <ArrowRight className="h-4 w-4 ml-1" />
                </span>
              )}
            </Button>

            {/* Form Status */}
            {allFieldsFilled && !hasErrors && !isLoading && (
              <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 animate-in fade-in">
                <Check className="h-3 w-3" />
                Data siap dikirim
              </div>
            )}
          </form>

          {/* Footer Links */}
          <div className="mt-8 pt-8 border-t border-white/10 space-y-4 animate-in fade-in duration-500 delay-200">
            <p className="text-center text-xs font-black uppercase tracking-widest text-white/50">
              Belum punya akun?{" "}
              <Link
                to="/register"
                className="text-[#D946EF] hover:text-[#8B5CF6] hover:underline inline-flex items-center gap-1 transition-colors ml-1"
              >
                Daftar sekarang
                <ArrowRight className="h-3 w-3" />
              </Link>
            </p>

            <Button
              variant="outline"
              className="w-full h-12 rounded-xl bg-transparent border-white/10 text-white/70 hover:bg-white/[0.05] hover:text-white text-[10px] font-black tracking-widest uppercase"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Button>
          </div>
        </div>

        {/* Right - Benefits Panel */}
        <div className="hidden lg:flex flex-col justify-center p-12 bg-black/40 border-l border-white/10 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#8B5CF6]/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#D946EF]/10 to-transparent rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px]" />
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative space-y-10 z-10">
            {/* Logo & Title */}
            <div className="text-center">
              <div className="relative inline-block mb-8">
                <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#D946EF]/5 flex items-center justify-center mx-auto border border-[#8B5CF6]/30 shadow-[0_0_30px_rgba(255,107,0,0.2)]">
                  <Crown className="h-12 w-12 text-[#D946EF]" />
                </div>
                <Sparkles className="absolute -top-3 -right-3 h-8 w-8 text-[#D946EF] animate-pulse" />
              </div>
              
              <h2 className="text-3xl font-black mb-3 uppercase tracking-tight text-white">
                Kenapa Harus<br />
                <span className="bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] bg-clip-text text-transparent">
                  Jadi Member?
                </span>
              </h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                Dapatkan akses penuh ke semua fitur
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-4">
              {[
                { 
                  icon: Zap, 
                  title: "Transaksi Instan 24/7", 
                  desc: "Top up diproses dalam hitungan detik, kapan saja",
                  color: "text-[#D946EF]",
                  bg: "bg-[#D946EF]/10 border-[#D946EF]/20"
                },
                { 
                  icon: Shield, 
                  title: "Refund Mudah & Cepat", 
                  desc: "Garansi uang kembali 100% jika transaksi gagal",
                  color: "text-[#D946EF]",
                  bg: "bg-[#D946EF]/10 border-[#D946EF]/20"
                },
                { 
                  icon: Gift, 
                  title: "Promo Eksklusif Member", 
                  desc: "Diskon dan cashback spesial setiap bulan",
                  color: "text-[#D946EF]",
                  bg: "bg-[#D946EF]/10 border-[#D946EF]/20"
                },
                { 
                  icon: Wallet, 
                  title: "Biaya Admin Rendah", 
                  desc: "Biaya termurah dibanding platform lain",
                  color: "text-[#D946EF]",
                  bg: "bg-[#D946EF]/10 border-[#D946EF]/20"
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 border border-white/5 hover:border-white/10 group backdrop-blur-sm"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={`h-12 w-12 rounded-xl ${item.bg} border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div className="min-w-0 pt-1">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white mb-1">{item.title}</h3>
                    <p className="text-[10px] font-medium text-white/50 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Proof */}
            <div className="text-center pt-8 border-t border-white/10">
              <div className="flex items-center justify-center gap-1 text-[#D946EF] mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current drop-shadow-[0_0_5px_rgba(255,184,0,0.5)]" />
                ))}
                <span className="text-sm font-black text-white ml-2">4.99</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                Dipercaya{" "}
                <span className="text-[#D946EF]">1,247+</span> pengguna aktif
              </p>
              
              {/* Member Avatars */}
              <div className="flex items-center justify-center -space-x-3 mt-4">
                {["R", "S", "B", "D", "A"].map((letter, i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full border-2 border-[#0B0A10] flex items-center justify-center text-xs font-black text-white shadow-xl"
                    style={{
                      background: `hsl(${i * 40 + 20}, 70%, 50%)`,
                    }}
                  >
                    {letter}
                  </div>
                ))}
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black text-white border-2 border-[#0B0A10] backdrop-blur-md">
                  +1.2K
                </div>
              </div>
            </div>

            {/* Support Info */}
            <div className="text-center pt-2">
              <a
                href="https://wa.me/60137345871"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-emerald-400 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Butuh bantuan? Chat WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}