/**
 * Student Career App - In-App Auto Update Service
 * Handles update manifest checks, semantic version comparisons,
 * real-time download progress, cryptographic SHA-256 integrity verification,
 * and official Android PackageInstaller dispatch.
 */

import { registerPlugin, Capacitor } from '@capacitor/core';
import { BRANDING } from '../config/branding';
import { CURRENT_APP_VERSION, AppVersionInfo } from '../config/appVersion';

export interface UpdateManifest {
  versionCode: number;
  versionName: string;
  minSupportedVersionCode: number;
  isMandatory: boolean;
  publishedAt: string;
  apkUrl: string;
  apkSha256: string;
  fileSizeBytes: number;
  releaseTitle: string;
  releaseNotes: string[];
}

export interface UpdateCheckResult {
  hasUpdate: boolean;
  isMandatory: boolean;
  installedVersion: AppVersionInfo;
  latestManifest?: UpdateManifest;
  error?: string;
  checkedAt: string;
}

export interface AppUpdateNativePlugin {
  getAppVersion(): Promise<{ versionCode: number; versionName: string; packageName: string }>;
  canRequestPackageInstalls(): Promise<{ canInstall: boolean }>;
  openInstallPermissionSettings(): Promise<void>;
  installApk(options: { base64: string }): Promise<{ success: boolean }>;
}

export const AppUpdateNative = registerPlugin<AppUpdateNativePlugin>('AppUpdateNative');

const LAST_CHECK_KEY = 'app_update_last_checked';
const DISMISSED_VERSION_KEY = 'app_update_dismissed_version';
const DISMISSED_TIME_KEY = 'app_update_dismissed_time';

/**
 * Gets currently installed version details, querying native Android OS if available
 */
export async function getInstalledAppVersion(): Promise<AppVersionInfo> {
  if (Capacitor.isNativePlatform()) {
    try {
      const nativeInfo = await AppUpdateNative.getAppVersion();
      if (nativeInfo && nativeInfo.versionCode) {
        return {
          versionCode: Number(nativeInfo.versionCode),
          versionName: nativeInfo.versionName || CURRENT_APP_VERSION.versionName,
          packageName: nativeInfo.packageName || CURRENT_APP_VERSION.packageName,
          buildDate: CURRENT_APP_VERSION.buildDate,
          environment: CURRENT_APP_VERSION.environment,
        };
      }
    } catch (e) {
      console.warn('Native getAppVersion fallback to bundle info:', e);
    }
  }
  return CURRENT_APP_VERSION;
}

/**
 * Fetches latest update manifest with automatic fallback across HTTPS endpoints
 */
async function fetchUpdateManifest(): Promise<UpdateManifest> {
  const cacheBust = `?t=${Date.now()}`;
  const endpoints = [
    BRANDING.endpoints.updateManifestFallbackUrl + cacheBust,
    BRANDING.endpoints.updateManifestUrl + cacheBust,
  ];

  let lastError: Error | null = null;
  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const manifest: UpdateManifest = await response.json();
        if (typeof manifest.versionCode === 'number' && manifest.versionName) {
          return manifest;
        }
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error('Could not connect to update servers.');
}

/**
 * Checks if an optional update was dismissed within the last 24 hours
 */
export function isUpdateDismissed(versionCode: number): boolean {
  try {
    const dismissedVersion = localStorage.getItem(DISMISSED_VERSION_KEY);
    const dismissedTime = localStorage.getItem(DISMISSED_TIME_KEY);
    if (dismissedVersion && Number(dismissedVersion) === versionCode && dismissedTime) {
      const elapsedHours = (Date.now() - Number(dismissedTime)) / (1000 * 60 * 60);
      return elapsedHours < 24; // Mute optional prompt for 24 hours
    }
  } catch (e) {
    // Ignore storage issues
  }
  return false;
}

/**
 * Records that the user dismissed an optional update prompt
 */
export function dismissOptionalUpdate(versionCode: number): void {
  try {
    localStorage.setItem(DISMISSED_VERSION_KEY, String(versionCode));
    localStorage.setItem(DISMISSED_TIME_KEY, String(Date.now()));
  } catch (e) {
    // Ignore storage issues
  }
}

/**
 * Checks for available app update
 */
