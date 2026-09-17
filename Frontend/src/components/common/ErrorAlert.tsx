import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-lg flex items-start gap-3 my-4" role="alert">
      <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1">
        <h4 className="font-semibold text-sm">System Error</h4>
        <p className="text-sm mt-0.5">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-xs font-semibold text-rose-700 hover:text-rose-900 underline"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};
