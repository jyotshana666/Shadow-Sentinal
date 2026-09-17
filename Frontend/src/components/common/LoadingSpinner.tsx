import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading Shadow Sentinel telemetry...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-slate-600" role="status" aria-live="polite">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" aria-hidden="true" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};
