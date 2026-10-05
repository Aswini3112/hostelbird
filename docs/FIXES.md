# HostelBird Build & Break — Fix Documentation

> Each section describes the technical root cause, implementation, and regression coverage for each confirmed bug fix.

---

## Fix B01 — Past Default Booking Dates

**File:** `frontend/src/utils/dateUtils.ts`  
**Affected component:** `BookingWidget.tsx`

### Before
```ts
// Static initialization — becomes past date immediately
const [checkIn, setCheckIn]   = useState("2024-10-03");
const [checkOut, setCheckOut] = useState("2024-10-04");
```
No validation on submit. Calendar allows past date selection. No auto-correction when check-in changes.

### Technical Root Cause
React `useState` with a static string argument evaluates once at component mount. The hardcoded date never updates, causing it to become a past date as time passes.

### Implementation
Created `dateUtils.ts` with timezone-safe helpers:
- `getToday()` / `getTomorrow()` — use local date parts, not UTC (avoids midnight timezone shift bugs)
- `isPastDate(date)` — blocks calendar selection
- `validateBookingDates(checkIn, checkOut)` — called on form submit
- `getValidCheckOut(newCheckIn, currentCheckOut)` — auto-corrects checkout if it becomes invalid

```ts
// FIXED — BookingWidget.tsx
const defaults = getDefaultBookingDates(); // dynamic
const [checkIn, setCheckIn]   = useState(defaults.checkIn);   // today
const [checkOut, setCheckOut] = useState(defaults.checkOut);  // tomorrow
```

```html
<!-- Calendar input with min attribute -->
<input type="date" min={today} ... />
```

### After
- Widget always opens with today/tomorrow
- Past dates disabled in calendar picker (`min` attribute)
- Submit blocked with clear error message if dates invalid
- Checkout auto-corrects if check-in is moved forward

### Regression Tests
`src/tests/dateUtils.test.ts` — 42 tests covering:
- `getToday()` format and local timezone
- `isPastDate()` — past/today/future cases
- `getDefaultBookingDates()` — always today/tomorrow
- `validateBookingDates()` — all invalid input permutations
- `getValidCheckOut()` — preserves valid checkout, corrects stale
- `calculateNights()` — month boundary, year boundary, leap year

---

## Fix B02 — Location Page Conflates API Error with Empty Inventory

**File:** `frontend/src/utils/apiState.ts`, `frontend/src/components/ui/ApiStateRenderer.tsx`  
**Affected page:** `DestinationPage.tsx`

### Before
```ts
// All failure modes resolve to the same state
fetch('/api/properties')
  .then(r => r.json())
  .then(data => setProperties(data))
  .catch(() => {}); // silent failure

// Single generic render
if (!properties.length) return <div>No properties found</div>;
// 500 error? → "No properties found"
// Empty inventory? → "No properties found"
// Network timeout? → "No properties found"
```

### Technical Root Cause
Single state variable (`properties[]`) cannot represent both "API error" and "empty array". An empty array from a failed fetch is indistinguishable from a genuine empty inventory.

### Implementation
`ApiState<T>` type with 6 distinct statuses:
```ts
type ApiStatus = 'loading' | 'success' | 'empty' | 'error' | 'notFound' | 'maintenance';
```

`httpStatusToApiStatus()` maps HTTP codes:
- `200` + data → `success`
- `200` + `[]` → `empty` (not error)
- `404` → `notFound`
- `503` → `maintenance`
- `5xx` → `error`

`ApiStateRenderer<T>` component renders distinct UI per state:
- `loading` → `SkeletonCards`
- `error` → Error card + **Retry** button
- `empty` → Empty card + **Change Dates** CTA
- `notFound` → Not found card + link to home
- `maintenance` → Maintenance notice
- `success` → children(data)

### After
- API 500 → "Something went wrong. Please try again." + Retry
- Empty array → "No hostels available for these dates." + Change Dates
- 404 → "Destination not found." + Browse button
- 503 → "Temporarily unavailable."

### Regression Tests
`src/tests/apiState.test.ts` — 25 tests:
- All 6 state factories return correct status
- `httpStatusToApiStatus()` maps all codes correctly
- `fromHttpResponse()` distinguishes empty from error
- B02 core assertion: `httpStatusToApiStatus(500) !== 'empty'`

---

## Fix B03 — Destination → Property Flow Blocked

**File:** `frontend/src/pages/DestinationPage.tsx`

### Before
```ts
// Serial waterfall — if metadata fails, properties never load
const dest  = await fetchDestination(slug);      // throws
const props = await fetchProperties(dest.id);    // never runs
setProperties(props);
```

