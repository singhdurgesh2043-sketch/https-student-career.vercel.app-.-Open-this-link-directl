import React, { useState } from 'react';
import {
  Settings,
  Building,
  KeyRound,
  Smartphone,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Save,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Database,
  Moon,
  Sun,
} from 'lucide-react';
import { CentreProfile, LicenceInfo, ActiveScreen } from '../types';
import { AppStorage } from '../lib/storage';

interface SettingsScreenProps {
  centre: CentreProfile;
  licence: LicenceInfo | null;
  onUpdateCentre: (updated: CentreProfile) => void;
  onNavigate: (screen: ActiveScreen) => void;
  onLogout: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  centre,
  licence,
  onUpdateCentre,
  onNavigate,
  onLogout,
}) => {
  const [centreName, setCentreName] = useState(centre.name);
  const [tagline, setTagline] = useState(centre.tagline || '');
  const [ownerName, setOwnerName] = useState(centre.owner_name);
  const [ownerPhone, setOwnerPhone] = useState(centre.owner_phone);
  const [upiId, setUpiId] = useState(centre.upi_id || '');
  const [address, setAddress] = useState(centre.address || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CentreProfile = {
      ...centre,
      name: centreName.trim(),
      tagline: tagline.trim(),
      owner_name: ownerName.trim(),
      owner_phone: ownerPhone.trim(),
      upi_id: upiId.trim(),
      address: address.trim(),
    };
    onUpdateCentre(updated);
    AppStorage.setCentre(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetDemo = () => {
    if (confirm('Reset application data to school demonstration defaults?')) {
      AppStorage.resetToDemo();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Settings & Centre Info
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Profile configuration, licence details, app diagnostics
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Centre profile updated successfully!</span>
        </div>
      )}

      {/* Licence Status Box */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-3xl p-5 text-white shadow-lg space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>LIFETIME ONE-TIME LICENCE</span>
            </div>
            <h3 className="text-base font-black tracking-wider font-mono">
              {licence?.license_key || 'SC-2026-APEX-9921'}
            </h3>
            <p className="text-[11px] text-blue-200 mt-0.5">
              Activated for: <strong className="text-white">{licence?.centre_name || centre.name}</strong>
            </p>
          </div>
          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-xl text-xs font-bold">
            Active
          </span>
        </div>

        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-blue-200">
          <span className="flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Device Locked (1/1)</span>
          </span>
          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono">
            {licence?.device_uuid?.substring(0, 16) || 'ANDROID-DEV-ACTIVE'}
          </span>
        </div>
      </div>

      {/* Super Admin Direct Gateway */}
      <div
        onClick={() => onNavigate('superadmin')}
        className="bg-amber-50 hover:bg-amber-100/70 border border-amber-300/80 rounded-3xl p-4 flex items-center justify-between cursor-pointer transition active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Super Admin Master Portal</h4>
            <p className="text-[11px] text-slate-600">
              Generate licences, manage all tuition centres & reset hardware bindings
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-amber-700" />
      </div>

      {/* Edit Centre Profile Form */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3.5">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Building className="w-4 h-4 text-blue-700" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Edit Centre Profile
          </h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Coaching / Tuition Name
            </label>
            <input
              type="text"
              value={centreName}
              onChange={(e) => setCentreName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tagline / Slogan</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Director Name</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">WhatsApp Number</label>
              <input
                type="tel"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">UPI ID for Fees</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="centre@okhdfcbank"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Premises City</label>
              <input
                type="text"
                value={centre.city}
                disabled
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Update Centre Details</span>
          </button>
        </form>
      </div>

      {/* System Diagnostics & School Demo Controls */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Software Information & Diagnostics
        </h4>

        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span>Application Name:</span>
            <strong className="text-slate-900">STUDENT CAREER</strong>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span>Package ID:</span>
            <span className="font-mono text-slate-900 font-semibold">com.studentcareer.app</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span>Release Version:</span>
            <span className="font-semibold text-slate-900">v1.0.0 (Capacitor Android)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span>Data Storage:</span>
            <span className="text-blue-700 font-bold">Local Persistence (Demo Mode)</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Cloud Database:</span>
            <span className="text-slate-600 font-medium">Supabase Ready (Schema Available)</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 space-y-2">
          <button
            onClick={handleResetDemo}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data to Factory Defaults</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out from Centre</span>
          </button>
        </div>
      </div>
    </div>
  );
};
