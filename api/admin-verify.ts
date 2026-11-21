import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  timingSafeCompare,
  getClientIpHash,
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
  createAdminSessionToken,
} from './_security';

/**
 * Server-Side Super Admin Authentication Endpoint
 * - Constant-time comparison preventing timing attacks
 * - Server-side IP rate limiting (5 attempts = 15 minute lockout)
 * - Cryptographically signed HMAC-SHA256 session token issuance
 * - Zero secrets exposed to client bundle
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enforce POST method
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
      // Clear rate-limiting on success
      resetRateLimit(ipHash);

      // Issue cryptographically signed session token
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
