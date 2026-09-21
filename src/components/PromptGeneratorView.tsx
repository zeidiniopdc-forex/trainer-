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
}

export const PromptGeneratorView: React.FC<PromptGeneratorViewProps> = ({
  profile,
  onImportProgram,
  onNavigateToImport,
}) => {
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

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-[#151c2a] to-[#121622] border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
              <Sparkles className="w-9 h-9" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>ژنراتور پرامپت علمی مربیگری</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30">
                  فرمت استاندارد JSON
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                تولید پرامپت فوق‌حرفه‌ای بر اساس آخرین دستاوردهای هایپرتروفی براد شونفلد، اریک هلمز و لندمارک‌های RP
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              id="prompt-copy-btn"
              onClick={handleCopy}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all shadow-lg cursor-pointer ${
                copied
                  ? 'bg-emerald-500 text-black shadow-emerald-500/20'
                  : 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'پرامپت کپی شد!' : 'کپی پرامپت اختصاصی'}</span>
            </button>

            <button
              id="prompt-direct-generate-btn"
              onClick={handleDirectGeminiGenerate}
              disabled={isGenerating}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
              <span>{isGenerating ? 'در حال طراحی برنامه...' : 'تولید مستقیم با Gemini AI'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scientific Framework Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#141924] border border-slate-800 p-4 rounded-2xl flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Brad Schoenfeld Hypertrophy</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              تاکید بر تنش مکانیکی (Mechanical Tension) به عنوان محرک اصلی و اجرای تمپوی کنترل‌شده در فاز منفی.
            </p>
          </div>
        </div>

        <div className="bg-[#141924] border border-slate-800 p-4 rounded-2xl flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Renaissance Periodization (RP)</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              تنظیم ست‌های هفتگی عضلات هدف بین لندمارک‌های MEV، MAV و زیر سقف خستگی سیستمیک MRV.
            </p>
          </div>
        </div>

        <div className="bg-[#141924] border border-slate-800 p-4 rounded-2xl flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Eric Helms & ACSM Standards</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              مدیریت خستگی با RPE 7-9 / RIR 1-3، حفظ سلامت مفاصل آسیب‌دیده و جایگزینی حرکات هایپرتروفیک ایمن.
            </p>
          </div>
        </div>
      </div>

      {/* Direct AI Result Preview (if generated) */}
      {generatedResult && (
        <div className="bg-emerald-950/20 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-xl animate-in fade-in space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-emerald-800/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{generatedResult.program_name}</h3>
                <p className="text-xs text-emerald-300">
                  طول دوره: {generatedResult.duration} • شامل {generatedResult.days.length} روز تمرینی تخصصی
                </p>
              </div>
            </div>

            <button
              onClick={handleApplyGeneratedProgram}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <span>انتقال مستقیم به بخش واردسازی و اجرای تمرین</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
            {generatedResult.days.map((d, idx) => (
              <div key={idx} className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
                <h4 className="text-xs font-bold text-amber-300">{d.day}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">عضلات: {d.muscle_groups.join('، ')}</p>
                <div className="mt-2 space-y-1 text-xs text-slate-300">
                  {d.exercises.slice(0, 3).map((ex, exIdx) => (
                    <div key={exIdx} className="flex justify-between text-[11px]">
                      <span className="truncate">{ex.name}</span>
                      <span className="text-amber-400 font-mono">{ex.sets} × {ex.reps}</span>
                    </div>
                  ))}
                  {d.exercises.length > 3 && (
                    <p className="text-[10px] text-sky-400">+ {d.exercises.length - 3} حرکت تکمیلی دیگر...</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {generationError && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
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
      <div className="bg-[#141924] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">متن نهایی پرامپت تخصصی (Prompt Engineering Output)</h3>
          </div>

          {/* External Model Link Shortcuts */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 hidden sm:inline">باز کردن سریع در:</span>
            <a
              href="https://aistudio.google.com/"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 flex items-center gap-1 border border-slate-700"
            >
              <span>AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://chatgpt.com/"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 flex items-center gap-1 border border-slate-700"
            >
              <span>ChatGPT</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://claude.ai/"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 flex items-center gap-1 border border-slate-700"
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
            rows={14}
            className="w-full bg-[#0d1017] border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-500 leading-relaxed resize-none scrollbar-thin"
          />
          <button
            onClick={handleCopy}
            className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'کپی شد' : 'کپی متن'}</span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
          <span>طول پرامپت: {promptText.length} کاراکتر • شامل فریم‌ورک‌های استاندارد هایپرتروفی</span>
          <button
            onClick={onNavigateToImport}
            className="text-sky-400 hover:underline flex items-center gap-1"
          >
            <span>رفتن به صفحه واردسازی برنامه و تست JSON</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
