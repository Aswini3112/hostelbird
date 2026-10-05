/**
 * bookingUtils.ts — HostelBird Build & Break
 *
 * Single source of truth for all booking price calculations.
 * Bug B04 Fix: replaces duplicated/missing price calculation logic.
 *
 * Pricing rules:
 * - GST: 12% on base accommodation (below ₹7,500/night), 18% above
 * - BirdCoins: 100 coins = ₹10 (₹0.10 per coin)
 * - Max BirdCoins applicable: up to 10% of the subtotal
 * - Discount is applied to original price, not stacked with BirdCoins
 */

import type { BookingTotal, BirdCoinsState, Room } from '../types';
import { calculateNights } from './dateUtils';

export const GST_RATE_LOW   = 0.12; // 12% for nightly rate ≤ ₹7,500
export const GST_RATE_HIGH  = 0.18; // 18% for nightly rate > ₹7,500
export const COINS_PER_INR  = 10;   // 100 coins = ₹10 → 10 coins = ₹1
export const MAX_COINS_PCT  = 0.10; // max 10% of subtotal via BirdCoins
export const EARN_RATE      = 1;    // 1 BirdCoin per ₹10 spent

/**
 * Determines the applicable GST rate based on nightly rate.
 */
export function getGstRate(nightlyRate: number): number {
  return nightlyRate > 7500 ? GST_RATE_HIGH : GST_RATE_LOW;
}

/**
 * Converts BirdCoins to INR value.
 */
export function coinsToRupees(coins: number): number {
  return Math.max(0, Math.floor(coins / COINS_PER_INR));
}

/**
 * Converts INR to BirdCoins earned.
 */
export function rupeesToCoinsEarned(amount: number): number {
  return Math.floor(amount / 10) * EARN_RATE;
}

/**
 * Main booking total calculator — pure function, independently testable.
 * Bug B04 Fix: use this everywhere instead of ad-hoc calculations.
 *
 * @param room - The selected room
 * @param checkIn - YYYY-MM-DD
 * @param checkOut - YYYY-MM-DD
 * @param guests - Number of guests
 * @param birdCoinsApplied - BirdCoins the user is applying to this booking
 */
export function calculateBookingTotal(
  room: Room,
  checkIn: string,
  checkOut: string,
  guests: number,
  birdCoinsApplied: number = 0
): BookingTotal {
  const nights = calculateNights(checkIn, checkOut);

  // Base price (already discounted price per bed/room per night)
  const pricePerNight = room.price;
  const subtotal = pricePerNight * nights;

  // Discount amount (difference from original price)
  const discountAmount = (room.originalPrice - room.price) * nights;

  // GST on discounted price
  const gstRate = getGstRate(pricePerNight);
  const taxes = Math.round(subtotal * gstRate);

  // BirdCoins — cap at MAX_COINS_PCT of subtotal
  const maxApplicableCoins = Math.floor((subtotal * MAX_COINS_PCT) * COINS_PER_INR);
  const safeCoins = Math.min(birdCoinsApplied, maxApplicableCoins);
  const birdCoinsDiscount = coinsToRupees(safeCoins);

  // Final total — never negative
  const total = Math.max(0, subtotal + taxes - birdCoinsDiscount);

  // BirdCoins earned on this booking (on final paid amount)
  const birdCoinsEarned = rupeesToCoinsEarned(total);

  return {
    nights,
    basePrice: pricePerNight,
    subtotal,
    taxes,
    discount: discountAmount,
    birdCoinsDiscount,
    birdCoinsEarned,
    total,
  };
}

/**
 * Validates guest count against room capacity.
 * Returns an error string or null if valid.
 */
export function validateGuests(guests: number, room: Room): string | null {
  if (guests < 1) return 'At least 1 guest is required.';
  if (guests > room.capacity) {
    return `This room fits a maximum of ${room.capacity} guest${room.capacity > 1 ? 's' : ''}.`;
  }
  return null;
}

/**
 * Validates BirdCoins application.
 * Returns an error string or null if valid.
 */
export function validateBirdCoins(
  coins: number,
  available: number,
  subtotal: number
): string | null {
  if (coins < 0) return 'BirdCoins cannot be negative.';
  if (coins > available) return `You only have ${available} BirdCoins available.`;
  const maxApplicable = Math.floor((subtotal * MAX_COINS_PCT) * COINS_PER_INR);
  if (coins > maxApplicable) {
    return `You can apply at most ${maxApplicable} BirdCoins to this booking.`;
  }
  return null;
}

/**
 * Formats an INR amount with commas (Indian number format).
 * e.g. 12345 → "₹12,345"
 */
export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Default BirdCoins state for a logged-in demo user.
 */
export function getDefaultBirdCoins(): BirdCoinsState {
  return {
    available: 1500,
    applied: 0,
    valuePerCoin: 1 / COINS_PER_INR,
    maxApplicable: 0,
  };
}
