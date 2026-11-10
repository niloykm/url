import React from 'react';
import { Radio, Sun, Moon, Train as TrainIcon } from 'lucide-react';
import { TRANSIT_CORRIDORS } from '../data/railway';
import { TransitCorridor } from '../types/railway';

interface TopStatusBarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onSelectCorridor: (corridor: TransitCorridor) => void;
  activeCorridorId?: string;
  isBengali: boolean;
  setIsBengali: (val: boolean) => void;
}

export const TopStatusBar: React.FC<TopStatusBarProps> = ({
  darkMode,
  setDarkMode,
  onSelectCorridor,
  activeCorridorId,
  isBengali,
  setIsBengali,
}) => {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors">
      {/* Primary operational bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-emerald-600 text-white flex items-center justify-center font-mono font-bold text-lg shadow-sm">
            <TrainIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold tracking-tight text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
                NRL
              </span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                TRANSIT OPS
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-none">
              {isBengali ? 'বাংলাদেশ রেলওয়ে ভ্রমণ ও রুট ইন্টেলিজেন্স' : 'Bangladesh Railway Journey & Route Intelligence'}
            </p>
          </div>
        </div>

        {/* Live System Signal & Controls */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-xs">
          {/* BR Server Gateway Status */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-[11px] tracking-wide">BR GATEWAY: OPERATIONAL</span>
            <span className="text-[10px] opacity-75 hidden sm:inline tabular-nums">38ms</span>
          </div>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={() => setIsBengali(!isBengali)}
            className="px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium transition-colors text-xs active:scale-[0.98]"
            title="Toggle Language / ভাষা পরিবর্তন"
          >
            {isBengali ? 'English' : 'বাংলা'}
          </button>

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors active:scale-[0.98]"
            aria-label="Toggle Theme"
            title={darkMode ? "Switch to High-Contrast Light Mode" : "Switch to Dark Canvas"}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
          </button>
        </div>
      </div>

      {/* Corridor Quick-Selector Ribbon */}
      <div className="border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/50 overflow-x-auto py-1.5 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs min-w-max">
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Corridors:
          </span>
          {TRANSIT_CORRIDORS.map((corridor) => {
            const isActive = activeCorridorId === corridor.id;
            return (
              <button
                key={corridor.id}
                type="button"
                onClick={() => onSelectCorridor(corridor)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all active:scale-[0.98] ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-500'
                }`}
              >
                <span>{isBengali ? corridor.labelBn : corridor.label}</span>
                <span className={`text-[10px] font-mono tabular-nums ${isActive ? 'text-emerald-100' : 'text-zinc-400'}`}>
                  {corridor.distanceKm}km
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
