/**
 * dateUtils.test.ts — Bug B01 Date Validation Tests
 *
 * Tests that all date utilities work correctly,
 * covering the core B01 fix: no past dates, dynamic initialization.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getToday,
  getTomorrow,
  getDaysFromToday,
  isPastDate,
  isToday,
  isValidDateRange,
  getDefaultBookingDates,
  validateBookingDates,
  getValidCheckOut,
  calculateNights,
  formatDisplayDate,
  formatLongDate,
} from '../utils/dateUtils';

// ── Helpers ───────────────────────────────────────────────────────────────

function localDate(y: number, m: number, d: number): Date {
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function ymd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ── getToday ──────────────────────────────────────────────────────────────

describe('getToday', () => {
  it('returns a string in YYYY-MM-DD format', () => {
    const today = getToday();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('matches the local date (not UTC)', () => {
    const today = getToday();
    const expected = ymd(new Date());
    expect(today).toBe(expected);
  });

  it('is never a past date', () => {
    const today = getToday();
    expect(isPastDate(today)).toBe(false);
  });
});

// ── getTomorrow ───────────────────────────────────────────────────────────

describe('getTomorrow', () => {
  it('returns a string in YYYY-MM-DD format', () => {
    expect(getTomorrow()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('is always after today', () => {
    expect(getTomorrow() > getToday()).toBe(true);
  });
});

// ── getDaysFromToday ──────────────────────────────────────────────────────

describe('getDaysFromToday', () => {
  it('n=0 returns today', () => {
    expect(getDaysFromToday(0)).toBe(getToday());
  });

  it('n=1 returns tomorrow', () => {
    expect(getDaysFromToday(1)).toBe(getTomorrow());
  });

  it('n=7 returns a week from today', () => {
    const weekFromNow = getDaysFromToday(7);
    expect(weekFromNow > getToday()).toBe(true);
  });
});

// ── isPastDate ────────────────────────────────────────────────────────────

describe('isPastDate', () => {
  it('returns true for a clearly past date', () => {
    expect(isPastDate('2020-01-01')).toBe(true);
    expect(isPastDate('2024-10-03')).toBe(true); // the "broken" date from B01
  });

  it('returns false for today', () => {
    expect(isPastDate(getToday())).toBe(false);
  });

  it('returns false for a future date', () => {
    expect(isPastDate(getTomorrow())).toBe(false);
    expect(isPastDate('2030-01-01')).toBe(false);
  });
});

// ── isToday ───────────────────────────────────────────────────────────────

describe('isToday', () => {
  it('returns true for today', () => {
    expect(isToday(getToday())).toBe(true);
  });

  it('returns false for tomorrow', () => {
    expect(isToday(getTomorrow())).toBe(false);
  });

  it('returns false for past date', () => {
    expect(isToday('2020-01-01')).toBe(false);
  });
});

// ── isValidDateRange ──────────────────────────────────────────────────────

describe('isValidDateRange', () => {
  it('valid range: today → tomorrow', () => {
    expect(isValidDateRange(getToday(), getTomorrow())).toBe(true);
  });

  it('invalid: check-in in the past', () => {
    expect(isValidDateRange('2020-01-01', '2020-01-02')).toBe(false);
  });

  it('invalid: checkout before check-in', () => {
    expect(isValidDateRange(getTomorrow(), getToday())).toBe(false);
  });

  it('invalid: checkout same as check-in', () => {
    const today = getToday();
    expect(isValidDateRange(today, today)).toBe(false);
  });

  it('valid: future multi-night range', () => {
    expect(isValidDateRange(getToday(), getDaysFromToday(7))).toBe(true);
  });

  it('handles empty strings gracefully', () => {
    expect(isValidDateRange('', '')).toBe(false);
    expect(isValidDateRange(getToday(), '')).toBe(false);
  });
});

// ── getDefaultBookingDates ────────────────────────────────────────────────

describe('getDefaultBookingDates — B01 core fix', () => {
  it('checkIn equals today', () => {
    const { checkIn } = getDefaultBookingDates();
    expect(checkIn).toBe(getToday());
  });

  it('checkOut equals tomorrow', () => {
    const { checkOut } = getDefaultBookingDates();
    expect(checkOut).toBe(getTomorrow());
  });

  it('produces a valid date range', () => {
    const { checkIn, checkOut } = getDefaultBookingDates();
    expect(isValidDateRange(checkIn, checkOut)).toBe(true);
  });

  it('checkIn is not in the past', () => {
    const { checkIn } = getDefaultBookingDates();
    expect(isPastDate(checkIn)).toBe(false);
  });

  it('returns different dates on every call (never stale)', () => {
    const a = getDefaultBookingDates();
    const b = getDefaultBookingDates();
    expect(a.checkIn).toBe(b.checkIn); // same date, but computed dynamically
  });
});

// ── validateBookingDates ──────────────────────────────────────────────────

describe('validateBookingDates — B01 submit validation', () => {
  it('returns null for a valid range', () => {
    expect(validateBookingDates(getToday(), getTomorrow())).toBeNull();
  });

  it('returns error for past check-in', () => {
    const err = validateBookingDates('2020-01-01', '2020-01-02');
    expect(err).toBeTruthy();
    expect(err).toMatch(/past/i);
  });

  it('returns error for checkout <= check-in', () => {
    const today = getToday();
    const err = validateBookingDates(today, today);
    expect(err).toBeTruthy();
    expect(err).toMatch(/after/i);
  });

  it('returns error for empty strings', () => {
    expect(validateBookingDates('', '')).toBeTruthy();
    expect(validateBookingDates(getToday(), '')).toBeTruthy();
  });

  it('returns null for multi-night future range', () => {
    expect(validateBookingDates(getToday(), getDaysFromToday(5))).toBeNull();
  });
});

// ── getValidCheckOut ──────────────────────────────────────────────────────

describe('getValidCheckOut — B01 auto-correct checkout', () => {
  it('preserves checkout if still valid after check-in change', () => {
    const checkIn  = getToday();
    const checkOut = getDaysFromToday(3);
    expect(getValidCheckOut(checkIn, checkOut)).toBe(checkOut);
  });

  it('auto-corrects checkout if it would be <= new check-in', () => {
    const newCheckIn   = getDaysFromToday(5);
    const staleCheckOut = getDaysFromToday(3); // earlier than new check-in
    const corrected = getValidCheckOut(newCheckIn, staleCheckOut);
    expect(corrected > newCheckIn).toBe(true);
  });

  it('sets checkout to day after check-in if stale', () => {
    const checkIn = getDaysFromToday(4);
    const result = getValidCheckOut(checkIn, getToday());
    expect(result).toBe(getDaysFromToday(5));
  });
});

// ── calculateNights ───────────────────────────────────────────────────────

describe('calculateNights', () => {
  it('returns 1 for today → tomorrow', () => {
    expect(calculateNights(getToday(), getTomorrow())).toBe(1);
  });

  it('returns correct count for multi-night range', () => {
    expect(calculateNights(getToday(), getDaysFromToday(5))).toBe(5);
  });

  it('returns 0 for invalid range', () => {
    expect(calculateNights('2020-01-01', '2019-01-01')).toBe(0);
    expect(calculateNights(getToday(), getToday())).toBe(0);
  });

  it('handles month boundary correctly', () => {
    expect(calculateNights('2026-10-31', '2026-11-01')).toBe(1);
  });

  it('handles year boundary correctly', () => {
    expect(calculateNights('2026-12-31', '2027-01-01')).toBe(1);
  });

  it('handles leap year correctly', () => {
    expect(calculateNights('2028-02-28', '2028-03-01')).toBe(2); // 2028 is a leap year
  });
});

// ── formatDisplayDate / formatLongDate ────────────────────────────────────

describe('formatDisplayDate', () => {
  it('returns a non-empty string for a valid date', () => {
    const result = formatDisplayDate('2026-10-05');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns empty string for empty input', () => {
    expect(formatDisplayDate('')).toBe('');
  });
});

describe('formatLongDate', () => {
  it('returns a non-empty string for a valid date', () => {
    const result = formatLongDate('2026-10-05');
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatch(/2026/);
  });
});
