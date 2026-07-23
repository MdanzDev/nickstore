import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router";
import SeoHead from "@/components/SeoHead";
import { trpc } from "@/providers/trpc";
import { useCurrency } from "@/providers/CurrencyProvider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Gamepad2,
  Search,
  Zap,
  LayoutGrid,
  Film,
  Ticket,
  Smartphone,
  Swords,
  Star,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  TrendingUp,
  Flame,
  Clock,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  Grid3X3,
  List,
  Tag,
  Crown,
  Gift,
} from "lucide-react";

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const getImageUrl = (url: string): string => {
  if (!url) return "";
  if (url.includes("api.kryz-net.space")) {
    return url.replace("https://api.kryz-net.space", "");
  }
  return url;
};

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const categories = [
  { id: "all", label: "Semua", icon: LayoutGrid, color: "#FF6B00" },
  { id: "game", label: "Game", icon: Gamepad2, color: "#38BDF8" },
  { id: "streaming", label: "Streaming", icon: Film, color: "#A78BFA" },
  { id: "voucher", label: "Voucher", icon: Ticket, color: "#FFB800" },
  { id: "premium", label: "Premium Apps", icon: Crown, color: "#F472B6" },
  { id: "joki", label: "Joki", icon: Swords, color: "#00c864" },
];

const sortOptions = [
  { id: "popular", label: "Terpopuler", icon: TrendingUp },
  { id: "newest", label: "Terbaru", icon: Clock },
  { id: "cheapest", label: "Termurah", icon: ArrowUpDown },
  { id: "expensive", label: "Termahal", icon: ArrowUpDown },
];

const ITEMS_PER_PAGE = 24;

/* ─────────────────────────────────────────────
   PRODUCT CARD SKELETON
───────────────────────────────────────────── */
function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden border border-border/60">
      <div className="aspect-[4/3] bg-gradient-to-br from-secondary/50 to-background animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      </div>
      <div className="p-3 space-y-2">
        <div className="h-4 bg-secondary animate-pulse rounded w-3/4" />
        <div className="h-3 bg-secondary animate-pulse rounded w-1/2" />
        <div className="flex justify-between mt-3">
          <div className="h-3 bg-secondary animate-pulse rounded w-1/3" />
          <div className="h-5 bg-secondary animate-pulse rounded w-1/4" />
        </div>
      </div>
    </Card>
  );
}

