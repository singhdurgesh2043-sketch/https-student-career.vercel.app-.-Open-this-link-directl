import React, { useEffect, useState } from 'react';
import { GraduationCap, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + 5;
      });
    }, 60);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 flex flex-col items-center justify-between p-8 text-white select-none">
      <div className="w-full flex justify-end">
        <button
          onClick={onComplete}
          className="text-xs font-medium text-blue-200/80 hover:text-white bg-white/10 px-3 py-1.5 rounded-full flex items-center gap-1 transition"
        >
          Skip <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Brand Logo & Title */}
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-1 shadow-2xl shadow-blue-500/30 flex items-center justify-center animate-bounce-slow">
            <div className="w-full h-full bg-blue-900/60 rounded-[22px] flex items-center justify-center backdrop-blur-sm border border-white/20">
              <GraduationCap className="w-14 h-14 text-white" />
            </div>
          </div>
          <div className="absolute -top-1 -right-1 bg-amber-400 text-blue-950 p-1 rounded-full shadow-lg">
            <Sparkles className="w-4 h-4 fill-amber-400" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          STUDENT CAREER
        </h1>
        <p className="text-sm font-medium text-blue-200/90 max-w-xs leading-relaxed">
          Comprehensive Tuition & Coaching Centre Management System
        </p>

        {/* License Pill */}
        <div className="mt-5 inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-semibold text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>One-Time Lifetime License</span>
        </div>
      </div>

      {/* Bottom Loading Progress */}
      <div className="w-full max-w-xs space-y-3">
        <div className="h-1.5 w-full bg-blue-950/80 rounded-full overflow-hidden border border-white/10 p-[1px]">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-blue-300/80 font-medium">
          <span>Initializing modules...</span>
          <span>{progress}%</span>
        </div>
        <p className="text-center text-[10px] text-blue-400/60">
          v1.0.0 • com.studentcareer.app
        </p>
      </div>
    </div>
  );
};
