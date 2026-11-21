import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Download,
  Smartphone,
  Globe,
  Copy,
  Check,
  Share2,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Info,
  Clock,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { CentreProfile } from '../types';

interface DownloadAppScreenProps {
  centre: CentreProfile;
  onBack: () => void;
  deferredPrompt?: any;
}

export const DownloadAppScreen: React.FC<DownloadAppScreenProps> = ({
  centre,
  onBack,
  deferredPrompt,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);
  const [appUrl, setAppUrl] = useState<string>('');

  useEffect(() => {
    // Determine the current URL or stable fallback
    let current = window.location.href;
    if (current.startsWith('file:') || current.includes('localhost')) {
      current = window.location.origin && !window.location.origin.startsWith('file:') 
        ? window.location.origin 
        : 'https://student-career.vercel.app';
    }
    setAppUrl(current);

    // Generate high-resolution QR Code
    QRCode.toDataURL(current, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR Code:', err));
  }, []);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadQrPng = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `Student_Career_App_QR_${centre.name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setInstalledSuccess(true);
      }
    } else {
      alert(
        "To install Student Career App on your Android device:\n\n1. Tap the three dots (⋮) in your Chrome browser menu.\n2. Tap 'Install app' or 'Add to Home screen'.\n3. The app will install directly with full offline capability!"
      );
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🎓 Access *Student Career App* for ${centre.name} directly on your smartphone:\n${appUrl}\n\nOpen this link to view student management, attendance, fee ledgers, and academic progress reports.`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-4 pb-8 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to App</span>
        </button>

        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Official Download Portal</span>
        </span>
      </div>

      {/* Main Brand Card */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-5 text-white shadow-lg shadow-blue-900/10 text-center relative overflow-hidden">
        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur border border-white/20">
          <Smartphone className="w-7 h-7 text-blue-200" />
        </div>
        <h2 className="text-xl font-extrabold tracking-tight">Student Career App</h2>
        <p className="text-xs text-blue-200 mt-1 max-w-xs mx-auto leading-relaxed">
          Install the complete tuition management app on Android smartphones & tablets
        </p>
        <p className="text-[11px] font-semibold text-emerald-300 mt-2">
          {centre.name} • {centre.city || 'India'}
        </p>
      </div>

      {/* QR Code Presentation Box */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center space-y-4">
        <div className="flex items-center justify-center gap-1.5 text-slate-800 font-bold text-xs uppercase tracking-wider">
          <QrCode className="w-4 h-4 text-blue-700" />
          <span>Scan QR Code to Open on Phone</span>
        </div>

        {/* QR Code Image */}
        <div className="w-56 h-56 mx-auto bg-slate-50 p-3 rounded-2xl border border-slate-200 shadow-inner flex items-center justify-center">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Student Career App QR Code"
              className="w-full h-full rounded-xl object-contain"
            />
          ) : (
            <div className="text-slate-400 text-xs">Generating QR Code...</div>
          )}
        </div>

        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          Point your Android camera at the QR code above to immediately open and install the app.
        </p>

        {/* Download QR Button */}
        <button
          onClick={handleDownloadQrPng}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Download QR Poster (PNG)</span>
        </button>
      </div>

      {/* Installation Options */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider px-1">
          Installation Methods
        </h3>

        {/* Option 1: PWA Web App Installation */}
        <div className="bg-white rounded-2xl p-4 border border-blue-200 shadow-2xs space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Install Website App (PWA)
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Instant install on Android Home Screen. Works offline.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full shrink-0">
              Recommended
            </span>
          </div>

          <button
            onClick={handleInstallPwa}
            className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow"
          >
            <Sparkles className="w-4 h-4" />
            <span>Install Web App to Home Screen</span>
          </button>
        </div>

        {/* Option 2: Native Android APK & AAB (Phase 3 Complete) */}
        <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-2xs space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Android APK & Bundle (Native)
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Package ID: <span className="font-mono text-slate-700">com.studentcareer.app</span>
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Built (v1.0)</span>
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 leading-relaxed border border-slate-100 space-y-1.5">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Release APK (3.12 MB)</strong> and <strong>Play Store AAB (3.14 MB)</strong> have been successfully compiled in GitHub Actions.
              </span>
            </div>
          </div>

          <a
            href="https://github.com/singhdurgesh2043-sketch/https-student-career.vercel.app-.-Open-this-link-directl/actions/runs/44859338752"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow"
          >
            <Download className="w-4 h-4" />
            <span>Download Release APK & AAB (GitHub)</span>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-200" />
          </a>
        </div>

        {/* Option 3: Shareable Link & WhatsApp */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span>Official Web Link</span>
            {copied && (
              <span className="text-emerald-600 text-[11px] flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Copied!
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={appUrl}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 truncate"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>
          </div>

          <button
            onClick={handleShareWhatsApp}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Link via WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Data Transparency Banner (Requirement 2) */}
      <div className="bg-slate-100/80 rounded-2xl p-3.5 text-[11px] text-slate-600 space-y-1 border border-slate-200/60 leading-relaxed">
        <p className="font-bold text-slate-800 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          <span>Data Storage & Synchronization Policy:</span>
        </p>
        <p>• <strong>Active Storage:</strong> Browser LocalStorage (Fast, persistent single-device demo mode).</p>
        <p>• <strong>Multi-Device Cloud Sync:</strong> Supabase PostgreSQL multi-tenant backend schema is defined in code and ready to connect when live cloud credentials are added.</p>
      </div>
    </div>
  );
};
