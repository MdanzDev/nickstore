import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Gamepad2,
  Package,
  CreditCard,
  LogOut,
  Menu,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import OrderNotification from '@/components/admin/OrderNotification';

interface AdminSidebarProps {
  className?: string;
}

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, color: 'from-violet-500 to-fuchsia-500' },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingCart, color: 'from-blue-500 to-cyan-500' },
  { path: '/admin/games', label: 'Games', icon: Gamepad2, color: 'from-emerald-500 to-teal-500' },
  { path: '/admin/products', label: 'Products', icon: Package, color: 'from-amber-500 to-orange-500' },
  { path: '/admin/payment-methods', label: 'Payment Methods', icon: CreditCard, color: 'from-pink-500 to-rose-500' },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ className = '' }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const NavContent = () => (
    <>
      <div className="flex items-center justify-between h-16 border-b border-slate-800 px-4 animate-fade-in-up">
        <div className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            NickStore
          </span>
        </div>
        <div className="animate-fade-in-up animation-delay-100">
          <OrderNotification />
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const isHovered = hoveredItem === item.path;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`
                group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300
                ${isActive
                  ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-${item.color.split('-')[1]}-500/20`
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'animate-pulse-slow' : ''} ${isHovered && !isActive ? 'scale-110' : ''}`} />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-4 h-4 opacity-70 animate-fade-in-up" />
              )}
              {!isActive && isHovered && (
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-slide-right" />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800 animate-fade-in-up animation-delay-200">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 group"
          onClick={logout}
        >
          <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
          <span>Logout</span>
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 z-50 flex items-center justify-between px-4 animate-slide-down">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">NickStore</span>
        </div>
        <div className="flex items-center gap-2">
          <OrderNotification />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white transition-all duration-300 hover:scale-110">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-slate-950 border-r border-slate-800 p-0 animate-slide-in-left">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between h-16 border-b border-slate-800 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                      <Gamepad2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-white">NickStore</span>
                  </div>
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full blur opacity-30 animate-pulse-slow" />
                    <Sparkles className="w-4 h-4 text-violet-400 relative" />
                  </div>
                </div>
                <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300
                          ${isActive
                            ? `bg-gradient-to-r ${item.color} text-white`
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                          }
                        `}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="flex-1">{item.label}</span>
                        {isActive && (
                          <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
                        )}
                      </NavLink>
                    );
                  })}
                </nav>
                <div className="p-3 border-t border-slate-800">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 group"
                    onClick={logout}
                  >
                    <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
                    <span>Logout</span>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col w-64 h-screen bg-gradient-to-b from-slate-950 to-slate-900 border-r border-slate-800 fixed left-0 top-0 ${className} animate-slide-in-left`}
      >
        <NavContent />
      </aside>
    </>
  );
};
