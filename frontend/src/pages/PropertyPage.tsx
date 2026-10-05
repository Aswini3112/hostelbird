/**
 * PropertyPage — HostelBird Build & Break
 *
 * B04 Fix: Room selection immediately updates booking summary.
 * B03 Fix: Property accessible regardless of destination page state.
 */

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  Star, MapPin, ArrowLeft, Wifi, Coffee, Lock,
  Waves, ChevronLeft, ChevronRight, Shield,
} from 'lucide-react';
import RoomCard from '../components/property/RoomCard';
import BookingSummary from '../components/booking/BookingSummary';
import ApiStateRenderer, { SkeletonCard } from '../components/ui/ApiStateRenderer';
import type { Property, Room } from '../types';
import type { ApiState } from '../types';
import { loadingState, successState, notFoundState } from '../utils/apiState';
import { properties } from '../data/properties';
import { getDefaultBookingDates } from '../utils/dateUtils';

const AMENITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  breakfast: Coffee,
  pool: Waves,
  locker: Lock,
};

async function loadProperty(slug: string): Promise<ApiState<Property>> {
  await new Promise(r => setTimeout(r, 500));
  const found = properties.find(p => p.slug === slug);
  if (!found) return notFoundState<Property>();
  return successState(found);
}

export default function PropertyPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const defaults = getDefaultBookingDates();

  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') ?? defaults.checkIn);
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') ?? defaults.checkOut);
  const [guests, setGuests] = useState(Number(searchParams.get('guests') ?? 2));

  const [propState, setPropState] = useState<ApiState<Property>>(loadingState());
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setPropState(loadingState());
    setSelectedRoom(null);
    loadProperty(slug).then(setPropState);
  }, [slug]);

  const property = propState.status === 'success' ? propState.data : null;
  const images = property?.images ?? [];

  const prevImage = () => setGalleryIndex(i => (i === 0 ? images.length - 1 : i - 1));
  const nextImage = () => setGalleryIndex(i => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="min-h-screen bg-gray-50">
      <ApiStateRenderer
        state={propState}
        onRetry={() => slug && loadProperty(slug).then(setPropState)}
        loadingComponent={
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="skeleton h-80 w-full rounded-2xl mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="skeleton h-8 w-64 rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-3/4 rounded" />
                {[1, 2].map(i => <SkeletonCard key={i} />)}
              </div>
              <div className="skeleton h-96 rounded-2xl" />
            </div>
          </div>
        }
      >
        {(prop) => (
          <div>
            {/* Gallery */}
            <div className="relative h-72 md:h-96 bg-gradient-to-br from-brand-700 via-brand-800 to-gray-900 overflow-hidden">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[galleryIndex]}
                    alt={`${prop.name} - photo ${galleryIndex + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
                        aria-label="Previous photo"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
                        aria-label="Next photo"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setGalleryIndex(i)}
                            className={`w-2 h-2 rounded-full transition-all ${i === galleryIndex ? 'bg-white w-4' : 'bg-white/50'}`}
                            aria-label={`Photo ${i + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                  No images available
                </div>
              )}
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Breadcrumb */}
              <Link
                to={`/location/${prop.destinationSlug}`}
                className="flex items-center gap-1.5 text-brand-600 text-sm hover:text-brand-700 mb-4 w-fit"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to {prop.destinationSlug.charAt(0).toUpperCase() + prop.destinationSlug.slice(1)}
              </Link>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Property details */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Title */}
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                        {prop.name}
                      </h1>
                      <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-gray-900">{prop.rating}</span>
                        <span className="text-gray-500 text-sm">
                          ({prop.reviewCount.toLocaleString('en-IN')} reviews)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                      <MapPin className="w-4 h-4" />
                      {prop.address}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg mb-2">About this hostel</h2>
                    <p className="text-gray-600 leading-relaxed">{prop.description}</p>
                  </div>

                  {/* Amenities */}
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg mb-3">Amenities</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {prop.amenities.map(amenity => {
                        const Icon = AMENITY_ICONS[amenity.id];
                        return (
                          <div key={amenity.id} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2.5">
                            {Icon ? <Icon className="w-4 h-4 text-brand-500" /> : <div className="w-4 h-4" />}
                            {amenity.name}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rooms — B04 Fix */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-bold text-gray-900 text-lg">Available Rooms</h2>
                      {/* B04 Demo notice */}
                      <div className="text-xs text-brand-600 bg-brand-50 px-3 py-1.5 rounded-lg">
                        B04 Fix: selecting a room updates the summary →
                      </div>
                    </div>

                    <div className="space-y-3">
                      {prop.rooms.map(room => (
                        <RoomCard
                          key={room.id}
                          room={room}
                          isSelected={selectedRoom?.id === room.id}
                          onSelect={setSelectedRoom}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Policies */}
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg mb-3">House Policies</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(prop.policies).map(([key, value]) => (
                        <div key={key} className="flex items-start gap-2.5 bg-gray-50 rounded-xl px-4 py-3">
                          <Shield className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-xs text-gray-400 capitalize mb-0.5">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                            <div className="text-sm text-gray-700">{value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Booking summary */}
                <div className="lg:col-span-1">
                  <BookingSummary
                    propertySlug={prop.slug}
                    selectedRoom={selectedRoom}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    guests={guests}
                    onGuestsChange={setGuests}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </ApiStateRenderer>
    </div>
  );
}
