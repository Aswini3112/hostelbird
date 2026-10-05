/**
 * BookingWidget — HostelBird Build & Break
 *
 * B01 Fix: Booking search widget with dynamic date initialization.
 * Never starts with past dates. Validates on submit.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, MapPin, Search } from 'lucide-react';
import {
  getDefaultBookingDates,
  validateBookingDates,
  getValidCheckOut,
  isPastDate,
  formatDisplayDate,
} from '../../utils/dateUtils';

interface BookingWidgetProps {
  defaultDestination?: string;
  compact?: boolean;
  onSearch?: (params: { destination: string; checkIn: string; checkOut: string; guests: number }) => void;
}

export default function BookingWidget({
  defaultDestination = '',
  compact = false,
  onSearch,
}: BookingWidgetProps) {
  // B01 Fix: initialize with dynamic today/tomorrow, never hardcoded past dates
  const defaults = getDefaultBookingDates();
  const [destination, setDestination] = useState(defaultDestination);
  const [checkIn, setCheckIn] = useState(defaults.checkIn);
  const [checkOut, setCheckOut] = useState(defaults.checkOut);
  const [guests, setGuests] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const today = defaults.checkIn; // recalculated on render for freshness

  const handleCheckInChange = (value: string) => {
    setCheckIn(value);
    // B01 Fix: auto-correct checkout if it becomes invalid
    const validOut = getValidCheckOut(value, checkOut);
    setCheckOut(validOut);
    setError(null);
  };

  const handleCheckOutChange = (value: string) => {
    setCheckOut(value);
    setError(null);
  };

  const handleSearch = () => {
    const validationError = validateBookingDates(checkIn, checkOut);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);

    if (onSearch) {
      onSearch({ destination, checkIn, checkOut, guests });
    } else {
      const slug = destination.toLowerCase().replace(/\s+/g, '-') || 'bir';
      navigate(`/location/${slug}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
    }
  };

  const destinations = [
    'Bir Billing', 'Goa', 'Rishikesh', 'Manali', 'Udaipur', 'Delhi',
  ];

  return (
    <div
      className={`bg-white rounded-2xl shadow-booking ${
        compact ? 'p-4' : 'p-6'
      }`}
      role="search"
      aria-label="Hostel search"
    >
      <div className={`grid gap-3 ${compact ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
        {/* Destination */}
        <div className="relative">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Destination
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 pointer-events-none" />
            <select
              value={destination}
              onChange={e => setDestination(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-800
                         focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white appearance-none"
              aria-label="Select destination"
            >
              <option value="">Where to go?</option>
              {destinations.map(d => (
                <option key={d} value={d.toLowerCase().replace(/\s+/g, '-')}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Check-in */}
        <div>
          <label htmlFor="checkin-date" className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Check-in
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 pointer-events-none" />
            <input
              id="checkin-date"
              type="date"
              value={checkIn}
              min={today} // B01 Fix: disable past dates
              onChange={e => handleCheckInChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-800
                         focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              aria-label="Check-in date"
            />
          </div>
          {checkIn && (
            <p className="text-xs text-gray-400 mt-1 pl-1">{formatDisplayDate(checkIn)}</p>
          )}
        </div>

        {/* Check-out */}
        <div>
          <label htmlFor="checkout-date" className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Check-out
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 pointer-events-none" />
            <input
              id="checkout-date"
              type="date"
              value={checkOut}
              min={checkIn || today} // B01 Fix: checkout must be after check-in
              onChange={e => handleCheckOutChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-800
                         focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              aria-label="Check-out date"
            />
          </div>
          {checkOut && (
            <p className="text-xs text-gray-400 mt-1 pl-1">{formatDisplayDate(checkOut)}</p>
          )}
        </div>

        {/* Guests + Search */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label htmlFor="guests-count" className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              Guests
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 pointer-events-none" />
              <input
                id="guests-count"
                type="number"
                min={1}
                max={20}
                value={guests}
                onChange={e => setGuests(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-800
                           focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                aria-label="Number of guests"
              />
            </div>
          </div>

          <div className={compact ? 'self-end' : 'self-end'}>
            <button
              onClick={handleSearch}
              className="btn-primary flex items-center gap-2 py-2.5 px-4 mt-5"
              aria-label="Search hostels"
            >
              <Search className="w-4 h-4" />
              {!compact && <span>Search</span>}
            </button>
          </div>
        </div>
      </div>

      {/* B01 Fix: validation error message */}
      {error && (
        <div
          className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl"
          role="alert"
          aria-live="polite"
        >
          <span className="font-medium">⚠ {error}</span>
        </div>
      )}

      {/* B01 Demo indicator */}
      {!compact && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-brand-600 bg-brand-50 px-3 py-2 rounded-lg w-fit">
          <span className="w-2 h-2 bg-brand-500 rounded-full" />
          <span>Dates auto-set to today/tomorrow — past dates disabled (B01 Fix)</span>
        </div>
      )}
    </div>
  );
}
