import React, { useState } from 'react';
import { Clock, ArrowRight, ArrowUpDown, ChevronRight } from 'lucide-react';
import { Train, SeatClass } from '../types/railway';
import { calculateFares } from '../data/railway';

interface ScheduleTableProps {
  trains: Train[];
  selectedTrainNumber: string;
  onSelectTrain: (trainNumber: string) => void;
  selectedClass: SeatClass | 'ALL';
  isBengali: boolean;
}

type SortField = 'DEPARTURE' | 'DURATION' | 'AVAILABILITY';

export const ScheduleTable: React.FC<ScheduleTableProps> = ({
  trains,
  selectedTrainNumber,
  onSelectTrain,
  selectedClass,
  isBengali,
}) => {
  const [sortField, setSortField] = useState<SortField>('DEPARTURE');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedTrains = [...trains].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'DEPARTURE') {
      cmp = a.departureTime.localeCompare(b.departureTime);
    } else if (sortField === 'DURATION') {
      cmp = a.durationMinutes - b.durationMinutes;
    } else if (sortField === 'AVAILABILITY') {
      const aFare = calculateFares(a.totalDistanceKm, a.availableClasses);
      const bFare = calculateFares(b.totalDistanceKm, b.availableClasses);
      const aAvail = Object.values(aFare).reduce((acc: number, curr: { available: number }) => acc + curr.available, 0);
      const bAvail = Object.values(bFare).reduce((acc: number, curr: { available: number }) => acc + curr.available, 0);
      cmp = aAvail - bAvail;
    }
    return sortAsc ? cmp : -cmp;
  });

  if (trains.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8 text-center shadow-sm">
        <Clock className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
        <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
          {isBengali ? 'কোনো সরাসরি ট্রেন পাওয়া যায়নি' : 'No Direct Train Services Found'}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
          Try swapping your origin/destination or switching to one of the major transit corridors.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 sm:p-5 shadow-sm space-y-4">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {isBengali ? 'ট্রেনের সময়সূচী ও সিট প্রাপ্যতা' : 'Daily Train Timetable & Availability'}
          </h2>
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold tabular-nums">
            {trains.length} {trains.length === 1 ? 'TRAIN' : 'TRAINS'}
          </span>
        </div>

        {/* Sorting Buttons */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[11px] text-zinc-400 uppercase font-semibold">Sort:</span>
          <button
            type="button"
            onClick={() => toggleSort('DEPARTURE')}
            className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors active:scale-[0.98] ${
              sortField === 'DEPARTURE'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <span>Departure</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => toggleSort('DURATION')}
            className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors active:scale-[0.98] ${
              sortField === 'DURATION'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <span>Duration</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => toggleSort('AVAILABILITY')}
            className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors active:scale-[0.98] ${
              sortField === 'AVAILABILITY'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <span>Seats</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* High-Density Train Cards / Table */}
      <div className="space-y-3">
        {sortedTrains.map((train) => {
          const isSelected = selectedTrainNumber === train.trainNumber;
          const fares = calculateFares(train.totalDistanceKm, train.availableClasses);
          const originHalt = train.halts[0];
          const terminusHalt = train.halts[train.halts.length - 1];

          return (
            <div
              key={train.trainNumber}
              onClick={() => onSelectTrain(train.trainNumber)}
              className={`p-3.5 sm:p-4 rounded-md border transition-all cursor-pointer ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 ring-1 ring-emerald-500/50'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Left: Train Code & Route */}
                <div className="flex items-start gap-3">
                  <div className="font-mono text-sm font-bold px-2.5 py-1 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shrink-0 tabular-nums">
                    {train.trainNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                        {isBengali ? train.trainNameBn : train.trainName}
                      </h3>
                      <span className="text-[11px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-medium">
                        {train.routeType}
                      </span>
                      <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400 font-medium">
                        Off: {train.offDays.join(', ')}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-2 flex-wrap font-mono tabular-nums">
                      <span>{originHalt.stationName} ➔ {terminusHalt.stationName}</span>
                      <span>•</span>
                      <span>{train.halts.length} Stoppages</span>
                      <span>•</span>
                      <span>{train.totalDistanceKm} km</span>
                    </div>
                  </div>
                </div>

                {/* Center: Timings & Journey Duration */}
                <div className="flex items-center justify-between sm:justify-start gap-4 font-mono tabular-nums">
                  <div className="text-left sm:text-center">
                    <div className="text-[10px] text-zinc-400 uppercase">Departs</div>
                    <div className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                      {train.departureTime}
                    </div>
                    <div className="text-[10px] text-zinc-500">{originHalt.stationCode}</div>
                  </div>

                  <div className="flex flex-col items-center px-1">
                    <span className="text-[10px] text-zinc-400">{Math.floor(train.durationMinutes / 60)}h {train.durationMinutes % 60}m</span>
                    <div className="w-16 sm:w-20 h-0.5 bg-zinc-300 dark:bg-zinc-700 relative my-1">
                      <ArrowRight className="w-3 h-3 absolute -right-1 -top-1.5 text-zinc-400" />
                    </div>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">
                      {train.liveStatus.state === 'ON_TIME' ? 'On Time' : `+${train.liveStatus.delayMinutes}m`}
                    </span>
                  </div>

                  <div className="text-right sm:text-center">
                    <div className="text-[10px] text-zinc-400 uppercase">Arrives</div>
                    <div className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                      {train.arrivalTime}
                    </div>
                    <div className="text-[10px] text-zinc-500">{terminusHalt.stationCode}</div>
                  </div>
                </div>

                {/* Right: Seat Availability Pills & Inspect button */}
                <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800">
                  <div className="flex flex-wrap gap-1.5 font-mono tabular-nums">
                    {train.availableClasses.map((cls) => {
                      const fare = fares[cls];
                      if (!fare) return null;
                      const isTarget = selectedClass === cls || selectedClass === 'ALL';
                      return (
                        <div
                          key={cls}
                          className={`px-2 py-1 rounded text-[11px] border flex flex-col items-center ${
                            isTarget
                              ? 'bg-zinc-50 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700'
                              : 'opacity-50 border-transparent'
                          }`}
                        >
                          <span className="text-[10px] font-sans font-semibold text-zinc-500 dark:text-zinc-400">
                            {cls}
                          </span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            ৳{fare.total}
                          </span>
                          <span className="text-[9px] text-zinc-400">
                            {fare.available} seats
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTrain(train.trainNumber);
                    }}
                    className={`h-9 px-3 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 active:scale-[0.98] ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    <span>{isSelected ? 'Viewing' : 'Inspect'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
