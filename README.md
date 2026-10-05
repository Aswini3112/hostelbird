# HostelBird — Build & Break Hackathon

## "Booking Experience Fix Lab"

> We didn't build another hostel booking platform. We audited the existing HostelBird user journey, found high-impact failures in the booking flow, and rebuilt the affected components with correct behavior.
>
> Same travel experience. Fewer dead ends. More successful bookings.

---

## The Problem

Hostel booking users on HostelBird can encounter:

1. **Invalid past dates** in the search widget — leading to zero availability results
2. **Misleading "No properties found"** for every failure type — users can't tell if it's an error or real emptiness
3. **Destination pages blocking property access** when metadata fails — stuck users with no forward path
4. **₹0 booking summary** after room selection — the most important UI in the booking flow appears broken
5. **No consistent error recovery** — no skeleton loaders, no retry buttons, no contextual guidance

All five issues directly affect booking conversion.

---

## Confirmed Bugs

| ID | Issue | Severity | Root Cause | Status |
|----|-------|----------|-----------|--------|
| B01 | Past default booking dates | P1 — High | Static string `useState` initialization | ✅ Fixed |
| B02 | API error shown as "No properties found" | P1 — High | Single catch branch for all failures | ✅ Fixed |
| B03 | Destination page blocks property access | P1 — High | Serial fetch waterfall dependency | ✅ Fixed |
| B04 | Room selection doesn't update summary total | P2 — Medium | Disconnected React state between components | ✅ Fixed |
| B05 | Generic error states across all pages | P2 — Medium | No shared error state architecture | ✅ Fixed |

---

## What We Built

An independent prototype that:
- Reproduces each bug in a controlled "BEFORE" state
- Demonstrates the corrected "AFTER" behavior
- Provides automated tests proving the fix works
- Looks and feels consistent with the HostelBird product

### Key Fixes

**B01 — Date Logic**
```ts
// BROKEN
const [checkIn] = useState("2024-10-03"); // past date

// FIXED
const [checkIn] = useState(getToday()); // always today, timezone-safe
```

**B02/B05 — State Machine**
```ts
// BROKEN: one message for all failures
if (!properties.length) return <div>No properties found</div>;

// FIXED: distinct state per failure
type ApiStatus = 'loading' | 'success' | 'empty' | 'error' | 'notFound' | 'maintenance';
// Each renders unique, actionable UI
```

**B03 — Parallel Fetches**
```ts
// BROKEN: serial waterfall
const dest  = await fetchDestination(slug); // fails
const props = await fetchProperties(dest.id); // never runs

// FIXED: independent, parallel
const [destResult, propsResult] = await Promise.allSettled([
  fetchDestination(slug),    // independent
  fetchPropertiesBySlug(slug) // independent — no dependency on dest
]);
```

**B04 — Reactive Booking Summary**
```ts
// BROKEN: disconnected state — summary stays ₹0
const [selectedRoom, setSelectedRoom] = useState(null);

// FIXED: single pure function, reactive useMemo
const total = useMemo(() =>
  selectedRoom ? calculateBookingTotal(selectedRoom, checkIn, checkOut, guests, coins) : null,
  [selectedRoom, checkIn, checkOut, guests, coins]
);
```

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Routing | React Router 6 |
| Icons | Lucide React |
| Backend | Node.js + Express + TypeScript |
| Testing | Vitest + React Testing Library |

---

## Test Results

```
Frontend: 98 / 98 tests passing ✅
Backend:  10 / 10 tests passing ✅
TypeScript: 0 errors ✅
Build: clean production bundle ✅
```

Test coverage:
- `dateUtils.test.ts` — 42 tests (date validation, timezone, edge cases)
- `bookingUtils.test.ts` — 31 tests (price calculation, GST, BirdCoins, guards)
- `apiState.test.ts` — 25 tests (state machine, HTTP status mapping)
- `validation.test.ts` — 10 tests (backend booking validation)

---

## Running the Project

### Prerequisites
- Node.js 18+
- npm

### Frontend
```bash
cd frontend
npm install
npm run dev       # → http://localhost:5173
npm test          # run 98 unit tests
npm run build     # production build
```

### Backend
```bash
cd backend
npm install
npm run dev       # → http://localhost:4000
npm test          # run 10 validation tests
```

The Vite dev server automatically proxies `/api/*` to `http://localhost:4000`.

---

## Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | https://hostelbird-build-break.vercel.app |
| Backend  | Render | https://hostelbird-api.onrender.com |

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for full step-by-step deployment instructions.

**Quick summary:**
- **Vercel** — import `frontend/` folder, set `VITE_API_URL=https://hostelbird-api.onrender.com`
- **Render** — import `backend/` folder, build: `npm install && npm run build`, start: `npm start`

---

## Demo Flow

1. Visit **http://localhost:5173/debug** — Bug & Fix Lab overview
2. Visit **http://localhost:5173/** — Home page with fixed booking widget (B01)
3. Visit **http://localhost:5173/location/bir** — Use the API simulation controls (B02/B03)
4. Visit **http://localhost:5173/property/skynest-bir** — Room selection + booking summary (B04)
5. Select a room → see live price calculation → click Reserve

---

## Business Impact

| Fix | Impact |
|-----|--------|
| B01 — valid dates | Users no longer start with invalid searches → more searches complete |
| B02 — error states | Users know when to retry vs when inventory is genuinely empty → less abandonment |
| B03 — parallel fetches | Property discovery works even when metadata is slow/broken → fewer stuck users |
| B04 — booking summary | Users can see their total before committing → higher Reserve conversion |
| B05 — error recovery | Users can retry transient failures without hard-refresh → improved session completion |

---

## Documentation

- [`docs/BUG_REGISTER.md`](docs/BUG_REGISTER.md) — Full bug register with reproduction steps
- [`docs/FIXES.md`](docs/FIXES.md) — Technical fix documentation
- [`docs/TEST_PLAN.md`](docs/TEST_PLAN.md) — Complete test plan and results
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Architecture and design decisions
- [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) — 4-minute judging demo script

---

## Important Notes

- This prototype does **not** connect to Hostelbird's private APIs
- No proprietary source code is included
- No real payment processing or user data
- All data is independently authored mock data
- This is a hackathon demonstration, not a production deployment

---

*HostelBird Build & Break Hackathon Submission — October 2026*

# HostelBird Build & Break Hackathon

## Project Title

HostelBird Booking Experience — Bug Fix & UX Reliability Improvements

## Overview

This project was developed for the HostelBird Build & Break Hackathon.

Instead of creating an unrelated travel platform, I analyzed the HostelBird booking journey and focused on identifying and fixing meaningful issues affecting the user experience.

The project focuses on:

- Booking date validation
- Destination loading states
- Error and empty-state handling
- Destination-to-property navigation
- Room selection
- Booking summary and price calculation

## Problems Identified

### Bug 1 — Invalid/Past Booking Dates

Problem:
The booking interface can display invalid or past dates.

Impact:
Users may begin their booking journey with an invalid date range.

Fix:
Implemented dynamic date initialization and date validation.

---

### Bug 2 — Incorrect Location/Availability Error State

Problem:
A location-loading/API failure can be represented as an empty property result.

Impact:
Users may believe that no properties exist when the actual problem is a data-loading failure.

Fix:
Implemented separate states for:

- Loading
- Empty
- API Error
- Not Found
- Maintenance
- Success

---

### Bug 3 — Destination → Property Flow

Problem:
Investigated failures occurring between destination discovery and property selection.

Impact:
Users can get stuck before reaching available properties.

Fix:
Improved destination/property routing and state handling.

---

### Bug 4 — Room Selection and Booking Summary

Problem:
Booking summary state can become unclear when no room is selected or when room/guest information changes.

Fix:
Implemented synchronized:

- Room selection
- Guest validation
- Pricing
- Taxes
- Discounts
- Final total

---

## Before vs After

### Before

Describe the original behavior.

### After

Describe the corrected behavior.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Node.js
- Express
- MongoDB
- Vitest
- Playwright

## Testing

The application was tested for:

- Valid booking dates
- Invalid booking dates
- Room selection
- Guest capacity
- Price calculation
- API failures
- Empty inventory
- Retry behavior
- Responsive layouts

## Repository

GitHub:
YOUR_GITHUB_LINK : https://github.com/Aswini3112/hostelbird

## Demo

Live Demo:
YOUR_VERCEL_LINK : https://hostelbird.vercel.app/

Demo Video:
YOUR_VIDEO_LINK : https://drive.google.com/file/d/1xJ4teTFcFcPpX_-x6iIItnN5IIgioOB5/view?usp=sharing
