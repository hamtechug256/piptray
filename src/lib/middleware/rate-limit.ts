import { NextRequest, NextResponse } from 'next/server';

// ============================================
// RATE LIMITING CONFIGURATION
// ============================================

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
}

// Different rate limits for different endpoints
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Auth endpoints - strict limits
  'auth': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 requests per minute
    message: 'Too many authentication attempts. Please try again later.',
  },
  // Password reset - very strict
  'password-reset': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 requests per hour
    message: 'Too many password reset attempts. Please try again later.',
  },
  // API endpoints - moderate limits
  'api': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
    message: 'Too many requests. Please slow down.',
  },
  // Public endpoints - relaxed limits
  'public': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    message: 'Too many requests. Please slow down.',
  },
};

// In-memory store for rate limiting (for simple use cases)
// For production, use Redis or Upstash
const requestStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Clean up expired entries periodically
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, value] of requestStore.entries()) {
    if (now > value.resetTime) {
      requestStore.delete(key);
    }
  }
}

// Run cleanup every minute
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, 60 * 1000);
}

/**
 * Get client IP address from request
 */
function getClientIp(request: NextRequest): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  // Cloudflare
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp;
  }
  
  return 'unknown';
}

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(
  request: NextRequest,
  type: keyof typeof RATE_LIMITS = 'api'
): { limited: boolean; remaining: number; resetTime: number; message?: string } {
  const config = RATE_LIMITS[type];
  const ip = getClientIp(request);
  const key = `${type}:${ip}`;
  const now = Date.now();
  
  const entry = requestStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    // Create new entry
    requestStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      limited: false,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }
  
  if (entry.count >= config.maxRequests) {
    return {
      limited: true,
      remaining: 0,
      resetTime: entry.resetTime,
      message: config.message,
    };
  }
  
  // Increment count
  entry.count++;
  requestStore.set(key, entry);
  
  return {
    limited: false,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Rate limiting middleware wrapper
 */
export function withRateLimit(
  type: keyof typeof RATE_LIMITS = 'api'
) {
  return async function (
    request: NextRequest,
    handler: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    const result = checkRateLimit(request, type);
    
    if (result.limited) {
      return NextResponse.json(
        {
          success: false,
          error: result.message || 'Too many requests',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMITS[type].maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetTime.toString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }
    
    const response = await handler();
    
    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', RATE_LIMITS[type].maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
    
    return response;
  };
}

/**
 * Auth rate limit middleware - for login/register endpoints
 */
export async function authRateLimit(request: NextRequest): Promise<NextResponse | null> {
  const result = checkRateLimit(request, 'auth');
  
  if (result.limited) {
    return NextResponse.json(
      {
        success: false,
        error: result.message,
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      },
      { status: 429 }
    );
  }
  
  return null;
}

/**
 * API rate limit middleware - for general API endpoints
 */
export async function apiRateLimit(request: NextRequest): Promise<NextResponse | null> {
  const result = checkRateLimit(request, 'api');
  
  if (result.limited) {
    return NextResponse.json(
      {
        success: false,
        error: result.message,
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      },
      { status: 429 }
    );
  }
  
  return null;
}
