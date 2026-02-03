
import React from 'react';
import { Home, PackagePlus, User } from 'lucide-react';
import { ViewType } from '../types';

interface BottomNavProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, onViewChange }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'create', icon: PackagePlus, label: 'Create' },
    { id: 'profile', icon: User, label: 'Profile' },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/90 backdrop-blur-xl border-t border-slate-100 h-20 px-10 flex items-center justify-between z-50 shadow-[0_-1px_15px_rgba(0,0,0,0.08)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeView === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all flex-1 ${
              isActive ? 'text-indigo-600' : 'text-slate-400'
            }`}
          >
            <div className={`p-2 rounded-2xl transition-all ${isActive ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
              <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
            </div>
            <span className={`text-[10px] font-extrabold uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-70'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
