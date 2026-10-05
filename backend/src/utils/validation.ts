/**
 * Backend validation utilities — HostelBird Build & Break
 * B01/B04 Fix: Server-side validation of booking data.
 */

export function isValidDate(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr + 'T00:00:00');
  return !isNaN(d.getTime());
}

export function isFutureOrToday(dateStr: string): boolean {
  if (!isValidDate(dateStr)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr + 'T00:00:00');
  return date >= today;
}

export function isValidDateRange(checkIn: string, checkOut: string): boolean {
  if (!isValidDate(checkIn) || !isValidDate(checkOut)) return false;
  if (!isFutureOrToday(checkIn)) return false;
  return checkOut > checkIn;
}

export interface BookingValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateBookingPayload(payload: {
  propertyId?: unknown;
  roomId?: unknown;
  dates?: { checkIn?: unknown; checkOut?: unknown };
  guests?: { adults?: unknown; children?: unknown };
  birdCoinsApplied?: unknown;
}): BookingValidationResult {
  const errors: string[] = [];

  if (!payload.propertyId || typeof payload.propertyId !== 'string') {
    errors.push('propertyId is required.');
  }
  if (!payload.roomId || typeof payload.roomId !== 'string') {
    errors.push('roomId is required.');
  }

  const checkIn  = payload.dates?.checkIn as string;
  const checkOut = payload.dates?.checkOut as string;

  if (!checkIn || !isValidDate(checkIn)) {
    errors.push('checkIn must be a valid YYYY-MM-DD date.');
  } else if (!isFutureOrToday(checkIn)) {
    errors.push('checkIn cannot be in the past.');
  }

  if (!checkOut || !isValidDate(checkOut)) {
    errors.push('checkOut must be a valid YYYY-MM-DD date.');
  } else if (checkIn && checkOut <= checkIn) {
    errors.push('checkOut must be after checkIn.');
  }

  const adults = payload.guests?.adults;
  if (typeof adults !== 'number' || adults < 1) {
    errors.push('guests.adults must be at least 1.');
  }

  const coins = payload.birdCoinsApplied;
  if (typeof coins === 'number' && coins < 0) {
    errors.push('birdCoinsApplied cannot be negative.');
  }

  return { valid: errors.length === 0, errors };
}
