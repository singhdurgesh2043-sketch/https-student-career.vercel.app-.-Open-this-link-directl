import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Server-Side Super Admin Authentication Endpoint
 * Verifies secret access code against private server environment variable SUPER_ADMIN_SECRET_CODE.
 * Never exposes the secret key to frontend browser or client bundles.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enforce POST method
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Super Admin verification requires POST.',
    });
  }

  try {
    const { code } = req.body || {};
    const serverSecret = process.env.SUPER_ADMIN_SECRET_CODE;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Secret access code is required.',
      });
    }

    // Check if server secret is configured in environment
    if (!serverSecret) {
      return res.status(503).json({
        success: false,
        configured: false,
        error: 'SUPER_ADMIN_SECRET_CODE is not yet configured in server environment variables.',
      });
    }

    // Constant-time or direct string comparison
    if (code.trim() === serverSecret.trim()) {
      return res.status(200).json({
        success: true,
        authenticated: true,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(401).json({
      success: false,
      authenticated: false,
      error: 'Invalid secret access code. Access denied.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Internal authentication server error.',
    });
  }
}
