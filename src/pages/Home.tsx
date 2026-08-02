import { Link, useNavigate } from "react-router";
import SeoHead from "@/components/SeoHead";
import { trpc } from "@/providers/trpc";
import { useCurrency } from "@/providers/CurrencyProvider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Gamepad2,
  Zap,
  ShoppingCart,
  Flame,
  Shield,
  Headphones,
  Star,
  ArrowRight,
  CheckCircle,
  MessageCircle,
  Wallet,
  Banknote,
  Copy,
  Check,
  ChevronRight,
  Smartphone,
  Gift,
  Clock,
  TrendingUp,
  Rocket,
  X,
  Search,
  Crown,
} from "lucide-react";
import { useEffect, useState, useRef, useCallback, memo, useMemo } from "react";

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const getImageUrl = (url: string): string => {
  if (!url) return "";
  if (url.includes("api.kryz-net.space"))
    return url.replace("https://api.kryz-net.space", "");
  return url;
};

const IDR = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const TICKER_ITEMS = [
  "Andi R. baru saja top up 86 Diamond MLBB ✓",
  "Siti N. top up 325 UC PUBG Mobile ✓",
  "Budi K. beli 480 Genesis Crystal Genshin ✓",
  "Maya T. top up 200 Diamonds Free Fire ✓",
  "Alex W. top up 100 Voucher Google Play ✓",
  "Dewi L. top up 1x Pass Battle MLBB ✓",
  "Rian P. beli 980 Primogems Genshin ✓",
  "Nisa F. top up 2000 UC PUBG Mobile ✓",
];

const GAMES = [
  "Mobile Legends",
  "PUBG Mobile",
  "Free Fire",
  "Genshin Impact",
  "Valorant",
  "Honor of Kings",
  "Clash of Clans",
  "Brawl Stars",
  "Roblox",
  "Call of Duty Mobile",
  "Arena of Valor",
  "Eggy Party",
];

const TESTIMONIALS = [
  {
    name: "Rizky A.",
    role: "Mythic Glory MLBB",
    text: "Topup tercepat! 10 detik udah masuk. Gak pernah gagal sekali pun.",
    rating: 5,
    av: "R",
    time: "2 menit yang lalu",
  },
  {
    name: "Siti N.",
    role: "Streamer Nimo TV",
    text: "Harga paling murah se-MALAYSIA. Udah langganan 6 bulan lebih.",
    rating: 5,
    av: "S",
    time: "5 menit yang lalu",
  },
  {
    name: "Budi P.",
    role: "Pro Player FF",
    text: "Support 24 jam beneran! Pernah topup jam 3 pagi tetep diproses instan.",
    rating: 5,
    av: "B",
    time: "10 menit yang lalu",
  },
  {
    name: "Dian K.",
    role: "Gamer Genshin",
    text: "Bandingin harga kemana-mana, disini paling murah & prosesnya cepet.",
    rating: 5,
    av: "D",
    time: "15 menit yang lalu",
  },
  {
    name: "Alex W.",
    role: "Konten Kreator",
    text: "Ada cashback & referral bonus. Udah ngajak semua temen pake ini.",
    rating: 5,
    av: "A",
    time: "20 menit yang lalu",
  },
  {
    name: "Maya R.",
    role: "Gamer Casual",
    text: "UI gampang dipake, banyak pilihan pembayaran. Top up jadi makin nyaman!",
    rating: 5,
    av: "M",
    time: "25 menit yang lalu",
  },
];

/* ─────────────────────────────────────────────
   CUSTOM HOOKS
───────────────────────────────────────────── */
function useCountUp(target: number, duration = 2000, active = true) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start: number, id: number;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) id = requestAnimationFrame(tick);
      else setVal(target);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [target, duration, active]);
  return val;
}

