import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { HeroSection } from '@/sections/HeroSection';
import { GameGridSection } from '@/sections/GameGridSection';
import { ProductDetailSection } from '@/sections/ProductDetailSection';
import { ResellerSection } from '@/sections/ResellerSection';
import { OrderHistorySection } from '@/sections/OrderHistorySection';
import { useStore } from '@/hooks/useStore';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import type { Game, ViewType } from '@/types';

// Loading Screen Component
function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + Math.random() * 30;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-black text-primary">N</span>
        </div>
      </div>
      <div className="mt-8 w-48 h-1 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-150 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <p className="mt-4 text-muted-foreground font-medium text-sm tracking-widest uppercase">
        NickStore Loading
      </p>
    </div>
  );
}

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('store');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    cart,
    history,
    theme,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    clearCart,
    checkout,
    clearHistory,
    setTheme,
  } = useStore();

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game);
    setCurrentView('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToStore = () => {
    setSelectedGame(null);
    setCurrentView('store');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (item: Parameters<typeof addToCart>[0]) => {
    addToCart(item);
    toast.success('Added to cart!', {
      description: `${item.game} - ${item.denom}`,
      action: {
        label: 'View Cart',
        onClick: () => setIsCartOpen(true),
      },
    });
  };

  const handleCheckout = () => {
    const orderId = checkout();
    if (orderId) {
      toast.success('Order placed successfully!', {
        description: `Order #${orderId.toString().slice(-6)}`,
      });
      setIsCartOpen(false);
    }
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    if (view !== 'product') {
      setSelectedGame(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchFocus = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header
        currentView={currentView}
        onViewChange={handleViewChange}
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        theme={theme}
        onThemeToggle={toggleTheme}
        onSearchClick={handleSearchFocus}
      />

      <main className="min-h-screen">
        {currentView === 'store' && (
          <>
            <HeroSection onSearchFocus={handleSearchFocus} />
            <GameGridSection
              onGameSelect={handleGameSelect}
              searchInputRef={searchInputRef}
            />
          </>
        )}

        {currentView === 'product' && selectedGame && (
          <ProductDetailSection
            game={selectedGame}
            onBack={handleBackToStore}
            onAddToCart={handleAddToCart}
            onViewCart={() => setIsCartOpen(true)}
          />
        )}

        {currentView === 'reseller' && <ResellerSection />}

        {currentView === 'history' && (
          <OrderHistorySection orders={history} onClear={clearHistory} />
        )}
      </main>

      <Footer />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        total={cartTotal}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
        onClear={clearCart}
      />

      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </div>
  );
}

export default App;
