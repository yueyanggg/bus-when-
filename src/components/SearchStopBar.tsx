import { ArrowRight, Clock, Search, Star, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { getStopByCode, searchBusStops } from '../services/busApi';
import { BusStop } from '../types/bus';

interface SearchStopBarProps {
  activeStopCode: string;
  recentStopCodes: string[];
  favoriteCodes: Set<string>;
  onSelectStop: (stopCode: string) => void;
}

export function SearchStopBar({
  activeStopCode,
  recentStopCodes,
  favoriteCodes,
  onSelectStop,
}: SearchStopBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.trim();
  const isFiveDigitCode = /^\d{5}$/.test(trimmed);
  const matches = trimmed ? searchBusStops(trimmed).slice(0, 7) : [];

  const recentStops = recentStopCodes
    .map((code) => getStopByCode(code))
    .filter((s): s is BusStop => Boolean(s))
    .slice(0, 5);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  function commitStop(code: string) {
    onSelectStop(code);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isFiveDigitCode) {
      commitStop(trimmed);
      return;
    }
    if (matches.length > 0) {
      const target = matches[highlightedIndex] ?? matches[0];
      commitStop(target.BusStopCode);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }
    const listLength = trimmed ? matches.length : recentStops.length;
    if (!listLength) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((prev) => (prev + 1) % listLength);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((prev) => (prev - 1 + listLength) % listLength);
    }
  }

  const showDropdown = isOpen && (trimmed.length > 0 || recentStops.length > 0);

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} role="search" aria-label="Search Singapore bus stop code">
        <div className="flex items-center gap-2 bg-white border border-slate-300 focus-within:border-teal-700 focus-within:ring-2 focus-within:ring-teal-700/15 rounded-xl px-3.5 py-1.5 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            inputMode="search"
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Enter 5-digit stop code (e.g. 09048) or road name"
            aria-label="Bus stop code or road name"
            className="w-full min-h-[38px] bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}

          <button
            type="submit"
            disabled={!trimmed || (!isFiveDigitCode && matches.length === 0)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[36px] text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:bg-slate-200 disabled:text-slate-400 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <span>Lookup</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </form>

      {showDropdown && (
        <div className="absolute left-0 right-0 mt-2 z-40 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {trimmed ? (
            <>
              {matches.length > 0 ? (
                <ul role="listbox" className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {matches.map((stop, idx) => {
                    const isSelected = idx === highlightedIndex;
                    const isCurrent = stop.BusStopCode === activeStopCode;
                    const isFav = favoriteCodes.has(stop.BusStopCode);
                    return (
                      <li key={stop.BusStopCode}>
                        <button
                          type="button"
                          onClick={() => commitStop(stop.BusStopCode)}
                          className={`w-full text-left px-4 py-3 min-h-[52px] flex items-center justify-between gap-3 transition-colors ${
                            isSelected ? 'bg-slate-50' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200/80 px-1.5 py-0.5 rounded">
                                {stop.BusStopCode}
                              </span>
                              <span className="text-sm font-semibold text-slate-900 truncate">
                                {stop.Description}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-slate-500 truncate">
                              {stop.RoadName} · {stop.Services.length} services
                              {stop.mrtNearby ? ` · ${stop.mrtNearby}` : ''}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isFav && (
                              <Star
                                className="w-3.5 h-3.5 text-amber-500 fill-amber-500"
                                aria-label="Saved in favourites"
                              />
                            )}
                            {isCurrent && (
                              <span className="text-xs font-medium text-teal-700">Active</span>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : isFiveDigitCode ? (
                <button
                  type="button"
                  onClick={() => commitStop(trimmed)}
                  className="w-full text-left px-4 py-3.5 hover:bg-slate-50 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded">
                        {trimmed}
                      </span>
                      <span className="text-sm font-medium text-slate-900">
                        Check Bus Stop {trimmed}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Preview arrival board for unlisted 5-digit stop code
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-teal-700 shrink-0" aria-hidden="true" />
                </button>
              ) : (
                <div className="px-4 py-4 text-sm text-slate-500">
                  No stops match "{trimmed}". Enter any 5-digit Singapore bus stop code (e.g.{' '}
                  <button
                    type="button"
                    onClick={() => commitStop('09048')}
                    className="font-mono text-teal-700 underline underline-offset-2"
                  >
                    09048
                  </button>
                  ) to look up arrivals.
                </div>
              )}
            </>
          ) : (
            <div>
              <div className="px-4 py-2 border-b border-slate-100 text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Recent Bus Stops</span>
              </div>
              <ul className="divide-y divide-slate-100">
                {recentStops.map((stop, idx) => (
                  <li key={stop.BusStopCode}>
                    <button
                      type="button"
                      onClick={() => commitStop(stop.BusStopCode)}
                      className={`w-full text-left px-4 py-2.5 min-h-[48px] flex items-center justify-between gap-3 transition-colors ${
                        idx === highlightedIndex ? 'bg-slate-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                          {stop.BusStopCode}
                        </span>
                        <span className="text-sm font-medium text-slate-900 truncate">
                          {stop.Description}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 shrink-0">{stop.RoadName}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