export async function checkForAppUpdate(options?: { force?: boolean }): Promise<UpdateCheckResult> {
  const installed = await getInstalledAppVersion();
  const checkedAt = new Date().toISOString();

  try {
    localStorage.setItem(LAST_CHECK_KEY, checkedAt);
  } catch (e) {
    // Ignore
  }

  try {
    const manifest = await fetchUpdateManifest();
    const hasUpdate = manifest.versionCode > installed.versionCode;
    const isMandatory =
      hasUpdate &&
      (manifest.isMandatory || installed.versionCode < (manifest.minSupportedVersionCode || 1));

    // If optional and recently dismissed, and not forced by manual check
    if (hasUpdate && !isMandatory && !options?.force && isUpdateDismissed(manifest.versionCode)) {
      return {
        hasUpdate: false, // Suppress automatic modal, user dismissed
        isMandatory: false,
        installedVersion: installed,
        latestManifest: manifest,
        checkedAt,
      };
    }

    return {
      hasUpdate,
      isMandatory,
      installedVersion: installed,
      latestManifest: manifest,
      checkedAt,
    };
  } catch (err: any) {
    return {
      hasUpdate: false,
      isMandatory: false,
      installedVersion: installed,
      error: err.message || 'Failed to check for updates',
      checkedAt,
    };
  }
}

/**
 * Gets the last time an update check was performed
 */
export function getLastUpdateCheckTime(): string | null {
  try {
    return localStorage.getItem(LAST_CHECK_KEY);
  } catch (e) {
    return null;
  }
}

/**
 * Computes SHA-256 hexadecimal hash from an ArrayBuffer
 */
async function computeSha256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Converts ArrayBuffer to Base64 in chunks to prevent memory stack overflow
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

/**
 * Downloads the signed APK with real-time percentage progress,
 * verifies SHA-256 checksum integrity, and launches Android's PackageInstaller
 */
export async function downloadAndInstallUpdate(
  manifest: UpdateManifest,
  onProgress: (percent: number, phase: 'downloading' | 'verifying' | 'installing') => void
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', manifest.apkUrl, true);
    xhr.responseType = 'arraybuffer';

    xhr.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
        onProgress(percent, 'downloading');
      } else {
        // Fallback progress if Content-Length header is omitted by server
        onProgress(50, 'downloading');
      }
    };

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300 && xhr.response) {
        try {
          onProgress(100, 'verifying');

          const arrayBuffer: ArrayBuffer = xhr.response;

          // 1. Verify SHA-256 checksum integrity
          if (manifest.apkSha256 && manifest.apkSha256.trim().length > 0) {
            const computedSha256 = await computeSha256(arrayBuffer);
            const expectedSha256 = manifest.apkSha256.trim().toLowerCase();

            if (computedSha256.toLowerCase() !== expectedSha256) {
              throw new Error(
                `Security Integrity Check Failed!\nExpected SHA-256: ${expectedSha256}\nComputed SHA-256: ${computedSha256}.\nThe update package may be corrupted or modified.`
              );
            }
          }

          onProgress(100, 'installing');

          // 2. Launch Android PackageInstaller if native platform
          if (Capacitor.isNativePlatform()) {
            // Check unknown sources installation permission on Android 8+
            try {
              const permCheck = await AppUpdateNative.canRequestPackageInstalls();
              if (permCheck && permCheck.canInstall === false) {
                // Guide user to enable unknown sources
                await AppUpdateNative.openInstallPermissionSettings();
              }
            } catch (permErr) {
              console.warn('Permission check skipped/handled:', permErr);
            }

            const base64Apk = arrayBufferToBase64(arrayBuffer);
            await AppUpdateNative.installApk({ base64: base64Apk });
            resolve();
          } else {
            // Browser / PWA fallback: trigger direct browser file save
            const blob = new Blob([arrayBuffer], {
              type: 'application/vnd.android.package-archive',
            });
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `StudentCareerApp-v${manifest.versionName}.apk`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
            resolve();
          }
        } catch (err: any) {
          reject(err);
        }
      } else {
        reject(new Error(`Download failed with server HTTP status: ${xhr.status} (${xhr.statusText})`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during APK download. Please check your internet connection.'));
    };

    xhr.ontimeout = () => {
      reject(new Error('APK download timed out. Please try again.'));
    };

    xhr.timeout = 180000; // 3 minutes timeout for slower 3G/4G connections
    xhr.send();
  });
}
