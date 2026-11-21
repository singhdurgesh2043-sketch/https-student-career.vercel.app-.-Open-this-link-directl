import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  Lock,
  AlertTriangle,
  Clock,
  WifiOff,
} from 'lucide-react';
import { AdminAuthService } from '../services/adminAuthService';

interface SuperAdminLoginScreenProps {
  onAuthenticated: () => void;
  onBack: () => void;
}

export const SuperAdminLoginScreen: React.FC<SuperAdminLoginScreenProps> = ({
  onAuthenticated,
  onBack,
}) => {
  const [accessCode, setAccessCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isOfflineError, setIsOfflineError] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);

  // Check lockout on mount & tick countdown
  useEffect(() => {
    const checkLockout = () => {
      const status = AdminAuthService.getLockoutStatus();
      if (status.isLocked) {
        setLockoutSeconds(status.remainingSeconds);
      } else {
        setLockoutSeconds(0);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    setIsLoading(true);
    setErrorMessage('');
    setIsOfflineError(false);

    try {
      const result = await AdminAuthService.verifyAccessCode(accessCode);
      if (result.success) {
        onAuthenticated();
      } else {
        setErrorMessage(result.error || 'Access Denied: Invalid Secret Code.');
        if (result.isOffline) {
          setIsOfflineError(true);
        }
        if (typeof result.remainingAttempts === 'number') {
          setRemainingAttempts(result.remainingAttempts);
        }
        if (result.lockoutRemainingSeconds) {
          setLockoutSeconds(result.lockoutRemainingSeconds);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatLockoutTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center px-4 py-8 text-white relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

      <div className="max-w-sm w-full mx-auto space-y-5 relative z-10">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to App Settings</span>
        </button>

        <div className="bg-slate-800/90 backdrop-blur-md rounded-3xl p-6 border border-slate-700/80 shadow-2xl space-y-5">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black tracking-tight text-white">
              Super Admin Gateway
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              Restricted Area. Enter your private Secret Access Code to manage registered organizations.
            </p>
          </div>

          {/* Lockout Banner */}
          {lockoutSeconds > 0 && (
            <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <div className="font-bold text-rose-200">Security Lockout Active</div>
                <div className="text-[11px] mt-0.5">
                  Too many failed attempts. Try again in{' '}
                  <span className="font-mono font-bold text-white">
                    {formatLockoutTimer(lockoutSeconds)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Offline Architecture Warning Banner */}
          {isOfflineError && (
            <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-2xl text-amber-200 text-xs flex items-start gap-2.5">
              <WifiOff className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold block text-amber-300 mb-0.5">Server Connection Required</span>
                Super Admin authentication is verified server-side. For security reasons, master administrative access cannot be validated offline.
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && !isOfflineError && lockoutSeconds === 0 && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-tight">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Secret Access Code
                </label>
                {lockoutSeconds === 0 && remainingAttempts !== null && (
                  <span className="text-[10px] text-amber-400 font-mono">
                    {remainingAttempts} {remainingAttempts === 1 ? 'attempt' : 'attempts'} left
                  </span>
                )}
              </div>

              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type={showCode ? 'text' : 'password'}
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Enter private master secret..."
                  disabled={lockoutSeconds > 0 || isLoading}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 disabled:opacity-50"
                  autoComplete="off"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={lockoutSeconds > 0 || isLoading || !accessCode.trim()}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition disabled:opacity-50 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{isLoading ? 'Verifying with Server...' : 'Authorize Access'}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-700/60 text-center">
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Protected by server-side verification, rate limiting, and cryptographic HMAC-SHA256 session tokens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
