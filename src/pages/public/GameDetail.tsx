import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Info, Sparkles, Shield, Zap, Gamepad2 } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { ProductCard } from '@/components/public/ProductCard';
import { useGames } from '@/hooks/useGames';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import type { Product } from '@/types';

const GameDetail: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { getGame } = useGames();
  const { products, loading: productsLoading } = useProducts(gameId);
  const [game, setGame] = useState<any>(null);
  const [gameLoading, setGameLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchGame = async () => {
      if (gameId) {
        try {
          const gameData = await getGame(gameId);
          setGame(gameData);
        } catch (err) {
          console.error('Error fetching game:', err);
        } finally {
          setGameLoading(false);
        }
      }
    };
    fetchGame();
  }, [gameId, getGame]);

  const handleContinue = () => {
    if (selectedProduct && game) {
      const serializableGame = {
        $id: game.$id,
        name: game.name,
        description: game.description,
        image_url: game.image_url,
        is_active: game.is_active,
      };
      
      const serializableProduct = {
        $id: selectedProduct.$id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        description: selectedProduct.description,
        game_id: selectedProduct.game_id,
        is_active: selectedProduct.is_active,
      };
      
      navigate('/order', {
        state: {
          game: serializableGame,
          product: serializableProduct,
        },
      });
    }
  };

  // Sort products by price (lowest to highest)
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => a.price - b.price);
  }, [products]);

  const isLoading = gameLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="relative">
            <LoadingSpinner size="lg" className="text-violet-500" />
            <div className="absolute inset-0 animate-ping rounded-full bg-violet-500/20" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <div className="container mx-auto px-4 py-20 animate-slide-up">
          <EmptyState
            title="Game not found"
            description="The game you're looking for doesn't exist or has been removed."
            action={
              <Button onClick={() => navigate('/games')} className="bg-violet-500 hover:bg-violet-600 transition-all duration-300 hover:scale-105">
                Browse Games
              </Button>
            }
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <main className="pt-8 pb-32">
        <div className="container mx-auto px-4">
          {/* Back Button with animation */}
          <button
            onClick={() => navigate('/games')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-all duration-300 mb-6 group animate-fade-in-up"
          >
            <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
            Back to Games
          </button>

          {/* Game Header with animations */}
          <div className="flex flex-col md:flex-row gap-6 mb-10 animate-slide-up">
            <div className="w-full md:w-64 aspect-video md:aspect-square rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
              {game.image_url ? (
                <img
                  src={game.image_url}
                  alt={game.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                  <Gamepad2 className="w-16 h-16 text-slate-700 animate-pulse-slow" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1 mb-4 animate-pulse-slow">
                <Sparkles className="w-3 h-3 text-violet-400" />
                <span className="text-xs text-violet-400">Featured Game</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-fade-in-up">
                {game.name}
              </h1>
              <p className="text-slate-400 max-w-2xl animate-fade-in-up animation-delay-200">
                {game.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 mt-6 animate-fade-in-up animation-delay-300">
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full transition-all duration-300 hover:scale-105">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400">Instant Delivery</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full transition-all duration-300 hover:scale-105">
                  <Shield className="w-4 h-4 text-violet-400" />
                  <span className="text-sm text-violet-400">Secure Payment</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full transition-all duration-300 hover:scale-105">
                  <Info className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-amber-400">24/7 Support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Products Section with staggered animations */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6 animate-fade-in-up animation-delay-400">
              <h2 className="text-xl font-semibold text-white">Select Denomination</h2>
              <div className="text-xs text-slate-500">
                {products.length} option{products.length !== 1 ? 's' : ''} available
              </div>
            </div>
            
            {sortedProducts.length === 0 ? (
              <div className="animate-fade-in-up animation-delay-500">
                <EmptyState
                  title="No products available"
                  description="Products for this game are currently unavailable."
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedProducts.map((product, index) => (
                  <div
                    key={product.$id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${(index % 4) * 100 + 500}ms` }}
                  >
                    <ProductCard
                      product={product}
                      isSelected={selectedProduct?.$id === product.$id}
                      onSelect={() => setSelectedProduct(product)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Sticky Bottom Bar with animation */}
      {selectedProduct && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 p-4 z-40 animate-slide-up">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Selected</p>
                <p className="text-white font-medium">{selectedProduct.name}</p>
                <p className="text-violet-400 font-bold text-lg">RM {selectedProduct.price.toFixed(2)}</p>
              </div>
              <Button
                onClick={handleContinue}
                className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white px-8 py-6 transition-all duration-300 hover:scale-105 group"
              >
                Continue
                <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default GameDetail;
