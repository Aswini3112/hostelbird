/**
 * apiState.ts — HostelBird Build & Break
 *
 * State machine helpers for API-driven components.
 * Bug B02/B05 Fix: replaces single generic error message with proper state model.
 */

import type { ApiState, ApiStatus } from '../types';

export function loadingState<T>(): ApiState<T> {
  return { status: 'loading' };
}

export function successState<T>(data: T): ApiState<T> {
  return { status: 'success', data };
}

export function emptyState<T>(): ApiState<T> {
  return { status: 'empty' };
}

export function errorState<T>(message?: string): ApiState<T> {
  return { status: 'error', error: message ?? 'An unexpected error occurred.' };
}

export function notFoundState<T>(): ApiState<T> {
  return { status: 'notFound' };
}

export function maintenanceState<T>(): ApiState<T> {
  return { status: 'maintenance' };
}

/**
 * Maps an HTTP status code to the appropriate ApiStatus.
 * B02 Fix: different HTTP errors map to different UI states.
 */
export function httpStatusToApiStatus(httpStatus: number): ApiStatus {
  if (httpStatus === 404) return 'notFound';
  if (httpStatus === 503) return 'maintenance';
  if (httpStatus >= 500) return 'error';
  if (httpStatus >= 400) return 'error';
  return 'error';
}

/**
 * Creates an ApiState from a fetch response + optional data.
 */
export function fromHttpResponse<T>(
  status: number,
  data?: T
): ApiState<T> {
  if (status >= 200 && status < 300) {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return emptyState<T>();
    }
    return successState(data);
  }
  return { status: httpStatusToApiStatus(status) };
}
