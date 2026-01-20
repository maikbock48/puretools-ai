import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

// Mock NextRequest
function createMockRequest(path: string, headers: Record<string, string> = {}): NextRequest {
  const url = new URL(`http://localhost${path}`);
  const headerMap = new Map(Object.entries(headers));

  return {
    nextUrl: url,
    headers: {
      get: (key: string) => headerMap.get(key) || null,
    },
  } as unknown as NextRequest;
}

describe('Rate Limiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('checkRateLimit', () => {
    it('allows first request and returns correct remaining count', () => {
      const request = createMockRequest('/api/test', { 'x-forwarded-for': '192.168.1.1' });
      const config = { interval: 60000, limit: 10 };

      const result = checkRateLimit(request, config);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
      expect(result.resetIn).toBe(60000);
    });

    it('allows subsequent requests within limit', () => {
      const request = createMockRequest('/api/test', { 'x-forwarded-for': '192.168.1.2' });
      const config = { interval: 60000, limit: 5 };

      // Make 4 requests (all should be allowed)
      for (let i = 0; i < 4; i++) {
        const result = checkRateLimit(request, config);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(4 - i);
      }
    });

    it('blocks requests when limit is exceeded', () => {
      const request = createMockRequest('/api/test', { 'x-forwarded-for': '192.168.1.3' });
      const config = { interval: 60000, limit: 3 };

      // Use up the limit
      for (let i = 0; i < 3; i++) {
        checkRateLimit(request, config);
      }

      // Next request should be blocked
      const result = checkRateLimit(request, config);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('resets counter after interval expires', () => {
      const request = createMockRequest('/api/test', { 'x-forwarded-for': '192.168.1.4' });
      const config = { interval: 60000, limit: 2 };

      // Use up the limit
      checkRateLimit(request, config);
      checkRateLimit(request, config);

      // Should be blocked
      let result = checkRateLimit(request, config);
      expect(result.allowed).toBe(false);

      // Advance time past the interval
      vi.advanceTimersByTime(61000);

      // Should be allowed again
      result = checkRateLimit(request, config);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(1);
    });

    it('uses x-real-ip header when x-forwarded-for is not present', () => {
      const request = createMockRequest('/api/test', { 'x-real-ip': '10.0.0.1' });
      const config = { interval: 60000, limit: 5 };

      const result = checkRateLimit(request, config);
      expect(result.allowed).toBe(true);
    });

    it('falls back to unknown when no IP headers present', () => {
      const request = createMockRequest('/api/test');
      const config = { interval: 60000, limit: 5 };

      const result = checkRateLimit(request, config);
      expect(result.allowed).toBe(true);
    });

    it('treats different paths as separate rate limits', () => {
      const request1 = createMockRequest('/api/endpoint1', { 'x-forwarded-for': '192.168.1.5' });
      const request2 = createMockRequest('/api/endpoint2', { 'x-forwarded-for': '192.168.1.5' });
      const config = { interval: 60000, limit: 1 };

      // First endpoint - use up limit
      checkRateLimit(request1, config);
      const result1 = checkRateLimit(request1, config);
      expect(result1.allowed).toBe(false);

      // Second endpoint should still be allowed (different path)
      const result2 = checkRateLimit(request2, config);
      expect(result2.allowed).toBe(true);
    });

    it('treats different IPs as separate rate limits', () => {
      const request1 = createMockRequest('/api/test', { 'x-forwarded-for': '192.168.1.100' });
      const request2 = createMockRequest('/api/test', { 'x-forwarded-for': '192.168.1.101' });
      const config = { interval: 60000, limit: 1 };

      // First IP - use up limit
      checkRateLimit(request1, config);
      const result1 = checkRateLimit(request1, config);
      expect(result1.allowed).toBe(false);

      // Second IP should still be allowed
      const result2 = checkRateLimit(request2, config);
      expect(result2.allowed).toBe(true);
    });

    it('extracts first IP from x-forwarded-for with multiple IPs', () => {
      const request = createMockRequest('/api/test', {
        'x-forwarded-for': '203.0.113.1, 198.51.100.1, 192.0.2.1'
      });
      const config = { interval: 60000, limit: 5 };

      const result = checkRateLimit(request, config);
      expect(result.allowed).toBe(true);
    });
  });

  describe('withRateLimit middleware', () => {
    it('passes request to handler when not rate limited', async () => {
      const mockHandler = vi.fn().mockResolvedValue(
        new NextResponse(JSON.stringify({ success: true }), { status: 200 })
      );
      const request = createMockRequest('/api/test', { 'x-forwarded-for': '192.168.2.1' });
      const config = { interval: 60000, limit: 10 };

      const wrappedHandler = withRateLimit(mockHandler, config);
      const response = await wrappedHandler(request);

      expect(mockHandler).toHaveBeenCalledWith(request);
      expect(response.status).toBe(200);
    });

    it('adds rate limit headers to successful response', async () => {
      const mockHandler = vi.fn().mockResolvedValue(
        new NextResponse(JSON.stringify({ success: true }), {
          status: 200,
          headers: new Headers(),
        })
      );
      const request = createMockRequest('/api/test', { 'x-forwarded-for': '192.168.2.2' });
      const config = { interval: 60000, limit: 10 };

      const wrappedHandler = withRateLimit(mockHandler, config);
      const response = await wrappedHandler(request);

      expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('9');
      expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy();
    });

    it('returns 429 when rate limited', async () => {
      const mockHandler = vi.fn().mockResolvedValue(
        new NextResponse(JSON.stringify({ success: true }), { status: 200 })
      );
      const request = createMockRequest('/api/test', { 'x-forwarded-for': '192.168.2.3' });
      const config = { interval: 60000, limit: 2 };

      const wrappedHandler = withRateLimit(mockHandler, config);

      // Use up the limit
      await wrappedHandler(request);
      await wrappedHandler(request);

      // This should be rate limited
      const response = await wrappedHandler(request);

      expect(response.status).toBe(429);
      expect(mockHandler).toHaveBeenCalledTimes(2); // Only called twice
    });

    it('includes retry headers in 429 response', async () => {
      const mockHandler = vi.fn().mockResolvedValue(
        new NextResponse(JSON.stringify({ success: true }), { status: 200 })
      );
      const request = createMockRequest('/api/test', { 'x-forwarded-for': '192.168.2.4' });
      const config = { interval: 60000, limit: 1 };

      const wrappedHandler = withRateLimit(mockHandler, config);

      await wrappedHandler(request);
      const response = await wrappedHandler(request);

      expect(response.headers.get('X-RateLimit-Limit')).toBe('1');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(response.headers.get('Retry-After')).toBeTruthy();
    });

    it('returns error message in 429 response body', async () => {
      const mockHandler = vi.fn().mockResolvedValue(
        new NextResponse(JSON.stringify({ success: true }), { status: 200 })
      );
      const request = createMockRequest('/api/test', { 'x-forwarded-for': '192.168.2.5' });
      const config = { interval: 60000, limit: 1 };

      const wrappedHandler = withRateLimit(mockHandler, config);

      await wrappedHandler(request);
      const response = await wrappedHandler(request);
      const body = await response.json();

      expect(body.error).toContain('Too many requests');
      expect(body.retryAfter).toBeGreaterThan(0);
    });

    it('uses default config when not provided', async () => {
      const mockHandler = vi.fn().mockResolvedValue(
        new NextResponse(JSON.stringify({ success: true }), { status: 200 })
      );
      const request = createMockRequest('/api/test', { 'x-forwarded-for': '192.168.2.6' });

      const wrappedHandler = withRateLimit(mockHandler);
      const response = await wrappedHandler(request);

      expect(response.headers.get('X-RateLimit-Limit')).toBe('10'); // Default limit
    });
  });

  describe('RATE_LIMITS configurations', () => {
    it('has ai limit configuration', () => {
      expect(RATE_LIMITS.ai).toBeDefined();
      expect(RATE_LIMITS.ai.interval).toBe(60000);
      expect(RATE_LIMITS.ai.limit).toBeGreaterThan(0);
    });

    it('has api limit configuration', () => {
      expect(RATE_LIMITS.api).toBeDefined();
      expect(RATE_LIMITS.api.interval).toBe(60000);
      expect(RATE_LIMITS.api.limit).toBeGreaterThanOrEqual(60);
    });

    it('has auth limit configuration', () => {
      expect(RATE_LIMITS.auth).toBeDefined();
      expect(RATE_LIMITS.auth.interval).toBe(60000);
      expect(RATE_LIMITS.auth.limit).toBe(5);
    });

    it('has webhook limit configuration', () => {
      expect(RATE_LIMITS.webhook).toBeDefined();
      expect(RATE_LIMITS.webhook.interval).toBe(1000);
      expect(RATE_LIMITS.webhook.limit).toBe(100);
    });

    it('ai limit is more restrictive than api limit', () => {
      expect(RATE_LIMITS.ai.limit).toBeLessThan(RATE_LIMITS.api.limit);
    });
  });
});
