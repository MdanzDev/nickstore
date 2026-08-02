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
  MessageSquare,
  Globe,
} from "lucide-react";

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   CONSTANTS
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const STATUS_OPTIONS = ["Semua", "pending", "processing", "success", "failed", "refund", "cancelled"];
const SOURCE_OPTIONS = ["Semua", "website", "telegram"];

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
  success:     { label: "Success",     icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  sukses:      { label: "Success",     icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  completed:   { label: "Success",     icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  delivered:   { label: "Success",     icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  pending:     { label: "Pending",     icon: Clock,       color: "text-primary",     bg: "bg-primary/10",     border: "border-primary/20" },
  processing:  { label: "Processing",  icon: Zap,         color: "text-cyan-400",      bg: "bg-cyan-500/10",      border: "border-cyan-500/20" },
  proses:      { label: "Processing",  icon: Zap,         color: "text-cyan-400",      bg: "bg-cyan-500/10",      border: "border-cyan-500/20" },
  confirmed:   { label: "Processing",  icon: Zap,         color: "text-cyan-400",      bg: "bg-cyan-500/10",      border: "border-cyan-500/20" },
  shipped:     { label: "Processing",  icon: Zap,         color: "text-cyan-400",      bg: "bg-cyan-500/10",      border: "border-cyan-500/20" },
  failed:      { label: "Failed",      icon: XCircle,     color: "text-red-600",       bg: "bg-red-500/10",       border: "border-red-500/20" },
  gagal:       { label: "Failed",      icon: XCircle,     color: "text-red-600",       bg: "bg-red-500/10",       border: "border-red-500/20" },
  cancelled:   { label: "Failed",      icon: XCircle,     color: "text-red-600",       bg: "bg-red-500/10",       border: "border-red-500/20" },
  refund:      { label: "Refund",      icon: AlertCircle, color: "text-primary",     bg: "bg-primary/10",     border: "border-primary/20" },
};

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   STATUS BADGE (memoised)
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const StatusBadge = ({ status }: { status: string }) => {
  const config = STATUS_CONFIG[status?.toLowerCase()] ?? {
    label: status,
    icon: AlertCircle,
    color: "text-muted-foreground/90",
    bg: "bg-secondary/60",
    border: "border-border/80",
  };
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[9px] font-black uppercase tracking-widest shadow-sm ${config.color} ${config.bg} ${config.border}`}>
      <Icon className="h-3 w-3" /> {config.label}
    </span>
  );
};

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   PAGINATION (reusable)
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
        className="h-8 rounded-lg border-border/80 hover:bg-secondary/60 text-[9px] font-black uppercase tracking-widest disabled:opacity-50"
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
                  : "border-border/80 hover:bg-secondary/60"
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
        className="h-8 rounded-lg border-border/80 hover:bg-secondary/60 text-[9px] font-black uppercase tracking-widest disabled:opacity-50"
      >
        Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
      </Button>
    </div>
  );
};

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   MAIN PAGE
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function UserTransactions() {
  const { formatPrice } = useCurrency();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [sourceFilter, setSourceFilter] = useState("Semua");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isLoading } = trpc.orders.list.useQuery({
    page,
    limit: 10,
    status: statusFilter === "Semua" ? undefined : statusFilter,
  });

  const allOrders = data?.data ?? [];
  const orders = useMemo(() => {
    if (sourceFilter === "Semua") return allOrders;
    return allOrders.filter((o: any) => {
      const channel = (o.channel || o.source || "website").toLowerCase();
      if (sourceFilter === "telegram") return channel === "telegram" || channel === "bot";
      return channel === "website" || channel === "web" || (!o.channel && !o.source);
    });
  }, [allOrders, sourceFilter]);
  const meta = data?.meta;

  const handleExport = useCallback((format: "csv" | "xlsx") => {
    alert(`Ekspor ${format.toUpperCase()} belum tersedia.`);
  }, []);

  return (
    <UserDashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-foreground">
            Riwayat Transaksi
          </h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/90 mt-1">
            Menampilkan data riwayat transaksi yang telah Kamu lakukan
          </p>
        </div>

        {/* Filters Card */}
        <Card className="p-6 bg-secondary/60 border-border/80 backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-primary mb-2 block">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 rounded-xl border border-border/80 bg-secondary/60 px-4 text-xs font-black uppercase tracking-widest text-foreground/85 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors appearance-none"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s} className="bg-card text-foreground">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Source Filter */}
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-primary mb-2 block">
                Sumber
              </label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full h-10 rounded-xl border border-border/80 bg-secondary/60 px-4 text-xs font-black uppercase tracking-widest text-foreground/85 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors appearance-none"
              >
                {SOURCE_OPTIONS.map((s) => (
                  <option key={s} value={s} className="bg-card text-foreground">
                    {s === "Semua" ? "Semua Sumber" : s === "website" ? "ðŸŒ Website" : "ðŸ“± Telegram Bot"}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Pickers */}
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-primary mb-2 block">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-10 rounded-xl border border-border/80 bg-secondary/60 px-4 text-xs font-black uppercase tracking-widest text-foreground/85 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-primary mb-2 block">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-10 rounded-xl border border-border/80 bg-secondary/60 px-4 text-xs font-black uppercase tracking-widest text-foreground/85 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors [color-scheme:dark]"
              />
            </div>

            {/* Export Buttons */}
            <div className="flex items-end gap-3">
              <Button
                variant="outline"
                size="sm"
                className="h-10 rounded-xl border-border/80 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-foreground flex-1 transition-colors"
                onClick={() => handleExport("csv")}
              >
                <Download className="mr-2 h-4 w-4 text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">CSV</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 rounded-xl border-border/80 hover:border-primary/50 hover:bg-primary/10 text-foreground flex-1 transition-colors"
                onClick={() => handleExport("xlsx")}
              >
                <Download className="mr-2 h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">XLSX</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Data Table Card */}
        <Card className="rounded-[1.5rem] overflow-hidden bg-secondary/60 border-border/80 shadow-2xl backdrop-blur-xl">
          {isLoading ? (
            <div className="p-16 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="mt-4 text-xs text-muted-foreground uppercase tracking-widest">
                Memuat data transaksi...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-secondary/60 mb-6 shadow-inner">
                <Receipt className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-2">
                Belum Ada Transaksi
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/90">
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
                      className="group relative flex flex-col md:flex-row md:items-center justify-between p-4 gap-4 rounded-2xl bg-secondary/50 border border-border/70 hover:bg-secondary/80 hover:border-border/80 transition-all duration-300 backdrop-blur-sm overflow-hidden"
                    >
                      {/* Hover glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none" />
                      
                      <div className="flex items-start md:items-center gap-4 z-10 w-full md:w-auto flex-1">
                        <div className={`hidden sm:flex flex-shrink-0 items-center justify-center w-12 h-12 rounded-xl border shadow-inner transition-colors duration-300 ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color} group-hover:bg-secondary/80`}>
                          <StatusIcon className="w-5 h-5" />
                        </div>
                        
                        <div className="flex flex-col gap-1.5 w-full">
                          <div className="flex items-center justify-between md:hidden w-full">
                            <span className="font-mono text-[9px] text-muted-foreground/90">{invId}</span>
                            <StatusBadge status={order.status} />
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground/90 group-hover:text-foreground transition-colors leading-tight line-clamp-2">
                              {itemDesc}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Target</span>
                              <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                                {userInput}{zone}
                              </span>
                            </div>
                            <div className="hidden md:flex items-center gap-1.5">
                              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Invoice</span>
                              <span className="font-mono text-[10px] text-muted-foreground/90">{invId}</span>
                            </div>
                          </div>

                          {isCancelled && parsedKeterangan && (
                            <div className="text-[9px] font-black uppercase tracking-widest text-red-600 mt-2 flex items-start gap-1.5 bg-red-500/5 p-2 rounded-lg border border-red-500/10 w-fit">
                              <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
                              <span className="line-clamp-2 max-w-md" title={parsedKeterangan}>Alasan: {parsedKeterangan}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 z-10 w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t border-border/70 md:border-t-0">
                        <div className="flex flex-col items-start md:items-end gap-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 md:hidden">Harga</span>
                          <span className="font-black text-base whitespace-nowrap text-foreground">
                            {formatPrice(order.totalMyr, order.totalIdr)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 md:flex-col md:items-end md:gap-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
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
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border-t border-border/80 bg-secondary/40">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
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