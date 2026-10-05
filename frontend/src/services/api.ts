/// <reference types="vite/client" />
/**
 * api.ts — HostelBird Build & Break Frontend API Service
 *
 * In development:  requests go to /api/* (proxied by Vite to localhost:4000)
 * In production:   requests go to VITE_API_URL/api/* (Render backend)
 */

import type { Destination, Property, Room, Booking, BookingDates, GuestCount } from '../types';
import type { ApiState } from '../types';
import {
  loadingState,
  successState,
  emptyState,
  errorState,
  notFoundState,
  maintenanceState,
} from '../utils/apiState';

// In dev: '' so Vite proxy handles /api/*
// In prod: full Render URL e.g. https://hostelbird-api.onrender.com
const API_ORIGIN = import.meta.env.VITE_API_URL ?? '';
const BASE_URL   = `${API_ORIGIN}/api`;

const TIMEOUT_MS = 10000;

// ── Fetch with timeout ────────────────────────────────────────────────────

async function fetchWithTimeout(url: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// ── Generic API call wrapper ──────────────────────────────────────────────

async function apiCall<T>(url: string, options?: RequestInit): Promise<ApiState<T>> {
  try {
    const res = await fetchWithTimeout(url, options);

    if (res.status === 404) return notFoundState<T>();
    if (res.status === 503) return maintenanceState<T>();
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      return errorState<T>(errBody?.message ?? `Server error (${res.status})`);
    }

    const json = await res.json();
    const data: T = json.data ?? json;

    if (Array.isArray(data) && data.length === 0) return emptyState<T>();
    return successState(data);

  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return errorState<T>('Request timed out. Please check your connection.');
    }
    return errorState<T>('Unable to connect. Please try again.');
  }
}

// ── Destinations ──────────────────────────────────────────────────────────

export async function fetchDestinations(): Promise<ApiState<Destination[]>> {
  return apiCall<Destination[]>(`${BASE_URL}/destinations`);
}

export async function fetchDestinationBySlug(slug: string): Promise<ApiState<Destination>> {
  return apiCall<Destination>(`${BASE_URL}/destinations/${slug}`);
}

// ── Properties ────────────────────────────────────────────────────────────

export async function fetchProperties(params?: {
  destinationSlug?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}): Promise<ApiState<Property[]>> {
  const query = new URLSearchParams();
  if (params?.destinationSlug) query.set('destination', params.destinationSlug);
  if (params?.checkIn)  query.set('checkIn',  params.checkIn);
  if (params?.checkOut) query.set('checkOut', params.checkOut);
  if (params?.guests)   query.set('guests',   String(params.guests));

  const qs = query.toString() ? `?${query.toString()}` : '';
  return apiCall<Property[]>(`${BASE_URL}/properties${qs}`);
}

export async function fetchPropertyById(id: string): Promise<ApiState<Property>> {
  return apiCall<Property>(`${BASE_URL}/properties/${id}`);
}

export async function fetchPropertyBySlug(slug: string): Promise<ApiState<Property>> {
  return apiCall<Property>(`${BASE_URL}/properties/slug/${slug}`);
}

// ── Rooms ─────────────────────────────────────────────────────────────────

export async function fetchRooms(propertyId: string): Promise<ApiState<Room[]>> {
  return apiCall<Room[]>(`${BASE_URL}/properties/${propertyId}/rooms`);
}

// ── Bookings ──────────────────────────────────────────────────────────────

export interface BookingPayload {
  propertyId: string;
  roomId: string;
  dates: BookingDates;
  guests: GuestCount;
  birdCoinsApplied: number;
}

export async function validateBooking(
  payload: BookingPayload
): Promise<ApiState<{ valid: boolean; message?: string }>> {
  return apiCall(`${BASE_URL}/bookings/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function createBooking(payload: BookingPayload): Promise<ApiState<Booking>> {
  return apiCall<Booking>(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
