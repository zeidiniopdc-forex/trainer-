import React from 'react';
import {
  Trophy,
  Flame,
  Clock,
  Dumbbell,
  CheckCircle2,
  Share2,
  Calendar,
  Sparkles,
  ArrowRight,
  Star,
} from 'lucide-react';
import { WorkoutSessionLog } from '../types';
import { toPersianDigits } from '../utils/jalali';
import confetti from 'canvas-confetti';

interface WorkoutSummaryModalProps {
  sessionLog: WorkoutSessionLog;
  onClose: () => void;
  onNavigateToDashboard: () => void;
}

export const WorkoutSummaryModal: React.FC<WorkoutSummaryModalProps> = ({
  sessionLog,
  onClose,
  onNavigateToDashboard,
}) => {
  React.useEffect(() => {
    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#38BDF8', '#10B981', '#FBBF24'],
      });
    } catch {}
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${toPersianDigits(mins)} دقیقه و ${toPersianDigits(secs)} ثانیه`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#141924] border border-slate-700/90 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Glow Header */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Trophy & Title */}
        <div className="text-center relative z-10 space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400/40 flex items-center justify-center mx-auto text-amber-400 shadow-xl shadow-amber-500/20">
            <Trophy className="w-9 h-9 animate-bounce" />
          </div>

          <h2 className="text-2xl font-black text-white">تمرین با موفقیت به پایان رسید! 🎉</h2>
          <p className="text-xs sm:text-sm text-slate-300">
            گزارش عملکرد تخصصی جلسه تمرین • {sessionLog.dayTitle}
          </p>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl text-center">
            <Clock className="w-5 h-5 text-sky-400 mx-auto mb-1" />
            <span className="text-[11px] text-slate-400 block">مدت زمان</span>
            <span className="text-sm font-black text-white">{formatDuration(sessionLog.durationSeconds)}</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl text-center">
            <Dumbbell className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <span className="text-[11px] text-slate-400 block">حجم تناژ وزنه (Volume)</span>
            <span className="text-sm font-black text-amber-400 font-mono">
              {toPersianDigits(sessionLog.totalVolumeTonnageKg.toLocaleString())} kg
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl text-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <span className="text-[11px] text-slate-400 block">ست‌های تکمیل‌شده</span>
            <span className="text-sm font-black text-emerald-400">
              {toPersianDigits(sessionLog.totalSetsCompleted)} ست
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl text-center">
            <Flame className="w-5 h-5 text-rose-400 mx-auto mb-1" />
            <span className="text-[11px] text-slate-400 block">مجموع تکرارها</span>
            <span className="text-sm font-black text-white">
              {toPersianDigits(sessionLog.totalRepsCompleted)} تکرار
            </span>
          </div>
        </div>

        {/* Personal Records Banner (if any) */}
        {sessionLog.personalRecordsAchieved.length > 0 && (
          <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-2xl p-3.5 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-300">رکورد شخصی جدید (New Personal Record)!</h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {sessionLog.personalRecordsAchieved.map((pr, i) => (
                  <span key={i}>
                    {pr.exercise} با وزنه {toPersianDigits(pr.weightKg)} کیلوگرم ({toPersianDigits(pr.reps)} تکرار)
                  </span>
                ))}
              </p>
            </div>
          </div>
        )}

        {/* Session Rating & Notes Summary */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">امتیاز کیفیت و انرژی جلسه:</span>
            <div className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${s <= sessionLog.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}
                />
              ))}
            </div>
          </div>
          {sessionLog.sessionNotes && (
            <p className="text-xs text-slate-300 bg-slate-850 p-2.5 rounded-xl border border-slate-800 italic leading-relaxed">
              «{sessionLog.sessionNotes}»
            </p>
          )}
        </div>

        {/* Footer CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={onNavigateToDashboard}
            className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <span>مشاهده نمودارها و داشبورد پیشرفت</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
};
