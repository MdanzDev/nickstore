import { useState, useCallback, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { useCurrency } from "@/providers/CurrencyProvider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UserDashboardLayout from "./UserDashboardLayout";
import {
  Loader2,
  Receipt,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Zap,
  XCircle,
  AlertCircle,
} from "lucide-react";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const STATUS_OPTIONS = ["Semua", "pending", "processing", "success", "failed", "refund", "cancelled"];

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
  success:     { label: "Success",     icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  sukses:      { label: "Success",     icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  completed:   { label: "Success",     icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  delivered:   { label: "Success",     icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  pending:     { label: "Pending",     icon: Clock,       color: "text-[#D946EF]",     bg: "bg-[#D946EF]/10",     border: "border-[#D946EF]/20" },
  processing:  { label: "Processing",  icon: Zap,         color: "text-cyan-400",      bg: "bg-cyan-500/10",      border: "border-cyan-500/20" },
  proses:      { label: "Processing",  icon: Zap,         color: "text-cyan-400",      bg: "bg-cyan-500/10",      border: "border-cyan-500/20" },
  confirmed:   { label: "Processing",  icon: Zap,         color: "text-cyan-400",      bg: "bg-cyan-500/10",      border: "border-cyan-500/20" },
  shipped:     { label: "Processing",  icon: Zap,         color: "text-cyan-400",      bg: "bg-cyan-500/10",      border: "border-cyan-500/20" },
  failed:      { label: "Failed",      icon: XCircle,     color: "text-red-400",       bg: "bg-red-500/10",       border: "border-red-500/20" },
  gagal:       { label: "Failed",      icon: XCircle,     color: "text-red-400",       bg: "bg-red-500/10",       border: "border-red-500/20" },
  cancelled:   { label: "Failed",      icon: XCircle,     color: "text-red-400",       bg: "bg-red-500/10",       border: "border-red-500/20" },
  refund:      { label: "Refund",      icon: AlertCircle, color: "text-[#8B5CF6]",     bg: "bg-[#8B5CF6]/10",     border: "border-[#8B5CF6]/20" },
};

/* ─────────────────────────────────────────────
   STATUS BADGE (memoised)
───────────────────────────────────────────── */
const StatusBadge = ({ status }: { status: string }) => {
  const config = STATUS_CONFIG[status?.toLowerCase()] ?? {
    label: status,
    icon: AlertCircle,
    color: "text-white/50",
    bg: "bg-white/5",
    border: "border-white/10",
  };
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[9px] font-black uppercase tracking-widest shadow-sm ${config.color} ${config.bg} ${config.border}`}>
      <Icon className="h-3 w-3" /> {config.label}
    </span>
  );
};

/* ─────────────────────────────────────────────
   PAGINATION (reusable)
───────────────────────────────────────────── */
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
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
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="h-8 rounded-lg border-white/10 hover:bg-white/5 text-[9px] font-black uppercase tracking-widest disabled:opacity-50"
      >
        <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
      </Button>
      <div className="flex gap-1">
        {pages.map((page, i) =>
          page === "..." ? (
            <span key={`dots-${i}`} className="px-2 py-1 text-muted-foreground text-[9px]">
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              className={`h-8 w-8 p-0 text-[9px] font-black ${
                currentPage === page
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "border-white/10 hover:bg-white/5"
              }`}
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
        className="h-8 rounded-lg border-white/10 hover:bg-white/5 text-[9px] font-black uppercase tracking-widest disabled:opacity-50"
      >
        Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
      </Button>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function UserTransactions() {
  const { formatPrice } = useCurrency();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isLoading } = trpc.orders.list.useQuery({
    page,
    limit: 10,
    status: statusFilter === "Semua" ? undefined : statusFilter,
  });

  const orders = data?.data ?? [];
  const meta = data?.meta;

  const handleExport = useCallback((format: "csv" | "xlsx") => {
    alert(`Ekspor ${format.toUpperCase()} belum tersedia.`);
  }, []);

  return (
    <UserDashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-white">
            Riwayat Transaksi
          </h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mt-1">
            Menampilkan data riwayat transaksi yang telah Kamu lakukan
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-black uppercase tracking-widest text-white/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors appearance-none"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s} className="bg-[#0B0A10] text-white">
                    {s}
                  </option>
                ))}
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
                Memuat data transaksi...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/5 mb-6 shadow-inner">
                <Receipt className="h-10 w-10 text-white/20" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">
                Belum Ada Transaksi
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                Tidak ditemukan transaksi dengan filter tersebut.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3 p-5">
                {orders.map((order: any) => {
                  const invId = String(order.id).slice(0, 20) + (String(order.id).length > 20 ? "..." : "");
                  const itemDesc = order.notes || "-";
                  const userInput = order.gameUserId || "-";
                  const zone = order.zoneId ? ` (${order.zoneId})` : "";
                  const isCancelled = order.status?.toLowerCase() === "cancelled" || order.status?.toLowerCase() === "failed" || order.status?.toLowerCase() === "gagal";
                  
                  // Parse keterangan safely to avoid showing raw JSON
                  let parsedKeterangan = order.keterangan || "";
                  try {
                    if (parsedKeterangan.trim().startsWith('{') || parsedKeterangan.trim().startsWith('[')) {
                      const obj = JSON.parse(parsedKeterangan);
                      parsedKeterangan = obj.message || obj.error_msg || obj.sn || "Sistem membatalkan transaksi ini.";
                    }
                  } catch (e) {
                    // It's a plain string, leave it as is
                  }

                  const statusConfig = STATUS_CONFIG[order.status?.toLowerCase()] || STATUS_CONFIG.pending;
                  const StatusIcon = statusConfig.icon || Receipt;

                  return (
                    <div
                      key={order.id}
                      className="group relative flex flex-col md:flex-row md:items-center justify-between p-4 gap-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300 backdrop-blur-sm overflow-hidden"
                    >
                      {/* Hover glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none" />
                      
                      <div className="flex items-start md:items-center gap-4 z-10 w-full md:w-auto flex-1">
                        <div className={`hidden sm:flex flex-shrink-0 items-center justify-center w-12 h-12 rounded-xl border shadow-inner transition-colors duration-300 ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color} group-hover:bg-white/10`}>
                          <StatusIcon className="w-5 h-5" />
                        </div>
                        
                        <div className="flex flex-col gap-1.5 w-full">
                          <div className="flex items-center justify-between md:hidden w-full">
                            <span className="font-mono text-[9px] text-white/50">{invId}</span>
                            <StatusBadge status={order.status} />
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white/90 group-hover:text-white transition-colors leading-tight line-clamp-2">
                              {itemDesc}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Target</span>
                              <span className="font-mono text-[10px] font-bold text-[#D946EF] bg-[#D946EF]/10 px-2 py-0.5 rounded">
                                {userInput}{zone}
                              </span>
                            </div>
                            <div className="hidden md:flex items-center gap-1.5">
                              <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Invoice</span>
                              <span className="font-mono text-[10px] text-white/50">{invId}</span>
                            </div>
                          </div>

                          {isCancelled && parsedKeterangan && (
                            <div className="text-[9px] font-black uppercase tracking-widest text-red-400 mt-2 flex items-start gap-1.5 bg-red-500/5 p-2 rounded-lg border border-red-500/10 w-fit">
                              <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
                              <span className="line-clamp-2 max-w-md" title={parsedKeterangan}>Alasan: {parsedKeterangan}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 z-10 w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t border-white/5 md:border-t-0">
                        <div className="flex flex-col items-start md:items-end gap-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-white/30 md:hidden">Harga</span>
                          <span className="font-black text-base whitespace-nowrap text-white">
                            {formatPrice(order.totalMyr, order.totalIdr)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 md:flex-col md:items-end md:gap-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                            {new Date(order.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div className="hidden md:block">
                            <StatusBadge status={order.status} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {meta && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border-t border-white/10 bg-white/[0.01]">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/40">
                    Menampilkan {orders.length} dari {meta.total} hasil
                  </p>
                  <Pagination
                    currentPage={page}
                    totalPages={meta.pages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </UserDashboardLayout>
  );
}