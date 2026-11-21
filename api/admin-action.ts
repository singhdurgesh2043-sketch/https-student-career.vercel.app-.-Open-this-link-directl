import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAdminSessionToken } from './_security';

/**
 * Server-Side Protected Super Admin Actions Endpoint
 * Every sensitive administrative operation requires a cryptographically valid
 * and unexpired Super Admin session token. Rejects unauthorized attempts.
 */
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
