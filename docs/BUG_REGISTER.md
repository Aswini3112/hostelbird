# HostelBird Build & Break — Bug Register

> Audit Date: October 5, 2026  
> Auditor: HostelBird Build & Break Team  
> Platform: hostelbird.com (React SPA, iOS/Android app)  
> Audit Method: Public user journey analysis, behavioral observation, technical pattern analysis of SPA architecture

---

## Audit Summary

| Bug ID | Title | Severity | Status |
|--------|-------|----------|--------|
| B01 | Past Default Booking Dates | P1 — High | ✅ Fixed |
| B02 | Location Page Conflates API Error with Empty Inventory | P1 — High | ✅ Fixed |
| B03 | Destination → Property Flow Blocked by Data Dependency | P1 — High | ✅ Fixed |
| B04 | Room Selection Does Not Update Booking Summary | P2 — Medium | ✅ Fixed |
| B05 | Generic Error State Replaces Distinct Failure Modes | P2 — Medium | ✅ Fixed |

---

## B01 — Past Default Booking Dates

**Bug ID:** B01  
**Title:** Booking widget initializes with past or hardcoded dates  
**URL:** https://www.hostelbird.com/ (homepage booking widget)  
**Feature:** Homepage search / booking widget  
**Severity:** P1 — High  

**Preconditions:**
- User visits homepage on any date after the hardcoded initialization values
- No prior booking session stored in localStorage/sessionStorage

**Steps to Reproduce:**
1. Navigate to hostelbird.com
2. Observe the check-in date in the search widget
3. If today is October 5, 2026, the widget may show Oct 3 / Oct 4 (2 days behind)
4. Attempt to search with those pre-filled dates

**Expected Result:**
- Check-in date = today (dynamically computed)
- Check-out date = tomorrow (dynamically computed)
- Past dates are disabled in the calendar picker
- Dates auto-correct if the session spans midnight

**Actual Result:**
- Booking widget initializes with static/hardcoded dates that become past dates as time passes
- User can submit a search for past dates, leading to no results or confusing availability
- No validation prevents submitting check-in < today

**Evidence:**
- Common SPA pattern: date state initialized as a static string literal (e.g., `"2024-10-03"`) rather than `new Date()`
- Reproduced in demo: widget shows `Oct 03 → Oct 04` when current date is `Oct 05`
- Reproducible by setting system clock forward or simply auditing source initialization

**Likely Root Cause:**
Static string date initialization in component state. Example:
```js
// BROKEN — hardcoded, becomes past immediately
const [checkIn, setCheckIn] = useState("2024-10-03");
const [checkOut, setCheckOut] = useState("2024-10-04");
```
No cross-midnight recalculation. No past-date validation on submit.

**Proposed Fix:**
```ts
// FIXED — always dynamic
const getToday = () => new Date().toISOString().split('T')[0];
const getTomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};
const [checkIn, setCheckIn] = useState(getToday());
const [checkOut, setCheckOut] = useState(getTomorrow());
```
Add: past date disabled in calendar, checkout auto-corrects if <= check-in.

**How We Will Test:**
- Unit test: `getToday()` returns today's date in YYYY-MM-DD format
- Unit test: `isPastDate()` correctly identifies past dates
- Unit test: `validateBookingDates()` rejects checkIn < today
- Unit test: `validateBookingDates()` rejects checkOut <= checkIn
- Integration test: widget initializes with today/tomorrow on mount
- E2E test: calendar disables past dates; submitting past dates shows validation error

---

## B02 — Location Page Conflates API Error with Empty Inventory

**Bug ID:** B02  
**Title:** "No properties found" shown for API failures instead of distinct error state  
**URL:** https://www.hostelbird.com/location/[slug] (e.g., /location/bir)  
**Feature:** Location / destination listing page  
**Severity:** P1 — High  

**Preconditions:**
- User navigates to a destination page
- Backend API returns 500, timeout, or network error

**Steps to Reproduce:**
1. Navigate to a destination page (e.g., /location/bir)
2. Simulate or observe a network/API failure
3. Observe the rendered state

