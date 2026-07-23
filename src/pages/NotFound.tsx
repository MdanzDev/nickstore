import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Gamepad2,
  Home,
  ArrowLeft,
  Search,
  ShoppingCart,
  MessageCircle,
  Zap,
  Ghost,
  Compass,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function NotFound() {
  const [glitchText, setGlitchText] = useState("404");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const chars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
      const randomChar = chars[Math.floor(Math.random() * chars.length)];
      const position = Math.floor(Math.random() * 3);
      const newText = glitchText.split("");
      newText[position] = randomChar;
      setGlitchText(newText.join(""));
      setTimeout(() => setGlitchText("404"), 100);
    }, 3000);

    return () => clearInterval(interval);
  }, [glitchText]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const quickLinks = [
    { to: "/", label: "Beranda", icon: Home, color: "text-[#00c864]" },
    { to: "/products", label: "Produk", icon: ShoppingCart, color: "text-[#D946EF]" },
    { to: "/deposit", label: "Top Up", icon: Zap, color: "text-primary" },
    { to: "/cek-transaksi", label: "Cek Transaksi", icon: Search, color: "text-purple-500" },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden bg-[#0B0A10]">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(139,92,246,0.08)_0%,transparent_70%)] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(139,92,246,0.08)_0%,transparent_70%)] rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Floating Ghost Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        {Array.from({ length: 5 }).map((_, i) => (
          <Ghost
            key={i}
            className="absolute text-white/10 animate-bounce"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${10 + Math.random() * 80}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              fontSize: `${20 + Math.random() * 30}px`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
      </div>

      {/* Mouse Follow Glow */}
      <div
        className="fixed w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none transition-transform duration-1000"
        style={{
          left: mousePos.x - 200,
          top: mousePos.y - 200,
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* Glitchy 404 */}
        <div className="relative mb-6">
          <h1
            className="text-[10rem] md:text-[12rem] font-black leading-none select-none text-transparent bg-clip-text bg-gradient-to-br from-primary via-yellow-500 to-primary animate-pulse"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {glitchText}
          </h1>
          <div className="absolute inset-0 flex items-center justify-center drop-shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            <Gamepad2 className="h-20 w-20 md:h-24 md:w-24 text-primary/20 animate-spin" style={{ animationDuration: "8s" }} />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3 mb-10">
          <h2 className="text-3xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Level Not Found!</h2>
          <p className="text-white/60 max-w-sm mx-auto text-sm leading-relaxed">
            Sepertinya kamu tersesat di dungeon yang salah. Halaman yang kamu cari tidak ditemukan atau sudah dipindahkan.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Button asChild size="lg" className="group bg-gradient-to-r from-primary to-[#D946EF] hover:from-primary/90 hover:to-[#D946EF]/90 text-black font-bold border-0 shadow-[0_0_30px_rgba(139,92,246,0.3)] h-12 rounded-xl transition-all hover:scale-105">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="group bg-white/5 border-white/10 hover:bg-white/10 text-white h-12 rounded-xl transition-all hover:scale-105">
            <Link to="/products">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Lihat Produk
            </Link>
          </Button>
        </div>

        {/* Quick Links */}
        <Card className="p-5 bg-white/[0.02] border-white/5 backdrop-blur-xl shadow-2xl rounded-[24px]">
          <p className="text-xs text-white/50 mb-4 flex items-center justify-center gap-2 font-semibold uppercase tracking-widest">
            <Compass className="h-3.5 w-3.5 text-primary" />
            Mungkin kamu mencari:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group border border-transparent hover:border-white/10"
              >
                <div className="h-10 w-10 rounded-lg bg-black/40 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                  <link.icon className={`h-4 w-4 ${link.color}`} />
                </div>
                <span className="text-[10px] text-white/60 font-semibold group-hover:text-white transition-colors">
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </Card>

        {/* Help */}
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-white/50 bg-white/5 mx-auto w-max px-4 py-2 rounded-full border border-white/5">
          <MessageCircle className="h-4 w-4" />
          <span>Butuh bantuan?</span>
          <a
            href="https://wa.me/60137345871"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-[#D946EF] font-bold transition-colors"
          >
            Chat Admin
          </a>
        </div>
      </div>
    </div>
  );
}