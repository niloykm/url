import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Search, ChevronDown, Check } from 'lucide-react';
import { Station } from '../types/railway';
import { STATIONS } from '../data/railway';

interface StationSelectorProps {
  label: string;
  labelBn: string;
  selectedStationCode: string;
  onSelectStation: (stationCode: string) => void;
  excludeCode?: string;
  isBengali?: boolean;
}

const HUB_STATIONS = ['DA', 'DA_AIR', 'CTG', 'RJ', 'NAT', 'SYL', 'KLN'];

export const StationSelector: React.FC<StationSelectorProps> = ({
  label,
  labelBn,
  selectedStationCode,
  onSelectStation,
  excludeCode,
  isBengali = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedStation: Station | undefined = STATIONS.find((s: Station) => s.code === selectedStationCode);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredStations = STATIONS.filter((s) => {
    if (excludeCode && s.code === excludeCode) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.nameBn.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.division.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative flex-1" ref={containerRef}>
      <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
        {isBengali ? labelBn : label}
      </label>

      {/* Combobox Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-11 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md flex items-center justify-between text-left hover:border-zinc-300 dark:hover:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all active:scale-[0.99]"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          {selectedStation ? (
            <div className="truncate">
              <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mr-2">
                {isBengali ? selectedStation.nameBn : selectedStation.name}
              </span>
              <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold tabular-nums">
                [{selectedStation.code}]
              </span>
            </div>
          ) : (
            <span className="text-zinc-400 text-sm">Select Station...</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Quick Select Hub Chips */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        <span className="text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500">Hubs:</span>
        {HUB_STATIONS.filter((code) => code !== excludeCode).map((code) => {
          const station = STATIONS.find((s) => s.code === code);
          if (!station) return null;
          const isSelected = selectedStationCode === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => {
                onSelectStation(code);
                setIsOpen(false);
              }}
              className={`text-[11px] px-2 py-0.5 rounded transition-all active:scale-[0.97] ${
                isSelected
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
              }`}
            >
              {station.name.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {/* Dropdown Station List */}
      {isOpen && (
        <div className="absolute z-40 left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-xl max-h-72 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 sticky top-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search station name, code, division..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {filteredStations.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-400">
                No matching railway station found
              </div>
            ) : (
              filteredStations.map((station) => {
                const isSelected = station.code === selectedStationCode;
                return (
                  <button
                    key={station.code}
                    type="button"
                    onClick={() => {
                      onSelectStation(station.code);
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className={`w-full px-3 py-2.5 text-left flex items-center justify-between text-xs transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-950/30 ${
                      isSelected ? 'bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-semibold' : 'text-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {isBengali ? station.nameBn : station.name}
                        </span>
                        <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold tabular-nums">
                          {station.code}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-2 mt-0.5">
                        <span>{station.division} DIVISION</span>
                        {station.platforms && (
                          <span className="font-mono tabular-nums">
                            • {station.platforms} Platform{station.platforms > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
