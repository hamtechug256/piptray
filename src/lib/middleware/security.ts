import { NextResponse } from 'next/server';

// ============================================
// SECURITY HEADERS CONFIGURATION
// ============================================

interface SecurityHeadersConfig {
  contentSecurityPolicy?: string;
  xFrameOptions?: string;
  strictTransportSecurity?: boolean;
  referrerPolicy?: string;
  permissionsPolicy?: string;
}

const DEFAULT_SECURITY_HEADERS: SecurityHeadersConfig = {
  // Prevent clickjacking
  contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' 'self'; object-src 'none'; base-uri 'self'; frame-src 'self'; frame-ancestors 'self'",
  
  // Prevent MIME type sniffing
  xFrameOptions: 'SAMEORIGIN',
  
  // Enable HSTS (HTTP Strict Transport Security)
  strictTransportSecurity: true,
  
  // Control referrer information
  referrerPolicy: 'strict-origin-when-cross-origin',
  
  // Control permissions
  permissionsPolicy: 'camera=(), microphone=(), geolocation=()',
};

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  const headers = DEFAULT_SECURITY_HEADERS;
  
  // Content Security Policy
 if (headers.contentSecurityPolicy) {
    response.headers.set('Content-Security-Policy', headers.contentSecurityPolicy);
  }
  
  // X-Frame-Options
  if (headers.xFrameOptions) {
    response.headers.set('X-Frame-Options', headers.xFrameOptions);
  }
  
  // Strict Transport Security
 if (headers.strictTransportSecurity) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Referrer Policy
  if (headers.referrerPolicy) {
    response.headers.set('Referrer-Policy', headers.referrerPolicy);
  }
  
  // Permissions Policy
  if (headers.permissionsPolicy) {
    response.headers.set('Permissions-Policy', headers.permissionsPolicy);
  }
  
  // Additional security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  
  return response;
}

 /**
 * Create a secure response with headers
 */
export function secureResponse(data: unknown, status = 200): NextResponse {
  const response = NextResponse.json(data, { status });
  return applySecurityHeaders(response);
  }

 /**
 * Create a secure error response
 */
export function errorResponse(message: string, status = 400): NextResponse {
  const response = NextResponse.json(
    { success: false, error: message },
    { status }
  );
  return applySecurityHeaders(response);
  }

 /**
 * Input sanitization utilities
 */
export const sanitizeInput = {
  /**
   * Sanitize string input
   */
  string: (input: string, maxLength = 255): string => {
    if (!input) return '';
    return input
      .slice(0, maxLength)
      .replace(/[<>]/g, '') // Remove potential XSS characters
      .trim();
  },

  /**
   * Sanitize email input
   */
  email: (input: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!input || !emailRegex.test(input)) return '';
    return input.toLowerCase().trim();
  },

  /**
   * Sanitize phone number (Uganda format)
   */
  phone: (input: string): string => {
    // Remove all non-numeric characters
    const cleaned = input?.replace(/\D/g, '');
    // Handle Uganda phone formats
 if (cleaned?.startsWith('256')) {
      return cleaned.length === 12 ? cleaned : '';
    }
    if (cleaned?.startsWith('0')) {
      const withoutLeading = cleaned.substring(1);
      return withoutLeading.length === 9 ? `256${withoutLeading}` : '';
    }
    return '';
  },

  /**
   * Sanitize wallet address
   */
  walletAddress: (input: string): string => {
    if (!input) return '';
    const clean = input.trim();
    // Ethereum: starts with 0x, 42 characters
    if (/^(0x)[a-fA-F0-9]{40}$/.test(clean)) return clean;
    // Bitcoin: starts with 1, 3 or bc1
    if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(clean)) return clean;
    if (/^T[A-Za-z1-9]{33}$/.test(clean)) return clean; // USDT
 return '';
  },

  /**
   * Sanitize number input
   */
  number: (input: string | number, min?: number, max?: number): number | null => {
    const num = typeof input === 'string' ? parseFloat(input) : input;
    if (isNaN(num)) return null;
    if (min !== undefined && num < min) return null;
    if (max !== undefined && num > max) return null;
    return num;
  },

  /**
   * Sanitize currency code
   */
  currency: (input: string): string => {
    const validCurrencies = ['UGX', 'USD', 'KES', 'TZS', 'RWF', 'NGN', 'GHS', 'ZAR', 'USDT', 'BTC', 'ETH'];
    const upper = input?.toUpperCase();
    if (validCurrencies.includes(upper)) return upper;
    return 'UGX';
 // Default to UGX
  },
};