import { useState, useMemo, useCallback } from "react";
import { trpc } from "@/providers/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Trophy, 
  Crown, 
  Medal, 
  Flame, 
  Loader2, 
  TrendingUp, 
  Star, 
  Zap,
  Users,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles,
  Target,
  Clock,
  Gift,
  ChevronUp,
  Gamepad2,
  ShoppingCart,
  Wallet,
  Award,
} from "lucide-react";
import { useCurrency } from "@/providers/CurrencyProvider";
import { useAuth } from "@/hooks/useAuth";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const timeFilters = [
  { id: "today", label: "Hari Ini", icon: Clock },
  { id: "yesterday", label: "Kemarin", icon: Clock },
  { id: "week", label: "Minggu Ini", icon: TrendingUp },
  { id: "month", label: "Bulan Ini", icon: Target },
  { id: "all", label: "All Time", icon: Trophy },
];

const rankColors = {
  1: { bg: "from-[#D946EF]/20 to-[#D946EF]/5", border: "border-[#D946EF]/30", text: "text-[#D946EF]", badge: "bg-[#D946EF] text-black" },
  2: { bg: "from-slate-400/20 to-slate-400/5", border: "border-slate-400/30", text: "text-slate-400", badge: "bg-slate-400 text-black" },
  3: { bg: "from-[#8B5CF6]/20 to-[#8B5CF6]/5", border: "border-[#8B5CF6]/30", text: "text-[#8B5CF6]", badge: "bg-[#8B5CF6] text-white" },
};

const rankIcons = {
  1: Crown,
  2: Medal,
  3: Medal,
};

