import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Trash2,
  Check,
  RotateCcw,
  Sparkles,
  X,
  Dumbbell,
  Target,
  ChevronLeft,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { AthleteProfile } from '../types';
import { toPersianDigits } from '../utils/jalali';

interface AthleteManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  athletes: AthleteProfile[];
  activeAthleteId: string;
  onSelectAthlete: (athleteId: string) => void;
  onAddNewAthlete: (name: string) => void;
  onDeleteAthlete: (athleteId: string) => void;
  onResetToCleanSlate: () => void;
  onLoadDemoData: () => void;
  theme: 'dark' | 'light';
}

export const AthleteManagerModal: React.FC<AthleteManagerModalProps> = ({
  isOpen,
  onClose,
  athletes,
  activeAthleteId,
  onSelectAthlete,
  onAddNewAthlete,
  onDeleteAthlete,
  onResetToCleanSlate,
  onLoadDemoData,
  theme,
}) => {
  const [newAthleteName, setNewAthleteName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const isLight = theme === 'light';

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAthleteName.trim()) {
      onAddNewAthlete(newAthleteName.trim());
      setNewAthleteName('');
      setIsAdding(false);
    }
  };

  const getGoalLabel = (goal: string) => {
    switch (goal) {
      case 'hypertrophy':
        return 'هایپرتروفی و حجم عضلانی';
      case 'fat_loss':
        return 'چربی‌سوزی و کات';
      case 'strength':
        return 'افزایش قدرت حداکثری';
      case 'recomposition':
        return 'ریکامپوزیشن (عضله‌سازی + چربی‌سوزی)';
      case 'contest_prep':
        return 'آماده‌سازی مسابقات';
      default:
        return 'آمادگی جسمانی عمومی';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-[#121620] border-slate-800 text-slate-100'
        }`}
        dir="rtl"
      >
        {/* Header */}
        <div
          className={`p-5 sm:p-6 border-b flex items-center justify-between ${
            isLight ? 'border-slate-100 bg-slate-50/80' : 'border-slate-800/80 bg-[#161b27]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">مدیریت شاگردان و ورزشکاران</h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                سوئیچ بین پروفایل‌های مختلف، ایجاد شاگرد جدید یا پاکسازی کامل رکوردها
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>افزودن شاگرد جدید</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmReset(true)}
                title="پاکسازی کامل رکوردهای پیش‌فرض برای شروع خام و دقیق"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                  isLight
                    ? 'border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100'
                    : 'border-rose-900/40 text-rose-400 bg-rose-950/30 hover:bg-rose-900/50'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>شروع خام (پاکسازی دیتای دمو)</span>
              </button>

              <button
                onClick={onLoadDemoData}
                title="بارگذاری مجدد نمونه‌های تستی"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                  isLight
                    ? 'border-slate-200 text-slate-600 bg-slate-100 hover:bg-slate-200'
                    : 'border-slate-800 text-slate-400 bg-slate-800/60 hover:bg-slate-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>دیتای نمونه</span>
              </button>
            </div>
          </div>

          {/* Reset Confirmation Prompt */}
          {confirmReset && (
            <div
              className={`p-4 rounded-2xl border ${
                isLight ? 'bg-rose-50 border-rose-200' : 'bg-rose-950/40 border-rose-800/60'
              } animate-in fade-in`}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-rose-500">
                    آیا از پاکسازی تمام رکوردهای پیش‌فرض اطمینان دارید؟
                  </h4>
                  <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-rose-700' : 'text-rose-300'}`}>
                    با این کار، تمام لاگ‌ها، نمودارها و رکوردهای تستی پاک می‌شوند و برنامه در حالت کاملاً خام (Clean Slate) با ۱ شاگرد جدید آماده ورود اطلاعات واقعی شما خواهد بود.
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => {
                        onResetToCleanSlate();
                        setConfirmReset(false);
                      }}
                      className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                    >
                      بله، پاکسازی و ریست کامل
                    </button>
                    <button
                      onClick={() => setConfirmReset(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-600 text-xs hover:bg-slate-800 text-slate-300"
                    >
                      انصراف
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Athlete Form */}
          {isAdding && (
            <form
              onSubmit={handleAddSubmit}
              className={`p-4 rounded-2xl border ${
                isLight ? 'bg-amber-50/60 border-amber-200' : 'bg-amber-500/5 border-amber-500/30'
              } animate-in fade-in space-y-3`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-500">مشخصات شاگرد جدید</span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  انصراف
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="نام و نام خانوادگی شاگرد (مثال: علی محمدی)"
                  value={newAthleteName}
                  onChange={(e) => setNewAthleteName(e.target.value)}
                  autoFocus
                  className={`flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-800'
                      : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!newAthleteName.trim()}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 disabled:opacity-50 text-black font-bold text-xs hover:bg-amber-400 cursor-pointer"
                >
                  ثبت شاگرد
                </button>
              </div>
            </form>
          )}

          {/* Athletes List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                شاگردان ثبت‌شده ({toPersianDigits(athletes.length)} نفر)
              </span>
              <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                برای انتخاب شاگرد، روی کارت کلیک کنید
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {athletes.map((ath) => {
                const isCurrentActive = ath.id === activeAthleteId;
                const bmi = ath.heightCm
                  ? (ath.weightKg / Math.pow(ath.heightCm / 100, 2)).toFixed(1)
                  : '0';

                return (
                  <div
                    key={ath.id}
                    onClick={() => {
                      onSelectAthlete(ath.id);
                      onClose();
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                      isCurrentActive
                        ? isLight
                          ? 'bg-amber-50/90 border-amber-400 shadow-md ring-1 ring-amber-400'
                          : 'bg-gradient-to-r from-amber-500/15 via-[#1a2130] to-[#161c28] border-amber-500/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/50'
                        : isLight
                          ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                          : 'bg-[#161c28] hover:bg-[#1c2333] border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        {/* Avatar */}
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base ${
                            isCurrentActive
                              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                              : isLight
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {ath.name.charAt(0) || 'ش'}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold flex items-center gap-2">
                              <span>{ath.name}</span>
                              {isCurrentActive && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-black font-extrabold flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  شاگرد فعال
                                </span>
                              )}
                            </h3>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                            <span>سن: {toPersianDigits(ath.age)} سال</span>
                            <span>•</span>
                            <span>قد: {toPersianDigits(ath.heightCm)} cm</span>
                            <span>•</span>
                            <span>وزن: {toPersianDigits(ath.weightKg)} kg</span>
                            <span>•</span>
                            <span>BMI: {toPersianDigits(bmi)}</span>
                          </div>

                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                              {getGoalLabel(ath.primaryGoal)}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300">
                              {toPersianDigits(ath.weeklyDays)} روز در هفته
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Delete Button (if not the only athlete) */}
                      {athletes.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`آیا از حذف پرونده «${ath.name}» اطمینان دارید؟`)) {
                              onDeleteAthlete(ath.id);
                            }
                          }}
                          className={`p-2 rounded-xl transition-colors opacity-60 hover:opacity-100 ${
                            isLight
                              ? 'hover:bg-rose-100 text-rose-600'
                              : 'hover:bg-rose-950/60 text-rose-400'
                          }`}
                          title="حذف این شاگرد"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t flex items-center justify-between text-xs ${
            isLight ? 'border-slate-100 bg-slate-50 text-slate-600' : 'border-slate-800/80 bg-[#121620] text-slate-400'
          }`}
        >
          <span>تعداد شاگردان فعال: {toPersianDigits(athletes.length)} نفر</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
};
