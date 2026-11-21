import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAdminSessionToken } from './_security';

/**
 * Server-Side Super Admin Session Verification
 * Verifies that a client's session token is cryptographically signed and active.
 */
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