/* ─────────────────────────────────────────────
   PRODUCT CARD
───────────────────────────────────────────── */
function ProductCard({ product, view }: { product: any; view?: "grid" | "list" }) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const name = String(product.name);
  const category = String(product.category || "Game Top Up");
  const imageUrl = product.images?.[0] ? getImageUrl(String(product.images[0])) : null;
  const hasPrice = product.price && Number(product.price) > 0;

  if (view === "list") {
    return (
      <Link to={`/products/${String(product.id)}`}>
        <div 
          className="group relative flex items-center p-4 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
          style={{
            background: "rgba(255,255,255,0.015)",
            border: "1px solid rgba(255,255,255,0.05)",
            boxShadow: isHovered ? '0 20px 40px -10px rgba(249,115,22,0.15), inset 0 1px 0 rgba(255,255,255,0.1)' : 'inset 0 1px 0 rgba(255,255,255,0.02)'
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 relative bg-gradient-to-br from-primary/20 to-transparent">
             {imageUrl && !imageError ? (
              <img src={imageUrl} alt={name} className="w-full h-full object-cover" onError={() => setImageError(true)} />
             ) : (
              <div className="w-full h-full flex items-center justify-center bg-white/[0.02]">
                <Gamepad2 className="w-8 h-8 text-white/10" />
              </div>
             )}
          </div>
          <div className="ml-4 flex-1">
            <p className="font-bold text-[15px] text-white tracking-wide truncate group-hover:text-primary transition-colors">{name}</p>
            <p className="text-[11px] text-white/40 mt-0.5 uppercase tracking-wider font-medium">{category}</p>
          </div>
          <div className="text-right">
            <span className="block text-[15px] font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500">
              {hasPrice ? `Rp ${Number(product.price).toLocaleString("id-ID")}` : "Lihat Harga"}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/products/${String(product.id)}`} aria-label={`Top up ${name}`}>
      <div 
        className="group relative h-full flex flex-col rounded-[24px] overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-3"
        style={{
          background: "rgba(255,255,255,0.015)",
          border: "1px solid rgba(255,255,255,0.05)",
          boxShadow: isHovered ? '0 30px 60px -15px rgba(249,115,22,0.3), inset 0 1px 0 rgba(255,255,255,0.1)' : 'inset 0 1px 0 rgba(255,255,255,0.02)'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Glow backdrop behind image */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Image Wrapper */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {imageUrl && !imageError ? (
            <img 
              src={imageUrl} 
              alt={name} 
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.15] group-hover:rotate-1"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/[0.02]">
              <Gamepad2 className="w-12 h-12 text-white/10 group-hover:text-primary/40 transition-colors duration-500" />
            </div>
          )}
          
          {/* Internal shadow gradient for seamless blend */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c101e] via-[#0c101e]/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-300" />
          
          {/* Quick purchase indicator */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-black shadow-[0_0_20px_rgba(249,115,22,0.4)] backdrop-blur-md"
              style={{ background: "linear-gradient(135deg, #FF6B00, #FFB800)" }}>
              <Zap className="w-3.5 h-3.5" /> Top Up
            </span>
          </div>
          
          {/* Badges */}
          {product.popular && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black text-black shadow-lg"
                style={{ background: "linear-gradient(135deg, #FF6B00, #FFB800)" }}>
                <Flame className="w-3 h-3" /> HOT
              </span>
            </div>
          )}
        </div>
        
        {/* Info Area */}
        <div className="relative p-5 pt-1 flex-1 bg-card/40 backdrop-blur-xl border-t border-white/5 flex flex-col justify-between">
          <div className="mb-3">
            <p className="font-bold text-[15px] text-white tracking-wide line-clamp-2 group-hover:text-primary transition-colors duration-300">
              {name}
            </p>
            <p className="text-[11px] text-white/40 mt-1 uppercase tracking-wider font-medium">
              {category}
            </p>
          </div>
          <div className="flex items-end justify-between mt-auto pt-2 border-t border-white/5">
            <span className="text-[14px] sm:text-[15px] font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500">
              {hasPrice ? `Rp ${Number(product.price).toLocaleString("id-ID")}` : "Lihat Harga"}
            </span>
            <span className="hidden sm:flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#00c864]/10 text-[#00c864] border border-[#00c864]/20 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00c864] animate-pulse" />
              Instan
            </span>
          </div>
        </div>
        
        {/* Hover Border Glow */}
        <div className="absolute inset-0 rounded-[24px] pointer-events-none border border-transparent group-hover:border-primary/30 transition-colors duration-500" />
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────
   VIEW TOGGLE
───────────────────────────────────────────── */
function ViewToggle({ view, onChange }: { view: "grid" | "list"; onChange: (v: "grid" | "list") => void }) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/30 border border-border">
      <button
        onClick={() => onChange("grid")}
        className={`p-1.5 rounded-md transition-all ${
          view === "grid" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="Grid view"
      >
        <Grid3X3 className="h-4 w-4" />
      </button>
      <button
        onClick={() => onChange("list")}
        className={`p-1.5 rounded-md transition-all ${
          view === "list" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="List view"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGINATION
───────────────────────────────────────────── */
function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number; 
  totalPages: number; 
  onPageChange: (page: number) => void;
}) {
  const pages = useMemo(() => {
    const pageNumbers: (number | string)[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1);
      
      if (currentPage > 3) pageNumbers.push("...");
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) pageNumbers.push(i);
      
      if (currentPage < totalPages - 2) pageNumbers.push("...");
      
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="hover:border-primary/50 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Prev
      </Button>
      
      <div className="flex gap-1">
        {pages.map((page, i) => (
          page === "..." ? (
            <span key={`dots-${i}`} className="px-2 py-1 text-muted-foreground">...</span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              className={`h-8 w-8 p-0 transition-all ${
                currentPage === page 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "hover:border-primary/50"
              }`}
              onClick={() => onPageChange(page as number)}
            >
              {page}
            </Button>
          )
        ))}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="hover:border-primary/50 transition-colors"
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function Products() {
  const { formatPrice } = useCurrency();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "all");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "popular");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Query
  const { data, isLoading } = trpc.products.list.useQuery({
    page,
    limit: ITEMS_PER_PAGE,
    search: search || undefined,
    category: activeCategory !== "all" ? activeCategory : undefined,
    sort: sortBy !== "popular" ? sortBy : undefined,
  });

  // Sync URL params
  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (activeCategory !== "all") params.category = activeCategory;
    if (page > 1) params.page = String(page);
    if (sortBy !== "popular") params.sort = sortBy;
    setSearchParams(params);
  }, [search, activeCategory, page, sortBy, setSearchParams]);

  // Handlers
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  }, []);

  const clearSearch = useCallback(() => {
    setSearch("");
    setPage(1);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((sort: string) => {
    setSortBy(sort);
    setPage(1);
  }, []);

  // Extract products from response
  const products = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data)) return data;
    if (data.data?.data) return data.data.data;
    if (data.result?.data?.json?.data) return data.result.data.json.data;
    return [];
  }, [data]);

  const meta = useMemo(() => {
    return data?.data?.meta || data?.meta || data?.result?.data?.json?.meta;
  }, [data]);

  const totalProducts = meta?.total || products.length;
  const totalPages = meta?.pages || Math.ceil(totalProducts / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-[#080b14] text-white">
      <SeoHead
        title="Katalog Game & Voucher Top Up Murah"
        description="Senarai penuh topup game & voucher murah di Kryz-Net. Beli Diamonds Mobile Legends, Free Fire, Honor of Kings, Magic Chess & voucher secara automatik 24/7."
      />
      
      {/* Hero Header Section */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(249,115,22,0.1)_0%,transparent_70%)] animate-pulse-glow" />
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(139,92,246,0.08)_0%,transparent_70%)]" />

      {/* Header Section */}
      <div className="relative pt-32 pb-12 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none border-b border-white/5" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-white/5 border border-white/10 text-white/60">
                <LayoutGrid className="w-3 h-3 text-primary" />
                Katalog Produk
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                Jelajahi <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-400">Semua Game</span>
              </h1>
              <p className="text-sm text-white/50 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00c864] animate-pulse" />
                {totalProducts.toLocaleString()} layanan aktif & sinkronisasi real-time
              </p>
            </div>
            
            {/* Search Box - Premium Style */}
            <div className="w-full md:w-96 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-white/40" />
                </div>
                <input
                  type="text"
                  placeholder="Cari game favoritmu..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#0c101e]/80 border border-white/10 rounded-xl pl-11 pr-10 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all backdrop-blur-xl"
                />
                {search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Controls Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 p-3 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-hide">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-primary text-black shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <cat.icon className="w-3.5 h-3.5" style={{ color: isActive ? '#000' : cat.color }} />
                  {cat.label}
                  {isActive && products.length > 0 && (
                    <span className="ml-1 bg-black/20 px-1.5 py-0.5 rounded-md text-[9px]">{products.length}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto border-t border-white/10 sm:border-0 pt-3 sm:pt-0">
            <ViewToggle view={view} onChange={setView} />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="h-9 w-9 border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
            >
              <SlidersHorizontal className="h-4 w-4 text-white/70" />
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mb-8 p-5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4 flex items-center gap-2">
              <Filter className="h-3 w-3" /> Urutkan Berdasarkan
            </h3>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSortChange(option.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    sortBy === option.id
                      ? "bg-white/10 border border-white/20 text-white"
                      : "bg-transparent border border-white/5 text-white/50 hover:bg-white/5 hover:text-white/80"
                  }`}
                >
                  <option.icon className={`h-3.5 w-3.5 ${sortBy === option.id ? 'text-primary' : ''}`} />
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}



        {/* Products Grid/List */}
        {isLoading ? (
          <div className={`grid gap-4 ${
            view === "grid" 
              ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" 
              : "grid-cols-1"
          }`}>
            {Array.from({ length: 10 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/30 mb-6">
              <Gamepad2 className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Tidak ada produk ditemukan</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              {search || activeCategory !== "all"
                ? "Coba ubah kata kunci atau pilih kategori yang berbeda"
                : "Belum ada produk yang tersedia saat ini"}
            </p>
            {(search || activeCategory !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  clearSearch();
                  handleCategoryChange("all");
                  setSortBy("popular");
                }}
                className="hover:border-primary/50"
              >
                <X className="h-4 w-4 mr-2" />
                Reset Semua Filter
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className={`grid gap-4 ${
              view === "grid" 
                ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" 
                : "grid-cols-1 max-w-3xl mx-auto"
            }`}>
              {products.map((product: any) => (
                <ProductCard key={String(product.id)} product={product} />
              ))}
            </div>

            {/* Results info */}
            <div className="text-center mt-6">
              <p className="text-xs text-muted-foreground">
                Menampilkan {products.length} dari {totalProducts.toLocaleString()} produk
                {meta?.pages > 1 && ` • Halaman ${page} dari ${meta.pages}`}
              </p>
            </div>

            {/* Pagination */}
            <Pagination 
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}

        {/* Bottom Promo Banner */}
        <div className="mt-20 p-8 sm:p-12 rounded-[32px] overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, rgba(255,107,0,0.1) 0%, rgba(255,184,0,0.05) 100%)", border: "1px solid rgba(255,107,0,0.2)" }}>
          {/* Grid pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-20"
            style={{ backgroundImage: "linear-gradient(rgba(255,107,0,0.2) 1px,transparent 1px),linear-gradient(90deg,rgba(255,107,0,0.2) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                Tidak menemukan <span className="text-primary">game anda?</span>
              </h3>
              <p className="text-white/50 text-sm">Hubungi Customer Service kami. Kami akan bantu anda mencari layanan top up yang diinginkan.</p>
            </div>
            <a 
              href="https://wa.me/60137345871"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-black font-bold text-sm shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform"
            >
              <Zap className="w-5 h-5 text-[#00c864]" /> Chat WhatsApp CS
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}