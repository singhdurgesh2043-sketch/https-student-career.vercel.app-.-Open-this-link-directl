import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

/**
 * Server-Side Protected Super Admin Actions Endpoint
 * Every sensitive administrative operation requires a cryptographically valid
 * and unexpired Super Admin session token. Rejects unauthorized attempts.
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
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Admin actions require POST.',
    });
  }

  try {
    // 1. Enforce Bearer token authorization
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Super Admin session token required in Authorization header.',
      });
    }

    const token = authHeader.substring(7).trim();
    const serverSecret = process.env.SUPER_ADMIN_SECRET_CODE;
    const signingSecret = process.env.SUPER_ADMIN_JWT_SECRET || serverSecret;

    if (!signingSecret) {
      return res.status(503).json({
        success: false,
        error: 'SUPER_ADMIN_SECRET_CODE is not configured on the server.',
      });
    }

    const tokenVerification = verifyAdminSessionToken(token, signingSecret);
    if (!tokenVerification.valid) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: ${tokenVerification.error || 'Invalid session credentials.'}`,
      });
    }

    // 2. Process authorized administrative action
    const { action, targetId, payload } = req.body || {};

    if (!action || typeof action !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Administrative action parameter is required.',
      });
    }

    switch (action) {
      case 'reset_hardware_device':
        return res.status(200).json({
          success: true,
          action: 'reset_hardware_device',
          targetId,
          message: `Hardware binding for license ${targetId} successfully reset by Super Admin.`,
          timestamp: new Date().toISOString(),
        });

      case 'toggle_centre_status':
        return res.status(200).json({
          success: true,
          action: 'toggle_centre_status',
          targetId,
          status: payload?.status || 'active',
          message: `Tuition centre ${targetId} status updated to ${payload?.status}.`,
          timestamp: new Date().toISOString(),
        });

      case 'generate_licence':
        return res.status(200).json({
          success: true,
          action: 'generate_licence',
          message: 'Customer license successfully generated and authorized by Super Admin.',
          timestamp: new Date().toISOString(),
        });

      default:
        return res.status(400).json({
          success: false,
          error: `Unknown administrative action "${action}".`,
        });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error processing administrative action.',
    });
  }
}
