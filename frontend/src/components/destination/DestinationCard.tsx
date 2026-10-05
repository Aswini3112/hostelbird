import { Link } from 'react-router-dom';
import { MapPin, Star, ArrowRight } from 'lucide-react';
import type { Destination } from '../../types';
import { formatINR } from '../../utils/bookingUtils';

interface DestinationCardProps {
  destination: Destination;
}

export default function DestinationCard({ destination }: DestinationCardProps) {
  return (
    <Link
      to={`/location/${destination.slug}`}
      className="card group block"
      aria-label={`Explore ${destination.name}`}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800">
        <img
          src={destination.image}
          alt={destination.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Availability */}
        {!destination.available && (
          <div className="absolute top-3 left-3 badge badge-gray">
            Coming Soon
          </div>
        )}

        {/* Bottom text overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-1.5 text-white/80 text-xs mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{destination.state}</span>
          </div>
          <h3 className="text-white font-bold text-lg leading-tight">
            {destination.name}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-gray-500 text-sm line-clamp-2 mb-3">
          {destination.tagline}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {destination.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            {destination.available ? (
              <>
                <span className="text-xs text-gray-400">Starting from</span>
                <div className="text-brand-600 font-bold text-base">
                  {formatINR(destination.startingFrom)}
                  <span className="text-xs font-normal text-gray-400 ml-1">/ night</span>
                </div>
              </>
            ) : (
              <span className="text-sm text-gray-400">Not yet available</span>
            )}
          </div>
          {destination.available && (
            <div className="flex items-center gap-1 text-brand-600 font-semibold text-sm group-hover:gap-2 transition-all">
              Explore
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
