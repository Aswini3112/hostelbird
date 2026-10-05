import { Link } from 'react-router-dom';
import { Star, MapPin, Coins, Tag, Wifi, Coffee } from 'lucide-react';
import type { Property } from '../../types';
import { formatINR } from '../../utils/bookingUtils';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const lowestRoom = property.rooms
    .filter(r => r.availableBeds > 0)
    .sort((a, b) => a.price - b.price)[0];

  const hasDiscount = lowestRoom && lowestRoom.discount > 0;

  return (
    <Link
      to={`/property/${property.slug}`}
      className="card group block"
      aria-label={`View ${property.name}`}
    >
      {/* Gallery */}
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-brand-600 to-gray-700">
        <img
          src={property.images[0]}
          alt={property.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-accent-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {lowestRoom.discount}% OFF
          </div>
        )}

        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span className="text-sm font-bold text-gray-900">{property.rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-2">
            {property.name}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="line-clamp-1">{property.address}</span>
        </div>

        <p className="text-gray-500 text-sm line-clamp-2 mb-3">
          {property.shortDescription}
        </p>

        {/* Amenities */}
        <div className="flex items-center gap-2 mb-3">
          {property.amenities.slice(0, 3).map(a => (
            <span
              key={a.id}
              className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full flex items-center gap-1"
            >
              {a.id === 'wifi' && <Wifi className="w-3 h-3" />}
              {a.id === 'breakfast' && <Coffee className="w-3 h-3" />}
              {a.name}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div>
            {lowestRoom ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold text-gray-900">
                    {formatINR(lowestRoom.price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatINR(lowestRoom.originalPrice)}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">per bed / night</span>
              </>
            ) : (
              <span className="text-sm text-red-500 font-medium">Sold out</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-amber-600 text-xs font-medium bg-amber-50 px-2.5 py-1.5 rounded-lg">
            <Coins className="w-3.5 h-3.5" />
            +{property.birdCoinsEarn} coins
          </div>
        </div>

        <div className="text-xs text-gray-400 mt-1">
          {property.reviewCount.toLocaleString('en-IN')} reviews
        </div>
      </div>
    </Link>
  );
}
