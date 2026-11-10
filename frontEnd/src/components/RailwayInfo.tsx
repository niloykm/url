import React from 'react';
import { Phone, Briefcase, RefreshCcw, Calendar, MessageSquare, ShieldAlert } from 'lucide-react';
import { RAILWAY_GUIDELINES, TRAINS } from '../data/railway';

interface RailwayInfoProps {
  isBengali: boolean;
}

export const RailwayInfo: React.FC<RailwayInfoProps> = ({ isBengali }) => {
  return (
    <div className="space-y-4">
      {/* 4-Column High-Utility Railway Operational Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Helpline Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
            <Phone className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              {isBengali ? 'জরুরি হেল্পলাইন' : 'Helpline & Support'}
            </h3>
          </div>
          <div className="space-y-1.5 font-mono text-xs tabular-nums">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">BR Hotline:</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                131
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Customer Care:</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                16122
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Railway Police:</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                999
              </span>
            </div>
          </div>
        </div>

        {/* SMS Live Tracker Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
            <MessageSquare className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              {isBengali ? 'এসএমএস ট্র্যাকিং' : 'SMS Train Tracker'}
            </h3>
          </div>
          <div className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1">
            <p className="text-[11px] text-zinc-500">Track location without mobile internet:</p>
            <div className="p-1.5 rounded bg-zinc-100 dark:bg-zinc-950 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-zinc-200 dark:border-zinc-800">
              TR &lt;Train_No&gt; to 9999
            </div>
            <p className="text-[10px] text-zinc-400">E.g., "TR 753" for Silk City Express</p>
          </div>
        </div>

        {/* Luggage Allowance Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
            <Briefcase className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              {isBengali ? 'লাগেজ ব্যাগেজ নিয়ম' : 'Free Luggage Limits'}
            </h3>
          </div>
          <div className="space-y-1.5 font-mono text-xs tabular-nums text-zinc-700 dark:text-zinc-300">
            {RAILWAY_GUIDELINES.luggageRules.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-500">{r.class.split(' ')[0]}:</span>
                <span className="font-semibold">{r.limit.split(' ')[0]} kg</span>
              </div>
            ))}
          </div>
        </div>

        {/* BR Server Gateway Status */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
            <ShieldAlert className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              {isBengali ? 'গেটওয়ে কার্যক্ষমতা' : 'Telemetry Gateway'}
            </h3>
          </div>
          <div className="space-y-1 font-mono text-xs tabular-nums text-zinc-700 dark:text-zinc-300">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-500">Latency:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">38 ms</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-500">Active Rakes:</span>
              <span>104 Intercity</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-500">Sync:</span>
              <span className="text-[10px] text-zinc-400">Real-time BR API</span>
            </div>
          </div>
        </div>
      </div>

      {/* Structured 2-Column: Off-Day Matrix & Official Cancellation Surcharges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Off-Day Directory */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              {isBengali ? 'আন্তঃনগর ট্রেনের সাপ্তাহিক ছুটির দিন' : 'Intercity Weekly Maintenance Off-Days'}
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs tabular-nums">
            {TRAINS.map((train) => (
              <div
                key={train.trainNumber}
                className="p-2 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800"
              >
                <div className="font-bold text-zinc-900 dark:text-zinc-100">
                  #{train.trainNumber} {train.trainName.split(' ')[0]}
                </div>
                <div className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-0.5">
                  {train.offDays.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cancellation Deductions */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <RefreshCcw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              {isBengali ? 'টিকেট বাতিল ও রিফান্ড নীতি' : 'Official BR Ticket Refund & Cancellation Deductions'}
            </h3>
          </div>
          <div className="space-y-2">
            {RAILWAY_GUIDELINES.cancellationRules.map((rule, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 flex items-start justify-between gap-3 text-xs"
              >
                <div className="font-medium text-zinc-800 dark:text-zinc-200">
                  {rule.timeframe}
                </div>
                <div className="font-mono text-right font-bold text-rose-600 dark:text-rose-400 shrink-0 tabular-nums">
                  {rule.deduction}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
