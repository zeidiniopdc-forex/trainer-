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
} from 'lucide-react';
import { AthleteProfile, BodyMeasurements, ExperienceLevel, Gender, PrimaryGoal, TrainingLocation } from '../types';
import { toPersianDigits, getCurrentJalaliDate, formatJalaliDate } from '../utils/jalali';
import { soundManager } from '../utils/sound';

interface AthleteProfileViewProps {
  profile: AthleteProfile;
  onSaveProfile: (profile: AthleteProfile) => void;
  onNavigateToPrompt: () => void;
}

type ProfileTab = 'basic' | 'training' | 'health' | 'goals' | 'measurements';

export const AthleteProfileView: React.FC<AthleteProfileViewProps> = ({
  profile,
  onSaveProfile,
  onNavigateToPrompt,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<ProfileTab>('basic');
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
  const [measChest, setMeasChest] = useState<number>(formData.measurements[formData.measurements.length - 1]?.chest || 105);
  const [measWaist, setMeasWaist] = useState<number>(formData.measurements[formData.measurements.length - 1]?.waist || 82);
  const [measBiceps, setMeasBiceps] = useState<number>(formData.measurements[formData.measurements.length - 1]?.bicepsRight || 39);
  const [measThigh, setMeasThigh] = useState<number>(formData.measurements[formData.measurements.length - 1]?.thighRight || 61);

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
    // Epley formula for 1RM estimate
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

  return (
    <div className="space-y-6 pb-12">
      {/* Top Profile Summary Card */}
      <div className="bg-gradient-to-l from-slate-900 via-[#141924] to-[#161d2b] border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800 border-2 border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10 text-amber-400">
              <User className="w-9 h-9 sm:w-11 sm:h-11" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">{formData.name || 'ورزشکار بدنسازی'}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                  {formData.experienceLevel === 'beginner' ? 'مبتدی' : formData.experienceLevel === 'intermediate' ? 'سطح متوسط' : formData.experienceLevel === 'advanced' ? 'پیشرفته' : 'نخبه'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {toPersianDigits(formData.age)} سال • {toPersianDigits(formData.heightCm)} سانتی‌متر • {toPersianDigits(formData.weightKg)} کیلوگرم • {toPersianDigits(formData.weeklyDays)} روز تمرین در هفته
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-[11px] bg-slate-800/80 text-sky-300 px-2.5 py-0.5 rounded-md border border-slate-700">
                  هدف: {formData.primaryGoal === 'hypertrophy' ? 'افزایش حجم (هایپرتروفی)' : formData.primaryGoal === 'strength' ? 'افزایش قدرت' : formData.primaryGoal === 'fat_loss' ? 'کاهش چربی' : 'ترکیب بدنی'}
                </span>
                {formData.targetMuscles.length > 0 && (
                  <span className="text-[11px] bg-amber-500/10 text-amber-300 px-2.5 py-0.5 rounded-md border border-amber-500/20">
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
              <span>ذخیره تغییرات</span>
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
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>اطلاعات پرونده ورزشکار با موفقیت در دیتابیس Room محلی ذخیره شد.</span>
          </div>
        )}
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'basic' as ProfileTab, label: 'اطلاعات فردی و آنتروپومتریک', icon: User },
          { id: 'training' as ProfileTab, label: 'سوابق و شرایط تمرین', icon: Activity },
          { id: 'health' as ProfileTab, label: 'سلامت و محدودیت‌های حرکتی', icon: HeartPulse },
          { id: 'goals' as ProfileTab, label: 'اهداف و اولویت‌های عضلانی', icon: Target },
          { id: 'measurements' as ProfileTab, label: 'سایزها و رکوردهای وزنه', icon: Ruler },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`profile-subtab-${tab.id}`}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-slate-800 text-amber-400 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Basic Anthropometrics */}
      {activeSubTab === 'basic' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-[#141924] border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <User className="w-4 h-4 text-amber-400" />
              مشخصات فردی
            </h3>

            <div>
              <label className="block text-xs text-slate-400 mb-1">نام و نام خانوادگی ورزشکار</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                placeholder="مثال: آرش رادمنش"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">سن (سال)</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">جنسیت</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="male">آقا (مرد)</option>
                  <option value="female">خانم (زن)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-[#141924] border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Ruler className="w-4 h-4 text-sky-400" />
              قد و شاخص‌های وزنی
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">قد (سانتی‌متر)</label>
                <input
                  type="number"
                  value={formData.heightCm}
                  onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">وزن فعلی (کیلوگرم)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weightKg}
                  onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">درصد تخمینی چربی بدن (Body Fat %)</label>
              <input
                type="number"
                step="0.1"
                value={formData.bodyFatPercentage || 14}
                onChange={(e) => setFormData({ ...formData, bodyFatPercentage: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">شاخص توده بدنی (BMI):</span>
              <span className="font-bold text-amber-400">
                {toPersianDigits((formData.weightKg / Math.pow(formData.heightCm / 100, 2)).toFixed(1))}
              </span>
            </div>
          </div>

          <div className="bg-[#141924] border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Flame className="w-4 h-4 text-amber-400" />
              سطح سابقه و تجربه
            </h3>

            <div>
              <label className="block text-xs text-slate-400 mb-1">سطح تجربه ورزشکار</label>
              <select
                value={formData.experienceLevel}
                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as ExperienceLevel })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="beginner">مبتدی (کمتر از ۱ سال سابقه تمرین جدی)</option>
                <option value="intermediate">متوسط (۱ تا ۳ سال سابقه منظم)</option>
                <option value="advanced">پیشرفته (۳ تا ۶ سال سابقه مستمر)</option>
                <option value="elite">نخبه / رقابتی (بیش از ۶ سال سابقه قهرمانی)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">سابقه تمرین مستمر با وزنه (سال)</label>
              <input
                type="number"
                step="0.5"
                value={formData.trainingHistoryYears}
                onChange={(e) => setFormData({ ...formData, trainingHistoryYears: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Training & Equipment */}
      {activeSubTab === 'training' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-[#141924] border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Activity className="w-4 h-4 text-amber-400" />
              فرکانس و محیط تمرینی
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">روزهای تمرین در هفته</label>
                <select
                  value={formData.weeklyDays}
                  onChange={(e) => setFormData({ ...formData, weeklyDays: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="2">۲ روز در هفته</option>
                  <option value="3">۳ روز در هفته (فول بادی)</option>
                  <option value="4">۴ روز در هفته (Upper / Lower)</option>
                  <option value="5">۵ روز در هفته (PPL + Upper/Lower)</option>
                  <option value="6">۶ روز در هفته (PPL x 2)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">مدت زمان هر جلسه (دقیقه)</label>
                <input
                  type="number"
                  value={formData.sessionDurationMinutes}
                  onChange={(e) => setFormData({ ...formData, sessionDurationMinutes: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">محیط تمرینی</label>
              <select
                value={formData.trainingLocation}
                onChange={(e) => setFormData({ ...formData, trainingLocation: e.target.value as TrainingLocation })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="gym">باشگاه بدنسازی مجهز (Commercial Gym)</option>
                <option value="home">تمرین در منزل با دمبل و کش (Home Gym)</option>
                <option value="hybrid">ترکیبی باشگاه و منزل (Hybrid)</option>
              </select>
            </div>
          </div>

          <div className="bg-[#141924] border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              تجهیزات در دسترس
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={newEquipment}
                onChange={(e) => setNewEquipment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addEquipment()}
                placeholder="تجهیز جدید (مثلاً: دستگاه پرس پا، کش لوپ...)"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
              <button
                onClick={addEquipment}
                className="px-3 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>افزودن</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {formData.availableEquipment.map((eq, i) => (
                <span
                  key={i}
                  className="bg-slate-900 text-slate-200 border border-slate-700 px-3 py-1 rounded-xl text-xs flex items-center gap-1.5"
                >
                  <span>{eq}</span>
                  <button
                    onClick={() => removeEquipment(i)}
                    className="text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Health & Limitations */}
      {activeSubTab === 'health' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-[#141924] border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              آسیب‌دیدگی‌ها و مفاصل حساس
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={newInjury}
                onChange={(e) => setNewInjury(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addInjury()}
                placeholder="ثبت آسیب (مثلاً: حساسیت مهره L5 کمر، تاندونیت شانه راست)"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
              <button
                onClick={addInjury}
                className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>افزودن</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.injuries.length === 0 ? (
                <p className="text-xs text-slate-500">هیچ آسیب‌دیدگی ثبت نشده است.</p>
              ) : (
                formData.injuries.map((inj, i) => (
                  <span
                    key={i}
                    className="bg-rose-500/10 text-rose-300 border border-rose-500/20 px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <span>{inj}</span>
                    <button onClick={() => removeInjury(i)} className="hover:text-white">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="bg-[#141924] border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              لیست حرکات ممنوعه و نامطلوب (Avoidance List)
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={newAvoidance}
                onChange={(e) => setNewAvoidance(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addAvoidance()}
                placeholder="حرکت ممنوع (مثلاً: پرس سرشانه هالتر از پشت گردن)"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={addAvoidance}
                className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>افزودن</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.exerciseAvoidanceList.length === 0 ? (
                <p className="text-xs text-slate-500">حرکت ممنوعه‌ای ثبت نشده است.</p>
              ) : (
                formData.exerciseAvoidanceList.map((av, i) => (
                  <span
                    key={i}
                    className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <span>{av}</span>
                    <button onClick={() => removeAvoidance(i)} className="hover:text-white">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Goals & Target Muscles */}
      {activeSubTab === 'goals' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-[#141924] border border-slate-800 p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <Target className="w-4 h-4 text-amber-400" />
                هدف اصلی و افق زمانی دوره
              </h3>

              <div>
                <label className="block text-xs text-slate-400 mb-1">هدف اصلی اولویت ۱ (Primary Goal)</label>
                <select
                  value={formData.primaryGoal}
                  onChange={(e) => setFormData({ ...formData, primaryGoal: e.target.value as PrimaryGoal })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
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
                <label className="block text-xs text-slate-400 mb-1">هدف ثانویه (Secondary Goal)</label>
                <input
                  type="text"
                  value={formData.secondaryGoal || ''}
                  onChange={(e) => setFormData({ ...formData, secondaryGoal: e.target.value })}
                  placeholder="مثال: رشد متقارن دلتوئید جانبی و سینه بالایی"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">مدت زمان اجرای دوره (هفته)</label>
                <input
                  type="number"
                  value={formData.timelineWeeks}
                  onChange={(e) => setFormData({ ...formData, timelineWeeks: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="bg-[#141924] border border-slate-800 p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <Flame className="w-4 h-4 text-sky-400" />
                عضلات دارای اولویت و تمرکز ویژه (Target Muscle Focus)
              </h3>
              <p className="text-xs text-slate-400">
                هوش مصنوعی برای این عضلات فرکانس هفتگی بالاتر (۲ تا ۳ جلسه) و حجم نزدیک به سقف ریکاوری (MAV/MRV) در نظر خواهد گرفت:
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
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="truncate">{m}</span>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-700 shrink-0"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Measurements & Strength Records */}
      {activeSubTab === 'measurements' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Strength Records */}
            <div className="bg-[#141924] border border-slate-800 p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                رکوردهای وزنه و تخمین ۱RM (Strength Records)
              </h3>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newStrengthExercise}
                    onChange={(e) => setNewStrengthExercise(e.target.value)}
                    placeholder="نام حرکت (مثال: پرس سینه)"
                    className="sm:col-span-3 bg-slate-850 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">وزنه (کیلوگرم)</label>
                    <input
                      type="number"
                      value={newStrengthWeight}
                      onChange={(e) => setNewStrengthWeight(Number(e.target.value))}
                      className="w-full bg-slate-850 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">تعداد تکرار</label>
                    <input
                      type="number"
                      value={newStrengthReps}
                      onChange={(e) => setNewStrengthReps(Number(e.target.value))}
                      className="w-full bg-slate-850 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
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

              <div className="divide-y divide-slate-800 max-h-56 overflow-y-auto">
                {formData.strengthRecords.map((sr, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-white">{sr.exerciseName}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {toPersianDigits(sr.weightKg)} kg × {toPersianDigits(sr.reps)} reps • تاریخ: {sr.date}
                      </p>
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-amber-400">
                        تخمین ۱RM: {toPersianDigits(sr.estimatedOneRepMax)} kg
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Anthropometric Measurements */}
            <div className="bg-[#141924] border border-slate-800 p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <Ruler className="w-4 h-4 text-sky-400" />
                سایزگیری اندام‌ها (دور عضلات به سانتی‌متر)
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">دور سینه</label>
                  <input
                    type="number"
                    step="0.5"
                    value={measChest}
                    onChange={(e) => setMeasChest(Number(e.target.value))}
                    className="w-full bg-slate-850 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">دور کمر</label>
                  <input
                    type="number"
                    step="0.5"
                    value={measWaist}
                    onChange={(e) => setMeasWaist(Number(e.target.value))}
                    className="w-full bg-slate-850 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">دور بازو</label>
                  <input
                    type="number"
                    step="0.5"
                    value={measBiceps}
                    onChange={(e) => setMeasBiceps(Number(e.target.value))}
                    className="w-full bg-slate-850 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">دور ران</label>
                  <input
                    type="number"
                    step="0.5"
                    value={measThigh}
                    onChange={(e) => setMeasThigh(Number(e.target.value))}
                    className="w-full bg-slate-850 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="col-span-2 sm:col-span-4 mt-2">
                  <button
                    onClick={addMeasurementEntry}
                    className="w-full bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ثبت سایزگیری در تقویم امروز</span>
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-800 max-h-48 overflow-y-auto">
                {formData.measurements.map((m, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{m.date}</span>
                    <div className="flex gap-3 text-slate-400">
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
    </div>
  );
};
