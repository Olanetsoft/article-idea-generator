/**
 * Simple in-memory rate limiter
 * For production at scale, use Redis-based rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (resets on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowSec: number;
  /** Identifier prefix (e.g., 'track', 'create') */
  prefix?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Check and update rate limit for a given identifier
 * @param identifier - Usually IP address or user ID
 * @param config - Rate limit configuration
 * @returns Whether the request is allowed and rate limit info
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
): RateLimitResult {
  cleanup();

  const { limit, windowSec, prefix = "default" } = config;
  const key = `${prefix}:${identifier}`;
  const now = Date.now();
  const windowMs = windowSec * 1000;

  const entry = rateLimitStore.get(key);

  // No existing entry or window expired - create new
  if (!entry || entry.resetTime < now) {
    const resetTime = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetTime,
    };
  }

  // Within window - check limit
  if (entry.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;
  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Pre-configured rate limiters for different endpoints
 */
export const RateLimits = {
  // Click tracking: 100 requests per minute per IP
  // Generous to allow legitimate high-traffic links
  track: { limit: 100, windowSec: 60, prefix: "track" },

  // URL creation: 10 URLs per minute per IP
  // Prevents spam URL creation
  createUrl: { limit: 10, windowSec: 60, prefix: "create" },

  // Analytics fetch: 30 requests per minute per IP
  // Prevents dashboard hammering
  analytics: { limit: 30, windowSec: 60, prefix: "analytics" },

  // Export: 5 exports per minute per IP
  // Exports can be expensive
  export: { limit: 5, windowSec: 60, prefix: "export" },
} as const;

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): {
  "X-RateLimit-Limit": string;
  "X-RateLimit-Remaining": string;
  "X-RateLimit-Reset": string;
} {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(result.resetTime / 1000).toString(),
  };
}
