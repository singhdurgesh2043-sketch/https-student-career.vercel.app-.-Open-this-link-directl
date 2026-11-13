import React, { useState, useEffect } from 'react';
import { KeyRound, Smartphone, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, Building2, User } from 'lucide-react';
import { getDeviceHardwareInfo, DeviceHardwareInfo } from '../lib/device';
import { AppStorage, INITIAL_LICENCE, INITIAL_CENTRE } from '../lib/storage';
import { LicenceInfo, CentreProfile } from '../types';
import confetti from 'canvas-confetti';

interface ActivationScreenProps {
  onActivated: (licence: LicenceInfo, centre: CentreProfile) => void;
}

export const ActivationScreen: React.FC<ActivationScreenProps> = ({ onActivated }) => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceHardwareInfo | null>(null);
  const [licenseKey, setLicenseKey] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [centreName, setCentreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    getDeviceHardwareInfo().then(setDeviceInfo);
  }, []);

  const handleUseDemoLicense = () => {
    setLicenseKey(INITIAL_LICENCE.license_key);
    setActivationCode(INITIAL_LICENCE.activation_code);
    setCentreName(INITIAL_CENTRE.name);
    setOwnerName(INITIAL_CENTRE.owner_name);
    setOwnerPhone(INITIAL_CENTRE.owner_phone);
    setErrorMessage('');
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!licenseKey.trim()) {
      setErrorMessage('Please enter your License Key');
      return;
    }
    if (!activationCode.trim()) {
      setErrorMessage('Please enter your Activation Code');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate backend validation with local store
      await new Promise((res) => setTimeout(res, 800));

      const cleanKey = licenseKey.trim().toUpperCase();
      const cleanCode = activationCode.trim().toUpperCase();

      // Check against stored license or valid format
      const currentLicence = AppStorage.getLicence();
      const isValidKey =
        cleanKey.startsWith('SC-') ||
        (currentLicence && currentLicence.license_key === cleanKey);

      if (!isValidKey) {
        setErrorMessage('Invalid License Key format. Example: SC-2026-XXXX-XXXX');
        setIsLoading(false);
        return;
      }

      const activeLicence: LicenceInfo = {
        id: currentLicence?.id || 'lic-' + Math.random().toString(36).substring(2, 9),
        license_key: cleanKey,
        activation_code: cleanCode,
        centre_id: currentLicence?.centre_id || 'centre-' + Math.random().toString(36).substring(2, 9),
        centre_name: centreName.trim() || currentLicence?.centre_name || 'STUDENT CAREER CENTRE',
        owner_name: ownerName.trim() || currentLicence?.owner_name || 'Director',
        owner_phone: ownerPhone.trim() || currentLicence?.owner_phone || '9876543210',
        plan_type: 'LIFETIME_ONE_TIME',
        amount_paid: 14999,
        status: 'active',
        max_devices: 1,
        device_count: 1,
        activated_at: new Date().toISOString(),
        device_uuid: deviceInfo?.uuid || 'DEV-HARDWARE-ACTIVE',
      };

      const activeCentre: CentreProfile = {
        ...(AppStorage.getCentre() || INITIAL_CENTRE),
        id: activeLicence.centre_id,
        name: activeLicence.centre_name,
        owner_name: activeLicence.owner_name,
        owner_phone: activeLicence.owner_phone,
      };

      AppStorage.setLicence(activeLicence);
      AppStorage.setCentre(activeCentre);

      setSuccessMessage('Tuition Centre successfully activated on this device!');
      
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }

      setTimeout(() => {
        onActivated(activeLicence, activeCentre);
      }, 1000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Activation failed';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8 px-4 sm:px-6">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-6 text-white text-center shadow-xl shadow-blue-900/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShieldCheck className="w-36 h-36" />
          </div>

          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur border border-white/20">
            <KeyRound className="w-7 h-7 text-amber-300" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight">Activate Software</h2>
          <p className="text-xs text-blue-200 mt-1 max-w-xs mx-auto">
            Enter the one-time licence key provided with your purchase to activate your coaching centre.
          </p>

          {/* Hardware Device Fingerprint */}
          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-center gap-2 text-[11px] text-blue-200">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-[10px]">
              Device ID: {deviceInfo?.uuid?.substring(0, 16) || 'Detecting hardware...'}
            </span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          {errorMessage && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleActivate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                License Key <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                  placeholder="SC-2026-XXXX-XXXX"
                  className="w-full pl-3 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white uppercase transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Activation Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                placeholder="ACT-XXXX"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white uppercase transition"
                required
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                Centre Details (First Time Setup)
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Tuition / Coaching Name
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={centreName}
                      onChange={(e) => setCentreName(e.target.value)}
                      placeholder="e.g. Apex Career Academy"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Owner Name
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="Prof. Sharma"
                        className="w-full pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3 bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white font-bold rounded-xl shadow-lg shadow-blue-700/20 text-sm flex items-center justify-center gap-2 transition disabled:opacity-70"
            >
              {isLoading ? (
                <span>Validating Hardware & Licence...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Activate Tuition Centre</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Autofill Button for School Project Demonstration */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleUseDemoLicense}
              className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-xl border border-blue-200 flex items-center justify-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Autofill Sample School Demo Licence</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              For testing & examiner evaluation: clicks populate valid demo key
            </p>
          </div>
        </div>

        {/* Business Model Summary Rules */}
        <div className="bg-slate-100/80 rounded-2xl p-4 text-[11px] text-slate-600 space-y-1.5 border border-slate-200/60">
          <p className="font-semibold text-slate-800">Licence Terms & Policy:</p>
          <p>• One purchased licence permanently activates 1 tuition centre.</p>
          <p>• No mandatory monthly or yearly recurring software subscription.</p>
          <p>• Hardware locked to authorized device. Contact Super Admin for device replacements.</p>
        </div>
      </div>
    </div>
  );
};
