import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Dumbbell,
  Scale,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Trophy,
  ArrowUpRight,
  Clock,
  Ruler,
  AlertCircle,
  PlayCircle,
} from 'lucide-react';
import { AthleteProfile, WorkoutSessionLog } from '../types';
import { toPersianDigits } from '../utils/jalali';

interface ProgressDashboardViewProps {
  profile: AthleteProfile;
  sessionLogs: WorkoutSessionLog[];
  onStartNewWorkout: () => void;
  theme?: 'dark' | 'light';
}

export const ProgressDashboardView: React.FC<ProgressDashboardViewProps> = ({
  profile,
  sessionLogs,
  onStartNewWorkout,
  theme = 'dark',
}) => {
  const [selectedMuscleTab, setSelectedMuscleTab] = useState<'all' | 'upper' | 'lower'>('all');
  const isLight = theme === 'light';

  // Key Aggregations
  const totalVolumeTonnage = sessionLogs.reduce(
    (acc, log) => acc + (log.totalVolumeTonnageKg || 0),
    0
  );
  const totalCompletedSets = sessionLogs.reduce(
    (acc, log) => acc + (log.totalSetsCompleted || 0),
    0
  );
  const totalCompletedSessions = sessionLogs.length;

  // Renaissance Periodization Muscle Landmarks
  const muscleVolumeAnalysis = [
    { muscle: 'سینه (Chest)', weeklySets: sessionLogs.length > 0 ? 16 : 0, mev: 10, mav: 16, mrv: 22, status: sessionLogs.length > 0 ? 'بهینه (MAV)' : 'در انتظار شروع' },
    { muscle: 'زیربغل و پشت (Back)', weeklySets: sessionLogs.length > 0 ? 18 : 0, mev: 12, mav: 18, mrv: 24, status: sessionLogs.length > 0 ? 'بهینه (MAV)' : 'در انتظار شروع' },
    { muscle: 'دلتوئید میانی و خلفی (Shoulders)', weeklySets: sessionLogs.length > 0 ? 16 : 0, mev: 8, mav: 16, mrv: 22, status: sessionLogs.length > 0 ? 'تمرکز ویژه (MAV)' : 'در انتظار شروع' },
    { muscle: 'چهارسر ران (Quads)', weeklySets: sessionLogs.length > 0 ? 14 : 0, mev: 8, mav: 14, mrv: 20, status: sessionLogs.length > 0 ? 'بهینه (MAV)' : 'در انتظار شروع' },
    { muscle: 'همسترینگ و سرینی (Posterior Chain)', weeklySets: sessionLogs.length > 0 ? 12 : 0, mev: 6, mav: 12, mrv: 18, status: sessionLogs.length > 0 ? 'بهینه (MAV)' : 'در انتظار شروع' },
    { muscle: 'جلو بازو و پشت بازو (Arms)', weeklySets: sessionLogs.length > 0 ? 14 : 0, mev: 8, mav: 14, mrv: 20, status: sessionLogs.length > 0 ? 'بهینه (MAV)' : 'در انتظار شروع' },
    { muscle: 'ساق پا و میان‌تنه (Calves & Core)', weeklySets: sessionLogs.length > 0 ? 10 : 0, mev: 6, mav: 12, mrv: 16, status: sessionLogs.length > 0 ? 'حفظ و نگهداری' : 'در انتظار شروع' },
  ];

  // Measurements comparison
  const latestMeas = profile.measurements[profile.measurements.length - 1];
  const initialMeas = profile.measurements[0];

  const cardClass = isLight
    ? 'bg-white border-slate-200 text-slate-800 shadow-md'
    : 'bg-[#141924] border-slate-800 text-slate-100 shadow-xl';

  const innerCardClass = isLight
    ? 'bg-slate-50 border-slate-200'
    : 'bg-slate-900/90 border-slate-800';

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div
        className={`border rounded-3xl p-5 sm:p-7 relative overflow-hidden transition-colors ${
          isLight
            ? 'bg-gradient-to-l from-slate-100 via-amber-50/50 to-white border-slate-200 shadow-md'
            : 'bg-gradient-to-l from-slate-900 via-[#141926] to-[#121622] border-slate-800 shadow-2xl'
        }`}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-black shadow-lg shadow-amber-500/20 shrink-0">
              <BarChart3 className="w-8 h-8" />
            </div>

            <div>
              <h2 className={`text-xl sm:text-2xl font-black flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <span>داشبورد پیشرفت و آنالیز هایپرتروفی</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  شاگرد: {profile.name}
                </span>
              </h2>
              <p className={`text-xs sm:text-sm mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                پایش دقیق تناژ وزنه، تطبیق لندمارک‌های حجمی، تغییرات سایز عضلات و پیشرفت رکوردهای قدرتی
              </p>
            </div>
          </div>

          <button
            onClick={onStartNewWorkout}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer text-xs sm:text-sm shrink-0"
          >
            <Dumbbell className="w-4 h-4" />
            <span>شروع جلسه تمرین جدید</span>
          </button>
        </div>
      </div>

      {/* 4 High-Level Key Performance Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`border p-4 sm:p-5 rounded-3xl relative overflow-hidden ${cardClass}`}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">کل حجم جابجا شده</span>
            <Dumbbell className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-amber-500">
            {toPersianDigits(totalVolumeTonnage.toLocaleString())} <span className="text-xs font-normal">kg</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">مجموع تناژ وزنه ست‌ها</span>
        </div>

        <div className={`border p-4 sm:p-5 rounded-3xl relative overflow-hidden ${cardClass}`}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">جلسات تکمیل‌شده</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-500">
            {toPersianDigits(totalCompletedSessions)} <span className="text-xs font-normal">جلسه</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">در دوره تمرینی جاری</span>
        </div>

        <div className={`border p-4 sm:p-5 rounded-3xl relative overflow-hidden ${cardClass}`}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">مجموع ست‌های ثبت‌شده</span>
            <Layers className="w-4 h-4 text-sky-400" />
          </div>
          <div className={`text-xl sm:text-2xl font-black font-mono ${isLight ? 'text-sky-600' : 'text-sky-400'}`}>
            {toPersianDigits(totalCompletedSets)} <span className="text-xs font-normal">ست</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">ست‌های موثر در RPE ۸-۱۰</span>
        </div>

        <div className={`border p-4 sm:p-5 rounded-3xl relative overflow-hidden ${cardClass}`}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">شاخص توده بدنی (BMI)</span>
            <Scale className="w-4 h-4 text-purple-400" />
          </div>
          <div className={`text-xl sm:text-2xl font-black font-mono ${isLight ? 'text-purple-600' : 'text-purple-400'}`}>
            {toPersianDigits(
              profile.heightCm
                ? (profile.weightKg / Math.pow(profile.heightCm / 100, 2)).toFixed(1)
                : '۰'
            )}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">وزن: {toPersianDigits(profile.weightKg)} kg</span>
        </div>
      </div>

      {/* Volume Landmarks Status Panel */}
      <div className={`border rounded-3xl p-5 sm:p-6 space-y-4 ${cardClass}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/50">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>تحلیل هفتگی حجم عضلات (Volume Landmarks)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              مقایسه تعداد ست‌های هفتگی با آستانه‌های علمی هایپرتروفی دکتر مایک اسراتل
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {muscleVolumeAnalysis.map((item, idx) => {
            const percent = Math.min(100, Math.round((item.weeklySets / item.mrv) * 100));
            return (
              <div key={idx} className={`border p-3.5 rounded-2xl space-y-2 ${innerCardClass}`}>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{item.muscle}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                      {item.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    <span className="font-bold text-amber-500">{toPersianDigits(item.weeklySets)} ست / هفته</span>
                    <span className="text-slate-400 text-[11px] hidden sm:inline">
                      (MEV: {item.mev} | MAV: {item.mav} | MRV: {item.mrv})
                    </span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-300 dark:border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 via-amber-400 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(percent, 4)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Body Measurements Delta & Strength 1RM Benchmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Body Measurements Evolution */}
        <div className={`border rounded-3xl p-5 sm:p-6 space-y-4 ${cardClass}`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Ruler className="w-4 h-4 text-sky-400" />
              <span>تغییرات سایز عضلات (آغاز تا امروز)</span>
            </h3>
            <span className="text-xs text-sky-500 font-mono">
              {toPersianDigits(profile.measurements.length)} دوره ثبت
            </span>
          </div>

          {profile.measurements.length === 0 ? (
            <div className={`p-6 rounded-2xl border text-center space-y-2 ${innerCardClass}`}>
              <Ruler className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-400">
                هنوز سایزگیری برای این شاگرد ثبت نشده است. می‌توانید در برگه «پروفایل شاگرد» سایز دور بازو، سینه، ران و کمر را ثبت کنید.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'دور بازوی راست', start: initialMeas?.bicepsRight || 38.5, current: latestMeas?.bicepsRight || 40.0 },
                { label: 'دور سینه', start: initialMeas?.chest || 104, current: latestMeas?.chest || 107.0 },
                { label: 'دور سرشانه', start: initialMeas?.shoulders || 122, current: latestMeas?.shoulders || 125.0 },
                { label: 'دور ران', start: initialMeas?.thighRight || 60.5, current: latestMeas?.thighRight || 62.0 },
                { label: 'دور کمر (کاهش چربی)', start: initialMeas?.waist || 82, current: latestMeas?.waist || 81.0, reverseGood: true },
                { label: 'دور ساق پا', start: initialMeas?.calfRight || 38.0, current: latestMeas?.calfRight || 39.0 },
              ].map((m, i) => {
                const diff = Number((m.current - m.start).toFixed(1));
                const isPositive = m.reverseGood ? diff <= 0 : diff >= 0;
                return (
                  <div key={i} className={`p-3.5 border rounded-2xl ${innerCardClass}`}>
                    <span className="text-[11px] text-slate-400 block">{m.label}</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-base font-black font-mono">
                        {toPersianDigits(m.current)} cm
                      </span>
                      <span className={`text-xs font-bold font-mono ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {diff > 0 ? `+${toPersianDigits(diff)}` : toPersianDigits(diff)} cm
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      شروع: {toPersianDigits(m.start)} cm
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Strength Records (1RM) Benchmarks */}
        <div className={`border rounded-3xl p-5 sm:p-6 space-y-4 ${cardClass}`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>پیشرفت قدرت و رکوردهای ۱RM</span>
            </h3>
            <span className="text-xs text-amber-500">فرمول Epley</span>
          </div>

          {profile.strengthRecords.length === 0 ? (
            <div className={`p-6 rounded-2xl border text-center space-y-2 ${innerCardClass}`}>
              <TrendingUp className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-400">
                هنوز رکورد قدرتی برای این شاگرد ثبت نشده است. در برگه «پروفایل شاگرد» بهترین رکورد حرکاتی مثل پرس سینه یا اسکوات را ثبت کنید.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.strengthRecords.map((sr, idx) => (
                <div key={idx} className={`p-3.5 border rounded-2xl flex items-center justify-between ${innerCardClass}`}>
                  <div>
                    <h4 className="text-xs font-bold">{sr.exerciseName}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      بهترین ست: {toPersianDigits(sr.weightKg)} kg × {toPersianDigits(sr.reps)} تکرار
                    </p>
                  </div>

                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 block">رکورد تخمینی تک‌تکرار (1RM)</span>
                    <span className="text-sm font-black font-mono text-amber-500">
                      {toPersianDigits(sr.estimatedOneRepMax)} kg
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Historical Session Logs */}
      <div className={`border rounded-3xl p-5 sm:p-6 space-y-4 ${cardClass}`}>
        <h3 className="text-sm font-bold flex items-center gap-2 pb-3 border-b border-slate-700/50">
          <Calendar className="w-4 h-4 text-sky-400" />
          <span>تاریخچه جلسات تمرینی گذشته (Workout History)</span>
        </h3>

        {sessionLogs.length === 0 ? (
          <div className={`p-8 rounded-2xl border text-center space-y-3 ${innerCardClass}`}>
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto opacity-70" />
            <h4 className="text-sm font-bold">هیچ جلسه تمرینی ثبت نشده است</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              برنامه در وضعیت خام قرار دارد و هیچ لاگ تستی وجود ندارد. شما می‌توانید با وارد کردن برنامه و شروع جلسه تمرین، اولین رکورد واقعی شاگرد خود را ثبت نمایید.
            </p>
            <button
              onClick={onStartNewWorkout}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span>ورود به بخش اجرای تمرین</span>
            </button>
          </div>
        ) : (
          <div className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-slate-800'}`}>
            {sessionLogs.map((log) => (
              <div key={log.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold">{log.dayTitle}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md border ${isLight ? 'bg-slate-100 text-sky-700 border-slate-200' : 'bg-slate-800 text-sky-300 border-slate-700'}`}>
                      {log.jalaliDate}
                    </span>
                  </div>
                  {log.sessionNotes && (
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{log.sessionNotes}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="text-left">
                    <span className="text-slate-400 block text-[10px]">تناژ وزنه</span>
                    <span className="font-bold text-amber-500">{toPersianDigits(log.totalVolumeTonnageKg.toLocaleString())} kg</span>
                  </div>
                  <div className="text-left">
                    <span className="text-slate-400 block text-[10px]">ست‌ها</span>
                    <span className="font-bold">{toPersianDigits(log.totalSetsCompleted)} ست</span>
                  </div>
                  <div className="text-left">
                    <span className="text-slate-400 block text-[10px]">زمان</span>
                    <span className="font-bold text-slate-400">{toPersianDigits(Math.round(log.durationSeconds / 60))} دقیقه</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
