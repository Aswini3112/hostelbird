import { describe, it, expect } from 'vitest';
import { isValidDate, isFutureOrToday, isValidDateRange, validateBookingPayload } from '../utils/validation.js';

describe('isValidDate', () => {
  it('accepts valid YYYY-MM-DD', () => {
    expect(isValidDate('2026-10-05')).toBe(true);
    expect(isValidDate('2030-01-01')).toBe(true);
  });

  it('rejects invalid formats', () => {
    expect(isValidDate('05-10-2026')).toBe(false);
    expect(isValidDate('2026/10/05')).toBe(false);
    expect(isValidDate('')).toBe(false);
    expect(isValidDate('not-a-date')).toBe(false);
  });
});

describe('isFutureOrToday', () => {
  it('rejects past dates', () => {
    expect(isFutureOrToday('2020-01-01')).toBe(false);
    expect(isFutureOrToday('2024-10-03')).toBe(false); // B01 broken date
  });

  it('accepts future dates', () => {
    expect(isFutureOrToday('2030-01-01')).toBe(true);
  });
});

describe('validateBookingPayload', () => {
  const validPayload = {
    propertyId: 'prop-001',
    roomId: 'room-001a',
    dates: { checkIn: '2030-01-01', checkOut: '2030-01-03' },
    guests: { adults: 2, children: 0 },
    birdCoinsApplied: 0,
  };

  it('accepts a valid payload', () => {
    const result = validateBookingPayload(validPayload);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects missing propertyId', () => {
    const { propertyId: _, ...rest } = validPayload;
    const result = validateBookingPayload(rest);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('propertyId'))).toBe(true);
  });

  it('rejects past checkIn date', () => {
    const payload = { ...validPayload, dates: { checkIn: '2020-01-01', checkOut: '2020-01-02' } };
    const result = validateBookingPayload(payload);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.toLowerCase().includes('past'))).toBe(true);
  });

  it('rejects checkOut <= checkIn', () => {
    const payload = { ...validPayload, dates: { checkIn: '2030-01-03', checkOut: '2030-01-01' } };
    const result = validateBookingPayload(payload);
    expect(result.valid).toBe(false);
  });

  it('rejects zero guests', () => {
    const payload = { ...validPayload, guests: { adults: 0, children: 0 } };
    const result = validateBookingPayload(payload);
    expect(result.valid).toBe(false);
  });

  it('rejects negative BirdCoins', () => {
    const payload = { ...validPayload, birdCoinsApplied: -100 };
    const result = validateBookingPayload(payload);
    expect(result.valid).toBe(false);
  });
});
