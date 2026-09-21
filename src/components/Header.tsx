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
  Users,
  ChevronDown,
  LayoutDashboard,
} from 'lucide-react';
import { getCurrentJalaliDate, formatJalaliDate, toPersianDigits } from '../utils/jalali';
import { soundManager } from '../utils/sound';
import { getNotifications } from '../utils/storage';
import { AppNotification, AthleteProfile } from '../types';

export type ActiveTab =
  | 'home'
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
  activeAthlete: AthleteProfile;
  onOpenAthleteManager: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeProgramName,
  isWorkoutInProgress,
  theme,
  onToggleTheme,
  activeAthlete,
  onOpenAthleteManager,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(soundManager.isSoundEnabled());
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(getNotifications());

  const currentJalali = getCurrentJalaliDate();
  const dateFormatted = formatJalaliDate(currentJalali, 'short');

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
    { id: 'home' as ActiveTab, label: 'داشبورد اصلی', icon: LayoutDashboard },
    { id: 'profile' as ActiveTab, label: 'پروفایل شاگرد', icon: User },
    { id: 'prompt' as ActiveTab, label: 'پرامپت هوشمند', icon: Sparkles },
    { id: 'import' as ActiveTab, label: 'برنامه‌ها و JSON', icon: FileCode2 },
    { id: 'tracker' as ActiveTab, label: 'اجرای تمرین', icon: PlayCircle, highlight: isWorkoutInProgress },
    { id: 'dashboard' as ActiveTab, label: 'آنالیز هایپرتروفی', icon: BarChart3 },
    { id: 'calendar' as ActiveTab, label: 'تقویم جلالی', icon: Calendar },
  ];

  const isLight = theme === 'light';

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md border-b shadow-md transition-colors w-full overflow-x-hidden ${
        isLight
          ? 'bg-white/95 border-slate-200 shadow-slate-200/50 text-slate-800'
          : 'bg-[#0d111a]/95 border-slate-800/80 shadow-black/40 text-slate-100'
      }`}
    >
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2">
          
          {/* Logo & Title (Clicking navigates to Home) */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer min-w-0"
          >
            <div className="relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 shadow-lg shadow-amber-500/20 border border-amber-400/40 shrink-0">
              <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-black rotate-[-15deg]" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-sky-500 rounded-full flex items-center justify-center border border-white">
                <Zap className="w-2 h-2 text-white" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className={`text-sm sm:text-base md:text-lg font-black tracking-tight truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  دستیار مربیگری
                </h1>
                <span className="text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                  AI Coach
                </span>
              </div>
              <p className={`text-[10px] hidden md:block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                طراحی برنامه علمی و مدیریت شاگردان
              </p>
            </div>
          </div>

          {/* Active Athlete Quick Switcher Button */}
          <button
            onClick={onOpenAthleteManager}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-2xl border transition-all cursor-pointer shrink-0 max-w-[170px] sm:max-w-[220px] ${
              isLight
                ? 'bg-amber-50 border-amber-200 text-amber-950 hover:bg-amber-100'
                : 'bg-gradient-to-r from-amber-500/10 to-amber-500/20 border-amber-500/40 text-amber-300 hover:border-amber-400'
            }`}
            title="مدیریت شاگردان و تغییر سریع پروفایل"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
              {activeAthlete.name.charAt(0) || 'ش'}
            </div>
            <div className="text-right min-w-0 flex-1">
              <div className="text-[9px] sm:text-[10px] text-slate-400 font-medium leading-none truncate">شاگرد:</div>
              <div className="text-xs sm:text-sm font-bold truncate">
                {activeAthlete.name}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 opacity-70 shrink-0" />
          </button>

          {/* Right Action Tools: Theme Toggle, Sound Toggle, Notifications */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* Theme Toggle (Light / Dark) */}
            <button
              id="header-theme-toggle-btn"
              onClick={onToggleTheme}
              title={isLight ? 'تغییر به تم تاریک' : 'تغییر به تم روشن'}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
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
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
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
                className={`relative p-2 rounded-xl border transition-colors cursor-pointer ${
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
                  className={`absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 sm:w-80 border rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-800'
                      : 'bg-[#161b26] border-slate-700/80 text-slate-100'
                  }`}
                >
                  <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
                    <h3 className={`text-xs sm:text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      <Bell className="w-4 h-4 text-amber-500" />
                      اعلان‌ها و توصیه‌ها
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-sky-500 hover:underline cursor-pointer font-bold"
                      >
                        خوانده شد
                      </button>
                    )}
                  </div>
                  <div className={`divide-y max-h-64 overflow-y-auto mt-2 ${isLight ? 'divide-slate-100' : 'divide-slate-800'}`}>
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`py-2 px-1.5 rounded-lg transition-colors ${
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
                          <span className="text-[10px] text-slate-400">{n.timestamp}</span>
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

        {/* Desktop Navigation Tabs Bar */}
        <nav className={`hidden lg:flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none border-t pt-1.5 ${
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
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                } ${item.highlight && !isActive ? 'ring-1 ring-emerald-500 text-emerald-500 bg-emerald-500/10 animate-pulse' : ''}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : item.highlight ? 'text-emerald-500' : isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.highlight && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-black text-amber-400' : 'bg-emerald-500 text-black font-bold'}`}>
                    تمرین فعال
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
