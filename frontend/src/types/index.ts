// ============================================================
// HostelBird Build & Break — Shared Type Definitions
// ============================================================

// ----- API State Machine -----
export type ApiStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'empty'
  | 'error'
  | 'notFound'
  | 'maintenance';

export interface ApiState<T> {
  status: ApiStatus;
  data?: T;
  error?: string;
}

// ----- Destination -----
export interface Destination {
  id: string;
  name: string;
  slug: string;
  description: string;
  tagline: string;
  image: string;
  heroImage: string;
  available: boolean;
  propertyCount: number;
  startingFrom: number;
  tags: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  state: string;
}

// ----- Amenity -----
export interface Amenity {
  id: string;
  name: string;
  icon: string;
}

// ----- Room -----
export interface Room {
  id: string;
  propertyId: string;
  name: string;
  type: 'dorm' | 'private' | 'mixed-dorm' | 'female-dorm';
  capacity: number;
  availableBeds: number;
  price: number;          // per night per bed/room in INR
  originalPrice: number;  // before discount
  discount: number;       // percentage 0–100
  cancellationPolicy: 'free' | 'partial' | 'non-refundable';
  amenities: string[];
  images: string[];
}

// ----- Property -----
export interface Property {
  id: string;
  destinationId: string;
  destinationSlug: string;
  name: string;
  slug: string;
  rating: number;
  reviewCount: number;
  address: string;
  images: string[];
  amenities: Amenity[];
  description: string;
  shortDescription: string;
  rooms: Room[];
  policies: {
    checkIn: string;
    checkOut: string;
    ageRestriction: string;
    smokingPolicy: string;
    petPolicy: string;
    cancellation: string;
  };
  birdCoinsEarn: number;  // coins earned per stay
  featured: boolean;
}

// ----- Booking -----
export interface BookingDates {
  checkIn: string;   // YYYY-MM-DD
  checkOut: string;  // YYYY-MM-DD
}

export interface GuestCount {
  adults: number;
  children: number;
}

export interface BookingTotal {
  nights: number;
  basePrice: number;
  subtotal: number;
  taxes: number;
  discount: number;
  birdCoinsDiscount: number;
  birdCoinsEarned: number;
  total: number;
}

export interface Booking {
  id: string;
  propertyId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: GuestCount;
  basePrice: number;
  taxes: number;
  discount: number;
  birdCoins: number;
  total: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

// ----- Search -----
export interface SearchParams {
  destination?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

// ----- BirdCoins -----
export interface BirdCoinsState {
  available: number;          // user's available coins
  applied: number;            // coins being applied to this booking
  valuePerCoin: number;       // INR value per coin (0.10 = 10 paise)
  maxApplicable: number;      // max coins applicable to this booking
}

// ----- Bug Demo (Debug Center) -----
export type BugSeverity = 'P0' | 'P1' | 'P2' | 'P3';
export type BugStatus = 'open' | 'in-progress' | 'fixed' | 'wontfix';

export interface BugDemo {
  id: string;
  title: string;
  severity: BugSeverity;
  status: BugStatus;
  shortDescription: string;
  before: {
    description: string;
    codeSnippet?: string;
  };
  after: {
    description: string;
    codeSnippet?: string;
  };
  fix: string;
}
