import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onSelect: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isSelected,
  onSelect,
}) => {
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0;

  return (
    <button
      onClick={onSelect}
      className={cn(
        'relative w-full rounded-2xl border p-4 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-slate-950',
        isSelected
          ? 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-950/20'
          : 'border-slate-800 bg-slate-900/60 hover:-translate-y-0.5 hover:border-slate-700 hover:bg-slate-800/70'
      )}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}

      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-3 left-3 px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded">
          -{discountPercent}%
        </div>
      )}

      <div className="pr-8">
        <h4 className="font-semibold leading-snug text-white">{product.name}</h4>
        <p className="mt-1 text-sm leading-5 text-slate-400">{product.denomination}</p>
        
        <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-lg font-bold text-violet-400">
            RM {product.price.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-slate-500 line-through">
              RM {product.original_price!.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};
