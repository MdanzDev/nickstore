import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  change?: {
    value: string | number;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change }) => {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-2">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${change.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {change.isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              <span>{change.value}% from yesterday</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
          <div className="text-violet-400">{icon}</div>
        </div>
      </div>
    </div>
  );
};
