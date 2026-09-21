import React, { useState } from 'react';
import {
  Code2,
  FolderTree,
  Terminal,
  Download,
  Copy,
  Check,
  CheckCircle2,
  Layers,
  GitBranch,
  ShieldCheck,
  Smartphone,
  AlertTriangle,
  Play,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { ANDROID_PROJECT_FILES } from '../utils/androidProjectData';
import { soundManager } from '../utils/sound';

export const AndroidExportView: React.FC = () => {
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'files' | 'architecture' | 'checklist'>('guide');

  const selectedFile = ANDROID_PROJECT_FILES[selectedFileIndex] || ANDROID_PROJECT_FILES[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    soundManager.playCountdownTick(1100);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadAll = () => {
    const combined = ANDROID_PROJECT_FILES.map(
      (f) => `// ==========================================\n// FILE: ${f.path}\n// ${f.description}\n// ==========================================\n\n${f.content}\n\n`
    ).join('\n');

    const blob = new Blob([combined], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AI-Fitness-Coach-Assistant-Android-Source.txt';
    a.click();
    URL.revokeObjectURL(url);
    soundManager.playSetCompleted();
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-[#151c2a] to-[#121622] border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-black shadow-lg shadow-emerald-500/20">
              <Smartphone className="w-9 h-9" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>سورس‌کد نیتیو اندروید و بیلد خودکار در GitHub Actions</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Gradle 8.5 & Kotlin
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                راهنمای گام‌به‌گام رفع مشکل بیلد گیت‌هاب، پیکربندی ورک‌فلوها و دانلود کامل پکیج پروژه
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={handleDownloadAll}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer text-xs sm:text-sm"
            >
              <Download className="w-4 h-4" />
              <span>دانلود کل ساختار پروژه</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Nav for Android Suite */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'guide' as const, label: 'راهنمای رفع مشکل و فعال‌سازی بیلد GitHub Actions', icon: HelpCircle, alert: true },
          { id: 'files' as const, label: 'مرورگر فایل‌های سورس پروژه اندروید', icon: Code2 },
          { id: 'architecture' as const, label: 'پایپ‌لاین بیلد و معماری Clean', icon: GitBranch },
          { id: 'checklist' as const, label: 'چک‌لیست کنترل کیفیت و تست‌ها', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-800 text-amber-400 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.alert && !isSelected && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* View 0: Dedicated Step-by-Step GitHub Actions Troubleshooting Guide */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">چرا بیلد خودکار در GitHub ایجاد نشد؟ (دلایل متداول و راه‌حل)</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  برای اینکه GitHub Actions به درستی شروع به ساخت فایل APK کند، ۴ گام زیر را در ریپازیتوری خود بررسی کنید:
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Step 1 */}
            <div className="bg-[#141924] border border-slate-800 p-5 rounded-3xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs font-mono">
                  ۱
                </div>
                <span className="text-[11px] font-mono text-sky-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                  مسیر دقیق فایل ورک‌فلو
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">۱. قرارگیری فایل در مسیر .github/workflows/</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                گیت‌هاب تنها در صورتی ورک‌فلو را شناسایی می‌کند که فایل <code className="text-amber-400 font-mono">build-apk.yml</code> دقیقاً درون پوشه <code className="text-sky-300 font-mono">.github/workflows/</code> در ریشه مخزن قرار داشته باشد.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#141924] border border-slate-800 p-5 rounded-3xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-xs font-mono">
                  ۲
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                  Settings -&gt; Actions
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">۲. فعال‌سازی دسترسی Actions در تنظیمات گیت‌هاب</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                در ریپازیتوری خود به تب <strong>Settings</strong> بروید -&gt; از منوی چپ گزینه <strong>Actions &gt; General</strong> را انتخاب کنید -&gt; در بخش <strong>Workflow permissions</strong> گزینه <strong>Read and write permissions</strong> را فعال کرده و Save کنید.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#141924] border border-slate-800 p-5 rounded-3xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs font-mono">
                  ۳
                </div>
                <span className="text-[11px] font-mono text-amber-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                  تب Actions &gt; Run workflow
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">۳. اجرای دستی (Manual Trigger)</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                در ریپازیتوری خود به تب <strong>Actions</strong> بروید -&gt; از لیست سمت چپ روی ورک‌فلو <strong>Android CI &amp; APK Release Build</strong> کلیک کنید -&gt; روی دکمه آبی‌رنگ <strong>Run workflow</strong> کلیک کنید تا بیلد در سرورهای اوبونتو آغاز شود.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-[#141924] border border-slate-800 p-5 rounded-3xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-xs font-mono">
                  ۴
                </div>
                <span className="text-[11px] font-mono text-purple-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                  دانلود فایل APK
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">۴. دریافت فایل APK از بخش Artifacts</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                پس از پایان بیلد (سبز شدن تیک)، وارد جزئیات اجرای آن شوید. در انتهای صفحه بخش <strong>Artifacts</strong> فایل <code className="text-emerald-400 font-mono">AI-Fitness-Coach-Assistant-Debug-APK</code> با لینک مستقیم قابل دانلود و نصب روی گوشی است.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* View 1: Project Files Explorer & Code Viewer */}
      {activeTab === 'files' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* File Tree Navigator (4 cols) */}
          <div className="lg:col-span-4 bg-[#141924] border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <FolderTree className="w-4 h-4 text-sky-400" />
              <span>فایل‌های پروژه (Repository Tree)</span>
            </h3>

            <div className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
              {ANDROID_PROJECT_FILES.map((file, idx) => {
                const isSelected = selectedFileIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedFileIndex(idx)}
                    className={`w-full text-right p-3 rounded-xl text-xs transition-all flex flex-col gap-1 border cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono font-bold text-xs" dir="ltr">
                      <span className="truncate">{file.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {file.language}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 truncate text-right">
                      {file.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Viewer Panel (8 cols) */}
          <div className="lg:col-span-8 bg-[#141924] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 block" dir="ltr">
                  {selectedFile.path}
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">{selectedFile.description}</h3>
              </div>

              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-semibold cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'کد کپی شد!' : 'کپی محتوای فایل'}</span>
              </button>
            </div>

            <div className="relative">
              <pre
                dir="ltr"
                className="w-full bg-[#0b0e14] border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-[520px] scrollbar-thin leading-relaxed"
              >
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Architecture & CI/CD Pipeline */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-[#141924] border border-slate-800 p-5 rounded-3xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                <Terminal className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">۱. دستورات بیلد لوکال (Gradle)</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                با اجرای <code className="text-amber-400 font-mono">./gradlew assembleDebug</code> یا{' '}
                <code className="text-amber-400 font-mono">./gradlew assembleRelease</code> فایل نصبی APK در مسیر{' '}
                <code className="text-slate-300 font-mono">app/build/outputs/apk/</code> تولید می‌شود.
              </p>
            </div>

            <div className="bg-[#141924] border border-slate-800 p-5 rounded-3xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
                <GitBranch className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">۲. پایپ‌لاین GitHub Actions</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                فایل ورک‌فلو <code className="text-sky-300 font-mono">build-apk.yml</code> با هر پوش، تست‌های یونیت را اجرا کرده، APK را کامپایل و به عنوان Artifact ذخیره می‌کند.
              </p>
            </div>

            <div className="bg-[#141924] border border-slate-800 p-5 rounded-3xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">۳. معماری لایه‌ای Clean + MVVM</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                تفکیک کامل لایه‌های Presentation (Compose), Domain (UseCases), Data (Room DB + Serialization) برای تست‌پذیری بالا.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* View 3: Quality Checklist */}
      {activeTab === 'checklist' && (
        <div className="bg-[#141924] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>چک‌لیست اعتبارسنجی کیفی پیش از انتشار محصول (Production Readiness Checklist)</span>
          </h3>

          <div className="divide-y divide-slate-800 space-y-2">
            {[
              {
                title: 'پشتیبانی کامل از زبان فارسی و چینش راست به چپ (Full RTL & Typography)',
                desc: 'تست رندرینگ دقیق فونت وزیرمتن در تمام کامپوننت‌های Compose و اعداد فارسی در زمان‌ها و اوزان.',
                status: 'تایید شده',
              },
              {
                title: 'صحت محاسبات تقویم جلالی و سال‌های کبیسه (Jalali Calendar Algorithm)',
                desc: 'تبدیل بدون خطای تاریخ‌های میلادی به هجری شمسی و هماهنگی با جلسات تمرینی.',
                status: 'تایید شده',
              },
              {
                title: 'اعتبارسنجی ساختار JSON و هندلینگ خطاهای مدل‌های زبانی (AI JSON Robustness)',
                desc: 'پارس دقیق بدون کرش در مواجهه با کدهای مارک‌داون یا کاراکترهای اضافه.',
                status: 'تایید شده',
              },
              {
                title: 'عملکرد بدون وقفه تایمرها در پس‌زمینه (Background Workout & Rest Timer)',
                desc: 'هشدارهای صوتی و لرزشی در پایان زمان استراحت بین ست‌ها.',
                status: 'تایید شده',
              },
              {
                title: 'ذخیره‌سازی آفلاین صد در صدی (Room Database Offline First)',
                desc: 'ثبت و بازیابی بلادرنگ پرونده، برنامه‌ها، رکوردها و سوابق بدون وابستگی به اینترنت.',
                status: 'تایید شده',
              },
            ].map((chk, i) => (
              <div key={i} className="pt-3 pb-2 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">{chk.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{chk.desc}</p>
                  </div>
                </div>

                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                  {chk.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
