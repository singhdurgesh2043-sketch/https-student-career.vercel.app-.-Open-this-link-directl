import crypto from 'crypto';

/**
 * Super Admin Server-Side Security Engine
 * - Constant-time comparison preventing timing attacks
 * - Cryptographically signed HMAC-SHA256 session tokens
 * - Server-side brute force rate limiting & lockout
 */

export interface AdminSessionPayload {
  role: 'superadmin';
  iat: number;
  exp: number;
  jti: string;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 Minutes
const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 Minutes

// In-memory shared state for warm serverless instances
interface RateLimitRecord {
  failedCount: number;
  lockedUntil: number | null;
  lastAttempt: number;
}
const rateLimitCache = new Map<string, RateLimitRecord>();

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    // Keep constant time execution
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Extracts anonymized SHA-256 IP hash for server-side rate-limiting
 */
export function getClientIpHash(req: any): string {
  const forwarded = req.headers?.['x-forwarded-for'];
  const ip =
    (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : null) ||
    req.headers?.['x-real-ip'] ||
    req.socket?.remoteAddress ||
    '127.0.0.1';

  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 32);
}

/**
 * Checks server-side lockout status for an IP hash
 */
export function checkRateLimit(ipHash: string): {
  isLocked: boolean;
  remainingSeconds: number;
  remainingAttempts: number;
} {
  const record = rateLimitCache.get(ipHash);
  const now = Date.now();

  if (record) {
    if (record.lockedUntil && now < record.lockedUntil) {
      return {
        isLocked: true,
        remainingSeconds: Math.ceil((record.lockedUntil - now) / 1000),
        remainingAttempts: 0,
      };
    }
    if (record.lockedUntil && now >= record.lockedUntil) {
      // Lockout expired
      rateLimitCache.delete(ipHash);
      return { isLocked: false, remainingSeconds: 0, remainingAttempts: MAX_FAILED_ATTEMPTS };
    }
    return {
      isLocked: false,
      remainingSeconds: 0,
      remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - record.failedCount),
    };
  }

  return { isLocked: false, remainingSeconds: 0, remainingAttempts: MAX_FAILED_ATTEMPTS };
}

/**
 * Records a failed attempt and activates 15-minute lockout at 5 attempts
 */
export function recordFailedAttempt(ipHash: string): {
  isLocked: boolean;
  remainingSeconds: number;
  remainingAttempts: number;
} {
  const now = Date.now();
  let record = rateLimitCache.get(ipHash);
  if (!record) {
    record = { failedCount: 1, lockedUntil: null, lastAttempt: now };
  } else {
    record.failedCount += 1;
    record.lastAttempt = now;
  }

  if (record.failedCount >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    rateLimitCache.set(ipHash, record);
    return {
      isLocked: true,
      remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
      remainingAttempts: 0,
    };
  }

  rateLimitCache.set(ipHash, record);
  return {
    isLocked: false,
    remainingSeconds: 0,
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - record.failedCount),
  };
}

/**
 * Clears rate-limit counters upon successful authentication
 */
export function resetRateLimit(ipHash: string): void {
  rateLimitCache.delete(ipHash);
}

/**
 * Signs an unforgeable HMAC-SHA256 session token
 */
export function createAdminSessionToken(
  signingSecret: string,
  durationMs: number = SESSION_DURATION_MS
): { token: string; expiresAt: number } {
  const now = Date.now();
  const expiresAt = now + durationMs;
  const payload: AdminSessionPayload = {
    role: 'superadmin',
    iat: now,
    exp: expiresAt,
    jti: crypto.randomBytes(16).toString('hex'),
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const hmac = crypto.createHmac('sha256', signingSecret);
  hmac.update(payloadStr);
  const signature = hmac.digest('base64url');

  return {
    token: `${payloadStr}.${signature}`,
    expiresAt,
  };
}

/**
 * Validates cryptographic signature and expiration of an admin session token
 */
export function verifyAdminSessionToken(
  token: string,
  signingSecret: string
): { valid: boolean; payload?: AdminSessionPayload; error?: string } {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Session token missing or invalid format.' };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'Malformed session token.' };
  }

  const [payloadStr, signature] = parts;
  const hmac = crypto.createHmac('sha256', signingSecret);
  hmac.update(payloadStr);
  const expectedSig = hmac.digest('base64url');

  if (!timingSafeCompare(signature, expectedSig)) {
    return {
      valid: false,
      error: 'Forged or tampered session token. Signature verification failed.',
    };
  }

  try {
    const payload: AdminSessionPayload = JSON.parse(
      Buffer.from(payloadStr, 'base64url').toString('utf8')
    );

    if (payload.role !== 'superadmin') {
      return { valid: false, error: 'Unauthorized role claim in token.' };
    }

    if (Date.now() > payload.exp) {
      return { valid: false, error: 'Admin session has expired. Please sign in again.' };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false, error: 'Corrupt session payload encoding.' };
  }
}
