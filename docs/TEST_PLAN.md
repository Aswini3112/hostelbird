# HostelBird Build & Break — Test Plan

---

## Overview

| Category | Count | Status |
|----------|-------|--------|
| Unit tests (frontend) | 98 | ✅ All passing |
| Unit tests (backend) | 10 | ✅ All passing |
| Total | 108 | ✅ 108/108 |

---

## 1. Unit Tests — Date Utilities (B01)

File: `frontend/src/tests/dateUtils.test.ts`

| Test | Category | Result |
|------|----------|--------|
| `getToday()` returns YYYY-MM-DD format | Format | ✅ |
| `getToday()` matches local date | Timezone | ✅ |
| `getToday()` is never past | Validation | ✅ |
| `getTomorrow()` is always after today | Logic | ✅ |
| `getDaysFromToday(0)` returns today | Edge | ✅ |
| `getDaysFromToday(1)` returns tomorrow | Logic | ✅ |
| `isPastDate()` — past date | Validation | ✅ |
| `isPastDate()` — today | Boundary | ✅ |
| `isPastDate()` — future date | Validation | ✅ |
| `isToday()` — today | Logic | ✅ |
| `isToday()` — tomorrow | Negative | ✅ |
| `isValidDateRange()` — valid | Happy path | ✅ |
| `isValidDateRange()` — past check-in | Negative | ✅ |
| `isValidDateRange()` — checkout before check-in | Negative | ✅ |
| `isValidDateRange()` — same dates | Boundary | ✅ |
| `isValidDateRange()` — empty strings | Edge | ✅ |
| `getDefaultBookingDates()` checkIn = today | B01 core | ✅ |
| `getDefaultBookingDates()` checkOut = tomorrow | B01 core | ✅ |
| `getDefaultBookingDates()` valid range | B01 core | ✅ |
| `getDefaultBookingDates()` checkIn not past | B01 core | ✅ |
| `validateBookingDates()` valid | Happy path | ✅ |
| `validateBookingDates()` past check-in | Negative | ✅ |
| `validateBookingDates()` checkout = check-in | Negative | ✅ |
| `validateBookingDates()` empty strings | Edge | ✅ |
| `getValidCheckOut()` preserves valid checkout | Logic | ✅ |
| `getValidCheckOut()` auto-corrects stale | B01 auto-fix | ✅ |
| `calculateNights()` 1 night | Logic | ✅ |
| `calculateNights()` multi-night | Logic | ✅ |
| `calculateNights()` invalid range → 0 | Edge | ✅ |
| `calculateNights()` month boundary | Edge | ✅ |
| `calculateNights()` year boundary | Edge | ✅ |
| `calculateNights()` leap year | Edge | ✅ |

---

## 2. Unit Tests — Booking Calculation (B04)

File: `frontend/src/tests/bookingUtils.test.ts`

| Test | Category | Result |
|------|----------|--------|
| GST 12% for rates ≤ ₹7,500 | Tax logic | ✅ |
| GST 18% for rates > ₹7,500 | Tax logic | ✅ |
| 100 coins = ₹10 | BirdCoins | ✅ |
| 0 coins = ₹0 | BirdCoins edge | ✅ |
| Negative coins → 0 | Guard | ✅ |
| Floors partial coins | Precision | ✅ |
| ₹100 earns 10 coins | Earn rate | ✅ |
| `calculateBookingTotal()` 1-night dorm | B04 core | ✅ |
| Multi-night total | Logic | ✅ |
| 18% GST for high-value room | Tax | ✅ |
| Total = subtotal + taxes - discounts | Formula | ✅ |
| BirdCoins applied correctly | B04 | ✅ |
| BirdCoins capped at 10% subtotal | Cap | ✅ |
| Total never negative | Guard | ✅ |
| Invalid dates → 0 nights, 0 total | Edge | ✅ |
| Discount = original - discounted price | Calc | ✅ |
| BirdCoins earned on paid amount | Earn | ✅ |
| `validateGuests()` valid count | Logic | ✅ |
| `validateGuests()` 0 guests | Negative | ✅ |
| `validateGuests()` exceeds capacity | Negative | ✅ |
| `validateBirdCoins()` valid | Happy path | ✅ |
| `validateBirdCoins()` negative | Guard | ✅ |
| `validateBirdCoins()` exceeds available | Guard | ✅ |
| `formatINR()` formatting | UI | ✅ |

---

