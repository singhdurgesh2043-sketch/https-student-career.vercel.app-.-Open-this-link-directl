import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

/**
 * Server-Side Super Admin Session Verification
 * Verifies that a client's session token is cryptographically signed and active.
 */

interface AdminSessionPayload {
  role: 'superadmin';
  iat: number;
  exp: number;
  jti: string;
}

function verifyAdminSessionToken(
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

  if (signature.length !== expectedSig.length) {
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(signature));
    return { valid: false, error: 'Invalid session token signature.' };
  }

  const isSigMatch = crypto.timingSafeEqual(
    Buffer.from(signature, 'utf8'),
    Buffer.from(expectedSig, 'utf8')
  );

  if (!isSigMatch) {
    return { valid: false, error: 'Session token signature mismatch.' };
  }

  try {
    const payloadJson = Buffer.from(payloadStr, 'base64url').toString('utf8');
    const payload: AdminSessionPayload = JSON.parse(payloadJson);

    if (payload.role !== 'superadmin') {
      return { valid: false, error: 'Invalid session role claim.' };
    }

    if (Date.now() > payload.exp) {
      return { valid: false, error: 'Session token has expired.' };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false, error: 'Corrupted session token payload.' };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({
      valid: false,
      error: 'Method not allowed.',
    });
  }

  try {
    const authHeader = req.headers['authorization'];
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.body && typeof req.body.token === 'string') {
      token = req.body.token.trim();
    }

    if (!token) {
      return res.status(401).json({
        valid: false,
        error: 'Missing authorization session token.',
      });
    }

    const serverSecret = process.env.SUPER_ADMIN_SECRET_CODE;
    const signingSecret = process.env.SUPER_ADMIN_JWT_SECRET || serverSecret;

    if (!signingSecret) {
      return res.status(503).json({
        valid: false,
        error: 'Server secret is not configured.',
      });
    }

    const result = verifyAdminSessionToken(token, signingSecret);

    if (!result.valid) {
      return res.status(401).json({
        valid: false,
        error: result.error || 'Invalid or expired session token.',
      });
    }

    return res.status(200).json({
      valid: true,
      role: 'superadmin',
      expiresAt: result.payload?.exp,
    });
  } catch (error: any) {
    return res.status(500).json({
      valid: false,
      error: 'Internal server error verifying admin session.',
    });
  }
}
