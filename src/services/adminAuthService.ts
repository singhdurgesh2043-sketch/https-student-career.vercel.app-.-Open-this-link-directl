/**
 * Super Admin Authentication & Security Service
 * Implements serverless verification, cryptographic hashing,
 * brute-force rate-limiting, and ephemeral session management.
 */

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 Minutes
const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 Minutes

const STORAGE_KEYS = {
  TOKEN: 'sc_superadmin_session_token',
  EXPIRY: 'sc_superadmin_session_expiry',
  FAILED: 'sc_superadmin_failed_attempts',
  LOCKOUT: 'sc_superadmin_lockout_until',
};

// Default placeholder for offline/local development (Override in .env)
const PLACEHOLDER_DEFAULT_CODE = 'ADMIN-SECRET-2026';
const CRYPTO_SALT = 'sc_super_admin_security_salt_v1';

async function sha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface AuthVerifyResult {
  success: boolean;
  error?: string;
  remainingAttempts?: number;
  lockoutRemainingSeconds?: number;
}

export const AdminAuthService = {
  /**
   * Checks current lockout status
   */
  getLockoutStatus(): { isLocked: boolean; remainingSeconds: number } {
    try {
      const lockoutUntil = sessionStorage.getItem(STORAGE_KEYS.LOCKOUT);
      if (lockoutUntil) {
        const remainingMs = Number(lockoutUntil) - Date.now();
        if (remainingMs > 0) {
          return {
            isLocked: true,
            remainingSeconds: Math.ceil(remainingMs / 1000),
          };
        }
        // Lockout expired, clean up
        sessionStorage.removeItem(STORAGE_KEYS.LOCKOUT);
        sessionStorage.removeItem(STORAGE_KEYS.FAILED);
      }
    } catch {
      // Storage unavailable fallback
    }
    return { isLocked: false, remainingSeconds: 0 };
  },

  /**
   * Gets remaining attempts before lockout
   */
  getRemainingAttempts(): number {
    try {
      const failed = Number(sessionStorage.getItem(STORAGE_KEYS.FAILED) || '0');
      return Math.max(0, MAX_FAILED_ATTEMPTS - failed);
    } catch {
      return MAX_FAILED_ATTEMPTS;
    }
  },

  /**
   * Authenticates the Super Admin Secret Access Code
   */
  async verifyAccessCode(inputCode: string): Promise<AuthVerifyResult> {
    const lockout = this.getLockoutStatus();
    if (lockout.isLocked) {
      const minutes = Math.floor(lockout.remainingSeconds / 60);
      const seconds = lockout.remainingSeconds % 60;
      return {
        success: false,
        error: `Security Lockout Active: Too many failed attempts. Try again in ${minutes}m ${seconds}s.`,
        lockoutRemainingSeconds: lockout.remainingSeconds,
      };
    }

    const trimmedCode = inputCode.trim();
    if (!trimmedCode) {
      return { success: false, error: 'Please enter the Secret Access Code.' };
    }

    let isMatch = false;

    // 1. Try Server-Side Verification Endpoint (if hosted on Vercel/Node)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch('/api/admin-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmedCode }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.status === 200) {
        const data = await response.json();
        if (data.authenticated) {
          isMatch = true;
        }
      } else if (response.status === 401) {
        isMatch = false;
      }
    } catch {
      // Offline mode or serverless endpoint not running in local Vite dev
    }

    // 2. Client-Side Cryptographic Verification (For Offline Capacitor Android APK)
    if (!isMatch) {
      const configuredEnvCode = import.meta.env.VITE_SUPER_ADMIN_ACCESS_CODE;
      const configuredEnvHash = import.meta.env.VITE_SUPER_ADMIN_SECRET_HASH;

      const inputSaltedHash = await sha256(trimmedCode + CRYPTO_SALT);

      if (configuredEnvHash && typeof configuredEnvHash === 'string') {
        isMatch = inputSaltedHash.toLowerCase() === configuredEnvHash.trim().toLowerCase();
      } else if (configuredEnvCode && typeof configuredEnvCode === 'string') {
        isMatch = trimmedCode === configuredEnvCode.trim();
      } else {
        // Default Placeholder configuration
        isMatch = trimmedCode === PLACEHOLDER_DEFAULT_CODE;
      }
    }

    // Process Match Outcome
    if (isMatch) {
      this.createSession();
      return { success: true };
    }

    // Handle Failed Attempt
    return this.recordFailedAttempt();
  },

  /**
   * Records a failed attempt and triggers lockout if max attempts exceeded
   */
  recordFailedAttempt(): AuthVerifyResult {
    let currentFailed = 0;
    try {
      currentFailed = Number(sessionStorage.getItem(STORAGE_KEYS.FAILED) || '0') + 1;
      sessionStorage.setItem(STORAGE_KEYS.FAILED, String(currentFailed));
    } catch {
      currentFailed = 1;
    }

    const remaining = Math.max(0, MAX_FAILED_ATTEMPTS - currentFailed);

    if (remaining === 0) {
      const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
      try {
        sessionStorage.setItem(STORAGE_KEYS.LOCKOUT, String(lockoutUntil));
      } catch {
        // Ignore
      }
      return {
        success: false,
        error: `Security Lockout Triggered: 5 failed attempts. Access blocked for 15 minutes.`,
        remainingAttempts: 0,
        lockoutRemainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
      };
    }

    return {
      success: false,
      error: `Access Denied: Invalid Secret Access Code. (${remaining} ${
        remaining === 1 ? 'attempt' : 'attempts'
      } remaining before lockout)`,
      remainingAttempts: remaining,
    };
  },

  /**
   * Creates an ephemeral authenticated session
   */
  createSession(): void {
    try {
      const array = new Uint8Array(24);
      window.crypto.getRandomValues(array);
      const token = Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
      const expiry = Date.now() + SESSION_DURATION_MS;

      sessionStorage.setItem(STORAGE_KEYS.TOKEN, token);
      sessionStorage.setItem(STORAGE_KEYS.EXPIRY, String(expiry));
      sessionStorage.removeItem(STORAGE_KEYS.FAILED);
      sessionStorage.removeItem(STORAGE_KEYS.LOCKOUT);
    } catch {
      // Session fallback
    }
  },

  /**
   * Verifies if the Super Admin session is active and valid
   */
  isAuthenticated(): boolean {
    try {
      const token = sessionStorage.getItem(STORAGE_KEYS.TOKEN);
      const expiry = sessionStorage.getItem(STORAGE_KEYS.EXPIRY);
      if (!token || !expiry) return false;

      const isExpired = Date.now() > Number(expiry);
      if (isExpired) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Terminates Super Admin session
   */
  logout(): void {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
      sessionStorage.removeItem(STORAGE_KEYS.EXPIRY);
    } catch {
      // Ignore
    }
  },
};
