import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock } from "lucide-react";

const articles = [
  {
    id: 1,
    title: "Tips Memilih Jasa Joki Ranked ML yang Terpercaya",
    excerpt: "Jangan asal pilih joki! Ini dia tips dan trik agar akun kamu aman saat menggunakan jasa joki...",
    readTime: "4 min",
    date: "23 Apr 2026",
    category: "Tips",
    featured: false,
  },
  {
    id: 2,
    title: "Review Honkai: Star Rail — Worth Top Up atau Gratis Aja?",
    excerpt: "Analisis mendalam apakah worth it untuk spending di Honkai Star Rail. Breakdown...",
    readTime: "7 min",
    date: "22 Apr 2026",
    category: "Review",
    featured: false,
  },
  {
    id: 3,
    title: "Netflix vs Disney+ vs Vidio — Mana yang Paling Worth?",
    excerpt: "Perbandingan lengkap harga, konten, dan fitur dari 3 layanan streaming terpopuler di...",
    readTime: "6 min",
    date: "21 Apr 2026",
    category: "Perbandingan",
    featured: false,
  },
  {
    id: 4,
    title: "5 Cara Aman Top Up Game Online Tanpa Kena Tipu",
    excerpt: "Waspada penipuan top up game! Pelajari cara membedakan website top up resmi dan abal...",
    readTime: "4 min",
    date: "20 Apr 2026",
    category: "Tips",
    featured: false,
  },
  {
    id: 5,
    title: "Update Free Fire April 2026 — Skin Baru & Event Spesial",
    excerpt: "Rangkuman update terbaru Free Fire bulan April 2026. Ada skin legendary baru, event t...",
    readTime: "3 min",
    date: "19 Apr 2026",
    category: "Update",
    featured: true,
  },
  {
    id: 6,
    title: "Cara Cek Player ID & Server ID di Semua Game Populer",
    excerpt: "Panduan lengkap menemukan Player ID dan Server ID untuk Mobile Legends, Free Fire,...",
    readTime: "5 min",
    date: "18 Apr 2026",
    category: "Panduan",
    featured: true,
  },
  {
    id: 7,
    title: "Promo Top Up Spesial April 2026 — Cashback Hingga 10%!",
    excerpt: "Jangan lewatkan promo cashback spesial bulan April! Dapatkan bonus saldo untuk...",
    readTime: "2 min",
    date: "17 Apr 2026",
    category: "Promo",
    featured: true,
  },
  {
    id: 8,
    title: "Top 5 Game Mobile Terpopuler di MALAYSIA 2026",
    excerpt: "Daftar game mobile yang paling banyak dimainkan dan di-top up oleh gamer...",
    readTime: "4 min",
    date: "16 Apr 2026",
    category: "List",
    featured: true,
  },
];

export default function Articles() {
  const featuredArticles = articles.filter((a) => a.featured);
  const regularArticles = articles.filter((a) => !a.featured);

  return (
    <div className="container mx-auto px-4 py-8 relative pt-24 pb-12 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-[#FF6B00]/10 to-transparent blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-t from-[#FFB800]/5 to-transparent blur-[120px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <div className="text-center mb-12 animate-in slide-in-from-top-4 fade-in duration-500">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#FFB800] flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(255,107,0,0.3)] border border-[#FF6B00]/20">
            <FileText className="h-8 w-8 text-black" />
          </div>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 uppercase tracking-tight mb-2">
            Artikel
          </h1>
          <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.2em]">
            Tips, review, dan berita terbaru seputar game dan top up
          </p>
        </div>

        {/* Featured Articles */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-100">
          {featuredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {/* Regular Articles */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-200">
          {regularArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ArticleCard({ article }: { article: typeof articles[0] }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-[#0c101e]/80 backdrop-blur-xl overflow-hidden hover:border-[#FF6B00]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.15)] group cursor-pointer relative hover:-translate-y-1">
      <div className="aspect-video relative overflow-hidden bg-black/40 border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 flex items-center justify-center">
          <FileText className="h-10 w-10 text-white/10 group-hover:text-[#FF6B00]/20 transition-colors duration-300" />
        </div>
        {article.featured && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded bg-[#FF6B00]/20 border border-[#FF6B00]/50 text-[10px] font-black uppercase tracking-widest text-[#FFB800] backdrop-blur-md">
            Featured
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="text-[#FF6B00] text-[10px] font-black uppercase tracking-widest mb-2">
          {article.category}
        </div>
        <h3 className="font-black text-white text-sm line-clamp-2 group-hover:text-[#FFB800] transition-colors uppercase tracking-tight leading-snug">
          {article.title}
        </h3>
        <p className="text-[10px] font-medium text-white/50 mt-3 line-clamp-2 leading-relaxed">
          {article.excerpt}
        </p>
        <div className="flex items-center gap-4 mt-5 pt-4 border-t border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-[#FFB800]" /> {article.readTime}
          </span>
          <span>{article.date}</span>
        </div>
      </div>
    </div>
  );
}
