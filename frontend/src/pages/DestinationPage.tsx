/**
 * DestinationPage — HostelBird Build & Break
 *
 * B02 Fix: Proper state machine — error ≠ empty ≠ not found.
 * B03 Fix: Destination metadata and properties fetched independently.
 */

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { MapPin, ArrowLeft, SlidersHorizontal, RefreshCw } from 'lucide-react';
import BookingWidget from '../components/booking/BookingWidget';
import PropertyCard from '../components/property/PropertyCard';
import ApiStateRenderer, { SkeletonCards } from '../components/ui/ApiStateRenderer';
import type { Destination, Property } from '../types';
import type { ApiState } from '../types';
import { successState, loadingState, errorState, notFoundState, emptyState } from '../utils/apiState';
import { destinations } from '../data/destinations';
import { properties } from '../data/properties';
import { getDefaultBookingDates } from '../utils/dateUtils';

// ── Simulated API ─────────────────────────────────────────────────────────

async function loadDestination(slug: string): Promise<ApiState<Destination>> {
  await new Promise(r => setTimeout(r, 400));
  const found = destinations.find(d => d.slug === slug);
  if (!found) return notFoundState<Destination>();
  return successState(found);
}

async function loadProperties(
  slug: string,
  mode: 'normal' | 'error' | 'empty'
): Promise<ApiState<Property[]>> {
  await new Promise(r => setTimeout(r, 600));
  if (mode === 'error') {
    return errorState<Property[]>('Server error (500): Unable to load properties.');
  }
  if (mode === 'empty') {
    return emptyState<Property[]>();
  }
  const found = properties.filter(p => p.destinationSlug === slug);
  if (found.length === 0) return emptyState<Property[]>();
  return successState(found);
}

// ── Component ─────────────────────────────────────────────────────────────

type SimMode = 'normal' | 'error' | 'empty';

