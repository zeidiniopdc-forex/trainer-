import React from 'react';
import {
  LayoutDashboard,
  User,
  Sparkles,
  FileCode2,
  PlayCircle,
  BarChart3,
  Calendar,
  Users,
} from 'lucide-react';
import { ActiveTab } from './Header';

interface BottomNavBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAthleteManager: () => void;
  activeAthleteName: string;
  isWorkoutInProgress?: boolean;
  theme: 'dark' | 'light';
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAthleteManager,
  activeAthleteName,
  isWorkoutInProgress,
  theme,
}) => {
  const isLight = theme === 'light';

  const navButtons = [
    {
      id: 'home' as ActiveTab,
      label: 'داشبورد',
      icon: LayoutDashboard,
    },
    {
      id: 'profile' as ActiveTab,
      label: 'شاگرد',
      icon: User,
    },
    {
      id: 'prompt' as ActiveTab,
      label: 'پرامپت',
      icon: Sparkles,
    },
    {
      id: 'import' as ActiveTab,
      label: 'برنامه‌ها',
      icon: FileCode2,
    },
    {
      id: 'tracker' as ActiveTab,
      label: 'تمرین',
      icon: PlayCircle,
      highlight: isWorkoutInProgress,
    },
    {
      id: 'dashboard' as ActiveTab,
      label: 'آنالیز',
      icon: BarChart3,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden w-full" dir="rtl">
      {/* Active Athlete Floating Badge on Mobile */}
      <div className="flex justify-center -mb-1 relative z-10 pointer-events-none">
        <button
          onClick={onOpenAthleteManager}
          className={`pointer-events-auto px-3 py-1 rounded-full text-[10px] font-black shadow-lg border flex items-center gap-1.5 transition-all cursor-pointer truncate max-w-[85vw] ${
            isLight
              ? 'bg-amber-500 text-black border-amber-400 shadow-amber-500/20'
              : 'bg-amber-500 text-black border-amber-400 shadow-amber-500/30'
          }`}
        >
          <Users className="w-3 h-3 shrink-0" />
          <span className="truncate">شاگرد: {activeAthleteName}</span>
          <span className="opacity-75 text-[9px] mr-1 shrink-0 font-normal">| تغییر</span>
        </button>
      </div>

      {/* Main Bar */}
      <nav
        className={`backdrop-blur-xl border-t shadow-[0_-4px_25px_rgba(0,0,0,0.3)] transition-colors px-1 py-1.5 flex items-center justify-around w-full ${
          isLight
            ? 'bg-white/95 border-slate-200 text-slate-700'
            : 'bg-[#0e121a]/95 border-slate-800/90 text-slate-200'
        }`}
      >
        {navButtons.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? isLight
                    ? 'text-amber-700 font-black bg-amber-50'
                    : 'text-amber-400 font-black bg-amber-500/10'
                  : isLight
                    ? 'text-slate-500 hover:text-slate-800'
                    : 'text-slate-400 hover:text-slate-200'
              } ${item.highlight && !isActive ? 'text-emerald-500 animate-pulse' : ''}`}
            >
              <div className="relative">
                <Icon
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
                    isActive ? 'scale-110' : ''
                  } ${isActive ? (isLight ? 'text-amber-700' : 'text-amber-400') : ''}`}
                />
                {item.highlight && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight truncate max-w-[50px] leading-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
