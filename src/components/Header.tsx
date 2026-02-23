import { useState, useEffect } from 'react';
import { Menu, ShoppingCart, Sun, Moon, Search, Diamond } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import type { ViewType } from '@/types';

interface HeaderProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  cartCount: number;
  onCartClick: () => void;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
  onSearchClick: () => void;
}

const navItems: { label: string; view: ViewType }[] = [
  { label: 'Store', view: 'store' },
  { label: 'Reseller', view: 'reseller' },
  { label: 'Orders', view: 'history' },
];

export function Header({
  currentView,
  onViewChange,
  cartCount,
  onCartClick,
  theme,
  onThemeToggle,
  onSearchClick,
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (view: ViewType) => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-xl shadow-lg shadow-black/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('store')}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow">
              <Diamond className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight hidden sm:block">
              NICK<span className="text-primary">STORE</span>
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => handleNavClick(item.view)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  currentView === item.view
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onSearchClick}
              className="rounded-xl"
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onThemeToggle}
              className="rounded-xl hidden sm:flex"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {/* Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onCartClick}
              className="rounded-xl relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-[10px] font-bold bg-primary animate-pulse"
                >
                  {cartCount}
                </Badge>
              )}
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden rounded-xl">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-background border-border">
                <div className="flex flex-col gap-6 pt-8">
                  <div className="flex items-center gap-2 px-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                      <Diamond className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-black">
                      NICK<span className="text-primary">STORE</span>
                    </span>
                  </div>

                  <nav className="flex flex-col gap-2">
                    {navItems.map((item) => (
                      <button
                        key={item.view}
                        onClick={() => handleNavClick(item.view)}
                        className={`px-4 py-3 rounded-xl font-semibold text-left transition-all ${
                          currentView === item.view
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </nav>

                  <div className="border-t border-border pt-4">
                    <button
                      onClick={onThemeToggle}
                      className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:bg-secondary transition-colors"
                    >
                      {theme === 'dark' ? (
                        <>
                          <Sun className="w-5 h-5" />
                          <span>Light Mode</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-5 h-5" />
                          <span>Dark Mode</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
