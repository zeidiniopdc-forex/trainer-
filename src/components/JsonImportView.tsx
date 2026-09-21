import React, { useState } from 'react';
import {
  FileCode2,
  CheckCircle2,
  AlertTriangle,
  Play,
  Save,
  Plus,
  Trash2,
  Edit3,
  Sparkles,
  Layers,
  Dumbbell,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { WorkoutProgram, WorkoutDay, ExerciseItem } from '../types';
import { validateWorkoutJSON, SAMPLE_PROGRAMS, ValidationResult } from '../utils/jsonValidator';
import { soundManager } from '../utils/sound';
import { toPersianDigits } from '../utils/jalali';

interface JsonImportViewProps {
  programs: WorkoutProgram[];
  activeProgram: WorkoutProgram;
  onSavePrograms: (programs: WorkoutProgram[]) => void;
  onSetActiveProgram: (programName: string) => void;
  onStartWorkout: (program: WorkoutProgram, dayIndex: number) => void;
}

export const JsonImportView: React.FC<JsonImportViewProps> = ({
  programs,
  activeProgram,
  onSavePrograms,
  onSetActiveProgram,
  onStartWorkout,
}) => {
  const [jsonText, setJsonText] = useState<string>(
    JSON.stringify(SAMPLE_PROGRAMS[0], null, 2)
  );
  const [validation, setValidation] = useState<ValidationResult>(
    validateWorkoutJSON(jsonText)
  );
  const [editableProgram, setEditableProgram] = useState<WorkoutProgram | null>(
    validation.program || SAMPLE_PROGRAMS[0]
  );
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const handleJsonChange = (val: string) => {
    setJsonText(val);
    const result = validateWorkoutJSON(val);
    setValidation(result);
    if (result.isValid && result.program) {
      setEditableProgram(result.program);
    }
  };

  const loadSample = (index: number) => {
    const sample = SAMPLE_PROGRAMS[index] || SAMPLE_PROGRAMS[0];
    const text = JSON.stringify(sample, null, 2);
    setJsonText(text);
    const res = validateWorkoutJSON(text);
    setValidation(res);
    setEditableProgram(sample);
  };

  const handleSaveToDatabase = () => {
    if (!editableProgram) return;

    // Check if program already exists, update or add new
    const existingIndex = programs.findIndex(
      (p) => p.program_name === editableProgram.program_name
    );

    let updatedList: WorkoutProgram[];
    if (existingIndex >= 0) {
      updatedList = [...programs];
      updatedList[existingIndex] = {
        ...editableProgram,
        version: (updatedList[existingIndex].version || 1) + 1,
        createdAt: new Date().toISOString(),
      };
    } else {
      updatedList = [
        ...programs,
        {
          ...editableProgram,
          version: 1,
          createdAt: new Date().toISOString(),
        },
      ];
    }

    onSavePrograms(updatedList);
    onSetActiveProgram(editableProgram.program_name);
    soundManager.playSetCompleted();
    setSaveSuccessMsg(`برنامه «${editableProgram.program_name}» با موفقیت در دیتابیس ذخیره و فعال شد.`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  // Editing helpers
  const handleAddDay = () => {
    if (!editableProgram) return;
    const newDay: WorkoutDay = {
      day: `روز ${editableProgram.days.length + 1}: روز تمرینی جدید`,
      muscle_groups: ['عضلات هدف'],
      exercises: [
        {
          name: 'حرکت نمونه ۱ (Exercise Name)',
          sets: '3',
          reps: '10-12',
          rest: '90s',
          tempo: '2-0-1-0',
          notes: 'تمرکز بر انقباض کامل',
        },
      ],
    };
    const updated = {
      ...editableProgram,
      days: [...editableProgram.days, newDay],
    };
    setEditableProgram(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  const handleRemoveDay = (dayIdx: number) => {
    if (!editableProgram) return;
    const updatedDays = editableProgram.days.filter((_, idx) => idx !== dayIdx);
    const updated = { ...editableProgram, days: updatedDays };
    setEditableProgram(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  const handleAddExercise = (dayIdx: number) => {
    if (!editableProgram) return;
    const newEx: ExerciseItem = {
      name: 'حرکت جدید',
      sets: '3',
      reps: '10-12',
      rest: '90s',
      tempo: '2-0-1-0',
      notes: 'RPE 8',
    };
    const updatedDays = [...editableProgram.days];
    updatedDays[dayIdx].exercises.push(newEx);
    const updated = { ...editableProgram, days: updatedDays };
    setEditableProgram(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  const handleRemoveExercise = (dayIdx: number, exIdx: number) => {
    if (!editableProgram) return;
    const updatedDays = [...editableProgram.days];
    updatedDays[dayIdx].exercises = updatedDays[dayIdx].exercises.filter((_, i) => i !== exIdx);
    const updated = { ...editableProgram, days: updatedDays };
    setEditableProgram(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-[#141a27] to-[#121622] border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
              <FileCode2 className="w-9 h-9" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>سیستم ایمپورت و اعتبارسنجی JSON برنامه تمرینی</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                ورود مستقیم کدهای JSON خروجی هوش مصنوعی، اعتبارسنجی ساختار داده، ویرایش تعاملی و ذخیره در دیتابیس
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              id="json-save-db-btn"
              onClick={handleSaveToDatabase}
              disabled={!validation.isValid || !editableProgram}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره در دیتابیس و فعال‌سازی</span>
            </button>
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Preset Quick Loaders */}
      <div className="bg-[#141924] border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>بارگذاری سریع برنامه‌های آماده و استاندارد AI:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {SAMPLE_PROGRAMS.map((prog, idx) => (
            <button
              key={idx}
              onClick={() => loadSample(idx)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white border border-slate-700 text-xs font-medium transition-all cursor-pointer"
            >
              <span>{prog.program_name.split('(')[0].trim()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Layout: JSON Editor on Left, Live Preview/Editor on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Raw JSON Textarea & Validation Status (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#141924] border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-sky-400" />
                ورودی خام JSON (AI Raw Response)
              </h3>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                validation.isValid
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}>
                {validation.isValid ? 'معتبر (Valid JSON)' : 'نامعتبر (Invalid)'}
              </span>
            </div>

            <textarea
              id="raw-json-input-textarea"
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              rows={18}
              dir="ltr"
              placeholder="کد JSON خروجی هوش مصنوعی را در این قسمت پیست کنید..."
              className="w-full bg-[#0b0e14] border border-slate-800 rounded-2xl p-3.5 text-xs font-mono text-emerald-400 focus:outline-none focus:border-amber-500 leading-relaxed resize-none scrollbar-thin selection:bg-amber-500 selection:text-black"
            />

            {/* Validation Feedback Messages */}
            {!validation.isValid ? (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>خطاهای ساختاری در داده‌های ورودی:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 pr-1 text-[11px] leading-relaxed">
                  {validation.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>ساختار برنامه کاملاً منطبق بر پروتکل بدنسازی است.</span>
                </div>
                <div className="text-[11px] text-slate-400 flex gap-4 pt-1">
                  <span>تعداد روزها: {toPersianDigits(validation.totalDays || 0)}</span>
                  <span>تعداد حرکات: {toPersianDigits(validation.totalExercises || 0)}</span>
                  <span>مجموع ست‌ها: {toPersianDigits(validation.totalSets || 0)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Structured Live Visual Preview & Interactive Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#141924] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  <span>پیش‌نمایش ساختاریافته و ویرایشگر برنامه</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  بررسی جزئیات روزها، حرکات، ست‌ها، دامنه‌های تکرار و زمان‌های استراحت
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingMode(!isEditingMode)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isEditingMode
                      ? 'bg-amber-500 text-black border-amber-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingMode ? 'پایان ویرایش' : 'ویرایش دستی حرکات'}</span>
                </button>
              </div>
            </div>

            {editableProgram ? (
              <div className="space-y-4">
                {/* Program Title & Duration Header */}
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    {isEditingMode ? (
                      <input
                        type="text"
                        value={editableProgram.program_name}
                        onChange={(e) => {
                          const updated = { ...editableProgram, program_name: e.target.value };
                          setEditableProgram(updated);
                          setJsonText(JSON.stringify(updated, null, 2));
                        }}
                        className="bg-slate-850 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-bold text-white w-full"
                      />
                    ) : (
                      <h4 className="text-base font-black text-amber-400">{editableProgram.program_name}</h4>
                    )}
                    <p className="text-xs text-slate-400">طول دوره: {editableProgram.duration}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditingMode && (
                      <button
                        onClick={handleAddDay}
                        className="px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>افزودن روز تمرینی</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Days Accordion / Cards List */}
                <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
                  {editableProgram.days.map((day, dayIdx) => (
                    <div
                      key={dayIdx}
                      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xs font-bold font-mono">
                            {dayIdx + 1}
                          </span>
                          {isEditingMode ? (
                            <input
                              type="text"
                              value={day.day}
                              onChange={(e) => {
                                const updatedDays = [...editableProgram.days];
                                updatedDays[dayIdx].day = e.target.value;
                                const updated = { ...editableProgram, days: updatedDays };
                                setEditableProgram(updated);
                                setJsonText(JSON.stringify(updated, null, 2));
                              }}
                              className="bg-slate-850 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-white"
                            />
                          ) : (
                            <h5 className="text-sm font-bold text-white">{day.day}</h5>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onStartWorkout(editableProgram, dayIdx)}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-black" />
                            <span>شروع این جلسه</span>
                          </button>

                          {isEditingMode && (
                            <button
                              onClick={() => handleRemoveDay(dayIdx)}
                              className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:text-white"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Muscle Groups Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {day.muscle_groups.map((mg, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-800 text-sky-300 px-2 py-0.5 rounded-md border border-slate-700"
                          >
                            {mg}
                          </span>
                        ))}
                      </div>

                      {/* Exercises Table / List */}
                      <div className="space-y-2">
                        {day.exercises.map((ex, exIdx) => (
                          <div
                            key={exIdx}
                            className="p-3 rounded-xl bg-[#121622] border border-slate-800/80 hover:border-slate-700 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <Dumbbell className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                {isEditingMode ? (
                                  <input
                                    type="text"
                                    value={ex.name}
                                    onChange={(e) => {
                                      const updatedDays = [...editableProgram.days];
                                      updatedDays[dayIdx].exercises[exIdx].name = e.target.value;
                                      const updated = { ...editableProgram, days: updatedDays };
                                      setEditableProgram(updated);
                                      setJsonText(JSON.stringify(updated, null, 2));
                                    }}
                                    className="bg-slate-850 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                                  />
                                ) : (
                                  <span className="text-xs font-semibold text-slate-100">{ex.name}</span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 font-mono text-xs">
                                <span className="bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                                  {ex.sets} ست
                                </span>
                                <span className="bg-sky-500/15 text-sky-300 px-2 py-0.5 rounded border border-sky-500/30">
                                  {ex.reps} تکرار
                                </span>
                                <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                                  {ex.rest}
                                </span>
                                {isEditingMode && (
                                  <button
                                    onClick={() => handleRemoveExercise(dayIdx, exIdx)}
                                    className="text-slate-500 hover:text-rose-400"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {ex.notes && (
                              <p className="text-[11px] text-slate-400 mt-1.5 pr-6 leading-relaxed">
                                {ex.notes}
                              </p>
                            )}
                          </div>
                        ))}

                        {isEditingMode && (
                          <button
                            onClick={() => handleAddExercise(dayIdx)}
                            className="w-full py-2 bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-dashed border-slate-700 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>افزودن حرکت به این روز</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                برنامه‌ای برای نمایش وجود ندارد. کد JSON را در کادر سمت چپ وارد کنید.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
