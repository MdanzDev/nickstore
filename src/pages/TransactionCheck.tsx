import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useCurrency } from "@/providers/CurrencyProvider";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

export default function TransactionCheck() {
  const [invoice, setInvoice] = useState("");
  const navigate = useNavigate();
  const { formatPrice, exchangeRate } = useCurrency();

  const { data: latestTransactions, isLoading: isTransactionsLoading } = trpc.orders.getLatestPublicTransactions.useQuery(
    undefined,
    { refetchInterval: 30000 } // Refetch every 30s
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice.trim()) {
      toast.error("Masukkan nomor invoice");
      return;
    }
    navigate(`/order/${invoice.trim()}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "sukses":
      case "success":
      case "completed":
      case "delivered":
        return <Badge className="bg-[#00c864]/10 text-[#00c864] border-[#00c864]/30 rounded-full px-4 shadow-[0_0_10px_rgba(0,200,100,0.1)] text-[9px] font-black uppercase tracking-widest">SUCCESS</Badge>;
      case "pending":
        return <Badge className="bg-[#D946EF]/10 text-[#D946EF] border-[#D946EF]/30 rounded-full px-4 shadow-[0_0_10px_rgba(255,184,0,0.1)] text-[9px] font-black uppercase tracking-widest">PENDING</Badge>;
      case "proses":
      case "processing":
      case "confirmed":
      case "shipped":
        return <Badge className="bg-[#41B5FE]/10 text-[#41B5FE] border-[#41B5FE]/30 rounded-full px-4 shadow-[0_0_10px_rgba(65,181,254,0.1)] text-[9px] font-black uppercase tracking-widest">PROCESSING</Badge>;
      case "gagal":
      case "failed":
      case "cancelled":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/30 rounded-full px-4 shadow-[0_0_10px_rgba(239,68,68,0.1)] text-[9px] font-black uppercase tracking-widest">FAILED</Badge>;
      case "refund":
        return <Badge className="bg-[#D946EF]/10 text-[#D946EF] border-[#D946EF]/30 rounded-full px-4 shadow-[0_0_10px_rgba(255,184,0,0.1)] text-[9px] font-black uppercase tracking-widest">REFUND</Badge>;
      default:
        return <Badge variant="outline" className="rounded-full px-4 border-white/20 text-white/70 text-[9px] font-black uppercase tracking-widest">{status?.toUpperCase()}</Badge>;
    }
  };

  return (
    <div className="min-h-[80vh] py-16 px-4 bg-[#0B0A10] text-white relative">
      {/* Premium Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#8B5CF6]/10 to-transparent rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#D946EF]/10 to-transparent rounded-full blur-[100px] mix-blend-screen" />
      </div>

      {/* Search Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto mb-16 relative z-10"
      >
        <Tabs defaultValue="invoice" className="w-full">
          <TabsList className="w-full bg-transparent border-b border-white/5 rounded-none h-12 mb-8 justify-start space-x-8 px-0">
            <TabsTrigger 
              value="invoice" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#8B5CF6] data-[state=active]:text-white text-white/50 rounded-none px-0 pb-3 transition-all font-black uppercase tracking-widest text-xs"
            >
              Invoice Number
            </TabsTrigger>
            <TabsTrigger 
              value="whatsapp" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#8B5CF6] data-[state=active]:text-white text-white/50 rounded-none px-0 pb-3 transition-all font-black uppercase tracking-widest text-xs"
            >
              WhatsApp Number
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invoice">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8 bg-[#0B0A10]/80 border border-white/10 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-[2rem] relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#8B5CF6]/20 to-[#D946EF]/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2" />
                
                <form onSubmit={handleSearch} className="space-y-6 relative z-10">
                  <div className="space-y-2">
                    <Label htmlFor="invoice" className="text-[10px] font-black uppercase tracking-widest text-white/70">Invoice Number</Label>
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 group-focus-within:text-[#8B5CF6] transition-colors" />
                      <Input
                        id="invoice"
                        placeholder="Contoh: INV-123456789"
                        value={invoice}
                        onChange={(e) => setInvoice(e.target.value)}
                        className="bg-white/[0.02] border-white/10 h-14 pl-12 text-lg rounded-xl focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]/50 transition-all text-white placeholder:text-white/20"
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] hover:scale-[1.02] text-black h-14 rounded-xl text-sm font-black uppercase tracking-widest shadow-[0_0_20px_rgba(255,107,0,0.4)] transition-all border-0"
                  >
                    Cari Invoice
                  </Button>
                </form>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="whatsapp">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-12 bg-[#0B0A10]/80 border border-white/10 backdrop-blur-xl rounded-[2rem] text-center shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                <div className="py-8">
                  <h3 className="text-xl font-black text-white uppercase tracking-widest mb-3">Segera Hadir</h3>
                  <p className="text-white/50 text-sm font-medium leading-relaxed">
                    Pencarian dengan nomor WhatsApp sedang dalam pengembangan untuk menjaga privasi pengguna.
                  </p>
                </div>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Real-Time Transactions Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-5xl mx-auto relative z-10"
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
            Real-Time Transactions
          </h2>
          <p className="text-white/50 text-sm font-bold uppercase tracking-widest">
            Pesanan terbaru yang masuk ke sistem kami
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[#0B0A10]/80 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-[700px]">
            <TableHeader className="border-b border-white/10 bg-white/[0.02]">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-white/40 font-black tracking-widest text-[9px] uppercase py-5">Tanggal</TableHead>
                <TableHead className="text-white/40 font-black tracking-widest text-[9px] uppercase py-5">Kategori</TableHead>
                <TableHead className="text-white/40 font-black tracking-widest text-[9px] uppercase py-5">Produk</TableHead>
                <TableHead className="text-white/40 font-black tracking-widest text-[9px] uppercase py-5">Harga</TableHead>
                <TableHead className="text-white/40 font-black tracking-widest text-[9px] uppercase py-5">No. Invoice</TableHead>
                <TableHead className="text-white/40 font-black tracking-widest text-[9px] uppercase py-5 text-right pr-8">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {isTransactionsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#8B5CF6]" />
                    </TableCell>
                  </TableRow>
                ) : latestTransactions && latestTransactions.length > 0 ? (
                  latestTransactions
                    .filter((tx: any) => !['failed', 'gagal', 'refund', 'refunded', 'batal'].includes(tx.status?.toLowerCase()))
                    .map((tx: any, idx: number) => (
                    <motion.tr 
                      key={tx.id || idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                    >
                      <TableCell className="text-[10px] font-bold text-white/50 uppercase tracking-widest py-5">
                        {new Date(tx.created_at).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        }).replace(/\./g, ":")}
                      </TableCell>
                      <TableCell className="text-xs font-black text-white/80 uppercase tracking-widest py-5">
                        {(tx.game_slug || "").split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-white py-5">{tx.service_name}</TableCell>
                      <TableCell className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] py-5">
                        {formatPrice(tx.price_myr, tx.price_idr || (tx.price_myr ? tx.price_myr * exchangeRate : 0))}
                      </TableCell>
                      <TableCell className="text-[11px] font-mono text-white/60 py-5">
                        {tx.invoice_masked}
                      </TableCell>
                      <TableCell className="text-right pr-8 py-5">
                        {getStatusBadge(tx.status)}
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center text-white/40 text-sm font-bold uppercase tracking-widest">
                      Belum ada transaksi real-time
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
            </TableBody>
            </Table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
