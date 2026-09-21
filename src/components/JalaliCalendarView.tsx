import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  Plus,
  CheckCircle2,
  Clock,
  Dumbbell,
  Ruler,
  Camera,
  BookOpen,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import {
  JalaliDate,
  getCurrentJalaliDate,
  getDaysInJalaliMonth,
  getFirstDayOfJalaliMonth,
  PERSIAN_MONTH_NAMES,
  PERSIAN_WEEK_DAYS,
  toPersianDigits,
  formatJalaliDate,
} from '../utils/jalali';
import { CalendarReminder, WorkoutProgram } from '../types';
import { soundManager } from '../utils/sound';

interface JalaliCalendarViewProps {
  reminders: CalendarReminder[];
  onSaveReminders: (reminders: CalendarReminder[]) => void;
  activeProgram?: WorkoutProgram;
  onStartWorkoutForDay?: (dayIndex: number) => void;
}

export const JalaliCalendarView: React.FC<JalaliCalendarViewProps> = ({
  reminders,
  onSaveReminders,
  activeProgram,
  onStartWorkoutForDay,
}) => {
  const today = getCurrentJalaliDate();
  const [currentYear, setCurrentYear] = useState<number>(today.jy);
  const [currentMonth, setCurrentMonth] = useState<number>(today.jm);
  const [selectedDay, setSelectedDay] = useState<number>(today.jd);

  // New Reminder Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<CalendarReminder['type']>('workout');
  const [newTime, setNewTime] = useState('18:00');
  const [newDesc, setNewDesc] = useState('');

  const daysInMonth = getDaysInJalaliMonth(currentYear, currentMonth);
  const firstDayWeekday = getFirstDayOfJalaliMonth(currentYear, currentMonth); // 0 = شنبه

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const selectedDateStr = `${currentYear}/${currentMonth < 10 ? '0' + currentMonth : currentMonth}/${selectedDay < 10 ? '0' + selectedDay : selectedDay}`;

  const selectedDayReminders = reminders.filter((r) => {
    return r.jalaliDate.includes(`${currentMonth}/${selectedDay}`) || r.jalaliDate.includes(toPersianDigits(`${selectedDay}`));
  });

  const handleToggleReminder = (id: string) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r));
    onSaveReminders(updated);
    soundManager.playSetCompleted();
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    onSaveReminders(updated);
  };

  const handleAddReminder = () => {
    if (!newTitle.trim()) return;
    const newRem: CalendarReminder = {
      id: `rem-${Date.now()}`,
      title: newTitle.trim(),
      jalaliDate: formatJalaliDate({ jy: currentYear, jm: currentMonth, jd: selectedDay }, 'standard'),
      time: newTime,
      type: newType,
      completed: false,
      description: newDesc.trim(),
    };

    onSaveReminders([...reminders, newRem]);
    setShowAddModal(false);
    setNewTitle('');
    setNewDesc('');
    soundManager.playSetCompleted();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-[#141926] to-[#121622] border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <CalendarIcon className="w-9 h-9" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>تقویم جلالی و برنامه‌ریزی تمرینات</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                گاه‌شمار هجری شمسی، زمان‌بندی جلسات بدنسازی، یادآور سایزگیری و عکس‌های دوره‌ای پیشرفت
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت یادآور یا برنامه جدید</span>
          </button>
        </div>
      </div>

      {/* Main Calendar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Calendar Matrix Card (8 cols) */}
        <div className="lg:col-span-8 bg-[#141924] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5">
          {/* Month & Year Navigation */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">
                {PERSIAN_MONTH_NAMES[currentMonth - 1]} {toPersianDigits(currentYear)}
              </h3>
              {currentYear === today.jy && currentMonth === today.jm && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30">
                  ماه جاری
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="ماه قبل"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="ماه بعد"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Weekday Headers (شنبه to جمعه) */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 pb-1">
            {PERSIAN_WEEK_DAYS.map((w, idx) => (
              <div key={idx} className={idx === 6 ? 'text-rose-400' : ''}>
                {w}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty Offset cells */}
            {Array.from({ length: firstDayWeekday }, (_, i) => (
              <div key={`empty-${i}`} className="h-16 sm:h-20 rounded-2xl bg-slate-900/30 border border-slate-800/30"></div>
            ))}

            {/* Days of Month */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const dayNum = i + 1;
              const isToday = currentYear === today.jy && currentMonth === today.jm && dayNum === today.jd;
              const isSelected = dayNum === selectedDay;

              // Check if any reminders on this day
              const dayReminders = reminders.filter((r) =>
                r.jalaliDate.includes(`${currentMonth}/${dayNum}`) ||
                r.jalaliDate.includes(toPersianDigits(dayNum))
              );

              return (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDay(dayNum)}
                  className={`h-16 sm:h-20 rounded-2xl p-2 flex flex-col justify-between text-right border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500/70 shadow-lg shadow-amber-500/10'
                      : isToday
                      ? 'bg-sky-500/10 border-sky-500/40 hover:border-sky-400'
                      : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm font-black font-mono ${
                        isSelected
                          ? 'text-amber-400'
                          : isToday
                          ? 'text-sky-400'
                          : 'text-slate-200'
                      }`}
                    >
                      {toPersianDigits(dayNum)}
                    </span>
                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                    )}
                  </div>

                  {/* Badges / Dots for reminders */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {dayReminders.slice(0, 2).map((rem, idx) => (
                      <span
                        key={idx}
                        className={`w-2 h-2 rounded-full ${
                          rem.type === 'workout'
                            ? 'bg-amber-400'
                            : rem.type === 'measurement'
                            ? 'bg-sky-400'
                            : 'bg-emerald-400'
                        }`}
                      ></span>
                    ))}
                    {dayReminders.length > 2 && (
                      <span className="text-[9px] text-slate-400 font-mono">
                        +{dayReminders.length - 2}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Reminders Drawer (4 cols) */}
        <div className="lg:col-span-4 bg-[#141924] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[11px] text-slate-400 block">برنامه روز انتخاب‌شده:</span>
              <h4 className="text-sm font-bold text-white">
                {toPersianDigits(selectedDay)} {PERSIAN_MONTH_NAMES[currentMonth - 1]} {toPersianDigits(currentYear)}
              </h4>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto">
            {selectedDayReminders.length === 0 ? (
              <div className="text-center py-8 text-slate-500 space-y-2">
                <CalendarIcon className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-xs">هیچ رویدادی برای این روز ثبت نشده است.</p>
              </div>
            ) : (
              selectedDayReminders.map((rem) => (
                <div
                  key={rem.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    rem.completed
                      ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleReminder(rem.id)}
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                          rem.completed
                            ? 'bg-emerald-500 text-black border-emerald-400'
                            : 'border-slate-600 hover:border-amber-400'
                        }`}
                      >
                        {rem.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>

                      <div>
                        <h5
                          className={`text-xs font-bold ${
                            rem.completed ? 'line-through text-slate-400' : 'text-white'
                          }`}
                        >
                          {rem.title}
                        </h5>
                        {rem.time && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                            <Clock className="w-3 h-3 text-sky-400" />
                            {rem.time}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteReminder(rem.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {rem.description && (
                    <p className="text-[11px] text-slate-400 mt-2 pr-7 leading-relaxed">
                      {rem.description}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#141924] border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              افزودن یادآور یا رویداد در گاه‌شمار جلالی
            </h3>

            <div>
              <label className="block text-xs text-slate-400 mb-1">عنوان رویداد</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="مثال: جلسه تمرین بالاتنه، سایزگیری ماهانه..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">نوع رویداد</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="workout">جلسه تمرینی (Workout)</option>
                  <option value="measurement">سایزگیری و وزن‌کشی</option>
                  <option value="photo">عکاسی پیشرفت (Progress Photo)</option>
                  <option value="review">بازبینی و ارزیابی دوره</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">ساعت یادآوری</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">توضیحات و نکات تکمیلی</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={2}
                placeholder="توضیحات اختیاری..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
              >
                انصراف
              </button>
              <button
                onClick={handleAddReminder}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
              >
                ثبت یادآور
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
