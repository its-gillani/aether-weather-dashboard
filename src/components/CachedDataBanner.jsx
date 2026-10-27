import React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function CachedDataBanner({ isCached, cacheAgeMinutes, errorWarning, onRefresh, isRefreshing }) {
  if (!isCached && !errorWarning) return null;

  return (
    <div className="mb-5 flex items-center justify-between px-3.5 py-2 rounded-xl bg-amber-500/[0.08] border border-amber-400/20 backdrop-blur-md text-amber-200/90 text-xs shadow-sm">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>
          {errorWarning || 'Offline mode'}: Viewing cached telemetry from{' '}
          <strong className="font-semibold text-amber-200">
            {cacheAgeMinutes !== undefined && cacheAgeMinutes >= 0 ? `${cacheAgeMinutes}m ago` : 'recent session'}
          </strong>
        </span>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-400/[0.12] hover:bg-amber-400/20 text-amber-200 hover:text-white font-medium transition-colors text-xs border border-amber-400/20 disabled:opacity-50"
      >
        <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
        <span>Retry</span>
      </button>
    </div>
  );
}
