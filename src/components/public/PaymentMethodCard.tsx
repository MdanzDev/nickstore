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
        'relative w-full text-left p-4 rounded-xl border-2 transition-all duration-200',
        isSelected
          ? 'border-violet-500 bg-violet-500/10'
          : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-800/50'
      )}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}

      <div className="flex items-start gap-4 pr-6">
        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
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
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white">{method.name}</h4>
          <p className="text-sm text-slate-400 mt-1">{method.description}</p>
          
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
