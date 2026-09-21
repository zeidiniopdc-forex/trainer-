import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Check,
  CheckCircle2,
  Clock,
  Dumbbell,
  Timer,
  ChevronDown,
  ChevronUp,
  Flame,
  AlertCircle,
  Sparkles,
  Trophy,
  FastForward,
  Plus,
  Minus,
  RefreshCw,
  SkipForward,
  MessageSquare,
  Star,
} from 'lucide-react';
import {
  WorkoutProgram,
  WorkoutDay,
  LoggedExercise,
  LoggedSet,
  WorkoutSessionLog,
  AthleteProfile,
} from '../types';
import { toPersianDigits, getCurrentJalaliDate, formatJalaliDate } from '../utils/jalali';
import { soundManager } from '../utils/sound';
import { WorkoutSummaryModal } from './WorkoutSummaryModal';

interface WorkoutTrackerViewProps {
  activeProgram: WorkoutProgram;
  profile: AthleteProfile;
  onFinishSession: (log: WorkoutSessionLog) => void;
  onNavigateToDashboard: () => void;
  initialDayIndex?: number;
  theme?: 'dark' | 'light';
}

export const WorkoutTrackerView: React.FC<WorkoutTrackerViewProps> = ({
  activeProgram,
  profile,
  onFinishSession,
  onNavigateToDashboard,
  initialDayIndex = 0,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(initialDayIndex);
  const currentDay: WorkoutDay = activeProgram.days[selectedDayIndex] || activeProgram.days[0];

  // Live Workout Stopwatch
  const [workoutDuration, setWorkoutDuration] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Rest Timer State
  const [restRemaining, setRestRemaining] = useState<number>(0);
  const [totalRestDuration, setTotalRestDuration] = useState<number>(90);
  const [isRestActive, setIsRestActive] = useState<boolean>(false);
  const restIntervalRef = useRef<any>(null);

  // Session Logging State
  const [exercisesState, setExercisesState] = useState<LoggedExercise[]>([]);
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [sessionRating, setSessionRating] = useState<number>(5);

  // Exercise Replace Modal
  const [replacingExIdx, setReplacingExIdx] = useState<number | null>(null);
  const [replacementName, setReplacementName] = useState<string>('');

  // Finished Modal State
  const [completedSummaryLog, setCompletedSummaryLog] = useState<WorkoutSessionLog | null>(null);

  // Initialize exercises state from current day
  useEffect(() => {
    if (!currentDay) return;

    const initialExercises: LoggedExercise[] = currentDay.exercises.map((ex) => {
      const setsCount = parseInt(String(ex.sets), 10) || 3;
      const parsedReps = parseInt(String(ex.reps).split('-')[0], 10) || 10;
      const restSecs = parseInt(String(ex.rest).replace(/\D/g, ''), 10) || 90;

      // Default target weight estimation based on exercise type or profile records
      let defaultWeight = 50;
      if (ex.name.includes('پرس سینه') || ex.name.includes('Bench')) defaultWeight = 80;
      else if (ex.name.includes('اسکوات') || ex.name.includes('Squat')) defaultWeight = 100;
      else if (ex.name.includes('ددلیفت') || ex.name.includes('Deadlift')) defaultWeight = 110;
      else if (ex.name.includes('دمبل') || ex.name.includes('DB')) defaultWeight = 22;
      else if (ex.name.includes('سیمکش') || ex.name.includes('Cable')) defaultWeight = 45;

      const sets: LoggedSet[] = Array.from({ length: setsCount }, (_, i) => ({
        setNumber: i + 1,
        targetWeightKg: defaultWeight,
        targetReps: parsedReps,
        actualWeightKg: defaultWeight,
        actualReps: parsedReps,
        rpe: 8,
        rir: 2,
        completed: false,
      }));

      return {
        exerciseName: ex.name,
        targetMuscle: ex.targetMuscle || currentDay.muscle_groups[0] || 'عضله هدف',
        targetSets: setsCount,
        targetReps: ex.reps,
        restSeconds: restSecs,
        tempo: ex.tempo,
        notes: ex.notes,
        skipped: false,
        sets,
      };
    });

    setExercisesState(initialExercises);
  }, [selectedDayIndex, activeProgram]);

  // Stopwatch interval
  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setWorkoutDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Rest Timer Interval & Audio Trigger
  useEffect(() => {
    if (isRestActive && restRemaining > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestRemaining((prev) => {
          if (prev <= 4 && prev > 1) {
            soundManager.playCountdownTick(prev);
          } else if (prev === 1) {
            soundManager.playRestFinished();
            setIsRestActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (restRemaining === 0) {
      setIsRestActive(false);
      clearInterval(restIntervalRef.current);
    }

    return () => clearInterval(restIntervalRef.current);
  }, [isRestActive, restRemaining]);

  const startRestTimer = (seconds: number) => {
    setTotalRestDuration(seconds);
    setRestRemaining(seconds);
    setIsRestActive(true);
  };

  const cancelRestTimer = () => {
    setIsRestActive(false);
    setRestRemaining(0);
    clearInterval(restIntervalRef.current);
  };

  const addRestTime = (seconds: number) => {
    setRestRemaining((prev) => prev + seconds);
    setTotalRestDuration((prev) => prev + seconds);
    setIsRestActive(true);
  };

  // Toggle set completion
  const handleToggleSetComplete = (exIdx: number, setIdx: number) => {
    setExercisesState((prev) => {
      const updated = [...prev];
      const targetSet = updated[exIdx].sets[setIdx];
      const wasCompleted = targetSet.completed;

      targetSet.completed = !wasCompleted;
      targetSet.completedAt = !wasCompleted ? new Date().toISOString() : undefined;

      if (!wasCompleted) {
        soundManager.playSetCompleted();
        // Start rest timer automatically from exercise rest setting
        startRestTimer(updated[exIdx].restSeconds || 90);
      }

      return updated;
    });
  };

  // Update actual weight or reps
  const updateSetActual = (
    exIdx: number,
    setIdx: number,
    field: 'actualWeightKg' | 'actualReps' | 'rpe' | 'rir',
    delta: number,
    minVal: number = 0
  ) => {
    setExercisesState((prev) => {
      const updated = [...prev];
      const currentVal = Number(updated[exIdx].sets[setIdx][field] || 0);
      const newVal = Math.max(minVal, currentVal + delta);
      updated[exIdx].sets[setIdx][field] = Number(newVal.toFixed(1));
      return updated;
    });
  };

  // Skip exercise
  const handleToggleSkipExercise = (exIdx: number) => {
    setExercisesState((prev) => {
      const updated = [...prev];
      updated[exIdx].skipped = !updated[exIdx].skipped;
      return updated;
    });
  };

  // Replace exercise
  const handleConfirmReplace = () => {
    if (replacingExIdx === null || !replacementName.trim()) return;

    setExercisesState((prev) => {
      const updated = [...prev];
      updated[replacingExIdx].exerciseName = replacementName.trim();
      updated[replacingExIdx].replacedWith = replacementName.trim();
      return updated;
    });

    setReplacingExIdx(null);
    setReplacementName('');
  };

  // Finish session
  const handleFinishWorkout = () => {
    setIsTimerRunning(false);
    cancelRestTimer();

    const completedSets = exercisesState.reduce((acc, ex) => {
      if (ex.skipped) return acc;
      return acc + ex.sets.filter((s) => s.completed).length;
    }, 0);

    const completedReps = exercisesState.reduce((acc, ex) => {
      if (ex.skipped) return acc;
      return (
        acc +
        ex.sets.reduce((sAcc, s) => (s.completed ? sAcc + Number(s.actualReps) : sAcc), 0)
      );
    }, 0);

    const totalVolume = exercisesState.reduce((acc, ex) => {
      if (ex.skipped) return acc;
      return (
        acc +
        ex.sets.reduce(
          (sAcc, s) =>
            s.completed ? sAcc + Number(s.actualWeightKg) * Number(s.actualReps) : sAcc,
          0
        )
      );
    }, 0);

    const prList = exercisesState
      .filter((ex) => !ex.skipped)
      .slice(0, 2)
      .map((ex) => {
        const highestSet = ex.sets.reduce(
          (max, s) => (s.actualWeightKg > max.actualWeightKg ? s : max),
          ex.sets[0]
        );
        return {
          exercise: ex.exerciseName,
          weightKg: highestSet ? highestSet.actualWeightKg : 80,
          reps: highestSet ? highestSet.actualReps : 8,
        };
      });

    const log: WorkoutSessionLog = {
      id: 'log-' + Date.now(),
      programName: activeProgram.program_name,
      dayTitle: currentDay?.day || 'جلسه تمرینی',
      jalaliDate: formatJalaliDate(getCurrentJalaliDate(), 'short'),
      startTime: '18:00',
      endTime: '19:15',
      durationSeconds: workoutDuration || 3600,
      totalVolumeTonnageKg: totalVolume,
      totalSetsCompleted: completedSets,
      totalRepsCompleted: completedReps,
      exercises: exercisesState,
      rating: sessionRating,
      sessionNotes: sessionNotes || 'جلسه تمرینی عالی با تمرکز بر تنش مکانیکی و رعایت زمان استراحت.',
      personalRecordsAchieved: prList,
    };

    onFinishSession(log);
    setCompletedSummaryLog(log);
    soundManager.playWorkoutVictory();
  };

  // Format MM:SS for stopwatch
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${toPersianDigits(mins.toString().padStart(2, '0'))}:${toPersianDigits(remainder.toString().padStart(2, '0'))}`;
  };

  // Calculate overall progress percentage
  const totalSetsCount = exercisesState.reduce(
    (acc, ex) => (ex.skipped ? acc : acc + ex.sets.length),
    0
  );
  const completedSetsCount = exercisesState.reduce(
    (acc, ex) => (ex.skipped ? acc : acc + ex.sets.filter((s) => s.completed).length),
    0
  );
  const progressPercent = totalSetsCount > 0 ? Math.round((completedSetsCount / totalSetsCount) * 100) : 0;

  const cardBg = isLight
    ? 'bg-white border-slate-200 text-slate-800 shadow-md'
    : 'bg-[#141924] border-slate-800 text-slate-100 shadow-xl';

  const innerBg = isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800';

  return (
    <div className="space-y-6 pb-20 w-full max-w-full overflow-x-hidden">
      {/* Top Banner: Day Selector & Live HUD */}
      <div
        className={`border rounded-3xl p-4 sm:p-7 relative overflow-hidden transition-all ${
          isLight
            ? 'bg-gradient-to-l from-slate-100 via-amber-50/40 to-white border-slate-200 shadow-md'
            : 'bg-gradient-to-l from-slate-900 via-[#141a27] to-[#121622] border-slate-800 shadow-2xl'
        }`}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6 relative z-10">
          {/* Day Title & Selector */}
          <div className="space-y-2 min-w-0 w-full lg:w-auto">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-bold text-amber-500">جلسه تمرینی زنده (Live Session)</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                id="tracker-day-select"
                value={selectedDayIndex}
                onChange={(e) => setSelectedDayIndex(Number(e.target.value))}
                className={`border rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold focus:outline-none focus:border-amber-500 max-w-full ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900'
                    : 'bg-slate-900 border-slate-700 text-white'
                }`}
              >
                {activeProgram.days.map((d, i) => (
                  <option key={i} value={i}>
                    {d.day}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {currentDay?.muscle_groups.map((mg, i) => (
                <span
                  key={i}
                  className={`text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-lg border ${
                    isLight
                      ? 'bg-slate-100 text-sky-800 border-slate-200'
                      : 'bg-slate-800 text-sky-300 border-slate-700'
                  }`}
                >
                  {mg}
                </span>
              ))}
            </div>
          </div>

          {/* Stopwatch & Finish Workout Button */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
            {/* Live Stopwatch HUD */}
            <div className={`flex items-center gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl border shadow-inner ${innerBg}`}>
              <Clock className="w-5 h-5 text-sky-500 shrink-0" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block">زمان جلسه</span>
                <span className="text-base sm:text-lg font-black font-mono tracking-wider">
                  {formatTime(workoutDuration)}
                </span>
              </div>

              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                }`}
                title={isTimerRunning ? 'توقف موقت تایمر' : 'ادامه تایمر'}
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>

            {/* Finish Session CTA */}
            <button
              id="tracker-finish-btn"
              onClick={handleFinishWorkout}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer text-xs sm:text-sm"
            >
              <Trophy className="w-4 h-4" />
              <span>پایان جلسه و ثبت گزارش</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 sm:mt-5 pt-3 border-t border-slate-300 dark:border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span>
              پیشرفت ست‌ها: {toPersianDigits(completedSetsCount)} از {toPersianDigits(totalSetsCount)} ست
            </span>
            <span className="font-bold text-amber-500 font-mono">{toPersianDigits(progressPercent)}٪</span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-300 dark:border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-sky-400 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Floating / Embedded Rest Countdown Timer */}
      {isRestActive && (
        <div
          className={`border rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all animate-in fade-in slide-in-from-top-2 ${
            isLight
              ? 'bg-amber-50 border-amber-300 text-amber-950 shadow-lg'
              : 'bg-gradient-to-r from-amber-500/20 via-[#181d2a] to-amber-500/20 border-amber-500/50 shadow-2xl'
          }`}
        >
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-black shadow-md shrink-0">
              <Timer className="w-6 h-6 animate-spin" />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                <span>تایمر استراحت بین ست‌ها</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono">
                  RP Scientific Rest
                </span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                برای ریکاوری آدنوزین تری‌فسفات (ATP) و آمادگی عضله هدف صبور باشید
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-center font-mono font-black text-2xl sm:text-3xl text-amber-500">
              {toPersianDigits(restRemaining)} <span className="text-xs font-normal">ثانیه</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => addRestTime(30)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                }`}
              >
                +۳۰ ثانیه
              </button>

              <button
                onClick={cancelRestTimer}
                className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all cursor-pointer"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercises List */}
      <div className="space-y-4">
        {exercisesState.map((exercise, exIdx) => (
          <div
            key={exIdx}
            className={`border rounded-3xl p-4 sm:p-6 transition-all ${cardBg} ${
              exercise.skipped ? 'opacity-60' : ''
            }`}
          >
            {/* Exercise Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center font-bold text-sm font-mono shrink-0">
                  {toPersianDigits(exIdx + 1)}
                </span>

                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold flex items-center gap-2 truncate">
                    <span className="truncate">{exercise.exerciseName}</span>
                    {exercise.skipped && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500">
                        رد شده
                      </span>
                    )}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-slate-400 mt-0.5 font-mono">
                    <span>هدف: {toPersianDigits(exercise.targetSets)} ست × {exercise.targetReps}</span>
                    <span>• استراحت: {toPersianDigits(exercise.restSeconds)} ثانیه</span>
                    {exercise.tempo && <span>• تمپو: {exercise.tempo}</span>}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Replace / Skip */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setReplacingExIdx(exIdx);
                    setReplacementName('');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 cursor-pointer ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <RefreshCw className="w-3 h-3 text-sky-500" />
                  <span>جایگزینی</span>
                </button>

                <button
                  onClick={() => handleToggleSkipExercise(exIdx)}
                  className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 cursor-pointer ${
                    exercise.skipped
                      ? 'bg-amber-500/20 text-amber-500'
                      : isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                  }`}
                >
                  <SkipForward className="w-3 h-3" />
                  <span>{exercise.skipped ? 'فعال‌سازی' : 'رد کردن'}</span>
                </button>
              </div>
            </div>

            {/* Notes if available */}
            {exercise.notes && (
              <p className={`text-xs p-2.5 rounded-xl border my-3 leading-relaxed ${innerBg}`}>
                💡 {exercise.notes}
              </p>
            )}

            {/* Interactive Sets Table with responsive layout */}
            {!exercise.skipped && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-right text-xs min-w-[420px]">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-200 dark:border-slate-800/80 pb-2 text-[11px]">
                      <th className="pb-2 w-10 text-center">ست</th>
                      <th className="pb-2">وزنه (kg)</th>
                      <th className="pb-2">تکرار</th>
                      <th className="pb-2 text-center">RPE / RIR</th>
                      <th className="pb-2 text-center w-24">ثبت ست</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {exercise.sets.map((s, setIdx) => (
                      <tr
                        key={setIdx}
                        className={`transition-colors ${
                          s.completed
                            ? isLight
                              ? 'bg-emerald-50/60'
                              : 'bg-emerald-500/5'
                            : ''
                        }`}
                      >
                        {/* Set Number */}
                        <td className="py-2.5 text-center font-mono font-bold text-slate-400">
                          {toPersianDigits(s.setNumber)}
                        </td>

                        {/* Weight Stepper */}
                        <td className="py-2.5">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateSetActual(exIdx, setIdx, 'actualWeightKg', -2.5, 0)}
                              className={`w-6 h-6 rounded-md flex items-center justify-center font-bold ${
                                isLight
                                  ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              }`}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              step="2.5"
                              value={s.actualWeightKg}
                              onChange={(e) =>
                                updateSetActual(
                                  exIdx,
                                  setIdx,
                                  'actualWeightKg',
                                  Number(e.target.value) - s.actualWeightKg,
                                  0
                                )
                              }
                              className={`w-14 border rounded-lg px-1.5 py-1 text-center font-mono font-bold text-xs ${
                                isLight
                                  ? 'bg-white border-slate-300 text-slate-900'
                                  : 'bg-slate-900 border-slate-700 text-white'
                              }`}
                            />
                            <button
                              onClick={() => updateSetActual(exIdx, setIdx, 'actualWeightKg', 2.5, 0)}
                              className={`w-6 h-6 rounded-md flex items-center justify-center font-bold ${
                                isLight
                                  ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              }`}
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Reps Stepper */}
                        <td className="py-2.5">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateSetActual(exIdx, setIdx, 'actualReps', -1, 1)}
                              className={`w-6 h-6 rounded-md flex items-center justify-center font-bold ${
                                isLight
                                  ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              }`}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={s.actualReps}
                              onChange={(e) =>
                                updateSetActual(
                                  exIdx,
                                  setIdx,
                                  'actualReps',
                                  Number(e.target.value) - s.actualReps,
                                  1
                                )
                              }
                              className={`w-12 border rounded-lg px-1.5 py-1 text-center font-mono font-bold text-xs ${
                                isLight
                                  ? 'bg-white border-slate-300 text-slate-900'
                                  : 'bg-slate-900 border-slate-700 text-white'
                              }`}
                            />
                            <button
                              onClick={() => updateSetActual(exIdx, setIdx, 'actualReps', 1, 1)}
                              className={`w-6 h-6 rounded-md flex items-center justify-center font-bold ${
                                isLight
                                  ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              }`}
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* RPE & RIR selector */}
                        <td className="py-2.5 text-center">
                          <div className="inline-flex items-center gap-1">
                            <select
                              value={s.rpe || 8}
                              onChange={(e) =>
                                updateSetActual(
                                  exIdx,
                                  setIdx,
                                  'rpe',
                                  Number(e.target.value) - (s.rpe || 8),
                                  1
                                )
                              }
                              className={`border rounded-md px-1.5 py-0.5 text-[11px] font-mono font-bold ${
                                isLight
                                  ? 'bg-white border-slate-300 text-slate-800'
                                  : 'bg-slate-900 border-slate-700 text-slate-200'
                              }`}
                            >
                              <option value="6">RPE 6 (RIR 4)</option>
                              <option value="7">RPE 7 (RIR 3)</option>
                              <option value="8">RPE 8 (RIR 2)</option>
                              <option value="9">RPE 9 (RIR 1)</option>
                              <option value="10">RPE 10 (Failure)</option>
                            </select>
                          </div>
                        </td>

                        {/* Complete Checkbox Button */}
                        <td className="py-2.5 text-center">
                          <button
                            onClick={() => handleToggleSetComplete(exIdx, setIdx)}
                            className={`w-full py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              s.completed
                                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                                : isLight
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{s.completed ? 'انجام شد' : 'ثبت'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Session Notes & Rating Bottom Box */}
      <div className={`border rounded-3xl p-5 sm:p-6 space-y-4 ${cardBg}`}>
        <h4 className="text-sm font-bold flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-amber-500" />
          <span>یادداشت‌ها و فیدبک پایان تمرین</span>
        </h4>

        <div className="space-y-3">
          <textarea
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="احساس سوزش عضلانی، پمپ عضلانی، درد مفاصل یا نکاتی برای جلسه بعد..."
            rows={2}
            className={`w-full border rounded-2xl p-3 text-xs leading-relaxed focus:outline-none focus:border-amber-500 ${
              isLight
                ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                : 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500'
            }`}
          ></textarea>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">کیفیت و فشار جلسه:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setSessionRating(star)}
                    className="p-1 cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= sessionRating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-500'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleFinishWorkout}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              ثبت نهایی و انتقال به داشبورد
            </button>
          </div>
        </div>
      </div>

      {/* Exercise Replace Modal */}
      {replacingExIdx !== null && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl ${cardBg}`}>
            <h3 className="text-base font-bold flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-sky-500" />
              <span>جایگزینی حرکت تمرینی</span>
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              نام حرکت جایگزین (مثلاً در صورت اشغال بودن دستگاه یا احساس درد مفصل) را وارد کنید:
            </p>

            <input
              type="text"
              value={replacementName}
              onChange={(e) => setReplacementName(e.target.value)}
              placeholder="مثلاً: زیربغل دمبل تک‌خم یا سیمکش قایقی..."
              className={`w-full border rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500 ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900'
                  : 'bg-slate-900 border-slate-700 text-white'
              }`}
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setReplacingExIdx(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${
                  isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
                }`}
              >
                انصراف
              </button>
              <button
                onClick={handleConfirmReplace}
                className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs"
              >
                تأیید جایگزینی
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finished Summary Modal */}
      {completedSummaryLog && (
        <WorkoutSummaryModal
          log={completedSummaryLog}
          onClose={() => {
            setCompletedSummaryLog(null);
            onNavigateToDashboard();
          }}
        />
      )}
    </div>
  );
};
