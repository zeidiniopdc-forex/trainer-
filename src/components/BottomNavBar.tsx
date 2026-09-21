import React from 'react';
import {
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
      id: 'profile' as ActiveTab,
      label: 'شاگرد',
      icon: User,
    },
    {
      id: 'prompt' as ActiveTab,
      label: 'پرامپت هوشمند',
      icon: Sparkles,
    },
    {
      id: 'import' as ActiveTab,
      label: 'برنامه‌ها',
      icon: FileCode2,
    },
    {
      id: 'tracker' as ActiveTab,
      label: 'شروع تمرین',
      icon: PlayCircle,
      highlight: isWorkoutInProgress,
    },
    {
      id: 'dashboard' as ActiveTab,
      label: 'آنالیز',
      icon: BarChart3,
    },
    {
      id: 'calendar' as ActiveTab,
      label: 'تقویم',
      icon: Calendar,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden" dir="rtl">
      {/* Active Athlete floating micro pill */}
      <div className="flex justify-center -mb-2 relative z-10 pointer-events-none">
        <button
          onClick={onOpenAthleteManager}
          className={`pointer-events-auto px-3.5 py-1 rounded-full text-[11px] font-bold shadow-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
            isLight
              ? 'bg-amber-500 text-black border-amber-400'
              : 'bg-amber-500 text-black border-amber-400'
          }`}
        >
          <Users className="w-3 h-3" />
          <span>شاگرد: {activeAthleteName}</span>
          <span className="text-[10px] underline mr-1">تغییر</span>
        </button>
      </div>

      {/* Main Bar */}
      <nav
        className={`backdrop-blur-xl border-t shadow-[0_-4px_25px_rgba(0,0,0,0.3)] transition-colors px-2 py-2 flex items-center justify-around ${
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
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? isLight
                    ? 'text-amber-600 font-extrabold bg-amber-50'
                    : 'text-amber-400 font-extrabold bg-amber-500/10'
                  : isLight
                    ? 'text-slate-500 hover:text-slate-800'
                    : 'text-slate-400 hover:text-slate-200'
              } ${item.highlight && !isActive ? 'text-emerald-500 animate-pulse' : ''}`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110' : ''
                  } ${isActive ? (isLight ? 'text-amber-600' : 'text-amber-400') : ''}`}
                />
                {item.highlight && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[55px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
