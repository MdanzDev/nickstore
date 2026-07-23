import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import SeoHead from "@/components/SeoHead";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Gamepad2,
  Eye,
  EyeOff,
  ArrowLeft,
  UserPlus,
  Mail,
  Lock,
  Phone,
  User,
  Zap,
  Shield,
  Gift,
  Star,
  Check,
  X,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Crown,
  Clock,
  Loader2,
  TrendingUp,
  Users,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";

/* ─────────────────────────────────────────────
   PASSWORD STRENGTH METER
───────────────────────────────────────────── */
function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;

  const getStrength = (pwd: string) => {
    let score = 0;
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd),
    };

    if (checks.length) score++;
    if (checks.uppercase) score++;
    if (checks.number) score++;
    if (checks.special) score++;

    return { score, checks };
  };

  const { score, checks } = getStrength(password);

  const strengthConfig = {
    0: { width: "0%", color: "bg-destructive", label: "", message: "" },
    1: { width: "25%", color: "bg-destructive", label: "Lemah", message: "Tambahkan huruf besar, angka, dan simbol" },
    2: { width: "50%", color: "bg-amber-500", label: "Cukup", message: "Tambahkan angka atau simbol" },
    3: { width: "75%", color: "bg-blue-500", label: "Baik", message: "Hampir! Tambahkan satu lagi" },
    4: { width: "100%", color: "bg-green-500", label: "Kuat", message: "Password sangat aman!" },
  };

  const config = strengthConfig[score as keyof typeof strengthConfig];

  const checkItems = [
    { label: "Minimal 8 karakter", passed: checks.length },
    { label: "Huruf besar (A-Z)", passed: checks.uppercase },
    { label: "Angka (0-9)", passed: checks.number },
    { label: "Karakter spesial (!@#$)", passed: checks.special },
  ];

  return (
    <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 fade-in duration-300">
      {/* Strength Bar */}
      <div className="space-y-1.5">
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${config.color}`}
            style={{ width: config.width }}
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium" style={{ color: config.color.replace('bg-', 'text-') }}>
            {config.label}
          </p>
          <p className="text-xs text-muted-foreground">
            {config.message}
          </p>
        </div>
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-2 gap-1.5">
        {checkItems.map((item, i) => (
          <div
            key={i}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              item.passed ? "text-green-500" : "text-muted-foreground"
            }`}
          >
            {item.passed ? (
              <Check className="h-3 w-3" />
            ) : (
              <X className="h-3 w-3" />
            )}
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FORM INPUT WITH ICON
───────────────────────────────────────────── */
function FormInput({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  icon: Icon,
  disabled,
  required,
  error,
  hint,
  autoComplete,
  autoFocus,
  rightElement,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon: any;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  hint?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  rightElement?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white/70">
        {label}
        {required && <span className="text-[#8B5CF6]">*</span>}
        {!required && <span className="text-[10px] text-white/40 font-bold ml-1">(Opsional)</span>}
      </Label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`pl-11 h-12 bg-white/[0.02] border-white/10 text-white placeholder:text-white/30 rounded-xl transition-all focus:bg-white/[0.05] focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/50 ${
            error 
              ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/50" 
              : ""
          }`}
          disabled={disabled}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1 font-medium">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-[10px] uppercase tracking-widest font-black text-white/40 mt-1">
          {hint}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function Register() {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [otpMode, setOtpMode] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sessionToken, setSessionToken] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Refs
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Mutation
  const requestOtpMutation = trpc.users.requestPhoneOtp.useMutation({
    onSuccess: () => {
      toast.success("Kode OTP telah dikirim ke WhatsApp Anda!");
    },
    onError: (error) => {
      toast.error(error.message || "Gagal mengirim OTP.");
    }
  });

  const verifyOtpMutation = trpc.users.verifyPhoneOtp.useMutation({
    onSuccess: () => {
      toast.success("Nomor telepon berhasil diverifikasi!", { duration: 2000 });
      setTimeout(() => navigate("/dashboard"), 1500);
    },
    onError: (error) => {
      toast.error(error.message || "OTP salah atau kedaluwarsa.");
    }
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      toast.success("Pendaftaran berhasil! 🎉", {
        description: "Mengalihkan ke halaman utama...",
        duration: 2000,
      });
      if (formData.phone && data.token) {
        setSessionToken(data.token);
        requestOtpMutation.mutate({ phone: formData.phone, token: data.token });
        setOtpMode(true);
      } else {
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      }
    },
    onError: (error) => {
      const message = error.message || "Pendaftaran gagal";
      toast.error(message);
      
      // Handle specific error cases
      if (message.toLowerCase().includes("email")) {
        setErrors(prev => ({ ...prev, email: message }));
      }
    },
  });

  // Telegram WebApp / Bot Register State
  const [awaitingTelegramBot, setAwaitingTelegramBot] = useState(false);
  const [telegramBotUrl, setTelegramBotUrl] = useState("");
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const setSessionTokenMutation = trpc.auth.setSessionToken.useMutation();

  const telegramWebAppMutation = trpc.auth.telegramWebApp.useMutation({
    onSuccess: () => {
      toast.success("Pendaftaran & Log Masuk Telegram Berjaya! 🎉");
      setTimeout(() => navigate("/dashboard"), 500);
    },
    onError: (error) => {
      toast.error(error.message || "Gagal daftar via Telegram");
      setAwaitingTelegramBot(false);
    }
  });

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const handleTelegramRegister = useCallback(async () => {
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
        toast.error(data.error || "Gagal menghasilkan kod pendaftaran Telegram");
        setAwaitingTelegramBot(false);
        return;
      }

      const botUrl = data.botUrl || `https://t.me/NickStore_bot?start=${data.code}`;
      setTelegramBotUrl(botUrl);

      // Open Telegram Bot in a new window/tab
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

            toast.success(`Log masuk / pendaftaran Telegram berjaya! 🎉`, {
              description: `Selamat datang, ${pollData.user?.username || 'Pengguna Telegram'}!`,
            });
            setTimeout(() => navigate("/dashboard"), 500);
          }
        } catch {
          // Ignore transient errors
        }
      }, 2000);

    } catch (err: any) {
      toast.error(err.message || "Ralat memulakan pendaftaran Telegram");
      setAwaitingTelegramBot(false);
    }
  }, [telegramWebAppMutation, setSessionTokenMutation, stopPolling, navigate]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  // Auto focus name input & auto-trigger WebApp registration if opened in Telegram
  useEffect(() => {
    nameInputRef.current?.focus();
    if (window.Telegram?.WebApp?.initData) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  // Validation
  const validateField = useCallback((field: string, value: string): string => {
    switch (field) {
      case "name":
        if (!value.trim()) return "Nama wajib diisi";
        if (value.trim().length < 2) return "Nama minimal 2 karakter";
        if (value.trim().length > 100) return "Nama terlalu panjang";
        return "";
      
      case "email":
        if (!value.trim()) return "Email wajib diisi";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Format email tidak valid";
        return "";
      
      case "password":
        if (!value) return "Password wajib diisi";
        if (value.length < 8) return "Password minimal 8 karakter";
        if (value.length > 128) return "Password terlalu panjang";
        return "";
      
      case "phone":
        if (value && !/^\+?[\d\s-]{8,15}$/.test(value)) return "Format nomor telepon tidak valid";
        return "";
      
      default:
        return "";
    }
  }, []);

  // Handlers
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
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

    // Validate all fields
    const newErrors: Record<string, string> = {};
    const fields = ["name", "email", "password", "phone"] as const;
    
    fields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    setTouched({ name: true, email: true, password: true, phone: true });

    // Check terms
    if (!agreeTerms) {
      toast.error("Anda harus menyetujui Syarat & Ketentuan");
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      toast.error("Mohon perbaiki data yang salah");
      return;
    }

    // Auto capture telegram_id from WebApp if present
    const tgUser = (window.Telegram?.WebApp?.initDataUnsafe?.user as any) || null;
    const socialConnections = tgUser?.id ? { telegram_id: String(tgUser.id) } : undefined;

    // Submit
    registerMutation.mutate({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      phone: formData.phone.trim() || undefined,
      socialConnections,
    });
  }, [formData, agreeTerms, validateField, registerMutation]);

  const isLoading = registerMutation.isPending;
  const hasErrors = Object.keys(errors).length > 0;
  const allFieldsFilled = formData.name && formData.email && formData.password && agreeTerms;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden pt-24 pb-12">
      <SeoHead
        title="Daftar Akaun Baharu | NickStore"
        description="Daftar akaun baharu di NickStore untuk menikmati harga topup game termurah, bonus promo & perkhidmatan pantas 24/7."
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
              Buat Akun Baru
            </h1>
            <p className="text-sm text-white/50 mt-2 font-medium">
              Daftar sekarang dan dapatkan benefit eksklusif member
            </p>
            
            {/* Quick Benefits */}
            <div className="flex items-center gap-4 mt-6">
              {[
                { icon: Zap, text: "Proses Instan", color: "text-[#D946EF]" },
                { icon: Shield, text: "100% Aman", color: "text-[#D946EF]" },
                { icon: Gift, text: "Bonus Member", color: "text-[#D946EF]" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/[0.02] border border-white/10 rounded-lg px-3 py-1.5">
                  <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                  <span className="text-[10px] text-white/70 font-black uppercase tracking-widest">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          {otpMode ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-500">
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                  <Phone className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Verifikasi WhatsApp</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Masukkan 6-digit kode OTP yang telah dikirim ke nomor <br/>
                  <span className="font-semibold text-foreground">{formData.phone}</span>
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otpCode">Kode OTP</Label>
                  <Input
                    id="otpCode"
                    type="number"
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="text-center text-2xl tracking-[0.5em] h-14 font-mono"
                    maxLength={6}
                  />
                </div>
                
                <Button 
                  className="w-full h-12 text-base font-semibold"
                  onClick={() => verifyOtpMutation.mutate({ phone: formData.phone, code: otpCode, token: sessionToken })}
                  disabled={verifyOtpMutation.isPending || otpCode.length < 4}
                >
                  {verifyOtpMutation.isPending ? "Memverifikasi..." : "Verifikasi Sekarang"}
                </Button>
                
                <div className="text-center pt-2">
                  <Button 
                    variant="link" 
                    className="text-xs text-muted-foreground"
                    onClick={() => requestOtpMutation.mutate({ phone: formData.phone, token: sessionToken })}
                    disabled={requestOtpMutation.isPending}
                  >
                    Kirim ulang kode OTP
                  </Button>
                  <Button 
                    variant="link" 
                    className="text-xs text-muted-foreground block w-full mt-2"
                    onClick={() => navigate("/dashboard")}
                  >
                    Lewati (Verifikasi Nanti di Pengaturan)
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-100">
              {/* Telegram WebApp / Bot One-Click Register Button */}
              <div className="space-y-3 mb-4">
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
                    onClick={handleTelegramRegister}
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
                        Daftar / Masuk via Telegram
                      </>
                    )}
                  </Button>
                )}

                <div className="relative flex items-center justify-center my-4">
                  <div className="border-t border-white/10 w-full" />
                  <span className="bg-[#0B0A10] px-3 text-[10px] font-black uppercase tracking-widest text-white/40 absolute shrink-0">
                    Atau Isi Borang Manual
                  </span>
                </div>
              </div>

              <FormInput
                id="name"
                label="Nama Lengkap"
              placeholder="Masukkan nama lengkap"
              value={formData.name}
              onChange={(val) => handleInputChange("name", val)}
              icon={User}
              disabled={isLoading}
              required
              error={touched.name ? errors.name : undefined}
              hint="Nama akan ditampilkan di profil dan transaksi"
              autoComplete="name"
              autoFocus
            />

            <FormInput
              id="email"
              label="Email"
              type="email"
              placeholder="contoh@email.com"
              value={formData.email}
              onChange={(val) => handleInputChange("email", val)}
              icon={Mail}
              disabled={isLoading}
              required
              error={touched.email ? errors.email : undefined}
              hint="Email digunakan untuk login dan notifikasi"
              autoComplete="email"
            />

            <FormInput
              id="phone"
              label="Nomor Telepon"
              type="tel"
              placeholder="+60 13 734 5871"
              value={formData.phone}
              onChange={(val) => handleInputChange("phone", val)}
              icon={Phone}
              disabled={isLoading}
              error={touched.phone ? errors.phone : undefined}
              hint="Opsional, untuk verifikasi dan keamanan akun"
              autoComplete="tel"
            />

            <FormInput
              id="password"
              label="Kata Sandi"
              type={showPassword ? "text" : "password"}
              placeholder="Minimal 8 karakter"
              value={formData.password}
              onChange={(val) => handleInputChange("password", val)}
              icon={Lock}
              disabled={isLoading}
              required
              error={touched.password ? errors.password : undefined}
              hint="Gunakan kombinasi huruf, angka, dan simbol"
              autoComplete="new-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-white/40 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
                  tabIndex={-1}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            {/* Password Strength */}
            <PasswordStrengthMeter password={formData.password} />

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 pt-2">
              <Checkbox
                id="terms"
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                disabled={isLoading}
                className="mt-0.5 border-white/20 data-[state=checked]:bg-[#8B5CF6] data-[state=checked]:border-[#8B5CF6]"
              />
              <Label htmlFor="terms" className="text-xs font-black uppercase tracking-widest text-white/50 cursor-pointer leading-relaxed hover:text-white/70 transition-colors">
                Saya menyetujui{" "}
                <button
                  type="button"
                  className="text-[#D946EF] hover:text-[#8B5CF6] hover:underline"
                  onClick={() => toast.info("Syarat & Ketentuan akan ditampilkan di halaman terpisah")}
                >
                  Syarat & Ketentuan
                </button>
                {" "}dan{" "}
                <button
                  type="button"
                  className="text-[#D946EF] hover:text-[#8B5CF6] hover:underline"
                  onClick={() => toast.info("Kebijakan Privasi akan ditampilkan di halaman terpisah")}
                >
                  Kebijakan Privasi
                </button>
              </Label>
            </div>

            {/* Backend Error Display */}
            {registerMutation.isError && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md animate-in fade-in slide-in-from-top-2 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>{registerMutation.error?.message || "Pendaftaran gagal. Sila cuba lagi."}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-14 rounded-xl text-xs font-black tracking-widest uppercase bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] hover:from-[#D946EF] hover:to-[#8B5CF6] text-black transition-all duration-300 hover:scale-[1.02] shadow-[0_0_20px_rgba(255,107,0,0.3)] hover:shadow-[0_0_30px_rgba(255,184,0,0.5)] border-0 mt-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-black" />
                  Membuat Akun...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Daftar Sekarang
                  <ArrowRight className="h-4 w-4 ml-1" />
                </span>
              )}
            </Button>

            {/* Form Status */}
            {allFieldsFilled && !hasErrors && !isLoading && (
              <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 animate-in fade-in pt-2">
                <Check className="h-3 w-3" />
                Data siap dikirim
              </div>
            )}
          </form>
          )}

          {/* Footer Links */}
          <div className="mt-8 pt-8 border-t border-white/10 space-y-4 animate-in fade-in duration-500 delay-200">
            <p className="text-center text-xs font-black uppercase tracking-widest text-white/50">
              Sudah punya akun?{" "}
              <Link
                to="/login"
                className="text-[#D946EF] hover:text-[#8B5CF6] hover:underline inline-flex items-center gap-1 transition-colors ml-1"
              >
                Masuk disini
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
                  Daftar Sekarang?
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
                  title: "Transaksi Super Instan", 
                  desc: "Top up diproses dalam hitungan detik, 24/7 non-stop",
                  color: "text-[#D946EF]",
                  bg: "bg-[#D946EF]/10 border-[#D946EF]/20"
                },
                { 
                  icon: Shield, 
                  title: "Garansi 100% Refund", 
                  desc: "Uang kembali penuh jika transaksi gagal",
                  color: "text-[#D946EF]",
                  bg: "bg-[#D946EF]/10 border-[#D946EF]/20"
                },
                { 
                  icon: Gift, 
                  title: "Promo Eksklusif Member", 
                  desc: "Diskon dan cashback setiap bulan",
                  color: "text-[#D946EF]",
                  bg: "bg-[#D946EF]/10 border-[#D946EF]/20"
                },
                { 
                  icon: TrendingUp, 
                  title: "Harga Termurah", 
                  desc: "Bandingkan sendiri, kami yang terendah",
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
                Bergabung dengan{" "}
                <span className="text-[#D946EF]">1,247+</span> member lainnya
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
          </div>
        </div>
      </div>
    </div>
  );
}