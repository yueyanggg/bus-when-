import { Bookmark, Code2, Compass, Radio, RefreshCw } from 'lucide-react';
import { AppView } from '../types/bus';

interface HeaderProps {
  activeView: AppView;
  onChangeView: (view: AppView) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  favoritesCount: number;
}

const NAV_ITEMS: { id: AppView; label: string }[] = [
  { id: 'arrivals', label: 'Arrivals' },
  { id: 'favourites', label: 'Favourites' },
  { id: 'directory', label: 'Directory' },
  { id: 'api', label: 'API Hook' },
];

export function Header({
  activeView,
  onChangeView,
  onRefresh,
  isRefreshing,
  favoritesCount,
}: HeaderProps) {
  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <button
            type="button"
            onClick={() => onChangeView('arrivals')}
            className="font-display text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 rounded"
          >
            BusSG
          </button>

          {/* Zone 2: Concise single-line nav links (desktop) */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Primary navigation">
            {NAV_ITEMS.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChangeView(item.id)}
                  className={`relative py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 rounded ${
                    isActive
                      ? 'text-teal-700'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                  {item.id === 'favourites' && favoritesCount > 0 && (
                    <span className="ml-1.5 font-mono text-xs text-slate-500 tabular-nums">
                      ({favoritesCount})
                    </span>
                  )}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 right-0 -bottom-[19px] h-0.5 bg-teal-700"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 active:scale-[0.98] disabled:opacity-60 transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile bottom thumb-zone navigation (within 15% sticky height cap) */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200"
      >
        <div className="grid grid-cols-4 h-14">
          <button
            type="button"
            onClick={() => onChangeView('arrivals')}
            className={`flex flex-col items-center justify-center min-h-[44px] text-[11px] font-medium transition-colors ${
              activeView === 'arrivals' ? 'text-teal-700' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Radio className="w-4 h-4 mb-0.5" aria-hidden="true" />
            <span className="whitespace-nowrap">Arrivals</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeView('favourites')}
            className={`flex flex-col items-center justify-center min-h-[44px] text-[11px] font-medium transition-colors ${
              activeView === 'favourites' ? 'text-teal-700' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Bookmark className="w-4 h-4 mb-0.5" aria-hidden="true" />
            <span className="whitespace-nowrap">
              Saved{favoritesCount > 0 ? ` (${favoritesCount})` : ''}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onChangeView('directory')}
            className={`flex flex-col items-center justify-center min-h-[44px] text-[11px] font-medium transition-colors ${
              activeView === 'directory' ? 'text-teal-700' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4 mb-0.5" aria-hidden="true" />
            <span className="whitespace-nowrap">Directory</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeView('api')}
            className={`flex flex-col items-center justify-center min-h-[44px] text-[11px] font-medium transition-colors ${
              activeView === 'api' ? 'text-teal-700' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4 mb-0.5" aria-hidden="true" />
            <span className="whitespace-nowrap">API Hook</span>
          </button>
        </div>
      </nav>
    </>
  );
}
