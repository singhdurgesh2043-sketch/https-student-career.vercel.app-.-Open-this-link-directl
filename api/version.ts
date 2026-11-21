import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Dynamic Version Manifest Endpoint (/api/version)
 * Serves canonical version metadata, permanent APK/AAB distribution links,
 * and remote web update parameters for website and Android clients.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow GET and OPTIONS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set aggressive cache control for instant update propagation
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const GITHUB_REPO = 'https://github.com/singhdurgesh2043-sketch/https-student-career.vercel.app-.-Open-this-link-directl';
  const LATEST_RELEASE_URL = `${GITHUB_REPO}/releases/latest/download`;

  return res.status(200).json({
    versionCode: 1,
    versionName: '1.0.0',
    webVersion: '1.0.0',
    minSupportedVersionCode: 1,
    minSupportedNativeVersionCode: 1,
    isMandatory: false,
    publishedAt: '2026-11-21T09:00:00Z',
    apkUrl: `${LATEST_RELEASE_URL}/StudentCareerApp-release.apk`,
    aabUrl: `${LATEST_RELEASE_URL}/StudentCareerApp-release.aab`,
    apkSha256: '47a988d4474771960249c5ebfa5566f7f6a788876c43315a676ebf6727289ad9',
    fileSizeBytes: 3314520,
    releaseTitle: 'Student Career App v1.0.0 Production Release',
    releaseNotes: [
      'Hybrid Auto Update Architecture: Instant remote web updates without reinstalling APK',
      'Cryptographically Verified In-App APK Updates with SHA-256 Checksum Validation',
      'Strict Server-Side Super Admin Security with HMAC-SHA256 Ephemeral Session Tokens',
      'Fail-Closed Multi-Tenant Row Level Security (RLS) Database Architecture',
      'Fresh Registration & Complete Separation of Demo Records from Production Data',
      'Offline Fallback Support & Protected Administrative Rollback Controls'
    ],
    updateType: 'hybrid', // 'web_only' | 'native_required' | 'hybrid'
    supportEmail: 'support@studentcareer.app',
    officialWebsite: 'https://studentcareerapp.vercel.app',
  });
}
