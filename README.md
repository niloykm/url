# NRL | Bangladesh Railway Journey Intelligence & Timetable Workstation

[![Vercel](https://vercel.com/button)](https://nrl-zeta.vercel.app/)

> **Bangladesh Railway Live Journey Tracker, Route Schedules, Stoppage Stepper & Fare Calculator**  
> An engineered, zero-slop railway companion built for operational reliability, instant glanceability, low network latency, and timetable precision.

---

## 1. System Philosophy & Value Proposition
A commuter or long-distance passenger opening NRL is able to accomplish their goal (track an intercity train, look up route schedules, verify fares across seat classes, or plan connections) within **5 seconds**.

- **No AI Slop or Gimmicks**: Purged all generic purple/indigo ambient blobs, bloated `rounded-3xl` cards, and artificial chat templates.
- **Engineered Ergonomics**: Precision `rounded-md` (6px) buttons/inputs and `rounded-lg` (8px) transit containers. Strict 1px structural dividing lines.
- **Monospace Numerical Primacy**: All train numbers (`753`), platform indicators (`PF 2`), timestamps (`14:45`), halt durations (`05m`), and ticket fares (`৳ 450`) use `font-mono tabular-nums`.
- **Bilingual Interface**: High-contrast typography supporting English & Bengali (`Hind Siliguri` / `Geist`).
- **Offline-First Journey Pass**: Saveable/printable ticket summary card with cryptographic QR code validation for offline presentation to Traveling Ticket Examiners (TTE).

---

## 2. Transit Information Hierarchy & Workstation Modes

### Top Utility & Live Status Bar
- **BR Server Status Indicator**: Displays real-time gateway health (`BR GATEWAY: OPERATIONAL` with `38ms` telemetry latency).
- **Corridor Quick-Selector**: Instant 1-click toggles for major transit corridors:
  - *Dhaka – Rajshahi* (`343 km`)
  - *Dhaka – Chattogram* (`321 km`)
  - *Dhaka – Sylhet* (`319 km`)
  - *Dhaka – Khulna* (`260 km` via Padma Bridge)
  - *Dhaka – Rangpur* (`420 km`)

### Dual-Mode Primary Explorer
1. **Mode A: Journey & Train Search**:
   - Origin & Destination Station Combobox with quick hub chips (*Kamalapur, Biman Bandar, Rajshahi, Chattogram, Sylhet, Natore, Khulna*).
   - 1-click Fast Station Swap with smooth 180° rotation feedback (preserves selected travel date and seat class).
   - Travel class filters: `SNIGDHA` (AC Chair), `S_CHAIR` (Shovan Chair), `SHOVAN`, `AC_B` (AC Berth), `AC_S` (AC Seat).
   - High-density timetable table with instant sorting by departure time, journey duration, or seat availability.
2. **Mode B: Train Route & Live Tracker**:
   - Direct Train selector (e.g., *Subarna Express [701/702]*, *Silk City Express [753/754]*, *Padma Express [759/760]*, *Dhumketu Express [769/770]*, *Sonar Bangla Express [787/788]*).
   - Real-time status pills (`ON_TIME`, `DELAYED +18m`, `SCHEDULED`).
   - Active telemetry track showing current station, approaching halt, and assigned platform.

### Interactive Route Timeline & Station Stop Visualizer
- Continuous vertical transit line stepper (`w-0.5 bg-zinc-700`) connecting chronological station stops.
- Circular stop nodes denoting passed stops, active station / next approaching halt (pulsing emerald badge), and upcoming stations.
- Halt duration indicators, platform assignments, and cumulative kilometer milestones.

### Fare Matrix & Seat Class Breakdown
- High-density tabular matrix calculating:
  - Base ticket fare
  - 15% Statutory Railway VAT (AC classes)
  - BR Gateway / Facilitation Surcharge (৳50)
  - Total Fare (`font-mono tabular-nums font-bold text-emerald-500`)
  - Live seat availability counters

### Operational Railway Guidance (No Dead Air)
- Weekly train maintenance off-day matrix
- Luggage allowances by travel class (56 kg / 37.5 kg / 28 kg)
- Official BR ticket cancellation deduction rules (>48h, 48-24h, 24-12h, <12h)
- Emergency railway helplines: **131** (BR Hotline), **16122** (Customer Care), **999** (Railway Police), and offline SMS tracking syntax (`TR <Train_No> to 9999`).

---

## 3. Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS 4, Lucide React, `qrcode`.
- **Design Governance**: [`DESIGN.md`](./DESIGN.md)
- **Engineering Standards**: [`ENGINEERING.md`](./ENGINEERING.md)
- **Data Model**: Strict TypeScript models in `src/types/railway.ts` and realistic operational datasets in `src/data/railway.ts`.

---

## 4. Local Development

```bash
# Navigate to frontend directory
cd frontEnd

# Install dependencies
npm install

# Run type check & dev server
npm run dev

# Run strict type check & production build
npm run build
```
