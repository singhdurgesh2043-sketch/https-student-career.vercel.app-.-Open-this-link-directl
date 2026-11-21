import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

/**
 * Server-Side Super Admin Authentication Endpoint
 * - Constant-time comparison preventing timing attacks
 * - Server-side IP rate limiting (5 attempts = 15 minute lockout)
 * - Cryptographically signed HMAC-SHA256 session token issuance
 * - Zero secrets exposed to client bundle
 */

interface AdminSessionPayload {
  role: 'superadmin';
  iat: number;
  exp: number;
  jti: string;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 Minutes
const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 Minutes

interface RateLimitRecord {
  failedCount: number;
  lockedUntil: number | null;
  lastAttempt: number;
}
const rateLimitCache = new Map<string, RateLimitRecord>();

function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

function getClientIpHash(req: any): string {
  const forwarded = req.headers?.['x-forwarded-for'];
  const ip =
    (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : null) ||
    req.headers?.['x-real-ip'] ||
    req.socket?.remoteAddress ||
    '127.0.0.1';

  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 32);
}

function checkRateLimit(ipHash: string) {
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

function recordFailedAttempt(ipHash: string) {
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

function resetRateLimit(ipHash: string): void {
  rateLimitCache.delete(ipHash);
}

function createAdminSessionToken(signingSecret: string, durationMs: number = SESSION_DURATION_MS) {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Super Admin verification requires POST.',
    });
  }

  const ipHash = getClientIpHash(req);

  // 1. Check server-side lockout
  const rateLimitStatus = checkRateLimit(ipHash);
  if (rateLimitStatus.isLocked) {
    const minutes = Math.floor(rateLimitStatus.remainingSeconds / 60);
    const seconds = rateLimitStatus.remainingSeconds % 60;
    return res.status(429).json({
      success: false,
      locked: true,
      error: `Security Lockout Active: Too many failed attempts. Try again in ${minutes}m ${seconds}s.`,
      lockoutRemainingSeconds: rateLimitStatus.remainingSeconds,
    });
  }

  try {
    const { code } = req.body || {};
    const serverSecret = process.env.SUPER_ADMIN_SECRET_CODE;
    const signingSecret = process.env.SUPER_ADMIN_JWT_SECRET || serverSecret;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Secret access code is required.',
      });
    }

    // 2. Check if server secret is configured in environment
    if (!serverSecret) {
      return res.status(503).json({
        success: false,
        configured: false,
        error: 'SUPER_ADMIN_SECRET_CODE is not configured in server environment variables.',
      });
    }

    // 3. Constant-time comparison
    const isMatch = timingSafeCompare(code.trim(), serverSecret.trim());

    if (isMatch) {
      resetRateLimit(ipHash);
      const session = createAdminSessionToken(signingSecret);

      return res.status(200).json({
        success: true,
        authenticated: true,
        token: session.token,
        expiresAt: session.expiresAt,
        role: 'superadmin',
      });
    }

    // 4. Handle failed attempt and enforce lockout
    const failedStatus = recordFailedAttempt(ipHash);
    if (failedStatus.isLocked) {
      return res.status(429).json({
        success: false,
        authenticated: false,
        locked: true,
        error: 'Security Lockout Triggered: 5 failed attempts. Access blocked for 15 minutes.',
        lockoutRemainingSeconds: failedStatus.remainingSeconds,
      });
    }

    return res.status(401).json({
      success: false,
      authenticated: false,
      locked: false,
      error: `Invalid secret access code. Access denied. (${failedStatus.remainingAttempts} attempts remaining before lockout)`,
      remainingAttempts: failedStatus.remainingAttempts,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Internal authentication server error.',
    });
  }
}
