import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate, useLocation } from "react-router";
import { trpc } from "@/providers/trpc";
import { useCurrency } from "@/providers/CurrencyProvider";
import {
  Gamepad2,
  FileText,
  Trophy,
  Search,
  User,
  LogOut,
  LayoutDashboard,
  Shield,
  ChevronDown,
  Wallet,
  Menu,
  X,
  Bell,
  Gift,
  Newspaper,
  ShoppingCart,
  Check,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect, useCallback, memo, useRef } from "react";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const NAV_LINKS = [
  { to: "/", label: "Topup", icon: Gamepad2 },
  { to: "/products", label: "Produk", icon: ShoppingCart },
  { to: "/daftar-harga", label: "Daftar Harga", icon: Tag },
  { to: "/cek-transaksi", label: "Cek Transaksi", icon: FileText },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/artikel", label: "Artikel", icon: Newspaper },
];

/* ─────────────────────────────────────────────
   SUB‑COMPONENTS
───────────────────────────────────────────── */
const NavLinkItem = memo(function NavLinkItem({
  to,
  label,
  icon: Icon,
  isActive,
  onClick,
  className,
}: {
  to: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group relative flex items-center gap-1.5 px-2.5 xl:px-4 py-2 text-[10px] xl:text-xs font-black uppercase tracking-wider whitespace-nowrap rounded-full transition-all duration-300 ${
        isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
      } ${className ?? ""}`}
      aria-current={isActive ? "page" : undefined}
    >
      {isActive && (
        <span className="absolute inset-0 rounded-full bg-primary/10 border border-primary/20" />
      )}
      <Icon
        className={`h-4 w-4 relative z-10 transition-colors ${
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
        }`}
      />
      <span className="relative z-10">{label}</span>
    </Link>
  );
});

const UserMenu = memo(function UserMenu({
  user,
  isAdmin,
  formattedBalance,
  onLogout,
}: {
  user: { name?: string; email?: string };
  isAdmin: boolean;
  formattedBalance: string;
  onLogout: () => void;
}) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary transition-colors border border-transparent hover:border-border"
          aria-label="User menu"
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white text-xs font-black shadow-[0_2px_8px_rgba(249,115,22,0.4)]">
            {user.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <span className="hidden sm:inline text-xs font-bold tracking-wider text-foreground max-w-[80px] truncate uppercase">
            {user.name?.split(" ")[0]}
          </span>
          <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-60 mt-2 bg-card/95 backdrop-blur-xl border-border text-foreground shadow-[0_20px_40px_-16px_rgba(120,90,40,0.3)]"
      >
        <div className="px-4 py-4 border-b border-border">
          <p className="text-xs font-black uppercase tracking-widest text-foreground">{user.name}</p>
          <p className="text-[10px] text-muted-foreground truncate font-bold mt-1 tracking-wider">{user.email}</p>
          <div className="flex items-center gap-1.5 mt-3">
            <Wallet className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-[11px] font-black tracking-widest text-emerald-700 tabular-nums">
              {formattedBalance}
            </span>
          </div>
        </div>
        <div className="p-1">
          <DropdownMenuItem
            onClick={() => navigate("/dashboard")}
            className="gap-3 cursor-pointer focus:bg-secondary focus:text-foreground py-2"
          >
            <LayoutDashboard className="h-4 w-4 text-primary" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest">Dashboard</p>
              <p className="text-[9px] font-bold tracking-wider text-muted-foreground">Lihat ringkasan akun</p>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => navigate("/deposit")}
            className="gap-3 cursor-pointer focus:bg-secondary focus:text-foreground py-2"
          >
            <Wallet className="h-4 w-4 text-emerald-600" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest">Top Up Saldo</p>
              <p className="text-[9px] font-bold tracking-wider text-muted-foreground">Isi saldo via QRIS</p>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => navigate("/dashboard/transactions")}
            className="gap-3 cursor-pointer focus:bg-secondary focus:text-foreground py-2"
          >
            <FileText className="h-4 w-4 text-sky-600" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest">Transaksi</p>
              <p className="text-[9px] font-bold tracking-wider text-muted-foreground">Riwayat pesanan</p>
            </div>
          </DropdownMenuItem>

          {isAdmin && (
            <>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={() => navigate("/admin")}
                className="gap-3 cursor-pointer focus:bg-secondary focus:text-foreground py-2"
              >
                <Shield className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Admin Panel</p>
                  <p className="text-[9px] font-bold tracking-wider text-muted-foreground">Kelola website</p>
                </div>
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem
            onClick={() => navigate("/dashboard/settings")}
            className="gap-3 cursor-pointer focus:bg-secondary focus:text-foreground py-2"
          >
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-[10px] font-black uppercase tracking-widest">Pengaturan Akun</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onLogout}
            className="gap-3 cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50 py-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Keluar</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

/* ─────────────────────────────────────────────
   MAIN NAVBAR COMPONENT
───────────────────────────────────────────── */
export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { currency, setCurrency, formatPrice } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Balance auto‑refresh & error handling
  const { data: balanceData, error: balanceError } = trpc.rams.balance.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
      refetchInterval: 30000,
      refetchOnWindowFocus: true,
      staleTime: 10000,
      retry: false,
    }
  );

  // Logout on session expiry
  useEffect(() => {
    if (
      balanceError &&
      (balanceError.data?.httpStatus === 401 ||
        balanceError.message?.includes("Unauthorized"))
    ) {
      console.warn("Session expired, logging out.");
      logout();
    }
  }, [balanceError, logout]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Focus trap for mobile menu (optional)
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const liveBalanceMyr = balanceData?.data?.balance_myr ?? user?.balanceMyr ?? 0;
  const liveBalanceIdr = balanceData?.data?.balance_idr ?? user?.balanceIdr ?? 0;
  const formattedBalance = formatPrice(liveBalanceMyr, liveBalanceIdr);

  // Close mobile menu when clicking outside
  const handleMobileMenuClose = useCallback(() => setMobileOpen(false), []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "border-b border-border bg-background/85 backdrop-blur-2xl shadow-[0_8px_24px_-12px_rgba(120,90,40,0.18)]"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="container mx-auto flex h-[72px] items-center justify-between px-4 lg:px-8">
        {/* Logo + Desktop Nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 shrink-0 group" aria-label="Home">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-[0_4px_12px_rgba(249,115,22,0.35)] group-hover:shadow-[0_6px_20px_rgba(249,115,22,0.5)] transition-all duration-300">
              <Gamepad2 className="h-5 w-5 text-white" />
            </div>
            <span className="hidden sm:inline text-xl font-extrabold tracking-tight text-foreground">
              Nick<span className="text-primary">Store</span>
            </span>
          </Link>

          <nav
            className="hidden lg:flex items-center gap-0.5 xl:gap-1 bg-secondary/60 rounded-full px-1.5 py-1.5 border border-border/70 backdrop-blur-md shrink-0"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => (
              <NavLinkItem
                key={link.to}
                {...link}
                isActive={location.pathname === link.to}
              />
            ))}
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Promo Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/products")}
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 hover:bg-primary/10 rounded-lg border border-transparent hover:border-primary/20"
            aria-label="Promo"
          >
            <Gift className="h-4 w-4" />
            <span className="hidden 2xl:inline">Promo</span>
          </Button>

          {/* Currency Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5 px-2.5 h-9 rounded-lg border border-border bg-card text-foreground hover:bg-secondary hover:text-foreground"
              >
                <span className="text-[10px] font-black uppercase tracking-widest">{currency}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-28 mt-2 bg-card/95 backdrop-blur-xl border-border text-foreground shadow-[0_20px_40px_-16px_rgba(120,90,40,0.3)]"
            >
              <DropdownMenuItem
                onClick={() => setCurrency("MYR")}
                className="justify-between cursor-pointer focus:bg-secondary focus:text-foreground"
              >
                <span className="text-xs font-bold uppercase tracking-widest">RM (MYR)</span>
                {currency === "MYR" && <Check className="h-3.5 w-3.5 text-emerald-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setCurrency("IDR")}
                className="justify-between cursor-pointer focus:bg-secondary focus:text-foreground"
              >
                <span className="text-xs font-bold uppercase tracking-widest">Rp (IDR)</span>
                {currency === "IDR" && <Check className="h-3.5 w-3.5 text-emerald-600" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Auth Section */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-1">
              {/* Notification Bell */}
              <button
                className="relative p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Notifications (unread)"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
              </button>

              {/* Balance Indicator */}
              <button
                onClick={() => navigate("/deposit")}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors text-[10px] font-black tracking-widest text-emerald-700 group uppercase"
                title="Klik untuk top up saldo"
                aria-label={`Saldo: ${formattedBalance}. Klik untuk top up.`}
              >
                <Wallet className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                <span className="tabular-nums">{formattedBalance}</span>
                <span
                  className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"
                  title="Saldo auto-refresh setiap 30 detik"
                />
              </button>

              <UserMenu
                user={user}
                isAdmin={isAdmin}
                formattedBalance={formattedBalance}
                onLogout={logout}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
                className="hidden sm:flex text-[10px] font-black uppercase tracking-widest text-foreground hover:bg-secondary hover:text-foreground border border-transparent rounded-lg"
              >
                Masuk
              </Button>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] border-0 shadow-[0_4px_14px_rgba(249,115,22,0.4)] transition-all text-[10px] font-black uppercase tracking-widest rounded-lg px-4"
                onClick={() => navigate("/register")}
              >
                Daftar
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="p-2 rounded-lg hover:bg-secondary text-foreground lg:hidden transition-colors"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          ref={mobileMenuRef}
          className="lg:hidden border-t border-border bg-background/95 backdrop-blur-2xl animate-in slide-in-from-top-2 absolute w-full left-0 top-[72px] shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div className="container mx-auto px-4 py-4 space-y-1">

            {NAV_LINKS.map((link) => (
              <NavLinkItem
                key={link.to}
                {...link}
                isActive={location.pathname === link.to}
                onClick={handleMobileMenuClose}
                className="px-4 py-3 rounded-xl text-[11px]"
              />
            ))}

            <div className="border-t border-border pt-4 mt-4">
              {isAuthenticated && user ? (
                <>
                  <div className="px-4 py-3 mb-2 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                        Saldo
                      </span>
                      <span className="text-sm font-black text-emerald-700 tabular-nums tracking-wider">
                        {formattedBalance}
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={handleMobileMenuClose}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-foreground/70 hover:bg-secondary hover:text-foreground transition-all"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <Link
                    to="/deposit"
                    onClick={handleMobileMenuClose}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-foreground/70 hover:bg-secondary hover:text-foreground transition-all"
                  >
                    <Wallet className="h-4 w-4" /> Top Up Saldo
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={handleMobileMenuClose}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Shield className="h-4 w-4" /> Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleMobileMenuClose();
                      logout();
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 w-full mb-2 transition-all"
                  >
                    <LogOut className="h-4 w-4" /> Keluar
                  </button>

                  <div className="px-4 py-3 border-t border-border pt-4 mt-4 flex items-center justify-between">
                    <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                      MATA UANG
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant={currency === "MYR" ? "default" : "outline"}
                        size="sm"
                        className={`text-[9px] h-7 px-3 font-black uppercase tracking-widest rounded-md border ${
                          currency === "MYR"
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-transparent text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
                        }`}
                        onClick={() => setCurrency("MYR")}
                      >
                        MYR (RM)
                      </Button>
                      <Button
                        variant={currency === "IDR" ? "default" : "outline"}
                        size="sm"
                        className={`text-[9px] h-7 px-3 font-black uppercase tracking-widest rounded-md border ${
                          currency === "IDR"
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-transparent text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
                        }`}
                        onClick={() => setCurrency("IDR")}
                      >
                        IDR (Rp)
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-3 px-2 py-2">
                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-xl text-[11px] font-black uppercase tracking-widest bg-card border-border text-foreground hover:bg-secondary hover:text-foreground transition-all"
                    onClick={() => navigate("/login")}
                  >
                    Masuk
                  </Button>
                  <Button
                    className="w-full h-12 rounded-xl text-[11px] font-black uppercase tracking-widest bg-primary text-primary-foreground border-0 shadow-[0_8px_20px_rgba(249,115,22,0.4)] hover:bg-primary/90 transition-all"
                    onClick={() => navigate("/register")}
                  >
                    Daftar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
