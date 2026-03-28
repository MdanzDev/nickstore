import React, { useState } from 'react';
import { Search } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { GameCard } from '@/components/public/GameCard';
import { useGames } from '@/hooks/useGames';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';

const Games: React.FC = () => {
  const { games, loading } = useGames();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <main className="pt-8 pb-20">
        {/* Header */}
        <div className="container mx-auto px-4 mb-10">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">All Games</h1>
            <p className="text-slate-400">
              Browse our complete collection of supported games and top up instantly.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="container mx-auto px-4 mb-10">
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <Input
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 bg-slate-900/50 border-slate-800 text-white text-lg rounded-xl"
            />
          </div>
        </div>

        {/* Games Grid */}
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" className="text-violet-500" />
            </div>
          ) : filteredGames.length === 0 ? (
            <EmptyState
              title={searchQuery ? 'No games found' : 'No games available'}
              description={
                searchQuery
                  ? 'Try adjusting your search query.'
                  : 'Check back later for new games!'
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredGames.map((game) => (
                <GameCard key={game.$id} game={game} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Games;
