import type { BugDemo } from '../types';

export const bugDemos: BugDemo[] = [
  {
    id: 'B01',
    title: 'Past Default Booking Dates',
    severity: 'P1',
    status: 'fixed',
    shortDescription: 'Booking widget initializes with static past dates, allowing invalid searches.',
    before: {
      description: 'The booking widget loads with hardcoded dates (e.g. Oct 03 → Oct 04) that become past dates over time. Users can submit searches for past dates, resulting in zero availability or misleading results.',
      codeSnippet: `// ❌ BROKEN
const [checkIn, setCheckIn] = useState("2024-10-03");
const [checkOut, setCheckOut] = useState("2024-10-04");
// Hardcoded — becomes past immediately as time passes
// No validation prevents submitting past dates`,
    },
    after: {
      description: 'Dates are initialized dynamically using getToday() / getTomorrow(). Past dates are disabled in the calendar. Changing check-in auto-corrects checkout if it becomes invalid.',
      codeSnippet: `// ✅ FIXED
const [checkIn, setCheckIn] = useState(getToday());
const [checkOut, setCheckOut] = useState(getTomorrow());
// Dynamic — always valid on load
// isPastDate() blocks selection of past dates
// validateBookingDates() rejects checkout <= checkin`,
    },
    fix: 'Replaced static date strings with dynamic getToday()/getTomorrow() helpers. Added isPastDate() guard in the calendar picker and validateBookingDates() on form submit.',
  },
  {
    id: 'B02',
    title: 'Location Page Data Failure',
    severity: 'P1',
    status: 'fixed',
    shortDescription: 'All API failure modes display "No properties found" — no distinction between errors.',
    before: {
      description: '"No properties found" is shown for ALL failure modes: server 500 errors, network timeouts, empty inventory, and unknown locations all look identical. Users cannot tell if properties exist elsewhere or if it\'s a technical problem.',
      codeSnippet: `// ❌ BROKEN
fetch('/api/properties')
  .then(r => r.json())
  .then(data => setProperties(data))
  .catch(() => {}); // silently swallowed

if (!properties.length) {
  return <div>No properties found</div>; // same for ALL failures
}`,
    },
    after: {
      description: 'A proper ApiState machine distinguishes: loading (skeleton), success, empty (no inventory), error (retry button), notFound (404), and maintenance. Each state renders distinct, actionable UI.',
      codeSnippet: `// ✅ FIXED
type PageState =
  'loading' | 'success' | 'empty' |
  'error' | 'notFound' | 'maintenance';

// 500 → "Something went wrong" + [Retry]
// empty → "No hostels for these dates" + [Change Dates]
// 404 → "Destination not found"
// maintenance → "Temporarily unavailable"`,
    },
    fix: 'Implemented ApiState<T> type and ApiStateRenderer component. Each HTTP status code maps to a specific UI state. Error state includes a functional Retry button.',
  },
  {
    id: 'B03',
    title: 'Destination → Property Flow Blocked',
    severity: 'P1',
    status: 'fixed',
    shortDescription: 'Destination metadata failure blocks the entire property listing, even when properties are accessible.',
    before: {
      description: 'The destination page fetches metadata and properties in a serial chain. If metadata fails, properties never load. Users see an error with no path to individual property pages even though /property/[id] routes work fine.',
      codeSnippet: `// ❌ BROKEN — serial waterfall
const dest = await fetchDestination(slug);
// If this throws, nothing below runs:
const props = await fetchProperties(dest.id);
setProperties(props);`,
    },
    after: {
      description: 'Metadata and properties are fetched independently and in parallel. If metadata fails, property cards still render. Destination metadata failure shows a degraded (not broken) page with full property access.',
      codeSnippet: `// ✅ FIXED — parallel, independent
Promise.allSettled([
  fetchDestination(slug),
  fetchPropertiesBySlug(slug)
]).then(([destResult, propsResult]) => {
  // Each resolves independently
  // Properties load even if metadata fails
});`,
    },
    fix: 'Replaced serial async chain with Promise.allSettled() for parallel independent fetches. Destination metadata failure degrades gracefully without blocking property cards.',
  },
  {
    id: 'B04',
    title: 'Room Selection / Booking Summary State',
    severity: 'P2',
    status: 'fixed',
    shortDescription: 'Selecting a room does not update the booking summary total, which stays at ₹0.',
    before: {
      description: 'After selecting a room, the booking summary still shows ₹0. There is no visual indication a room was selected. The Reserve button may be active even with no room chosen. Price calculations are duplicated across components.',
      codeSnippet: `// ❌ BROKEN
const [selectedRoom, setSelectedRoom] = useState(null);
// BookingSummary reads from disconnected state
// <BookingSummary total={bookingTotal} />
// bookingTotal never recalculates when selectedRoom changes`,
    },
    after: {
      description: 'Selected room is shared state. calculateBookingTotal() is a single pure function used everywhere. Summary reactively updates on room change, guest count change, and date change. Reserve is disabled until a room is selected.',
      codeSnippet: `// ✅ FIXED
const total = useMemo(() =>
  selectedRoom
    ? calculateBookingTotal(selectedRoom, nights, guests, birdCoins)
    : null,
  [selectedRoom, nights, guests, birdCoins]
);
// Single source of truth. Pure function. Fully tested.`,
    },
    fix: 'Lifted selectedRoom state. Created calculateBookingTotal() pure function. Connected summary to shared state via React context. Disabled Reserve button when no room selected.',
  },
  {
    id: 'B05',
    title: 'Error / Empty State Confusion',
    severity: 'P2',
    status: 'fixed',
    shortDescription: 'Generic or missing error states across all API-driven components — no retry, no skeletons.',
    before: {
      description: 'API failures result in blank screens, infinite spinners, or identical generic messages. No skeleton loaders, no retry buttons, no contextual guidance. Network failures look the same as empty inventory.',
      codeSnippet: `// ❌ BROKEN
// No loading state → blank screen on slow connection
// No error boundary → crash on API failure
// No retry → user must hard-refresh
// Same message for every failure`,
    },
    after: {
      description: 'Consistent ApiStateRenderer component handles all states: skeleton during load, distinct error cards with retry, empty state with CTAs, not-found, and maintenance. Every API-driven page uses it.',
      codeSnippet: `// ✅ FIXED
<ApiStateRenderer state={pageState}>
  {(data) => <PropertyList properties={data} />}
</ApiStateRenderer>
// loading → SkeletonCards
// error → ErrorCard + RetryButton
// empty → EmptyState + ChangeSearchCTA
// notFound → NotFoundCard
// maintenance → MaintenanceCard`,
    },
    fix: 'Created ApiStateRenderer<T> component accepting ApiState<T> and rendering appropriate UI per state. Added skeleton loading components. Retry button triggers fresh API call via useCallback ref.',
  },
];
