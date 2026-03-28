import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Game } from '@/types';

interface GameCardProps {
  game: Game;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  return (
    <Link to={`/game/${game.$id}`}>
      <div className="group relative bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-violet-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/10">
        {/* Image */}
        <div className="aspect-[4/3] overflow-hidden bg-slate-800">
          {game.image_url ? (
            <img
              src={game.image_url}
              alt={game.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
              <span className="text-4xl font-bold text-slate-700">{game.name.charAt(0)}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-semibold text-white group-hover:text-violet-400 transition-colors line-clamp-1">
            {game.name}
          </h3>
          <p className="text-sm text-slate-400 mt-2 line-clamp-2 h-10">
            {game.description || 'Top up your game credits instantly'}
          </p>
          
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-slate-500">Instant Delivery</span>
            <div className="flex items-center gap-1 text-violet-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
              Top Up
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Hover Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    </Link>
  );
};
