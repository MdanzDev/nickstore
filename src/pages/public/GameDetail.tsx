import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Info } from 'lucide-react';
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
      // Create serializable data objects (remove functions, circular references)
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
      
      // Navigate with only serializable data
      navigate('/order', {
        state: {
          game: serializableGame,
          product: serializableProduct,
        },
      });
    }
  };

  if (gameLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <LoadingSpinner size="lg" className="text-violet-500" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <EmptyState
            title="Game not found"
            description="The game you're looking for doesn't exist or has been removed."
            action={
              <Button onClick={() => navigate('/games')} className="bg-violet-500 hover:bg-violet-600">
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

      <main className="pt-8 pb-20">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <button
            onClick={() => navigate('/games')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Games
          </button>

          {/* Game Header */}
          <div className="flex flex-col md:flex-row gap-6 mb-10">
            <div className="w-full md:w-64 aspect-video md:aspect-square rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0">
              {game.image_url ? (
                <img
                  src={game.image_url}
                  alt={game.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                  <span className="text-6xl font-bold text-slate-700">{game.name.charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{game.name}</h1>
              <p className="text-slate-400 max-w-2xl">{game.description}</p>
              
              <div className="flex items-center gap-4 mt-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm text-emerald-400">Instant Delivery</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full">
                  <Info className="w-4 h-4 text-violet-400" />
                  <span className="text-sm text-violet-400">24/7 Support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-6">Select Denomination</h2>
            
            {products.length === 0 ? (
              <EmptyState
                title="No products available"
                description="Products for this game are currently unavailable."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.$id}
                    product={product}
                    isSelected={selectedProduct?.$id === product.$id}
                    onSelect={() => setSelectedProduct(product)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Continue Button */}
          {selectedProduct && (
            <div className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 p-4 z-40">
              <div className="container mx-auto max-w-4xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Selected</p>
                    <p className="text-white font-medium">{selectedProduct.name}</p>
                    <p className="text-violet-400 font-bold">RM {selectedProduct.price.toFixed(2)}</p>
                  </div>
                  <Button
                    onClick={handleContinue}
                    className="bg-violet-500 hover:bg-violet-600 text-white px-8"
                  >
                    Continue
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GameDetail;