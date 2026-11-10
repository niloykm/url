import React, { useState, useMemo, useEffect } from 'react';
import { TopStatusBar } from './components/TopStatusBar';
import { WorkstationControls } from './components/WorkstationControls';
import { ScheduleTable } from './components/ScheduleTable';
import { TrainTimeline } from './components/TrainTimeline';
import { FareCalculator } from './components/FareCalculator';
import { JourneyCard } from './components/JourneyCard';
import { RailwayInfo } from './components/RailwayInfo';
import { TRAINS, TRANSIT_CORRIDORS } from './data/railway';
import { SeatClass, TransitCorridor } from './types/railway';
import { TrainTrack, MapPin, Calculator, Ticket, Info } from 'lucide-react';

export const App: React.FC = () => {
  // Theme state: dark default as requested by DESIGN.md
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [isBengali, setIsBengali] = useState<boolean>(false);

  // Sync theme with HTML class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Primary Mode: 'JOURNEY' (Mode A) or 'TRACKER' (Mode B)
  const [mode, setMode] = useState<'JOURNEY' | 'TRACKER'>('JOURNEY');

  // Search parameters
  const [fromStationCode, setFromStationCode] = useState<string>('DA');
  const [toStationCode, setToStationCode] = useState<string>('RJ');
  const [travelDate, setTravelDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedClass, setSelectedClass] = useState<SeatClass | 'ALL'>('ALL');
  const [activeCorridorId, setActiveCorridorId] = useState<string>('corridor-dhk-raj');

  // Active Train Selection
  const [selectedTrainNumber, setSelectedTrainNumber] = useState<string>('753');

  // Active Tab on Mobile / Right Pane Inspector
  const [activeTab, setActiveTab] = useState<'TIMELINE' | 'FARE' | 'TICKET' | 'INFO'>('TIMELINE');

  // Handle Corridor Quick Selection
  const handleSelectCorridor = (corridor: TransitCorridor) => {
    setFromStationCode(corridor.originCode);
    setToStationCode(corridor.destinationCode);
    setActiveCorridorId(corridor.id);

    // Auto-select first matching train
    const matching = TRAINS.filter(
      (t) =>
        t.halts.some((h) => h.stationCode === corridor.originCode) &&
        t.halts.some((h) => h.stationCode === corridor.destinationCode)
    );
    if (matching.length > 0) {
      setSelectedTrainNumber(matching[0].trainNumber);
    }
  };

  // Station Swapping with 1-click
  const handleSwapStations = () => {
    const temp = fromStationCode;
    setFromStationCode(toStationCode);
    setToStationCode(temp);

    // Check if new pair matches any corridor
    const matchedCorridor = TRANSIT_CORRIDORS.find(
      (c) => c.originCode === toStationCode && c.destinationCode === temp
    );
    setActiveCorridorId(matchedCorridor ? matchedCorridor.id : '');

    // Select train matching reversed route
    const matching = TRAINS.filter(
      (t) =>
        t.halts.some((h) => h.stationCode === toStationCode) &&
        t.halts.some((h) => h.stationCode === temp)
    );
    if (matching.length > 0) {
      setSelectedTrainNumber(matching[0].trainNumber);
    }
  };

  // Filter trains for Journey Search
  const matchingTrains = useMemo(() => {
    return TRAINS.filter((train) => {
      const fromHaltIndex = train.halts.findIndex((h) => h.stationCode === fromStationCode);
      const toHaltIndex = train.halts.findIndex((h) => h.stationCode === toStationCode);

      // Must stop at both stations in directional order
      const stopsAtBothInOrder = fromHaltIndex !== -1 && toHaltIndex !== -1 && fromHaltIndex < toHaltIndex;
      if (!stopsAtBothInOrder) return false;

      // Filter by seat class if not 'ALL'
      if (selectedClass !== 'ALL' && !train.availableClasses.includes(selectedClass)) {
        return false;
      }

      return true;
    });
  }, [fromStationCode, toStationCode, selectedClass]);

  // Selected Train object
  const currentTrain = useMemo(() => {
    return TRAINS.find((t) => t.trainNumber === selectedTrainNumber) || TRAINS[0];
  }, [selectedTrainNumber]);

  // Effective selected seat class for fare calculator and ticket pass
  const effectiveClass: SeatClass = useMemo(() => {
    if (selectedClass !== 'ALL' && currentTrain.availableClasses.includes(selectedClass)) {
      return selectedClass;
    }
    return currentTrain.availableClasses[0] || 'S_CHAIR';
  }, [selectedClass, currentTrain]);

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
      {/* Top Utility & Live Status Bar */}
      <TopStatusBar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onSelectCorridor={handleSelectCorridor}
        activeCorridorId={activeCorridorId}
        isBengali={isBengali}
        setIsBengali={setIsBengali}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 space-y-5">
        {/* Workstation Controls (Search or Live Tracker) */}
        <WorkstationControls
          mode={mode}
          setMode={setMode}
          fromStationCode={fromStationCode}
          setFromStationCode={(code) => {
            setFromStationCode(code);
            setActiveCorridorId('');
          }}
          toStationCode={toStationCode}
          setToStationCode={(code) => {
            setToStationCode(code);
            setActiveCorridorId('');
          }}
          travelDate={travelDate}
          setTravelDate={setTravelDate}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          selectedTrainNumber={selectedTrainNumber}
          setSelectedTrainNumber={setSelectedTrainNumber}
          onSwapStations={handleSwapStations}
          isBengali={isBengali}
          onResetSearch={() => {
            setFromStationCode('DA');
            setToStationCode('CTG');
          }}
        />

        {/* Desktop Split Workstation / Mobile Multi-Pane */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Workstation Pane (5 cols on desktop) */}
          <div className="lg:col-span-5 space-y-4">
            {mode === 'JOURNEY' ? (
              <ScheduleTable
                trains={matchingTrains}
                selectedTrainNumber={selectedTrainNumber}
                onSelectTrain={(num) => {
                  setSelectedTrainNumber(num);
                  setActiveTab('TIMELINE');
                }}
                selectedClass={selectedClass}
                isBengali={isBengali}
              />
            ) : (
              /* Mode B summary panel */
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 sm:p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <TrainTrack className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      Active Telemetry Track
                    </h3>
                  </div>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-600 text-white font-bold tabular-nums">
                    #{currentTrain.trainNumber}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-500">Train Name:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{currentTrain.trainName} ({currentTrain.trainNameBn})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-500">Route:</span>
                    <span className="font-mono font-medium">{currentTrain.halts[0].stationName} ➔ {currentTrain.halts[currentTrain.halts.length - 1].stationName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-500">Off-Day:</span>
                    <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">{currentTrain.offDays.join(', ')}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-500">Live Status:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase">{currentTrain.liveStatus.state}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Helper Note */}
            <div className="p-3.5 rounded-lg bg-zinc-200/50 dark:bg-zinc-900/40 border border-zinc-300 dark:border-zinc-800/80 text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">Official Bangladesh Railway Notice:</span>
                <p className="mt-0.5 text-[11px] leading-relaxed">
                  Passengers are advised to report to the boarding platform at least 15 minutes prior to scheduled departure. National ID / Photo ID is mandatory for online ticket verification.
                </p>
              </div>
            </div>
          </div>

          {/* Right Workstation Pane (7 cols on desktop): Timeline / Fares / Journey Card */}
          <div className="lg:col-span-7 space-y-4">
            {/* View Tab Switcher for Inspector */}
            <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md overflow-x-auto text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('TIMELINE')}
                className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-[0.98] ${
                  activeTab === 'TIMELINE'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{isBengali ? 'স্টেশন স্টপ ও ট্র্যাকার' : 'Stops & Timeline'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('FARE')}
                className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-[0.98] ${
                  activeTab === 'FARE'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>{isBengali ? 'ভাড়ার তালিকা' : 'Fare Matrix'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('TICKET')}
                className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-[0.98] ${
                  activeTab === 'TICKET'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>{isBengali ? 'অফলাইন টিকেট পাস' : 'Offline Pass'}</span>
              </button>
            </div>

            {/* Tab Panes */}
            {activeTab === 'TIMELINE' && (
              <TrainTimeline train={currentTrain} isBengali={isBengali} />
            )}

            {activeTab === 'FARE' && (
              <FareCalculator
                distanceKm={currentTrain.totalDistanceKm}
                availableClasses={currentTrain.availableClasses}
                selectedClass={effectiveClass}
                onSelectClass={(cls) => {
                  setSelectedClass(cls);
                }}
                isBengali={isBengali}
                onProceedToTicket={() => setActiveTab('TICKET')}
              />
            )}

            {activeTab === 'TICKET' && (
              <JourneyCard
                train={currentTrain}
                fromStationCode={fromStationCode}
                toStationCode={toStationCode}
                travelDate={travelDate}
                seatClass={effectiveClass}
                isBengali={isBengali}
              />
            )}
          </div>
        </div>

        {/* Bottom Section: High-Utility Transit Operational Guidance (Luggage, Off-days, Refunds, Helpline) */}
        <section className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <RailwayInfo isBengali={isBengali} />
        </section>
      </main>

      {/* Operational Footer */}
      <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-4 px-3 sm:px-6 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">NRL</span>
            <span>•</span>
            <span>Bangladesh Railway Live Journey Tracker, Route Schedules & Fare Calculator</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px] tabular-nums">
            <span>Security: SHA-256 Auth</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">BR Server: Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