export default function DestinationPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();

  const defaults = getDefaultBookingDates();
  const checkIn  = searchParams.get('checkIn')  ?? defaults.checkIn;
  const checkOut = searchParams.get('checkOut') ?? defaults.checkOut;
  const guests   = Number(searchParams.get('guests') ?? 2);

  const [destState,  setDestState]  = useState<ApiState<Destination>>(loadingState());
  const [propsState, setPropsState] = useState<ApiState<Property[]>>(loadingState());
  const [simMode, setSimMode] = useState<SimMode>('normal');
  const simModeRef = useRef<SimMode>('normal');

  // Keep ref in sync so async callbacks always read the latest mode
  const setMode = (mode: SimMode) => {
    simModeRef.current = mode;
    setSimMode(mode);
  };

  const runLoad = async (currentSlug: string, mode: SimMode) => {
    setDestState(loadingState());
    setPropsState(loadingState());

    // B03 Fix: fetch metadata and properties in parallel — independently
    const [destResult, propsResult] = await Promise.allSettled([
      loadDestination(currentSlug),
      loadProperties(currentSlug, mode),
    ]);

    setDestState(destResult.status === 'fulfilled' ? destResult.value : errorState());
    setPropsState(propsResult.status === 'fulfilled' ? propsResult.value : errorState());
  };

  // Initial load on mount / slug change — always normal mode
  useEffect(() => {
    if (!slug) return;
    setMode('normal');
    runLoad(slug, 'normal');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleSimulate = (mode: SimMode) => {
    if (!slug) return;
    setMode(mode);
    runLoad(slug, mode);
  };

  const destination = destState.status === 'success' ? destState.data : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative h-72 md:h-96 overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-gray-800">
        {destination?.heroImage && (
          <img
            src={destination.heroImage}
            alt={destination.name}
            className="w-full h-full object-cover opacity-70"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 max-w-7xl mx-auto">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-4 w-fit transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {destState.status === 'loading' ? (
            <div className="space-y-2">
              <div className="skeleton h-8 w-48 rounded" />
              <div className="skeleton h-4 w-72 rounded" />
            </div>
          ) : destination ? (
            <>
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <MapPin className="w-4 h-4" />
                {destination.state}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
                {destination.name}
              </h1>
              <p className="text-white/80 text-base max-w-xl line-clamp-2">
                {destination.tagline}
              </p>
            </>
          ) : (
            <h1 className="text-3xl font-extrabold text-white">Destination</h1>
          )}
        </div>
      </div>

      {/* Search widget */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 mb-8">
        <BookingWidget
          defaultDestination={slug}
          compact
          onSearch={params => {
            const url = `/location/${params.destination || slug}?checkIn=${params.checkIn}&checkOut=${params.checkOut}&guests=${params.guests}`;
            window.location.href = url;
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {/* ── Hackathon Demo Controls ─────────────────────────────────────── */}
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-amber-600 text-sm font-bold">🔧 B02/B03 Bug Fix Demo</span>
            <span className="text-xs text-amber-500">— click a mode to see the correct state handling</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-2">
            {/* Normal */}
            <button
              onClick={() => handleSimulate('normal')}
              className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg font-semibold border-2 transition-all ${
                simMode === 'normal'
                  ? 'bg-green-500 border-green-500 text-white shadow-sm'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current" />
              Normal Load
            </button>

            {/* Simulate error */}
            <button
              onClick={() => handleSimulate('error')}
              className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg font-semibold border-2 transition-all ${
                simMode === 'error'
                  ? 'bg-red-500 border-red-500 text-white shadow-sm'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-red-400 hover:text-red-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current" />
              API Error (500) → shows error state
            </button>

            {/* Simulate empty */}
            <button
              onClick={() => handleSimulate('empty')}
              className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg font-semibold border-2 transition-all ${
                simMode === 'empty'
                  ? 'bg-blue-500 border-blue-500 text-white shadow-sm'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current" />
              Empty Inventory → shows empty state
            </button>
          </div>

          <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-100 rounded-lg px-3 py-2">
            <span className="font-bold mt-0.5">ℹ</span>
            <div>
              {simMode === 'normal'  && <span><strong>Normal mode:</strong> Properties load successfully. This is the default behaviour.</span>}
              {simMode === 'error'   && <span><strong>B02 Fix:</strong> API 500 → "Something went wrong" + Retry button — NOT "No properties found" (old broken behaviour).</span>}
              {simMode === 'empty'   && <span><strong>B02 Fix:</strong> Empty inventory → "No hostels available" with Change Dates CTA — distinct from an API error.</span>}
            </div>
          </div>
        </div>

        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {propsState.status === 'success'
                ? `${propsState.data?.length} hostel${(propsState.data?.length ?? 0) !== 1 ? 's' : ''} found`
                : propsState.status === 'loading'
                  ? 'Loading hostels…'
                  : 'Available Hostels'}
            </h2>
            {destination && (
              <p className="text-sm text-gray-500 mt-0.5">{destination.description.slice(0, 100)}…</p>
            )}
          </div>
          <button className="hidden sm:flex items-center gap-2 btn-ghost text-sm">
            <SlidersHorizontal className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Properties list */}
        <ApiStateRenderer
          state={propsState}
          onRetry={() => slug && runLoad(slug, simModeRef.current)}
          emptyTitle="No hostels available for these dates"
          emptyMessage="Try adjusting your check-in/check-out dates or explore a different destination."
          emptyAction={
            <div className="flex gap-3">
              <button
                onClick={() => handleSimulate('normal')}
                className="btn-primary flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Load Normal Results
              </button>
              <Link to="/" className="btn-secondary">
                Change Search
              </Link>
            </div>
          }
          loadingComponent={<SkeletonCards count={3} />}
        >
          {(props) => (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {props.map(p => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </ApiStateRenderer>
      </div>
    </div>
  );
}
