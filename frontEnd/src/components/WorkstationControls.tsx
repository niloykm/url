import React from 'react';
import { ArrowLeftRight, Compass, TrainTrack } from 'lucide-react';
import { StationSelector } from './StationSelector';
import { TRAINS } from '../data/railway';
import { SeatClass } from '../types/railway';

interface WorkstationControlsProps {
  mode: 'JOURNEY' | 'TRACKER';
  setMode: (mode: 'JOURNEY' | 'TRACKER') => void;
  fromStationCode: string;
  setFromStationCode: (code: string) => void;
  toStationCode: string;
  setToStationCode: (code: string) => void;
  travelDate: string;
  setTravelDate: (date: string) => void;
  selectedClass: SeatClass | 'ALL';
  setSelectedClass: (cls: SeatClass | 'ALL') => void;
  selectedTrainNumber: string;
  setSelectedTrainNumber: (trainNum: string) => void;
  onSwapStations: () => void;
  isBengali: boolean;
  onResetSearch: () => void;
}

const CLASS_OPTIONS: { id: SeatClass | 'ALL'; label: string; labelBn: string }[] = [
  { id: 'ALL', label: 'All Classes', labelBn: 'সকল শ্রেণি' },
  { id: 'SNIGDHA', label: 'Snigdha (AC)', labelBn: 'স্নিগ্ধা' },
  { id: 'S_CHAIR', label: 'Shovan Chair', labelBn: 'শোভন চেয়ার' },
  { id: 'SHOVAN', label: 'Shovan', labelBn: 'শোভন' },
  { id: 'AC_B', label: 'AC Berth', labelBn: 'এসি বার্থ' },
  { id: 'AC_S', label: 'AC Seat', labelBn: 'এসি সিট' },
];

const POPULAR_TRAINS = [
  { number: '702', name: 'Subarna (702)' },
  { number: '787', name: 'Sonar Bangla (787)' },
  { number: '753', name: 'Silk City (753)' },
  { number: '759', name: 'Padma (759)' },
  { number: '709', name: 'Parabat (709)' },
  { number: '726', name: 'Sundarban (726)' },
  { number: '771', name: 'Rangpur (771)' },
];

export const WorkstationControls: React.FC<WorkstationControlsProps> = ({
  mode,
  setMode,
  fromStationCode,
  setFromStationCode,
  toStationCode,
  setToStationCode,
  travelDate,
  setTravelDate,
  selectedClass,
  setSelectedClass,
  selectedTrainNumber,
  setSelectedTrainNumber,
  onSwapStations,
  isBengali,
}) => {
  const [isRotating, setIsRotating] = React.useState(false);

  const handleSwap = () => {
    setIsRotating(true);
    onSwapStations();
    setTimeout(() => setIsRotating(false), 300);
  };

  const handleDateOffset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setTravelDate(`${yyyy}-${mm}-${dd}`);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 sm:p-5 shadow-sm">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-950 rounded-md border border-zinc-200 dark:border-zinc-800 mb-4">
        <button
          type="button"
          onClick={() => setMode('JOURNEY')}
          className={`flex-1 py-2 px-3 rounded text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            mode === 'JOURNEY'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{isBengali ? 'মোড ১: যাত্রা ও ট্রেনের সময়সূচী' : 'Mode A: Journey & Train Search'}</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('TRACKER')}
          className={`flex-1 py-2 px-3 rounded text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            mode === 'TRACKER'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <TrainTrack className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{isBengali ? 'মোড ২: রুট ও সরাসরি ট্র্যাকার' : 'Mode B: Train Route & Live Tracker'}</span>
        </button>
      </div>

      {mode === 'JOURNEY' ? (
        /* MODE A: JOURNEY SEARCH */
        <div className="space-y-4">
          {/* Station Selection Grid with 1-click Fast Swap */}
          <div className="flex flex-col md:flex-row items-stretch md:items-end gap-2.5">
            <StationSelector
              label="Origin Station"
              labelBn="যাত্রা শুরুর স্টেশন"
              selectedStationCode={fromStationCode}
              onSelectStation={setFromStationCode}
              excludeCode={toStationCode}
              isBengali={isBengali}
            />

            {/* Fast 1-click Swap Button with 180 deg rotation feedback */}
            <div className="flex justify-center md:pb-6">
              <button
                type="button"
                onClick={handleSwap}
                aria-label="Swap Origin and Destination"
                title="Swap Origin and Destination / স্টেশন অদলবদল"
                className="h-11 w-11 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 transition-all active:scale-[0.96] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <ArrowLeftRight
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isRotating ? 'rotate-180 scale-110 text-emerald-600' : ''
                  }`}
                />
              </button>
            </div>

            <StationSelector
              label="Destination Station"
              labelBn="গন্তব্য স্টেশন"
              selectedStationCode={toStationCode}
              onSelectStation={setToStationCode}
              excludeCode={fromStationCode}
              isBengali={isBengali}
            />
          </div>

          {/* Secondary Controls: Date Picker & Class Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
            {/* Travel Date */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>{isBengali ? 'যাত্রার তারিখ' : 'Travel Date'}</span>
                <span className="text-[10px] text-zinc-400 font-normal">Next 10 days</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full h-10 px-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-xs font-mono tabular-nums text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              {/* Quick Date offsets */}
              <div className="flex items-center gap-1.5 mt-1.5">
                <button
                  type="button"
                  onClick={() => handleDateOffset(0)}
                  className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 active:scale-[0.97]"
                >
                  {isBengali ? 'আজ' : 'Today'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDateOffset(1)}
                  className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 active:scale-[0.97]"
                >
                  {isBengali ? '+১ দিন' : '+1 Day'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDateOffset(2)}
                  className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 active:scale-[0.97]"
                >
                  {isBengali ? '+২ দিন' : '+2 Days'}
                </button>
              </div>
            </div>

            {/* Travel Class Selector */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                {isBengali ? 'শ্রেণি নির্বাচন' : 'Travel Class Filter'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CLASS_OPTIONS.map((opt) => {
                  const isSelected = selectedClass === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedClass(opt.id)}
                      className={`h-9 px-3 rounded-md text-xs font-medium transition-all active:scale-[0.98] ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500'
                      }`}
                    >
                      {isBengali ? opt.labelBn : opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* MODE B: DIRECT TRAIN ROUTE & LIVE TRACKER */
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              {isBengali ? 'ট্রেন নম্বর অথবা নাম নির্বাচন করুন' : 'Select Train Number / Name'}
            </label>
            <div className="relative">
              <select
                value={selectedTrainNumber}
                onChange={(e) => setSelectedTrainNumber(e.target.value)}
                className="w-full h-11 px-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                {TRAINS.map((t) => (
                  <option key={t.trainNumber} value={t.trainNumber}>
                    [{t.trainNumber}] {t.trainName} ({t.trainNameBn}) — {t.originStationCode} ➔ {t.destinationStationCode} ({t.departureTime})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Train Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              <span className="text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500">Popular:</span>
              {POPULAR_TRAINS.map((train) => {
                const isSelected = selectedTrainNumber === train.number;
                return (
                  <button
                    key={train.number}
                    type="button"
                    onClick={() => setSelectedTrainNumber(train.number)}
                    className={`text-xs px-2.5 py-1 rounded-md transition-all active:scale-[0.97] ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-mono font-medium'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                    }`}
                  >
                    {train.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
