import { useParams, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useCurrency } from "@/providers/CurrencyProvider";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Loader2, ArrowLeft, CheckCircle, Clock, XCircle, Zap,
  ShoppingCart, CreditCard, Home, RefreshCw, MessageCircle,
  Star, Shield, AlertTriangle, Share2, Timer, Receipt,
  ThumbsUp, PartyPopper, Rocket, ChevronRight, Gem,
  Wallet, Copy, Check, ExternalLink, Info, Download, Share, Search
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

const parseKeterangan = (str?: string) => {
  if (!str) return "";
  try {
    if (str.trim().startsWith('{') || str.trim().startsWith('[')) {
      const obj = JSON.parse(str);
      return obj.message || obj.error_msg || obj.sn || "";
    }
  } catch (e) {}
  return str;
};

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface Order {
  id: string
  status: string
  total: number
  totalMyr?: number
  totalIdr?: number
  gameUserId?: string
  zoneId?: string
  gameImage?: string
  serviceName?: string
  gameSlug?: string
  providerStatus?: string
  subtotal?: number
  discountAmount?: number
  voucherCode?: string
  notes?: string
  createdAt: string
  keterangan?: string
  items?: { name: string; quantity: number; price: number }[]
}

/* ─────────────────────────────────────────────
   COPY BUTTON
───────────────────────────────────────────── */
function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setDone(true); 
    toast.success("Disalin!");
    setTimeout(() => setDone(false), 2000);
  };
  
  return (
    <motion.button 
      onClick={copy}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="p-1.5 rounded-md hover:bg-white/10 text-white/40 hover:text-white/80 transition-all flex items-center gap-1.5 border border-white/5"
    >
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="check"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Copy className="w-3.5 h-3.5" />
          </motion.div>
        )}
      </AnimatePresence>
      <span className="text-xs">Salin</span>
    </motion.button>
  );
}

/* ─────────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────────── */
const AnimatedCounter = ({ value, className = "", style }: { value: string, className?: string, style?: any }) => {
  return (
    <motion.span
      key={value}
      initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
      animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={className}
      style={style}
    >
      {value}
    </motion.span>
  );
};

