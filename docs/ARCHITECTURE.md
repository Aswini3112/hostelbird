# HostelBird Build & Break — Architecture

---

## Overview

This is a fully independent demonstration prototype. It does NOT connect to Hostelbird's private backend, APIs, or database. All data is independently authored mock data that mimics the product domain.

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend framework | React 18 + TypeScript | SPA with type safety |
| Build tool | Vite 5 | Fast HMR dev, optimized prod bundle |
| Styling | Tailwind CSS 3 | Utility-first, consistent design tokens |
| Routing | React Router 6 | SPA routing |
| Icons | Lucide React | Consistent icon set |
| Date handling | Custom `dateUtils.ts` | Timezone-safe date logic (B01 fix) |
| HTTP client | Fetch API (native) | API calls with timeout |
| State management | React hooks (useState/useMemo) | Local component state |
| Backend | Node.js + Express + TypeScript | Mock API server |
| Testing | Vitest + React Testing Library | Unit and integration tests |
| Validation | Custom `validation.ts` (Zod-ready) | Input validation |

---

## Folder Structure

```
hostelbird-build-break/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        # Navbar, Footer, Layout
│   │   │   ├── booking/       # BookingWidget, BookingSummary
│   │   │   ├── property/      # PropertyCard, RoomCard
│   │   │   ├── destination/   # DestinationCard
│   │   │   └── ui/            # ApiStateRenderer, SkeletonCard
│   │   │
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── DestinationPage.tsx  # B02/B03 fix
│   │   │   ├── PropertyPage.tsx     # B04 fix
│   │   │   ├── BookingPage.tsx
│   │   │   ├── DebugCenterPage.tsx  # Hackathon demo
│   │   │   └── NotFoundPage.tsx
│   │   │
│   │   ├── utils/
│   │   │   ├── dateUtils.ts         # B01 fix — date logic
│   │   │   ├── bookingUtils.ts      # B04 fix — price calculation
│   │   │   └── apiState.ts          # B02/B05 fix — state machine
│   │   │
│   │   ├── services/
│   │   │   └── api.ts               # API client with timeout + error mapping
│   │   │
│   │   ├── data/
│   │   │   ├── destinations.ts      # Mock destinations
│   │   │   ├── properties.ts        # Mock properties + rooms
│   │   │   └── bugDemos.ts          # Bug metadata for Debug Center
│   │   │
│   │   ├── types/
│   │   │   └── index.ts             # Shared TypeScript types
│   │   │
│   │   └── tests/
│   │       ├── setup.ts
│   │       ├── dateUtils.test.ts    # 42 tests (B01)
│   │       ├── bookingUtils.test.ts # 31 tests (B04)
│   │       └── apiState.test.ts     # 25 tests (B02/B05)
│   │
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── destinations.ts
│   │   │   ├── properties.ts
│   │   │   └── bookings.ts
│   │   ├── data/
│   │   │   └── mockData.ts
│   │   ├── middleware/
│   │   │   └── errorHandler.ts
│   │   ├── utils/
│   │   │   └── validation.ts        # B01/B04 backend validation
│   │   ├── tests/
│   │   │   └── validation.test.ts   # 10 tests
│   │   └── index.ts
│   └── package.json
│
├── docs/
│   ├── BUG_REGISTER.md
│   ├── FIXES.md
│   ├── TEST_PLAN.md
│   ├── DEMO_SCRIPT.md
│   └── ARCHITECTURE.md
│
└── README.md
```

---

## Key Design Decisions

### 1. Local mock data instead of API calls (frontend)
The DestinationPage and PropertyPage fetch from local mock data with simulated async delay. This lets judges see loading skeletons and all state transitions without needing the backend to be running.

### 2. Simulation controls on DestinationPage
The Destination page has explicit "Simulate API Error / Empty / Normal" controls. This makes it trivially easy for judges to observe the B02/B03 before/after behaviour without needing to break the network.

### 3. calculateBookingTotal() as a pure function
The single source of truth for pricing lives in `bookingUtils.ts`. It takes only plain arguments (no side effects, no context reads), making it independently testable and impossible to desynchronize across components.

### 4. ApiState<T> state machine
Rather than boolean flags (`isLoading`, `isError`, `isEmpty`) which are easy to combine incorrectly (e.g. `isLoading=false, isError=false, isEmpty=false` is ambiguous), we use a single discriminated union status. Each UI rendering path is exhaustive.

### 5. Timezone-safe dates
JavaScript `new Date("2026-10-05")` is interpreted as UTC midnight, which becomes Oct 4 at 18:30 IST (UTC+5:30). All date operations use local year/month/day parts directly to avoid this off-by-one.

---

## API Endpoints (Backend)

| Method | Route | Description |
|--------|-------|-------------|
| GET | /health | Health check |
| GET | /api/destinations | All available destinations |
| GET | /api/destinations/:slug | Single destination by slug |
| GET | /api/properties | All properties (optional `?destination=slug`) |
| GET | /api/properties/:id | Single property by ID |
| GET | /api/properties/slug/:slug | Single property by slug |
| GET | /api/properties/:id/rooms | Rooms for a property |
| POST | /api/bookings/validate | Validate booking payload |
| POST | /api/bookings | Create a booking |

---

## Data Flow

```
User → React Router → Page Component
                           │
                           ├── Local mock data (instant, with delay)
                           │   OR
                           └── /api/* (backend Express server)
                                   │
                                   ├── GET destinations/properties → mockData.ts
                                   └── POST bookings → validation.ts → mock confirmation
```

---

## Running the Project

### Frontend
```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
npm run build        # production build
npm test             # 98 unit tests
```

### Backend
```bash
cd backend
npm install
npm run dev          # http://localhost:4000
npm test             # 10 validation tests
```

### Both together
Frontend dev server proxies `/api/*` to `http://localhost:4000` automatically (see `vite.config.ts`).
