import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiIntegrationView } from './components/ApiIntegrationView';
import { ArrivalBoard } from './components/ArrivalBoard';
import { FavoritesSidebar } from './components/FavoritesSidebar';
import { FavoritesView } from './components/FavoritesView';
import { Header } from './components/Header';
import { SearchStopBar } from './components/SearchStopBar';
import { StopDirectoryView } from './components/StopDirectoryView';
import { BusApiError, fetchApiHealth, fetchBusArrivals, getStopByCode } from './services/busApi';
import {
  ApiHealthStatus,
  AppView,
  BusArrivalResponse,
  DataSourceMode,
  FavoriteStop,
  SimulatedApiMode,
} from './types/bus';

const STORAGE_FAVS_KEY = 'bussg:favorites:v1';
const STORAGE_RECENT_KEY = 'bussg:recent:v1';
const STORAGE_INIT_KEY = 'bussg:initialized:v1';
const AUTO_REFRESH_INTERVAL_SEC = 20;

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
    return raw ? (JSON.parse(raw) as string[]) : ['04121', '09048', '14141', '52009'];
  } catch {
    return ['04121', '09048', '14141', '52009'];
  }
}

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('arrivals');
  const [favorites, setFavorites] = useState<FavoriteStop[]>(loadInitialFavorites);
  const [recentStopCodes, setRecentStopCodes] = useState<string[]>(loadInitialRecent);
  const [activeStopCode, setActiveStopCode] = useState<string>(() => {
    const initialFavs = loadInitialFavorites();
    return initialFavs[0]?.BusStopCode ?? '04121';
  });

  const [healthStatus, setHealthStatus] = useState<ApiHealthStatus | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<DataSourceMode>('preview');
  const [arrivals, setArrivals] = useState<BusArrivalResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [secondsToRefresh, setSecondsToRefresh] = useState<number>(AUTO_REFRESH_INTERVAL_SEC);
  const [simulatedMode, setSimulatedMode] = useState<SimulatedApiMode>('live-preview');

  const checkHealth = useCallback(async (autoSwitchToLive: boolean = false) => {
    setIsCheckingHealth(true);
    try {
      const status = await fetchApiHealth();
      setHealthStatus(status);
      if (autoSwitchToLive && status.ltaConfigured) {
        setDataSource('live');
      }
    } catch {
      setHealthStatus({
        ok: false,
        ltaConfigured: false,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsCheckingHealth(false);
    }
  }, []);

  // Check /api/health on initial mount to auto-enable live LTA DataMall v3 when key is present
  useEffect(() => {
    checkHealth(true);
  }, [checkHealth]);

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
    async (stopCode: string, source: DataSourceMode, mode: SimulatedApiMode) => {
      setIsLoading(true);
      setError(null);
      setErrorCode(null);
      try {
        const data = await fetchBusArrivals(stopCode, {
          dataSource: source,
          simulatedMode: mode,
        });
        setArrivals(data);
        setSecondsToRefresh(AUTO_REFRESH_INTERVAL_SEC);
      } catch (err) {
        if (err instanceof BusApiError) {
          setError(err.message);
          setErrorCode(err.code ?? null);
        } else {
          setError(err instanceof Error ? err.message : 'Unable to load bus arrivals.');
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Fetch when active stop, data source, or simulated mode changes
  useEffect(() => {
    loadArrivals(activeStopCode, dataSource, simulatedMode);
  }, [activeStopCode, dataSource, simulatedMode, loadArrivals]);

  // Auto-refresh countdown (20s cadence matching LTA DataMall v3)
  useEffect(() => {
    if (!autoRefresh || activeView !== 'arrivals') return;
    const timer = setInterval(() => {
      setSecondsToRefresh((prev) => {
        if (prev <= 1) {
          loadArrivals(activeStopCode, dataSource, simulatedMode);
          return AUTO_REFRESH_INTERVAL_SEC;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [autoRefresh, activeView, activeStopCode, dataSource, simulatedMode, loadArrivals]);

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
    loadArrivals(activeStopCode, dataSource, simulatedMode);
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
                errorCode={errorCode}
                dataSource={dataSource}
                onChangeDataSource={setDataSource}
                favoriteEntry={activeFavoriteEntry}
                autoRefresh={autoRefresh}
                secondsToRefresh={secondsToRefresh}
                onToggleAutoRefresh={() => setAutoRefresh((prev) => !prev)}
                onRefresh={() => loadArrivals(activeStopCode, dataSource, simulatedMode)}
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
            healthStatus={healthStatus}
            isCheckingHealth={isCheckingHealth}
            onRefreshHealth={() => checkHealth(true)}
            dataSource={dataSource}
            onChangeDataSource={setDataSource}
            simulatedMode={simulatedMode}
            onChangeSimulatedMode={setSimulatedMode}
            onTestOnBoard={() => setActiveView('arrivals')}
          />
        )}
      </main>

      <footer className="hidden md:block border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between text-xs text-slate-500">
          <p>
            BusSG ·{' '}
            {dataSource === 'live'
              ? 'Connected to LTA DataMall v3 (/api/busarrival)'
              : healthStatus?.ltaConfigured
                ? 'Preview schedules active (Live LTA v3 ready)'
                : 'Preview schedules active (waiting for LTA_ACCOUNT_KEY)'}
          </p>
          <button
            type="button"
            onClick={() => setActiveView('api')}
            className="font-medium text-teal-700 hover:text-teal-800 hover:underline underline-offset-4"
          >
            API Connection & Health
          </button>
        </div>
      </footer>
    </div>
  );
}
