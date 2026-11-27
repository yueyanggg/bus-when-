import { ArrowRight, Bookmark, Edit3, Star, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { getStopByCode } from '../services/busApi';
import { FavoriteStop } from '../types/bus';

interface FavoritesViewProps {
  favorites: FavoriteStop[];
  onSelectStop: (stopCode: string) => void;
  onRemoveFavorite: (stopCode: string) => void;
  onUpdateLabel: (stopCode: string, label: string) => void;
  onBrowseDirectory: () => void;
}

export function FavoritesView({
  favorites,
  onSelectStop,
  onRemoveFavorite,
  onUpdateLabel,
  onBrowseDirectory,
}: FavoritesViewProps) {
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [draftLabel, setDraftLabel] = useState('');

  function startEdit(fav: FavoriteStop) {
    setEditingCode(fav.BusStopCode);
    setDraftLabel(fav.customLabel ?? '');
  }

  function handleSave(e: React.FormEvent, code: string) {
    e.preventDefault();
    onUpdateLabel(code, draftLabel.trim());
    setEditingCode(null);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
            Saved Favourites
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your bookmarked Singapore bus stops, custom nicknames, and pinned bus services.
          </p>
        </div>
        <button
          type="button"
          onClick={onBrowseDirectory}
          className="px-4 py-2 min-h-[40px] text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors self-start sm:self-auto whitespace-nowrap"
        >
          Browse Bus Stop Directory
        </button>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl px-6 py-14 text-center">
          <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-3" aria-hidden="true" />
          <h2 className="font-display text-lg font-semibold text-slate-900">
            No saved bus stops yet
          </h2>
          <p className="mt-1.5 text-sm text-slate-500 max-w-md mx-auto">
            Search for a 5-digit bus stop code or explore the directory, then click "Save Stop" to keep your daily commute stops one tap away.
          </p>
          <button
            type="button"
            onClick={onBrowseDirectory}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <span>Explore Singapore Stops</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((fav) => {
            const stop = getStopByCode(fav.BusStopCode);
            const isEditing = editingCode === fav.BusStopCode;
            const title = fav.customLabel?.trim() || stop?.Description || `Bus Stop ${fav.BusStopCode}`;

            return (
              <article
                key={fav.BusStopCode}
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-teal-900 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                          {fav.BusStopCode}
                        </span>
                        {stop?.Region && (
                          <span className="text-xs text-slate-400">{stop.Region}</span>
                        )}
                      </div>

                      <h2 className="mt-2 font-display text-lg font-bold text-slate-900 truncate">
                        {title}
                      </h2>
                      <p className="text-xs text-slate-500 truncate">
                        {fav.customLabel && stop?.Description ? `${stop.Description} · ` : ''}
                        {stop?.RoadName ?? 'Custom bus stop code'}
                        {stop?.mrtNearby ? ` · ${stop.mrtNearby}` : ''}
                      </p>
                    </div>

                    <Star
                      className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0 mt-1"
                      aria-hidden="true"
                    />
                  </div>

                  {fav.pinnedServices.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                      <span className="text-slate-400">Pinned buses: </span>
                      <span className="font-mono font-semibold text-slate-800">
                        {fav.pinnedServices.join(' · ')}
                      </span>
                    </div>
                  )}

                  {isEditing && (
                    <form
                      onSubmit={(e) => handleSave(e, fav.BusStopCode)}
                      className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2"
                    >
                      <input
                        type="text"
                        maxLength={32}
                        value={draftLabel}
                        onChange={(e) => setDraftLabel(e.target.value)}
                        placeholder="Custom label (e.g. Home)"
                        autoFocus
                        className="flex-1 min-w-0 px-3 py-1.5 min-h-[38px] text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 min-h-[38px] text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCode(null)}
                        className="px-2.5 py-1.5 min-h-[38px] text-xs text-slate-500 hover:text-slate-800"
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(fav)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 min-h-[36px] text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Rename</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemoveFavorite(fav.BusStopCode)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 min-h-[36px] text-xs font-medium text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectStop(fav.BusStopCode)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[38px] text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <span>View Arrivals</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