function useTypewriter(texts: string[], speed = 70, pause = 2500) {
  const [display, setDisplay] = useState("");
  const [ti, setTi] = useState(0);
  const [ci, setCi] = useState(0);
  const [del, setDel] = useState(false);

  useEffect(() => {
    const cur = texts[ti];
    const t = setTimeout(
      () => {
        if (!del) {
          if (ci < cur.length) {
            setDisplay(cur.slice(0, ci + 1));
            setCi(ci + 1);
          } else {
            setTimeout(() => setDel(true), pause);
          }
        } else {
          if (ci > 0) {
            setDisplay(cur.slice(0, ci - 1));
            setCi(ci - 1);
          } else {
            setDel(false);
            setTi((ti + 1) % texts.length);
          }
        }
      },
      del ? speed / 2 : speed
    );
    return () => clearTimeout(t);
  }, [ci, del, ti, texts, speed, pause]);

  return display;
}

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVis(true);
          o.disconnect();
        }
      },
      { threshold }
    );
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, [threshold]);
  return { ref, vis };
}

function useExitIntent() {
  const [showExitPopup, setShowExitPopup] = useState(false);

  useEffect(() => {
    const handleExitIntent = (e: MouseEvent) => {
      if (e.clientY <= 0 && !showExitPopup) {
        setShowExitPopup(true);
      }
    };
    document.addEventListener("mouseleave", handleExitIntent);
    return () => document.removeEventListener("mouseleave", handleExitIntent);
  }, [showExitPopup]);

  return { showExitPopup, setShowExitPopup };
}

/* ─────────────────────────────────────────────
   LIVE TICKER COMPONENT
───────────────────────────────────────────── */
const LiveTicker = memo(function LiveTicker() {
  const [paused, setPaused] = useState(false);

  return (
    <div
      className="relative overflow-hidden bg-amber-50 border-y border-amber-200/70 py-2.5 cursor-pointer select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="marquee"
      aria-label="Live transactions"
    >
      <style>{`
        @keyframes ticker {
          from { transform: translateX(0) }
          to { transform: translateX(-50%) }
        }
      `}</style>
      <div
        className={`flex items-center gap-3 ${paused ? "" : "animate-[ticker_30s_linear_infinite]"}`}
        style={{ animationPlayState: paused ? "paused" : "running" }}
      >
        {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-3 whitespace-nowrap text-xs font-medium text-amber-800/80 hover:text-primary transition-colors duration-200"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            {item}
            <span className="text-amber-500/50 mx-2">·</span>
          </span>
        ))}
      </div>
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-amber-50 to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-amber-50 to-transparent pointer-events-none z-10" />
    </div>
  );
});

/* ─────────────────────────────────────────────
   GAME MARQUEE
───────────────────────────────────────────── */
const MemoizedGameMarquee = memo(function GameMarquee() {
  return (
    <div className="overflow-hidden py-6 border-y border-border/70 bg-card/50">
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0) }
          to { transform: translateX(-50%) }
        }
      `}</style>
      <div className="flex gap-6 animate-[marquee_25s_linear_infinite]">
        {[...GAMES, ...GAMES].map((g, i) => (
          <span
            key={i}
            className={`flex items-center gap-2 whitespace-nowrap text-sm font-bold tracking-wide hover:scale-110 transition-transform cursor-default ${
              i % 3 === 0 ? "text-foreground" : i % 3 === 1 ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Zap className="w-3 h-3 opacity-60" />
            {g}
          </span>
        ))}
      </div>
    </div>
  );
});