/* ─────────────────────────────────────────────
   STATUS CONFIG
───────────────────────────────────────────── */
const STATUS_CFG: Record<string, {
  color: string; bg: string; border: string; glow: string;
  label: string; headline: string; sub: string;
  icon: any; reason?: string; action?: string;
  isLive?: boolean;
}> = {
  success: {
    color: "#10B981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)", glow: "rgba(16,185,129,0.3)",
    label: "Success", headline: "Transaksi Sukses", sub: "Pesanan telah berhasil diproses oleh provider. Pembayaran telah diterima.",
    icon: CheckCircle
  },
  processing: {
    color: "#3B82F6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)", glow: "rgba(59,130,246,0.3)",
    label: "Processing", headline: "Transaksi Diproses", sub: "Pesanan sedang diproses oleh sistem provider.",
    icon: Clock,
    isLive: true
  },
  pending: {
    color: "#F59E0B", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", glow: "rgba(245,158,11,0.3)",
    label: "Pending", headline: "Menunggu Pembayaran", sub: "Selesaikan pembayaranmu agar pesanan dapat diproses.",
    icon: Timer,
    isLive: true
  },
  failed: {
    color: "#EF4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", glow: "rgba(239,68,68,0.3)",
    label: "Failed", headline: "Transaksi Gagal", sub: "Pesanan tidak dapat diproses oleh provider. Tidak ada pembayaran yang dibebankan.",
    reason: "Provider menolak permintaan.", action: "Alasan Kegagalan",
    icon: XCircle
  },
  refund: {
    color: "#EF4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", glow: "rgba(239,68,68,0.3)",
    label: "Refund", headline: "Refunded", sub: "Dana telah dikembalikan ke saldo.",
    icon: XCircle
  },
  cancelled: {
    color: "#6B7280", bg: "rgba(107,114,128,0.08)", border: "rgba(107,114,128,0.2)", glow: "rgba(107,114,128,0.3)",
    label: "Cancelled", headline: "Dibatalkan", sub: "Pesanan ini dibatalkan.",
    icon: XCircle
  },
}/* ─────────────────────────────────────────────
   LOADING SCREEN
───────────────────────────────────────────── */
const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0C10] gap-8">
    <motion.div 
      animate={{ 
        rotate: 360,
        scale: [1, 1.2, 1],
      }} 
      transition={{ 
        rotate: { repeat: Infinity, duration: 2, ease: "linear" },
        scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
      }}
      className="relative"
    >
      <div className="w-16 h-16 border-4 border-red-500/20 border-t-red-500 rounded-full" />
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500"
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
      />
    </motion.div>
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-white/60 text-sm flex items-center gap-2"
    >
      <span>Memuat data transaksi</span>
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        ...
      </motion.span>
    </motion.div>
  </div>
);

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function OrderStatus() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: order, isLoading, isFetching } = trpc.orders.guestGetStatus.useQuery(
    { id: id || "" },
    { enabled: !!id, retry: false, refetchInterval: 5000 }
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    toast.success("Data diperbarui!");
  }, []);

  const o = order as unknown as Order | undefined;
  let rawStatus = o?.status || "pending";
  
  if (rawStatus === "Sukses" || rawStatus === "delivered" || rawStatus === "completed") rawStatus = "success";
  if (rawStatus === "Proses" || rawStatus === "shipped" || rawStatus === "confirmed") rawStatus = "processing";
  if (rawStatus === "Gagal") rawStatus = "failed";
  if (rawStatus === "Reffund") rawStatus = "refund";

  const status = rawStatus;
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending;

  if (isLoading) return <LoadingScreen />;

  if (!o) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0C10] text-white gap-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="mb-4"
      >
        <Search className="w-16 h-16 text-white/40" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-white/60"
      >
        Order tidak ditemukan
      </motion.p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/")}
        className="px-6 py-2 bg-red-600 text-white rounded-lg mt-4"
      >
        Kembali ke Beranda
      </motion.button>
    </div>
  );

  const createdDate = new Date(o.createdAt);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen pb-20 font-sans overflow-hidden relative" style={{ background: "#0B0C10", color: "#E0E2E5" }}>
      
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>
      

      
      {/* HEADER */}
      <motion.div 
        className="max-w-3xl mx-auto px-4 pt-6 pb-4 flex items-center justify-between relative z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button 
          onClick={() => navigate("/")} 
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div whileHover={{ rotate: -90 }} transition={{ duration: 0.3 }}>
            <ArrowLeft className="w-5 h-5 group-hover:text-red-400 transition-colors" />
          </motion.div>
          <span className="text-sm font-medium">Kembali ke Beranda</span>
        </motion.button>
        <div className="flex gap-2">
          {cfg.isLive && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 text-xs text-blue-400 mr-2"
            >
              <div className="relative flex h-2 w-2">
                <motion.span 
                  className="absolute inline-flex h-full w-full rounded-full bg-blue-400"
                  animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </div>
              Live Sync
            </motion.div>
          )}
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:glass-panel-light transition-colors text-xs text-white/60"
          >
            <motion.div
              animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </motion.div>
            Refresh
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:glass-panel-light transition-colors text-xs text-white/60">
            <Share2 className="w-3.5 h-3.5" /> Bagikan
          </motion.button>
        </div>
      </motion.div>

      <motion.div 
        className="max-w-3xl mx-auto px-4 space-y-4 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        
        {/* HERO BANNER */}
        <motion.div 
          variants={itemVariants} 
          className="relative rounded-2xl overflow-hidden p-8 flex flex-col items-center text-center border border-white/5"
          style={{ background: `radial-gradient(circle at 50% 50%, ${cfg.bg} 0%, rgba(20,20,22,0.9) 100%)` }}
        >
          
          
          <div className="relative mb-5 mt-2">
            <motion.div 
              animate={cfg.isLive ? { 
                y: [0, -10, 0],
                boxShadow: [
                  `0 0 30px ${cfg.glow}`, 
                  `0 0 60px ${cfg.color}`, 
                  `0 0 30px ${cfg.glow}`
                ]
              } : {
                boxShadow: [
                  `0 0 20px ${cfg.glow}`,
                  `0 0 40px ${cfg.color}`,
                  `0 0 20px ${cfg.glow}`
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 rounded-full flex items-center justify-center relative z-20 cursor-pointer"
              style={{ background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}88)`, boxShadow: `0 0 40px ${cfg.glow}` }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              
              <motion.div
                animate={cfg.isLive ? { rotate: [0, 360] } : { rotate: [0, 10, -10, 0] }}
                transition={cfg.isLive ? 
                  { duration: 8, repeat: Infinity, ease: "linear" } : 
                  { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }
              >
                <cfg.icon className="w-12 h-12 text-white drop-shadow-md" />
              </motion.div>
            </motion.div>
            
          </div>

          <motion.h1 
            className="text-3xl font-bold text-white mb-3 relative z-30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={cfg.headline}
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(10px)" }}
                transition={{ duration: 0.5 }}
              >
                Transaksi{" "}
                <span style={{ color: cfg.color }}>
                  {cfg.headline.split(' ')[1] || cfg.headline}
                </span>
              </motion.span>
            </AnimatePresence>
          </motion.h1>
          
          <motion.p 
            className="text-white/60 text-sm max-w-sm mb-5 relative z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {cfg.sub}
          </motion.p>

          {status === 'success' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 1 }}
              className="relative z-30 mb-4"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <PartyPopper className="w-16 h-16 text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
              </motion.div>
            </motion.div>
          )}

          {cfg.action && (
            <motion.div 
              whileHover={{ y: -2 }} 
              className="flex flex-col items-center gap-3 relative z-30"
            >
              <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 glass-panel-light text-xs text-white/70 transition-colors shadow-lg"
              >
                {cfg.action} <Info className="w-3.5 h-3.5" />
              </motion.button>
              {(parseKeterangan(o.keterangan) || cfg.reason) && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-white/40 text-xs bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm max-w-sm text-center leading-relaxed"
                >
                  {parseKeterangan(o.keterangan) || cfg.reason}
                </motion.p>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* RINGKASAN TRANSAKSI */}
          <motion.div 
            variants={itemVariants} 
            className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-xl p-5 transition-all duration-300 hover:bg-white/[0.06] hover:border-white/10"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none z-0" />
            <div className="relative z-10">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/5">
              <div className="flex items-center gap-2 text-white/80 font-semibold text-sm">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Receipt className="w-4 h-4 text-red-500" />
                </motion.div>
                RINGKASAN TRANSAKSI
              </div>
              <div className="flex items-center gap-3">
                <motion.span 
                  className="text-sm font-mono text-white/50 truncate max-w-[120px] md:max-w-none hover:text-white/80 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                >
                  #{o.id}
                </motion.span>
                <CopyBtn text={o.id} />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-white/40 mb-1.5 flex items-center gap-1.5">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Timer className="w-3.5 h-3.5"/>
                  </motion.div>
                  Tanggal
                </p>
                <p className="text-sm font-medium text-white/90">
                  {createdDate.toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })}
                  <br/>
                  <AnimatedCounter 
                    value={createdDate.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} 
                    className="text-white/40 text-xs font-normal"
                  />
                  <span className="text-white/40 text-xs font-normal ml-1">(GMT+8)</span>
                </p>
              </div>
              <div className="border-l border-white/5 pl-4 md:pl-6 relative">
                <p className="text-xs text-white/40 mb-1.5 flex items-center gap-1.5">
                  <motion.div
                    animate={cfg.isLive ? { rotate: 360 } : {}}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Clock className="w-3.5 h-3.5"/>
                  </motion.div>
                  Status
                  {isFetching && (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <RefreshCw className="w-3 h-3 text-white/30" />
                    </motion.div>
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <motion.span 
                    className="relative flex h-2.5 w-2.5 shrink-0"
                    animate={cfg.isLive ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {cfg.isLive && (
                      <motion.span 
                        className="absolute inline-flex h-full w-full rounded-full"
                        style={{ backgroundColor: cfg.color }}
                        animate={{ opacity: [0.5, 0, 0.5], scale: [1, 2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: cfg.color }} />
                  </motion.span>
                  <AnimatedCounter value={cfg.label} className="text-sm font-medium" style={{ color: cfg.color }} />
                </div>
              </div>
              <div className="border-l border-white/5 pl-4 md:pl-6 overflow-hidden">
                <p className="text-xs text-white/40 mb-1.5 flex items-center gap-1.5">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Receipt className="w-3.5 h-3.5"/>
                  </motion.div>
                  ID Transaksi
                </p>
                <motion.p 
                  className="text-sm font-medium text-white/90 font-mono truncate" 
                  title={`#${o.id}`}
                  whileHover={{ scale: 1.05, color: "#fff" }}
                >
                  #{o.id}
                </motion.p>
              </div>
            </div>
            </div>
          </motion.div>

        {/* DETAIL PEMBELIAN */}
          <motion.div 
            variants={itemVariants} 
            className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-xl p-5 transition-all duration-300 hover:bg-white/[0.06] hover:border-white/10"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none z-0" />
            <div className="relative z-10">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/5">
              <div className="flex items-center gap-2 text-white/80 font-semibold text-sm">
                <motion.div
                  animate={{ x: [0, 3, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ShoppingCart className="w-4 h-4 text-red-500" />
                </motion.div>
                DETAIL PEMBELIAN
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-white/40">Provider:</span>
                <motion.span 
                  className="text-white/80 font-medium flex items-center gap-1 hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  KryzNet 
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
                  </motion.div>
                </motion.span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: -2 }}
                  whileTap={{ scale: 0.95, rotate: 2 }}
                  className="w-20 h-20 rounded-xl overflow-hidden glass-panel-light border border-white/10 shrink-0 flex items-center justify-center relative group cursor-pointer"
                >
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    initial={false}
                    animate={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  />
                  <motion.img 
                    src={o.gameImage || "/placeholder-game.png"} 
                    alt="Game" 
                    className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-500" 
                    onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=Game&background=222&color=fff&size=128' }}
                    whileHover={{ scale: 1.1 }}
                  />
                  <motion.div 
                    className="absolute inset-0 ring-2 ring-white/0 group-hover:ring-white/20 rounded-xl transition-all duration-300"
                  />
                </motion.div>
                <div>
                  <motion.h3 
                    className="text-lg font-bold text-white mb-1 tracking-tight"
                    layout
                  >
                    {o.serviceName ? (o.gameSlug ? o.gameSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : "Game Item") : "Mobile Legends"}
                  </motion.h3>
                  <div className="flex items-center gap-2 mb-2">
                    <motion.span 
                      className="text-sm text-white/80 glass-panel-light px-2 py-0.5 rounded-md border border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                    >
                      {o.serviceName || "Diamonds"}
                    </motion.span>
                  </div>
                  <div className="text-xs text-white/40">
                    Game ID <br/>
                    <motion.span 
                      className="text-white/90 text-sm mt-0.5 inline-flex items-center gap-1.5 group cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(o.gameUserId || "");
                        toast.success("Game ID disalin!");
                      }}
                      whileHover={{ x: 3 }}
                    >
                      {o.gameUserId ? `${o.gameUserId}${o.zoneId ? ` (${o.zoneId})` : ''}` : "Unknown"} 
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Copy className="w-3 h-3 text-white/30 group-hover:text-white transition-colors" />
                      </motion.div>
                    </motion.span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <motion.div 
                  animate={{ y: [0, -8, 0] }} 
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} 
                  className="w-16 h-16 opacity-90 hidden sm:block drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                  whileHover={{ scale: 1.2, rotate: 360 }}
                >
                  <img 
                    src="https://yfkcuzvslnjrdwkdlkwe.supabase.co/storage/v1/object/public/game-images/diamond-v2.png" 
                    alt="Item" 
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.currentTarget.style.display = 'none' }} 
                  />
                </motion.div>
                <motion.span 
                  className="text-2xl font-bold text-white tracking-wide"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  x {o.serviceName?.match(/\d+/)?.[0] || "1"}
                </motion.span>
              </div>
            </div>
            </div>
          </motion.div>

        {/* DETAIL PEMBAYARAN */}
          <motion.div 
            variants={itemVariants} 
            className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-xl p-5 transition-all duration-300 hover:bg-white/[0.06] hover:border-white/10"
          >
            <div className="relative z-10">
            <div className="flex items-center gap-2 text-white/80 font-semibold text-sm mb-5 pb-4 border-b border-white/5">
              <motion.div
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <CreditCard className="w-4 h-4 text-red-500" />
              </motion.div>
              DETAIL PEMBAYARAN
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/40 mb-1.5">Metode Pembayaran</p>
                <motion.div 
                  className="text-xl font-black italic tracking-tighter text-white drop-shadow-md"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  QRIS
                </motion.div>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/40 mb-1.5">Total Bayar</p>
                <motion.p 
                  key={formatPrice(o.totalMyr, o.totalIdr || o.total)}
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="text-2xl font-bold" 
                  style={{ color: cfg.color }}
                >
                  {formatPrice(o.totalMyr, o.totalIdr || o.total)}
                </motion.p>
              </div>
            </div>
            </div>
          </motion.div>
        

        {/* QRIS PAYMENT SECTION (ONLY FOR PENDING DEPOSITS) */}
        <AnimatePresence>
          {status === 'pending' && o.qrImage && (
            <motion.div
              initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              
                <motion.div 
                  className="rounded-xl border border-blue-500/30 bg-white/[0.02] backdrop-blur-xl p-5 mt-4 mb-4 transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.1)] relative overflow-hidden"
                >
                  {/* Decorative background pulse */}
                  <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                  
                  <div className="flex flex-col items-center justify-center text-center relative z-10">
                    <h3 className="text-lg font-bold text-white mb-2 tracking-tight">Scan QRIS Untuk Membayar</h3>
                    <p className="text-sm text-white/50 mb-5 max-w-sm leading-relaxed">
                      Silakan scan kode QR di bawah ini menggunakan aplikasi M-Banking atau E-Wallet Anda sebelum waktu habis.
                    </p>
                    
                    <motion.div 
                      whileHover={{ scale: 1.02, rotate: [-1, 1, 0] }}
                      className="bg-white p-3 rounded-2xl shadow-2xl mb-5 relative group"
                    >
                      <div className="absolute inset-0 bg-blue-500/30 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                      <div className="absolute inset-0 border-4 border-dashed border-blue-500/30 rounded-2xl animate-spin-slow pointer-events-none" style={{ animationDuration: '10s' }} />
                      <img src={o.qrImage} alt="QRIS Payment" className="w-48 h-48 md:w-56 md:h-56 relative z-10 rounded-xl" />
                    </motion.div>
                    
                    {o.checkoutUrl && (
                      <motion.a 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={o.checkoutUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] text-white rounded-full transition-all font-semibold text-sm"
                      >
                        Buka di Aplikasi <ExternalLink className="w-4 h-4" />
                      </motion.a>
                    )}
                  </div>
                </motion.div>
              
            </motion.div>
          )}
        </AnimatePresence>

        {/* STATUS TRANSAKSI TIMELINE */}
        <motion.div 
          variants={itemVariants} 
          className="group relative rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-xl p-5 overflow-hidden hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none z-0" />
          <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-white/80 font-semibold text-sm">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <Clock className="w-4 h-4 text-red-500" />
              </motion.div>
              STATUS TRANSAKSI
            </div>
            {cfg.isLive && (
              <motion.span 
                className="text-[10px] text-white/40 flex items-center gap-1.5 glass-panel-light px-2 py-1 rounded-full"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="w-3 h-3" />
                </motion.div>
                Auto-sync aktif
              </motion.span>
            )}
          </div>
          
          <div className="relative px-2 md:px-4">
            {/* Background line */}
            <div className="absolute top-3.5 left-10 right-10 h-[2px] bg-white/10" />
            
            {/* Active line with glow */}
            <motion.div 
              className="absolute top-3.5 left-10 h-[2px] origin-left"
              style={{ 
                background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}88)`,
                boxShadow: `0 0 10px ${cfg.color}`
              }}
              initial={{ scaleX: 0 }}
              animate={{ 
                scaleX: status === 'pending' ? 0 : status === 'processing' ? 0.4 : status === 'failed' ? 0.7 : 1 
              }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            
            {/* Processing pulse */}
            {status === 'processing' && (
              <motion.div 
                className="absolute top-2.5 left-[40%] h-4"
                animate={{ 
                  x: [-10, 10],
                  opacity: [0, 1, 0]
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              >
                <div 
                  className="w-4 h-4 rounded-full shadow-lg"
                  style={{ 
                    backgroundColor: cfg.color,
                    boxShadow: `0 0 20px ${cfg.color}, 0 0 40px ${cfg.color}44`
                  }}
                />
              </motion.div>
            )}
              
            <div className="relative flex justify-between">
              {/* Step 1 - Payment Received */}
              <div className="flex flex-col items-center gap-2 text-center w-20 md:w-24 group">
                <motion.div 
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center z-10 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-300 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-black" />
                </motion.div>
                <motion.div 
                  className="text-[10px] text-white/40 group-hover:text-white/60 transition-colors"
                  whileHover={{ scale: 1.1 }}
                >
                  {createdDate.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}
                </motion.div>
                <div className="text-[10px] md:text-[11px] font-medium text-white/70 leading-tight">Pembayaran<br/>Diterima</div>
              </div>

              {/* Step 2 - Verification */}
              <div className="flex flex-col items-center gap-2 text-center w-20 md:w-24 group">
                <motion.div 
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center z-10 transition-all duration-500 cursor-pointer ${
                    status !== 'pending' 
                      ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                      : 'bg-white/[0.02] backdrop-blur-xl border-2 border-white/20'
                  }`}
                >
                  {status !== 'pending' && (
                    <motion.div 
                      initial={{ scale: 0, rotate: -180 }} 
                      animate={{ scale: 1, rotate: 0 }} 
                      transition={{ type: "spring", delay: 0.5 }}
                    >
                      <Check className="w-4 h-4 text-black" />
                    </motion.div>
                  )}
                  {status === 'pending' && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="w-2 h-2 rounded-full bg-white/20" />
                    </motion.div>
                  )}
                </motion.div>
                <motion.div 
                  className="text-[10px] text-white/40 group-hover:text-white/60 transition-colors"
                  whileHover={{ scale: 1.1 }}
                >
                  {status !== 'pending' ? createdDate.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) : '--:--'}
                </motion.div>
                <div className={`text-[10px] md:text-[11px] font-medium leading-tight transition-colors ${
                  status !== 'pending' ? 'text-white/70' : 'text-white/30'
                }`}>
                  Pembayaran<br/>Verifikasi
                </div>
              </div>

              {/* Step 3 - Send to Provider */}
              <div className="flex flex-col items-center gap-2 text-center w-20 md:w-24 group">
                <motion.div 
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center z-10 transition-all duration-500 delay-300 cursor-pointer ${
                    (status === 'success' || status === 'failed') 
                      ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                      : status === 'processing'
                      ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                      : 'bg-white/[0.02] backdrop-blur-xl border-2 border-white/20 relative'
                  }`}
                >
                  {(status === 'success' || status === 'failed') && (
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      transition={{ type: "spring", delay: 0.8 }}
                    >
                      <Check className="w-4 h-4 text-black" />
                    </motion.div>
                  )}
                  {status === 'processing' && (
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="w-5 h-5 border-3 border-white border-t-transparent rounded-full"
                    />
                  )}
                  {status === 'pending' && (
                    <div className="w-2 h-2 rounded-full bg-white/20" />
                  )}
                </motion.div>
                <motion.div 
                  className="text-[10px] text-white/40 group-hover:text-white/60 transition-colors"
                  whileHover={{ scale: 1.1 }}
                >
                  {(status === 'success' || status === 'failed' || status === 'processing') 
                    ? createdDate.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) 
                    : '--:--'
                  }
                </motion.div>
                <div className={`text-[10px] md:text-[11px] font-medium leading-tight transition-colors ${
                  (status === 'success' || status === 'failed' || status === 'processing') 
                    ? 'text-white/70' 
                    : 'text-white/30'
                }`}>
                  Dikirim ke<br/>Provider
                </div>
              </div>

              {/* Step 4 - Result */}
              <div className="flex flex-col items-center gap-2 text-center w-20 md:w-24 group">
                <motion.div 
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center z-10 transition-all duration-500 delay-500 cursor-pointer ${
                    status === 'success' 
                      ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                      : status === 'failed' 
                      ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                      : 'bg-white/[0.02] backdrop-blur-xl border-2 border-white/20'
                  }`}
                >
                  {status === 'success' && (
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      transition={{ type: "spring", delay: 1 }}
                    >
                      <Check className="w-4 h-4 text-black" />
                    </motion.div>
                  )}
                  {status === 'failed' && (
                    <motion.div 
                      initial={{ scale: 0, rotate: 180 }} 
                      animate={{ scale: 1, rotate: 0 }} 
                      transition={{ type: "spring", delay: 1 }}
                    >
                      <XCircle className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                  {(status === 'pending' || status === 'processing') && (
                    <div className="w-2 h-2 rounded-full bg-white/20" />
                  )}
                </motion.div>
                <motion.div 
                  className="text-[10px] text-white/40 group-hover:text-white/60 transition-colors"
                  whileHover={{ scale: 1.1 }}
                >
                  {(status === 'success' || status === 'failed') 
                    ? createdDate.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) 
                    : '--:--'
                  }
                </motion.div>
                <div className={`text-[10px] md:text-[11px] font-medium leading-tight transition-colors ${
                  (status === 'success' || status === 'failed') 
                    ? 'text-white/70' 
                    : 'text-white/30'
                }`}>
                  {status === 'failed' ? 'Provider\nMenolak' : 'Provider\nMenerima'}
                </div>
              </div>
            </div>
          </div>
          </div>
        </motion.div>

        {/* BUTUH BANTUAN */}
        <motion.div 
          variants={itemVariants} 
          className="group rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-xl p-5 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative transition-all duration-300 hover:bg-white/[0.06] hover:border-white/10"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none z-0" />
          <div className="relative z-10 w-full flex flex-col md:flex-row items-center justify-between gap-6">
          <motion.div 
            className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="flex-1 relative z-10">
            <div className="flex items-center gap-2 text-white/80 font-semibold text-sm mb-3">
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <MessageCircle className="w-5 h-5 text-red-500" />
              </motion.div>
              BUTUH BANTUAN?
            </div>
            <p className="text-sm text-white/40 leading-relaxed">
              Jika pembayaran Anda sudah terpotong namun pesanan gagal, silakan hubungi support dengan menyertakan ID Transaksi.
            </p>
          </div>
          <motion.div 
            className="w-24 h-24 bg-white p-2 rounded-lg shrink-0 relative z-10 shadow-lg cursor-pointer"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-full h-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=support')] bg-cover opacity-90 mix-blend-multiply" />
            <motion.div 
              className="absolute inset-0 rounded-lg ring-2 ring-white/0"
              whileHover={{ ringColor: "rgba(255,255,255,0.5)" }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
          </div>
        </motion.div>

        {/* ACTIONS */}
        <motion.div variants={itemVariants} className="flex gap-3 pt-4">
          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/products")} 
            className="flex-1 py-3.5 rounded-xl border border-white/10 text-white font-semibold text-sm flex justify-center items-center gap-2 overflow-hidden relative group"
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" 
            />
            <span className="relative z-10 flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-4 h-4 text-yellow-500"/>
              </motion.div>
              Top Up Lagi
            </span>
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.98 }} 
            className="flex-1 py-3.5 rounded-xl border border-white/10 text-white font-semibold text-sm flex justify-center items-center gap-2 overflow-hidden relative group"
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" 
            />
            <span className="relative z-10 flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <MessageCircle className="w-4 h-4 text-blue-400"/>
              </motion.div>
              Hubungi Support
            </span>
          </motion.button>
          
          <motion.button 
            whileHover={{ 
              scale: 1.02, 
              boxShadow: "0 0 30px rgba(220,38,38,0.6)",
              backgroundColor: "#DC2626"
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/dashboard")} 
            className="flex-1 py-3.5 rounded-xl bg-red-600 text-white transition-all duration-300 font-semibold text-sm flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.2)] relative overflow-hidden group"
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
            />
            <motion.div
              className="absolute inset-0 bg-white/20"
              animate={{
                x: ["-100%", "200%"]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <span className="relative z-10 flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Home className="w-4 h-4"/>
              </motion.div>
              Lihat Dashboard
            </span>
          </motion.button>
        </motion.div>

      </motion.div>
    </div>
  );
}