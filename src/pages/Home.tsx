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
  Users,
  ShoppingCart,
  Flame,
  Shield,
  Headphones,
  Star,
  ArrowRight,
  CheckCircle,
  MessageCircle,
  Crown,
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
      className="relative overflow-hidden bg-[#8B5CF6]/10 border-y border-[#8B5CF6]/20 py-2.5 cursor-pointer select-none"
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
            className="flex items-center gap-3 whitespace-nowrap text-xs font-medium hover:text-[#D946EF] transition-colors duration-200"
            style={{ color: "#8B5CF6" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00c864] animate-pulse inline-block" />
            {item}
            <span className="text-[#8B5CF6]/30 mx-2">·</span>
          </span>
        ))}
      </div>
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#080808] to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#080808] to-transparent pointer-events-none z-10" />
    </div>
  );
});

/* ─────────────────────────────────────────────
   GAME MARQUEE
───────────────────────────────────────────── */
const MemoizedGameMarquee = memo(function GameMarquee() {
  return (
    <div className="overflow-hidden py-6 border-y border-white/5">
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
            className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold tracking-wide hover:scale-110 transition-transform cursor-default"
            style={{
              color: i % 3 === 0 ? "#8B5CF6" : i % 3 === 1 ? "#D946EF" : "rgba(255,255,255,0.3)",
              transition: "color 0.3s ease",
            }}
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
            className="flex-shrink-0 w-80 rounded-2xl p-5 space-y-3 hover:scale-[1.02] transition-all duration-300 border border-white/10 bg-white/[0.03]"
          >
            <div className="flex items-center justify-between">
              <div className="flex gap-0.5">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-[#D946EF] text-[#D946EF]" />
                ))}
              </div>
              <span className="text-[10px] text-white/20 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {t.time}
              </span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed italic">"{t.text}"</p>
            <div className="flex items-center gap-2.5 pt-1">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-black"
                style={{
                  background: `linear-gradient(135deg, ${["#8B5CF6", "#D946EF", "#38BDF8", "#A78BFA", "#00c864", "#F472B6"][
                    i % 6
                  ]}, ${["#D946EF", "#8B5CF6", "#A78BFA", "#38BDF8", "#D946EF", "#38BDF8"][i % 6]})`,
                }}
              >
                {t.av}
              </div>
              <div>
                <p className="text-xs font-semibold text-white/80">{t.name}</p>
                <p className="text-[10px] text-white/30">{t.role}</p>
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
        className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 border border-white/10 bg-white/[0.03] hover:border-primary/50"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          animationDelay: `${index * 60}ms`,
          boxShadow: isHovered
            ? "0 20px 40px -15px rgba(139,92,246,0.35)"
            : "none",
        }}
      >
        <div className="aspect-square overflow-hidden relative p-3 flex items-center justify-center bg-gradient-to-b from-white/[0.04] to-transparent">
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
              <div className="w-full h-full rounded-xl flex items-center justify-center bg-white/[0.05] text-5xl transition-transform duration-500 group-hover:scale-105">
                {img}
              </div>
            )
          ) : (
            <div className="w-full h-full rounded-xl flex items-center justify-center bg-white/[0.05]">
              <Gamepad2 className="w-10 h-10 text-white/20 group-hover:text-primary transition-colors duration-300" />
            </div>
          )}

          <Badge
            className="absolute top-4 left-4 flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black text-black shadow-md uppercase tracking-wider"
            style={{ background: "linear-gradient(135deg, #8B5CF6, #D946EF)" }}
          >
            <Flame className="w-2.5 h-2.5" /> HOT
          </Badge>
        </div>

        <div className="p-3.5 pt-1 bg-card/60 backdrop-blur-md flex flex-col justify-between h-[85px] border-t border-white/5">
          <div>
            <p className="font-bold text-sm text-white tracking-tight truncate group-hover:text-primary transition-colors duration-200">
              {name}
            </p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium mt-0.5 truncate">
              {String(product.category || "Game Top Up")}
            </p>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-400 to-pink-400">
              {price > 0 ? formatPrice(undefined, price) : "Cek Detail"}
            </span>
            <span className="text-[9px] font-bold text-[#00c864] bg-[#00c864]/10 px-1.5 py-0.5 rounded flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[#00c864] animate-pulse" />
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
    <Card className="rounded-2xl overflow-hidden animate-pulse border border-white/10 bg-white/[0.03]">
      <div className="aspect-square relative overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          style={{
            animation: "shimmer 2s infinite",
            backgroundSize: "200% 100%",
          }}
        />
      </div>
      <div className="p-3.5 space-y-2">
        <div className="h-3 bg-white/5 rounded-lg w-3/4" />
        <div className="h-2 bg-white/5 rounded-lg w-1/2" />
        <div className="flex justify-between mt-2">
          <div className="h-3 bg-white/5 rounded-lg w-1/3" />
          <div className="h-3 bg-white/5 rounded-lg w-1/4" />
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
        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-200 hover:shadow-xl group"
        style={{ background: "#00c864" }}
        aria-label="Chat WhatsApp"
      >
        <MessageCircle className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
      </a>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-200 hover:shadow-xl group"
        style={{ background: "linear-gradient(135deg,#8B5CF6,#D946EF)" }}
        aria-label="Scroll to top"
      >
        <ChevronRight className="w-5 h-5 text-black -rotate-90 group-hover:-translate-y-1 transition-transform" />
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
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative bg-[#0B0A10] rounded-3xl p-8 max-w-md w-full border border-white/10 shadow-2xl animate-[fadeUp_0.4s_cubic-bezier(.22,.68,0,1.2)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center glass-panel-light hover:bg-white/10 transition-colors"
          aria-label="Close popup"
        >
          <X className="w-4 h-4 text-white/60" />
        </button>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto bg-gradient-to-br from-[#8B5CF6] to-[#D946EF]">
            <Gift className="w-8 h-8 text-black" />
          </div>
          <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            Tunggu Dulu!
          </h3>
          <p className="text-white/60 text-sm">
            Sebelum kamu pergi, ambil kode promo spesial untuk diskon 10%!
          </p>
          <div className="rounded-xl p-4 bg-[#8B5CF6]/10 border border-dashed border-[#8B5CF6]/30">
            <code
              className="text-2xl font-bold tracking-[0.15em] text-[#8B5CF6]"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {PROMO}
            </code>
          </div>
          <Button
            onClick={copyPromo}
            className={`w-full py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] ${
              copied
                ? "bg-green-500/20 text-green-500 border border-green-500/30"
                : "bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] text-black"
            }`}
          >
            {copied ? "✓ Kode Tersalin!" : "Salin Kode Promo"}
          </Button>
          <p className="text-[10px] text-white/20">* Berlaku untuk pengguna baru</p>
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
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          animationDelay: "0ms",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/5 to-transparent pointer-events-none" />
        <div className="grid lg:grid-cols-2 gap-8 items-start relative">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3 text-[#8B5CF6]">
              — MENGAPA KAMI
            </p>
            <h3
              className="text-2xl lg:text-3xl font-bold text-white mb-6"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Kenapa Harga Kami
              <br />
              <span className="text-[#8B5CF6]">Paling Murah?</span>
            </h3>
            <div className="space-y-4">
              {[
                {
                  title: "Harga Real-Time",
                  desc: "Harga diperbarui otomatis dari supplier langsung setiap 5 menit",
                  color: "#38BDF8",
                },
                {
                  title: "Tanpa Biaya Tersembunyi",
                  desc: "Tidak ada admin fee atau biaya tambahan apapun",
                  color: "#00c864",
                },
                {
                  title: "Garansi Harga Termurah",
                  desc: "Kami jamin harga paling murah atau uang kembali 2x lipat",
                  color: "#D946EF",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl transition-all hover:bg-white/5"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.color}15` }}
                  >
                    <CheckCircle className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">{item.title}</h4>
                    <p className="text-xs text-white/40 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            className="rounded-2xl p-6 space-y-4"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-[#00c864]" />
              <h4 className="text-sm font-semibold text-white">Bandingkan Harga Terbaru</h4>
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
                className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 group hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-all"
              >
                <div>
                  <p className="text-sm font-medium text-white/80">{row.game}</p>
                  <p className="text-[10px] text-white/20">Harga pasaran vs NickStore</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-white/30 line-through block">{row.market}</span>
                    <span className="text-sm font-bold text-[#00c864]">{row.ours}</span>
                  </div>
                  <Badge className="px-2.5 py-1 rounded-full text-[10px] font-bold text-black bg-[#00c864] flex items-center gap-1">
                    <TrendingUp className="w-2.5 h-2.5" />
                    -{row.save}
                  </Badge>
                </div>
              </div>
            ))}
            <div className="pt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">Rata-rata penghematan</span>
                <span className="font-bold text-[#00c864]">15%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#00c864] w-[85%]" />
              </div>
            </div>
            <p className="text-center text-[10px] text-white/20 pt-2 flex items-center justify-center gap-1">
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
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@500;700&display=swap');
        @keyframes fadeUp { 
          from { opacity:0; transform:translateY(24px) } 
          to { opacity:1; transform:translateY(0) } 
        }
        @keyframes fadeIn { 
          from { opacity:0 } 
          to { opacity:1 } 
        }
        @keyframes scanH { 
          from{top:-2px} 
          to{top:100%} 
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
        <section className="relative pt-28 pb-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(139,92,246,0.18)_0%,transparent_70%)] blur-3xl" />

          <div className="relative max-w-4xl mx-auto px-6 text-center z-10 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase bg-white/5 border border-white/10 backdrop-blur-md">
              <Crown className="w-4 h-4 text-primary" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400">
                NICKSTORE · OFFICIAL GAME STORE
              </span>
            </div>

            <div className="space-y-4">
              <h1
                className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-black leading-[1.05] tracking-tight text-white"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Cari &amp; Top Up Game
                <br />
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                  Dalam Sekelip Mata
                </span>
              </h1>
              <p className="text-white/60 text-base sm:text-lg max-w-xl mx-auto font-medium">
                Pilih daripada 70+ game popular. Transaksi automatik 24 jam dengan harga paling berbaloi.
              </p>
            </div>

            {/* Centralized Search Bar */}
            <div className="max-w-2xl mx-auto relative group">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 opacity-30 blur group-hover:opacity-60 transition duration-500" />
              <div className="relative flex items-center bg-[#0B0A10]/90 rounded-2xl border border-white/15 p-2 shadow-2xl backdrop-blur-xl">
                <Search className="w-6 h-6 text-primary ml-3 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Cari game kegemaran anda (cth: Mobile Legends, PUBG)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
                  }}
                  className="w-full bg-transparent text-white placeholder-white/40 text-sm sm:text-base outline-none pr-3"
                />
                <Button
                  onClick={() => navigate(`/products?search=${encodeURIComponent(searchQuery)}`)}
                  className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-black shrink-0"
                  style={{ background: "linear-gradient(135deg, #8B5CF6, #D946EF)" }}
                >
                  Cari Game
                </Button>
              </div>
            </div>

            {/* Quick Game Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="text-xs text-white/40 font-semibold mr-1">Popular:</span>
              {["Mobile Legends", "PUBG Mobile", "Free Fire", "Genshin Impact", "Valorant"].map((g) => (
                <button
                  key={g}
                  onClick={() => navigate(`/products?search=${encodeURIComponent(g)}`)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/10 transition-all"
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10 max-w-3xl mx-auto">
              {[
                { label: "Pengguna", val: `${users.toLocaleString()}+`, color: "#38BDF8" },
                { label: "Pesanan Sukses", val: `${txns.toLocaleString()}+`, color: "#00c864" },
                { label: "Koleksi Game", val: `${games}+`, color: "#D946EF" },
                { label: "Kadar Kepuasan", val: `${rate}%`, color: "#A78BFA" },
              ].map((s, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-xl font-black" style={{ color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>
                    {s.val}
                  </p>
                  <p className="text-[11px] font-semibold text-white/50">{s.label}</p>
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border border-white/10 rounded-3xl overflow-hidden bg-white/[0.02]">
            {[
              {
                n: `${users.toLocaleString()}+`,
                label: "Pengguna Aktif",
                sub: "di seluruh MALAYSIA",
                color: "text-sky-400",
              },
              {
                n: `${txns.toLocaleString()}+`,
                label: "Transaksi Sukses",
                sub: "tanpa gagal",
                color: "text-primary",
              },
              {
                n: `${games}+`,
                label: "Game & Layanan",
                sub: "tersedia sekarang",
                color: "text-amber-400",
              },
              {
                n: `${rate}%`,
                label: "Kepuasan",
                sub: "rating pengguna",
                color: "text-purple-400",
              },
            ].map((s, i) => (
              <Card
                key={i}
                className="relative p-8 group border-0 border-r border-white/5 last:border-r-0 hover:bg-white/[0.05] transition-colors"
              >
                <p
                  className="relative text-4xl lg:text-5xl font-extrabold mb-2"
                  style={{ color: s.color, fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {s.n}
                </p>
                <p className="relative text-sm font-semibold text-white/90">{s.label}</p>
                <p className="relative text-xs text-white/40 mt-0.5">{s.sub}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* ── PRODUCTS ── */}
        <section className="max-w-7xl mx-auto px-6 pb-24" aria-label="Game populer minggu ini">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3 text-primary">
                — TRENDING SEKARANG
              </p>
              <h2
                className="font-black text-white leading-[1.1] text-[clamp(1.8rem,3vw,2.5rem)]"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Game Paling
                <br />
                Populer Minggu Ini
              </h2>
            </div>
            <Button
              onClick={() => navigate("/products")}
              variant="outline"
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:gap-3 hover:bg-primary/20 text-primary border-primary/25"
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
              className="w-full py-3.5 rounded-2xl text-sm font-semibold border-primary/25 text-primary"
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
          <Card className="rounded-3xl overflow-hidden bg-white/[0.02] border border-white/10">
            <div className="grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
              {[
                {
                  n: "01",
                  icon: Zap,
                  title: "Proses Super Instan",
                  body: "Top up otomatis 24/7. Item masuk ke akun dalam hitungan detik, bukan menit.",
                  color: "#D946EF",
                },
                {
                  n: "02",
                  icon: Shield,
                  title: "Transaksi 100% Aman",
                  body: "Terenkripsi end-to-end. Garansi pengembalian dana penuh jika ada masalah.",
                  color: "#38BDF8",
                },
                {
                  n: "03",
                  icon: Headphones,
                  title: "Support 24 Jam",
                  body: "Tim kami siap membantu kapan saja via WhatsApp. Rata-rata respons < 2 menit.",
                  color: "#8B5CF6",
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
                      background: `radial-gradient(circle at 0% 100%, ${f.color}08, transparent 60%)`,
                    }}
                  />
                  <p
                    className="text-5xl font-extrabold mb-6 leading-none"
                    style={{
                      color: `${f.color}20`,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {f.n}
                  </p>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      background: `${f.color}15`,
                      border: `1px solid ${f.color}25`,
                    }}
                  >
                    <f.icon className="w-5 h-5" style={{ color: f.color }} />
                  </div>
                  <h3 className="font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* ── PAYMENT METHODS ── */}
        <section className="max-w-7xl mx-auto px-6 pb-24" aria-label="Metode pembayaran">
          <div className="text-center mb-10">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3 text-primary">
              — PEMBAYARAN
            </p>
            <h2
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "clamp(1.6rem,2.5vw,2rem)",
                fontWeight: 800,
                color: "#fff",
              }}
            >
              10+ Metode Pembayaran
            </h2>
            <p className="text-white/30 text-sm mt-2">
              Semua e-wallet & bank populer MALAYSIA didukung
            </p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
              { name: "QRIS", icon: Smartphone, color: "#38BDF8" },
              { name: "GoPay", icon: Wallet, color: "#00c864" },
              { name: "DANA", icon: Wallet, color: "#38BDF8" },
              { name: "OVO", icon: Wallet, color: "#A78BFA" },
              { name: "ShopeePay", icon: ShoppingCart, color: "#8B5CF6" },
              { name: "Bank Transfer", icon: Banknote, color: "#D946EF" },
            ].map((m) => (
              <Card
                key={m.name}
                className="group flex flex-col items-center gap-2 p-4 rounded-2xl cursor-default transition-all hover:scale-105 hover:bg-white/[0.05] border border-white/10 bg-white/[0.03]"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                  style={{ background: `${m.color}15` }}
                >
                  <m.icon className="w-4 h-4" style={{ color: m.color }} />
                </div>
                <span className="text-[10px] font-semibold text-white/40 text-center leading-tight">
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
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3 text-primary">
                  — TESTIMONI
                </p>
                <h2
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: "clamp(1.6rem,2.5vw,2rem)",
                    fontWeight: 800,
                    color: "#fff",
                  }}
                >
                  Kata Pelanggan Kami
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#D946EF] text-[#D946EF]" />
                  ))}
                </div>
                <span className="text-white/30 text-xs self-center">4.99 / 5.0</span>
              </div>
            </div>
          </div>
          <div className="pl-6">
            <MemoizedTestimonialMarquee />
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="max-w-7xl mx-auto px-6 pb-24" aria-label="Call to action">
          <Card className="relative rounded-3xl overflow-hidden p-12 md:p-16 text-center bg-gradient-to-r from-[#8B5CF6]/10 via-[#D946EF]/5 to-[#8B5CF6]/10 border border-primary/20">
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none bg-primary/10" />
            <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full blur-3xl pointer-events-none bg-amber-400/5" />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,107,0,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,107,0,0.05) 1px,transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-[#8B5CF6] to-[#D946EF]">
                <Rocket className="w-8 h-8 text-black" />
              </div>
              <h2
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: "clamp(2rem,4vw,3rem)",
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1.1,
                }}
              >
                Siap Top Up
                <br />
                <span className="bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] bg-clip-text text-transparent">
                  Sekarang?
                </span>
              </h2>
              <p className="text-white/40 mt-4 mb-8 max-w-md mx-auto text-sm">
                Gunakan kode promo{" "}
                <code className="px-2 py-0.5 rounded-md text-primary font-bold font-mono bg-primary/10">
                  {PROMO}
                </code>{" "}
                dan hemat 10% untuk transaksi pertamamu.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                <Button
                  onClick={() => navigate("/products")}
                  className="group flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold text-black transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,107,0,0.3)]"
                  style={{ background: "linear-gradient(135deg,#8B5CF6,#D946EF)" }}
                >
                  <Zap className="w-4 h-4 group-hover:scale-125 transition-transform" />
                  Mulai Top Up
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={copyPromo}
                  variant="outline"
                  className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-semibold transition-all ${
                    copied ? "text-green-500 border-green-500/30" : "text-white/60 border-white/10"
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
                className="inline-flex items-center gap-2 text-sm transition-all group text-white/30 hover:text-white/50"
              >
                <MessageCircle className="w-4 h-4" />
                Butuh bantuan?{" "}
                <span className="font-semibold group-hover:underline text-[#00c864]">
                  Chat WhatsApp →
                </span>
              </a>
            </div>
          </Card>
        </section>
      </main>

      <LiveTicker />
      <footer className="border-t border-white/5 py-6 text-center">
        <p className="text-[11px] text-white/15 tracking-widest uppercase">
          © 2025 NickStore · Platform Top Up Game MALAYSIA
        </p>
      </footer>

      <QuickActionFAB />
      <ExitIntentPopup show={showExitPopup} onClose={() => setShowExitPopup(false)} />
    </div>
    </>
  );
}