### Technical Root Cause
Sequential `await` creates a data dependency: properties are never fetched if destination metadata throws. This is wrong because destination slug alone is sufficient to fetch properties — the metadata ID is not required.

### Implementation
```ts
// FIXED — parallel, independent fetches
const [destResult, propsResult] = await Promise.allSettled([
  loadDestination(slug),     // independent
  loadProperties(slug),      // independent — uses slug, not dest.id
]);

// Each resolves independently
setDestState(destResult.status === 'fulfilled' ? destResult.value : errorState());
setPropsState(propsResult.status === 'fulfilled' ? propsResult.value : errorState());
```

Destination header degrades gracefully if metadata fails:
- If dest metadata 404: header shows "Destination" (no name crash)
- Properties still load and display
- Property cards link directly to `/property/[slug]` — always accessible

### After
- Destination metadata failure → degraded header but **properties still load**
- Properties can be accessed regardless of destination page state
- Demo simulation controls on page let judges see the behavior live

### Regression Tests
Covered by `apiState.test.ts` state discrimination tests + integration via `DestinationPage` simulation controls.

---

## Fix B04 — Room Selection Does Not Update Booking Summary

**File:** `frontend/src/utils/bookingUtils.ts`, `frontend/src/components/booking/BookingSummary.tsx`, `frontend/src/components/property/RoomCard.tsx`

### Before
```ts
// Disconnected state — summary never updates
const [selectedRoom, setSelectedRoom] = useState(null);
// BookingSummary uses separate, unrelated state
return <div>Total: ₹0</div>; // always 0
```
No visual differentiation of selected room. Reserve button always active.

### Technical Root Cause
`selectedRoom` state was local to the room list but `BookingSummary` read from a different, never-updating state variable. The two were never connected.

### Implementation
`calculateBookingTotal()` pure function in `bookingUtils.ts`:
```ts
export function calculateBookingTotal(
  room: Room, checkIn: string, checkOut: string,
  guests: number, birdCoinsApplied: number
): BookingTotal {
  const nights = calculateNights(checkIn, checkOut);
  const subtotal = room.price * nights;
  const gstRate = getGstRate(room.price);
  const taxes = Math.round(subtotal * gstRate);
  const birdCoinsDiscount = coinsToRupees(Math.min(birdCoinsApplied, maxApplicable));
  const total = Math.max(0, subtotal + taxes - birdCoinsDiscount);
  return { nights, basePrice: room.price, subtotal, taxes, discount, birdCoinsDiscount, birdCoinsEarned, total };
}
```

`BookingSummary` uses `useMemo` to reactively recalculate:
```ts
const total = useMemo(() =>
  selectedRoom ? calculateBookingTotal(selectedRoom, checkIn, checkOut, guests, birdCoins.applied) : null,
  [selectedRoom, checkIn, checkOut, guests, birdCoins.applied]
);
```

Selected room shows visual highlight (brand border + background).  
Reserve button: `disabled={!selectedRoom}`.  
When no room selected: shows "Select a room to see pricing" (not ₹0).

### After
- Select room → summary immediately updates
- Change guests → total recalculates
- Apply BirdCoins toggle → discount applied live
- Reserve disabled with message until room selected
- Total never shows misleading ₹0

### Regression Tests
`src/tests/bookingUtils.test.ts` — 31 tests:
- 1-night dorm total
- Multi-night total
- 18% GST threshold
- BirdCoins application
- BirdCoins cap at 10% subtotal
- Total never negative
- Invalid date range → 0 nights, 0 total
- Discount calculation
- BirdCoins earned on paid amount
- Guest validation (overflow, zero)

---

## Fix B05 — Generic Error State Confusion

**File:** `frontend/src/components/ui/ApiStateRenderer.tsx` + all pages

### Before
No consistent error handling architecture. Each component either:
- Showed a blank screen (no loading state)
- Showed "No properties found" for all failures
- Had no retry mechanism
- No skeleton loading states

### Implementation
`ApiStateRenderer<T>` shared component wraps all API-driven page sections:
```tsx
<ApiStateRenderer
  state={propsState}
  onRetry={loadData}
  emptyTitle="No hostels available for these dates"
  emptyAction={<Link to="/">Change Search</Link>}
>
  {(props) => <PropertyList properties={props} />}
</ApiStateRenderer>
```

Skeleton components (`SkeletonCard`, `SkeletonCards`) provide visual loading feedback.  
Retry button calls `loadData()` with a fresh API attempt.

### After
Every API-driven section has: skeleton loader → distinct error/empty/notFound/maintenance state → retry/CTA.

---

*End of FIXES.md*
