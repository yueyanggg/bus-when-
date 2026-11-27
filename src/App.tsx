import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiIntegrationView } from './components/ApiIntegrationView';
import { ArrivalBoard } from './components/ArrivalBoard';
import { FavoritesSidebar } from './components/FavoritesSidebar';
import { FavoritesView } from './components/FavoritesView';
import { Header } from './components/Header';
import { SearchStopBar } from './components/SearchStopBar';
import { StopDirectoryView } from './components/StopDirectoryView';
import { fetchBusArrivals, getStopByCode } from './services/busApi';
import { AppView, BusArrivalResponse, FavoriteStop, SimulatedApiMode } from './types/bus';

const STORAGE_FAVS_KEY = 'bussg:favorites:v1';
const STORAGE_RECENT_KEY = 'bussg:recent:v1';
const STORAGE_INIT_KEY = 'bussg:initialized:v1';
const AUTO_REFRESH_INTERVAL_SEC = 30;

const DEFAULT_FAVORITES: FavoriteStop[] = [
  {
    BusStopCode: '09048',
    customLabel: 'Orchard Commute',
    pinnedServices: ['106', '190'],
    addedAt: 1,
  },
  {
    BusStopCode: '04121',
    customLabel: 'City Hall Office',
    pinnedServices: ['7', '174'],
    addedAt: 2,
  },
];

function loadInitialFavorites(): FavoriteStop[] {
  try {
    const initialized = localStorage.getItem(STORAGE_INIT_KEY);
    const raw = localStorage.getItem(STORAGE_FAVS_KEY);
    if (!initialized && !raw) {
      localStorage.setItem(STORAGE_INIT_KEY, '1');
      localStorage.setItem(STORAGE_FAVS_KEY, JSON.stringify(DEFAULT_FAVORITES));
      return DEFAULT_FAVORITES;
    }
    return raw ? (JSON.parse(raw) as FavoriteStop[]) : [];
  } catch {
    return DEFAULT_FAVORITES;
  }
}

