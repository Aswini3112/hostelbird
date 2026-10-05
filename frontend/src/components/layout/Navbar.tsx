import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Bird, Coins, Wrench } from 'lucide-react';

const navLinks = [
  { label: 'Destinations', href: '/location/bir' },
  { label: 'Explore', href: '/#destinations' },
  { label: 'Community', href: '/#community' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isDebug = location.pathname === '/debug';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Bird className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Hostel<span className="text-brand-500">bird</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/debug"
              className={`ml-2 flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isDebug
                  ? 'bg-brand-100 text-brand-700'
                  : 'text-amber-600 hover:bg-amber-50'
              }`}
            >
              <Wrench className="w-4 h-4" />
              Fix Lab
            </Link>
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-amber-600 font-medium bg-amber-50 px-3 py-1.5 rounded-full">
              <Coins className="w-4 h-4" />
              1,500 BirdCoins
            </div>
            <button className="btn-secondary text-sm py-2 px-4">
              Log In
            </button>
            <button className="btn-primary text-sm py-2 px-4">
              Sign Up
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 pt-2">
          <nav className="flex flex-col gap-1">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/debug"
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-amber-600 hover:bg-amber-50 rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              <Wrench className="w-4 h-4" />
              Fix Lab
            </Link>
            <div className="border-t border-gray-100 mt-2 pt-2 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-sm text-amber-600 font-medium px-4 py-2">
                <Coins className="w-4 h-4" />
                1,500 BirdCoins
              </div>
              <button className="btn-secondary text-sm py-2">Log In</button>
              <button className="btn-primary text-sm py-2">Sign Up</button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
