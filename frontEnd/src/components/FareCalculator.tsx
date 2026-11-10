import React from 'react';
import { Calculator, Info } from 'lucide-react';
import { SeatClass } from '../types/railway';
import { SEAT_CLASS_META, calculateFares } from '../data/railway';

interface FareCalculatorProps {
  distanceKm: number;
  availableClasses: SeatClass[];
  selectedClass: SeatClass;
  onSelectClass: (cls: SeatClass) => void;
  isBengali: boolean;
  onProceedToTicket?: () => void;
}

export const FareCalculator: React.FC<FareCalculatorProps> = ({
  distanceKm,
  availableClasses,
  selectedClass,
  onSelectClass,
  isBengali,
  onProceedToTicket,
}) => {
  const fares = calculateFares(distanceKm, availableClasses);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 gap-2">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {isBengali ? 'ভাড়ার তালিকা ও সিট বিন্যাস' : 'Fare Matrix & Seat Class Breakdown'}
          </h2>
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono tabular-nums flex items-center gap-2">
          <span>Official Tariff Baseline</span>
          <span>•</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{distanceKm} KM</span>
        </div>
      </div>

      {/* High-Density Fare Matrix Table */}
      <div className="overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              <th className="py-2.5 px-3">Seat Class</th>
              <th className="py-2.5 px-3 text-right">Base Fare</th>
              <th className="py-2.5 px-3 text-right">VAT (15%)</th>
              <th className="py-2.5 px-3 text-right">BR Fee</th>
              <th className="py-2.5 px-3 text-right font-bold text-zinc-900 dark:text-zinc-100">Total Fare</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 font-mono tabular-nums">
            {availableClasses.map((sc) => {
              const meta = SEAT_CLASS_META[sc] || { name: sc, nameBn: sc, description: '' };
              const fare = fares[sc];
              const isSelected = selectedClass === sc;
              const hasSeats = fare.available > 0;

              return (
                <tr
                  key={sc}
                  onClick={() => onSelectClass(sc)}
                  className={`transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/10 dark:bg-emerald-950/30 font-medium'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {isBengali ? meta.nameBn : meta.name}
                      </span>
                      <span className="text-[10px] px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-mono font-bold">
                        {sc}
                      </span>
                    </div>
                    <p className="font-sans text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 hidden sm:block">
                      {meta.description}
                    </p>
                  </td>

                  <td className="py-3 px-3 text-right text-zinc-700 dark:text-zinc-300">
                    ৳ {fare.base}
                  </td>

                  <td className="py-3 px-3 text-right text-zinc-700 dark:text-zinc-300">
                    {fare.vat > 0 ? `৳ ${fare.vat}` : '৳ 0'}
                  </td>

                  <td className="py-3 px-3 text-right text-zinc-500">
                    ৳ {fare.fee}
                  </td>

                  <td className="py-3 px-3 text-right font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    ৳ {fare.total}
                  </td>

                  <td className="py-3 px-3 text-center">
                    {hasSeats ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Available ({fare.available})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        Sold Out
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectClass(sc);
                        if (onProceedToTicket) onProceedToTicket();
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-sans font-semibold transition-all active:scale-[0.98] ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Surcharge policy notice */}
      <div className="flex items-start gap-2 p-2.5 bg-zinc-50 dark:bg-zinc-950/50 rounded-md border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
        <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
        <p>
          Includes mandatory Bangladesh Railway online reservation charge of ৳ 50 per ticket. 15% VAT is strictly levied only on AC seat/berth accommodations according to national railway statutory policy.
        </p>
      </div>
    </div>
  );
};
