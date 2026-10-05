/**
 * BookingPage — HostelBird Build & Break
 *
 * Booking confirmation page showing full price breakdown.
 */

import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useMemo, useEffect, useState } from 'react';
import {
  Calendar, Users, MapPin, Shield, Coins, CheckCircle,
  ArrowLeft, CreditCard,
} from 'lucide-react';
import type { Property, Room } from '../types';
import { calculateBookingTotal, formatINR } from '../utils/bookingUtils';
import { formatLongDate, calculateNights } from '../utils/dateUtils';
import { properties } from '../data/properties';

export default function BookingPage() {
  const { propertySlug, roomId } = useParams<{ propertySlug: string; roomId: string }>();
  const [searchParams] = useSearchParams();

  const checkIn  = searchParams.get('checkIn') ?? '';
  const checkOut = searchParams.get('checkOut') ?? '';
  const guests   = Number(searchParams.get('guests') ?? 1);
  const coins    = Number(searchParams.get('coins') ?? 0);

  const [property, setProperty] = useState<Property | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const prop = properties.find(p => p.slug === propertySlug);
    if (prop) {
      setProperty(prop);
      const r = prop.rooms.find(rm => rm.id === roomId);
      setRoom(r ?? null);
    }
  }, [propertySlug, roomId]);

  const total = useMemo(() => {
    if (!room || !checkIn || !checkOut) return null;
    return calculateBookingTotal(room, checkIn, checkOut, guests, coins);
  }, [room, checkIn, checkOut, guests, coins]);

  const nights = calculateNights(checkIn, checkOut);

  if (!property || !room || !total) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Booking details not found.</p>
          <Link to="/" className="btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="bg-white rounded-3xl shadow-card p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-brand-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-500 mb-6">
            Your stay at <strong>{property.name}</strong> is confirmed. Check-in on{' '}
            <strong>{formatLongDate(checkIn)}</strong>.
          </p>
          <div className="bg-amber-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-amber-700 font-semibold">
              <Coins className="w-5 h-5" />
              +{total.birdCoinsEarned} BirdCoins earned!
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {formatINR(total.total)}
          </div>
          <p className="text-sm text-gray-400 mb-8">Total charged</p>
          <Link to="/" className="btn-primary w-full block">
            Browse More Hostels
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link
          to={`/property/${property.slug}`}
          className="flex items-center gap-1.5 text-brand-600 text-sm hover:text-brand-700 mb-6 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to property
        </Link>

        <h1 className="text-2xl font-extrabold text-gray-900 mb-8">Confirm your booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left */}
          <div className="lg:col-span-3 space-y-5">
            {/* Property summary */}
            <div className="card p-5">
              <div className="flex gap-4">
                <img
                  src={property.images[0]}
                  alt={property.name}
                  className="w-24 h-24 rounded-xl object-cover flex-shrink-0 bg-brand-100"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div>
                  <h2 className="font-bold text-gray-900 text-lg mb-1">{property.name}</h2>
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-2">
                    <MapPin className="w-3.5 h-3.5" />
                    {property.address}
                  </div>
                  <div className="badge badge-green">{room.name}</div>
                </div>
              </div>
            </div>

            {/* Dates + guests */}
            <div className="card p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">Stay Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                    <Calendar className="w-3.5 h-3.5" /> Check-in
                  </div>
                  <div className="font-semibold text-gray-900">{formatLongDate(checkIn)}</div>
                  <div className="text-xs text-gray-400">After {property.policies.checkIn}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                    <Calendar className="w-3.5 h-3.5" /> Check-out
                  </div>
                  <div className="font-semibold text-gray-900">{formatLongDate(checkOut)}</div>
                  <div className="text-xs text-gray-400">Before {property.policies.checkOut}</div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                  <Users className="w-3.5 h-3.5" /> Guests
                </div>
                <div className="font-semibold text-gray-900">
                  {guests} guest{guests !== 1 ? 's' : ''} · {nights} night{nights !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Cancellation policy */}
            <div className="card p-5">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Cancellation Policy</h3>
                  <p className="text-sm text-gray-600">{property.policies.cancellation}</p>
                </div>
              </div>
            </div>

            {/* Demo-only payment placeholder */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900">Payment</h3>
                <span className="badge badge-gray">Demo Mode</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-400">
                Payment processing is simulated for this hackathon prototype.
                No real payment information is collected or stored.
              </div>
            </div>
          </div>

          {/* Right: Price summary */}
          <div className="lg:col-span-2">
            <div className="card p-5 sticky top-24">
              <h3 className="font-bold text-gray-900 text-base mb-4">Price Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>{formatINR(total.basePrice)} × {nights} night{nights > 1 ? 's' : ''}</span>
                  <span>{formatINR(total.subtotal)}</span>
                </div>
                {total.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount savings</span>
                    <span>− {formatINR(total.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>GST & Taxes</span>
                  <span>+ {formatINR(total.taxes)}</span>
                </div>
                {total.birdCoinsDiscount > 0 && (
                  <div className="flex justify-between text-amber-600">
                    <span>BirdCoins ({coins} coins)</span>
                    <span>− {formatINR(total.birdCoinsDiscount)}</span>
                  </div>
                )}
                <hr className="border-gray-100" />
                <div className="flex justify-between font-bold text-gray-900 text-base">
                  <span>Total</span>
                  <span>{formatINR(total.total)}</span>
                </div>
              </div>

              {total.birdCoinsEarned > 0 && (
                <div className="mt-4 bg-amber-50 rounded-xl p-3 flex items-center gap-2 text-amber-700 text-sm">
                  <Coins className="w-4 h-4" />
                  <span>You'll earn <strong>+{total.birdCoinsEarned} BirdCoins</strong> on this stay</span>
                </div>
              )}

              <button
                onClick={() => setConfirmed(true)}
                className="btn-primary w-full mt-5 py-3.5 text-base"
              >
                Confirm & Pay {formatINR(total.total)}
              </button>
              <p className="text-xs text-gray-400 text-center mt-2">
                Secure demo booking — no real charges
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