function loadInitialRecent(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : ['09048', '04121', '14141', '52009'];
  } catch {
    return ['09048', '04121', '14141', '52009'];
  }
}

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('arrivals');
  const [favorites, setFavorites] = useState<FavoriteStop[]>(loadInitialFavorites);
  const [recentStopCodes, setRecentStopCodes] = useState<string[]>(loadInitialRecent);
  const [activeStopCode, setActiveStopCode] = useState<string>(() => {
    const initialFavs = loadInitialFavorites();
    return initialFavs[0]?.BusStopCode ?? '09048';
  });

  const [arrivals, setArrivals] = useState<BusArrivalResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [secondsToRefresh, setSecondsToRefresh] = useState<number>(AUTO_REFRESH_INTERVAL_SEC);
  const [simulatedMode, setSimulatedMode] = useState<SimulatedApiMode>('live-preview');

  // Persist favourites
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FAVS_KEY, JSON.stringify(favorites));
      localStorage.setItem(STORAGE_INIT_KEY, '1');
    } catch {
      // Ignore storage quota issues
    }
  }, [favorites]);

  // Persist recent searches
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_RECENT_KEY, JSON.stringify(recentStopCodes));
    } catch {
      // Ignore storage quota issues
    }
  }, [recentStopCodes]);

  const loadArrivals = useCallback(
    async (stopCode: string, mode: SimulatedApiMode) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchBusArrivals(stopCode, mode);
        setArrivals(data);
        setSecondsToRefresh(AUTO_REFRESH_INTERVAL_SEC);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load bus arrivals.');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Fetch when active stop or simulated mode changes
  useEffect(() => {
    loadArrivals(activeStopCode, simulatedMode);
  }, [activeStopCode, simulatedMode, loadArrivals]);

  // Auto-refresh countdown
  useEffect(() => {
    if (!autoRefresh || activeView !== 'arrivals') return;
    const timer = setInterval(() => {
      setSecondsToRefresh((prev) => {
        if (prev <= 1) {
          loadArrivals(activeStopCode, simulatedMode);
          return AUTO_REFRESH_INTERVAL_SEC;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [autoRefresh, activeView, activeStopCode, simulatedMode, loadArrivals]);

  const favoriteCodesSet = useMemo(
    () => new Set(favorites.map((f) => f.BusStopCode)),
    [favorites]
  );

  const activeFavoriteEntry = useMemo(
    () => favorites.find((f) => f.BusStopCode === activeStopCode),
    [favorites, activeStopCode]
  );

  const activeStopMeta = useMemo(
    () => getStopByCode(activeStopCode),
    [activeStopCode]
  );

  function handleSelectStop(stopCode: string) {
    const cleanCode = stopCode.trim();
    if (!cleanCode) return;
    setActiveStopCode(cleanCode);
    setActiveView('arrivals');
    setRecentStopCodes((prev) => [cleanCode, ...prev.filter((c) => c !== cleanCode)].slice(0, 8));
  }

  function handleToggleFavoriteStop(stopCode: string) {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.BusStopCode === stopCode);
      if (exists) {
        return prev.filter((f) => f.BusStopCode !== stopCode);
      }
      return [
        {
          BusStopCode: stopCode,
          pinnedServices: [],
          addedAt: Date.now(),
        },
        ...prev,
      ];
    });
  }

  function handleRemoveFavorite(stopCode: string) {
    setFavorites((prev) => prev.filter((f) => f.BusStopCode !== stopCode));
  }

  function handleUpdateFavoriteLabel(stopCode: string, label: string) {
    setFavorites((prev) =>
      prev.map((f) =>
        f.BusStopCode === stopCode
          ? { ...f, customLabel: label || undefined }
          : f
      )
    );
  }

  function handleTogglePinService(stopCode: string, serviceNo: string) {
    setFavorites((prev) => {
      const existing = prev.find((f) => f.BusStopCode === stopCode);
      if (!existing) {
        // Automatically save stop to favourites when pinning a bus service there
        return [
          {
            BusStopCode: stopCode,
            pinnedServices: [serviceNo],
            addedAt: Date.now(),
          },
          ...prev,
        ];
      }
      const isPinned = existing.pinnedServices.includes(serviceNo);
      const nextPinned = isPinned
        ? existing.pinnedServices.filter((s) => s !== serviceNo)
        : [...existing.pinnedServices, serviceNo];

      return prev.map((f) =>
        f.BusStopCode === stopCode ? { ...f, pinnedServices: nextPinned } : f
      );
    });
  }

  function handleManualRefresh() {
    setActiveView('arrivals');
    loadArrivals(activeStopCode, simulatedMode);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header
        activeView={activeView}
        onChangeView={setActiveView}
        onRefresh={handleManualRefresh}
        isRefreshing={isLoading}
        favoritesCount={favorites.length}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
        {activeView === 'arrivals' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Desktop Left Sidebar */}
            <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-24">
              <FavoritesSidebar
                favorites={favorites}
                activeStopCode={activeStopCode}
                onSelectStop={handleSelectStop}
                onRemoveFavorite={handleRemoveFavorite}
                onViewAllFavorites={() => setActiveView('favourites')}
              />
            </div>

            {/* Primary Arrival Workspace */}
            <div className="lg:col-span-8 space-y-5">
              <SearchStopBar
                activeStopCode={activeStopCode}
                recentStopCodes={recentStopCodes}
                favoriteCodes={favoriteCodesSet}
                onSelectStop={handleSelectStop}
              />

              {/* Mobile Quick-Switch Favourites Strip */}
              {favorites.length > 0 && (
                <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-1">
                  {favorites.map((fav) => {
                    const stop = getStopByCode(fav.BusStopCode);
                    const isActive = fav.BusStopCode === activeStopCode;
                    const label = fav.customLabel?.trim() || stop?.Description || fav.BusStopCode;
                    return (
                      <button
                        key={fav.BusStopCode}
                        type="button"
                        onClick={() => handleSelectStop(fav.BusStopCode)}
                        className={`inline-flex items-center gap-2 px-3 py-2 min-h-[40px] rounded-lg border text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                          isActive
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span
                          className={`font-mono font-semibold ${
                            isActive ? 'text-teal-300' : 'text-teal-700'
                          }`}
                        >
                          {fav.BusStopCode}
                        </span>
                        <span className="max-w-[140px] truncate">{label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              <ArrivalBoard
                stopCode={activeStopCode}
                stopMeta={activeStopMeta}
                arrivals={arrivals}
                isLoading={isLoading}
                error={error}
                favoriteEntry={activeFavoriteEntry}
                autoRefresh={autoRefresh}
                secondsToRefresh={secondsToRefresh}
                onToggleAutoRefresh={() => setAutoRefresh((prev) => !prev)}
                onRefresh={() => loadArrivals(activeStopCode, simulatedMode)}
                onToggleFavoriteStop={handleToggleFavoriteStop}
                onUpdateFavoriteLabel={handleUpdateFavoriteLabel}
                onTogglePinService={handleTogglePinService}
              />
            </div>
          </div>
        )}

        {activeView === 'favourites' && (
          <FavoritesView
            favorites={favorites}
            onSelectStop={handleSelectStop}
            onRemoveFavorite={handleRemoveFavorite}
            onUpdateLabel={handleUpdateFavoriteLabel}
            onBrowseDirectory={() => setActiveView('directory')}
          />
        )}

        {activeView === 'directory' && (
          <StopDirectoryView
            activeStopCode={activeStopCode}
            favoriteCodes={favoriteCodesSet}
            onSelectStop={handleSelectStop}
            onToggleFavorite={handleToggleFavoriteStop}
          />
        )}

        {activeView === 'api' && (
          <ApiIntegrationView
            simulatedMode={simulatedMode}
            onChangeSimulatedMode={setSimulatedMode}
            onTestOnBoard={() => setActiveView('arrivals')}
          />
        )}
      </main>

      <footer className="hidden md:block border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between text-xs text-slate-500">
          <p>
            BusSG · Frontend preview using simulated Singapore bus arrival schedules
          </p>
          <button
            type="button"
            onClick={() => setActiveView('api')}
            className="font-medium text-teal-700 hover:text-teal-800 hover:underline underline-offset-4"
          >
            Connect LTA DataMall API
          </button>
        </div>
      </footer>
    </div>
  );
}