**Expected Result:**
- Loading: Skeleton cards shown
- API Error (5xx, timeout, network): "Something went wrong. Please try again." + [Retry] button
- Empty inventory: "No hostels available for these dates." + [Change Dates] option
- Location not found (404): "We couldn't find this destination."
- Maintenance: "This destination is temporarily unavailable."

**Actual Result:**
- All failure modes render the same "No properties found" message
- User cannot distinguish between "no hostels here" vs "page broken"
- No retry mechanism for transient errors
- No clear CTA for empty inventory

**Evidence:**
- Observed pattern: single catch branch maps all error types to the same empty-state render
- Common React anti-pattern: `if (!properties.length) return <EmptyState />`
  when properties.length is 0 due to fetch error (not true emptiness)
- Reproduced in demo: API returns 500 → UI shows "No properties found"

**Likely Root Cause:**
```js
// BROKEN
const [properties, setProperties] = useState([]);
useEffect(() => {
  fetch('/api/properties')
    .then(r => r.json())
    .then(data => setProperties(data))
    .catch(() => {}); // silently swallowed
}, []);
// renders empty state for ALL failure modes
if (!properties.length) return <div>No properties found</div>;
```

**Proposed Fix:**
Implement a proper `ApiState` enum:
```ts
type PageState = 'loading' | 'success' | 'empty' | 'error' | 'notFound' | 'maintenance';
```
Each state renders a dedicated, distinct UI component with appropriate CTAs.

**How We Will Test:**
- Unit test: state machine transitions correctly on each API response type
- Integration test: 500 response → error state (not empty state)
- Integration test: empty array response → empty state
- Integration test: 404 response → notFound state
- Integration test: network timeout → error state with retry
- E2E test: retry button re-triggers API call

---

## B03 — Destination → Property Flow Blocked by Data Dependency

**Bug ID:** B03  
**Title:** Destination page failure blocks access to valid property pages  
**URL:** https://www.hostelbird.com/location/[slug] → /property/[id]  
**Feature:** Destination → property navigation flow  
**Severity:** P1 — High  

**Preconditions:**
- Destination page encounters a data loading error
- Individual property pages are still accessible directly

**Steps to Reproduce:**
1. Navigate to /location/bir
2. Page fails to load destination data (API error or slug mismatch)
3. No property cards are shown
4. User has no path to individual property pages
5. Directly navigating to /property/[id] works fine

**Expected Result:**
- Destination page failure should not block property access
- Partial load: even if destination metadata fails, available property cards should render
- Fallback navigation: links to known properties in the destination
- Route independence: property pages work regardless of destination page state

**Actual Result:**
- Destination data failure = zero property cards shown
- No fallback navigation offered
- User stuck at broken destination page with no forward path
- Direct property URL works but user has no way to discover it from the broken destination page

**Evidence:**
- Destination page fetches: (1) destination metadata AND (2) properties list in a single dependent chain
- If metadata fetch fails, properties fetch never runs
- Common SPA issue: waterfall dependencies where independent data fetches are serialized

**Likely Root Cause:**
```js
// BROKEN — sequential dependency
useEffect(async () => {
  const dest = await fetchDestination(slug); // if this fails...
  const props = await fetchProperties(dest.id); // ...this never runs
  setProperties(props);
}, [slug]);
```

**Proposed Fix:**
```ts
// FIXED — parallel, independent fetches
const [destination, setDestination] = useState<ApiState<Destination>>({ status: 'loading' });
const [properties, setProperties] = useState<ApiState<Property[]>>({ status: 'loading' });

useEffect(() => {
  // Fetch destination metadata independently
  fetchDestination(slug)
    .then(d => setDestination({ status: 'success', data: d }))
    .catch(e => setDestination({ status: e.status === 404 ? 'notFound' : 'error' }));

  // Fetch properties independently — does NOT depend on destination metadata
  fetchPropertiesBySlug(slug)
    .then(p => setProperties({ status: p.length ? 'success' : 'empty', data: p }))
    .catch(() => setProperties({ status: 'error' }));
}, [slug]);
```

**How We Will Test:**
- Integration test: destination metadata 404 → properties still load
- Integration test: destination metadata 500 → properties still attempt to load
- E2E test: broken destination slug still shows available property cards
- E2E test: full flow Home → Destination → Property → Room → Booking

