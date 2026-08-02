import { Link } from "react-router";
import { Gamepad2, MessageCircle, Send, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-[#F6EFDF] relative overflow-hidden mt-12">
      {/* Decorative warm gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-amber-100/60 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-t from-amber-200/50 to-transparent blur-[120px] pointer-events-none rounded-full" />

      <div className="container mx-auto px-4 py-10 sm:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 shrink-0 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-[0_4px_12px_rgba(249,115,22,0.35)] group-hover:scale-105 transition-transform">
                <Gamepad2 className="h-5 w-5 text-white" />
              </div>
              <span className="hidden sm:inline text-xl font-extrabold tracking-tight text-foreground uppercase">
                Nick<span className="text-primary">Store</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs font-medium">
              Panel penyedia layanan topup games terlaris, murah, aman legal 100% buka 24 jam dengan channel pembayaran terlengkap.
            </p>
            <div className="flex gap-3 pt-2">
              <SocialLink href="https://wa.me/60137345871" icon={<MessageCircle className="h-4 w-4" />} label="WhatsApp" />
              <SocialLink href="https://t.me/KryzNet" icon={<Send className="h-4 w-4" />} label="Telegram" />
              <SocialLink href="https://instagram.com/kryz.technz" icon={<Instagram className="h-4 w-4" />} label="Instagram" />
            </div>
          </div>

          <div>
            <h4 className="font-black mb-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Navigasi</h4>
            <ul className="space-y-3 text-xs font-bold tracking-wider">
              <li><Link to="/" className="text-foreground/60 hover:text-primary transition-colors flex items-center gap-2 uppercase"><span className="h-1 w-1 rounded-full bg-primary/50" /> Beranda</Link></li>
              <li><Link to="/products" className="text-foreground/60 hover:text-primary transition-colors flex items-center gap-2 uppercase"><span className="h-1 w-1 rounded-full bg-primary/50" /> Semua Produk</Link></li>
              <li><Link to="/cek-transaksi" className="text-foreground/60 hover:text-primary transition-colors flex items-center gap-2 uppercase"><span className="h-1 w-1 rounded-full bg-primary/50" /> Cek Pesanan</Link></li>
              <li><Link to="/leaderboard" className="text-foreground/60 hover:text-primary transition-colors flex items-center gap-2 uppercase"><span className="h-1 w-1 rounded-full bg-primary/50" /> Leaderboard</Link></li>
              <li><Link to="/docs" className="text-foreground/60 hover:text-primary transition-colors flex items-center gap-2 uppercase"><span className="h-1 w-1 rounded-full bg-primary/50" /> Dokumentasi API</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black mb-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Metode Pembayaran</h4>
            <div className="flex flex-wrap gap-2">
              {["QRIS", "Dana", "OVO", "GoPay", "ShopeePay", "BRI", "BCA", "Mandiri", "BNI"].map((method) => (
                <span key={method} className="px-3 py-1.5 rounded-lg bg-card border border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-amber-50 hover:text-primary hover:border-primary/30 transition-all cursor-default">
                  {method}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-black mb-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Hubungi Kami</h4>
            <ul className="space-y-3 text-xs font-bold tracking-wider text-foreground/70">
              <li>
                <a href="https://wa.me/60137345871" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors group uppercase">
                  <div className="h-8 w-8 rounded-lg bg-card border border-border flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/30 transition-all text-foreground/60 group-hover:text-primary">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  WhatsApp: +60 13-734 5871
                </a>
              </li>
              <li>
                <a href="https://t.me/KryzNet" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors group uppercase">
                  <div className="h-8 w-8 rounded-lg bg-card border border-border flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/30 transition-all text-foreground/60 group-hover:text-primary">
                    <Send className="h-4 w-4" />
                  </div>
                  Telegram: @KryzNet
                </a>
              </li>
              <li>
                <a href="https://instagram.com/kryz.technz" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors group uppercase">
                  <div className="h-8 w-8 rounded-lg bg-card border border-border flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/30 transition-all text-foreground/60 group-hover:text-primary">
                    <Instagram className="h-4 w-4" />
                  </div>
                  @kryz.technz
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[9px] text-muted-foreground/70 font-black uppercase tracking-widest">
            &copy; {new Date().getFullYear()} NickStore. All Rights Reserved.
          </p>
          <div className="flex gap-6 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Beranda</Link>
            <Link to="/leaderboard" className="hover:text-primary transition-colors">Testimoni</Link>
            <Link to="/cek-transaksi" className="hover:text-primary transition-colors">Cek Pesanan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/10 transition-all"
    >
      {icon}
    </a>
  );
}
