import { Link } from 'react-router-dom';
import { Star, Users, Shield, ArrowRight, Coins, Quote } from 'lucide-react';
import BookingWidget from '../components/booking/BookingWidget';
import DestinationCard from '../components/destination/DestinationCard';
import PropertyCard from '../components/property/PropertyCard';
import { destinations } from '../data/destinations';
import { properties } from '../data/properties';

const testimonials = [
  {
    name: 'Arjun M.',
    location: 'Bangalore',
    rating: 5,
    text: 'Booked SkyNest in Bir through HostelBird — best hostel experience of my life. Paragliding at sunrise, momo breakfasts, and met friends I still keep in touch with.',
    avatar: 'https://i.pravatar.cc/48?img=11',
  },
  {
    name: 'Priya S.',
    location: 'Mumbai',
    rating: 5,
    text: 'The BirdCoins system is genius — I saved ₹400 on my Goa booking just from coins I earned in Rishikesh. Super clean UI, never had any booking issues.',
    avatar: 'https://i.pravatar.cc/48?img=45',
  },
  {
    name: 'Rahul K.',
    location: 'Delhi',
    rating: 5,
    text: 'Loved how the app shows real availability. Booked last-minute for Manali and got a dorm bed the same night. Responsive support too.',
    avatar: 'https://i.pravatar.cc/48?img=32',
  },
];

export default function HomePage() {
  const featuredDestinations = destinations.filter(d => d.available).slice(0, 6);
  const featuredProperties = properties.filter(p => p.featured).slice(0, 3);

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Gradient background that always works, with image layered on top */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-brand-900 to-gray-800">
          <img
            src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=1920&q=80"
            alt="Backpackers at a scenic mountain destination"
            className="w-full h-full object-cover opacity-60"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            India's fastest-growing hostel community
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
            Find Your Next{' '}
            <span className="text-brand-400">Adventure</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Discover affordable hostels across India. From Himalayan peaks to Goa beaches — book in minutes, travel like a local.
          </p>

          {/* Booking Widget */}
          <div className="max-w-3xl mx-auto">
            <BookingWidget />
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-white/80 text-sm">
            {[
              { icon: Shield, label: '100% verified hostels' },
              { icon: Users, label: '50,000+ happy travellers' },
              { icon: Star, label: '4.8 avg rating' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-brand-400" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Destinations ──────────────────────────────────────────── */}
      <section id="destinations" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="section-heading">Popular Destinations</h2>
            <p className="section-subheading">Handpicked stays across India's best backpacker destinations</p>
          </div>
          <Link to="/location/bir" className="hidden md:flex items-center gap-1.5 text-brand-600 font-semibold text-sm hover:gap-2.5 transition-all">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredDestinations.map(dest => (
            <DestinationCard key={dest.id} destination={dest} />
          ))}
        </div>
      </section>

      {/* ── Featured Properties ───────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gray-50 rounded-3xl">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="section-heading">Top Rated Hostels</h2>
            <p className="section-subheading">Community-verified stays with the highest ratings</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProperties.map(prop => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      </section>

      {/* ── BirdCoins ─────────────────────────────────────────────────────── */}
      <section id="community" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-8 md:p-12 text-white">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Coins className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl font-extrabold">BirdCoins</h2>
            </div>
            <p className="text-white/90 text-lg mb-6 leading-relaxed">
              Every booking earns you BirdCoins. Spend them on your next stay. The more you travel, the more you save.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Earn', value: '1 coin per ₹10', desc: 'on every booking' },
                { label: 'Value', value: '100 coins', desc: '= ₹10 discount' },
                { label: 'Max Use', value: 'Up to 10%', desc: 'per booking' },
              ].map(item => (
                <div key={item.label} className="bg-white/15 rounded-xl p-3 text-center">
                  <div className="text-xs text-white/70 mb-1">{item.label}</div>
                  <div className="font-bold text-sm">{item.value}</div>
                  <div className="text-xs text-white/70">{item.desc}</div>
                </div>
              ))}
            </div>
            <button className="bg-white text-orange-500 font-bold px-6 py-3 rounded-xl hover:bg-orange-50 transition-colors">
              Start Earning BirdCoins →
            </button>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="section-heading">Travellers Love HostelBird</h2>
          <p className="section-subheading">Real reviews from real backpackers</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="card p-6">
              <Quote className="w-8 h-8 text-brand-200 mb-3" />
              <p className="text-gray-700 text-sm leading-relaxed mb-4">{t.text}</p>
              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover bg-brand-100" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-gray-400 text-xs">{t.location}</div>
                </div>
                <div className="ml-auto flex">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
