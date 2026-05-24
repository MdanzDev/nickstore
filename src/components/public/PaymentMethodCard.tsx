import React from 'react';
import { Check, QrCode, Building2, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PaymentMethod } from '@/types';

interface PaymentMethodCardProps {
  method: PaymentMethod;
  isSelected: boolean;
  onSelect: () => void;
}

const typeIcons = {
  qr_code: QrCode,
  bank_transfer: Building2,
  e_wallet: Wallet,
  other: Wallet,
};

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  method,
  isSelected,
  onSelect,
}) => {
  const Icon = typeIcons[method.type] || Wallet;

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

      <div className="flex items-start gap-3 pr-7 sm:gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-slate-800">
          {method.qr_image_url ? (
            <img
              src={method.qr_image_url}
              alt={method.name}
              className="w-10 h-10 object-contain rounded"
            />
          ) : (
            <Icon className="w-6 h-6 text-slate-400" />
          )}
        </div>
        
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold leading-snug text-white">{method.name}</h4>
          <p className="mt-1 text-sm leading-5 text-slate-400">{method.description}</p>
          
          {method.account_name && (
            <div className="mt-2 text-sm">
              <span className="text-slate-500">Account: </span>
              <span className="text-slate-300">{method.account_name}</span>
            </div>
          )}
          
          {method.account_number && (
            <div className="text-sm">
              <span className="text-slate-500">No: </span>
              <span className="text-slate-300 font-mono">{method.account_number}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
};
