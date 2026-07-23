import { Link } from "react-router";
import { Gamepad2, MessageCircle, Send, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0B0F19] relative overflow-hidden mt-12">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#FF6B00]/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-t from-[#FFB800]/10 to-transparent blur-[120px] pointer-events-none rounded-full" />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 shrink-0 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#FFB800] flex items-center justify-center shadow-[0_0_20px_rgba(255,107,0,0.5)] group-hover:scale-105 transition-transform">
                <Gamepad2 className="h-5 w-5 text-black" />
              </div>
              <span className="hidden sm:inline text-xl font-black tracking-tight text-white uppercase">
                Topup<span className="text-[#FF6B00]">.Kryz-net</span>
              </span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs font-medium">
              Panel penyedia layanan topup games terlaris, murah, aman legal 100% buka 24 jam dengan channel pembayaran terlengkap.
            </p>
            <div className="flex gap-3 pt-2">
              <SocialLink href="https://wa.me/60137345871" icon={<MessageCircle className="h-4 w-4" />} label="WhatsApp" />
              <SocialLink href="https://t.me/KryzNet" icon={<Send className="h-4 w-4" />} label="Telegram" />
              <SocialLink href="https://instagram.com/kryz.technz" icon={<Instagram className="h-4 w-4" />} label="Instagram" />
            </div>
          </div>

          <div>
            <h4 className="font-black mb-4 text-[10px] uppercase tracking-[0.2em] text-white/40">Navigasi</h4>
            <ul className="space-y-3 text-xs font-bold tracking-wider">
              <li><Link to="/" className="text-white/60 hover:text-[#FF6B00] transition-colors flex items-center gap-2 uppercase"><span className="h-1 w-1 rounded-full bg-[#FF6B00]/50" /> Beranda</Link></li>
              <li><Link to="/products" className="text-white/60 hover:text-[#FF6B00] transition-colors flex items-center gap-2 uppercase"><span className="h-1 w-1 rounded-full bg-[#FF6B00]/50" /> Semua Produk</Link></li>
              <li><Link to="/cek-transaksi" className="text-white/60 hover:text-[#FF6B00] transition-colors flex items-center gap-2 uppercase"><span className="h-1 w-1 rounded-full bg-[#FF6B00]/50" /> Cek Pesanan</Link></li>
              <li><Link to="/leaderboard" className="text-white/60 hover:text-[#FF6B00] transition-colors flex items-center gap-2 uppercase"><span className="h-1 w-1 rounded-full bg-[#FF6B00]/50" /> Leaderboard</Link></li>
              <li><Link to="/docs" className="text-white/60 hover:text-[#FF6B00] transition-colors flex items-center gap-2 uppercase"><span className="h-1 w-1 rounded-full bg-[#FF6B00]/50" /> Dokumentasi API</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black mb-4 text-[10px] uppercase tracking-[0.2em] text-white/40">Metode Pembayaran</h4>
            <div className="flex flex-wrap gap-2">
              {["QRIS", "Dana", "OVO", "GoPay", "ShopeePay", "BRI", "BCA", "Mandiri", "BNI"].map((method) => (
                <span key={method} className="px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/50 hover:bg-[#FF6B00]/10 hover:text-[#FFB800] hover:border-[#FF6B00]/30 transition-all cursor-default">
                  {method}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-black mb-4 text-[10px] uppercase tracking-[0.2em] text-white/40">Hubungi Kami</h4>
            <ul className="space-y-3 text-xs font-bold tracking-wider text-white/60">
              <li>
                <a href="https://wa.me/60137345871" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-[#FF6B00] transition-colors group uppercase">
                  <div className="h-8 w-8 rounded-lg bg-white/[0.02] border border-white/10 flex items-center justify-center group-hover:bg-[#FF6B00]/20 group-hover:border-[#FF6B00]/30 transition-all text-white/60 group-hover:text-[#FF6B00]">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  WhatsApp: +60 13-734 5871
                </a>
              </li>
              <li>
                <a href="https://t.me/KryzNet" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-[#FF6B00] transition-colors group uppercase">
                  <div className="h-8 w-8 rounded-lg bg-white/[0.02] border border-white/10 flex items-center justify-center group-hover:bg-[#FF6B00]/20 group-hover:border-[#FF6B00]/30 transition-all text-white/60 group-hover:text-[#FF6B00]">
                    <Send className="h-4 w-4" />
                  </div>
                  Telegram: @KryzNet
                </a>
              </li>
              <li>
                <a href="https://instagram.com/kryz.technz" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-[#FF6B00] transition-colors group uppercase">
                  <div className="h-8 w-8 rounded-lg bg-white/[0.02] border border-white/10 flex items-center justify-center group-hover:bg-[#FF6B00]/20 group-hover:border-[#FF6B00]/30 transition-all text-white/60 group-hover:text-[#FF6B00]">
                    <Instagram className="h-4 w-4" />
                  </div>
                  @kryz.technz
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[9px] text-white/30 font-black uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Topup.Kryz-net. All Rights Reserved.
          </p>
          <div className="flex gap-6 text-[9px] font-black uppercase tracking-widest text-white/50">
            <Link to="/" className="hover:text-[#FFB800] transition-colors">Beranda</Link>
            <Link to="/leaderboard" className="hover:text-[#FFB800] transition-colors">Testimoni</Link>
            <Link to="/cek-transaksi" className="hover:text-[#FFB800] transition-colors">Cek Pesanan</Link>
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
      className="h-10 w-10 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center text-white/50 hover:text-[#FFB800] hover:border-[#FF6B00]/30 hover:bg-[#FF6B00]/10 transition-all"
    >
      {icon}
    </a>
  );
}
