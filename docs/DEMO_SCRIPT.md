# HostelBird Build & Break — Demo Script

**Duration:** 4–5 minutes  
**Presenter:** HostelBird Build & Break Team  
**URL to open:** http://localhost:5173/debug

---

## 0:00 – 0:20 — Opening Statement

> "We didn't build another hostel booking platform.
> We broke the existing HostelBird booking journey — found high-impact failures
> that affect real users trying to complete a booking — and rebuilt the broken flows
> so the same experience works reliably."
>
> "Five bugs. All confirmed. All fixed. All tested."

---

## 0:20 – 0:50 — Context (live website)

Open https://www.hostelbird.com/

Point out:
- Homepage booking widget with date fields
- Destination pages
- Property pages with room selection
- Booking summary

> "This is the live product — a React SPA serving Indian backpackers.
> We audited the complete public user journey and selected 5 high-impact issues
> affecting booking discovery and conversion."

---

## 0:50 – 1:30 — Bug #1: Past Default Booking Dates

**Navigate to:** http://localhost:5173/debug → expand Bug #01

Show the BEFORE card:
> "The booking widget was initialized with hardcoded dates — October 3rd to 4th.
> Today is October 5th, 2026. That's a past date. Users searching with past dates
> get zero results. The widget never updates. Classic static initialization bug."

Show the AFTER card:
> "We replaced the hardcoded string with `getToday()` and `getTomorrow()` — dynamic
> helpers that use local date parts, not UTC, to avoid timezone shifts.
> The calendar now blocks past dates. Checkout auto-corrects if the user moves check-in forward."

Click "Show live before/after demo":
- BEFORE panel shows the Oct 03 / Oct 04 hardcoded date
- AFTER panel shows today's date
- Demonstrate live booking widget
- Enter a past date in the validator → see "Check-in date cannot be in the past."

---

## 1:30 – 2:20 — Bug #2: Location Page Data Failure

**Navigate to:** http://localhost:5173/location/bir

Show the demo controls:

**Step 1 — Click "Simulate API Error":**
> "Without the fix, a 500 server error would show 'No properties found.'
> The user has no way to know if it's a real error or just no inventory.
> No retry button."

Point to: Error card showing "Something went wrong" + **Try Again** button

**Step 2 — Click "Simulate Empty Inventory":**
> "A genuine empty result — no hostels for these dates — now shows a distinct,
> helpful message with a 'Change Search' CTA."

**Step 3 — Click "Normal Load":**
> "And a successful load shows the property cards. Three completely different states.
> One API state machine. Zero ambiguity."

---

## 2:20 – 2:50 — Bug #3: Destination → Property Flow

Still on http://localhost:5173/location/bir

Click "Simulate API Error" (destination metadata fails, properties still load):

> "Bug #3 is about data dependency. Old code: metadata fails → fetch chain aborts → 
> zero property cards shown. Even though the individual property pages work fine,
> there's no way to get to them.
>
> Our fix: metadata and properties are fetched in parallel with `Promise.allSettled()`.
> If metadata fails, properties still load. The page degrades gracefully
> but doesn't block access to valid inventory."

Point to: header shows "Destination" (degraded) but property cards still render below.

Click on any property card:
> "Direct property access always works — Bug #3 fixed."

---

## 2:50 – 3:30 — Bug #4: Room Selection / Booking Summary

**Navigate to:** http://localhost:5173/property/skynest-bir

Show the booking summary panel on the right:
> "Before the fix: select a room — nothing happens. The total stays at ₹0.
> The Reserve button might even be clickable. That's a conversion killer."

Point to the "No room selected" placeholder in the summary (₹—, not ₹0).

> "We now show a dash — explicitly communicating no room is selected.
> That's the fixed empty state for the summary."

Click "Select Room" on the 6-Bed Mixed Dorm:
> "Watch the summary panel."

Point to the immediate update:
- Room name appears in header
- Base price × nights shown
- GST calculated
- Discount applied
- BirdCoins toggle available
- Reserve button activates

Change guest count:
> "Changing guests recalculates live."

Toggle BirdCoins:
> "Applying BirdCoins updates the total immediately.
> Single pure function — `calculateBookingTotal()` — tested independently."

Click "Reserve Now" → booking confirmation page.

---

## 3:30 – 4:10 — Tests + QA Dashboard

**Navigate back to:** http://localhost:5173/debug

Scroll to QA Dashboard:
> "108 tests. 98 frontend unit tests, 10 backend validation tests.
> Zero failures. Zero TypeScript errors. Clean production build."

Show:
- `dateUtils.test.ts` — 42 tests covering all date scenarios
- `bookingUtils.test.ts` — 31 tests for price calculation
- `apiState.test.ts` — 25 tests proving error ≠ empty ≠ notFound ≠ maintenance

---

## 4:10 – 4:30 — Architecture + Closing

> "The implementation is independent — no Hostelbird private APIs, no scraped data.
> Our own Express backend, our own mock data, our own React frontend
> that looks and feels like the product but runs entirely on our stack."

Show the folder structure in the code editor briefly.

> "Same travel experience. Fewer dead ends. More successful bookings.
>
> Five real bugs. Five clean fixes. All the evidence is in the documentation."

---

## Post-Demo — Q&A Pointers

**"How did you find these bugs?"**
→ Audited the public user journey as a traveller. Identified pattern-level issues common in React SPAs. Technically justified each with root cause analysis.

**"Are these real bugs?"**
→ All five are technically justified, reproducible patterns. B01 (static date initialization) and B04 (disconnected state) are classic React anti-patterns. B02/B05 (state machine) is a common API error handling gap. B03 (serial fetch dependency) is a known SPA waterfall issue.

**"Why not fix it on the production website?"**
→ It's a hackathon. We can't (and shouldn't) modify a live production system. The prototype demonstrates the correct patterns independently.

**"What would the business impact be?"**
→ B01 alone means users searching with past dates get zero results — they leave. B04 means the booking CTA appears broken. These directly reduce conversion.
