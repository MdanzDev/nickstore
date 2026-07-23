import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  QrCode,
  Clock,
  Copy,
  Check,
  ArrowLeft,
  Loader2,
  Zap,
  Smartphone,
  Banknote,
  History,
  AlertCircle,
  RefreshCw,
  Shield,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Gift,
  Info,
  X,
  ArrowUpRight,
  Coins,
  Timer,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const presetAmounts = [
  { value: 5, label: "RM 5", popular: false },
  { value: 10, label: "RM 10", popular: false },
  { value: 20, label: "RM 20", popular: true },
  { value: 50, label: "RM 50", popular: true },
  { value: 100, label: "RM 100", popular: false },
  { value: 200, label: "RM 200", popular: false },
];

const paymentMethods = [
  { id: "qris", label: "QRIS", icon: QrCode, description: "Scan & bayar instan", comingSoon: false },
  { id: "gopay", label: "GoPay", icon: Smartphone, description: "Coming soon", comingSoon: true },
  { id: "dana", label: "DANA", icon: Wallet, description: "Coming soon", comingSoon: true },
  { id: "bank", label: "Bank", icon: Banknote, description: "Coming soon", comingSoon: true },
];

const DEPOSIT_MIN = 1; // RM 1 minimum
const DEPOSIT_MAX = 5000; // RM 5000 maximum

/* ─────────────────────────────────────────────
   ANIMATED NUMBER
───────────────────────────────────────────── */
function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(value * eased));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>RM {(displayValue / 100).toFixed(2)}</span>;
}

