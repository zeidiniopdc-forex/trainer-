import React from 'react';
import {
  Users,
  UserCheck,
  UserPlus,
  Sparkles,
  FileCode2,
  PlayCircle,
  BarChart3,
  Calendar,
  Flame,
  Dumbbell,
  Scale,
  TrendingUp,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronDown,
  Activity,
  Layers,
  Clock,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { AthleteProfile, WorkoutProgram, WorkoutSessionLog } from '../types';
import { toPersianDigits, getCurrentJalaliDate, formatJalaliDate } from '../utils/jalali';
import { ActiveTab } from './Header';

interface HomeDashboardViewProps {
  athletes: AthleteProfile[];
  activeAthlete: AthleteProfile;
  onSelectAthlete: (athleteId: string) => void;
  onOpenAthleteManager: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
  activeProgram: WorkoutProgram;
  sessionLogs: WorkoutSessionLog[];
  theme: 'dark' | 'light';
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  athletes,
  activeAthlete,
  onSelectAthlete,
  onOpenAthleteManager,
  onNavigateTab,
  activeProgram,
  sessionLogs,
  theme,
}) => {
  const isLight = theme === 'light';
  const currentDate = getCurrentJalaliDate();

  const getGoalTitle = (goal: string) => {
    switch (goal) {
      case 'hypertrophy':
        return 'هایپرتروفی و حجم عضلانی';
      case 'fat_loss':
        return 'چربی‌سوزی و کات';
      case 'strength':
        return 'افزایش قدرت حداکثری';
      case 'recomposition':
        return 'ریکامپوزیشن (عضله‌سازی همزمان)';
      case 'contest_prep':
        return 'آماده‌سازی مسابقات';
      default:
        return 'آمادگی جسمانی عمومی';
    }
  };

  const getExperienceLabel = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'مبتدی (کمتر از ۱ سال)';
      case 'intermediate':
        return 'متوسط (۱ تا ۳ سال)';
      case 'advanced':
        return 'پیشرفته (۳ تا ۵ سال)';
      case 'elite':
        return 'حرفه‌ای و مسابقه‌ای';
      default:
        return 'متوسط';
    }
  };

  const bmi = activeAthlete.heightCm
    ? (activeAthlete.weightKg / Math.pow(activeAthlete.heightCm / 100, 2)).toFixed(1)
    : '۰';

  const totalTonnage = sessionLogs.reduce((acc, log) => acc + (log.totalVolumeTonnageKg || 0), 0);
  const totalSets = sessionLogs.reduce((acc, log) => acc + (log.totalSetsCompleted || 0), 0);
  const completedSessions = sessionLogs.length;

  const cardBg = isLight
    ? 'bg-white border-slate-200 text-slate-800 shadow-sm hover:shadow-md'
    : 'bg-[#131722] border-slate-800 text-slate-100 shadow-lg hover:border-slate-700';

  const innerBg = isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#181e2b] border-slate-800/80';

  // Navigation Hub Modules List
  const modules = [
    {
      id: 'profile' as ActiveTab,
      title: 'پروفایل و پرونده شاگرد',
      desc: 'مشخصات بدنی، اهداف، محدودیت‌های پزشکی، سایزگیری و رکوردهای ۱RM',
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      tag: 'اطلاعات آنتروپومتری',
      badgeColor: isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    },
    {
      id: 'prompt' as ActiveTab,
      title: 'ژنراتور پرامپت هوشمند',
      desc: 'ساخت پرامپت مهندسی‌شده بر پایه اصول RP و Schoenfeld برای ارسال به هوش مصنوعی',
      icon: Sparkles,
      color: 'from-amber-500 to-amber-600',
      tag: 'هوش مصنوعی Gemini & ChatGPT',
      badgeColor: isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    },
    {
      id: 'import' as ActiveTab,
      title: 'مدیریت برنامه‌ها و واردسازی JSON',
      desc: 'مشاهده روزها و حرکات تمرینی، وارد کردن کد JSON برنامه و خروجی اکسل/متنی',
      icon: FileCode2,
      color: 'from-emerald-500 to-teal-600',
      tag: `${activeProgram?.days?.length ? toPersianDigits(activeProgram.days.length) + ' روز فعال' : 'برنامه فعال'}`,
      badgeColor: isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'tracker' as ActiveTab,
      title: 'اجرای زنده تمرین و تایمر استراحت',
      desc: 'ثبت ست به ست وزنه‌ها و تکرارها با شمارش معکوس صوتی، محاسبه RPE و بار کاری',
      icon: PlayCircle,
      color: 'from-rose-500 to-orange-600',
      tag: 'تایمر صوتی و RIR',
      badgeColor: isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    },
    {
      id: 'dashboard' as ActiveTab,
      title: 'داشبورد و آنالیز هایپرتروفی',
      desc: 'پایش لندمارک‌های حجمی (MEV, MAV, MRV)، نمودار تناژ وزنه و تغییرات دور عضلات',
      icon: BarChart3,
      color: 'from-purple-500 to-pink-600',
      tag: 'تحلیل داده‌های زیستی',
      badgeColor: isLight ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    },
    {
      id: 'calendar' as ActiveTab,
      title: 'تقویم جلالی و یادآورها',
      desc: 'زمان‌بندی روزهای تمرینی، یادآور ثبت وزن ناشتا، سایزگیری و بررسی دوره‌ای',
      icon: Calendar,
      color: 'from-cyan-500 to-blue-600',
      tag: 'گاه‌شمار خورشیدی',
      badgeColor: isLight ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    },
  ];

  return (
    <div className="w-full max-w-full space-y-6 pb-6 overflow-x-hidden">
      
      {/* 1. Hero Athlete Switcher & Quick Profile Overview Banner */}
      <div
        className={`w-full rounded-3xl border p-4 sm:p-6 lg:p-8 transition-all overflow-hidden relative ${
          isLight
            ? 'bg-gradient-to-br from-amber-50/90 via-white to-slate-50 border-amber-200/80 shadow-md'
            : 'bg-gradient-to-br from-[#161c28] via-[#121622] to-[#0e121a] border-slate-800 shadow-xl'
        }`}
      >
        {/* Background glow subtle */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col gap-6">
          
          {/* Header Row of Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-black flex items-center justify-center font-extrabold text-lg sm:text-xl shadow-lg shadow-amber-500/20 shrink-0">
                {activeAthlete.name.charAt(0) || 'ش'}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg sm:text-2xl font-black truncate">
                    {activeAthlete.name}
                  </h2>
                  <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                    شاگرد فعال
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {getGoalTitle(activeAthlete.primaryGoal)} • {getExperienceLabel(activeAthlete.experienceLevel)}
                </p>
              </div>
            </div>

            {/* Quick Action Button for Athlete Manager */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
              <button
                onClick={onOpenAthleteManager}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-sm'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-amber-300 border-amber-500/30'
                }`}
              >
                <Users className="w-4 h-4 text-amber-500" />
                <span>تغییر یا افزودن شاگرد</span>
              </button>
            </div>
          </div>

          {/* Athlete Quick Switcher Carousel / Badges */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500 dark:text-slate-400">
                انتخاب مستقیم شاگرد از لیست ({toPersianDigits(athletes.length)} شاگرد):
              </span>
              <button
                onClick={onOpenAthleteManager}
                className="text-[11px] text-amber-500 hover:underline font-bold"
              >
                مدیریت پیشرفته
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none w-full">
              {athletes.map((ath) => {
                const isSelected = ath.id === activeAthlete.id;
                return (
                  <button
                    key={ath.id}
                    onClick={() => onSelectAthlete(ath.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20 ring-2 ring-amber-400/50'
                        : isLight
                          ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                          : 'bg-[#181f2c] hover:bg-[#1f283a] text-slate-300 border-slate-800'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                        isSelected
                          ? 'bg-black text-amber-400'
                          : isLight
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {ath.name.charAt(0) || 'ش'}
                    </div>
                    <span>{ath.name}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Metrics Bar for Active Athlete */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 pt-2 border-t border-slate-200 dark:border-slate-800/80">
            <div className={`p-3 rounded-2xl border flex flex-col justify-between ${innerBg}`}>
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>سن و جنسیت</span>
                <Users className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="text-sm sm:text-base font-bold font-mono mt-1">
                {toPersianDigits(activeAthlete.age)} سال • {activeAthlete.gender === 'male' ? 'مرد' : 'زن'}
              </div>
            </div>

            <div className={`p-3 rounded-2xl border flex flex-col justify-between ${innerBg}`}>
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>قد و وزن</span>
                <Scale className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-sm sm:text-base font-bold font-mono mt-1">
                {toPersianDigits(activeAthlete.heightCm)} cm / {toPersianDigits(activeAthlete.weightKg)} kg
              </div>
            </div>

            <div className={`p-3 rounded-2xl border flex flex-col justify-between ${innerBg}`}>
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>شاخص BMI</span>
                <Activity className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-sm sm:text-base font-bold font-mono mt-1 text-purple-500 dark:text-purple-400">
                {toPersianDigits(bmi)}
              </div>
            </div>

            <div className={`p-3 rounded-2xl border flex flex-col justify-between ${innerBg}`}>
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>تواتر تمرینی</span>
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-sm sm:text-base font-bold font-mono mt-1 text-emerald-600 dark:text-emerald-400">
                {toPersianDigits(activeAthlete.weeklyDays)} روز / هفته
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bento Grid - All Application Sections */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-500" />
            <h3 className="text-base sm:text-lg font-bold">بخش‌های اصلی و امکانات مربیگری</h3>
          </div>
          <span className="text-xs text-slate-500">برای ورود، روی هر کارت کلیک کنید</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => onNavigateTab(mod.id)}
                className={`border rounded-3xl p-5 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${cardBg}`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${mod.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <span className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-xl border ${mod.badgeColor}`}>
                      {mod.tag}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors flex items-center gap-1.5">
                      <span>{mod.title}</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {mod.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-2 flex items-center justify-between text-xs font-bold text-amber-500 group-hover:translate-x-1 transition-transform border-t border-slate-100 dark:border-slate-800/60">
                  <span>ورود به این بخش</span>
                  <ChevronLeft className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Quick Performance Snapshot & Active Program Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Active Program Card */}
        <div className={`border rounded-3xl p-5 sm:p-6 space-y-4 ${cardBg}`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-emerald-500" />
              <h4 className="text-sm sm:text-base font-bold">برنامه تمرینی فعال</h4>
            </div>
            <button
              onClick={() => onNavigateTab('import')}
              className="text-xs text-emerald-500 hover:underline font-bold"
            >
              مشاهده کامل
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <h5 className="text-base font-bold text-slate-900 dark:text-white">
                {activeProgram.program_name}
              </h5>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                <span>طول دوره: {activeProgram.duration}</span>
                <span>•</span>
                <span>تعداد روزها: {toPersianDigits(activeProgram.days.length)} روز در هفته</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {activeProgram.days.slice(0, 4).map((d, i) => (
                <div key={i} className={`p-2.5 rounded-xl border text-xs ${innerBg}`}>
                  <div className="font-bold truncate">{d.day}</div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {d.muscle_groups.join('، ')}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={() => onNavigateTab('tracker')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <PlayCircle className="w-4 h-4" />
                <span>شروع جلسه تمرین از این برنامه</span>
              </button>
            </div>
          </div>
        </div>

        {/* Progress & Landmarks Snapshot */}
        <div className={`border rounded-3xl p-5 sm:p-6 space-y-4 ${cardBg}`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <h4 className="text-sm sm:text-base font-bold">خلاصه وضعیت و حجم تمرین</h4>
            </div>
            <button
              onClick={() => onNavigateTab('dashboard')}
              className="text-xs text-purple-500 hover:underline font-bold"
            >
              آنالیز کامل
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className={`p-3 rounded-2xl border ${innerBg}`}>
              <span className="text-[10px] sm:text-[11px] text-slate-400 block">تناژ کل</span>
              <span className="text-sm sm:text-base font-black font-mono text-amber-500 mt-1 block">
                {toPersianDigits(totalTonnage.toLocaleString())}
              </span>
              <span className="text-[9px] text-slate-500 block">کیلوگرم</span>
            </div>

            <div className={`p-3 rounded-2xl border ${innerBg}`}>
              <span className="text-[10px] sm:text-[11px] text-slate-400 block">جلسات انجام‌شده</span>
              <span className="text-sm sm:text-base font-black font-mono text-emerald-500 mt-1 block">
                {toPersianDigits(completedSessions)}
              </span>
              <span className="text-[9px] text-slate-500 block">جلسه ثبت‌شده</span>
            </div>

            <div className={`p-3 rounded-2xl border ${innerBg}`}>
              <span className="text-[10px] sm:text-[11px] text-slate-400 block">ست‌های مؤثر</span>
              <span className="text-sm sm:text-base font-black font-mono text-sky-500 mt-1 block">
                {toPersianDigits(totalSets)}
              </span>
              <span className="text-[9px] text-slate-500 block">ست سنگین</span>
            </div>
          </div>

          <div className={`p-3 rounded-2xl border space-y-1.5 text-xs ${innerBg}`}>
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1 text-amber-500">
                <Flame className="w-3.5 h-3.5" />
                وضعیت لندمارک‌های حجمی
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {completedSessions > 0 ? 'محدوده MAV بهینه' : 'آماده ثبت اولین جلسه'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              تعداد ست‌های هفتگی برای تمام گروه‌های اصلی در دامنه بیشترین انطباق هایپرتروفیک (Maximum Adaptive Volume) محاسبه می‌شود.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
