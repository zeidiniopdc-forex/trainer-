import { AthleteProfile, WorkoutProgram } from '../types';
import { GoogleGenAI } from '@google/genai';

export interface PromptConfig {
  scientificLevel: 'advanced' | 'standard' | 'research_grade';
  language: 'persian' | 'english' | 'bilingual';
  focusSplit?: string; // e.g. "Push/Pull/Legs", "Upper/Lower", "Bro Split", "Full Body"
  rpeGuidance: boolean;
}

export function generateAIPrompt(profile: AthleteProfile, config?: Partial<PromptConfig>): string {
  const goalLabels: Record<string, string> = {
    hypertrophy: 'افزایش حجم عضلانی و هایپرتروفی تخصصی (Muscle Hypertrophy)',
    strength: 'افزایش حداکثر قدرت و توان انفجاری (Max Strength & Power)',
    fat_loss: 'کاهش چربی بدن و حفظ توده عضلانی (Fat Loss / Cutting)',
    recomposition: 'بازسازی همزمان ترکیب بدنی (Body Recomposition)',
    contest_prep: 'آماده‌سازی مسابقات پرورش اندام / فیزیک (Contest Prep)',
    general_fitness: 'سلامت عمومی و آمادگی جسمانی همه‌جانبه (General Fitness)',
  };

  const experienceLabels: Record<string, string> = {
    beginner: 'مبتدی (زیر ۱ سال سابقه تمرین جدی)',
    intermediate: 'متوسط (۱ تا ۳ سال سابقه منظم)',
    advanced: 'پیشرفته (۳ تا ۶ سال سابقه حرفه‌ای)',
    elite: 'نخبه / رقابتی (بیش از ۶ سال سابقه قهرمانی)',
  };

  const locationLabels: Record<string, string> = {
    gym: 'باشگاه بدنسازی مجهز (Commercial Gym)',
    home: 'تمرین در منزل با دمبل و کش و بارفیکس (Home Gym)',
    hybrid: 'ترکیبی باشگاه و منزل (Hybrid)',
  };

  const targetMusclesStr = profile.targetMuscles.length > 0
    ? profile.targetMuscles.join('، ')
    : 'تمامی عضلات بدن با تناسب متقارن';

  const injuriesStr = profile.injuries.length > 0
    ? profile.injuries.join('، ')
    : 'هیچ‌گونه آسیب‌دیدگی ثبت نشده است';

  const limitationsStr = profile.medicalLimitations.length > 0
    ? profile.medicalLimitations.join('، ')
    : 'محدودیت پزشکی خاصی وجود ندارد';

  const avoidanceStr = profile.exerciseAvoidanceList.length > 0
    ? profile.exerciseAvoidanceList.join('، ')
    : 'حرکت ممنوعه خاصی گزارش نشده است';

  const equipmentStr = profile.availableEquipment.length > 0
    ? profile.availableEquipment.join('، ')
    : 'تمامی تجهیزات استاندارد باشگاهی (هالتر، دمبل، کابل، دستگاه‌های وزنه‌آزاد و پین‌دار)';

  const promptText = `### EXPERT ROLE & SYSTEM INSTRUCTION:
You are a world-class bodybuilding coach, CSCS (Certified Strength and Conditioning Specialist), biomechanics expert, and hypertrophy researcher.

### ATHLETE COMPREHENSIVE DOSSIER:
- **نام / هویت**: ${profile.name || 'ورزشکار'}
- **سن**: ${profile.age} سال | **جنسیت**: ${profile.gender === 'male' ? 'آقا (مرد)' : 'خانم (زن)'}
- **قد**: ${profile.heightCm} سانتی‌متر | **وزن فعلی**: ${profile.weightKg} کیلوگرم
- **سطح تجربه ورزشی**: ${experienceLabels[profile.experienceLevel] || profile.experienceLevel}
- **سابقه تمرین مستمر**: ${profile.trainingHistoryYears} سال
- **محیط تمرینی**: ${locationLabels[profile.trainingLocation] || profile.trainingLocation}
- **تجهیزات در دسترس**: ${equipmentStr}
- **تعداد روزهای تمرین در هفته**: ${profile.weeklyDays} روز
- **مدت زمان هر جلسه**: ${profile.sessionDurationMinutes} دقیقه
- **هدف اصلی**: ${goalLabels[profile.primaryGoal] || profile.primaryGoal}
${profile.secondaryGoal ? `- **هدف ثانویه**: ${profile.secondaryGoal}` : ''}
- **عضلات دارای اولویت و تمرکز (Target Muscles)**: ${targetMusclesStr}
- **افق زمانی دوره**: ${profile.timelineWeeks} هفته
- **آسیب‌دیدگی‌ها و مفاصل حساس**: ${injuriesStr}
- **محدودیت‌های حرکتی / پزشکی**: ${limitationsStr}
- **لیست حرکات ممنوعه و نامطلوب**: ${avoidanceStr}
${profile.notes ? `- **نکات ویژه مربی/ورزشکار**: ${profile.notes}` : ''}

### SCIENTIFIC PERIODIZATION & HYPERTROPHY FRAMEWORK:
Design a fully periodized, biomechanically optimized bodybuilding workout program applying strictly:
1. **Brad Schoenfeld's Hypertrophy Principles**: Emphasize mechanical tension (primary driver), controlled eccentric tempo, full active muscle range of motion, and target high-threshold motor unit recruitment.
2. **Renaissance Periodization (Dr. Mike Israetel) Volume Landmarks**:
   - Ensure every major muscle group is loaded within its MAV (Maximum Adaptive Volume), starting from MEV (Minimum Effective Volume).
   - Priority muscles (${targetMusclesStr}) should receive top weekly sets near MAV/MRV threshold with higher frequency (2-3x weekly).
3. **Eric Helms Evidence-Based Training Pyramid**: Appropriate progressive overload schemes, realistic volume/intensity distribution (RPE 7-9 / RIR 1-3), and sufficient intraset rest periods.
4. **ACSM & NSCA Safety Guidelines**: Strictly replace any contraindicated movements for the athlete's mentioned injuries (${injuriesStr}) with joint-friendly high-stimulus alternatives.
5. **Exercise Sequence**: High neural-demand multi-joint compound exercises first, followed by stable machine/cable movements, ending with isolation/pump finishers.

### STRICT OUTPUT FORMAT:
You MUST respond with **ONLY** a valid, parseable JSON object matching this EXACT schema. Do NOT include markdown code fences (like \`\`\`json), do NOT add introductory greeting, explanatory commentary, or closing remarks. Return raw JSON ONLY.

JSON Schema:
{
 "program_name": "نام دقیق و علمی برنامه به زبان فارسی",
 "duration": "${profile.timelineWeeks} هفته",
 "days": [
   {
    "day": "عنوان روز (مثال: روز ۱: سینه و جلو بازو هایپرتروفی)",
    "muscle_groups": ["عضله ۱", "عضله ۲"],
    "exercises": [
      {
       "name": "نام تمرین (هم فارسی هم معادل انگلیسی)",
       "sets": "تعداد ست (مثال: 4)",
       "reps": "دامنه تکرار (مثال: 8-10)",
       "rest": "زمان استراحت (مثال: 90s)",
       "tempo": "تمپو اجرای حرکت (مثال: 3-0-1-0)",
       "notes": "نکات تکنیکی، RIR / RPE و دامنه حرکتی"
      }
     ]
   }
  ]
}`;

  return promptText;
}

/**
 * Direct Gemini API Generator
 */
export async function generateProgramWithGemini(
  prompt: string,
  apiKey?: string
): Promise<{ success: boolean; data?: WorkoutProgram; rawText?: string; error?: string }> {
  try {
    const activeKey = apiKey || (typeof process !== 'undefined' && process.env ? process.env.GEMINI_API_KEY : '');
    
    // If no key is provided, we can fallback to pre-loaded smart generation or prompt user
    if (!activeKey) {
      throw new Error('کلید API جمینای تنظیم نشده است. لطفاً کلید خود را در تنظیمات وارد کنید یا پرامپت را کپی نمایید.');
    }

    const ai = new GoogleGenAI({ apiKey: activeKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const text = response.text || '';
    // Clean any accidental markdown
    let cleanJson = text.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed: WorkoutProgram = JSON.parse(cleanJson);
    return { success: true, data: parsed, rawText: text };
  } catch (err: any) {
    return { success: false, error: err?.message || 'خطا در ارتباط با سرویس هوش مصنوعی جمینای' };
  }
}
