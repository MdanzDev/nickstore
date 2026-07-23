import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Code2,
  Ticket,
  Users,
  Package,
  Megaphone,
  Gamepad2,
  ChevronRight,
  Shield,
  ChevronLeft,
  Home,
  Menu,
  X,
  Zap,
  Eye,
  Settings,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { path: "/admin", label: "Overview", icon: LayoutDashboard, color: "#FF6B00" },
  { path: "/admin/orders", label: "Pesanan & Transaksi", icon: ShoppingCart, color: "#38BDF8" },
  { path: "/admin/products", label: "Katalog Produk & Game", icon: Package, color: "#34D399" },
  { path: "/admin/api-management", label: "Pengurusan API", icon: Code2, color: "#3B82F6" },
  { path: "/admin/users", label: "Pengguna", icon: Users, color: "#A78BFA" },
  { path: "/admin/vouchers", label: "Kupon & Pengumuman", icon: Ticket, color: "#FFB800" },
  { path: "/admin/settings", label: "Pengaturan", icon: Settings, color: "#94A3B8" },
];

const bottomLinks = [
  { path: "/", label: "Beranda", icon: Home },
  { path: "/products", label: "Lihat Produk", icon: Eye },
];

// Liquid glass CSS injected once
const LIQUID_GLASS_STYLE = `
  .lg-panel {
    background: rgba(255,255,255,0.02);
    backdrop-filter: blur(24px) saturate(1.8);
    -webkit-backdrop-filter: blur(24px) saturate(1.8);
    border: 1px solid rgba(255,255,255,0.05);
  }
  .lg-panel-strong {
    background: rgba(255,255,255,0.06);
    backdrop-filter: blur(40px) saturate(2);
    -webkit-backdrop-filter: blur(40px) saturate(2);
    border: 1px solid rgba(255,255,255,0.12);
  }
  .lg-sidebar {
    background: rgba(11,15,25,0.85);
    backdrop-filter: blur(48px) saturate(1.6);
    -webkit-backdrop-filter: blur(48px) saturate(1.6);
    border-right: 1px solid rgba(255,255,255,0.06);
  }
  .lg-nav-active {
    background: linear-gradient(135deg, rgba(255,107,0,0.15) 0%, rgba(255,184,0,0.08) 100%);
    border: 1px solid rgba(255,107,0,0.25);
    box-shadow: 0 0 20px rgba(255,107,0,0.08), inset 0 1px 0 rgba(255,255,255,0.1);
  }
  .lg-nav-item:hover {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
  }
  .lg-blob {
    filter: blur(80px);
    animation: lg-float 8s ease-in-out infinite;
    pointer-events: none;
  }
  .lg-blob-2 {
    filter: blur(100px);
    animation: lg-float 12s ease-in-out infinite reverse;
    pointer-events: none;
  }
  @keyframes lg-float {
    0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
    33% { transform: translateY(-30px) translateX(20px) scale(1.05); }
    66% { transform: translateY(20px) translateX(-15px) scale(0.95); }
  }
  .lg-shimmer {
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%);
    background-size: 200% 100%;
    animation: shimmer 3s linear infinite;
  }
  @keyframes shimmer {
    from { background-position: -200% 0; }
    to { background-position: 200% 0; }
  }
  .lg-card {
    background: rgba(255,255,255,0.02);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.05);
    box-shadow: 0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.02);
    transition: all 0.3s ease;
  }
  .lg-card:hover {
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.12);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
    transform: translateY(-1px);
  }
  .lg-input {
    background: rgba(255,255,255,0.04) !important;
    border: 1px solid rgba(255,255,255,0.08) !important;
    color: white !important;
    backdrop-filter: blur(8px);
  }
  .lg-input:focus {
    border-color: rgba(255,107,0,0.5) !important;
    box-shadow: 0 0 0 2px rgba(255,107,0,0.15) !important;
    background: rgba(255,255,255,0.06) !important;
    outline: none !important;
  }
  .lg-input::placeholder {
    color: rgba(255,255,255,0.3) !important;
  }
  .lg-btn-primary {
    background: linear-gradient(135deg, #FF6B00, #FFB800);
    color: black;
    font-weight: 700;
    border: none;
    box-shadow: 0 0 20px rgba(255,107,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
    transition: all 0.3s ease;
  }
  .lg-btn-primary:hover {
    box-shadow: 0 0 30px rgba(255,107,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3);
    transform: translateY(-1px);
    filter: brightness(1.1);
  }
  .lg-btn-ghost {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.7);
    backdrop-filter: blur(8px);
    transition: all 0.2s;
  }
  .lg-btn-ghost:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.15);
    color: white;
  }
  .lg-table-row:hover {
    background: rgba(255,255,255,0.03) !important;
  }
  .lg-badge-success { background: rgba(0,200,100,0.15); color: #00c864; border: 1px solid rgba(0,200,100,0.25); }
  .lg-badge-warning { background: rgba(255,184,0,0.15); color: #FFB800; border: 1px solid rgba(255,184,0,0.25); }
  .lg-badge-danger  { background: rgba(239,68,68,0.15); color: #EF4444; border: 1px solid rgba(239,68,68,0.25); }
  .lg-badge-info    { background: rgba(56,189,248,0.15); color: #38BDF8; border: 1px solid rgba(56,189,248,0.25); }
  .lg-badge-muted   { background: rgba(100,116,139,0.15); color: #94A3B8; border: 1px solid rgba(100,116,139,0.25); }
  .lg-separator { border-color: rgba(255,255,255,0.06); }
  .lg-label { color: rgba(255,255,255,0.5); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
  .lg-value { color: white; font-weight: 600; }
  select.lg-input option { background: #0c101e; color: white; }
  textarea.lg-input { background: rgba(255,255,255,0.04) !important; }
`;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, isLoading, user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, isLoading, navigate]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0B0F19" }}>
        <style>{LIQUID_GLASS_STYLE}</style>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl lg-card mx-auto flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-[#FF6B00] animate-pulse" />
          </div>
          <p className="text-white/50 text-sm">Memverifikasi akses admin...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const getBreadcrumb = () => {
    const currentItem = navItems.find((item) => item.path === location.pathname);
    return currentItem ? currentItem.label : "Admin";
  };

  const getCurrentIcon = () => {
    const currentItem = navItems.find((item) => item.path === location.pathname);
    if (currentItem) {
      const Icon = currentItem.icon;
      return <Icon className="h-4 w-4" style={{ color: currentItem.color }} />;
    }
    return <Shield className="h-4 w-4 text-[#FF6B00]" />;
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden" style={{ background: "#0B0F19" }}>
      <style>{LIQUID_GLASS_STYLE}</style>

      {/* Floating liquid blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="lg-blob absolute w-[700px] h-[700px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #FF6B00 0%, #FF4500 40%, transparent 70%)", top: "-15%", left: "20%" }} />
        <div className="lg-blob-2 absolute w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #6366F1 0%, #8B5CF6 40%, transparent 70%)", bottom: "0%", right: "10%" }} />
        <div className="lg-blob absolute w-[400px] h-[400px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #38BDF8 0%, #0EA5E9 40%, transparent 70%)", top: "50%", left: "-5%", animationDelay: "4s" }} />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <div className="relative z-10 flex min-h-[calc(100vh-4rem)]">
        {/* Mobile overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        )}

        {/* Sidebar */}
        <aside
          className={`${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:sticky top-0 z-50 h-screen ${collapsed ? "w-[72px]" : "w-64"} lg-sidebar shrink-0 transition-all duration-300 flex flex-col overflow-hidden`}
        >
          {/* Logo area */}
          <div className={`p-4 flex items-center gap-3 border-b lg-separator relative ${collapsed ? "justify-center" : ""}`}>
            <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(255,107,0,0.4)]"
              style={{ background: "linear-gradient(135deg, #FF6B00, #FFB800)" }}>
              <Shield className="h-5 w-5 text-black" />
            </div>
            {!collapsed && (
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-white">Admin Panel</p>
                <p className="text-[9px] text-white/40 font-bold tracking-wider mt-0.5">Topup.Kryz-net</p>
              </div>
            )}
            <button onClick={() => setMobileOpen(false)} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/10 lg:hidden text-white/50">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Nav label */}
          {!collapsed && (
            <div className="px-4 pt-4 pb-1">
              <p className="lg-label">Navigation</p>
            </div>
          )}

          {/* Nav items */}
          <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={`lg-nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border border-transparent ${isActive ? "lg-nav-active text-white" : "text-white/50 hover:text-white"} ${collapsed ? "justify-center" : ""}`}
                >
                  <Icon className="h-4 w-4 shrink-0" style={{ color: isActive ? item.color : undefined }} />
                  {!collapsed && <span className="truncate text-[12px] font-bold tracking-wide">{item.label}</span>}
                  {isActive && !collapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className={`p-2 border-t lg-separator space-y-0.5`}>
            {!collapsed && <p className="lg-label px-3 pb-1">Quick Links</p>}
            {bottomLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.path} to={link.path}
                  className={`lg-nav-item flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-white/40 hover:text-white transition-all border border-transparent ${collapsed ? "justify-center" : ""}`}>
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {!collapsed && <span className="font-bold tracking-wide">{link.label}</span>}
                </Link>
              );
            })}
            {/* User + Logout */}
            {user && !collapsed && (
              <div className="mt-2 pt-2 border-t lg-separator">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl">
                  <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-black text-black shrink-0 shadow-[0_0_10px_rgba(255,107,0,0.4)]"
                    style={{ background: "linear-gradient(135deg, #FF6B00, #FFB800)" }}>
                    {(user as any).name?.charAt(0)?.toUpperCase() || "A"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-white truncate">{(user as any).name || "Admin"}</p>
                    <p className="text-[9px] text-white/40">Administrator</p>
                  </div>
                  <button onClick={logout} className="p-1 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors">
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
            {/* Collapse toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`hidden lg:flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs text-white/30 hover:text-white hover:bg-white/5 transition-all border border-transparent ${collapsed ? "justify-center" : ""}`}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 flex flex-col">
          {/* Top Bar */}
          <div className="sticky top-0 z-30 lg-panel border-b lg-separator">
            <div className="flex items-center justify-between px-4 lg:px-6 py-3">
              <div className="flex items-center gap-3">
                <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-lg hover:bg-white/10 lg:hidden text-white/60">
                  <Menu className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2">
                  {getCurrentIcon()}
                  <div className="h-4 w-px bg-white/10 hidden sm:block" />
                  <h1 className="text-sm font-black uppercase tracking-widest text-white hidden sm:block">{getBreadcrumb()}</h1>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[#FF6B00] bg-[#FF6B00]/10 border border-[#FF6B00]/20 px-2.5 py-1 rounded-full">
                    <Zap className="h-2.5 w-2.5" /> Admin Mode
                  </span>
                </div>
                {user && (
                  <div className="flex items-center gap-2 pl-3 border-l lg-separator">
                    <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-black text-black shrink-0 shadow-[0_0_10px_rgba(255,107,0,0.3)]"
                      style={{ background: "linear-gradient(135deg, #FF6B00, #FFB800)" }}>
                      {(user as any).name?.charAt(0)?.toUpperCase() || "A"}
                    </div>
                    <div className="hidden sm:block text-right">
                      <p className="text-xs font-bold text-white truncate max-w-[100px]">{(user as any).name || "Admin"}</p>
                      <p className="text-[9px] text-white/40">Administrator</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Shimmer bar */}
            <div className="h-px lg-shimmer" />
          </div>

          {/* Page Content */}
          <div className="flex-1 p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}