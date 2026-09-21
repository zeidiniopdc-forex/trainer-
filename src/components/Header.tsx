import React, { useState } from 'react';
import {
  Dumbbell,
  Sparkles,
  FileCode2,
  PlayCircle,
  BarChart3,
  Calendar,
  Volume2,
  VolumeX,
  Bell,
  User,
  Zap,
  Sun,
  Moon,
} from 'lucide-react';
import { getCurrentJalaliDate, formatJalaliDate, toPersianDigits } from '../utils/jalali';
import { soundManager } from '../utils/sound';
import { getNotifications } from '../utils/storage';
import { AppNotification } from '../types';

export type ActiveTab =
  | 'profile'
  | 'prompt'
  | 'import'
  | 'tracker'
  | 'dashboard'
  | 'calendar';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeProgramName?: string;
  isWorkoutInProgress?: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeProgramName,
  isWorkoutInProgress,
  theme,
  onToggleTheme,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(soundManager.isSoundEnabled());
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(getNotifications());

  const currentJalali = getCurrentJalaliDate();
  const dateFormatted = formatJalaliDate(currentJalali, 'full');

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.setSoundEnabled(next);
    if (next) soundManager.playCountdownTick(1000);
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    { id: 'profile' as ActiveTab, label: 'پروفایل ورزشکار', icon: User },
    { id: 'prompt' as ActiveTab, label: 'ژنراتور پرامپت هوش مصنوعی', icon: Sparkles },
    { id: 'import' as ActiveTab, label: 'واردسازی برنامه JSON', icon: FileCode2 },
    { id: 'tracker' as ActiveTab, label: 'اجرای تمرین', icon: PlayCircle, highlight: isWorkoutInProgress },
    { id: 'dashboard' as ActiveTab, label: 'داشبورد و آنالیز', icon: BarChart3 },
    { id: 'calendar' as ActiveTab, label: 'تقویم جلالی', icon: Calendar },
  ];

  const isLight = theme === 'light';

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md border-b shadow-md transition-colors ${
        isLight
          ? 'bg-white/95 border-slate-200 shadow-slate-200/50 text-slate-800'
          : 'bg-[#0d111a]/95 border-slate-800/80 shadow-black/40 text-slate-100'
      }`}
    >
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Persian Title */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 shadow-lg shadow-amber-500/20 border border-amber-400/40">
              <Dumbbell className="w-6 h-6 text-black rotate-[-15deg]" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-sky-500 rounded-full flex items-center justify-center border border-white">
                <Zap className="w-2.5 h-2.5 text-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-lg sm:text-xl font-bold tracking-tight flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <span>دستیار هوشمند مربیگری بدنسازی</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    AI Coach
                  </span>
                </h1>
              </div>
              <p className={`text-xs hidden sm:block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                طراحی برنامه علمی، محاسبه هایپرتروفی و مدیریت هوشمند دوره‌های تمرین
              </p>
            </div>
          </div>

          {/* Center Info: Jalali Date & Active Program */}
          <div className={`hidden lg:flex items-center gap-4 px-3.5 py-1.5 rounded-xl text-xs border ${
            isLight
              ? 'bg-slate-100/90 border-slate-200'
              : 'bg-slate-900/80 border-slate-800'
          }`}>
            <div className={`flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              <Calendar className="w-4 h-4 text-sky-500" />
              <span>{dateFormatted}</span>
            </div>
            {activeProgramName && (
              <div className={`flex items-center gap-1.5 border-r pr-4 font-medium ${
                isLight ? 'border-slate-300 text-amber-700' : 'border-slate-700 text-amber-400'
              }`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="truncate max-w-[220px]">{activeProgramName}</span>
              </div>
            )}
          </div>

          {/* Action Tools: Theme Toggle, Sound Toggle, Notifications */}
          <div className="flex items-center gap-2">
            
            {/* Theme Toggle (Light / Dark) */}
            <button
              id="header-theme-toggle-btn"
              onClick={onToggleTheme}
              title={isLight ? 'تغییر به تم تاریک' : 'تغییر به تم روشن'}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isLight
                  ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:text-slate-900'
                  : 'bg-slate-800/80 text-amber-300 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {isLight ? (
                <Moon className="w-4 h-4 text-slate-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Sound Toggle */}
            <button
              id="header-sound-toggle-btn"
              onClick={toggleSound}
              title={soundEnabled ? 'صداهای راهنما فعال است' : 'صداها غیرفعال است'}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                soundEnabled
                  ? isLight
                    ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                  : isLight
                    ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                id="header-notifications-btn"
                onClick={() => setShowNotifs(!showNotifs)}
                className={`relative p-2.5 rounded-xl border transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                    : 'bg-slate-800/70 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                    {toPersianDigits(unreadCount)}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifs && (
                <div
                  className={`absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 border rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-800'
                      : 'bg-[#161b26] border-slate-700/80 text-slate-100'
                  }`}
                >
                  <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
                    <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      <Bell className="w-4 h-4 text-amber-500" />
                      اعلان‌ها و توصیه‌های هوش مصنوعی
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-sky-500 hover:underline cursor-pointer"
                      >
                        خوانده شد
                      </button>
                    )}
                  </div>
                  <div className={`divide-y max-h-72 overflow-y-auto mt-2 ${isLight ? 'divide-slate-100' : 'divide-slate-800'}`}>
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`py-2.5 px-2 rounded-lg transition-colors ${
                          n.read
                            ? 'opacity-70'
                            : isLight
                              ? 'bg-amber-50/70'
                              : 'bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-xs font-semibold flex items-center gap-1.5 ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>
                            {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
                            {n.title}
                          </h4>
                          <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>{n.timestamp}</span>
                        </div>
                        <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className={`flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none border-t pt-1.5 ${
          isLight ? 'border-slate-200' : 'border-slate-800/50'
        }`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-bold'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                } ${item.highlight && !isActive ? 'ring-1 ring-emerald-500 text-emerald-500 bg-emerald-500/10 animate-pulse' : ''}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : item.highlight ? 'text-emerald-500' : isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.highlight && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-black text-amber-400' : 'bg-emerald-500 text-black font-bold'}`}>
                    فعال
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
