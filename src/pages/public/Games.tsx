import React, { useState, useMemo, useCallback } from 'react';
import { Search, Gamepad2, Sparkles } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { GameCard } from '@/components/public/GameCard';
import { useGames } from '@/hooks/useGames';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { debounce } from 'lodash';

const Games: React.FC = () => {
  const { games, loading } = useGames();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search to prevent UI blocking
  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setSearchQuery(value);
      setIsSearching(false);
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSearching(true);
    debouncedSetSearch(e.target.value);
  };

  const filteredGames = useMemo(() => {
    return games.filter((game) =>
      game.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [games, searchQuery]);

  const isLoading = loading || isSearching;

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <main className="pt-8 pb-20">
        {/* Header with animation */}
        <div className="container mx-auto px-4 mb-10">
          <div className="max-w-2xl mx-auto text-center animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-2 mb-4 animate-pulse-slow">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-violet-400">Discover & Top Up</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-fade-in-up">
              All <span className="text-violet-400">Games</span>
            </h1>
            <p className="text-slate-400 animate-fade-in-up animation-delay-200">
              Browse our complete collection of supported games and top up instantly.
            </p>
          </div>
        </div>

        {/* Search with animation */}
        <div className="container mx-auto px-4 mb-10 animate-fade-in-up animation-delay-300">
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 transition-all duration-300 group-focus-within:text-violet-400" />
            <Input
              placeholder="Search games..."
              onChange={handleSearchChange}
              className="pl-12 py-6 bg-slate-900/50 border-slate-800 text-white text-lg rounded-xl transition-all duration-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Games Grid with staggered animations */}
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="relative">
                <LoadingSpinner size="lg" className="text-violet-500" />
                <div className="absolute inset-0 animate-ping rounded-full bg-violet-500/20" />
              </div>
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="animate-fade-in-up">
              <EmptyState
                title={searchQuery ? 'No games found' : 'No games available'}
                description={
                  searchQuery
                    ? `No results for "${searchQuery}". Try adjusting your search.`
                    : 'Check back later for new games!'
                }
                icon={<Gamepad2 className="w-8 h-8 text-slate-400" />}
              />
            </div>
          ) : (
            <>
              <div className="text-sm text-slate-500 mb-4 animate-fade-in-up animation-delay-400">
                Found {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredGames.map((game, index) => (
                  <div
                    key={game.$id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${(index % 8) * 50 + 500}ms` }}
                  >
                    <GameCard game={game} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Games;