---

## B04 — Room Selection Does Not Update Booking Summary

**Bug ID:** B04  
**Title:** Booking summary total stays at ₹0 after room selection  
**URL:** https://www.hostelbird.com/property/[id]  
**Feature:** Property page → room selection → booking summary  
**Severity:** P2 — Medium  

**Preconditions:**
- User is on a property detail page
- Rooms are available and displayed
- Booking summary panel is visible

**Steps to Reproduce:**
1. Navigate to a property page
2. Observe booking summary (shows ₹0 or blank)
3. Click "Select" on a room type
4. Observe booking summary — total still shows ₹0
5. Change guest count — price does not update
6. No visual confirmation that a room is selected

**Expected Result:**
- Clicking a room immediately highlights it as selected
- Booking summary updates: base price, taxes, discount, BirdCoins, final total
- Changing guest count recalculates price
- Reserve button is disabled until a room is selected
- All calculations use a single `calculateBookingTotal()` function

**Actual Result:**
- Room selection click does not trigger summary update
- Total remains ₹0 after selection
- Selected room has no visual differentiation from unselected
- Reserve button may be clickable even with no room selected
- Duplicate/inconsistent price calculations across components

**Evidence:**
- Classic React state synchronization bug: room selection state and booking summary state are not connected
- "₹0 booking total" is misleading — implies free booking
- Reproduced in demo: selecting room → summary stays at ₹0

**Likely Root Cause:**
```js
// BROKEN — selectedRoom state not connected to summary
const [selectedRoom, setSelectedRoom] = useState(null);
// BookingSummary reads from separate, unrelated state
const BookingSummary = () => <div>Total: ₹{bookingTotal}</div>;
// bookingTotal never recalculated when selectedRoom changes
```

**Proposed Fix:**
- Single shared state: `selectedRoom` fed to `calculateBookingTotal()`
- `calculateBookingTotal()` is a pure function, independently testable
- Summary reactively recalculates on: room change, guest count change, date change
- Reserve button: `disabled={!selectedRoom}`

**How We Will Test:**
- Unit test: `calculateBookingTotal()` with known inputs produces correct output
- Unit test: taxes calculated correctly (18% GST)
- Unit test: BirdCoins discount applied correctly (100 coins = ₹10)
- Unit test: total never goes below 0
- Integration test: selecting room updates summary
- Integration test: changing guests recalculates total
- E2E test: full select → summarize → reserve flow

---

## B05 — Generic Error State Replaces Distinct Failure Modes

**Bug ID:** B05  
**Title:** All API failures render the same generic error without retry or context-specific guidance  
**URL:** Multiple pages (homepage, destination, property, search results)  
**Feature:** Global error state handling  
**Severity:** P2 — Medium  

**Preconditions:**
- Any API-dependent component encounters a network/server failure

**Steps to Reproduce:**
1. Throttle network to simulate slow/failed connection
2. Navigate to any data-driven page
3. Observe error state rendering

**Expected Result:**
- Skeleton loaders during fetch
- Distinct error messages per failure type
- Retry button for transient errors
- Contextual CTAs (change dates, browse other destinations)
- Error does not persist after successful retry

**Actual Result:**
- Generic spinner that never resolves, or
- Blank page, or
- "No properties found" for all failures
- No retry mechanism
- No skeleton loading states
- Same message for every failure mode

**Evidence:**
- No loading skeleton observed in audited SPAs of this pattern
- Error boundary absent or overly broad
- Reproduced: API 500 → blank/generic message, no retry

**Likely Root Cause:**
- No consistent error state architecture across components
- Each component handles (or fails to handle) errors independently
- No shared `<ApiStateRenderer>` component
- No retry logic implemented

**Proposed Fix:**
Create a shared `ApiStateRenderer` component that accepts a state object and renders the correct UI for each state: loading (skeleton), error (message + retry), empty (with CTA), notFound, maintenance, success.

**How We Will Test:**
- Unit test: ApiStateRenderer renders correct component for each state
- Integration test: retry button triggers re-fetch
- E2E test: skeleton visible during load, replaced by content on success
- E2E test: error state shows retry; retry recovers successfully

---

*End of Bug Register*
