# NRL UI/UX DESIGN SYSTEM

## 1. Aesthetic & Transit Surfaces
- Canvas: High-clarity dark canvas (`#09090b` zinc-950 base, `#18181b` zinc-900 surface panels) or crisp outdoor-legible light theme (`#ffffff` canvas, `#f8fafc` slate-50 cards).
- Accents: Bangladesh Railway emerald/green (`#059669` emerald-600) for on-time and confirmed status; amber (`#d97706` amber-600) for delays; rose (`#e11d48` rose-600) for cancellations or sold-out classes.
- Dividers & Borders: Strict 1px structural lines (`border-zinc-200 dark:border-zinc-800`). Zero blurry neon drop shadows.
- Geometry: Precision edges (`rounded-md` 6px for buttons, tags, and inputs; `rounded-lg` 8px for containers and timetable panels).

## 2. Typography & Numerical Precision
- Monospace Primacy: All train codes (`753`), platform numbers, departure/arrival timestamps (`14:40`), halt durations (`05m`), ticket prices (`৳ 450`), and seat numbers MUST use `font-mono tabular-nums`.
- Bilingual Support Readiness: High-contrast legible Bengali + English typography (`Hind Siliguri` / `Inter` or `Geist`).
- Station Stepper: Clean, unbroken vertical connection line (`w-0.5 bg-zinc-700`) with circular stop nodes indicating passed, active, and upcoming stations.

## 3. Ergonomics & Micro-Interactions
- Fast switch: 1-click swap button between "Origin" and "Destination" with smooth 180° rotation feedback.
- Tactile feedback on all buttons (`active:scale-[0.98]`).
- Instant filter response with zero UI layout shift while filtering train lists.
