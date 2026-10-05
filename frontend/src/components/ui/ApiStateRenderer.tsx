/**
 * ApiStateRenderer — HostelBird Build & Break
 *
 * B02 / B05 Fix: Renders the correct UI for each API state.
 * Never shows "No properties found" for a server error.
 */

import { AlertCircle, RefreshCw, MapPin, Wrench, Search } from 'lucide-react';
import type { ApiState } from '../../types';

interface ApiStateRendererProps<T> {
  state: ApiState<T>;
  children: (data: T) => React.ReactNode;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

// ── Skeleton Card ─────────────────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="flex justify-between items-center pt-1">
          <div className="skeleton h-6 w-24 rounded" />
          <div className="skeleton h-9 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// ── Error State ───────────────────────────────────────────────────────────
function ErrorCard({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Something went wrong
      </h3>
      <p className="text-gray-500 text-sm mb-6 max-w-sm">
        {message ?? 'We had trouble loading this page. Please try again.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 btn-primary"
          aria-label="Retry loading"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────
function EmptyCard({
  title,
  message,
  action,
}: {
  title?: string;
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-brand-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title ?? 'No hostels available'}
      </h3>
      <p className="text-gray-500 text-sm mb-6 max-w-sm">
        {message ?? 'No hostels are currently available for your selected dates. Try changing your dates or explore other destinations.'}
      </p>
      {action}
    </div>
  );
}

// ── Not Found State ───────────────────────────────────────────────────────
function NotFoundCard() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
        <MapPin className="w-8 h-8 text-amber-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Destination not found
      </h3>
      <p className="text-gray-500 text-sm mb-6 max-w-sm">
        We couldn't find this destination. It may have been removed or the URL might be incorrect.
      </p>
      <a href="/" className="btn-primary">
        Browse All Destinations
      </a>
    </div>
  );
}

// ── Maintenance State ─────────────────────────────────────────────────────
function MaintenanceCard() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
        <Wrench className="w-8 h-8 text-orange-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Temporarily unavailable
      </h3>
      <p className="text-gray-500 text-sm max-w-sm">
        This destination is temporarily unavailable for booking. We're working on it — please check back soon.
      </p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
export default function ApiStateRenderer<T>({
  state,
  children,
  onRetry,
  emptyTitle,
  emptyMessage,
  emptyAction,
  loadingComponent,
}: ApiStateRendererProps<T>) {
  switch (state.status) {
    case 'idle':
    case 'loading':
      return <>{loadingComponent ?? <SkeletonCards />}</>;

    case 'error':
      return <ErrorCard message={state.error} onRetry={onRetry} />;

    case 'empty':
      return (
        <EmptyCard
          title={emptyTitle}
          message={emptyMessage}
          action={emptyAction}
        />
      );

    case 'notFound':
      return <NotFoundCard />;

    case 'maintenance':
      return <MaintenanceCard />;

    case 'success':
      if (state.data === undefined) return <ErrorCard onRetry={onRetry} />;
      return <>{children(state.data)}</>;

    default:
      return <ErrorCard onRetry={onRetry} />;
  }
}
