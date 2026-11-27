import { Bookmark, ChevronRight, MapPin, Star, X } from 'lucide-react';
import { SINGAPORE_BUS_STOPS } from '../data/singaporeStops';
import { getStopByCode } from '../services/busApi';
import { FavoriteStop } from '../types/bus';

interface FavoritesSidebarProps {
  favorites: FavoriteStop[];
  activeStopCode: string;
  onSelectStop: (stopCode: string) => void;
  onRemoveFavorite: (stopCode: string) => void;
  onViewAllFavorites: () => void;
}

const QUICK_STOP_CODES = ['09048', '04121', '14141', '52009', '75009', '28009'];

export function FavoritesSidebar({
  favorites,
  activeStopCode,
  onSelectStop,
  onRemoveFavorite,
  onViewAllFavorites,
}: FavoritesSidebarProps) {
  const quickStops = QUICK_STOP_CODES.map((code) => getStopByCode(code)).filter(
    (stop): stop is NonNullable<typeof stop> => Boolean(stop)
  );

  return (
    <aside className="space-y-6" aria-label="Saved stops and quick access">
      {/* Saved Favourites */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" aria-hidden="true" />
            <h2 className="font-display text-sm font-semibold text-slate-900">
              Saved Favourites
            </h2>
          </div>
          {favorites.length > 0 && (
            <button
              type="button"
              onClick={onViewAllFavorites}
              className="text-xs font-medium text-teal-700 hover:text-teal-800 whitespace-nowrap"
            >
              Manage ({favorites.length})
            </button>
          )}
        </div>

        {favorites.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <Bookmark className="w-5 h-5 text-slate-300 mx-auto mb-2" aria-hidden="true" />
            <p className="text-sm font-medium text-slate-700">No favourite stops yet</p>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Star any bus stop on the arrival board for instant one-tap access.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {favorites.map((fav) => {
              const stop = getStopByCode(fav.BusStopCode);
              const isActive = fav.BusStopCode === activeStopCode;
              const title = fav.customLabel?.trim() || stop?.Description || `Bus Stop ${fav.BusStopCode}`;
              const subtitle = stop ? `${stop.RoadName}` : 'Custom stop code';

              return (
                <li
                  key={fav.BusStopCode}
                  className={`group flex items-center justify-between gap-2 transition-colors ${
                    isActive ? 'bg-teal-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectStop(fav.BusStopCode)}
                    className="flex-1 min-w-0 text-left px-4 py-3 min-h-[52px] flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-teal-700"
                  >
                    <span
                      className={`font-mono text-xs font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                        isActive
                          ? 'bg-teal-700 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {fav.BusStopCode}
                    </span>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          isActive ? 'text-teal-950' : 'text-slate-900'
                        }`}
                      >
                        {title}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {subtitle}
                        {fav.pinnedServices.length > 0
                          ? ` · Pinned: ${fav.pinnedServices.join(', ')}`
                          : ''}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemoveFavorite(fav.BusStopCode)}
                    aria-label={`Remove ${title} from favourites`}
                    className="mr-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-rose-600 rounded-lg transition-colors opacity-75 group-hover:opacity-100"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Popular Interchange & MRT Stops */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-500" aria-hidden="true" />
            <h2 className="font-display text-sm font-semibold text-slate-900">
              Major Hubs
            </h2>
          </div>
          <span className="text-xs text-slate-400 tabular-nums">
            {SINGAPORE_BUS_STOPS.length} stops indexed
          </span>
        </div>

        <ul className="divide-y divide-slate-100">
          {quickStops.map((stop) => {
            const isActive = stop.BusStopCode === activeStopCode;
            return (
              <li key={stop.BusStopCode}>
                <button
                  type="button"
                  onClick={() => onSelectStop(stop.BusStopCode)}
                  className={`w-full text-left px-4 py-2.5 min-h-[48px] flex items-center justify-between gap-2 transition-colors ${
                    isActive ? 'bg-slate-100/80' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono text-xs font-medium text-slate-600 shrink-0">
                      {stop.BusStopCode}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {stop.Description}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{stop.RoadName}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </aside>
  );
}
