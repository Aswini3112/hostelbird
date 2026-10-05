import { Bird, Instagram, Twitter, Facebook, Youtube, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const footerLinks = {
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Press', href: '#' },
  ],
  Explore: [
    { label: 'Destinations', href: '#destinations' },
    { label: 'Featured Hostels', href: '#' },
    { label: 'Last Minute Deals', href: '#' },
    { label: 'Group Bookings', href: '#' },
  ],
  Support: [
    { label: 'Help Centre', href: '#' },
    { label: 'Cancellation Policy', href: '#' },
    { label: 'Safety Standards', href: '#' },
    { label: 'Contact Us', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <Bird className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Hostel<span className="text-brand-400">bird</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Discover affordable hostels across India. Adventure, community, and unforgettable journeys await.
            </p>
            <div className="flex gap-3">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 bg-gray-800 hover:bg-brand-600 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="Social link"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white font-semibold text-sm mb-3">{title}</h3>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Hackathon notice */}
        <div className="border-t border-gray-800 pt-6 mt-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              © 2026 HostelBird. This is a hackathon demonstration prototype — not a production deployment.
            </p>
            <Link
              to="/debug"
              className="flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              Build & Break Fix Lab →
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
