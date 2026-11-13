import React, { useState } from 'react';
import { GraduationCap, Lock, Phone, ArrowRight, UserCheck, ShieldCheck, Sparkles } from 'lucide-react';
import { CentreProfile } from '../types';

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
  const [phone, setPhone] = useState(centre.owner_phone || '9876543210');
  const [pin, setPin] = useState('1234');
  const [role, setRole] = useState<'centre_owner' | 'teacher'>('centre_owner');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(role, role === 'centre_owner' ? (centre.owner_name || 'Prof. Rajesh Sharma') : 'Dr. Sunita Verma');
    }, 400);
  };

  const handleDemoDirector = () => {
    setRole('centre_owner');
    setPhone(centre.owner_phone || '9876543210');
    setPin('1234');
    onLoginSuccess('centre_owner', centre.owner_name || 'Prof. Rajesh Sharma');
  };

  const handleDemoTeacher = () => {
    setRole('teacher');
    setPhone('9823456781');
    setPin('1234');
    onLoginSuccess('teacher', 'Dr. Sunita Verma (Teacher)');
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
            {centre.name || 'STUDENT CAREER'}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {centre.tagline || 'Tuition & Coaching Portal'} • {centre.city || 'India'}
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          {/* Role Selector Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setRole('centre_owner')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
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
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
                role === 'teacher'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Teacher / Staff
            </button>
          </div>

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
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter 10-digit mobile"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                  required
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
                  placeholder="Enter PIN (Default: 1234)"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white font-bold rounded-xl shadow-md text-sm flex items-center justify-center gap-2 transition disabled:opacity-70 mt-2"
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

          {/* Quick Demo Access Buttons for School Presentation */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
              Quick Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDemoDirector}
                className="py-2 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 font-medium text-xs rounded-xl border border-blue-200 flex items-center justify-center gap-1.5 transition"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Director Login</span>
              </button>
              <button
                type="button"
                onClick={handleDemoTeacher}
                className="py-2 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-medium text-xs rounded-xl border border-indigo-200 flex items-center justify-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Teacher Login</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Switch Links */}
        <div className="flex justify-between items-center text-xs text-slate-500 px-2">
          <button
            onClick={onNavigateToRegister}
            className="hover:text-blue-700 font-medium transition"
          >
            Register New Centre
          </button>
          <button
            onClick={onNavigateToActivation}
            className="hover:text-blue-700 font-medium flex items-center gap-1 transition text-blue-600"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Licence Activation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