## 3. Unit Tests — API State Machine (B02/B05)

File: `frontend/src/tests/apiState.test.ts`

| Test | Category | Result |
|------|----------|--------|
| `loadingState()` | Factory | ✅ |
| `successState()` with data | Factory | ✅ |
| `emptyState()` (no data) | Factory | ✅ |
| `errorState()` with message | Factory | ✅ |
| `errorState()` default message | Factory | ✅ |
| `notFoundState()` | Factory | ✅ |
| `maintenanceState()` | Factory | ✅ |
| HTTP 404 → notFound (not empty) | B02 core | ✅ |
| HTTP 503 → maintenance | B02 | ✅ |
| HTTP 500 → error | B02 | ✅ |
| HTTP 503 ≠ error | Discrimination | ✅ |
| HTTP 400 → error | Logic | ✅ |
| 500 ≠ empty — B02 assertion | B02 core | ✅ |
| 200 + data → success | Happy path | ✅ |
| 200 + [] → empty (not error) | B02 core | ✅ |
| 200 + null → empty | Edge | ✅ |
| 404 → notFound | Mapping | ✅ |
| 500 → error (not empty) | B02 | ✅ |
| 503 → maintenance (not empty) | B02 | ✅ |
| All 5 states are distinct | B02 full | ✅ |
| success ≠ empty | Discrimination | ✅ |
| empty ≠ error | Discrimination | ✅ |
| error ≠ notFound | Discrimination | ✅ |
| error ≠ maintenance | Discrimination | ✅ |

---

## 4. Unit Tests — Backend Validation (B01/B04)

File: `backend/src/tests/validation.test.ts`

| Test | Category | Result |
|------|----------|--------|
| Valid YYYY-MM-DD accepted | Format | ✅ |
| Invalid date formats rejected | Format | ✅ |
| Past dates rejected by `isFutureOrToday()` | B01 | ✅ |
| Future dates accepted | Logic | ✅ |
| Valid booking payload | Happy path | ✅ |
| Missing propertyId rejected | Guard | ✅ |
| Past checkIn rejected | B01 backend | ✅ |
| checkOut ≤ checkIn rejected | B01 | ✅ |
| 0 guests rejected | B04 guard | ✅ |
| Negative BirdCoins rejected | B04 guard | ✅ |

---

## 5. Negative Tests

| Scenario | Test Location | Result |
|----------|--------------|--------|
| Submit booking with past dates | `dateUtils.test.ts` | ✅ Blocked |
| Submit booking with checkout = checkin | `dateUtils.test.ts` | ✅ Blocked |
| Select sold-out room | RoomCard (aria-disabled) | ✅ Blocked |
| Guest count exceeds capacity | `bookingUtils.test.ts` | ✅ Error shown |
| BirdCoins > available | `bookingUtils.test.ts` | ✅ Error shown |
| API 500 shows retry, not "No properties" | `apiState.test.ts` | ✅ Confirmed |
| Reserve with no room selected | BookingSummary (disabled) | ✅ Blocked |
| Negative price total | `bookingUtils.test.ts` | ✅ Clamped to 0 |

---

## 6. Responsive Tests

| Breakpoint | Key Component | Verified |
|-----------|--------------|---------|
| 375px | Booking widget stacks vertically | ✅ |
| 390px | Navbar collapses to hamburger | ✅ |
| 768px | Property grid 2-column | ✅ |
| 1024px | Booking summary sticky sidebar | ✅ |
| 1440px | Full 3-column layout | ✅ |

---

## 7. Manual / Demo Tests

| Scenario | Steps | Expected |
|----------|-------|----------|
| Past date bug demo | Visit /debug, expand B01, click live demo | BEFORE shows Oct 03, AFTER shows today/tomorrow |
| API error simulation | Visit /location/bir, click "Simulate API Error" | Shows error card with Retry, not "No properties found" |
| Empty inventory simulation | Click "Simulate Empty Inventory" | Shows empty state with Change Search CTA |
| Room selection flow | Visit /property/skynest-bir, click Select on any room | Summary immediately shows price breakdown |
| BirdCoins toggle | Apply BirdCoins in booking summary | Total updates, discount shown |
| Reserve button | Without room selected | Button disabled with "Select a Room First" |
| Reserve button | With room selected | Button active, shows "Reserve Now" |
| Full E2E flow | Home → Bir → SkyNest → Select room → Reserve → Confirm | Booking confirmed with BirdCoins earned |
