import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useCurrency } from "@/providers/CurrencyProvider";
import {
  LayoutDashboard,
  Receipt,
  ArrowLeftRight,
  BarChart3,
  Settings,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Home,
  Zap,
  Wallet,
  Bell,
  Clock,
  TrendingUp,
  HelpCircle,
  ChevronDown,
  Sparkles,
  Shield,
  Gift,
  MessageCircle,
  Star,
  Crown,
  Gamepad2,
  Key,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const navItems = [
  { 
    path: "/dashboard", 
    label: "Dashboard", 
    icon: LayoutDashboard,
    description: "Ringkasan akun",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  { 
    path: "/dashboard/transactions", 
    label: "Transaksi", 
    icon: Receipt,
    description: "Riwayat order",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  { 
    path: "/dashboard/mutasi", 
    label: "Mutasi Saldo", 
    icon: ArrowLeftRight,
    description: "Riwayat saldo",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  { 
    path: "/dashboard/reports", 
    label: "Laporan", 
    icon: BarChart3,
    description: "Analisis & statistik",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  { 
    path: "/dashboard/api", 
    label: "API Settings", 
    icon: Key,
    description: "Kelola API Key",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  { 
    path: "/dashboard/settings", 
    label: "Pengaturan", 
    icon: Settings,
    description: "Preferensi akun",
    color: "text-slate-500",
    bg: "bg-slate-500/10",
  },
];

const quickLinks = [
  { path: "/", label: "Beranda", icon: Home, external: false },
  { path: "/products", label: "Top Up", icon: Zap, external: false },
  { path: "/deposit", label: "Deposit", icon: Wallet, external: false },
  { path: "/leaderboard", label: "Leaderboard", icon: Crown, external: false },
  { path: "/docs", label: "API Docs", icon: Key, external: false },
];

/* ─────────────────────────────────────────────
   GREETING HELPER
───────────────────────────────────────────── */
function getGreeting(): { text: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Selamat Pagi", emoji: "🌅" };
  if (hour < 15) return { text: "Selamat Siang", emoji: "☀️" };
  if (hour < 18) return { text: "Selamat Sore", emoji: "🌤️" };
  return { text: "Selamat Malam", emoji: "🌙" };
}

/* ─────────────────────────────────────────────
   NOTIFICATION PANEL (Mock)
───────────────────────────────────────────── */
function NotificationPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  const notifications = [
    { id: 1, title: "Top Up Berhasil", desc: "Saldo Rp 50.000 berhasil ditambahkan", time: "5 menit lalu", unread: true, color: "bg-green-500" },
    { id: 2, title: "Promo Baru!", desc: "Diskon 20% untuk top up MLBB", time: "1 jam lalu", unread: true, color: "bg-amber-500" },
    { id: 3, title: "Transaksi Sukses", desc: "Pembelian 86 Diamond selesai", time: "3 jam lalu", unread: false, color: "bg-blue-500" },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 w-80 bg-[#0B0A10]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] z-50 animate-in slide-in-from-top-2 fade-in duration-200">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm uppercase tracking-wider text-white">Notifikasi</h3>
            <Badge className="text-[10px] bg-[#8B5CF6] text-black font-black uppercase tracking-widest border-none">3 Baru</Badge>
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto custom-scrollbar">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer group ${
                notif.unread ? "bg-white/[0.01]" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 shadow-[0_0_10px_currentColor] ${notif.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white uppercase tracking-tight group-hover:text-[#D946EF] transition-colors">{notif.title}</p>
                  <p className="text-[10px] font-medium text-white/50 mt-1 line-clamp-2 leading-relaxed">{notif.desc}</p>
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-2">{notif.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-white/10">
          <Button variant="ghost" size="sm" className="w-full text-[10px] font-black uppercase tracking-widest text-[#8B5CF6] hover:text-[#D946EF] hover:bg-white/[0.02]">
            Lihat Semua Notifikasi
          </Button>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   USER MENU DROPDOWN
───────────────────────────────────────────── */
function UserMenuDropdown({ 
  isOpen, 
  onClose, 
  user, 
  onLogout 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  user: any; 
  onLogout: () => void;
}) {
  const navigate = useNavigate();
  
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 w-56 bg-[#0B0A10]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] z-50 animate-in slide-in-from-top-2 fade-in duration-200">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#D946EF] flex items-center justify-center text-sm font-black text-black shadow-[0_0_15px_rgba(255,107,0,0.3)]">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white uppercase tracking-tight truncate">{user?.name || "User"}</p>
              <p className="text-[9px] font-black text-white/50 uppercase tracking-widest truncate mt-0.5">{user?.email || "user@email.com"}</p>
            </div>
          </div>
        </div>
        <div className="p-2">
          {[
            { label: "Profile", icon: User, path: "/dashboard/settings" },
            { label: "Bantuan", icon: HelpCircle, action: () => toast.info("Pusat bantuan segera hadir!") },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => {
                onClose();
                if (item.path) navigate(item.path);
                if (item.action) item.action();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/[0.02] transition-colors group"
            >
              <item.icon className="h-4 w-4 group-hover:text-[#8B5CF6] transition-colors" />
              {item.label}
            </button>
          ))}
        </div>
        <div className="p-2 border-t border-white/10">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { formatPrice } = useCurrency();
  
  // State
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved === "true";
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Save collapsed state
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(collapsed));
  }, [collapsed]);

  // Scroll detection for top bar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handlers
  const handleLogout = useCallback(() => {
    logout();
    toast.success("Berhasil keluar");
  }, [logout]);

  const toggleCollapse = useCallback(() => {
    setCollapsed(prev => !prev);
  }, []);

  // Computed values
  const greeting = useMemo(() => getGreeting(), []);
  const userData = (user as any) || {};
  const firstName = userData.name?.split(" ")[0] || "User";
  const hasNotifications = true; // Mock

  const currentPage = useMemo(() => {
    return navItems.find((item) => item.path === location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#0B0A10] text-white selection:bg-[#8B5CF6]/30 selection:text-white">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:sticky top-0 z-50 h-screen ${
          collapsed ? "w-[72px]" : "w-64"
        } border-r border-white/10 bg-[#0B0A10]/80 backdrop-blur-xl shrink-0 transition-all duration-300 flex flex-col overflow-y-auto`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#D946EF] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(255,107,0,0.3)]">
              <Gamepad2 className="h-5 w-5 text-black" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-black uppercase tracking-tight text-white">NickStore</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/50">Member Area</p>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-white lg:hidden transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {!collapsed && (
            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] px-3 mb-3 mt-2">
              Menu Utama
            </p>
          )}
          
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? "bg-[#8B5CF6]/10 text-white shadow-[0_0_15px_rgba(255,107,0,0.1)] border border-[#8B5CF6]/20"
                    : "text-white/60 hover:text-white hover:bg-white/[0.02]"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                  isActive ? "bg-gradient-to-br from-[#8B5CF6] to-[#D946EF] text-black shadow-[0_0_10px_rgba(255,107,0,0.3)]" : "bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white"
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                
                {!collapsed && (
                  <>
                    <div className="min-w-0">
                      <span className="truncate block text-xs font-bold uppercase tracking-tight">{item.label}</span>
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-widest truncate block mt-0.5">
                        {item.description}
                      </span>
                    </div>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D946EF] shadow-[0_0_5px_rgba(255,184,0,0.5)]" />
                    )}
                  </>
                )}
                
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#8B5CF6] to-[#D946EF] rounded-r-full shadow-[0_0_10px_rgba(255,107,0,0.5)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Links */}
        {!collapsed && (
          <div className="px-3 pb-3">
            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] px-3 mb-3">
              Quick Links
            </p>
            <div className="space-y-1">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/[0.02] transition-colors group"
                  >
                    <Icon className="h-4 w-4 text-white/40 group-hover:text-[#8B5CF6] transition-colors" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              
              {/* WhatsApp Support */}
              <a
                href="https://wa.me/60137345871"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors group"
              >
                <MessageCircle className="h-4 w-4 text-white/40 group-hover:text-emerald-400 transition-colors" />
                <span>Bantuan</span>
              </a>
            </div>
          </div>
        )}

        {/* Collapsed Quick Actions */}
        {collapsed && (
          <div className="px-2 pb-3 space-y-1">
            {quickLinks.slice(0, 3).map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center justify-center p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.02] transition-colors"
                  title={link.label}
                >
                  <Icon className="h-4 w-4" />
                </Link>
              );
            })}
          </div>
        )}

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full group"
            title={collapsed ? "Keluar" : undefined}
          >
            <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
              <LogOut className="h-4 w-4 shrink-0" />
            </div>
            {!collapsed && <span>Keluar</span>}
          </button>
          
          {/* Collapse Toggle */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex items-center justify-center w-full py-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.02] transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest ml-1.5">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className={`sticky top-0 z-30 transition-all duration-300 ${
          isScrolled 
            ? "bg-[#0B0A10]/90 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]" 
            : "bg-transparent border-b border-transparent"
        }`}>
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            {/* Left Section */}
            <div className="flex items-center gap-4 min-w-0">
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(true)}
                className="p-2 rounded-lg hover:bg-white/10 text-white lg:hidden transition-colors"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Page Info */}
              <div className="hidden sm:block min-w-0">
                <div className="flex items-center gap-3">
                  {currentPage && (
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#D946EF] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,107,0,0.3)]`}>
                      <currentPage.icon className={`h-5 w-5 text-black`} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                      <span>{greeting.emoji}</span>
                      {greeting.text}, <span className="text-white">{firstName}</span>
                    </p>
                    <h1 className="text-lg font-black uppercase tracking-tight text-white truncate mt-0.5">
                      {currentPage?.label || "Dashboard"}
                    </h1>
                  </div>
                </div>
              </div>
              
              {/* Mobile title */}
              <div className="sm:hidden">
                <h1 className="text-lg font-black uppercase tracking-tight text-white">{currentPage?.label || "Dashboard"}</h1>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Balance Badge */}
              {userData.accountBalance !== undefined && (
                <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 hover:bg-[#8B5CF6]/20 transition-all cursor-pointer shadow-[0_0_15px_rgba(255,107,0,0.1)] group"
                  onClick={() => navigate("/deposit")}
                >
                  <Wallet className="h-4 w-4 text-[#D946EF]" />
                  <span className="text-[11px] font-black text-white uppercase tracking-wider">
                    {formatPrice(userData.accountBalance, userData.balanceIdr)}
                  </span>
                  <ChevronRight className="h-3 w-3 text-[#D946EF] group-hover:translate-x-1 transition-transform" />
                </div>
              )}

              {/* Notifications */}
              <div className="relative">
                <button 
                  className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowUserMenu(false);
                  }}
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4 text-white" />
                  {hasNotifications && (
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#8B5CF6] shadow-[0_0_5px_rgba(255,107,0,0.8)] animate-pulse" />
                  )}
                </button>
                <NotificationPanel 
                  isOpen={showNotifications} 
                  onClose={() => setShowNotifications(false)} 
                />
              </div>

              {/* User Avatar & Menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 p-1.5 pl-2 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                  aria-label="User menu"
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#D946EF] flex items-center justify-center text-xs font-black text-black shadow-[0_0_15px_rgba(255,107,0,0.3)]">
                    {userData.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="hidden lg:block text-left min-w-0 pr-1">
                    <p className="text-xs font-bold text-white uppercase tracking-tight truncate max-w-[80px]">
                      {firstName}
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#D946EF]">Member</p>
                  </div>
                  <ChevronDown className="hidden lg:block h-3 w-3 text-white/50" />
                </button>
                <UserMenuDropdown 
                  isOpen={showUserMenu} 
                  onClose={() => setShowUserMenu(false)} 
                  user={userData} 
                  onLogout={handleLogout}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-6 animate-in fade-in duration-300">
          {children}
        </div>
      </main>
    </div>
  );
}