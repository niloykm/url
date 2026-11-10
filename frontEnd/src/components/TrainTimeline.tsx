import React from 'react';
import { Clock, Navigation, CheckCircle2, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';
import { Train } from '../types/railway';

interface TrainTimelineProps {
  train: Train;
  isBengali: boolean;
}

export const TrainTimeline: React.FC<TrainTimelineProps> = ({ train, isBengali }) => {
  const { halts, liveStatus } = train;

  const getStatusBadge = () => {
    switch (liveStatus.state) {
      case 'ON_TIME':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            ON TIME (সময়মত)
          </span>
        );
      case 'DELAYED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-mono">
            <AlertTriangle className="w-3.5 h-3.5" />
            DELAYED +{liveStatus.delayMinutes} MIN ({liveStatus.delayMinutes} মি. বিলম্ব)
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/30 font-mono">
            <Clock className="w-3.5 h-3.5" />
            SCHEDULED (নির্ধারিত)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 sm:p-5 shadow-sm space-y-4">
      {/* Train Live Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-base font-bold px-2 py-0.5 rounded bg-emerald-600 text-white tabular-nums">
              {train.trainNumber}
            </span>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {isBengali ? train.trainNameBn : train.trainName}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
              {train.routeType}
            </span>
          </div>

          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-3 flex-wrap font-mono tabular-nums">
            <span>Distance: {train.totalDistanceKm} km</span>
            <span>•</span>
            <span>Duration: {Math.floor(train.durationMinutes / 60)}h {train.durationMinutes % 60}m</span>
            <span>•</span>
            <span className="text-rose-600 dark:text-rose-400">
              Off-Day: {train.offDays.join(', ')}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-1">
          {getStatusBadge()}
          <span className="text-[10px] text-zinc-400 font-mono">
            Telemetry: {liveStatus.lastUpdated}
          </span>
        </div>
      </div>

      {/* Live tracking banner if active */}
      {liveStatus.nextStationCode && (
        <div className="p-3 bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 rounded-md flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-500 animate-pulse shrink-0" />
            <span className="text-zinc-500 dark:text-zinc-400">Next Approaching Halt:</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">
              {halts.find((h) => h.stationCode === liveStatus.nextStationCode)?.stationName || liveStatus.nextStationCode}
            </span>
          </div>
          {liveStatus.platform && (
            <div className="font-mono text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 tabular-nums">
              Platform: {liveStatus.platform}
            </div>
          )}
        </div>
      )}

      {/* Vertical Transit Stepper */}
      <div className="pt-2">
        <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-500" />
          <span>Chronological Station Progression & Halt Times</span>
        </h3>

        <div className="relative pl-6 sm:pl-8 space-y-6">
          {/* Continuous Vertical Line */}
          <div className="absolute left-[11px] sm:left-[15px] top-2 bottom-3 w-0.5 bg-zinc-300 dark:bg-zinc-700"></div>

          {halts.map((halt, idx) => {
            const isOrigin = idx === 0;
            const isTerminus = idx === halts.length - 1;
            const isNextHalt = halt.stationCode === liveStatus.nextStationCode;
            const isPassed = halt.status === 'passed';
            const isActive = halt.status === 'active' || isNextHalt;

            return (
              <div key={halt.stationCode} className="relative flex items-start justify-between gap-3 text-xs group">
                {/* Node icon */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-0.5 flex items-center justify-center rounded-full transition-all ${
                    isActive
                      ? 'w-6 h-6 -translate-x-[2px] bg-emerald-600 text-white ring-4 ring-emerald-500/20 shadow-sm'
                      : isPassed
                      ? 'w-5 h-5 bg-zinc-700 dark:bg-zinc-600 text-white'
                      : 'w-5 h-5 bg-white dark:bg-zinc-900 border-2 border-zinc-400 dark:border-zinc-600 text-zinc-400'
                  }`}
                >
                  {isPassed ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : isActive ? (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600"></span>
                  )}
                </div>

                {/* Station Info */}
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`font-bold text-sm ${
                        isActive
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-zinc-900 dark:text-zinc-100'
                      }`}
                    >
                      {isBengali ? halt.stationNameBn : halt.stationName}
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-bold tabular-nums">
                      {halt.stationCode}
                    </span>
                    {isActive && (
                      <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold uppercase rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        {isNextHalt ? 'NEXT HALT' : 'CURRENT STATION'}
                      </span>
                    )}
                    {isOrigin && (
                      <span className="px-1.5 py-0.2 text-[10px] font-mono uppercase rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                        ORIGIN
                      </span>
                    )}
                    {isTerminus && (
                      <span className="px-1.5 py-0.2 text-[10px] font-mono uppercase rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                        TERMINUS
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-mono tabular-nums">
                    <span>{halt.platform}</span>
                    <span>•</span>
                    <span>{halt.distanceKm} km from origin</span>
                  </div>
                </div>

                {/* Schedule & Halt Metrics */}
                <div className="text-right shrink-0 font-mono tabular-nums">
                  <div className="flex items-center gap-2 justify-end">
                    <div className="text-[11px] text-zinc-400 dark:text-zinc-500">Arr:</div>
                    <div className="font-semibold text-xs text-zinc-800 dark:text-zinc-200">
                      {halt.arrivalTime}
                    </div>
                    <div className="text-[11px] text-zinc-400 dark:text-zinc-500 ml-1">Dep:</div>
                    <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                      {halt.departureTime}
                    </div>
                  </div>

                  {halt.haltDurationMinutes > 0 && (
                    <div className="mt-0.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800/90 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                        Halt: {String(halt.haltDurationMinutes).padStart(2, '0')}m
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
