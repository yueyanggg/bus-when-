import {
  Accessibility,
  AlertCircle,
  Check,
  ChevronDown,
  Copy,
  Edit3,
  Pause,
  Play,
  RefreshCw,
  Search,
  Star,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  BusArrivalResponse,
  BusServiceArrival,
  BusStop,
  DataSourceMode,
  FavoriteStop,
  NextBusSlot,
} from '../types/bus';
import {
  formatArrivalLabel,
  formatSgtClock,
  getBusTypeLabel,
  getLoadMeta,
  getMinutesUntilArrival,
  getOperatorFullName,
} from '../utils/busFormat';

interface ArrivalBoardProps {
  stopCode: string;
  stopMeta?: BusStop;
  arrivals: BusArrivalResponse | null;
  isLoading: boolean;
  error: string | null;
  errorCode?: string | null;
  dataSource: DataSourceMode;
  onChangeDataSource: (mode: DataSourceMode) => void;
  favoriteEntry?: FavoriteStop;
  autoRefresh: boolean;
  secondsToRefresh: number;
  onToggleAutoRefresh: () => void;
  onRefresh: () => void;
  onToggleFavoriteStop: (stopCode: string) => void;
  onUpdateFavoriteLabel: (stopCode: string, label: string) => void;
  onTogglePinService: (stopCode: string, serviceNo: string) => void;
}

