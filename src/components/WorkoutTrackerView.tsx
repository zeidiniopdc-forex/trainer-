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
}

export const WorkoutTrackerView: React.FC<WorkoutTrackerViewProps> = ({
  activeProgram,
  profile,
  onFinishSession,
  onNavigateToDashboard,
  initialDayIndex = 0,
}) => {
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
        targetMuscle: currentDay.muscle_groups.join(', '),
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

  // Workout Session Stopwatch Timer
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setWorkoutDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Rest Countdown Interval
  useEffect(() => {
    if (isRestActive && restRemaining > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(restIntervalRef.current);
            setIsRestActive(false);
            soundManager.playRestFinished();
            return 0;
          }
          if (prev <= 4 && prev > 1) {
            soundManager.playCountdownTick(600);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(restIntervalRef.current);
    }
    return () => clearInterval(restIntervalRef.current);
  }, [isRestActive, restRemaining]);

  const startRestTimer = (seconds: number) => {
    setTotalRestDuration(seconds);
    setRestRemaining(seconds);
    setIsRestActive(true);
    soundManager.playCountdownTick(880);
  };

  const adjustRest = (delta: number) => {
    setRestRemaining((prev) => Math.max(0, prev + delta));
  };

  const skipRest = () => {
    setIsRestActive(false);
    setRestRemaining(0);
  };

  // Toggle set completion
  const handleToggleSet = (exIdx: number, setIdx: number) => {
    setExercisesState((prev) => {
      const updated = [...prev];
      const targetSet = updated[exIdx].sets[setIdx];
      const willComplete = !targetSet.completed;

      targetSet.completed = willComplete;
      targetSet.completedAt = willComplete ? new Date().toISOString() : undefined;

      if (willComplete) {
        soundManager.playSetCompleted();
        // Start rest timer automatically!
        startRestTimer(updated[exIdx].restSeconds || 90);
      }

      return updated;
    });
  };

  // Update actual weight / reps
  const updateSetActual = (
    exIdx: number,
    setIdx: number,
    field: 'actualWeightKg' | 'actualReps' | 'rpe' | 'rir',
    delta: number,
    minVal: number = 0
  ) => {
    setExercisesState((prev) => {
      const updated = [...prev];
      const targetSet = updated[exIdx].sets[setIdx];
      const current = (targetSet[field] as number) || 0;
      targetSet[field] = Math.max(minVal, Number((current + delta).toFixed(1)));
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
      updated[replacingExIdx].exerciseName = `${replacementName.trim()} (جایگزین)`;
      updated[replacingExIdx].replacedWith = replacementName.trim();
      return updated;
    });
    setReplacingExIdx(null);
    setReplacementName('');
  };

  // Finish session calculation
  const handleFinishWorkout = () => {
    setIsTimerRunning(false);
    setIsRestActive(false);

    let totalVolume = 0;
    let completedSets = 0;
    let completedReps = 0;
    const prList: { exercise: string; weightKg: number; reps: number }[] = [];

    exercisesState.forEach((ex) => {
      if (ex.skipped) return;
      ex.sets.forEach((s) => {
        if (s.completed) {
          totalVolume += s.actualWeightKg * s.actualReps;
          completedSets++;
          completedReps += s.actualReps;

          // Check if this is a PR against profile records
          const matchingRecord = profile.strengthRecords.find((r) =>
            ex.exerciseName.includes(r.exerciseName) || r.exerciseName.includes(ex.exerciseName)
          );
          if (matchingRecord && s.actualWeightKg > matchingRecord.weightKg) {
            prList.push({
              exercise: ex.exerciseName,
              weightKg: s.actualWeightKg,
              reps: s.actualReps,
            });
          }
        }
      });
    });

    const jalaliDateStr = formatJalaliDate(getCurrentJalaliDate(), 'standard');

    const log: WorkoutSessionLog = {
      id: `session-${Date.now()}`,
      programName: activeProgram.program_name,
      dayTitle: currentDay.day,
      jalaliDate: jalaliDateStr,
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

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner: Day Selector & Live HUD */}
      <div className="bg-gradient-to-l from-slate-900 via-[#141a27] to-[#121622] border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          
          {/* Day Title & Selector */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-bold text-amber-400">جلسه تمرینی زنده (Live Session)</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                id="tracker-day-select"
                value={selectedDayIndex}
                onChange={(e) => setSelectedDayIndex(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm font-bold text-white focus:outline-none focus:border-amber-500"
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
                  className="text-[11px] bg-slate-800 text-sky-300 px-2.5 py-0.5 rounded-lg border border-slate-700"
                >
                  {mg}
                </span>
              ))}
            </div>
          </div>

          {/* Stopwatch & Finish Workout Button */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Live Stopwatch HUD */}
            <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 px-4 py-2.5 rounded-2xl shadow-inner">
              <Clock className="w-5 h-5 text-sky-400" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block">زمان جلسه</span>
                <span className="text-lg font-black font-mono text-white tracking-wider">
                  {formatTime(workoutDuration)}
                </span>
              </div>

              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                title={isTimerRunning ? 'توقف موقت تایمر' : 'ادامه تایمر'}
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>

            {/* Finish Session CTA */}
            <button
              id="tracker-finish-btn"
              onClick={handleFinishWorkout}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span>پایان جلسه و ثبت گزارش</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 pt-3 border-t border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>
              پیشرفت ست‌ها: {toPersianDigits(completedSetsCount)} از {toPersianDigits(totalSetsCount)} ست
            </span>
            <span className="font-bold text-amber-400 font-mono">{toPersianDigits(progressPercent)}٪</span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-sky-400 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Floating Active Rest Countdown Widget (when rest is active) */}
      {isRestActive && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 z-50 sm:w-96 bg-[#161b26] border-2 border-amber-500/50 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Timer className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">زمان استراحت بین ست‌ها</span>
                <span className="text-2xl font-black font-mono text-amber-400">
                  {toPersianDigits(restRemaining)}s
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => adjustRest(-15)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono"
                title="کاهش ۱۵ ثانیه"
              >
                -۱۵
              </button>
              <button
                onClick={() => adjustRest(30)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono"
                title="افزایش ۳۰ ثانیه"
              >
                +۳۰
              </button>
              <button
                onClick={skipRest}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs"
              >
                رد کردن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercises Execution Cards */}
      <div className="space-y-4">
        {exercisesState.map((exercise, exIdx) => (
          <div
            key={exIdx}
            className={`bg-[#141924] border rounded-3xl p-4 sm:p-6 transition-all shadow-lg ${
              exercise.skipped
                ? 'border-slate-800 opacity-60'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            {/* Exercise Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-slate-800 text-amber-400 border border-slate-700 flex items-center justify-center font-bold text-sm font-mono">
                  {exIdx + 1}
                </span>

                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{exercise.exerciseName}</span>
                    {exercise.skipped && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                        رد شده
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5 font-mono">
                    <span>هدف: {toPersianDigits(exercise.targetSets)} ست × {exercise.targetReps}</span>
                    <span>• استراحت: {toPersianDigits(exercise.restSeconds)} ثانیه</span>
                    {exercise.tempo && <span>• تمپو: {exercise.tempo}</span>}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Replace / Skip */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setReplacingExIdx(exIdx);
                    setReplacementName('');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 text-sky-400" />
                  <span>جایگزینی حرکت</span>
                </button>

                <button
                  onClick={() => handleToggleSkipExercise(exIdx)}
                  className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 cursor-pointer ${
                    exercise.skipped
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                  }`}
                >
                  <SkipForward className="w-3 h-3" />
                  <span>{exercise.skipped ? 'فعال‌سازی مجدد' : 'رد کردن حرکت'}</span>
                </button>
              </div>
            </div>

            {/* Notes if available */}
            {exercise.notes && (
              <p className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 my-3 leading-relaxed">
                💡 {exercise.notes}
              </p>
            )}

            {/* Interactive Sets Table */}
            {!exercise.skipped && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800/80 pb-2">
                      <th className="pb-2 w-12 text-center">ست</th>
                      <th className="pb-2">وزنه (کیلوگرم)</th>
                      <th className="pb-2">تعداد تکرار</th>
                      <th className="pb-2 text-center">RPE / RIR</th>
                      <th className="pb-2 text-center w-24">تکمیل ست</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {exercise.sets.map((s, setIdx) => (
                      <tr
                        key={setIdx}
                        className={`transition-colors ${
                          s.completed ? 'bg-emerald-500/5' : 'hover:bg-slate-900/40'
                        }`}
                      >
                        {/* Set Number */}
                        <td className="py-2.5 text-center font-mono font-bold text-slate-300">
                          {toPersianDigits(s.setNumber)}
                        </td>

                        {/* Weight Stepper */}
                        <td className="py-2.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => updateSetActual(exIdx, setIdx, 'actualWeightKg', -2.5, 0)}
                              className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold"
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
                              className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-white text-xs"
                            />
                            <button
                              onClick={() => updateSetActual(exIdx, setIdx, 'actualWeightKg', 2.5, 0)}
                              className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold"
                            >
                              +
                            </button>
                            <span className="text-[10px] text-slate-500">kg</span>
                          </div>
                        </td>

                        {/* Reps Stepper */}
                        <td className="py-2.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => updateSetActual(exIdx, setIdx, 'actualReps', -1, 1)}
                              className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold"
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
                              className="w-12 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-white text-xs"
                            />
                            <button
                              onClick={() => updateSetActual(exIdx, setIdx, 'actualReps', 1, 1)}
                              className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold"
                            >
                              +
                            </button>
                            <span className="text-[10px] text-slate-500">reps</span>
                          </div>
                        </td>

                        {/* RPE & RIR selector */}
                        <td className="py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1 font-mono text-[11px]">
                            <span className="text-slate-400">RIR:</span>
                            <select
                              value={s.rir || 2}
                              onChange={(e) =>
                                updateSetActual(exIdx, setIdx, 'rir', Number(e.target.value) - (s.rir || 2))
                              }
                              className="bg-slate-900 border border-slate-700 rounded-md px-1.5 py-0.5 text-sky-400 text-xs"
                            >
                              <option value={0}>۰ (Failure)</option>
                              <option value={1}>۱ تکرار تا خستگی</option>
                              <option value={2}>۲ تکرار ذخیره</option>
                              <option value={3}>۳ تکرار ذخیره</option>
                            </select>
                          </div>
                        </td>

                        {/* Completion Checkbox */}
                        <td className="py-2.5 text-center">
                          <button
                            id={`check-set-${exIdx}-${setIdx}`}
                            onClick={() => handleToggleSet(exIdx, setIdx)}
                            className={`w-9 h-9 rounded-xl border flex items-center justify-center mx-auto transition-all cursor-pointer ${
                              s.completed
                                ? 'bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/20'
                                : 'bg-slate-900 border-slate-700 text-transparent hover:border-amber-500'
                            }`}
                          >
                            <Check className="w-5 h-5 stroke-[3]" />
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

      {/* Exercise Replacement Modal */}
      {replacingExIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#141924] border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-sky-400" />
              جایگزینی حرکت با تمرین ایمن‌تر یا معادل
            </h3>
            <p className="text-xs text-slate-400">
              حرکت فعلی: <strong>{exercisesState[replacingExIdx]?.exerciseName}</strong>
            </p>

            <input
              type="text"
              value={replacementName}
              onChange={(e) => setReplacementName(e.target.value)}
              placeholder="نام حرکت جایگزین (مثال: پرس بالا سینه دمبل)"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setReplacingExIdx(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
              >
                انصراف
              </button>
              <button
                onClick={handleConfirmReplace}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs"
              >
                تایید جایگزینی
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workout Completion Report Modal */}
      {completedSummaryLog && (
        <WorkoutSummaryModal
          sessionLog={completedSummaryLog}
          onClose={() => setCompletedSummaryLog(null)}
          onNavigateToDashboard={onNavigateToDashboard}
        />
      )}
    </div>
  );
};
