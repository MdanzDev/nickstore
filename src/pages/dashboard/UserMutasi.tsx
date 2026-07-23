import { useState, useCallback, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import UserDashboardLayout from "./UserDashboardLayout";
import { useCurrency } from "@/providers/CurrencyProvider";
import {
  Loader2,
  ArrowLeftRight,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowDownToLine,
  RotateCcw,
  ShoppingCart
} from "lucide-react";

/* ─────────────────────────────────────────────
   PAGINATION (reusable)
───────────────────────────────────────────── */
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = useMemo(() => {
    const items: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      items.push(1);
      if (currentPage > 3) items.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) items.push(i);
      if (currentPage < totalPages - 2) items.push("...");
      items.push(totalPages);
    }
    return items;
  }, [currentPage, totalPages]);

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Prev
      </Button>
      <div className="flex gap-1">
        {pages.map((page, i) =>
          page === "..." ? (
            <span key={`dots-${i}`} className="px-2 py-1 text-muted-foreground">
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(page as number)}
            >
              {page}
            </Button>
          )
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function UserMutasi() {
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("all");

  const { data, isLoading } = trpc.transactions.list.useQuery({
    page,
    limit: 10,
    // (add filters later when backend supports them)
  });

  const transactions = (data?.data ?? []) as any[];
  const meta = data?.meta as { total: number; pages: number } | undefined;
  const { formatPrice } = useCurrency();

  // Export placeholders
  const handleExport = useCallback((format: "csv" | "xlsx") => {
    alert(`Ekspor ${format.toUpperCase()} belum tersedia.`);
  }, []);

  return (
    <UserDashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-white">
            Riwayat Mutasi
          </h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mt-1">
            Menampilkan data riwayat mutasi yang telah Kamu lakukan
          </p>
        </div>

        {/* Filters Card */}
        <Card className="p-6 bg-[#0B0A10]/80 border-white/10 backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-[#D946EF] mb-2 block">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-black uppercase tracking-widest text-white/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors appearance-none"
              >
                <option value="all">Semua</option>
                <option value="deposit">Deposit</option>
                <option value="purchase">Pembelian</option>
                <option value="refund">Refund</option>
              </select>
            </div>
            {/* Date Pickers */}
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-[#D946EF] mb-2 block">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-black uppercase tracking-widest text-white/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-[#D946EF] mb-2 block">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-black uppercase tracking-widest text-white/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors [color-scheme:dark]"
              />
            </div>
            {/* Export Buttons */}
            <div className="flex items-end gap-3">
              <Button
                variant="outline"
                size="sm"
                className="h-10 rounded-xl border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-white flex-1 transition-colors"
                onClick={() => handleExport("csv")}
              >
                <Download className="mr-2 h-4 w-4 text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">CSV</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 rounded-xl border-white/10 hover:border-[#D946EF]/50 hover:bg-[#D946EF]/10 text-white flex-1 transition-colors"
                onClick={() => handleExport("xlsx")}
              >
                <Download className="mr-2 h-4 w-4 text-[#D946EF]" />
                <span className="text-[10px] font-black uppercase tracking-widest">XLSX</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Data Table Card */}
        <Card className="rounded-[1.5rem] overflow-hidden bg-[#0B0A10]/80 border-white/10 shadow-2xl backdrop-blur-xl">
          {isLoading ? (
            <div className="p-16 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="mt-4 text-xs text-muted-foreground uppercase tracking-widest">
                Memuat data mutasi...
              </p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/5 mb-6 shadow-inner">
                <ArrowLeftRight className="h-10 w-10 text-white/20" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">
                Belum Ada Mutasi
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                Tidak ada data mutasi yang ditemukan.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3 p-5">
                {transactions.map((tx, index) => {
                  const amount = Number(tx.amount ?? 0);
                  const isPositive = tx.type === "credit";
                  const Icon = tx.type === "credit" ? ArrowDownToLine : ShoppingCart;
                  
                  return (
                    <div
                      key={tx.id || index}
                      className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300 backdrop-blur-sm overflow-hidden"
                    >
                      {/* Hover glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none" />
                      
                      <div className="flex items-center gap-4 z-10">
                        <div className={`flex items-center justify-center min-w-[3rem] w-12 h-12 rounded-xl border shadow-inner transition-colors duration-300 ${isPositive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20 text-rose-400 group-hover:bg-rose-500/20'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="font-bold text-sm text-white/90 group-hover:text-white transition-colors leading-tight line-clamp-2">{tx.description ?? "-"}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{new Date(tx.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 z-10 pl-16 sm:pl-0">
                        <span className={`font-black text-base sm:text-lg whitespace-nowrap ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPositive ? "+" : "-"}{formatPrice(amount)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Saldo</span>
                          <span className="text-[11px] font-black tracking-wider text-white/70">
                            {formatPrice(tx.balanceAfter ?? tx.balance ?? 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination with summary */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border-t border-white/10 bg-white/[0.01]">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/40">
                  Menampilkan {transactions.length} dari {meta?.total ?? 0} hasil
                </p>
                <Pagination
                  currentPage={page}
                  totalPages={meta?.pages ?? 1}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </Card>
      </div>
    </UserDashboardLayout>
  );
}