function BusSlotCell({
  slot,
  nowMs,
  isPrimary,
}: {
  slot: NextBusSlot;
  nowMs: number;
  isPrimary?: boolean;
}) {
  const minutes = getMinutesUntilArrival(slot.EstimatedArrival, nowMs);
  const label = formatArrivalLabel(minutes);
  const load = getLoadMeta(slot.Load);
  const busType = getBusTypeLabel(slot.Type);
  const clock = formatSgtClock(slot.EstimatedArrival);
  const isArriving = label === 'Arr';

  if (minutes === null) {
    return (
      <div className="flex flex-col justify-center py-1">
        <span className="font-mono text-sm text-slate-300 tabular-nums">—</span>
        <span className="text-[11px] text-slate-400">No est.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between gap-1.5 min-w-0">
      <div className="flex items-baseline gap-1.5">
        <span
          className={`font-mono tabular-nums tracking-tight ${
            isArriving
              ? 'text-xl sm:text-2xl font-bold text-teal-700'
              : isPrimary
                ? 'text-xl sm:text-2xl font-bold text-slate-900'
                : 'text-lg sm:text-xl font-semibold text-slate-700'
          }`}
        >
          {label}
        </span>
        {!isArriving && (
          <span className="text-xs font-medium text-slate-500">min</span>
        )}
        <span className="ml-auto font-mono text-[11px] text-slate-400 tabular-nums hidden sm:inline">
          {clock}
        </span>
      </div>

      {/* Occupancy Bar + Explicit Text Label (no color-only signaling) */}
      <div className="space-y-1">
        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${load.barClass} ${load.barWidth}`} />
        </div>
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className={`font-medium truncate ${load.textClass}`}>{load.shortLabel}</span>
          <span className="font-mono text-slate-400 shrink-0 flex items-center gap-1">
            {busType.code}
            {slot.Feature === 'WAB' && (
              <Accessibility className="w-3 h-3 text-slate-400" aria-label="Wheelchair accessible" />
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ArrivalBoard({
  stopCode,
  stopMeta,
  arrivals,
  isLoading,
  error,
  errorCode,
  dataSource,
  onChangeDataSource,
  favoriteEntry,
  autoRefresh,
  secondsToRefresh,
  onToggleAutoRefresh,
  onRefresh,
  onToggleFavoriteStop,
  onUpdateFavoriteLabel,
  onTogglePinService,
}: ArrivalBoardProps) {
  const [serviceQuery, setServiceQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'pinned'>('all');
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState('');
  const [nowMs, setNowMs] = useState(() => Date.now());

  // Tick every 15s so displayed countdown minutes stay fresh
  useEffect(() => {
    setNowMs(Date.now());
    const id = setInterval(() => setNowMs(Date.now()), 15_000);
    return () => clearInterval(id);
  }, [arrivals]);

  // Reset local filter when switching stops
  useEffect(() => {
    setServiceQuery('');
    setFilterMode('all');
    setExpandedService(null);
    setEditingLabel(false);
  }, [stopCode]);

  const isFavorite = Boolean(favoriteEntry);
  const pinnedSet = new Set(favoriteEntry?.pinnedServices ?? []);

  function handleCopyCode() {
    navigator.clipboard?.writeText(stopCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  }

  function startEditLabel() {
    setLabelDraft(favoriteEntry?.customLabel ?? '');
    setEditingLabel(true);
  }

  function saveLabel(e: React.FormEvent) {
    e.preventDefault();
    onUpdateFavoriteLabel(stopCode, labelDraft.trim());
    setEditingLabel(false);
  }

  const allServices: BusServiceArrival[] = arrivals?.Services ?? [];
  const filteredServices = allServices
    .filter((svc) => {
      if (filterMode === 'pinned' && !pinnedSet.has(svc.ServiceNo)) return false;
      if (serviceQuery.trim()) {
        return svc.ServiceNo.toLowerCase().includes(serviceQuery.trim().toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      const aPinned = pinnedSet.has(a.ServiceNo) ? 0 : 1;
      const bPinned = pinnedSet.has(b.ServiceNo) ? 0 : 1;
      if (aPinned !== bPinned) return aPinned - bPinned;
      const numA = parseInt(a.ServiceNo, 10);
      const numB = parseInt(b.ServiceNo, 10);
      if (numA !== numB) return numA - numB;
      return a.ServiceNo.localeCompare(b.ServiceNo);
    });

  const displayName =
    favoriteEntry?.customLabel?.trim() ||
    stopMeta?.Description ||
    `Bus Stop ${stopCode}`;

  return (
    <section
      aria-label={`Bus arrivals for stop ${stopCode}`}
      className="bg-white border border-slate-200 rounded-xl overflow-hidden"
    >
      {/* Active Bus Stop Header */}
      <div className="p-5 sm:p-6 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center flex-wrap gap-2.5">
              <span className="font-mono text-sm font-bold tracking-wide text-teal-900 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-md">
                {stopCode}
              </span>

              <button
                type="button"
                onClick={handleCopyCode}
                title="Copy bus stop code"
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Copy code</span>
                  </>
                )}
              </button>
            </div>

            <h1 className="mt-2.5 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
              {displayName}
            </h1>

            <p className="mt-1 text-sm text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              {favoriteEntry?.customLabel && stopMeta?.Description && (
                <>
                  <span className="text-slate-700 font-medium">{stopMeta.Description}</span>
                  <span aria-hidden="true">·</span>
                </>
              )}
              <span>{stopMeta?.RoadName ?? 'Singapore Road Network'}</span>
              {stopMeta?.mrtNearby && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Near {stopMeta.mrtNearby}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{allServices.length} services</span>
            </p>
          </div>

          {/* Favourite & Label Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {isFavorite && !editingLabel && (
              <button
                type="button"
                onClick={startEditLabel}
                className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors whitespace-nowrap"
              >
                <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{favoriteEntry?.customLabel ? 'Edit Label' : 'Add Label'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onToggleFavoriteStop(stopCode)}
              aria-pressed={isFavorite}
              className={`inline-flex items-center gap-2 px-4 py-2 min-h-[40px] text-xs font-semibold rounded-lg border transition-all whitespace-nowrap ${
                isFavorite
                  ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
              }`}
            >
              <Star
                className={`w-4 h-4 ${
                  isFavorite ? 'text-amber-500 fill-amber-500' : 'text-slate-400'
                }`}
                aria-hidden="true"
              />
              <span>{isFavorite ? 'Saved' : 'Save Stop'}</span>
            </button>
          </div>
        </div>

        {/* Inline Custom Label Editor */}
        {editingLabel && (
          <form onSubmit={saveLabel} className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <label htmlFor="stop-alias-input" className="text-xs font-medium text-slate-600">
              Custom nickname:
            </label>
            <input
              id="stop-alias-input"
              type="text"
              maxLength={32}
              value={labelDraft}
              onChange={(e) => setLabelDraft(e.target.value)}
              placeholder="e.g. Home, Office MRT, Gym"
              autoFocus
              className="flex-1 min-w-[180px] max-w-xs px-3 py-1.5 min-h-[38px] text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 min-h-[38px] text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors"
            >
              Save Label
            </button>
            <button
              type="button"
              onClick={() => setEditingLabel(false)}
              className="px-3 py-1.5 min-h-[38px] text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg"
            >
              Cancel
            </button>
          </form>
        )}

        {/* Filter & Live Refresh Controls */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search
                className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={serviceQuery}
                onChange={(e) => setServiceQuery(e.target.value)}
                placeholder="Filter bus no."
                aria-label="Filter bus service number"
                className="pl-8 pr-3 py-1.5 min-h-[38px] w-36 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-teal-700"
              />
            </div>

            {pinnedSet.size > 0 && (
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setFilterMode('all')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    filterMode === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({allServices.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('pinned')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    filterMode === 'pinned'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pinned ({pinnedSet.size})
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5 flex-wrap text-xs text-slate-500">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => onChangeDataSource('live')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  dataSource === 'live'
                    ? 'bg-white text-teal-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Live LTA
              </button>
              <button
                type="button"
                onClick={() => onChangeDataSource('preview')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  dataSource === 'preview'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Preview
              </button>
            </div>

            <button
              type="button"
              onClick={onToggleAutoRefresh}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 min-h-[34px] rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-colors whitespace-nowrap"
            >
              {autoRefresh ? (
                <>
                  <Pause className="w-3 h-3 text-teal-700" aria-hidden="true" />
                  <span className="tabular-nums">Auto {secondsToRefresh}s</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-slate-500" aria-hidden="true" />
                  <span>Auto paused</span>
                </>
              )}
            </button>

            {arrivals?.updatedAt && (
              <span className="font-mono text-[11px] text-slate-400 tabular-nums whitespace-nowrap">
                Updated {formatSgtClock(arrivals.updatedAt)} SGT
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Crowd & Type Legend Strip */}
      <div className="px-5 sm:px-6 py-2.5 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5 text-[11px] text-slate-500">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-1 rounded-full bg-emerald-600" aria-hidden="true" />
            <span className="font-medium text-emerald-800">Seats</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-1 rounded-full bg-amber-500" aria-hidden="true" />
            <span className="font-medium text-amber-800">Standing</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-1 rounded-full bg-rose-600" aria-hidden="true" />
            <span className="font-medium text-rose-800">Crowded</span>
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-slate-400 font-mono">
          <span>SD Single</span>
          <span aria-hidden="true">·</span>
          <span>DD Double</span>
          <span aria-hidden="true">·</span>
          <span>BD Bendy</span>
        </div>
      </div>

      {/* Desktop Column Headers */}
      {!isLoading && !error && filteredServices.length > 0 && (
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2.5 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <div className="col-span-5">Bus Service</div>
          <div className="col-span-2">Next Bus</div>
          <div className="col-span-2">2nd Bus</div>
          <div className="col-span-2">3rd Bus</div>
          <div className="col-span-1 text-right">Pin</div>
        </div>
      )}

      {/* Board Body: Loading / Error / Empty / Populated */}
      {isLoading ? (
        <div className="divide-y divide-slate-100" aria-busy="true" aria-label="Loading bus arrivals">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="px-5 sm:px-6 py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center animate-pulse">
              <div className="md:col-span-5 flex items-center gap-3.5">
                <div className="w-14 h-10 bg-slate-200 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <div className="h-3.5 w-32 bg-slate-200 rounded" />
                  <div className="h-3 w-20 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="grid grid-cols-3 md:col-span-6 gap-4">
                <div className="h-11 bg-slate-100 rounded" />
                <div className="h-11 bg-slate-100 rounded" />
                <div className="h-11 bg-slate-100 rounded" />
              </div>
              <div className="hidden md:block md:col-span-1" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="px-6 py-12 text-center">
          <AlertCircle className="w-7 h-7 text-rose-600 mx-auto mb-3" aria-hidden="true" />
          <h3 className="font-display text-base font-semibold text-slate-900">
            {errorCode === 'MISSING_API_KEY'
              ? 'LTA AccountKey required for Live Data'
              : 'Arrival feed unavailable'}
          </h3>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">{error}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              <span>Retry Live Feed</span>
            </button>
            {dataSource === 'live' && (
              <button
                type="button"
                onClick={() => onChangeDataSource('preview')}
                className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <span>Use Preview Data</span>
              </button>
            )}
          </div>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="font-display text-base font-semibold text-slate-900">
            {serviceQuery || filterMode === 'pinned'
              ? 'No matching bus services'
              : 'No active bus arrivals'}
          </p>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            {serviceQuery || filterMode === 'pinned'
              ? 'Try clearing your service filter to see all buses serving this stop.'
              : 'No services are currently scheduled or transmitting arrivals for this stop.'}
          </p>
          {(serviceQuery || filterMode === 'pinned') && (
            <button
              type="button"
              onClick={() => {
                setServiceQuery('');
                setFilterMode('all');
              }}
              className="mt-4 px-4 py-2 min-h-[40px] text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
            >
              Show All Services
            </button>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {filteredServices.map((svc) => {
            const isPinned = pinnedSet.has(svc.ServiceNo);
            const isExpanded = expandedService === svc.ServiceNo;

            return (
              <li key={svc.ServiceNo} className="transition-colors hover:bg-slate-50/70">
                <div className="px-5 sm:px-6 py-4 grid grid-cols-1 md:grid-cols-12 gap-3.5 md:gap-4 items-center">
                  {/* Service Plate + Destination */}
                  <div className="md:col-span-5 flex items-center justify-between md:justify-start gap-3.5 min-w-0">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedService(isExpanded ? null : svc.ServiceNo)
                      }
                      aria-expanded={isExpanded}
                      className="flex items-center gap-3.5 min-w-0 text-left flex-1 group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 rounded-lg"
                    >
                      <span className="font-mono text-base font-bold text-white bg-slate-900 group-hover:bg-teal-800 transition-colors rounded-lg min-w-[58px] h-10 px-2.5 flex items-center justify-center shrink-0 tabular-nums">
                        {svc.ServiceNo}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-slate-900 truncate">
                            {svc.destinationName ?? 'Terminal Loop'}
                          </span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                            aria-hidden="true"
                          />
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {svc.Operator} · Freq {svc.frequencyRange ?? '8–12 min'}
                        </p>
                      </div>
                    </button>

                    {/* Mobile Pin Button */}
                    <button
                      type="button"
                      onClick={() => onTogglePinService(stopCode, svc.ServiceNo)}
                      aria-label={
                        isPinned
                          ? `Unpin service ${svc.ServiceNo}`
                          : `Pin service ${svc.ServiceNo} to top`
                      }
                      className="md:hidden min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 transition-colors shrink-0"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          isPinned ? 'text-amber-500 fill-amber-500' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  {/* Arrival Slots (3 columns on both mobile and desktop) */}
                  <div className="grid grid-cols-3 md:col-span-6 gap-3 sm:gap-5 pt-2 md:pt-0 border-t border-slate-100 md:border-t-0">
                    <div>
                      <span className="md:hidden block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                        Next
                      </span>
                      <BusSlotCell slot={svc.NextBus} nowMs={nowMs} isPrimary />
                    </div>
                    <div>
                      <span className="md:hidden block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                        2nd
                      </span>
                      <BusSlotCell slot={svc.NextBus2} nowMs={nowMs} />
                    </div>
                    <div>
                      <span className="md:hidden block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                        3rd
                      </span>
                      <BusSlotCell slot={svc.NextBus3} nowMs={nowMs} />
                    </div>
                  </div>

                  {/* Desktop Pin Button */}
                  <div className="hidden md:flex md:col-span-1 justify-end">
                    <button
                      type="button"
                      onClick={() => onTogglePinService(stopCode, svc.ServiceNo)}
                      aria-label={
                        isPinned
                          ? `Unpin service ${svc.ServiceNo}`
                          : `Pin service ${svc.ServiceNo} to top`
                      }
                      title={isPinned ? 'Pinned to top' : 'Pin service to top'}
                      className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 transition-colors"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          isPinned ? 'text-amber-500 fill-amber-500' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>

                {/* Expandable Service Metadata Drawer */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-4 pt-1 bg-slate-50/80 border-t border-slate-100 text-xs text-slate-600 flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div>
                      <span className="text-slate-400">Operator: </span>
                      <span className="font-medium text-slate-800">
                        {getOperatorFullName(svc.Operator)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">First / Last Bus: </span>
                      <span className="font-mono font-medium text-slate-800 tabular-nums">
                        {svc.firstLastBus ?? '05:30 – 23:45'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Tracking: </span>
                      <span className="font-medium text-slate-800">
                        {svc.NextBus.Monitored === 1 ? 'Live GPS Schedule' : 'Timetable Estimate'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Next Fleet: </span>
                      <span className="font-medium text-slate-800">
                        {getBusTypeLabel(svc.NextBus.Type).full}
                      </span>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
