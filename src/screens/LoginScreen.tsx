import React, { useState } from 'react';
import { GraduationCap, Lock, Phone, ArrowRight, UserCheck, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { CentreProfile } from '../types';
import { AppStorage, INITIAL_CENTRE } from '../lib/storage';

interface LoginScreenProps {
  centre: CentreProfile;
  onLoginSuccess: (role: 'centre_owner' | 'teacher', userName: string) => void;
  onNavigateToRegister: () => void;
  onNavigateToActivation: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  centre,
  onLoginSuccess,
  onNavigateToRegister,
  onNavigateToActivation,
}) => {
  // Inputs start completely blank by default - no hardcoded demo credentials
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState<'centre_owner' | 'teacher'>('centre_owner');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('Please enter your 10-digit registered mobile number');
      return;
    }

    if (!pin.trim()) {
      setErrorMsg('Please enter your PIN / Password');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      // Search registered centres across multi-tenant database
      const allCentres = AppStorage.getAllCentres();
      const matchedCentre = allCentres.find(
        (c) => c.owner_phone === cleanPhone || c.whatsapp_number === cleanPhone
      );

      if (matchedCentre) {
        if (matchedCentre.status === 'inactive') {
          setErrorMsg('This centre account has been deactivated. Please contact Super Admin.');
          return;
        }

        // Switch active tenant to this centre
        AppStorage.switchCentre(matchedCentre.id);
        const displayName =
          role === 'centre_owner'
            ? matchedCentre.owner_name
            : `${matchedCentre.name} Staff`;

        onLoginSuccess(role, displayName);
        return;
      }

      // If active centre matches
      if (centre && (centre.owner_phone === cleanPhone || centre.whatsapp_number === cleanPhone)) {
        onLoginSuccess(
          role,
          role === 'centre_owner' ? centre.owner_name : `${centre.name} Staff`
        );
        return;
      }

      setErrorMsg(
        `No registered coaching centre found with mobile "${cleanPhone}". Please check your number or register a new centre below.`
      );
    }, 400);
  };

  const handleDemoDirector = () => {
    setErrorMsg(null);
    // Switch to demo centre explicitly
    AppStorage.switchCentre(INITIAL_CENTRE.id);
    setPhone('9876543210');
    setPin('1234');
    setRole('centre_owner');
    onLoginSuccess('centre_owner', `${INITIAL_CENTRE.owner_name} (Sample Account)`);
  };

  const handleDemoTeacher = () => {
    setErrorMsg(null);
    AppStorage.switchCentre(INITIAL_CENTRE.id);
    setPhone('9823456781');
    setPin('1234');
    setRole('teacher');
    onLoginSuccess('teacher', 'Dr. Sunita Verma (Sample Account)');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-4 py-8">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Centre Branding Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-600/30">
            <GraduationCap className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {centre?.name || 'STUDENT CAREER APP'}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {centre?.tagline || 'Tuition & Coaching Portal'}
            {centre?.city ? ` • ${centre.city}` : ''}
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          {/* Role Selector Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-5">
            <button
              type="button"
              onClick={() => setRole('centre_owner')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                role === 'centre_owner'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Centre Owner / Admin
            </button>
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                role === 'teacher'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Teacher / Staff
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registered Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                  required
                  autoComplete="tel"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Security PIN / Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter PIN (e.g. 1234)"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white font-bold rounded-xl shadow-md text-sm flex items-center justify-center gap-2 transition disabled:opacity-70 mt-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Clearly Badged Demonstration Account for Evaluation */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Evaluation & Demo Mode
              </p>
              <span className="text-[9px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                Sample Data Only
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Need a test drive? Load the pre-configured sample academy:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleDemoDirector}
                className="py-2 px-2.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-800 font-medium text-xs rounded-xl border border-slate-200 hover:border-blue-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Demo Director</span>
              </button>
              <button
                type="button"
                onClick={handleDemoTeacher}
                className="py-2 px-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 font-medium text-xs rounded-xl border border-slate-200 hover:border-indigo-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Demo Teacher</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Switch Links */}
        <div className="flex justify-between items-center text-xs text-slate-500 px-2">
          <button
            onClick={onNavigateToRegister}
            className="hover:text-blue-700 font-semibold transition cursor-pointer"
          >
            + Register New Centre
          </button>
          <button
            onClick={onNavigateToActivation}
            className="hover:text-blue-700 font-medium flex items-center gap-1 transition text-blue-600 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Licence Activation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
