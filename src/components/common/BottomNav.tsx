import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CreditCard,
  Clock,
  FileText,
  Settings,
} from 'lucide-react';
import { ActiveScreen } from '../../types';

interface BottomNavProps {
  currentScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  const navItems = [
    { id: 'dashboard' as ActiveScreen, label: 'Home', icon: LayoutDashboard },
    { id: 'students' as ActiveScreen, label: 'Students', icon: Users },
    { id: 'attendance' as ActiveScreen, label: 'Attendance', icon: CalendarCheck },
    { id: 'fees' as ActiveScreen, label: 'Fees', icon: CreditCard },
    { id: 'timetable' as ActiveScreen, label: 'Schedule', icon: Clock },
    { id: 'reports' as ActiveScreen, label: 'Reports', icon: FileText },
    { id: 'settings' as ActiveScreen, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-blue-700 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-700 shadow-sm' : 'bg-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-semibold text-blue-800' : 'font-normal'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
