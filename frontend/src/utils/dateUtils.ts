/**
 * dateUtils.ts — HostelBird Build & Break
 *
 * Centralised, timezone-safe date handling for the booking widget.
 * All functions work with YYYY-MM-DD strings (local date, no timezone shift).
 *
 * Bug B01 Fix: replaces static hardcoded date initialization.
 */

// ── Internal helpers ───────────────────────────────────────────────────────

/**
 * Returns a YYYY-MM-DD string for the given Date object,
 * using LOCAL date parts (not UTC) to avoid timezone shifts.
 */
function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parses a YYYY-MM-DD string into a local Date at midnight.
 * Avoids the UTC offset issue of `new Date("YYYY-MM-DD")`.
 */
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Returns today's date as a YYYY-MM-DD string (local timezone).
 * B01 Fix: use this instead of hardcoded strings.
 */
export function getToday(): string {
  return toLocalDateString(new Date());
}

/**
 * Returns tomorrow's date as a YYYY-MM-DD string (local timezone).
 * B01 Fix: use this as the default checkout date.
 */
export function getTomorrow(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return toLocalDateString(tomorrow);
}

/**
 * Returns a date N days from today as YYYY-MM-DD.
 */
export function getDaysFromToday(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toLocalDateString(d);
}

/**
 * Returns true if the given date string is strictly before today.
 * B01 Fix: use this to disable past dates in the calendar.
 */
export function isPastDate(dateStr: string): boolean {
  const today = toLocalDateString(new Date());
  return dateStr < today;
}

/**
 * Returns true if the given date string equals today.
 */
export function isToday(dateStr: string): boolean {
  return dateStr === toLocalDateString(new Date());
}

/**
 * Returns true if checkIn < checkOut and neither is in the past.
 */
export function isValidDateRange(checkIn: string, checkOut: string): boolean {
  if (!checkIn || !checkOut) return false;
  if (isPastDate(checkIn)) return false;
  return checkOut > checkIn;
}

/**
 * Default booking dates — always valid on load.
 * B01 Fix: replaces static string initialization.
 */
export function getDefaultBookingDates(): { checkIn: string; checkOut: string } {
  return {
    checkIn: getToday(),
    checkOut: getTomorrow(),
  };
}

/**
 * Validates booking dates and returns an error message or null.
 * B01 Fix: call this on form submit to reject invalid date ranges.
 */
export function validateBookingDates(
  checkIn: string,
  checkOut: string
): string | null {
  if (!checkIn || !checkOut) {
    return 'Please select check-in and check-out dates.';
  }

  const today = toLocalDateString(new Date());

  if (checkIn < today) {
    return 'Check-in date cannot be in the past.';
  }

  if (checkOut <= checkIn) {
    return 'Check-out must be after check-in.';
  }

  return null; // valid
}

/**
 * Given a new check-in date, returns a valid check-out date.
 * If the existing checkout is still valid, it is preserved.
 * Otherwise checkout is set to the day after the new check-in.
 * B01 Fix: use this when user changes check-in to auto-correct checkout.
 */
export function getValidCheckOut(newCheckIn: string, currentCheckOut: string): string {
  if (currentCheckOut > newCheckIn) {
    return currentCheckOut;
  }
  const d = parseLocalDate(newCheckIn);
  d.setDate(d.getDate() + 1);
  return toLocalDateString(d);
}

/**
 * Calculates the number of nights between two YYYY-MM-DD strings.
 * Returns 0 for invalid ranges.
 */
export function calculateNights(checkIn: string, checkOut: string): number {
  if (!isValidDateRange(checkIn, checkOut)) return 0;
  const inDate = parseLocalDate(checkIn);
  const outDate = parseLocalDate(checkOut);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((outDate.getTime() - inDate.getTime()) / msPerDay);
}

/**
 * Formats a YYYY-MM-DD string to a human-readable display string.
 * e.g. "2026-10-05" → "Mon, 05 Oct"
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
}

/**
 * Formats a YYYY-MM-DD string to a longer display.
 * e.g. "2026-10-05" → "5 October 2026"
 */
export function formatLongDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
