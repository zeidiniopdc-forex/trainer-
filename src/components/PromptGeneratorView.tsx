import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Bot,
  Flame,
  BookOpen,
  ArrowLeft,
  Settings2,
  Cpu,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Send,
  Loader2,
} from 'lucide-react';
import { AthleteProfile, WorkoutProgram } from '../types';
import { generateAIPrompt, generateProgramWithGemini } from '../utils/aiPromptGenerator';
import { soundManager } from '../utils/sound';

interface PromptGeneratorViewProps {
  profile: AthleteProfile;
  onImportProgram: (program: WorkoutProgram) => void;
  onNavigateToImport: () => void;
  theme?: 'dark' | 'light';
}

export const PromptGeneratorView: React.FC<PromptGeneratorViewProps> = ({
  profile,
  onImportProgram,
  onNavigateToImport,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [copied, setCopied] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini' | 'claude' | 'chatgpt' | 'deepseek'>('gemini');
  const [splitPreference, setSplitPreference] = useState<string>('Upper/Lower');
  const [rpeGuidance, setRpeGuidance] = useState<boolean>(true);

  // Direct AI Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<WorkoutProgram | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const promptText = generateAIPrompt(profile, {
    focusSplit: splitPreference,
    rpeGuidance,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    soundManager.playCountdownTick(1200);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDirectGeminiGenerate = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedResult(null);

    try {
      const res = await generateProgramWithGemini(promptText);
      if (res.success && res.data) {
        setGeneratedResult(res.data);
        soundManager.playWorkoutVictory();
      } else {
        setGenerationError(res.error || 'خطا در ارتباط با هوش مصنوعی. لطفاً پرامپت را کپی و در ابزار مورد نظر ارسال کنید.');
      }
    } catch (err: any) {
      setGenerationError(err?.message || 'خطای غیرمنتظره در پردازش');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyGeneratedProgram = () => {
    if (generatedResult) {
      onImportProgram(generatedResult);
    }
  };

  const cardBg = isLight
    ? 'bg-white border-slate-200 text-slate-800 shadow-md'
    : 'bg-[#141924] border-slate-800 text-slate-100 shadow-xl';

  const innerBg = isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800';

  return (
    <div className="space-y-6 pb-16 w-full max-w-full overflow-x-hidden">
      {/* Top Banner */}
      <div
        className={`border rounded-3xl p-4 sm:p-7 relative overflow-hidden transition-all ${
          isLight
            ? 'bg-gradient-to-l from-slate-100 via-amber-50/50 to-white border-slate-200 shadow-md'
            : 'bg-gradient-to-l from-slate-900 via-[#161a29] to-[#121622] border-slate-800 shadow-2xl'
        }`}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6 relative z-10">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-black shadow-lg shadow-amber-500/20 shrink-0">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className={`text-lg sm:text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  مهندسی پرامپت برنامه تمرینی
                </h2>
                <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold">
                  شاگرد: {profile.name}
                </span>
              </div>
              <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                تولید خودکار دستورالعمل‌های استاندارد بر اساس پرونده پزشکی، متدولوژی RP و سیستم‌های هایپرتروفی
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              id="prompt-copy-banner-btn"
              onClick={handleCopy}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-500 text-black border-emerald-400 shadow-md'
                  : isLight
                    ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4 text-amber-500" />}
              <span>{copied ? 'پرامپت کپی شد!' : 'کپی پرامپت اختصاصی'}</span>
            </button>

            <button
              id="prompt-direct-generate-btn"
              onClick={handleDirectGeminiGenerate}
              disabled={isGenerating}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50 cursor-pointer text-xs sm:text-sm"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
              <span>{isGenerating ? 'در حال طراحی برنامه...' : 'تولید مستقیم با Gemini AI'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scientific Framework Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        <div className={`border p-4 rounded-2xl flex items-start gap-3 ${cardBg}`}>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold">Brad Schoenfeld Hypertrophy</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              تاکید بر تنش مکانیکی (Mechanical Tension) به عنوان محرک اصلی و اجرای تمپوی کنترل‌شده در فاز منفی.
            </p>
          </div>
        </div>

        <div className={`border p-4 rounded-2xl flex items-start gap-3 ${cardBg}`}>
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold">Renaissance Periodization (RP)</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              تنظیم ست‌های هفتگی عضلات هدف بین لندمارک‌های MEV، MAV و زیر سقف خستگی سیستمیک MRV.
            </p>
          </div>
        </div>

        <div className={`border p-4 rounded-2xl flex items-start gap-3 ${cardBg}`}>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold">Eric Helms & ACSM Standards</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              مدیریت خستگی با RPE 7-9 / RIR 1-3، حفظ سلامت مفاصل آسیب‌دیده و جایگزینی حرکات هایپرتروفیک ایمن.
            </p>
          </div>
        </div>
      </div>

      {/* Direct AI Result Preview (if generated) */}
      {generatedResult && (
        <div className={`border-2 border-emerald-500/40 rounded-3xl p-4 sm:p-6 shadow-xl animate-in fade-in space-y-4 ${
          isLight ? 'bg-emerald-50/80' : 'bg-emerald-950/20'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-emerald-800/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold">{generatedResult.program_name}</h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  طول دوره: {generatedResult.duration} • شامل {toPersianDigits(generatedResult.days.length)} روز تمرینی تخصصی
                </p>
              </div>
            </div>

            <button
              onClick={handleApplyGeneratedProgram}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <span>انتقال مستقیم به بخش واردسازی و اجرای تمرین</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
            {generatedResult.days.map((d, idx) => (
              <div key={idx} className={`p-3.5 rounded-xl border ${innerBg}`}>
                <h4 className="text-xs font-bold text-amber-500">{d.day}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">عضلات: {d.muscle_groups.join('، ')}</p>
                <div className="mt-2 space-y-1 text-xs">
                  {d.exercises.slice(0, 3).map((ex, exIdx) => (
                    <div key={exIdx} className="flex justify-between text-[11px]">
                      <span className="truncate">{ex.name}</span>
                      <span className="text-amber-500 font-mono">{ex.sets} × {ex.reps}</span>
                    </div>
                  ))}
                  {d.exercises.length > 3 && (
                    <p className="text-[10px] text-sky-500">+ {toPersianDigits(d.exercises.length - 3)} حرکت تکمیلی دیگر...</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {generationError && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">راهنمای استفاده از مدل‌های خارجی:</p>
            <p className="leading-relaxed">
              {generationError}
            </p>
            <p className="text-slate-400 mt-1">
              می‌توانید به سادگی دکمه «کپی پرامپت اختصاصی» بالا را بزنید و متن را در 
              <strong> ChatGPT, Claude, DeepSeek یا وبسایت Gemini </strong> 
              قرار دهید؛ سپس پاسخ JSON را در تب «واردسازی برنامه JSON» پیست کنید.
            </p>
          </div>
        </div>
      )}

      {/* Prompt Display & Quick Model Launcher */}
      <div className={`border rounded-3xl p-4 sm:p-6 space-y-4 ${cardBg}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-amber-500" />
            <h3 className="text-xs sm:text-sm font-bold">متن نهایی پرامپت تخصصی (Prompt Engineering Output)</h3>
          </div>

          {/* External Model Link Shortcuts */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
            <span className="text-slate-400 text-[11px] hidden sm:inline">باز کردن در:</span>
            <a
              href="https://aistudio.google.com/"
              target="_blank"
              rel="noreferrer"
              className={`px-2.5 py-1 rounded-lg text-sky-600 dark:text-sky-300 flex items-center gap-1 border ${
                isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-800 border-slate-700'
              }`}
            >
              <span>AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://chatgpt.com/"
              target="_blank"
              rel="noreferrer"
              className={`px-2.5 py-1 rounded-lg text-emerald-600 dark:text-emerald-300 flex items-center gap-1 border ${
                isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-800 border-slate-700'
              }`}
            >
              <span>ChatGPT</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://claude.ai/"
              target="_blank"
              rel="noreferrer"
              className={`px-2.5 py-1 rounded-lg text-amber-600 dark:text-amber-300 flex items-center gap-1 border ${
                isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-800 border-slate-700'
              }`}
            >
              <span>Claude</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Prompt Codebox */}
        <div className="relative">
          <textarea
            readOnly
            value={promptText}
            rows={12}
            className={`w-full border rounded-2xl p-3 sm:p-4 text-xs font-mono leading-relaxed resize-none ${
              isLight
                ? 'bg-slate-900 text-slate-100 border-slate-700'
                : 'bg-[#0d1017] text-slate-300 border-slate-800'
            }`}
          />
          <button
            onClick={handleCopy}
            className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-slate-800/95 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'کپی شد' : 'کپی متن'}</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 text-xs text-slate-400">
          <span>طول پرامپت: {toPersianDigits(promptText.length)} کاراکتر • شامل استانداردهای هایپرتروفی</span>
          <button
            onClick={onNavigateToImport}
            className="text-sky-500 hover:underline flex items-center gap-1 font-bold"
          >
            <span>رفتن به صفحه واردسازی برنامه و تست JSON</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
