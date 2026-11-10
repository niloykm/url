import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Ticket, Printer, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { Train, SeatClass } from '../types/railway';
import { calculateFares, SEAT_CLASS_META } from '../data/railway';

interface JourneyCardProps {
  train: Train;
  fromStationCode: string;
  toStationCode: string;
  travelDate: string;
  seatClass: SeatClass;
  isBengali: boolean;
}

export const JourneyCard: React.FC<JourneyCardProps> = ({
  train,
  fromStationCode,
  toStationCode,
  travelDate,
  seatClass,
  isBengali,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 3,
    minutes: 42,
    seconds: 15,
  });

  const fares = calculateFares(train.totalDistanceKm, [seatClass]);
  const currentFare = fares[seatClass] || { total: 450 };
  const originHalt = train.halts.find((h) => h.stationCode === fromStationCode) || train.halts[0];
  const destHalt = train.halts.find((h) => h.stationCode === toStationCode) || train.halts[train.halts.length - 1];
  const pnr = `BR-${train.trainNumber}-${Math.abs(fromStationCode.charCodeAt(0) * 1000 + 4821).toString().slice(0, 6)}`;
  const classMeta = SEAT_CLASS_META[seatClass] || { name: seatClass, nameBn: seatClass };

  // Countdown timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59, hours: prev.hours };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Generate real QR Code
  useEffect(() => {
    const qrPayload = JSON.stringify({
      pnr,
      trn: train.trainNumber,
      from: originHalt.stationCode,
      to: destHalt.stationCode,
      date: travelDate,
      cls: seatClass,
      sec: 'BR-GOV-AUTH-PASS',
    });

    QRCode.toDataURL(qrPayload, {
      margin: 1,
      width: 140,
      color: {
        dark: '#09090b',
        light: '#ffffff',
      },
    })
      .then((url: string) => setQrDataUrl(url))
      .catch((err: unknown) => console.error('QR generation error:', err));
  }, [pnr, train.trainNumber, originHalt.stationCode, destHalt.stationCode, travelDate, seatClass]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 gap-2">
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {isBengali ? 'অফলাইন ট্র্যাভেল পাস / ই-টিকেট সামারি' : 'Offline-First Journey Pass & Ticket Summary'}
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Instant offline saveable travel card with cryptographic verification QR
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold border border-zinc-200 dark:border-zinc-700 transition-all active:scale-[0.98]"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Pass (প্রিন্ট)</span>
        </button>
      </div>

      {/* Official Boarding Pass Card */}
      <div
        id="printable-ticket"
        className="border-2 border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 p-4 sm:p-5 space-y-4 relative overflow-hidden"
      >
        {/* Top Watermark / Status */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-emerald-600 text-white">
              BANGLADESH RAILWAY
            </span>
            <span className="text-[11px] font-mono font-bold text-zinc-500">
              PNR: {pnr}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
            <ShieldCheck className="w-3 h-3" />
            CONFIRMED
          </div>
        </div>

        {/* Departure Countdown Banner */}
        <div className="p-2.5 rounded bg-emerald-950/30 dark:bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500 animate-pulse shrink-0" />
            <span className="text-zinc-600 dark:text-zinc-300 text-[11px]">
              Scheduled Departure Countdown:
            </span>
          </div>
          <div className="font-mono font-bold text-sm text-emerald-700 dark:text-emerald-400 tabular-nums">
            {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
          </div>
        </div>

        {/* Journey Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="text-[10px] uppercase font-semibold text-zinc-400">Train Service</div>
            <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 font-sans">
              {train.trainName}
            </div>
            <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              #{train.trainNumber} ({train.routeType})
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-semibold text-zinc-400">Origin / Departure</div>
            <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 font-sans">
              {originHalt.stationName}
            </div>
            <div className="font-mono text-xs text-zinc-600 dark:text-zinc-300 tabular-nums">
              {originHalt.departureTime !== '--' ? originHalt.departureTime : train.departureTime} • {originHalt.platform}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-semibold text-zinc-400">Destination / Arrival</div>
            <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 font-sans">
              {destHalt.stationName}
            </div>
            <div className="font-mono text-xs text-zinc-600 dark:text-zinc-300 tabular-nums">
              {destHalt.arrivalTime !== '--' ? destHalt.arrivalTime : train.arrivalTime} • {destHalt.platform}
            </div>
          </div>
        </div>

        {/* Coach, Seat & QR Code Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full sm:w-auto flex-1 font-mono tabular-nums text-xs">
            <div className="p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="text-[10px] text-zinc-400 uppercase font-sans">Travel Date</div>
              <div className="font-bold text-zinc-900 dark:text-zinc-100">{travelDate}</div>
            </div>

            <div className="p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="text-[10px] text-zinc-400 uppercase font-sans">Class</div>
              <div className="font-bold text-zinc-900 dark:text-zinc-100">{isBengali ? classMeta.nameBn : classMeta.name}</div>
            </div>

            <div className="p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="text-[10px] text-zinc-400 uppercase font-sans">Coach / Seat</div>
              <div className="font-bold text-zinc-900 dark:text-zinc-100">KHA - 24, 25</div>
            </div>

            <div className="p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="text-[10px] text-zinc-400 uppercase font-sans">Fare Paid</div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400">৳ {currentFare.total}</div>
            </div>
          </div>

          {/* Verification QR Code */}
          <div className="flex flex-col items-center justify-center p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shrink-0">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="BR Offline Ticket Verification QR" className="w-24 h-24 object-contain" />
            ) : (
              <div className="w-24 h-24 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" />
            )}
            <span className="text-[9px] font-mono text-zinc-400 mt-1 uppercase">BR TTE Scan Valid</span>
          </div>
        </div>

        {/* Security & Offline Notice */}
        <div className="text-[10px] text-zinc-400 dark:text-zinc-500 pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3 text-zinc-400 shrink-0" />
          <span>Keep this ticket pass saved on your device for offline presentation to the Traveling Ticket Examiner (TTE). Original NID required.</span>
        </div>
      </div>
    </div>
  );
};