/* ─────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────── */
function LeaderboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-4xl animate-pulse relative z-10">
      {/* Header Skeleton */}
      <div className="text-center mb-8 space-y-4">
        <Skeleton className="h-8 w-48 mx-auto rounded-full" />
        <Skeleton className="h-10 w-64 mx-auto" />
        <Skeleton className="h-4 w-80 mx-auto" />
      </div>

      {/* Filters Skeleton */}
      <div className="flex justify-center gap-2 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-lg" />
        ))}
      </div>

      {/* Podium Skeleton */}
      <div className="flex justify-center items-end gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <Skeleton className="h-16 w-16 rounded-full mx-auto" />
            <Skeleton className="h-4 w-20 mx-auto" />
            <Skeleton className="h-3 w-16 mx-auto" />
            <Skeleton className={`${i === 1 ? 'h-32 w-28' : 'h-24 w-24'} rounded-t-lg mx-auto`} />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="rounded-[2rem] border border-white/10 bg-[#0B0A10]/80 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full bg-white/5" />
              <Skeleton className="h-4 flex-1 bg-white/5" />
              <Skeleton className="h-4 w-20 bg-white/5" />
              <Skeleton className="h-4 w-16 bg-white/5" />
              <Skeleton className="h-4 w-24 bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="p-12 text-center rounded-[2rem] border border-white/10 bg-[#0B0A10]/80 backdrop-blur-xl">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/[0.02] border border-white/10 mb-6">
        <Trophy className="h-10 w-10 text-white/30" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">Belum Ada Data</h3>
      <p className="text-sm text-white/50 mb-6 max-w-sm mx-auto font-medium">
        Belum ada transaksi untuk periode ini. Jadilah yang pertama dan dapatkan posisi teratas!
      </p>
      <Button variant="outline" className="bg-transparent border-white/10 text-white hover:bg-white/[0.05] hover:text-[#D946EF] uppercase tracking-widest text-[10px] font-black h-12 px-6 rounded-xl">
        <ShoppingCart className="mr-2 h-4 w-4" />
        Mulai Belanja
      </Button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PODIUM CARD
───────────────────────────────────────────── */
function PodiumCard({ 
  user, 
  rank, 
  formatPrice 
}: { 
  user: any; 
  rank: number; 
  formatPrice: (myr?: number, idr?: number) => string;
}) {
  const RankIcon = rankIcons[rank as keyof typeof rankIcons] || Medal;
  const colors = rankColors[rank as keyof typeof rankColors];
  const isFirst = rank === 1;
  
  return (
    <div className="text-center animate-in slide-in-from-bottom-4 fade-in duration-500"
      style={{ animationDelay: `${rank * 100}ms` }}>
      {/* Rank Icon */}
      {isFirst && (
        <div className="relative inline-block mb-2">
          <Crown className="h-8 w-8 text-[#D946EF] mx-auto animate-bounce drop-shadow-[0_0_10px_rgba(255,184,0,0.5)]" />
          <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-[#D946EF] animate-pulse" />
        </div>
      )}
      
      {/* Avatar */}
      <div className={`relative mx-auto mb-2 ${
        isFirst ? 'h-20 w-20' : 'h-16 w-16'
      }`}>
        <div className={`w-full h-full rounded-2xl flex items-center justify-center text-2xl font-black border-2 backdrop-blur-sm ${
          isFirst 
            ? 'bg-gradient-to-br from-[#D946EF]/20 to-[#D946EF]/5 border-[#D946EF]/50 shadow-[0_0_20px_rgba(255,184,0,0.3)]' 
            : rank === 2
            ? 'bg-gradient-to-br from-slate-400/20 to-slate-400/5 border-slate-400/50'
            : 'bg-gradient-to-br from-[#8B5CF6]/20 to-[#8B5CF6]/5 border-[#8B5CF6]/50'
        }`}>
          <span className={isFirst ? 'text-[#D946EF]' : rank === 2 ? 'text-slate-300' : 'text-[#8B5CF6]'}>
            {String(user.name || "?").charAt(0).toUpperCase()}
          </span>
        </div>
        {isFirst && (
          <div className="absolute -top-2 -right-2">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#D946EF] flex items-center justify-center shadow-[0_0_10px_rgba(255,107,0,0.5)]">
              <Star className="h-3 w-3 text-black" fill="currentColor" />
            </div>
          </div>
        )}
      </div>
      
      {/* User Info */}
      <p className={`text-sm font-black tracking-wide uppercase truncate max-w-[120px] mx-auto ${
        isFirst ? 'text-[#D946EF] drop-shadow-[0_0_5px_rgba(255,184,0,0.5)]' : 'text-white'
      }`}>
        {String(user.name || "Anonymous")}
      </p>
      <p className="text-[10px] tracking-widest text-white/50 mt-1 uppercase">
        @{String(user.username || user.name || "user")}
      </p>
      <p className={`text-xs font-black tracking-wider mt-2 bg-clip-text text-transparent bg-gradient-to-r ${
        isFirst ? 'from-[#D946EF] to-[#8B5CF6]' : 'from-white to-white/70'
      }`}>
        {formatPrice(user.totalMyr, user.totalIdr)}
      </p>
      
      {/* Podium Block */}
      <div className={`mx-auto rounded-t-2xl mt-4 flex items-center justify-center border-t-2 border-l border-r backdrop-blur-md ${
        isFirst 
          ? 'w-28 h-32 bg-gradient-to-t from-[#D946EF]/20 to-[#D946EF]/5 border-t-[#D946EF]/50 border-x-[#D946EF]/20' 
          : rank === 2
          ? 'w-24 h-24 bg-gradient-to-t from-slate-400/20 to-slate-400/5 border-t-slate-400/50 border-x-slate-400/20'
          : 'w-24 h-16 bg-gradient-to-t from-[#8B5CF6]/20 to-[#8B5CF6]/5 border-t-[#8B5CF6]/50 border-x-[#8B5CF6]/20'
      }`}>
        <span className={`text-3xl font-black ${
          isFirst ? 'text-[#D946EF] drop-shadow-[0_0_10px_rgba(255,184,0,0.5)]' : 'text-white/30'
        }`}>
          #{rank}
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   RANK TREND INDICATOR
───────────────────────────────────────────── */
function RankTrend({ trend }: { trend?: "up" | "down" | "same" }) {
  if (!trend || trend === "same") {
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  }
  
  return trend === "up" ? (
    <ArrowUp className="h-3 w-3 text-green-500" />
  ) : (
    <ArrowDown className="h-3 w-3 text-destructive" />
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function Leaderboard() {
  const [activeFilter, setActiveFilter] = useState("all");
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  
  const { data: leaderboardDataResult, isLoading } = trpc.users.leaderboard.useQuery(
    { filter: activeFilter },
    { 
      enabled: true,
      staleTime: 60 * 1000, // 1 minute cache
    }
  );

  const leaderboardData = useMemo(() => {
    return (leaderboardDataResult?.data || []).slice(0, 20); // Show top 20
  }, [leaderboardDataResult]);

  const top3 = useMemo(() => leaderboardData.slice(0, 3), [leaderboardData]);
  const restData = useMemo(() => leaderboardData.slice(3), [leaderboardData]);

  // Find current user's rank
  const currentUserRank = useMemo(() => {
    if (!user) return null;
    return leaderboardData.findIndex(
      (u: any) => u.userId === user.id || u.name === user.name
    );
  }, [leaderboardData, user]);

  const handleFilterChange = useCallback((filterId: string) => {
    setActiveFilter(filterId);
  }, []);

  if (isLoading) {
    return <LeaderboardSkeleton />;
  }

  return (
    <div className="min-h-screen relative pt-24 pb-12 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-[#8B5CF6]/10 to-transparent blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-t from-[#D946EF]/5 to-transparent blur-[120px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2" />
      
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 mb-6">
            <Trophy className="h-4 w-4 text-[#D946EF]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D946EF]">Top Spenders</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent uppercase tracking-tight mb-4">
            Leaderboard
          </h1>
          
          <p className="text-sm text-white/60 font-medium max-w-md mx-auto leading-relaxed">
            Top customer berdasarkan total transaksi. Belanja lebih banyak untuk naik peringkat!
          </p>
          
          {/* Live indicator */}
          <div className="inline-flex items-center gap-2 mt-6 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] text-emerald-400 font-black tracking-widest uppercase">Live Update</span>
          </div>
        </div>

        {/* Time Filters */}
        <div className="flex justify-center gap-2 mb-12 flex-wrap animate-in fade-in slide-in-from-top-2 duration-500 delay-100">
          {timeFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            
            return (
              <Button
                key={filter.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange(filter.id)}
                className={`transition-all duration-300 h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                  isActive 
                    ? "bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] text-black border-0 shadow-[0_0_20px_rgba(255,107,0,0.3)] scale-105" 
                    : "bg-white/[0.02] border-white/10 text-white/70 hover:bg-white/[0.05] hover:text-white hover:border-white/20"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 mr-2 ${isActive ? 'text-black' : 'text-white/50'}`} />
                {filter.label}
                {isActive && (
                  <Badge className="ml-2 h-5 bg-black/20 text-black border-0 px-1.5 font-bold">
                    {leaderboardData.length}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>

        {/* Podium Section */}
        {top3.length > 0 ? (
          <div className="flex justify-center items-end gap-4 sm:gap-6 mb-12 animate-in fade-in zoom-in-95 duration-700 delay-200">
            {/* Rank 2 */}
            {top3[1] && (
              <PodiumCard user={top3[1]} rank={2} formatPrice={formatPrice} />
            )}
            
            {/* Rank 1 */}
            {top3[0] && (
              <PodiumCard user={top3[0]} rank={1} formatPrice={formatPrice} />
            )}
            
            {/* Rank 3 */}
            {top3[2] && (
              <PodiumCard user={top3[2]} rank={3} formatPrice={formatPrice} />
            )}
          </div>
        ) : !isLoading && (
          <EmptyState />
        )}

        {/* Leaderboard Table */}
        {leaderboardData.length > 0 && (
          <div className="rounded-[2rem] border border-white/10 bg-[#0B0A10]/80 backdrop-blur-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            {/* Current User Rank Banner */}
            {currentUserRank !== null && currentUserRank >= 0 && (
              <div className="p-5 bg-gradient-to-r from-[#8B5CF6]/10 to-[#D946EF]/5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#D946EF] flex items-center justify-center shadow-[0_0_15px_rgba(255,107,0,0.3)]">
                    <Users className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black tracking-widest text-[#D946EF] uppercase mb-1">Peringkat Anda</p>
                    <p className="text-sm font-bold text-white">
                      #{currentUserRank + 1} dari {leaderboardData.length} pengguna
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:text-[#D946EF] text-[10px] font-black uppercase tracking-widest h-10 px-4 rounded-xl">
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Naikkan
                </Button>
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-black/20">
                    <th className="text-left p-5 font-black text-white/50 text-[10px] uppercase tracking-[0.2em]">
                      Rank
                    </th>
                    <th className="text-left p-5 font-black text-white/50 text-[10px] uppercase tracking-[0.2em]">
                      Pengguna
                    </th>
                    <th className="text-left p-5 font-black text-white/50 text-[10px] uppercase tracking-[0.2em] hidden md:table-cell">
                      Game Favorite
                    </th>
                    <th className="text-center p-5 font-black text-white/50 text-[10px] uppercase tracking-[0.2em]">
                      Orders
                    </th>
                    <th className="text-center p-5 font-black text-white/50 text-[10px] uppercase tracking-[0.2em] hidden sm:table-cell">
                      Trend
                    </th>
                    <th className="text-right p-5 font-black text-white/50 text-[10px] uppercase tracking-[0.2em]">
                      Total
                    </th>
                  </tr>
                </thead>
                
                <tbody>
                  {leaderboardData.map((userData: any, index: number) => {
                    const rank = index + 1;
                    const isTop3 = rank <= 3;
                    const colors = rankColors[rank as keyof typeof rankColors];
                    const RankIcon = rankIcons[rank as keyof typeof rankIcons] || Medal;
                    const isCurrentUser = user && (
                      userData.userId === user.id || 
                      userData.name === user.name
                    );
                    
                    return (
                      <tr 
                        key={userData.rank || index} 
                        className={`border-b border-white/5 transition-all duration-300 ${
                          isCurrentUser 
                            ? "bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20" 
                            : "hover:bg-white/[0.02]"
                        }`}
                      >
                        {/* Rank */}
                        <td className="p-5">
                          <div className="flex items-center gap-2">
                            {isTop3 ? (
                              <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${
                                rank === 1 
                                  ? 'bg-[#D946EF]/10 text-[#D946EF] border-[#D946EF]/30' 
                                  : rank === 2 
                                  ? 'bg-slate-400/10 text-slate-300 border-slate-400/30' 
                                  : 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/30'
                              }`}>
                                <RankIcon className="h-5 w-5" />
                              </div>
                            ) : (
                              <span className="h-10 w-10 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-center text-sm font-black text-white/50">
                                {rank}
                              </span>
                            )}
                          </div>
                        </td>
                        
                        {/* User Info */}
                        <td className="p-5">
                          <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-lg font-black relative border ${
                              isCurrentUser
                                ? 'bg-gradient-to-br from-[#8B5CF6] to-[#D946EF] text-black border-transparent shadow-[0_0_15px_rgba(255,107,0,0.3)]'
                                : isTop3 && colors
                                ? `bg-gradient-to-br ${colors.bg} ${colors.text} ${colors.border}`
                                : 'bg-white/[0.02] text-white/70 border-white/10'
                            }`}>
                              {String(userData.name || "?").charAt(0).toUpperCase()}
                              {isCurrentUser && (
                                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-md bg-white flex items-center justify-center shadow-lg">
                                  <Star className="h-3 w-3 text-black" fill="currentColor" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className={`font-black tracking-wide uppercase truncate ${
                                isCurrentUser ? 'text-[#D946EF]' : 'text-white'
                              }`}>
                                {String(userData.name || "Anonymous")}
                                {isCurrentUser && (
                                  <Badge className="ml-3 text-[9px] bg-[#8B5CF6]/20 text-[#D946EF] border-0 px-2 font-black uppercase tracking-widest">
                                    Anda
                                  </Badge>
                                )}
                              </p>
                              <p className="text-[10px] text-white/50 tracking-widest uppercase mt-1">
                                @{String(userData.username || userData.name || "user")}
                              </p>
                            </div>
                          </div>
                        </td>
                        
                        {/* Favorite Game */}
                        <td className="p-5 text-white/70 hidden md:table-cell">
                          <div className="flex items-center gap-2 font-medium">
                            <Gamepad2 className="h-4 w-4 text-white/50" />
                            <span className="text-sm">{userData.favorite || "Multi Game"}</span>
                          </div>
                        </td>
                        
                        {/* Orders Count */}
                        <td className="p-5 text-center">
                          <Badge variant="outline" className="text-xs bg-white/[0.02] border-white/10 text-white px-3 py-1 font-bold">
                            <ShoppingCart className="h-3 w-3 mr-2 text-white/50" />
                            {userData.orders || 0}x
                          </Badge>
                        </td>
                        
                        {/* Trend */}
                        <td className="p-5 text-center hidden sm:table-cell">
                          <RankTrend trend={userData.trend} />
                        </td>
                        
                        {/* Total Amount */}
                        <td className="p-5 text-right">
                          <div>
                            <p className={`font-black tracking-wider text-lg ${
                              isTop3 
                                ? rank === 1 ? 'text-[#D946EF]' : 'text-[#8B5CF6]' 
                                : 'text-white'
                            }`}>
                              {formatPrice(userData.totalMyr, userData.totalIdr)}
                            </p>
                            {isTop3 && (
                              <p className="text-[9px] text-white/50 uppercase tracking-[0.2em] font-black mt-1">
                                Top {rank} Spender
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Footer */}
            <div className="p-5 border-t border-white/10 bg-black/20">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-black text-white/50">
                <div className="flex items-center gap-6">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-white/30" />
                    {leaderboardData.length} Pengguna
                  </span>
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-white/30" />
                    {leaderboardData.reduce((sum: number, u: any) => sum + (u.orders || 0), 0)} Total Orders
                  </span>
                </div>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-white/30" />
                  Real-time
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="flex justify-center mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-[#8B5CF6]/10 to-[#D946EF]/10 border border-[#8B5CF6]/30 shadow-[0_0_20px_rgba(255,107,0,0.15)]">
            <Flame className="h-5 w-5 text-[#8B5CF6]" />
            <span className="text-xs text-white/70 font-medium">
              Data diperbarui secara realtime.
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-[#D946EF] ml-2">
              Belanja lebih banyak untuk naik peringkat!
            </span>
            <Gift className="h-5 w-5 text-[#D946EF]" />
          </div>
        </div>
      </div>
    </div>
  );
}