import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  interval: number; // in milliseconds
  limit: number; // max requests per interval
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// Note: In production with multiple instances, use Redis instead
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute

/**
 * Get client IP from request
 */
function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback to a default identifier
  return 'unknown';
}

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetIn: number } {
  const ip = getClientIP(request);
  const key = `${ip}:${request.nextUrl.pathname}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // First request or expired entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.interval,
    });
    return {
      allowed: true,
      remaining: config.limit - 1,
      resetIn: config.interval,
    };
  }

  if (entry.count >= config.limit) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    remaining: config.limit - entry.count,
    resetIn: entry.resetTime - now,
  };
}

/**
 * Rate limit middleware for API routes
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: RateLimitConfig = { interval: 60000, limit: 10 }
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const { allowed, remaining, resetIn } = checkRateLimit(request, config);

    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil(resetIn / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': config.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(resetIn / 1000).toString(),
            'Retry-After': Math.ceil(resetIn / 1000).toString(),
          },
        }
      );
    }

    const response = await handler(request);

    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', config.limit.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', Math.ceil(resetIn / 1000).toString());

    return response;
  };
}

/**
 * Predefined rate limit configurations
 */
export const RATE_LIMITS = {
  // AI endpoints: 10 requests per minute
  ai: {
    interval: 60000,
    limit: parseInt(process.env.RATE_LIMIT_AI_REQUESTS || '10'),
  },
  // General API: 60 requests per minute
  api: {
    interval: 60000,
    limit: parseInt(process.env.RATE_LIMIT_API_REQUESTS || '60'),
  },
  // Auth endpoints: 5 requests per minute
  auth: {
    interval: 60000,
    limit: 5,
  },
  // Stripe webhooks: No limit (verified by signature)
  webhook: {
    interval: 1000,
    limit: 100,
  },
};
