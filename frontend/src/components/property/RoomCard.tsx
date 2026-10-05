/**
 * RoomCard — HostelBird Build & Break
 *
 * B04 Fix: Room selection immediately updates booking summary.
 * Sold-out rooms cannot be selected.
 */

import { Users, ShieldCheck, Tag, CheckCircle2 } from 'lucide-react';
import type { Room } from '../../types';
import { formatINR } from '../../utils/bookingUtils';

interface RoomCardProps {
  room: Room;
  isSelected: boolean;
  onSelect: (room: Room) => void;
}

const ROOM_TYPE_LABELS: Record<Room['type'], string> = {
  dorm: 'Mixed Dorm',
  'female-dorm': 'Female-Only Dorm',
  private: 'Private Room',
  'mixed-dorm': 'Mixed Dorm',
};

const CANCELLATION_LABELS: Record<Room['cancellationPolicy'], { label: string; color: string }> = {
  free: { label: 'Free Cancellation', color: 'text-green-600' },
  partial: { label: 'Partial Refund', color: 'text-amber-600' },
  'non-refundable': { label: 'Non-Refundable', color: 'text-red-500' },
};

export default function RoomCard({ room, isSelected, onSelect }: RoomCardProps) {
  const isSoldOut = room.availableBeds === 0;
  const cancellation = CANCELLATION_LABELS[room.cancellationPolicy];

  return (
    <div
      className={`
        relative border-2 rounded-2xl p-5 transition-all duration-200 cursor-pointer
        ${isSoldOut
          ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
          : isSelected
            ? 'border-brand-500 bg-brand-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-brand-300 hover:shadow-card'
        }
      `}
      onClick={() => !isSoldOut && onSelect(room)}
      role="radio"
      aria-checked={isSelected}
      aria-disabled={isSoldOut}
      tabIndex={isSoldOut ? -1 : 0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!isSoldOut) onSelect(room);
        }
      }}
    >
      {/* Selected badge */}
      {isSelected && (
        <div className="absolute top-4 right-4 flex items-center gap-1 text-brand-600 text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 fill-brand-500 text-white" />
          Selected
        </div>
      )}

      {/* Sold out badge */}
      {isSoldOut && (
        <div className="absolute top-4 right-4 badge badge-red">
          Sold Out
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Left info */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-900 text-base">{room.name}</h3>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {ROOM_TYPE_LABELS[room.type]}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-2">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              Capacity: {room.capacity}
            </span>
            {!isSoldOut && (
              <span className="text-brand-600 font-medium">
                {room.availableBeds} bed{room.availableBeds !== 1 ? 's' : ''} left
              </span>
            )}
          </div>

          <div className={`flex items-center gap-1.5 text-xs font-medium ${cancellation.color}`}>
            <ShieldCheck className="w-4 h-4" />
            {cancellation.label}
          </div>
        </div>

        {/* Right — price */}
        <div className="sm:text-right">
          <div className="flex sm:flex-col items-baseline sm:items-end gap-2">
            <div className="text-2xl font-bold text-gray-900">
              {formatINR(room.price)}
            </div>
            {room.discount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-400 line-through">
                  {formatINR(room.originalPrice)}
                </span>
                <span className="badge badge-orange flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {room.discount}% off
                </span>
              </div>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">per bed / night</div>

          {!isSoldOut && (
            <button
              className={`mt-3 w-full sm:w-auto px-5 py-2 rounded-xl text-sm font-semibold transition-all
                ${isSelected
                  ? 'bg-brand-500 text-white'
                  : 'bg-white border-2 border-brand-500 text-brand-600 hover:bg-brand-50'
                }`}
              onClick={e => { e.stopPropagation(); onSelect(room); }}
              aria-label={isSelected ? `${room.name} selected` : `Select ${room.name}`}
            >
              {isSelected ? '✓ Selected' : 'Select Room'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
