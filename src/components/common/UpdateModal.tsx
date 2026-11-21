import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Clock,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { UpdateManifest, downloadAndInstallUpdate, dismissOptionalUpdate } from '../../services/updateService';
import { AppVersionInfo } from '../../config/appVersion';
import { BRANDING } from '../../config/branding';

interface UpdateModalProps {
  manifest: UpdateManifest;
  installedVersion: AppVersionInfo;
  isMandatory: boolean;
  onClose: () => void;
}

type UpdatePhase = 'idle' | 'downloading' | 'verifying' | 'installing' | 'error' | 'success';

export const UpdateModal: React.FC<UpdateModalProps> = ({
  manifest,
  installedVersion,
  isMandatory,
  onClose,
}) => {
  const [phase, setPhase] = useState<UpdatePhase>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleUpdateNow = async () => {
    setErrorMessage('');
    setPhase('downloading');
    setProgress(0);

    try {
      await downloadAndInstallUpdate(manifest, (pct, currentPhase) => {
        setProgress(pct);
        setPhase(currentPhase);
      });
      setPhase('success');
    } catch (err: any) {
      setPhase('error');
      setErrorMessage(err.message || 'An unexpected error occurred during update.');
    }
  };

  const handleLater = () => {
    if (!isMandatory) {
      dismissOptionalUpdate(manifest.versionCode);
      onClose();
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Approx. 3.2 MB';
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-slate-800 relative">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-6 py-5 text-white relative">
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                isMandatory
                  ? 'bg-amber-400 text-amber-950 shadow-sm'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
              }`}
            >
              {isMandatory ? 'Mandatory Update' : 'New Version Available'}
            </span>
            <span className="text-[11px] font-semibold text-blue-200">
              {formatFileSize(manifest.fileSizeBytes)}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur border border-white/20">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight leading-tight">
                Update Your App!
              </h3>
              <p className="text-xs text-blue-100/90 font-medium">
                {BRANDING.appName}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Main Informative Message */}
          <p className="text-xs text-slate-600 leading-relaxed">
            A new version of {BRANDING.appName} is available. Update now to enjoy the latest improvements.
          </p>

          {/* Version Comparison Card */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 grid grid-cols-2 gap-2 text-center">
            <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-2xs">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Current
              </div>
              <div className="text-xs font-bold text-slate-700 mt-0.5">
                v{installedVersion.versionName}
              </div>
              <div className="text-[9px] text-slate-400 font-mono">
                Build #{installedVersion.versionCode}
              </div>
            </div>

            <div className="p-2 bg-emerald-50/70 rounded-xl border border-emerald-200/60 shadow-2xs">
              <div className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
                Latest
              </div>
              <div className="text-xs font-black text-emerald-800 mt-0.5">
                v{manifest.versionName}
              </div>
              <div className="text-[9px] text-emerald-600 font-mono">
                Build #{manifest.versionCode}
              </div>
            </div>
          </div>

          {/* Release Notes */}
          {manifest.releaseNotes && manifest.releaseNotes.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
                <span>What's New in v{manifest.versionName}</span>
              </div>
              <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 text-[11px] space-y-1.5 text-slate-600">
                {manifest.releaseNotes.map((note, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <span className="leading-tight">{note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress / Status Indicators */}
          {phase === 'downloading' && (
            <div className="space-y-2 p-3 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="flex justify-between items-center text-xs font-bold text-blue-900">
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-700" />
                  <span>Downloading Update...</span>
                </span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-blue-200/70 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-200 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-[10px] text-blue-700/80 text-center">
                Keep the app open while the package is downloaded.
              </div>
            </div>
          )}

          {phase === 'verifying' && (
            <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center gap-2.5 text-indigo-900">
              <ShieldCheck className="w-5 h-5 text-indigo-600 animate-pulse shrink-0" />
              <div className="text-xs">
                <div className="font-bold">Verifying Package Security</div>
                <div className="text-[10px] text-indigo-700">Checking SHA-256 integrity signature...</div>
              </div>
            </div>
          )}

          {phase === 'installing' && (
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-2.5 text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <div className="font-bold">Ready to Install</div>
                <div className="text-[10px] text-emerald-700">Opening Android Package Installer...</div>
              </div>
            </div>
          )}

          {phase === 'error' && (
            <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-rose-900 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Update Failed</span>
              </div>
              <p className="text-[11px] text-rose-600 leading-relaxed whitespace-pre-line">
                {errorMessage}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            {phase === 'idle' || phase === 'error' ? (
              <>
                <button
                  type="button"
                  onClick={handleUpdateNow}
                  className="w-full py-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 active:scale-[0.98] text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition"
                >
                  <Download className="w-4 h-4" />
                  <span>{phase === 'error' ? 'Retry Update Now' : 'Update Now'}</span>
                </button>

                {!isMandatory && (
                  <button
                    type="button"
                    onClick={handleLater}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Later (Remind Me Tomorrow)</span>
                  </button>
                )}

                {/* Direct Manual Download Link if needed */}
                {manifest.apkUrl && (
                  <div className="text-center pt-1">
                    <a
                      href={manifest.apkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Direct Browser Download</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                )}
              </>
            ) : phase === 'installing' || phase === 'success' ? (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 font-bold rounded-2xl text-xs transition"
              >
                Close Dialog
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
