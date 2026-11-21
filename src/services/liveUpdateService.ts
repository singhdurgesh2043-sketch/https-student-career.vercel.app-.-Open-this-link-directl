/**
 * Hybrid Live Update & Remote Web Delivery Engine
 * 
 * Implements seamless over-the-air (OTA) remote web updates for the Capacitor Android app:
 * 1. Allows remote UI, text, and compatible feature updates without reinstalling APK.
 * 2. Checks compatibility with installed native plugin versions.
 * 3. Fallback watchdog: If remote Vercel origin is unreachable (e.g. offline),
 *    automatically boots certified local bundled assets.
 * 4. Safe rollback: Allows switching between remote live updates and local bundled version.
 * 5. Strictly protects WebView security (allowedNavigation restricted to official HTTPS domain).
 */

import { Capacitor } from '@capacitor/core';
import { CURRENT_APP_VERSION, AppVersionInfo } from '../config/appVersion';
import { BRANDING } from '../config/branding';

const LIVE_UPDATE_CONFIG_KEY = 'sc_hybrid_live_update_config';

export interface HybridUpdateConfig {
  mode: 'remote_live' | 'local_bundled';
  remoteUrl: string;
  activeWebVersion: string;
  lastRemoteSyncSuccess: string | null;
  failedBootCount: number;
  rollbackAvailable: boolean;
  rollbackVersion: string | null;
}

const DEFAULT_CONFIG: HybridUpdateConfig = {
  mode: 'remote_live',
  remoteUrl: BRANDING.officialWebsite,
  activeWebVersion: CURRENT_APP_VERSION.versionName,
  lastRemoteSyncSuccess: null,
  failedBootCount: 0,
  rollbackAvailable: false,
  rollbackVersion: null,
};

export const LiveUpdateService = {
  /**
   * Retrieves active hybrid update configuration
   */
  getConfig(): HybridUpdateConfig {
    try {
      const stored = localStorage.getItem(LIVE_UPDATE_CONFIG_KEY);
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_CONFIG;
  },

  /**
   * Saves hybrid update configuration
   */
  saveConfig(config: Partial<HybridUpdateConfig>): void {
    try {
      const current = this.getConfig();
      const updated = { ...current, ...config };
      localStorage.setItem(LIVE_UPDATE_CONFIG_KEY, JSON.stringify(updated));
    } catch {
      // Storage unavailable
    }
  },

  /**
   * Determines if the current environment is running within native Android
   */
  isNativeAndroid(): boolean {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  },

  /**
   * Checks whether the current context is running remote live or local bundle
   */
  isCurrentlyRemote(): boolean {
    return window.location.origin.includes('vercel.app');
  },

  /**
   * Checks if remote update is compatible with installed native binary
   * If remote manifest requires a higher native versionCode, a native APK is required.
   */
  isNativeUpdateRequired(manifestMinNativeCode: number, installedNativeCode: number): boolean {
    return manifestMinNativeCode > installedNativeCode;
  },

  /**
   * Performs pre-flight health check to verify remote server reachability
   */
  async checkRemoteHealth(remoteUrl: string = BRANDING.officialWebsite): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(`${remoteUrl}/version.json?t=${Date.now()}`, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Cache-Control': 'no-cache' },
      });
      clearTimeout(timeoutId);

      return response.ok;
    } catch {
      return false;
    }
  },

  /**
   * Safely switches to remote live delivery mode
   */
  async enableRemoteLiveSync(): Promise<{ success: boolean; message: string }> {
    const config = this.getConfig();
    const isHealthy = await this.checkRemoteHealth(config.remoteUrl);

    if (!isHealthy) {
      return {
        success: false,
        message: 'Cannot switch to Remote Live Sync: Remote server is unreachable or offline.',
      };
    }

    this.saveConfig({
      mode: 'remote_live',
      lastRemoteSyncSuccess: new Date().toISOString(),
      failedBootCount: 0,
      rollbackAvailable: true,
      rollbackVersion: config.activeWebVersion,
    });

    return {
      success: true,
      message: 'Remote Live Sync enabled. App will receive immediate over-the-air web updates.',
    };
  },

  /**
   * Rolls back to stable certified local bundle
   */
  rollbackToLocalBundle(): { success: boolean; message: string } {
    this.saveConfig({
      mode: 'local_bundled',
      failedBootCount: 0,
    });

    // If currently running on remote origin, navigate back to local scheme
    if (this.isCurrentlyRemote() && this.isNativeAndroid()) {
      window.location.href = 'https://localhost/index.html';
    }

    return {
      success: true,
      message: 'Successfully rolled back to certified local bundled assets.',
    };
  },

  /**
   * Boot Watchdog: Called on app startup to verify boot health and route safely
   */
  async initBootWatchdog(): Promise<void> {
    if (!this.isNativeAndroid()) return;

    const config = this.getConfig();

    // If local bundle mode requested, stay on local
    if (config.mode === 'local_bundled') {
      return;
    }

    // If currently running on local bundle and remote_live is enabled:
    if (!this.isCurrentlyRemote() && config.mode === 'remote_live') {
      const isReachable = await this.checkRemoteHealth(config.remoteUrl);
      if (isReachable) {
        // Safe redirect to verified official HTTPS Vercel domain
        this.saveConfig({
          lastRemoteSyncSuccess: new Date().toISOString(),
          failedBootCount: 0,
        });
        window.location.href = config.remoteUrl;
      } else {
        // Remote unreachable; gracefully continue on local bundle with zero interruption
        console.warn('LiveUpdate: Remote origin unreachable. Booting certified local fallback bundle.');
      }
    }
  },
};
