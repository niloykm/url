# NRL ENGINEERING STANDARDS

- Strict TypeScript: Full type-safety for Train, Station, RouteSchedule, StationHalt, SeatClass, and FareBreakdown. Zero `any`.
- Client vs Server Boundaries: Server Components for static station databases and fare rules; isolate `'use client'` strictly to search inputs, station swap toggles, and countdown timers.
- Resilient Data Handling: Graceful fallbacks and clear offline indicators when railway API or external timetable scrapers encounter downtime.
- Viewport Adaptation: Responsive layout: side-by-side split view on desktop (>= 1024px); thumb-friendly, sticky bottom search sheet on mobile (< 1024px).
- Zero Layout Shift: Pre-calculated container heights for timetable lists and route maps to prevent content jumping during load.
