/**
 * mockData.ts — HostelBird Build & Break Backend Mock Data
 *
 * Independent mock data — not sourced from Hostelbird's private API.
 * Mirrors the frontend data for consistency.
 */

export const mockDestinations = [
  {
    id: 'dest-001', name: 'Bir Billing', slug: 'bir',
    description: 'Paragliding capital of India in the Kangra Valley.',
    tagline: 'Paragliding Capital of India',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80',
    available: true, propertyCount: 4, startingFrom: 499,
    tags: ['paragliding', 'mountains', 'adventure'],
    state: 'Himachal Pradesh',
  },
  {
    id: 'dest-002', name: 'Goa', slug: 'goa',
    description: 'Sun-drenched beaches, vibrant nightlife, colonial heritage.',
    tagline: 'Sun, Sand & Soulful Vibes',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1587922722782-f01b4bda51f7?w=1600&q=80',
    available: true, propertyCount: 7, startingFrom: 599,
    tags: ['beach', 'party', 'heritage'],
    state: 'Goa',
  },
  {
    id: 'dest-003', name: 'Rishikesh', slug: 'rishikesh',
    description: 'Yoga Capital of the World at the Himalayan foothills.',
    tagline: 'Yoga Capital of the World',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1616772763074-fd5e8f099b5a?w=1600&q=80',
    available: true, propertyCount: 5, startingFrom: 449,
    tags: ['yoga', 'rafting', 'spiritual'],
    state: 'Uttarakhand',
  },
  {
    id: 'dest-004', name: 'Manali', slug: 'manali',
    description: 'Gateway to the Himalayas in the Kullu Valley.',
    tagline: 'Gateway to the Himalayas',
    image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1542484480-2cf8bebb1c53?w=1600&q=80',
    available: true, propertyCount: 6, startingFrom: 549,
    tags: ['snow', 'trekking', 'mountains'],
    state: 'Himachal Pradesh',
  },
  {
    id: 'dest-005', name: 'Udaipur', slug: 'udaipur',
    description: 'City of Lakes with shimmering palace reflections.',
    tagline: 'City of Lakes & Palaces',
    image: 'https://images.unsplash.com/photo-1589395937772-f67057e233c2?w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1600&q=80',
    available: true, propertyCount: 4, startingFrom: 699,
    tags: ['palaces', 'lakes', 'heritage'],
    state: 'Rajasthan',
  },
];

export const mockProperties = [
  {
    id: 'prop-001', destinationId: 'dest-001', destinationSlug: 'bir',
    name: 'SkyNest Bir', slug: 'skynest-bir',
    rating: 4.7, reviewCount: 312,
    address: 'Chowgan Ground Road, Bir, HP 176077',
    shortDescription: 'Perched above Bir village with panoramic valley views.',
    images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80'],
    birdCoinsEarn: 150, featured: true,
  },
  {
    id: 'prop-002', destinationId: 'dest-002', destinationSlug: 'goa',
    name: 'Barefoot Goa Hostel', slug: 'barefoot-goa',
    rating: 4.5, reviewCount: 548,
    address: 'Anjuna Beach Road, North Goa 403509',
    shortDescription: '100m from the beach. Hammocks, bonfires, and sunset chai.',
    images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80'],
    birdCoinsEarn: 200, featured: true,
  },
];

export const mockRooms = [
  {
    id: 'room-001a', propertyId: 'prop-001', name: '6-Bed Mixed Dorm',
    type: 'dorm', capacity: 6, availableBeds: 4,
    price: 699, originalPrice: 899, discount: 22,
    cancellationPolicy: 'free',
  },
  {
    id: 'room-001b', propertyId: 'prop-001', name: 'Private Double Room',
    type: 'private', capacity: 2, availableBeds: 1,
    price: 1899, originalPrice: 2299, discount: 17,
    cancellationPolicy: 'partial',
  },
];
