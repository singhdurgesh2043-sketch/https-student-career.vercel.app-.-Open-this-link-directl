/**
 * Super Admin Authentication & Security Service
 * 
 * CRITICAL SECURITY ARCHITECTURE:
 * 1. Zero secrets in frontend JavaScript, client bundles, or VITE_ environment variables.
 * 2. All Super Admin authentications are verified server-side via /api/admin-verify.
 * 3. Successful authentication yields a cryptographically signed HMAC-SHA256 session token.
 * 4. Sensitive administrative actions require the server-signed token in Authorization headers.
 * 5. Offline Android APKs fail closed with clear security guidance rather than pretending
 *    an offline embedded secret is secure.
 */

const STORAGE_KEYS = {
  TOKEN: 'sc_superadmin_session_token',
  EXPIRY: 'sc_superadmin_session_expiry',
  LOCKOUT_UNTIL: 'sc_superadmin_lockout_until',
};

export interface AuthVerifyResult {
  success: boolean;
  error?: string;
  remainingAttempts?: number;
  lockoutRemainingSeconds?: number;
  isOffline?: boolean;
}

export const AdminAuthService = {
  /**
   * Retrieves the active server-signed session token
   */
  getToken(): string | null {
    try {
      const token = sessionStorage.getItem(STORAGE_KEYS.TOKEN);
      const expiry = sessionStorage.getItem(STORAGE_KEYS.EXPIRY);
      if (!token || !expiry) return null;
      if (Date.now() > Number(expiry)) {
        this.logout();
        return null;
      }
      return token;
    } catch {
      return null;
    }
  },

  /**
   * Checks current lockout status from session or server feedback
   */
  getLockoutStatus(): { isLocked: boolean; remainingSeconds: number } {
    try {
      const lockoutUntil = sessionStorage.getItem(STORAGE_KEYS.LOCKOUT_UNTIL);
      if (lockoutUntil) {
        const remainingMs = Number(lockoutUntil) - Date.now();
        if (remainingMs > 0) {
          return {
            isLocked: true,
            remainingSeconds: Math.ceil(remainingMs / 1000),
          };
        }
        sessionStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL);
      }
    } catch {
      // Storage unavailable fallback
    }
    return { isLocked: false, remainingSeconds: 0 };
  },

  /**
   * Authenticates the Super Admin Secret Access Code strictly via the secure server
   */
  async verifyAccessCode(inputCode: string): Promise<AuthVerifyResult> {
    const trimmedCode = inputCode.trim();
    if (!trimmedCode) {
      return { success: false, error: 'Please enter the Secret Access Code.' };
    }

    const currentLockout = this.getLockoutStatus();
    if (currentLockout.isLocked) {
      const minutes = Math.floor(currentLockout.remainingSeconds / 60);
      const seconds = currentLockout.remainingSeconds % 60;
      return {
        success: false,
        error: `Security Lockout Active: Too many failed attempts. Try again in ${minutes}m ${seconds}s.`,
        lockoutRemainingSeconds: currentLockout.remainingSeconds,
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch('/api/admin-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmedCode }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await response.json();

      // Case 1: Successful Server Authentication
      if (response.status === 200 && data.authenticated && data.token) {
        this.saveSession(data.token, data.expiresAt);
        return { success: true };
      }

      // Case 2: Server-Side Rate Limiting / 15-Minute Lockout Triggered
      if (response.status === 429) {
        const remainingSec = data.lockoutRemainingSeconds || 900;
        try {
          sessionStorage.setItem(
            STORAGE_KEYS.LOCKOUT_UNTIL,
            String(Date.now() + remainingSec * 1000)
          );
        } catch {
          // Ignore
        }
        return {
          success: false,
          error: data.error || 'Security Lockout: 5 failed attempts. Access blocked for 15 minutes.',
          lockoutRemainingSeconds: remainingSec,
        };
      }

      // Case 3: Invalid Credentials
      if (response.status === 401) {
        return {
          success: false,
          error: data.error || 'Invalid secret access code. Access denied.',
          remainingAttempts: data.remainingAttempts,
        };
      }

      // Case 4: Server Secret Unconfigured
      if (response.status === 503) {
        return {
          success: false,
          error: 'SUPER_ADMIN_SECRET_CODE is not yet configured in server environment variables.',
        };
      }

      return {
        success: false,
        error: data.error || 'Server rejected authentication request.',
      };
    } catch (networkError: any) {
      // Offline / Network Failure:
      // SECURITY RULE: Never pretend a hardcoded client secret is secure offline.
      return {
        success: false,
        isOffline: true,
        error:
          'Server Connection Unavailable: Super Admin authentication requires a secure connection to the verification server. For security reasons, master administrative access cannot be granted offline without server validation.',
      };
    }
  },

  /**
   * Saves cryptographic server-signed session token in ephemeral sessionStorage
   */
  saveSession(token: string, expiresAt: number): void {
    try {
      sessionStorage.setItem(STORAGE_KEYS.TOKEN, token);
      sessionStorage.setItem(STORAGE_KEYS.EXPIRY, String(expiresAt));
      sessionStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL);
    } catch {
      // Fallback
    }
  },

  /**
   * Verifies if an active, unexpired session exists locally
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  },

  /**
   * Validates the active session against the server
   */
  async verifyServerSession(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await fetch('/api/admin-session-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        return data.valid === true;
      }
      this.logout();
      return false;
    } catch {
      // Network unreachable; local unexpired token remains tentatively valid
      return true;
    }
  },

  /**
   * Executes a sensitive administrative action via the server
   */
  async executeAdminAction(
    action: string,
    targetId?: string,
    payload?: any
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    const token = this.getToken();
    if (!token) {
      return {
        success: false,
        error: 'Unauthorized: Active Super Admin session token required.',
      };
    }

    try {
      const response = await fetch('/api/admin-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, targetId, payload }),
      });

      const data = await response.json();
      if (response.status === 200 && data.success) {
        return { success: true, message: data.message };
      }

      if (response.status === 401 || response.status === 403) {
        this.logout();
      }

      return { success: false, error: data.error || 'Administrative action rejected.' };
    } catch {
      return {
        success: false,
        error: 'Network error executing administrative action.',
      };
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
