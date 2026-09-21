import React, { useState } from 'react';
import {
  User,
  Activity,
  HeartPulse,
  Target,
  Ruler,
  Save,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldCheck,
  TrendingUp,
  ArrowLeft,
  ArrowRight,
  Check,
} from 'lucide-react';
import {
  AthleteProfile,
  BodyMeasurements,
  ExperienceLevel,
  Gender,
  PrimaryGoal,
  TrainingLocation,
} from '../types';
import { toPersianDigits, getCurrentJalaliDate, formatJalaliDate } from '../utils/jalali';
import { soundManager } from '../utils/sound';

interface AthleteProfileViewProps {
  profile: AthleteProfile;
  onSaveProfile: (profile: AthleteProfile) => void;
  onNavigateToPrompt: () => void;
  theme?: 'dark' | 'light';
}

export const AthleteProfileView: React.FC<AthleteProfileViewProps> = ({
  profile,
  onSaveProfile,
  onNavigateToPrompt,
  theme = 'dark',
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<AthleteProfile>(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Quick addition states
  const [newEquipment, setNewEquipment] = useState('');
  const [newInjury, setNewInjury] = useState('');
  const [newLimitation, setNewLimitation] = useState('');
  const [newAvoidance, setNewAvoidance] = useState('');
  const [newStrengthExercise, setNewStrengthExercise] = useState('');
  const [newStrengthWeight, setNewStrengthWeight] = useState<number>(100);
  const [newStrengthReps, setNewStrengthReps] = useState<number>(6);

  // New measurement entry
  const [measChest, setMeasChest] = useState<number>(
    formData.measurements[formData.measurements.length - 1]?.chest || 105
  );
  const [measWaist, setMeasWaist] = useState<number>(
    formData.measurements[formData.measurements.length - 1]?.waist || 82
  );
  const [measBiceps, setMeasBiceps] = useState<number>(
    formData.measurements[formData.measurements.length - 1]?.bicepsRight || 39
  );
  const [measThigh, setMeasThigh] = useState<number>(
    formData.measurements[formData.measurements.length - 1]?.thighRight || 61
  );

  const isLight = theme === 'light';

  const muscleList = [
    'سینه بالایی (Clavicular Head)',
    'سینه میانی و پایینی',
    'سرشانه کناری (Lateral Delt)',
    'سرشانه خلفی (Rear Delt)',
    'زیربغل و لاتیسموس (Lats)',
    'بخش میانی پشت و ذوزنقه (Upper Back)',
    'جلو بازو (Biceps)',
    'پشت بازو (Triceps Long Head)',
    'چهارسر ران (Quads)',
    'همسترینگ و زنجیره خلفی',
    'سرینی و باسن (Glutes)',
    'ساق پا (Calves)',
    'عضلات میان‌تنه و شکم (Core/Abs)',
  ];

  const steps = [
    { step: 1, title: 'مشخصات فردی و فیزیکی', desc: 'سن، قد، وزن و سطح تجربه', icon: User },
    { step: 2, title: 'برنامه و محیط تمرین', desc: 'تعداد روزها، زمان و تجهیزات', icon: Activity },
    { step: 3, title: 'اهداف و عضلات هدف', desc: 'هایپرتروفی و عضلات اولویت‌دار', icon: Target },
    { step: 4, title: 'سلامت، آسیب‌ها و رکوردها', desc: 'آسیب‌ها، حرکات ممنوعه و سایز', icon: HeartPulse },
  ];

  const handleSave = () => {
    const updated = {
      ...formData,
      updatedAt: new Date().toISOString(),
    };
    onSaveProfile(updated);
    setSavedSuccess(true);
    soundManager.playSetCompleted();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const toggleMuscle = (muscle: string) => {
    setFormData((prev) => {
      const exists = prev.targetMuscles.includes(muscle);
      const updated = exists
        ? prev.targetMuscles.filter((m) => m !== muscle)
        : [...prev.targetMuscles, muscle];
      return { ...prev, targetMuscles: updated };
    });
  };

  const addEquipment = () => {
    if (!newEquipment.trim()) return;
    setFormData((prev) => ({
      ...prev,
      availableEquipment: [...prev.availableEquipment, newEquipment.trim()],
    }));
    setNewEquipment('');
  };

  const removeEquipment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      availableEquipment: prev.availableEquipment.filter((_, i) => i !== index),
    }));
  };

  const addInjury = () => {
    if (!newInjury.trim()) return;
    setFormData((prev) => ({
      ...prev,
      injuries: [...prev.injuries, newInjury.trim()],
    }));
    setNewInjury('');
  };

  const removeInjury = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      injuries: prev.injuries.filter((_, i) => i !== index),
    }));
  };

  const addAvoidance = () => {
    if (!newAvoidance.trim()) return;
    setFormData((prev) => ({
      ...prev,
      exerciseAvoidanceList: [...prev.exerciseAvoidanceList, newAvoidance.trim()],
    }));
    setNewAvoidance('');
  };

  const removeAvoidance = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      exerciseAvoidanceList: prev.exerciseAvoidanceList.filter((_, i) => i !== index),
    }));
  };

  const addStrengthRecord = () => {
    if (!newStrengthExercise.trim() || newStrengthWeight <= 0) return;
    const estimated1RM = Math.round(newStrengthWeight * (1 + newStrengthReps / 30));
    const currentJDate = formatJalaliDate(getCurrentJalaliDate(), 'standard');

    setFormData((prev) => ({
      ...prev,
      strengthRecords: [
        ...prev.strengthRecords,
        {
          exerciseName: newStrengthExercise.trim(),
          weightKg: newStrengthWeight,
          reps: newStrengthReps,
          estimatedOneRepMax: estimated1RM,
          date: currentJDate,
        },
      ],
    }));
    setNewStrengthExercise('');
  };

  const addMeasurementEntry = () => {
    const currentJDate = formatJalaliDate(getCurrentJalaliDate(), 'standard');
    const newEntry: BodyMeasurements = {
      date: currentJDate,
      chest: measChest,
      waist: measWaist,
      bicepsRight: measBiceps,
      bicepsLeft: measBiceps,
      thighRight: measThigh,
      thighLeft: measThigh,
    };

    setFormData((prev) => ({
      ...prev,
      measurements: [...prev.measurements, newEntry],
    }));
  };

  const nextStep = () => {
    handleSave();
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Theme helper classes
  const cardBg = isLight
    ? 'bg-white border-slate-200 text-slate-800 shadow-sm'
    : 'bg-[#141924] border-slate-800 text-slate-100 shadow-xl';

  const inputBg = isLight
    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500'
    : 'bg-slate-900 border-slate-700 text-white focus:border-amber-500';

  const labelText = isLight ? 'text-slate-600' : 'text-slate-400';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Profile Summary Header Card */}
      <div
        className={`border rounded-3xl p-5 sm:p-7 relative overflow-hidden transition-colors ${
          isLight
            ? 'bg-gradient-to-l from-slate-100 via-amber-50/40 to-white border-slate-200 shadow-md'
            : 'bg-gradient-to-l from-slate-900 via-[#141924] to-[#161d2b] border-slate-800 shadow-2xl'
        }`}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 flex items-center justify-center shadow-lg ${
                isLight
                  ? 'bg-amber-100 border-amber-400 text-amber-600'
                  : 'bg-slate-800 border-amber-500/40 text-amber-400 shadow-amber-500/10'
              }`}
            >
              <User className="w-9 h-9 sm:w-11 sm:h-11" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-xl sm:text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {formData.name || 'ورزشکار بدنسازی'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                  {formData.experienceLevel === 'beginner'
                    ? 'مبتدی'
                    : formData.experienceLevel === 'intermediate'
                    ? 'سطح متوسط'
                    : formData.experienceLevel === 'advanced'
                    ? 'پیشرفته'
                    : 'نخبه'}
                </span>
              </div>
              <p className={`text-xs sm:text-sm mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {toPersianDigits(formData.age)} سال • {toPersianDigits(formData.heightCm)} سانتی‌متر •{' '}
                {toPersianDigits(formData.weightKg)} کیلوگرم • {toPersianDigits(formData.weeklyDays)} روز تمرین در هفته
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-md border ${
                    isLight
                      ? 'bg-sky-50 text-sky-800 border-sky-200'
                      : 'bg-slate-800/80 text-sky-300 border-slate-700'
                  }`}
                >
                  هدف:{' '}
                  {formData.primaryGoal === 'hypertrophy'
                    ? 'افزایش حجم (هایپرتروفی)'
                    : formData.primaryGoal === 'strength'
                    ? 'افزایش قدرت'
                    : formData.primaryGoal === 'fat_loss'
                    ? 'کاهش چربی'
                    : 'ترکیب بدنی'}
                </span>
                {formData.targetMuscles.length > 0 && (
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-md border ${
                      isLight
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                    }`}
                  >
                    {toPersianDigits(formData.targetMuscles.length)} عضله اولویت‌دار
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              id="profile-save-btn"
              onClick={handleSave}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره پرونده</span>
            </button>

            <button
              id="profile-generate-prompt-btn"
              onClick={onNavigateToPrompt}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>تولید پرامپت هوش مصنوعی</span>
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div
            className={`mt-4 p-3 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in ${
              isLight
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>اطلاعات پرونده ورزشکار با موفقیت ذخیره شد.</span>
          </div>
        )}
      </div>

      {/* Step Navigation Progress Wizard */}
      <div className={`p-4 rounded-2xl border ${cardBg}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {steps.map((st) => {
            const Icon = st.icon;
            const isActive = currentStep === st.step;
            const isCompleted = currentStep > st.step;

            return (
              <button
                key={st.step}
                id={`profile-step-btn-${st.step}`}
                onClick={() => setCurrentStep(st.step)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-right transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/15 border-amber-500 text-amber-500 font-bold shadow-sm'
                    : isCompleted
                    ? isLight
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                    isActive
                      ? 'bg-amber-500 text-black'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isLight
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : toPersianDigits(st.step)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold truncate">{st.title}</h4>
                  <p className="text-[10px] opacity-75 truncate hidden sm:block">{st.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Basic Anthropometrics */}
      {currentStep === 1 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Box 1: Personal Info */}
            <div className={`border p-5 rounded-2xl space-y-4 ${cardBg}`}>
              <h3 className={`text-sm font-bold flex items-center gap-2 border-b pb-2 ${isLight ? 'border-slate-200 text-slate-900' : 'border-slate-800 text-white'}`}>
                <User className="w-4 h-4 text-amber-500" />
                مشخصات فردی
              </h3>

              <div>
                <label className={`block text-xs mb-1 ${labelText}`}>نام و نام خانوادگی ورزشکار</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ${inputBg}`}
                  placeholder="مثال: آرش رادمنش"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs mb-1 ${labelText}`}>سن (سال)</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ${inputBg}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs mb-1 ${labelText}`}>جنسیت</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ${inputBg}`}
                  >
                    <option value="male">آقا (مرد)</option>
                    <option value="female">خانم (زن)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Box 2: Anthropometrics & BMI */}
            <div className={`border p-5 rounded-2xl space-y-4 ${cardBg}`}>
              <h3 className={`text-sm font-bold flex items-center gap-2 border-b pb-2 ${isLight ? 'border-slate-200 text-slate-900' : 'border-slate-800 text-white'}`}>
                <Ruler className="w-4 h-4 text-sky-500" />
                قد و شاخص‌های وزنی
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs mb-1 ${labelText}`}>قد (سانتی‌متر)</label>
                  <input
                    type="number"
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ${inputBg}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs mb-1 ${labelText}`}>وزن فعلی (کیلوگرم)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ${inputBg}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs mb-1 ${labelText}`}>درصد تخمینی چربی بدن (Body Fat %)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.bodyFatPercentage || 14}
                  onChange={(e) => setFormData({ ...formData, bodyFatPercentage: Number(e.target.value) })}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ${inputBg}`}
                />
              </div>

              <div className={`p-3 rounded-xl border flex justify-between items-center text-xs ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                <span className={labelText}>شاخص توده بدنی (BMI):</span>
                <span className="font-bold text-amber-500">
                  {toPersianDigits((formData.weightKg / Math.pow(formData.heightCm / 100, 2)).toFixed(1))}
                </span>
              </div>
            </div>

            {/* Box 3: Experience */}
            <div className={`border p-5 rounded-2xl space-y-4 ${cardBg}`}>
              <h3 className={`text-sm font-bold flex items-center gap-2 border-b pb-2 ${isLight ? 'border-slate-200 text-slate-900' : 'border-slate-800 text-white'}`}>
                <Flame className="w-4 h-4 text-amber-500" />
                سطح سابقه و تجربه
              </h3>

              <div>
                <label className={`block text-xs mb-1 ${labelText}`}>سطح تجربه ورزشکار</label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as ExperienceLevel })}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ${inputBg}`}
                >
                  <option value="beginner">مبتدی (کمتر از ۱ سال سابقه تمرین جدی)</option>
                  <option value="intermediate">متوسط (۱ تا ۳ سال سابقه منظم)</option>
                  <option value="advanced">پیشرفته (۳ تا ۶ سال سابقه مستمر)</option>
                  <option value="elite">نخبه / رقابتی (بیش از ۶ سال سابقه قهرمانی)</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs mb-1 ${labelText}`}>سابقه تمرین مستمر با وزنه (سال)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.trainingHistoryYears}
                  onChange={(e) => setFormData({ ...formData, trainingHistoryYears: Number(e.target.value) })}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ${inputBg}`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Training & Equipment */}
      {currentStep === 2 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className={`border p-5 rounded-2xl space-y-4 ${cardBg}`}>
              <h3 className={`text-sm font-bold flex items-center gap-2 border-b pb-2 ${isLight ? 'border-slate-200 text-slate-900' : 'border-slate-800 text-white'}`}>
                <Activity className="w-4 h-4 text-amber-500" />
                فرکانس و محیط تمرینی
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs mb-1 ${labelText}`}>روزهای تمرین در هفته</label>
                  <select
                    value={formData.weeklyDays}
                    onChange={(e) => setFormData({ ...formData, weeklyDays: Number(e.target.value) })}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ${inputBg}`}
                  >
                    <option value="2">۲ روز در هفته</option>
                    <option value="3">۳ روز در هفته (فول بادی)</option>
                    <option value="4">۴ روز در هفته (Upper / Lower)</option>
                    <option value="5">۵ روز در هفته (PPL + Upper/Lower)</option>
                    <option value="6">۶ روز در هفته (PPL x 2)</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs mb-1 ${labelText}`}>مدت هر جلسه (دقیقه)</label>
                  <input
                    type="number"
                    value={formData.sessionDurationMinutes}
                    onChange={(e) => setFormData({ ...formData, sessionDurationMinutes: Number(e.target.value) })}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ${inputBg}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs mb-1 ${labelText}`}>محیط تمرینی</label>
                <select
                  value={formData.trainingLocation}
                  onChange={(e) => setFormData({ ...formData, trainingLocation: e.target.value as TrainingLocation })}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ${inputBg}`}
                >
                  <option value="gym">باشگاه بدنسازی مجهز (Commercial Gym)</option>
                  <option value="home">تمرین در منزل با دمبل و کش (Home Gym)</option>
                  <option value="hybrid">ترکیبی باشگاه و منزل (Hybrid)</option>
                </select>
              </div>
            </div>

            <div className={`border p-5 rounded-2xl space-y-4 ${cardBg}`}>
              <h3 className={`text-sm font-bold flex items-center gap-2 border-b pb-2 ${isLight ? 'border-slate-200 text-slate-900' : 'border-slate-800 text-white'}`}>
                <ShieldCheck className="w-4 h-4 text-sky-500" />
                تجهیزات در دسترس
              </h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addEquipment()}
                  placeholder="تجهیز جدید (دستگاه اسمیت، سیم‌کش، دمبل...)"
                  className={`flex-1 rounded-xl px-3.5 py-2 text-xs focus:outline-none ${inputBg}`}
                />
                <button
                  onClick={addEquipment}
                  className="px-3 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-600 dark:text-sky-300 border border-sky-500/30 rounded-xl text-xs flex items-center gap-1 cursor-pointer font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>افزودن</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {formData.availableEquipment.map((eq, i) => (
                  <span
                    key={i}
                    className={`px-3 py-1 rounded-xl text-xs flex items-center gap-1.5 border ${
                      isLight
                        ? 'bg-slate-100 border-slate-200 text-slate-800'
                        : 'bg-slate-900 text-slate-200 border-slate-700'
                    }`}
                  >
                    <span>{eq}</span>
                    <button
                      onClick={() => removeEquipment(i)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Goals & Target Muscles */}
      {currentStep === 3 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className={`border p-5 rounded-2xl space-y-4 ${cardBg}`}>
              <h3 className={`text-sm font-bold flex items-center gap-2 border-b pb-2 ${isLight ? 'border-slate-200 text-slate-900' : 'border-slate-800 text-white'}`}>
                <Target className="w-4 h-4 text-amber-500" />
                هدف اصلی و افق زمانی دوره
              </h3>

              <div>
                <label className={`block text-xs mb-1 ${labelText}`}>هدف اصلی (Primary Goal)</label>
                <select
                  value={formData.primaryGoal}
                  onChange={(e) => setFormData({ ...formData, primaryGoal: e.target.value as PrimaryGoal })}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ${inputBg}`}
                >
                  <option value="hypertrophy">افزایش حجم عضلانی و هایپرتروفی تخصصی (Muscle Hypertrophy)</option>
                  <option value="strength">افزایش حداکثر قدرت و توان انفجاری (Strength & 1RM)</option>
                  <option value="fat_loss">کاهش چربی بدن و کات عضلانی (Fat Loss / Cutting)</option>
                  <option value="recomposition">بازسازی همزمان ترکیب بدنی (Body Recomposition)</option>
                  <option value="contest_prep">آماده‌سازی مسابقات فیزیک / پرورش اندام (Contest Prep)</option>
                  <option value="general_fitness">سلامت عمومی و آمادگی جسمانی (General Fitness)</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs mb-1 ${labelText}`}>هدف ثانویه (Secondary Goal)</label>
                <input
                  type="text"
                  value={formData.secondaryGoal || ''}
                  onChange={(e) => setFormData({ ...formData, secondaryGoal: e.target.value })}
                  placeholder="مثال: رشد متقارن دلتوئید جانبی و سینه بالایی"
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ${inputBg}`}
                />
              </div>

              <div>
                <label className={`block text-xs mb-1 ${labelText}`}>مدت زمان اجرای دوره (هفته)</label>
                <input
                  type="number"
                  value={formData.timelineWeeks}
                  onChange={(e) => setFormData({ ...formData, timelineWeeks: Number(e.target.value) })}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ${inputBg}`}
                />
              </div>
            </div>

            <div className={`border p-5 rounded-2xl space-y-4 ${cardBg}`}>
              <h3 className={`text-sm font-bold flex items-center gap-2 border-b pb-2 ${isLight ? 'border-slate-200 text-slate-900' : 'border-slate-800 text-white'}`}>
                <Flame className="w-4 h-4 text-sky-500" />
                عضلات دارای اولویت و تمرکز ویژه (Target Muscle Focus)
              </h3>
              <p className={`text-xs ${labelText}`}>
                هوش مصنوعی برای این عضلات فرکانس بالاتر و حجم نزدیک به سقف ریکاوری (MAV/MRV) قرار می‌دهد:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {muscleList.map((m) => {
                  const isSelected = formData.targetMuscles.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleMuscle(m)}
                      className={`p-2.5 rounded-xl text-xs font-medium text-right border transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? isLight
                            ? 'bg-amber-100 text-amber-900 border-amber-400 font-bold'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                          : isLight
                          ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="truncate">{m}</span>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                      ) : (
                        <span className={`w-4 h-4 rounded-full border shrink-0 ${isLight ? 'border-slate-300' : 'border-slate-700'}`}></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Health, Injuries, Avoidances & Measurements */}
      {currentStep === 4 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Injuries & Limitations */}
            <div className={`border p-5 rounded-2xl space-y-4 ${cardBg}`}>
              <h3 className={`text-sm font-bold flex items-center gap-2 border-b pb-2 ${isLight ? 'border-slate-200 text-slate-900' : 'border-slate-800 text-white'}`}>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                آسیب‌دیدگی‌ها و مفاصل حساس
              </h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newInjury}
                  onChange={(e) => setNewInjury(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addInjury()}
                  placeholder="ثبت آسیب (حساسیت مهره L5، تاندونیت شانه...)"
                  className={`flex-1 rounded-xl px-3.5 py-2 text-xs focus:outline-none ${inputBg}`}
                />
                <button
                  onClick={addInjury}
                  className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-600 dark:text-rose-300 border border-rose-500/30 rounded-xl text-xs flex items-center gap-1 cursor-pointer font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>افزودن</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.injuries.length === 0 ? (
                  <p className={`text-xs ${labelText}`}>هیچ آسیب‌دیدگی ثبت نشده است.</p>
                ) : (
                  formData.injuries.map((inj, i) => (
                    <span
                      key={i}
                      className="bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/20 px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5"
                    >
                      <span>{inj}</span>
                      <button onClick={() => removeInjury(i)} className="hover:text-red-700 dark:hover:text-white">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Avoidance List */}
            <div className={`border p-5 rounded-2xl space-y-4 ${cardBg}`}>
              <h3 className={`text-sm font-bold flex items-center gap-2 border-b pb-2 ${isLight ? 'border-slate-200 text-slate-900' : 'border-slate-800 text-white'}`}>
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                لیست حرکات ممنوعه و نامطلوب (Avoidance List)
              </h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAvoidance}
                  onChange={(e) => setNewAvoidance(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addAvoidance()}
                  placeholder="حرکت ممنوع (پرس سرشانه هالتر از پشت گردن...)"
                  className={`flex-1 rounded-xl px-3.5 py-2 text-xs focus:outline-none ${inputBg}`}
                />
                <button
                  onClick={addAvoidance}
                  className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-xl text-xs flex items-center gap-1 cursor-pointer font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>افزودن</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.exerciseAvoidanceList.length === 0 ? (
                  <p className={`text-xs ${labelText}`}>حرکت ممنوعه‌ای ثبت نشده است.</p>
                ) : (
                  formData.exerciseAvoidanceList.map((av, i) => (
                    <span
                      key={i}
                      className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5"
                    >
                      <span>{av}</span>
                      <button onClick={() => removeAvoidance(i)} className="hover:text-black dark:hover:text-white">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Strength Records */}
            <div className={`border p-5 rounded-2xl space-y-4 ${cardBg}`}>
              <h3 className={`text-sm font-bold flex items-center gap-2 border-b pb-2 ${isLight ? 'border-slate-200 text-slate-900' : 'border-slate-800 text-white'}`}>
                <TrendingUp className="w-4 h-4 text-amber-500" />
                رکوردهای وزنه و تخمین ۱RM (Strength Records)
              </h3>

              <div className={`p-3 rounded-xl border space-y-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newStrengthExercise}
                    onChange={(e) => setNewStrengthExercise(e.target.value)}
                    placeholder="نام حرکت (مثال: پرس سینه)"
                    className={`sm:col-span-3 rounded-lg px-3 py-2 text-xs ${inputBg}`}
                  />
                  <div>
                    <label className={`text-[10px] block mb-0.5 ${labelText}`}>وزنه (کیلوگرم)</label>
                    <input
                      type="number"
                      value={newStrengthWeight}
                      onChange={(e) => setNewStrengthWeight(Number(e.target.value))}
                      className={`w-full rounded-lg px-2 py-1.5 text-xs ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`text-[10px] block mb-0.5 ${labelText}`}>تعداد تکرار</label>
                    <input
                      type="number"
                      value={newStrengthReps}
                      onChange={(e) => setNewStrengthReps(Number(e.target.value))}
                      className={`w-full rounded-lg px-2 py-1.5 text-xs ${inputBg}`}
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={addStrengthRecord}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ثبت رکورد</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className={`divide-y max-h-48 overflow-y-auto ${isLight ? 'divide-slate-100' : 'divide-slate-800'}`}>
                {formData.strengthRecords.map((sr, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between">
                    <div>
                      <h4 className={`text-xs font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{sr.exerciseName}</h4>
                      <p className={`text-[11px] mt-0.5 ${labelText}`}>
                        {toPersianDigits(sr.weightKg)} kg × {toPersianDigits(sr.reps)} reps • تاریخ: {sr.date}
                      </p>
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-amber-500">
                        تخمین ۱RM: {toPersianDigits(sr.estimatedOneRepMax)} kg
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Anthropometric Measurements */}
            <div className={`border p-5 rounded-2xl space-y-4 ${cardBg}`}>
              <h3 className={`text-sm font-bold flex items-center gap-2 border-b pb-2 ${isLight ? 'border-slate-200 text-slate-900' : 'border-slate-800 text-white'}`}>
                <Ruler className="w-4 h-4 text-sky-500" />
                سایزگیری اندام‌ها (سانتی‌متر)
              </h3>

              <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                <div>
                  <label className={`text-[10px] block mb-0.5 ${labelText}`}>دور سینه</label>
                  <input
                    type="number"
                    step="0.5"
                    value={measChest}
                    onChange={(e) => setMeasChest(Number(e.target.value))}
                    className={`w-full rounded-lg px-2 py-1.5 text-xs ${inputBg}`}
                  />
                </div>
                <div>
                  <label className={`text-[10px] block mb-0.5 ${labelText}`}>دور کمر</label>
                  <input
                    type="number"
                    step="0.5"
                    value={measWaist}
                    onChange={(e) => setMeasWaist(Number(e.target.value))}
                    className={`w-full rounded-lg px-2 py-1.5 text-xs ${inputBg}`}
                  />
                </div>
                <div>
                  <label className={`text-[10px] block mb-0.5 ${labelText}`}>دور بازو</label>
                  <input
                    type="number"
                    step="0.5"
                    value={measBiceps}
                    onChange={(e) => setMeasBiceps(Number(e.target.value))}
                    className={`w-full rounded-lg px-2 py-1.5 text-xs ${inputBg}`}
                  />
                </div>
                <div>
                  <label className={`text-[10px] block mb-0.5 ${labelText}`}>دور ران</label>
                  <input
                    type="number"
                    step="0.5"
                    value={measThigh}
                    onChange={(e) => setMeasThigh(Number(e.target.value))}
                    className={`w-full rounded-lg px-2 py-1.5 text-xs ${inputBg}`}
                  />
                </div>
                <div className="col-span-2 sm:col-span-4 mt-2">
                  <button
                    onClick={addMeasurementEntry}
                    className="w-full bg-sky-500/20 hover:bg-sky-500/30 text-sky-600 dark:text-sky-300 border border-sky-500/30 font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ثبت سایزگیری در تاریخ امروز</span>
                  </button>
                </div>
              </div>

              <div className={`divide-y max-h-40 overflow-y-auto ${isLight ? 'divide-slate-100' : 'divide-slate-800'}`}>
                {formData.measurements.map((m, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between text-xs">
                    <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{m.date}</span>
                    <div className={`flex gap-3 ${labelText}`}>
                      <span>سینه: {toPersianDigits(m.chest || '-')}</span>
                      <span>کمر: {toPersianDigits(m.waist || '-')}</span>
                      <span>بازو: {toPersianDigits(m.bicepsRight || '-')}</span>
                      <span>ران: {toPersianDigits(m.thighRight || '-')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination & Next/Previous Buttons Bar */}
      <div className={`flex items-center justify-between p-4 rounded-2xl border ${cardBg}`}>
        <div>
          {currentStep > 1 ? (
            <button
              id="profile-prev-step-btn"
              onClick={prevStep}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <ArrowRight className="w-4 h-4" />
              <span>مرحله قبلی ({steps[currentStep - 2]?.title})</span>
            </button>
          ) : (
            <div />
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs ${labelText}`}>
            گام {toPersianDigits(currentStep)} از {toPersianDigits(4)}
          </span>

          {currentStep < 4 ? (
            <button
              id="profile-next-step-btn"
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <span>مرحله بعدی: {steps[currentStep]?.title}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="profile-finish-step-btn"
              onClick={() => {
                handleSave();
                onNavigateToPrompt();
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>تکمیل پرونده و تولید برنامه هوش مصنوعی</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