/* ─────────────────────────────────────────────
   COUNTDOWN TIMER
───────────────────────────────────────────── */
function CountdownTimer({ expiryTime, onExpired }: { expiryTime: string; onExpired: () => void }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const expiry = new Date(expiryTime).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft("00:00");
        if (!isExpired) {
          setIsExpired(true);
          onExpired();
        }
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiryTime, onExpired, isExpired]);

  const isUrgent = timeLeft && parseInt(timeLeft.split(":")[0]) < 5;

  return (
    <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-mono font-bold text-lg transition-all ${
      isUrgent 
        ? "bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse" 
        : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
    }`}>
      <Clock className={`h-5 w-5 ${isUrgent ? "animate-spin" : ""}`} />
      {timeLeft}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAYMENT METHOD CARD
───────────────────────────────────────────── */
function PaymentMethodCard({ 
  method, 
  isActive, 
  onClick 
}: { 
  method: typeof paymentMethods[0]; 
  isActive: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={method.comingSoon}
      className={`relative p-4 rounded-xl border-2 text-center transition-all duration-300 group overflow-hidden ${
        method.comingSoon
          ? "opacity-40 cursor-not-allowed border-white/5 bg-white/5"
          : isActive
          ? "border-[#FF6B00] bg-[#FF6B00]/10 shadow-[0_0_20px_rgba(255,107,0,0.2)] scale-[1.02]"
          : "border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05] hover:scale-[1.01]"
      }`}
    >
      {/* Glow Effect */}
      {isActive && !method.comingSoon && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B00]/20 to-transparent opacity-50 blur-xl rounded-xl" />
      )}
      
      {method.comingSoon && (
        <div className="absolute -top-2 -right-2">
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-white/10 text-white/50 border-white/10">
            Soon
          </Badge>
        </div>
      )}
      <div className="relative z-10 flex flex-col items-center">
        <method.icon className={`h-7 w-7 mb-3 transition-colors ${
          isActive && !method.comingSoon ? "text-[#FF6B00]" : "text-white/40 group-hover:text-white/80"
        }`} />
        <span className="text-[11px] font-black tracking-wide uppercase text-white block">{method.label}</span>
        <span className="text-[9px] font-bold text-white/40 block mt-1 uppercase tracking-widest">{method.description}</span>
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────────
   AMOUNT CARD
───────────────────────────────────────────── */
function AmountCard({ 
  preset, 
  isActive, 
  onClick 
}: { 
  preset: typeof presetAmounts[0]; 
  isActive: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative p-4 rounded-xl border-2 text-center transition-all duration-300 overflow-hidden ${
        isActive
          ? "border-[#FF6B00] bg-[#FF6B00]/10 shadow-[0_0_20px_rgba(255,107,0,0.2)] scale-[1.02]"
          : "border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05] hover:scale-[1.01]"
      }`}
    >
      {/* Glow Effect */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B00]/20 to-transparent opacity-50 blur-xl rounded-xl" />
      )}
      
      {preset.popular && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
          <Badge className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-gradient-to-r from-[#FF6B00] to-[#FFB800] border-0 text-black shadow-[0_0_10px_rgba(255,107,0,0.5)]">
            <TrendingUp className="h-2 w-2 mr-1" />
            POPULER
          </Badge>
        </div>
      )}
      <p className={`relative z-10 text-xl font-black ${isActive ? "text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#FFB800]" : "text-white"}`} style={{ fontFamily: "'Syne', sans-serif" }}>
        {preset.label}
      </p>
    </button>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function Deposit() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  
  // State
  const [amount, setAmount] = useState(50000);
  const [customAmount, setCustomAmount] = useState("");
  const [activeMethod, setActiveMethod] = useState("qris");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [processingDeposit, setProcessingDeposit] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const [depositData, setDepositData] = useState<{
    depositId: string;
    qrImage: string;
    qrString?: string;
    totalAmount: number;
    creditAmount: number;
    uniqueCode: number;
    expiredAt: string;
    instructions: string;
  } | null>(null);

  const [status, setStatus] = useState<"idle" | "pending" | "success" | "expired">("idle");

  // Queries
  const { data: balanceData, refetch: refetchBalance } = trpc.rams.balance.useQuery(undefined, {
    enabled: isAuthenticated && !authLoading,
    retry: false,
  });

  const { data: historyData } = trpc.rams.history.useQuery(undefined, {
    enabled: isAuthenticated && !authLoading && showHistory,
    retry: false,
  });

  // Mutations
  const createDepositMutation = trpc.rams.deposit.useMutation({
    onSuccess: (response: any) => {
      const data = response?.data || response;
      const depositInfo = data?.data || data;
      
      if (depositInfo.depositId) {
        setDepositData(depositInfo);
        setStatus("pending");
        toast.success("QRIS berhasil dibuat! Silakan scan untuk membayar.", {
          icon: <QrCode className="h-4 w-4" />,
        });
        setProcessingDeposit(false);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal membuat deposit");
      setProcessingDeposit(false);
    },
  });

  // Status polling
  const { data: statusResponse } = trpc.rams.depositStatus.useQuery(
    { depositId: depositData?.depositId || "" },
    {
      enabled: !!depositData?.depositId && status === "pending",
      refetchInterval: 5000,
      retry: false,
    }
  );

  // Watch status changes
  useEffect(() => {
    if (!statusResponse || status !== "pending") return;

    const getStatus = (resp: any): string | null => {
      if (!resp) return null;
      if (typeof resp === "string") return resp;
      if (resp.status) return resp.status;
      if (resp.result?.data?.json?.data?.status) return resp.result.data.json.data.status;
      if (resp.result?.data?.json?.status) return resp.result.data.json.status;
      if (resp.data?.json?.data?.status) return resp.data.json.data.status;
      if (resp.data?.json?.status) return resp.data.json.status;
      if (resp.data?.data?.status) return resp.data.data.status;
      if (resp.data?.status) return resp.data.status;
      return null;
    };

    const depositStatus = getStatus(statusResponse);

    if (depositStatus === "success") {
      setStatus("success");
      refetchBalance();
      toast.success("Deposit berhasil! Saldo telah ditambahkan.", {
        icon: <Sparkles className="h-4 w-4" />,
        duration: 5000,
      });
    } else if (depositStatus === "expired") {
      setStatus("expired");
      toast.error("Waktu pembayaran habis.");
    }
  }, [statusResponse, refetchBalance, status]);

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Silakan login terlebih dahulu");
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Handle expired timer
  const handleExpired = useCallback(() => {
    if (status === "pending") {
      setStatus("expired");
    }
  }, [status]);

  // Handlers
  const handleCreateDeposit = () => {
    const finalAmt = customAmount ? parseFloat(customAmount) : amount;
    
    if (!finalAmt || finalAmt < DEPOSIT_MIN) {
      toast.error(`Minimal deposit RM ${DEPOSIT_MIN.toFixed(2)}`);
      return;
    }
    if (finalAmt > DEPOSIT_MAX) {
      toast.error(`Maksimal deposit RM ${DEPOSIT_MAX.toFixed(2)}`);
      return;
    }
    
    setProcessingDeposit(true);
    createDepositMutation.mutate({ amount: finalAmt, method: activeMethod });
  };

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      toast.success("Berhasil disalin!");
    } catch {
      toast.error("Gagal menyalin teks");
    }
  };

  const handleReset = () => {
    setDepositData(null);
    setStatus("idle");
  };

  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setCustomAmount("");
  };

  // Computed values - MYR is the primary currency
  const balanceMyr = balanceData?.data?.balance_myr || balanceData?.data?.ramsBalance?.balance_myr || (user as any)?.balanceMyr || 0;
  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : amount;
  const deposits = (historyData as any)?.data?.localDeposits || [];
  const isValidAmount = finalAmount >= DEPOSIT_MIN && finalAmount <= DEPOSIT_MAX;

  // QR image URL processing
  const getQrImageUrl = () => {
    if (!depositData) return "";
    if (depositData.qrString?.startsWith("http")) return depositData.qrString;
    if (depositData.qrImage?.includes("create-qr-code/?size=300x300&data=http")) {
      return decodeURIComponent(depositData.qrImage.split("data=")[1]);
    }
    return depositData.qrImage;
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <div className="absolute inset-0 animate-ping opacity-20">
              <Loader2 className="h-12 w-12 mx-auto text-primary" />
            </div>
          </div>
          <p className="text-muted-foreground">Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      {/* Premium Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#FF6B00]/10 to-transparent rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#FFB800]/10 to-transparent rounded-full blur-[100px] mix-blend-screen" />
      </div>

      <div className="relative container mx-auto px-4 py-8 max-w-2xl z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/dashboard")}
            className="hover:bg-white/10 rounded-full h-10 w-10 text-white border border-white/5 bg-white/[0.02] backdrop-blur-md transition-all hover:scale-105"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70" style={{ fontFamily: "'Syne', sans-serif" }}>Top Up Saldo</h1>
            <p className="text-xs font-bold text-white/50 uppercase tracking-widest mt-1">Isi saldo dengan metode pembayaran</p>
          </div>
        </div>

        {/* Balance Card */}
        <Card className="p-8 mb-8 bg-[#0c101e]/80 backdrop-blur-xl border-white/10 relative overflow-hidden rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#FF6B00]/20 to-[#FFB800]/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FF6B00]/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
          
          <div className="relative flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Saldo Anda</p>
                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border-[#00c864]/30 text-[#00c864] bg-[#00c864]/10 shadow-[0_0_10px_rgba(0,200,100,0.2)]">
                  <Zap className="h-2.5 w-2.5 mr-1" />
                  Aktif
                </Badge>
              </div>
              <div className="flex flex-col items-start">
                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#FFB800] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                  <AnimatedNumber value={Number(balanceMyr) * 100} duration={1500} />
                </p>
              </div>
            </div>
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#FFB800] flex items-center justify-center shadow-[0_0_30px_rgba(255,107,0,0.4)]">
              <Wallet className="h-10 w-10 text-black" />
            </div>
          </div>
        </Card>

        {/* Show form when no active deposit */}
        {status === "idle" && (
          <>
            {/* Payment Methods */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-white/70">Metode Pembayaran</h3>
                <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-widest bg-[#00c864]/10 text-[#00c864] hover:bg-[#00c864]/20 border-0 px-2 py-0.5">
                  <Shield className="h-3 w-3 mr-1" />
                  Terenkripsi
                </Badge>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {paymentMethods.map((method) => (
                  <PaymentMethodCard
                    key={method.id}
                    method={method}
                    isActive={activeMethod === method.id}
                    onClick={() => !method.comingSoon && setActiveMethod(method.id)}
                  />
                ))}
              </div>
            </div>

            {/* Amount Selection */}
            <Card className="p-6 bg-[#0c101e]/80 backdrop-blur-xl border-white/10 rounded-[2rem] shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-white/70">Pilih Nominal Top Up</h3>
                <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest bg-white/5 text-white border-white/10 px-2 py-0.5">
                  <Coins className="h-3 w-3 mr-1" />
                  Min RM {DEPOSIT_MIN.toFixed(2)}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {presetAmounts.map((preset) => (
                  <AmountCard
                    key={preset.value}
                    preset={preset}
                    isActive={amount === preset.value && !customAmount}
                    onClick={() => handleAmountSelect(preset.value)}
                  />
                ))}
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-[#0c101e] text-[9px] font-bold uppercase tracking-widest text-white/40">
                    atau masukkan nominal custom
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={`RM ${DEPOSIT_MIN.toFixed(2)} – RM ${DEPOSIT_MAX.toFixed(2)}`}
                    value={customAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCustomAmount(value);
                      if (value) setAmount(0);
                    }}
                    className={`h-14 text-center text-xl font-black bg-white/[0.02] border-white/10 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]/50 transition-all text-white placeholder:text-white/20 pl-14 rounded-xl ${
                      customAmount && !isValidAmount ? "border-red-500 focus:border-red-500 focus:ring-red-500/50" : ""
                    }`}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-black tracking-widest text-sm">RM</div>
                </div>
                {customAmount && !isValidAmount && (
                  <p className="text-[10px] font-bold text-red-400 mt-2 flex items-center gap-1 uppercase tracking-widest">
                    <AlertCircle className="h-3 w-3" />
                    Nominal harus antara RM {DEPOSIT_MIN.toFixed(2)} – RM {DEPOSIT_MAX.toFixed(2)}
                  </p>
                )}
              </div>

              {finalAmount > 0 && isValidAmount && (
                <div className="p-5 rounded-2xl bg-white/[0.02] space-y-3 text-sm mb-6 border border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Nominal Top Up (MYR)</span>
                    <span className="font-black text-white">RM {finalAmount.toFixed(2)}</span>
                  </div>
                  {/* Ekuivalen IDR removed */}
                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <span className="text-[11px] font-black uppercase tracking-widest text-white">Total Bayar</span>
                    <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#FFB800] text-xl" style={{ fontFamily: "'Syne', sans-serif" }}>RM {finalAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <Button
                className="w-full h-14 rounded-xl text-sm font-black bg-gradient-to-r from-[#FF6B00] to-[#FFB800] hover:scale-[1.02] text-black border-0 shadow-[0_0_20px_rgba(255,107,0,0.4)] transition-all uppercase tracking-widest"
                onClick={handleCreateDeposit}
                disabled={createDepositMutation.isPending || processingDeposit || !isValidAmount}
              >
                {createDepositMutation.isPending || processingDeposit ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Membuat QRIS...
                  </>
                ) : (
                  <>
                    <QrCode className="mr-2 h-5 w-5" />
                    Buat QRIS Pembayaran
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-3 mt-5 text-[9px] font-bold uppercase tracking-widest text-white/30">
                <div className="flex items-center gap-1.5"><Shield className="h-3 w-3" /> Transaksi Aman</div>
                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                <div className="flex items-center gap-1.5"><Zap className="h-3 w-3" /> Proses Instan</div>
              </div>
            </Card>
          </>
        )}

        {/* Payment Screen */}
        {depositData && (status === "pending" || status === "success" || status === "expired") && (
          <Card className="p-6 bg-[#0c101e]/80 backdrop-blur-xl border-white/10 rounded-[2rem] shadow-xl">
            {/* Status Banner */}
            <div className={`p-6 rounded-2xl text-center mb-6 transition-all duration-500 border ${
              status === "pending"
                ? "bg-[#FFB800]/5 border-[#FFB800]/20"
                : status === "success"
                ? "bg-[#00c864]/5 border-[#00c864]/20"
                : "bg-red-500/5 border-red-500/20"
            }`}>
              {status === "pending" && (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 animate-ping opacity-20">
                      <Clock className="h-14 w-14 text-[#FFB800] mx-auto" />
                    </div>
                    <Clock className="h-14 w-14 mx-auto text-[#FFB800] relative drop-shadow-[0_0_15px_rgba(255,184,0,0.5)]" />
                  </div>
                  <div>
                    <p className="font-black text-[#FFB800] text-xl tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Menunggu Pembayaran</p>
                    <p className="text-xs font-bold text-white/50 mt-1 uppercase tracking-widest">{depositData.instructions}</p>
                  </div>
                  <CountdownTimer expiryTime={depositData.expiredAt} onExpired={handleExpired} />
                </div>
              )}
              
              {status === "success" && (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <Check className="h-16 w-16 mx-auto text-[#00c864] drop-shadow-[0_0_15px_rgba(0,200,100,0.5)]" />
                    <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-[#FFB800] animate-pulse" />
                  </div>
                  <div>
                    <p className="font-black text-[#00c864] text-2xl tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Pembayaran Berhasil!</p>
                    <p className="text-sm font-bold text-white/70 mt-2">
                      Saldo sebesar{" "}
                      <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#FFB800] text-lg">
                        RM {depositData.creditAmount.toFixed(2)}
                      </span>{" "}
                      telah ditambahkan
                    </p>
                  </div>
                </div>
              )}
              
              {status === "expired" && (
                <div className="space-y-4">
                  <AlertCircle className="h-14 w-14 mx-auto text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                  <div>
                    <p className="font-black text-red-500 text-xl tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Waktu Habis</p>
                    <p className="text-xs font-bold text-white/50 mt-1 uppercase tracking-widest">Silakan buat deposit baru</p>
                  </div>
                </div>
              )}
            </div>

            {/* QR Code - Pending only */}
            {status === "pending" && depositData.qrImage && (
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <div className="p-4 rounded-3xl border border-[#FF6B00]/30 bg-white shadow-[0_0_40px_rgba(255,107,0,0.2)]">
                    <img
                      src={getQrImageUrl()}
                      alt="QRIS Payment Code"
                      className="w-64 h-64 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "data:image/svg+xml,..."; // Placeholder
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-[#FF6B00] to-[#FFB800] text-black border-0 shadow-[0_0_15px_rgba(255,107,0,0.5)] px-4 py-1 uppercase tracking-widest font-black text-[10px]">
                      <QrCode className="h-3.5 w-3.5 mr-1.5" />
                      Scan QR ini
                    </Badge>
                  </div>
                </div>
                
                {depositData.qrString && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-10 bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold rounded-xl h-10 px-6 transition-all"
                    onClick={() => handleCopy(depositData.qrString || "", "qrstring")}
                  >
                    {copiedField === "qrstring" ? (
                      <Check className="h-4 w-4 mr-2 text-[#00c864]" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    {copiedField === "qrstring" ? "Tersalin!" : "Salin Kode QR"}
                  </Button>
                )}
              </div>
            )}

            {/* Transaction Details */}
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-white/70">Detail Transaksi</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[9px] font-bold uppercase tracking-widest text-[#FFB800] hover:text-[#FF6B00] hover:bg-[#FFB800]/10 px-2 h-6"
                  onClick={() => setShowInstructions(!showInstructions)}
                >
                  {showInstructions ? "Tutup" : "Lihat"} Panduan
                </Button>
              </div>

              <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
                {[
                  { label: "ID Deposit", value: depositData.depositId, field: "id", mono: true },
                  { label: "Top Up (MYR)", value: `RM ${depositData.creditAmount.toFixed(2)}`, field: "amount" },
                  { 
                    label: "Total Bayar", 
                    value: `RM ${depositData.totalAmount.toFixed(2)}`, 
                    field: "total", 
                    highlight: true 
                  },
                  { 
                    label: "Batas Waktu", 
                    value: new Date(depositData.expiredAt).toLocaleString("id-ID", {
                      day: "numeric", 
                      month: "long", 
                      year: "numeric", 
                      hour: "2-digit", 
                      minute: "2-digit"
                    }), 
                    field: "expiry" 
                  },
                ].map((item) => (
                  <div 
                    key={item.field} 
                    className={`flex justify-between items-center p-3.5 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${
                      item.highlight ? "bg-[#FF6B00]/5" : ""
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className={`${item.mono ? "font-mono text-xs bg-white/5 px-2 py-0.5 rounded text-white/70" : ""} ${
                        item.highlight ? "font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#FFB800] text-base" : "text-sm font-bold text-white"
                      }`}>
                        {item.value}
                      </span>
                      {item.field !== "expiry" && (
                        <button
                          onClick={() => handleCopy(
                            item.field === "total" ? depositData.totalAmount.toString() :
                            item.field === "code" ? depositData.uniqueCode.toString() :
                            depositData.depositId,
                            item.field
                          )}
                          className="text-white/30 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          {copiedField === item.field ? (
                            <Check className="h-3.5 w-3.5 text-[#00c864]" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Instructions */}
              {showInstructions && (
                <div className="mt-4 p-5 rounded-2xl bg-[#00c864]/5 border border-[#00c864]/20 space-y-3 animate-in slide-in-from-top-2">
                  <h5 className="text-[11px] font-black uppercase tracking-widest text-[#00c864] flex items-center gap-2">
                    <Info className="h-3.5 w-3.5" />
                    Cara Membayar
                  </h5>
                  <ol className="text-xs font-medium text-white/60 space-y-2 list-decimal list-inside">
                    <li>Buka aplikasi e-wallet atau mobile banking kamu</li>
                    <li>Pilih menu <strong className="text-white">Scan QR</strong> atau <strong className="text-white">Bayar</strong></li>
                    <li>Scan kode QR yang ditampilkan di atas</li>
                    <li>Periksa nominal dan pastikan sesuai dengan total yang tertera</li>
                    <li>Konfirmasi pembayaran dan tunggu verifikasi otomatis</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              {status === "pending" && (
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-12 rounded-xl font-bold bg-white/5 border-white/10 hover:bg-white/10 text-white transition-all" 
                    onClick={handleReset}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Batal
                  </Button>
                  <Button 
                    className="flex-1 h-12 rounded-xl font-black bg-white/10 hover:bg-white/20 text-white border-0 transition-all" 
                    variant="secondary"
                    onClick={() => toast.info("Status diperbarui setiap 5 detik")}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Cek Status
                  </Button>
                </div>
              )}
              
              {status === "success" && (
                <Button 
                  className="w-full h-12 rounded-xl text-sm font-black bg-[#00c864] hover:bg-[#00a854] text-white border-0 shadow-[0_0_15px_rgba(0,200,100,0.4)] transition-all hover:scale-[1.02]"
                  onClick={() => navigate("/dashboard")}
                >
                  <Check className="mr-2 h-5 w-5" />
                  Kembali ke Dashboard
                </Button>
              )}
              
              {status === "expired" && (
                <Button 
                  className="w-full h-12 rounded-xl text-sm font-black bg-gradient-to-r from-[#FF6B00] to-[#FFB800] hover:scale-[1.02] text-black border-0 shadow-[0_0_15px_rgba(255,107,0,0.4)] transition-all"
                  onClick={handleReset}
                >
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Buat Deposit Baru
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* History Section */}
        <div className="mt-8">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center justify-between w-full p-5 rounded-[1.5rem] bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 border border-white/5 hover:border-white/20 hover:scale-[1.01]"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center border border-[#FF6B00]/20 shadow-[0_0_15px_rgba(255,107,0,0.1)]">
                <History className="h-6 w-6 text-[#FF6B00]" />
              </div>
              <div className="text-left">
                <span className="font-black text-sm uppercase tracking-widest text-white">Riwayat Deposit</span>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                  {deposits.length} transaksi tercatat
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {deposits.length > 0 && (
                <Badge variant="secondary" className="text-[9px] font-black bg-white/10 text-white border-0 px-2 py-0.5">
                  {deposits.length}
                </Badge>
              )}
              <ChevronRight className={`h-5 w-5 text-white/50 transition-transform duration-300 ${showHistory ? "rotate-90" : ""}`} />
            </div>
          </button>

          {showHistory && (
            <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
              {deposits.length === 0 ? (
                <Card className="p-10 text-center bg-white/[0.02] border-white/5 rounded-3xl">
                  <History className="h-16 w-16 mx-auto text-white/10 mb-4" />
                  <p className="text-sm font-bold text-white/70 uppercase tracking-widest">Belum ada riwayat deposit</p>
                  <p className="text-[10px] font-medium text-white/40 mt-2 uppercase tracking-widest">
                    Transaksi deposit kamu akan muncul di sini
                  </p>
                </Card>
              ) : (
                deposits.slice(0, 10).map((d: any, i: number) => (
                  <div 
                    key={i} 
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center border ${
                        d.completed || d.status === "success"
                          ? "bg-[#00c864]/10 border-[#00c864]/20 shadow-[0_0_15px_rgba(0,200,100,0.1)]"
                          : d.status === "expired"
                          ? "bg-red-500/10 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                          : "bg-[#FFB800]/10 border-[#FFB800]/20 shadow-[0_0_15px_rgba(255,184,0,0.1)]"
                      }`}>
                        {d.completed || d.status === "success" ? (
                          <Check className="h-6 w-6 text-[#00c864]" />
                        ) : d.status === "expired" ? (
                          <X className="h-6 w-6 text-red-500" />
                        ) : (
                          <Clock className="h-6 w-6 text-[#FFB800]" />
                        )}
                      </div>
                      <div>
                        <p className="font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#FFB800] text-base" style={{ fontFamily: "'Syne', sans-serif" }}>
                          RM {Number(d.creditAmount || d.amount).toFixed(2)}
                        </p>
                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-0.5">
                          {d.createdAt ? new Date(d.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit"
                          }) : "-"}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 ${
                        d.completed || d.status === "success"
                          ? "border-[#00c864]/30 text-[#00c864] bg-[#00c864]/10 shadow-[0_0_10px_rgba(0,200,100,0.1)]"
                          : d.status === "expired"
                          ? "border-red-500/30 text-red-500 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                          : "border-[#FFB800]/30 text-[#FFB800] bg-[#FFB800]/10 shadow-[0_0_10px_rgba(255,184,0,0.1)]"
                      }`}
                    >
                      {d.completed || d.status === "success" ? "Success" : d.status === "expired" ? "Expired" : "Pending"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Bottom Info */}
        <div className="mt-8 p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/5">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-[#00c864]/10 flex items-center justify-center border border-[#00c864]/20 shadow-[0_0_15px_rgba(0,200,100,0.1)] flex-shrink-0">
              <Shield className="h-5 w-5 text-[#00c864]" />
            </div>
            <div>
              <p className="text-sm font-black text-white uppercase tracking-widest">Keamanan Terjamin</p>
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1.5 leading-relaxed">
                Semua transaksi diproses dengan enkripsi end-to-end. Data pembayaran Anda aman bersama kami.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}