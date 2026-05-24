import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Game } from '@/types';

interface GameCardProps {
  game: Game;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  return (
    <Link to={`/game/${game.$id}`} className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-2xl">
      <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/60 shadow-lg shadow-slate-950/20 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/50 hover:bg-slate-900 hover:shadow-xl hover:shadow-violet-500/10">
        {/* Image */}
        <div className="aspect-[4/3] overflow-hidden bg-slate-800">
          {game.image_url ? (
            <img
              src={game.image_url}
              alt={game.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
              <span className="text-4xl font-bold text-slate-700">{game.name.charAt(0)}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <h3 className="text-lg font-semibold text-white group-hover:text-violet-400 transition-colors line-clamp-1">
            {game.name}
          </h3>
          <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-400">
            {game.description || 'Top up your game credits instantly'}
          </p>
          
          <div className="mt-auto flex items-center justify-between pt-4">
            <span className="text-xs text-slate-500">Instant Delivery</span>
            <div className="flex items-center gap-1 text-violet-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
              Top Up
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Hover Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </article>
    </Link>
  );
};
