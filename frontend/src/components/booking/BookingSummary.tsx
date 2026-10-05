/**
 * BookingSummary — HostelBird Build & Break
 *
 * B04 Fix: Summary reactively recalculates when room/guests/dates change.
 * Uses calculateBookingTotal() — single pure function, no duplicates.
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, Calendar, Users, ChevronDown, ChevronUp, Info } from 'lucide-react';
import type { Room, BirdCoinsState } from '../../types';
import { calculateBookingTotal, formatINR, coinsToRupees, getDefaultBirdCoins } from '../../utils/bookingUtils';
import { formatDisplayDate, calculateNights } from '../../utils/dateUtils';

interface BookingSummaryProps {
  propertySlug: string;
  selectedRoom: Room | null;
  checkIn: string;
  checkOut: string;
  guests: number;
  onGuestsChange: (guests: number) => void;
}

export default function BookingSummary({
  propertySlug,
  selectedRoom,
  checkIn,
  checkOut,
  guests,
  onGuestsChange,
}: BookingSummaryProps) {
  const navigate = useNavigate();
  const [birdCoins, setBirdCoins] = useState<BirdCoinsState>(getDefaultBirdCoins());
  const [showBreakdown, setShowBreakdown] = useState(false);

  const nights = calculateNights(checkIn, checkOut);

  // B04 Fix: reactive calculation — recalculates on any dependency change
  const total = useMemo(() => {
    if (!selectedRoom || nights < 1) return null;
    return calculateBookingTotal(selectedRoom, checkIn, checkOut, guests, birdCoins.applied);
  }, [selectedRoom, checkIn, checkOut, guests, birdCoins.applied, nights]);

  const maxCoins = total
    ? Math.floor((total.subtotal * 0.1) * 10)
    : 0;

  const handleApplyCoins = (apply: boolean) => {
    setBirdCoins(prev => ({
      ...prev,
      applied: apply ? Math.min(prev.available, maxCoins) : 0,
      maxApplicable: maxCoins,
    }));
  };

  const handleReserve = () => {
    if (!selectedRoom || !total) return;
    navigate(`/booking/${propertySlug}/${selectedRoom.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&coins=${birdCoins.applied}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-booking border border-gray-100 overflow-hidden sticky top-24">
      {/* Header */}
      <div className="bg-brand-500 px-5 py-4">
        <h2 className="text-white font-bold text-base">Booking Summary</h2>
        {selectedRoom ? (
          <p className="text-brand-100 text-sm mt-0.5 truncate">{selectedRoom.name}</p>
        ) : (
          <p className="text-brand-100 text-sm mt-0.5">No room selected yet</p>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Dates */}
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="w-4 h-4 text-brand-500 flex-shrink-0" />
          <div className="flex-1">
            <span className="text-gray-700 font-medium">{formatDisplayDate(checkIn)}</span>
            <span className="text-gray-400 mx-2">→</span>
            <span className="text-gray-700 font-medium">{formatDisplayDate(checkOut)}</span>
          </div>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {nights} night{nights !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Guests */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Users className="w-4 h-4 text-brand-500" />
            <span>Guests</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onGuestsChange(Math.max(1, guests - 1))}
              className="w-7 h-7 rounded-full border-2 border-gray-200 text-gray-600 hover:border-brand-400 flex items-center justify-center font-bold"
              aria-label="Decrease guests"
            >
              −
            </button>
            <span className="w-6 text-center font-semibold text-gray-900">{guests}</span>
            <button
              onClick={() => onGuestsChange(Math.min(selectedRoom?.capacity ?? 20, guests + 1))}
              className="w-7 h-7 rounded-full border-2 border-gray-200 text-gray-600 hover:border-brand-400 flex items-center justify-center font-bold"
              aria-label="Increase guests"
            >
              +
            </button>
          </div>
        </div>

        {/* Capacity warning */}
        {selectedRoom && guests > selectedRoom.capacity && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg" role="alert">
            <Info className="w-4 h-4 flex-shrink-0" />
            Maximum capacity is {selectedRoom.capacity} guests for this room.
          </div>
        )}

        <hr className="border-gray-100" />

        {/* Price breakdown */}
        {total ? (
          <>
            <div>
              <button
                className="flex items-center justify-between w-full text-sm text-gray-700"
                onClick={() => setShowBreakdown(!showBreakdown)}
                aria-expanded={showBreakdown}
                aria-label="Toggle price breakdown"
              >
                <span className="font-medium">Price Details</span>
                {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showBreakdown && (
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>{formatINR(total.basePrice)} × {nights} night{nights > 1 ? 's' : ''}</span>
                    <span>{formatINR(total.subtotal)}</span>
                  </div>
                  {total.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>− {formatINR(total.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>GST & Taxes</span>
                    <span>{formatINR(total.taxes)}</span>
                  </div>
                  {total.birdCoinsDiscount > 0 && (
                    <div className="flex justify-between text-amber-600">
                      <span>BirdCoins ({birdCoins.applied} coins)</span>
                      <span>− {formatINR(total.birdCoinsDiscount)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* BirdCoins */}
            {birdCoins.available > 0 && (
              <div className="bg-amber-50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-amber-700 text-sm font-medium">
                    <Coins className="w-4 h-4" />
                    BirdCoins
                  </div>
                  <span className="text-xs text-amber-600">{birdCoins.available} available</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">
                    Apply up to {maxCoins} coins → save {formatINR(coinsToRupees(maxCoins))}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={birdCoins.applied > 0}
                      onChange={e => handleApplyCoins(e.target.checked)}
                      aria-label="Apply BirdCoins discount"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-checked:bg-amber-500 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                  </label>
                </div>
              </div>
            )}

            <hr className="border-gray-100" />

            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900">Total</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {formatINR(total.total)}
                </div>
                <div className="text-xs text-brand-600">
                  Earn +{total.birdCoinsEarned} BirdCoins
                </div>
              </div>
            </div>
          </>
        ) : (
          // B04 Fix: clearly state "no room selected" rather than showing ₹0 silently
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-gray-300 mb-1">₹—</div>
            <p className="text-sm text-gray-400">
              {!selectedRoom ? 'Select a room to see pricing' : 'Select valid dates'}
            </p>
          </div>
        )}

        {/* Reserve button */}
        <button
          onClick={handleReserve}
          disabled={!selectedRoom || !total || (selectedRoom && guests > selectedRoom.capacity)}
          className="btn-primary w-full py-3.5 text-base"
          aria-label="Reserve selected room"
        >
          {!selectedRoom ? 'Select a Room First' : 'Reserve Now'}
        </button>

        <p className="text-xs text-gray-400 text-center">
          You won't be charged yet — confirm on the next page.
        </p>
      </div>
    </div>
  );
}