/* ─────────────────────────────────────────────
   TESTIMONIAL MARQUEE
───────────────────────────────────────────── */
const MemoizedTestimonialMarquee = memo(function TestimonialMarquee() {
  return (
    <div className="overflow-hidden py-4">
      <style>{`
        @keyframes marquee-slow {
          from { transform: translateX(0) }
          to { transform: translateX(-50%) }
        }
      `}</style>
      <div className="flex gap-4 animate-[marquee-slow_40s_linear_infinite]">
        {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
          <Card
            key={i}
            className="flex-shrink-0 w-80 rounded-2xl p-5 space-y-3 hover:scale-[1.02] transition-all duration-300 border-border bg-card shadow-[0_8px_24px_-14px_rgba(120,90,40,0.2)]"
          >
            <div className="flex items-center justify-between">
              <div className="flex gap-0.5">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {t.time}
              </span>
            </div>
            <p className="text-sm text-foreground/70 leading-relaxed italic">"{t.text}"</p>
            <div className="flex items-center gap-2.5 pt-1">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, ${["#F59E0B", "#F97316", "#D97706", "#EA580C", "#FBBF24", "#C2410C"][
                    i % 6
                  ]}, ${["#F97316", "#D97706", "#EA580C", "#F59E0B", "#EA580C", "#F97316"][i % 6]})`,
                }}
              >
                {t.av}
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">{t.name}</p>
                <p className="text-[10px] text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
});

/* ─────────────────────────────────────────────
   PRODUCT CARD
───────────────────────────────────────────── */
const ProductCard = memo(function ProductCard({ product, index }: { product: any; index: number }) {
  const name = String(product.name);
  const price = Number(product.price);
  const img = product.images?.[0] ? getImageUrl(String(product.images[0])) : null;
  const { formatPrice } = useCurrency();
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <Link to={`/products/${String(product.id)}`} aria-label={`Top up ${name}`}>
      <Card
        className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 border-border bg-card hover:border-primary/40"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          animationDelay: `${index * 60}ms`,
          boxShadow: isHovered
            ? "0 24px 40px -16px rgba(234,88,12,0.25)"
            : "0 8px 24px -14px rgba(120,90,40,0.18)",
        }}
      >
        <div className="aspect-square overflow-hidden relative p-3 flex items-center justify-center bg-gradient-to-b from-amber-50 to-transparent">
          {img && !imgError ? (
            img.startsWith("http") || img.startsWith("/") ? (
              <img
                src={img}
                alt={name}
                loading="lazy"
                className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full rounded-xl flex items-center justify-center bg-amber-50 text-5xl transition-transform duration-500 group-hover:scale-105">
                {img}
              </div>
            )
          ) : (
            <div className="w-full h-full rounded-xl flex items-center justify-center bg-amber-50">
              <Gamepad2 className="w-10 h-10 text-amber-300 group-hover:text-primary transition-colors duration-300" />
            </div>
          )}

          <Badge
            className="absolute top-4 left-4 flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black text-white shadow-md uppercase tracking-wider"
            style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}
          >
            <Flame className="w-2.5 h-2.5" /> HOT
          </Badge>
        </div>

        <div className="p-3.5 pt-1 bg-card flex flex-col justify-between h-[85px] border-t border-border/70">
          <div>
            <p className="font-bold text-sm text-foreground tracking-tight truncate group-hover:text-primary transition-colors duration-200">
              {name}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mt-0.5 truncate">
              {String(product.category || "Game Top Up")}
            </p>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs font-extrabold text-primary tabular-nums">
              {price > 0 ? formatPrice(undefined, price) : "Cek Detail"}
            </span>
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              Instant
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
});

/* ─────────────────────────────────────────────
   PRODUCT SKELETON
───────────────────────────────────────────── */
const ProductSkeleton = memo(function ProductSkeleton() {
  return (
    <Card className="rounded-2xl overflow-hidden animate-pulse border-border bg-card">
      <div className="aspect-square relative overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-muted to-transparent"
          style={{
            animation: "shimmer 2s infinite",
            backgroundSize: "200% 100%",
          }}
        />
      </div>
      <div className="p-3.5 space-y-2">
        <div className="h-3 bg-muted rounded-lg w-3/4" />
        <div className="h-2 bg-muted rounded-lg w-1/2" />
        <div className="flex justify-between mt-2">
          <div className="h-3 bg-muted rounded-lg w-1/3" />
          <div className="h-3 bg-muted rounded-lg w-1/4" />
        </div>
      </div>
    </Card>
  );
});

/* ─────────────────────────────────────────────
   QUICK ACTION FAB
───────────────────────────────────────────── */
const QuickActionFAB = memo(function QuickActionFAB() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 animate-[fadeUp_0.3s_ease]">
      <a
        href="https://wa.me/60137345871"
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-200 hover:shadow-xl group bg-emerald-500"
        aria-label="Chat WhatsApp"
      >
        <MessageCircle className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
      </a>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-200 hover:shadow-xl group bg-gradient-to-br from-amber-400 to-orange-600"
        aria-label="Scroll to top"
      >
        <ChevronRight className="w-5 h-5 text-white -rotate-90 group-hover:-translate-y-1 transition-transform" />
      </button>
    </div>
  );
});

/* ─────────────────────────────────────────────
   EXIT INTENT POPUP
───────────────────────────────────────────── */
const ExitIntentPopup = memo(function ExitIntentPopup({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) {
  const PROMO = "WELCOME10";
  const [copied, setCopied] = useState(false);

  const copyPromo = useCallback(() => {
    navigator.clipboard.writeText(PROMO);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease]">
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative bg-card rounded-3xl p-8 max-w-md w-full border-border shadow-2xl animate-[fadeUp_0.4s_cubic-bezier(.22,.68,0,1.2)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-secondary text-muted-foreground hover:bg-secondary/70 hover:text-foreground transition-colors"
          aria-label="Close popup"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto bg-gradient-to-br from-amber-400 to-orange-600 shadow-[0_8px_20px_rgba(249,115,22,0.4)]">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-extrabold text-foreground">
            Tunggu Dulu!
          </h3>
          <p className="text-muted-foreground text-sm">
            Sebelum kamu pergi, ambil kode promo spesial untuk diskon 10%!
          </p>
          <div className="rounded-xl p-4 bg-amber-50 border-2 border-dashed border-amber-300">
            <code className="text-2xl font-extrabold tracking-[0.15em] text-primary">
              {PROMO}
            </code>
          </div>
          <Button
            onClick={copyPromo}
            className={`w-full py-3 rounded-xl font-bold transition-all hover:scale-[1.02] ${
              copied
                ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {copied ? "✓ Kode Tersalin!" : "Salin Kode Promo"}
          </Button>
          <p className="text-[10px] text-muted-foreground/70">* Berlaku untuk pengguna baru</p>
        </div>
      </Card>
    </div>
  );
});

/* ─────────────────────────────────────────────
   PRICE COMPARISON SECTION
───────────────────────────────────────────── */
const PriceComparisonSection = memo(function PriceComparisonSection() {
  const { ref, vis } = useReveal(0.1);

  return (
    <section ref={ref} className="max-w-7xl mx-auto px-6 pb-24">
      <div
        className={`rounded-3xl p-8 lg:p-12 relative overflow-hidden ${vis ? "reveal" : "opacity-0"}`}
        style={{
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          boxShadow: "0 24px 48px -24px rgba(190,130,20,0.25)",
          animationDelay: "0ms",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100/50 to-transparent pointer-events-none" />
        <div className="grid lg:grid-cols-2 gap-8 items-start relative">
          <div>
            <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-3 text-primary">
              — MENGAPA KAMI
            </p>
            <h3 className="text-2xl lg:text-3xl font-extrabold text-foreground mb-6">
              Kenapa Harga Kami
              <br />
              <span className="text-gradient">Paling Murah?</span>
            </h3>
            <div className="space-y-4">
              {[
                {
                  title: "Harga Real-Time",
                  desc: "Harga diperbarui otomatis dari supplier langsung setiap 5 menit",
                  color: "#0284C7",
                },
                {
                  title: "Tanpa Biaya Tersembunyi",
                  desc: "Tidak ada admin fee atau biaya tambahan apapun",
                  color: "#059669",
                },
                {
                  title: "Garansi Harga Termurah",
                  desc: "Kami jamin harga paling murah atau uang kembali 2x lipat",
                  color: "#EA580C",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl transition-all hover:bg-secondary/60"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.color}15` }}
                  >
                    <CheckCircle className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">{item.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            className="rounded-2xl p-6 space-y-4 bg-card"
            style={{
              border: "1px solid hsl(var(--border))",
              boxShadow: "0 12px 32px -20px rgba(120,90,40,0.25)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-bold text-foreground">Bandingkan Harga Terbaru</h4>
            </div>
            {[
              {
                game: "86 Diamond MLBB",
                market: "Rp 29.000",
                ours: "Rp 24.500",
                save: "15%",
              },
              {
                game: "325 UC PUBG",
                market: "Rp 56.000",
                ours: "Rp 47.500",
                save: "15%",
              },
              {
                game: "480 GC Genshin",
                market: "Rp 84.000",
                ours: "Rp 72.000",
                save: "14%",
              },
              {
                game: "200 Diamond FF",
                market: "Rp 32.000",
                ours: "Rp 26.900",
                save: "16%",
              },
            ].map((row, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-border last:border-0 group hover:bg-secondary/40 -mx-2 px-2 rounded-lg transition-all"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground/80">{row.game}</p>
                  <p className="text-[10px] text-muted-foreground/60">Harga pasaran vs NickStore</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground/50 line-through block">{row.market}</span>
                    <span className="text-sm font-bold text-emerald-700 tabular-nums">{row.ours}</span>
                  </div>
                  <Badge className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-emerald-500 flex items-center gap-1">
                    <TrendingUp className="w-2.5 h-2.5" />
                    -{row.save}
                  </Badge>
                </div>
              </div>
            ))}
            <div className="pt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Rata-rata penghematan</span>
                <span className="font-bold text-emerald-700">15%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-600 w-[85%]" />
              </div>
            </div>
            <p className="text-center text-[10px] text-muted-foreground/70 pt-2 flex items-center justify-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              Harga diperbarui setiap 5 menit
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});

/* ─────────────────────────────────────────────
   MAIN HOME COMPONENT
───────────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { showExitPopup, setShowExitPopup } = useExitIntent();
  const { ref: statsRef, vis: statsVis } = useReveal(0.2);
  const { ref: featRef, vis: featVis } = useReveal(0.1);

  const { data: productsData, isLoading } = trpc.products.list.useQuery({ limit: 12 });
  const products = useMemo(() => (productsData as any)?.data || [], [productsData]);

  const PROMO = "WELCOME10";
  const users = useCountUp(1247, 2200, statsVis);
  const txns = useCountUp(8934, 2200, statsVis);
  const games = useCountUp(73, 1800, statsVis);
  const rate = useCountUp(99, 1500, statsVis);

  const typed = useTypewriter(
    [
      "Diamond Mobile Legends",
      "UC PUBG Mobile",
      "Voucher Google Play",
      "Diamond Free Fire",
      "Genesis Crystal Genshin",
    ],
    65,
    2800
  );

  const copyPromo = useCallback(() => {
    navigator.clipboard.writeText(PROMO);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <>
      <SeoHead
        title="NickStore - Platform Top Up Game & Voucher Murah #1 Malaysia"
        description="Topup game murah, pantas & automatik 24/7. Beli Diamonds Mobile Legends, Free Fire, Honor of Kings, Magic Chess, voucher & pulsa dengan harga termurah di Malaysia."
      />
      {/* REST OF PAGE */}
    <div className="bg-background min-h-screen font-sans text-foreground">
      {/* ── KEYFRAMES ── */}
      <style>{`
        @keyframes fadeUp { 
          from { opacity:0; transform:translateY(24px) } 
          to { opacity:1; transform:translateY(0) } 
        }
        @keyframes fadeIn { 
          from { opacity:0 } 
          to { opacity:1 } 
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%) }
          100% { transform: translateX(100%) }
        }
        .reveal { 
          animation: fadeUp .65s cubic-bezier(.22,.68,0,1.2) both;
        }
        * {
          scroll-behavior: smooth;
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      {/* Skip to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:font-bold"
      >
        Skip to main content
      </a>

      <main id="main-content">
        {/* ── CENTRALIZED SEARCH HERO ── */}
        <section className="relative pt-20 sm:pt-28 pb-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(180,130,40,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(180,130,40,0.05)_1px,transparent_1px)] bg-[size:60px_60px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(251,191,36,0.14)_0%,transparent_70%)] blur-3xl" />

          <div className="relative max-w-4xl mx-auto px-6 text-center z-10 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase bg-card border border-border shadow-[0_2px_8px_rgba(120,90,40,0.08)]">
              <Crown className="w-4 h-4 text-primary" />
              <span className="text-gradient">NICKSTORE · OFFICIAL GAME STORE</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-extrabold leading-[1.05] tracking-tight text-foreground">
                Cari &amp; Top Up Game
                <br />
                <span className="text-gradient">Dalam Sekelip Mata</span>
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto font-medium">
                Pilih daripada 70+ game popular. Transaksi automatik 24 jam dengan harga paling berbaloi.
              </p>
              <p className="text-sm font-bold text-primary tabular-nums flex items-center justify-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                {typed}
                <span className="inline-block w-[2px] h-4 bg-primary animate-pulse" />
              </p>
            </div>

            {/* Centralized Search Bar */}
            <div className="max-w-2xl mx-auto relative group">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-300 via-orange-400 to-orange-500 opacity-40 blur group-hover:opacity-70 transition duration-500" />
              <div className="relative flex items-center bg-card rounded-2xl border border-border p-2 shadow-[0_24px_48px_-24px_rgba(190,130,20,0.35)]">
                <Search className="w-6 h-6 text-primary ml-3 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Cari game kegemaran anda (cth: Mobile Legends, PUBG)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
                  }}
                  className="w-full bg-transparent text-foreground placeholder-muted-foreground text-sm sm:text-base outline-none pr-3"
                />
                <Button
                  onClick={() => navigate(`/products?search=${encodeURIComponent(searchQuery)}`)}
                  className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-primary-foreground bg-primary hover:bg-primary/90 shrink-0"
                >
                  Cari Game
                </Button>
              </div>
            </div>

            {/* Quick Game Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="text-xs text-muted-foreground font-semibold mr-1">Popular:</span>
              {["Mobile Legends", "PUBG Mobile", "Free Fire", "Genshin Impact", "Valorant"].map((g) => (
                <button
                  key={g}
                  onClick={() => navigate(`/products?search=${encodeURIComponent(g)}`)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-card hover:bg-primary/10 hover:text-primary border border-border hover:border-primary/30 transition-all"
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-border max-w-3xl mx-auto">
              {[
                { label: "Pengguna", val: `${users.toLocaleString()}+`, color: "text-primary" },
                { label: "Pesanan Sukses", val: `${txns.toLocaleString()}+`, color: "text-emerald-600" },
                { label: "Koleksi Game", val: `${games}+`, color: "text-amber-500" },
                { label: "Kadar Kepuasan", val: `${rate}%`, color: "text-foreground" },
              ].map((s, i) => (
                <div key={i} className="p-3 rounded-xl bg-card border border-border">
                  <p className={`text-xl font-extrabold tabular-nums ${s.color}`}>
                    {s.val}
                  </p>
                  <p className="text-[11px] font-semibold text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── GAME MARQUEE ── */}
        <MemoizedGameMarquee />

        {/* ── STATS ── */}
        <section
          ref={statsRef}
          className="max-w-7xl mx-auto px-6 py-24"
          aria-label="Platform statistics"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border border-border rounded-3xl overflow-hidden bg-card shadow-[0_24px_48px_-24px_rgba(190,130,20,0.2)]">
            {[
              {
                n: `${users.toLocaleString()}+`,
                label: "Pengguna Aktif",
                sub: "di seluruh MALAYSIA",
                color: "text-primary",
              },
              {
                n: `${txns.toLocaleString()}+`,
                label: "Transaksi Sukses",
                sub: "tanpa gagal",
                color: "text-emerald-600",
              },
              {
                n: `${games}+`,
                label: "Game & Layanan",
                sub: "tersedia sekarang",
                color: "text-amber-500",
              },
              {
                n: `${rate}%`,
                label: "Kepuasan",
                sub: "rating pengguna",
                color: "text-foreground",
              },
            ].map((s, i) => (
              <Card
                key={i}
                className="relative p-8 group border-0 border-r border-border last:border-r-0 hover:bg-secondary/50 transition-colors"
              >
                <p className={`relative text-2xl sm:text-3xl lg:text-5xl font-extrabold mb-2 tabular-nums ${s.color}`}>
                  {s.n}
                </p>
                <p className="relative text-sm font-bold text-foreground/90">{s.label}</p>
                <p className="relative text-xs text-muted-foreground mt-0.5">{s.sub}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* ── PRODUCTS ── */}
        <section className="max-w-7xl mx-auto px-6 pb-24" aria-label="Game populer minggu ini">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-3 text-primary">
                — TRENDING SEKARANG
              </p>
              <h2 className="font-extrabold text-foreground leading-[1.1] text-[clamp(1.8rem,3vw,2.5rem)]">
                Game Paling
                <br />
                <span className="text-gradient">Populer Minggu Ini</span>
              </h2>
            </div>
            <Button
              onClick={() => navigate("/products")}
              variant="outline"
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:gap-3 hover:bg-primary/10 text-primary border-primary/30"
            >
              Lihat Semua
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {isLoading
              ? Array.from({ length: 12 }).map((_, i) => <ProductSkeleton key={i} />)
              : products
                  .slice(0, 12)
                  .map((p: any, i: number) => (
                    <ProductCard key={String(p.id)} product={p} index={i} />
                  ))}
          </div>

          <div className="mt-6 sm:hidden">
            <Button
              onClick={() => navigate("/products")}
              variant="outline"
              className="w-full py-3.5 rounded-2xl text-sm font-bold border-primary/30 text-primary"
            >
              Lihat Semua Game →
            </Button>
          </div>
        </section>

        {/* ── PRICE COMPARISON ── */}
        <PriceComparisonSection />

        {/* ── FEATURES ── */}
        <section
          ref={featRef}
          className="max-w-7xl mx-auto px-6 pb-24"
          aria-label="Fitur unggulan"
        >
          <Card className="rounded-3xl overflow-hidden bg-card border-border shadow-[0_24px_48px_-24px_rgba(190,130,20,0.2)]">
            <div className="grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border">
              {[
                {
                  n: "01",
                  icon: Zap,
                  title: "Proses Super Instan",
                  body: "Top up otomatis 24/7. Item masuk ke akun dalam hitungan detik, bukan menit.",
                  color: "#EA580C",
                },
                {
                  n: "02",
                  icon: Shield,
                  title: "Transaksi 100% Aman",
                  body: "Terenkripsi end-to-end. Garansi pengembalian dana penuh jika ada masalah.",
                  color: "#059669",
                },
                {
                  n: "03",
                  icon: Headphones,
                  title: "Support 24 Jam",
                  body: "Tim kami siap membantu kapan saja via WhatsApp. Rata-rata respons < 2 menit.",
                  color: "#D97706",
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className={`relative p-8 lg:p-10 group ${featVis ? "reveal" : "opacity-0"}`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at 0% 100%, ${f.color}10, transparent 60%)`,
                    }}
                  />
                  <p
                    className="text-3xl sm:text-5xl font-extrabold mb-6 leading-none tabular-nums"
                    style={{
                      color: `${f.color}22`,
                    }}
                  >
                    {f.n}
                  </p>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      background: `${f.color}12`,
                      border: `1px solid ${f.color}25`,
                    }}
                  >
                    <f.icon className="w-5 h-5" style={{ color: f.color }} />
                  </div>
                  <h3 className="font-extrabold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* ── PAYMENT METHODS ── */}
        <section className="max-w-7xl mx-auto px-6 pb-24" aria-label="Metode pembayaran">
          <div className="text-center mb-10">
            <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-3 text-primary">
              — PEMBAYARAN
            </p>
            <h2 className="font-extrabold text-foreground text-[clamp(1.6rem,2.5vw,2rem)]">
              10+ Metode Pembayaran
            </h2>
            <p className="text-muted-foreground text-sm mt-2">
              Semua e-wallet & bank populer MALAYSIA didukung
            </p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
              { name: "QRIS", icon: Smartphone, color: "#EA580C" },
              { name: "GoPay", icon: Wallet, color: "#059669" },
              { name: "DANA", icon: Wallet, color: "#0284C7" },
              { name: "OVO", icon: Wallet, color: "#7C3AED" },
              { name: "ShopeePay", icon: ShoppingCart, color: "#D97706" },
              { name: "Bank Transfer", icon: Banknote, color: "#92400E" },
            ].map((m) => (
              <Card
                key={m.name}
                className="group flex flex-col items-center gap-2 p-4 rounded-2xl cursor-default transition-all hover:scale-105 hover:bg-secondary/60 border-border bg-card"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                  style={{ background: `${m.color}12` }}
                >
                  <m.icon className="w-4 h-4" style={{ color: m.color }} />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground text-center leading-tight">
                  {m.name}
                </span>
              </Card>
            ))}
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="pb-24" aria-label="Testimoni pelanggan">
          <div className="max-w-7xl mx-auto px-6 mb-10">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-3 text-primary">
                  — TESTIMONI
                </p>
                <h2 className="font-extrabold text-foreground text-[clamp(1.6rem,2.5vw,2rem)]">
                  Kata Pelanggan Kami
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-muted-foreground text-xs self-center">4.99 / 5.0</span>
              </div>
            </div>
          </div>
          <div className="pl-6">
            <MemoizedTestimonialMarquee />
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="max-w-7xl mx-auto px-6 pb-24" aria-label="Call to action">
          <Card className="relative rounded-3xl overflow-hidden p-8 sm:p-12 md:p-16 text-center bg-gradient-to-br from-amber-500 via-orange-600 to-orange-700 border-0 shadow-[0_32px_64px_-24px_rgba(234,88,12,0.45)]">
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none bg-white/10" />
            <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full blur-3xl pointer-events-none bg-amber-300/20" />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-white/15 backdrop-blur border border-white/25">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-extrabold text-white text-[clamp(2rem,4vw,3rem)] leading-[1.1]">
                Siap Top Up
                <br />
                <span className="text-amber-200">Sekarang?</span>
              </h2>
              <p className="text-orange-100/90 mt-4 mb-8 max-w-md mx-auto text-sm">
                Gunakan kode promo{" "}
                <code className="px-2 py-0.5 rounded-md text-amber-300 font-bold font-mono bg-white/15 border border-white/25">
                  {PROMO}
                </code>{" "}
                dan hemat 10% untuk transaksi pertamamu.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                <Button
                  onClick={() => navigate("/products")}
                  className="group flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold text-orange-700 bg-white hover:bg-amber-100 transition-all hover:scale-[1.02] shadow-[0_12px_24px_-8px_rgba(0,0,0,0.3)]"
                >
                  <Zap className="w-4 h-4 group-hover:scale-125 transition-transform" />
                  Mulai Top Up
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={copyPromo}
                  variant="outline"
                  className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold transition-all border-2 ${
                    copied ? "text-emerald-200 border-emerald-300/60 bg-white/10" : "text-white border-white/40 hover:bg-white/10"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Tersalin!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Salin Kode Promo
                    </>
                  )}
                </Button>
              </div>
              <a
                href="https://wa.me/60137345871"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm transition-all group text-orange-100/90 hover:text-white"
              >
                <MessageCircle className="w-4 h-4" />
                Butuh bantuan?{" "}
                <span className="font-bold group-hover:underline text-emerald-200">
                  Chat WhatsApp →
                </span>
              </a>
            </div>
          </Card>
        </section>
      </main>

      <LiveTicker />

      <QuickActionFAB />
      <ExitIntentPopup show={showExitPopup} onClose={() => setShowExitPopup(false)} />
    </div>
    </>
  );
}
