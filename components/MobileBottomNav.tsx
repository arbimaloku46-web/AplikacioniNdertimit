import React from 'react';
import { LayoutDashboard, User } from 'lucide-react';
import { AppView } from '../types';

interface MobileBottomNavProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  text: any;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentView, setCurrentView, text }) => {
  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm pointer-events-none">
      <div className="flex items-center justify-around bg-slate-900/60 border border-white/5 shadow-md shadow-black/40 rounded-lg p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] pointer-events-auto">
        <button onClick={() => setCurrentView(AppView.HOME)} className={`flex flex-col items-center justify-center w-1/2 py-2 rounded-md transition-all ${currentView === AppView.HOME ? 'bg-white/10 shadow-inner' : 'opacity-70 hover:opacity-100'}`}>
          <LayoutDashboard className={`w-5 h-5 mb-1 ${currentView === AppView.HOME ? 'text-brand-blue' : 'text-slate-500'}`} />
          <span className={`text-sm font-medium tracking-wider ${currentView === AppView.HOME ? 'text-white' : 'text-slate-500'}`}>
            Progress Suite
          </span>
        </button>
        <button onClick={() => setCurrentView(AppView.PROFILE)} className={`flex flex-col items-center justify-center w-1/2 py-2 rounded-md transition-all ${currentView === AppView.PROFILE ? 'bg-white/10 shadow-inner' : 'opacity-70 hover:opacity-100'}`}>
          <User className={`w-5 h-5 mb-1 ${currentView === AppView.PROFILE ? 'text-brand-blue' : 'text-slate-500'}`} />
          <span className={`text-sm font-medium tracking-wider ${currentView === AppView.PROFILE ? 'text-white' : 'text-slate-500'}`}>
            {text.profile}
          </span>
        </button>
      </div>
    </div>
  );
};
