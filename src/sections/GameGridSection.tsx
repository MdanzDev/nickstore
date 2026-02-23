import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, ChevronLeft, ChevronRight, Sparkles, Flame, Ticket, Gamepad2 } from 'lucide-react';
import { categories, getGamesByCategory, searchGames } from '@/data/games';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Game } from '@/types';

interface GameGridSectionProps {
  onGameSelect: (game: Game) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

const categoryIcons: Record<string, React.ElementType> = {
  all: Gamepad2,
  popular: Flame,
  new: Sparkles,
  vouchers: Ticket,
};

export function GameGridSection({ onGameSelect, searchInputRef }: GameGridSectionProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const filteredGames = useMemo(() => {
    if (searchQuery.trim()) {
      return searchGames(searchQuery);
    }
    return getGamesByCategory(activeCategory);
  }, [activeCategory, searchQuery]);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 200;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleSearchFocus = () => {
    searchInputRef.current?.focus();
  };

  useEffect(() => {
    if (searchInputRef.current) {
      handleSearchFocus();
    }
  }, [searchInputRef]);

  return (
    <section className="py-8">
      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search Mobile Legends, Genshin, FF..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-6 bg-card border-border rounded-2xl text-base focus:ring-2 focus:ring-primary/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      {!searchQuery && (
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <button
            onClick={() => scrollCategories('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-card border border-border shadow-lg flex items-center justify-center lg:hidden"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div
            ref={categoryScrollRef}
            className="flex gap-2 overflow-x-auto no-scrollbar px-8 lg:px-0 py-2"
          >
            {categories.map((category) => {
              const Icon = categoryIcons[category.id] || Gamepad2;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`category-chip flex items-center gap-2 ${
                    activeCategory === category.id ? 'active' : ''
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => scrollCategories('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-card border border-border shadow-lg flex items-center justify-center lg:hidden"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Section Title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="section-title">
            {searchQuery
              ? `Search Results (${filteredGames.length})`
              : activeCategory === 'all'
              ? 'All Games'
              : categories.find((c) => c.id === activeCategory)?.name}
          </h2>
          {!searchQuery && (
            <span className="text-sm text-muted-foreground">
              {filteredGames.length} games
            </span>
          )}
        </div>
      </div>

      {/* Game Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {filteredGames.map((game) => (
              <button
                key={game.id}
                onClick={() => onGameSelect(game)}
                className="game-card group text-left"
              >
                {/* Game Image */}
                <div className="relative aspect-square bg-gradient-to-br from-secondary to-background rounded-xl overflow-hidden p-4">
                  <img
                    src={game.logo}
                    alt={game.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        game.name
                      )}&background=7c3aed&color=fff&size=200&length=2`;
                    }}
                  />
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {game.isNew && (
                      <Badge className="bg-accent text-white text-[10px] font-bold px-2 py-0.5">
                        NEW
                      </Badge>
                    )}
                    {game.isPopular && !game.isNew && (
                      <Badge className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5">
                        HOT
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Game Info */}
                <div className="p-3">
                  <h3 className="font-bold text-sm line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                    {game.name}
                  </h3>
                  <p className="text-xs text-muted-foreground capitalize mb-2">
                    {game.category}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {game.products.length} items
                    </span>
                    <span className="text-sm font-black text-primary">
                      RM {game.minPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold mb-2">No games found</h3>
            <p className="text-muted-foreground text-sm">
              Try searching with different keywords
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => setSearchQuery('')}
                className="mt-4"
              >
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
