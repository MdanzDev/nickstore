import React from 'react';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepProgressProps {
  currentStep: number;
}

const steps = ['Details', 'Payment', 'Complete'];

export const StepProgress: React.FC<StepProgressProps> = ({ currentStep }) => {
  return (
    <nav aria-label="Checkout progress" className="mb-8">
      <ol className="grid grid-cols-3 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/45 sm:flex sm:items-center sm:gap-4 sm:border-0 sm:bg-transparent">
        {steps.map((label, index) => {
          const step = index + 1;
          const isComplete = step < currentStep;
          const isCurrent = step === currentStep;

          return (
            <li key={label} className="relative flex min-w-0 flex-1 items-center">
              <div
                className={cn(
                  'flex min-w-0 flex-1 flex-col items-center gap-2 px-2 py-3 text-center sm:flex-row sm:text-left',
                  isCurrent || isComplete ? 'text-violet-300' : 'text-slate-500'
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                    isCurrent || isComplete ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-500'
                  )}
                >
                  {isComplete ? <CheckCircle className="h-4 w-4" /> : step}
                </span>
                <span className="truncate text-xs font-medium sm:text-sm">{label}</span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'hidden h-0.5 flex-1 sm:block',
                    step < currentStep ? 'bg-violet-500' : 'bg-slate-800'
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
