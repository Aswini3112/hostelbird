/**
 * bookingUtils.test.ts — Bug B04 Price Calculation Tests
 *
 * Tests for calculateBookingTotal() and related booking utilities.
 * B04 Fix: single pure function, all cases tested independently.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateBookingTotal,
  validateGuests,
  validateBirdCoins,
  formatINR,
  coinsToRupees,
  rupeesToCoinsEarned,
  getGstRate,
  GST_RATE_LOW,
  GST_RATE_HIGH,
  COINS_PER_INR,
  MAX_COINS_PCT,
} from '../utils/bookingUtils';
import type { Room } from '../types';
import { getToday, getTomorrow, getDaysFromToday } from '../utils/dateUtils';

// ── Test fixture ──────────────────────────────────────────────────────────

const dormRoom: Room = {
  id: 'test-room-dorm',
  propertyId: 'test-prop',
  name: '6-Bed Mixed Dorm',
  type: 'dorm',
  capacity: 6,
  availableBeds: 4,
  price: 699,
  originalPrice: 899,
  discount: 22,
  cancellationPolicy: 'free',
  amenities: ['wifi', 'locker'],
  images: [],
};

const privateRoom: Room = {
  id: 'test-room-private',
  propertyId: 'test-prop',
  name: 'Private Double Room',
  type: 'private',
  capacity: 2,
  availableBeds: 1,
  price: 8000, // > 7500 — should trigger 18% GST
  originalPrice: 10000,
  discount: 20,
  cancellationPolicy: 'partial',
  amenities: ['wifi', 'ac'],
  images: [],
};

// ── getGstRate ────────────────────────────────────────────────────────────

describe('getGstRate', () => {
  it('returns 12% for rates at or below 7500', () => {
    expect(getGstRate(7500)).toBe(GST_RATE_LOW);
    expect(getGstRate(699)).toBe(GST_RATE_LOW);
    expect(getGstRate(1)).toBe(GST_RATE_LOW);
  });

  it('returns 18% for rates above 7500', () => {
    expect(getGstRate(7501)).toBe(GST_RATE_HIGH);
    expect(getGstRate(8000)).toBe(GST_RATE_HIGH);
    expect(getGstRate(15000)).toBe(GST_RATE_HIGH);
  });
});

// ── coinsToRupees ─────────────────────────────────────────────────────────

describe('coinsToRupees', () => {
  it('100 coins = ₹10', () => {
    expect(coinsToRupees(100)).toBe(10);
  });

  it('1000 coins = ₹100', () => {
    expect(coinsToRupees(1000)).toBe(100);
  });

  it('0 coins = ₹0', () => {
    expect(coinsToRupees(0)).toBe(0);
  });

  it('negative coins returns 0', () => {
    expect(coinsToRupees(-100)).toBe(0);
  });

  it('floors partial coins', () => {
    expect(coinsToRupees(15)).toBe(1); // 15/10 = 1.5 → floor = 1
  });
});

// ── rupeesToCoinsEarned ───────────────────────────────────────────────────

describe('rupeesToCoinsEarned', () => {
  it('₹100 earns 10 coins', () => {
    expect(rupeesToCoinsEarned(100)).toBe(10);
  });

  it('₹0 earns 0 coins', () => {
    expect(rupeesToCoinsEarned(0)).toBe(0);
  });

  it('floors partial amounts', () => {
    expect(rupeesToCoinsEarned(15)).toBe(1); // floor(15/10) = 1
  });
});

// ── calculateBookingTotal — B04 core test ─────────────────────────────────

describe('calculateBookingTotal', () => {
  const today = getToday();
  const tomorrow = getTomorrow();
  const threeDays = getDaysFromToday(3);

  it('calculates correct 1-night dorm total', () => {
    const result = calculateBookingTotal(dormRoom, today, tomorrow, 1, 0);
    expect(result.nights).toBe(1);
    expect(result.basePrice).toBe(699);
    expect(result.subtotal).toBe(699);
    // 12% GST on 699
    expect(result.taxes).toBe(Math.round(699 * 0.12));
    expect(result.birdCoinsDiscount).toBe(0);
    expect(result.total).toBe(699 + Math.round(699 * 0.12));
  });

  it('calculates correct multi-night total', () => {
    const result = calculateBookingTotal(dormRoom, today, threeDays, 1, 0);
    expect(result.nights).toBe(3);
    expect(result.subtotal).toBe(699 * 3);
  });

  it('applies 18% GST for high-value rooms', () => {
    const result = calculateBookingTotal(privateRoom, today, tomorrow, 1, 0);
    expect(result.taxes).toBe(Math.round(8000 * 0.18));
  });

  it('total includes taxes in calculation', () => {
    const result = calculateBookingTotal(dormRoom, today, tomorrow, 1, 0);
    expect(result.total).toBe(result.subtotal + result.taxes - result.birdCoinsDiscount);
  });

  it('applies BirdCoins discount correctly', () => {
    const result = calculateBookingTotal(dormRoom, today, threeDays, 1, 100);
    // 100 coins = ₹10
    expect(result.birdCoinsDiscount).toBe(10);
    expect(result.total).toBe(result.subtotal + result.taxes - 10);
  });

  it('caps BirdCoins at 10% of subtotal', () => {
    const subtotal = dormRoom.price * 3; // 3 nights
    const maxCoins = Math.floor(subtotal * MAX_COINS_PCT * COINS_PER_INR);
    // Try applying more than max
    const result = calculateBookingTotal(dormRoom, today, threeDays, 1, maxCoins + 1000);
    // Should be capped
    expect(result.birdCoinsDiscount).toBeLessThanOrEqual(subtotal * MAX_COINS_PCT);
  });

  it('total is never negative', () => {
    // Even with extreme coins, total >= 0
    const result = calculateBookingTotal(dormRoom, today, tomorrow, 1, 999999);
    expect(result.total).toBeGreaterThanOrEqual(0);
  });

  it('returns 0 nights for invalid date range', () => {
    const result = calculateBookingTotal(dormRoom, tomorrow, today, 1, 0);
    expect(result.nights).toBe(0);
    expect(result.subtotal).toBe(0);
    expect(result.total).toBe(0);
  });

  it('discount amount reflects original vs discounted price difference', () => {
    const result = calculateBookingTotal(dormRoom, today, tomorrow, 1, 0);
    expect(result.discount).toBe(dormRoom.originalPrice - dormRoom.price);
  });

  it('earns BirdCoins on the final paid amount', () => {
    const result = calculateBookingTotal(dormRoom, today, tomorrow, 1, 0);
    expect(result.birdCoinsEarned).toBe(Math.floor(result.total / 10));
  });
});

// ── validateGuests ────────────────────────────────────────────────────────

describe('validateGuests', () => {
  it('returns null for valid guest count', () => {
    expect(validateGuests(1, dormRoom)).toBeNull();
    expect(validateGuests(6, dormRoom)).toBeNull();
  });

  it('returns error for 0 guests', () => {
    expect(validateGuests(0, dormRoom)).toBeTruthy();
    expect(validateGuests(0, dormRoom)).toMatch(/1 guest/i);
  });

  it('returns error for guests exceeding capacity', () => {
    const err = validateGuests(7, dormRoom);
    expect(err).toBeTruthy();
    expect(err).toMatch(/maximum/i);
    expect(err).toMatch(/6/);
  });

  it('capacity of 1 accepts exactly 1', () => {
    const singleRoom: Room = { ...dormRoom, capacity: 1 };
    expect(validateGuests(1, singleRoom)).toBeNull();
    expect(validateGuests(2, singleRoom)).toBeTruthy();
  });
});

// ── validateBirdCoins ─────────────────────────────────────────────────────

describe('validateBirdCoins', () => {
  const available = 1500;
  const subtotal  = 2000;

  it('returns null for valid application', () => {
    // maxApplicable must also respect the available coins ceiling
    const maxByPct = Math.floor(subtotal * MAX_COINS_PCT * COINS_PER_INR);
    const safeMax  = Math.min(maxByPct, available);
    expect(validateBirdCoins(safeMax, available, subtotal)).toBeNull();
  });

  it('returns error for negative coins', () => {
    expect(validateBirdCoins(-1, available, subtotal)).toBeTruthy();
  });

  it('returns error if coins exceed available', () => {
    expect(validateBirdCoins(2000, available, subtotal)).toBeTruthy();
    expect(validateBirdCoins(2000, available, subtotal)).toMatch(/1500/);
  });

  it('returns error if coins exceed max applicable', () => {
    const maxApplicable = Math.floor(subtotal * MAX_COINS_PCT * COINS_PER_INR);
    expect(validateBirdCoins(maxApplicable + 100, available, subtotal)).toBeTruthy();
  });
});

// ── formatINR ─────────────────────────────────────────────────────────────

describe('formatINR', () => {
  it('formats a simple amount', () => {
    expect(formatINR(1000)).toBe('₹1,000');
  });

  it('formats large amounts with Indian commas', () => {
    const result = formatINR(100000);
    expect(result).toContain('₹');
    expect(result).toContain('1');
  });

  it('formats zero', () => {
    expect(formatINR(0)).toBe('₹0');
  });
});
