import { useState } from "react";
import { Link } from "react-router";
import { Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
import { useCurrency } from "@/providers/CurrencyProvider";

export default function Pricelist() {
  const { formatPrice } = useCurrency();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  // Fetch games
  const { data: productsData, isLoading: isLoadingGames } = trpc.products.list.useQuery({ limit: 100 });
  const games = (productsData as any)?.data || [];

  const filteredGames = games.filter((game: any) =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Select the first game automatically if not selected
  if (!selectedGameId && filteredGames.length > 0) {
    setSelectedGameId(String(filteredGames[0].id));
  }

  const activeGame = games.find((g: any) => String(g.id) === selectedGameId);
  const activeGameIdToFetch = activeGame?.id;

  // Fetch pricelist for selected game
  const { data: pricelistData, isLoading: isLoadingPrices } = trpc.denominations.pricelist.useQuery(
    { productId: activeGameIdToFetch },
    { enabled: !!activeGameIdToFetch }
  );

  const prices = (pricelistData as any)?.data || [];

  return (
    <div className="container mx-auto px-4 py-8 relative pt-24 pb-12 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-[#8B5CF6]/10 to-transparent blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-t from-[#D946EF]/5 to-transparent blur-[120px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        {/* Page Header */}
        <div className="text-center mb-12 animate-in slide-in-from-top-4 fade-in duration-500">
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 uppercase tracking-tight">
            Daftar Harga
          </h1>
          <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.2em] max-w-2xl mx-auto">
            Temukan harga terbaik. Harga akan otomatis menyesuaikan dengan tier membership akun Anda.
          </p>
        </div>

        {/* Filter Section */}
        <div className="space-y-6 mb-12 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-[#8B5CF6] flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#D946EF] animate-pulse" />
              Filter Game
            </h2>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Cari game..."
                className="pl-11 h-12 bg-white/[0.02] border-white/10 text-white placeholder:text-white/30 rounded-xl transition-all focus:bg-white/[0.05] focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Pilih game untuk melihat produk.</p>

          {/* Game Horizontal Scroller */}
          <div className="relative rounded-[1.5rem] bg-[#0B0A10]/80 border border-white/10 p-5 backdrop-blur-xl shadow-2xl">
            {isLoadingGames ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#8B5CF6]" />
              </div>
            ) : filteredGames.length === 0 ? (
              <div className="text-center py-12 text-[10px] font-black uppercase tracking-widest text-white/50">
                Tidak ada game yang ditemukan.
              </div>
            ) : (
              <div className="flex overflow-x-auto gap-4 pb-2 snap-x custom-scrollbar">
                {filteredGames.map((game: any) => {
                  const isSelected = String(game.id) === selectedGameId;
                  const gameImage = game.images?.[0] || game.image || "https://placehold.co/400x600/1a1a2e/ffffff?text=Game";
                  
                  return (
                    <motion.div
                      key={String(game.id)}
                      whileHover={{ y: -5, scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedGameId(String(game.id))}
                      className={`
                        snap-center flex-shrink-0 cursor-pointer w-[120px] rounded-2xl overflow-hidden
                        transition-all duration-300 relative group border
                        ${isSelected ? 'border-[#8B5CF6] shadow-[0_0_20px_rgba(255,107,0,0.3)]' : 'border-white/5 opacity-70 hover:opacity-100'}
                      `}
                    >
                      <div className="aspect-[3/4] relative">
                        <div className={`absolute inset-0 bg-gradient-to-t ${isSelected ? 'from-[#8B5CF6]/90 via-[#8B5CF6]/20' : 'from-[#0B0A10]/90 via-[#0B0A10]/20'} to-transparent z-10`} />
                        <img 
                          src={gameImage} 
                          alt={game.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute bottom-3 left-2 right-2 z-20 text-center">
                          <p className={`text-[10px] font-black uppercase tracking-widest leading-tight line-clamp-2 ${isSelected ? 'text-white' : 'text-white/70'}`}>
                            {game.name}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Pricing Table */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedGameId || "empty"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full animate-in slide-in-from-bottom-4 fade-in duration-500 delay-200"
          >
            <div className="rounded-[1.5rem] border border-white/10 bg-[#0B0A10]/80 backdrop-blur-xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white/[0.02] border-b border-white/10">
                    <tr>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/50 whitespace-nowrap">Kode Produk</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/50 whitespace-nowrap">Produk</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-300 whitespace-nowrap">Member</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-[#D946EF] whitespace-nowrap">Gold</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-cyan-400 whitespace-nowrap">Platinum</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-emerald-400 whitespace-nowrap">Business</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingPrices ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center">
                          <Loader2 className="h-8 w-8 animate-spin text-[#8B5CF6] mx-auto" />
                        </td>
                      </tr>
                    ) : prices.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center text-[10px] font-black uppercase tracking-widest text-white/50">
                          Tidak ada produk untuk game ini.
                        </td>
                      </tr>
                    ) : (
                      prices.map((item: any, i: number) => (
                        <motion.tr 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          key={item.id} 
                          className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                        >
                          <td className="px-6 py-4 font-mono text-[10px] text-white/30 group-hover:text-[#D946EF] transition-colors uppercase">{item.code || item.id}</td>
                          <td className="px-6 py-4 text-xs font-black text-white uppercase tracking-tight">{item.name}</td>
                          <td className="px-6 py-4 text-xs font-black text-zinc-300">
                            {formatPrice(item.basic_myr, item.basic)}
                          </td>
                          <td className="px-6 py-4 text-xs font-black text-[#D946EF]">
                            {formatPrice(item.gold_myr, item.gold)}
                          </td>
                          <td className="px-6 py-4 text-xs font-black text-cyan-400">
                            {formatPrice(item.platinum_myr, item.platinum)}
                          </td>
                          <td className="px-6 py-4 text-xs font-black text-emerald-400">
                            {formatPrice(item.api_myr, item.api)}
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
