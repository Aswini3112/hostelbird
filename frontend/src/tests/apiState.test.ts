/**
 * apiState.test.ts — Bug B02/B05 API State Machine Tests
 *
 * Tests that the state machine correctly distinguishes
 * API errors from empty states.
 */

import { describe, it, expect } from 'vitest';
import {
  loadingState,
  successState,
  emptyState,
  errorState,
  notFoundState,
  maintenanceState,
  httpStatusToApiStatus,
  fromHttpResponse,
} from '../utils/apiState';

// ── State factories ───────────────────────────────────────────────────────

describe('state factory functions', () => {
  it('loadingState returns loading status', () => {
    expect(loadingState().status).toBe('loading');
  });

  it('successState returns success with data', () => {
    const state = successState([1, 2, 3]);
    expect(state.status).toBe('success');
    expect(state.data).toEqual([1, 2, 3]);
  });

  it('emptyState returns empty status (no data)', () => {
    const state = emptyState();
    expect(state.status).toBe('empty');
    expect(state.data).toBeUndefined();
  });

  it('errorState returns error with message', () => {
    const state = errorState('Network failure');
    expect(state.status).toBe('error');
    expect(state.error).toBe('Network failure');
  });

  it('errorState without message uses default', () => {
    const state = errorState();
    expect(state.status).toBe('error');
    expect(state.error).toBeTruthy();
  });

  it('notFoundState returns notFound status', () => {
    expect(notFoundState().status).toBe('notFound');
  });

  it('maintenanceState returns maintenance status', () => {
    expect(maintenanceState().status).toBe('maintenance');
  });
});

// ── httpStatusToApiStatus — B02 core mapping ─────────────────────────────

describe('httpStatusToApiStatus — B02 fix: error ≠ empty', () => {
  it('404 → notFound (not empty)', () => {
    expect(httpStatusToApiStatus(404)).toBe('notFound');
  });

  it('503 → maintenance', () => {
    expect(httpStatusToApiStatus(503)).toBe('maintenance');
  });

  it('500 → error', () => {
    expect(httpStatusToApiStatus(500)).toBe('error');
  });

  it('503 → maintenance (not error)', () => {
    expect(httpStatusToApiStatus(503)).toBe('maintenance');
    expect(httpStatusToApiStatus(503)).not.toBe('error');
  });

  it('400 → error', () => {
    expect(httpStatusToApiStatus(400)).toBe('error');
  });

  it('422 → error', () => {
    expect(httpStatusToApiStatus(422)).toBe('error');
  });

  it('does not map 404 to empty — B02 core assertion', () => {
    // The old broken code returned 'empty' for all failures
    expect(httpStatusToApiStatus(404)).not.toBe('empty');
    expect(httpStatusToApiStatus(500)).not.toBe('empty');
    expect(httpStatusToApiStatus(503)).not.toBe('empty');
  });
});

// ── fromHttpResponse ──────────────────────────────────────────────────────

describe('fromHttpResponse', () => {
  it('200 with data → success', () => {
    const state = fromHttpResponse(200, [{ id: 1 }]);
    expect(state.status).toBe('success');
    expect(state.data).toEqual([{ id: 1 }]);
  });

  it('200 with empty array → empty (not error)', () => {
    const state = fromHttpResponse(200, []);
    expect(state.status).toBe('empty');
    // B02 core: empty array = empty state, NOT error state
    expect(state.status).not.toBe('error');
  });

  it('200 with null data → empty', () => {
    const state = fromHttpResponse(200, null);
    expect(state.status).toBe('empty');
  });

  it('404 → notFound', () => {
    const state = fromHttpResponse(404);
    expect(state.status).toBe('notFound');
  });

  it('500 → error', () => {
    const state = fromHttpResponse(500);
    expect(state.status).toBe('error');
    // B02 core: 500 ≠ empty
    expect(state.status).not.toBe('empty');
  });

  it('503 → maintenance', () => {
    const state = fromHttpResponse(503);
    expect(state.status).toBe('maintenance');
    expect(state.status).not.toBe('empty');
  });
});

// ── State discrimination — B02 complete assertion ─────────────────────────

describe('B02 state discrimination — all failure modes are distinct', () => {
  const states = [
    fromHttpResponse(200, [{ id: 1 }]),  // success
    fromHttpResponse(200, []),             // empty
    fromHttpResponse(404),                 // notFound
    fromHttpResponse(500),                 // error
    fromHttpResponse(503),                 // maintenance
  ];

  const statuses = states.map(s => s.status);

  it('all 5 states are distinct', () => {
    const unique = new Set(statuses);
    expect(unique.size).toBe(5);
  });

  it('success is distinct from empty', () => {
    expect(statuses[0]).not.toBe(statuses[1]);
  });

  it('empty is distinct from error', () => {
    expect(statuses[1]).not.toBe(statuses[3]);
  });

  it('error is distinct from notFound', () => {
    expect(statuses[3]).not.toBe(statuses[2]);
  });

  it('error is distinct from maintenance', () => {
    expect(statuses[3]).not.toBe(statuses[4]);
  });
});
