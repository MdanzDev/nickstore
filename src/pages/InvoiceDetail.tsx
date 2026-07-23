import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useCurrency } from "@/providers/CurrencyProvider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Clock, FileText, AlertCircle, Loader2, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { formatPrice, exchangeRate } = useCurrency();

  const { data: order, isLoading, error } = trpc.orders.guestGetStatus.useQuery(
    { id: id || "" },
    { enabled: !!id, refetchInterval: 10000 }
  );

  const getStepProgress = (status: string) => {
    switch (status?.toLowerCase()) {
      case "sukses":
      case "success":
      case "completed":
      case "delivered":
        return 4; // Completed
      case "proses":
      case "processing":
      case "confirmed":
      case "shipped":
        return 3; // Processing
      case "pending":
        return 2; // Payment
      case "gagal":
      case "failed":
      case "cancelled":
      case "refund":
        return -1; // Failed
      default:
        return 1; // Created
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case "sukses":
      case "success":
      case "completed":
      case "delivered":
        return { color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20", label: "PAID" };
      case "pending":
        return { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "UNPAID" };
      case "proses":
      case "processing":
      case "confirmed":
      case "shipped":
        return { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "PROCESSING" };
      default:
        return { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20", label: "FAILED" };
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Tersalin ke clipboard!");
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Invoice Tidak Ditemukan</h1>
          <p className="text-muted-foreground mb-8">Pastikan nomor invoice yang Anda masukkan sudah benar.</p>
          <Button asChild className="bg-primary hover:bg-primary/90 text-white rounded-full px-8">
            <Link to="/cek-transaksi">
              <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
            </Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  const step = getStepProgress(order.status);
  const config = getStatusConfig(order.status);

  // Parse QR data from keterangan if it's a JSON string
  let qrData: any = null;
  if (order.keterangan && order.keterangan.startsWith('{')) {
    try {
      qrData = JSON.parse(order.keterangan);
    } catch (e) {
      // Not JSON
    }
  }

  // Determine payment method text
  const paymentMethodText = qrData?.qrImage ? 'QRIS ALL PAY' : (order.type === 'deposit' ? 'QRIS ALL PAY' : 'SALDO AKUN');

  return (
    <div className="min-h-screen py-16 px-4 bg-[#0B0F19]">
      <div className="max-w-6xl mx-auto">
        <Link to="/cek-transaksi" className="inline-flex items-center text-muted-foreground hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Pencarian
        </Link>

        {/* Progress Bar Header */}
        <Card className="p-8 mb-8 bg-white/[0.02] backdrop-blur-xl border-white/5 shadow-2xl rounded-2xl relative overflow-hidden">
          <h2 className="text-xl font-bold text-white mb-8">Progress Transaksi</h2>
          
          <div className="relative flex justify-between items-center mb-4">
            {/* Connecting Lines */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -z-10 -translate-y-1/2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-1000 ease-in-out" 
                style={{ width: `${step === 4 ? 100 : step === 3 ? 66 : step === 2 ? 33 : 0}%` }}
              />
            </div>

            {/* Steps */}
            {[
              { id: 1, icon: <FileText className="w-5 h-5" />, label: "Transaksi Dibuat", desc: "Transaksi telah berhasil dibuat" },
              { id: 2, icon: <Clock className="w-5 h-5" />, label: "Pembayaran", desc: "Silakan melakukan pembayaran" },
              { id: 3, icon: <Loader2 className="w-5 h-5" />, label: "Sedang Di Proses", desc: "Pembelian sedang dalam proses" },
              { id: 4, icon: <CheckCircle2 className="w-5 h-5" />, label: "Transaksi Selesai", desc: "Transaksi telah berhasil dilakukan" }
            ].map((s) => (
              <div key={s.id} className="flex flex-col items-center w-1/4 relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-all duration-500 shadow-xl ${
                  step >= s.id 
                    ? "bg-primary text-white border-2 border-primary/50 shadow-primary/20" 
                    : step === -1 ? "bg-white/5 text-white/30 border-2 border-white/5" : "bg-[#0B0F19] text-white/50 border-2 border-white/10"
                }`}>
                  {s.id === 3 && step === 3 ? <Loader2 className="w-5 h-5 animate-spin" /> : s.icon}
                </div>
                <h3 className={`text-sm font-bold mb-1 ${step >= s.id ? "text-white" : "text-white/50"}`}>{s.label}</h3>
                <p className="text-xs text-muted-foreground text-center max-w-[120px] hidden md:block">{s.desc}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Timer Alert (Only for pending) */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="bg-destructive/20 border border-destructive/30 text-destructive-foreground px-6 py-3 rounded-xl inline-flex items-center font-bold">
              <Clock className="w-5 h-5 mr-2 animate-pulse text-destructive" />
              Menunggu Pembayaran
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Product Details */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6 bg-white/[0.02] backdrop-blur-xl border-white/5 shadow-2xl rounded-2xl">
              <div className="flex flex-col md:flex-row gap-6 mb-8 border-b border-white/10 pb-8">
                <div className="w-32 h-32 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
                  {/* Try to infer a nice gradient or placeholder based on game slug */}
                  <div className="w-full h-full bg-gradient-to-br from-primary/40 to-blue-600/40 flex items-center justify-center">
                     <span className="text-4xl font-black text-white/50 uppercase">{(order.game_slug || "T").substring(0,2)}</span>
                  </div>
                </div>
                <div className="space-y-4 flex-1">
                  <div>
                    <h3 className="font-bold text-xl text-white">{(order.game_slug || "").split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</h3>
                    <p className="text-primary font-medium">{order.service_name}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Target ID / UID</p>
                      <p className="text-sm font-mono text-white/90">{order.game_id || "N/A"}</p>
                    </div>
                    {order.zone_id && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Server / Zone ID</p>
                        <p className="text-sm font-mono text-white/90">{order.zone_id}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Harga</span>
                  <span className="text-white">{formatPrice(order.price_myr, order.price_idr || order.price_myr * exchangeRate)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Jumlah</span>
                  <span className="text-white">1x</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Payment Fee</span>
                  <span className="text-white">RM 0.00</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <span className="font-bold text-white">Total Pembayaran</span>
                  <span className="font-bold text-xl text-primary">{formatPrice(order.price_myr, order.price_idr || order.price_myr * exchangeRate)}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Payment Details */}
          <div className="lg:col-span-7">
            <Card className="p-8 bg-white/[0.02] backdrop-blur-xl border-white/5 shadow-2xl rounded-2xl h-full">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm text-muted-foreground mb-1">Metode Pembayaran</h3>
                  <p className="font-bold text-lg text-white uppercase">{paymentMethodText}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <div>
                    <h3 className="text-sm text-muted-foreground mb-2">Nomor Invoice</h3>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white tracking-wider">{order.invoice}</span>
                      <button onClick={() => copyToClipboard(order.invoice)} className="text-muted-foreground hover:text-white transition-colors p-1 bg-white/5 rounded-md hover:bg-white/10">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm text-muted-foreground mb-2">Status Pembayaran</h3>
                    <Badge className={`${config.bg} ${config.color} ${config.border} border rounded-md px-3 py-1 text-xs font-bold tracking-wider`}>
                      {config.label}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-sm text-muted-foreground mb-2">Status Transaksi</h3>
                    <Badge className={`${config.bg} ${config.color} ${config.border} border rounded-md px-3 py-1 text-xs font-bold tracking-wider`}>
                      {order.status?.toUpperCase() || 'UNKNOWN'}
                    </Badge>
                  </div>

                  <div className="md:col-span-2">
                    <h3 className="text-sm text-muted-foreground mb-2">Pesan</h3>
                    <p className="text-sm text-white/90 bg-white/5 p-4 rounded-xl border border-white/10 leading-relaxed break-words whitespace-pre-wrap">
                      {qrData?.message || (order.keterangan && !qrData?.qrImage ? order.keterangan : "Silakan lakukan pembayaran dengan metode yang kamu pilih.")}
                    </p>
                  </div>
                </div>

                {/* Inline QR Code Section */}
                {step === 2 && qrData?.qrImage && (
                  <div className="mt-8 pt-8 border-t border-white/10">
                    <h3 className="text-sm text-muted-foreground mb-6">Kode Pembayaran</h3>
                    <div className="flex flex-col items-center">
                      <div className="bg-white p-6 rounded-2xl shadow-2xl border-4 border-white/10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <img src={qrData.qrImage} alt="QRIS Code" className="w-64 h-64 object-contain" />
                      </div>
                      
                      <p className="text-sm text-amber-500 mt-6 font-medium bg-amber-500/10 px-6 py-2 rounded-full border border-amber-500/20 flex items-center">
                        <Clock className="w-4 h-4 mr-2" /> Menunggu pembayaran diproses...
                      </p>

                      {qrData.checkoutUrl && (
                        <div className="mt-6 w-full max-w-sm">
                          <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20">
                            <a href={qrData.checkoutUrl} target="_blank" rel="noopener noreferrer">
                              Buka Link Pembayaran <ExternalLink className="w-4 h-4 ml-2" />
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
