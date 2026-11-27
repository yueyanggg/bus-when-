import { ArrowRight, Search, Star } from 'lucide-react';
import { useState } from 'react';
import { SINGAPORE_BUS_STOPS } from '../data/singaporeStops';
import { BusStopRegion } from '../types/bus';

interface StopDirectoryViewProps {
  activeStopCode: string;
  favoriteCodes: Set<string>;
  onSelectStop: (stopCode: string) => void;
  onToggleFavorite: (stopCode: string) => void;
}

const REGIONS: ('All' | BusStopRegion)[] = [
  'All',
  'Central',
  'East',
  'West',
  'North',
  'North-East',
];

export function StopDirectoryView({
  activeStopCode,
  favoriteCodes,
  onSelectStop,
  onToggleFavorite,
}: StopDirectoryViewProps) {
  const [regionFilter, setRegionFilter] = useState<'All' | BusStopRegion>('All');
  const [query, setQuery] = useState('');

  const filteredStops = SINGAPORE_BUS_STOPS.filter((stop) => {
    if (regionFilter !== 'All' && stop.Region !== regionFilter) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      stop.BusStopCode.includes(q) ||
      stop.Description.toLowerCase().includes(q) ||
      stop.RoadName.toLowerCase().includes(q) ||
      (stop.mrtNearby?.toLowerCase().includes(q) ?? false) ||
      stop.Services.some((svc) => svc.toLowerCase() === q)
    );
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
          Singapore Bus Stop Directory
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Browse major bus interchanges and MRT-connected stops across Singapore, or filter by stop code and service number.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg overflow-x-auto">
          {REGIONS.map((region) => {
            const isSelected = regionFilter === region;
            return (
              <button
                key={region}
                type="button"
                onClick={() => setRegionFilter(region)}
                className={`px-3 py-1.5 min-h-[36px] text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {region}
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter stop code, road, bus no..."
            aria-label="Filter directory stops"
            className="w-full pl-9 pr-3 py-2 min-h-[40px] text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
          />
        </div>
      </div>

      {/* Directory Table / List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {filteredStops.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-display text-base font-semibold text-slate-900">
              No bus stops found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try another road name, region, or 5-digit bus stop code.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filteredStops.map((stop) => {
              const isFav = favoriteCodes.has(stop.BusStopCode);
              const isActive = stop.BusStopCode === activeStopCode;

              return (
                <li
                  key={stop.BusStopCode}
                  className={`px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    isActive ? 'bg-teal-50/40' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center flex-wrap gap-2.5">
                      <span className="font-mono text-xs font-bold text-teal-900 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                        {stop.BusStopCode}
                      </span>
                      <h2 className="font-display text-base font-semibold text-slate-900">
                        {stop.Description}
                      </h2>
                      <span className="text-xs text-slate-400">
                        {stop.Region}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">
                      {stop.RoadName}
                      {stop.mrtNearby ? ` · ${stop.mrtNearby}` : ''}
                    </p>

                    <p className="text-xs text-slate-500 font-mono leading-relaxed">
                      Services: {stop.Services.join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(stop.BusStopCode)}
                      aria-label={isFav ? `Remove ${stop.Description} from favourites` : `Save ${stop.Description}`}
                      className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg border transition-colors ${
                        isFav
                          ? 'bg-amber-50 border-amber-300 text-amber-500'
                          : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500'
                      }`}
                    >
                      <Star
                        className={`w-4 h-4 ${isFav ? 'fill-amber-500' : ''}`}
                        aria-hidden="true"
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectStop(stop.BusStopCode)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
                    >
                      <span>Arrivals</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
