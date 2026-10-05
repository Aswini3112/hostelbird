import { Link } from 'react-router-dom';
import { Bird, Home, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Bird className="w-10 h-10 text-brand-400" />
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-bold text-gray-700 mb-3">Page not found</h2>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary flex items-center gap-2 justify-center">
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link to="/location/bir" className="btn-secondary flex items-center gap-2 justify-center">
            <Search className="w-4 h-4" />
            Browse Destinations
          </Link>
        </div>
      </div>
    </div>
  );
}
