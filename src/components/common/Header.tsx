import React from 'react';
import { Bell, GraduationCap, ShieldCheck, User } from 'lucide-react';
import { CentreProfile, ActiveScreen } from '../../types';

interface HeaderProps {
  centre: CentreProfile;
  currentScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
}

export const Header: React.FC<HeaderProps> = ({ centre, currentScreen, onNavigate }) => {
  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'dashboard':
        return centre.name || 'STUDENT CAREER';
      case 'students':
        return 'Student Directory';
      case 'attendance':
        return 'Daily Attendance';
      case 'fees':
        return 'Fees Management';
      case 'timetable':
        return 'Batches & Timetable';
      case 'reports':
        return 'Academic Progress';
      case 'settings':
        return 'Centre Settings';
      case 'superadmin':
        return 'Super Admin Portal';
      default:
        return 'STUDENT CAREER';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-md">
      <div className="max-w-md mx-auto px-4 py-3.5 flex items-center justify-between">
        {/* Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shadow-inner">
            <GraduationCap className="w-6 h-6 text-blue-200" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-tight truncate max-w-[200px]">
              {getScreenTitle()}
            </h1>
            <p className="text-[11px] text-blue-200/80 font-medium truncate max-w-[200px]">
              {centre.code || 'ONE-TIME LICENSE'} • {centre.city || 'India'}
            </p>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('settings')}
            title="Account & Licence"
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-blue-100 transition"
          >
            <User className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onNavigate('superadmin')}
            title="Super Admin Portal"
            className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 hover:bg-amber-500/30 active:scale-95 flex items-center justify-center transition"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
