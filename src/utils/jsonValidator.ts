import { WorkoutProgram, WorkoutDay, ExerciseItem } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  program?: WorkoutProgram;
  totalDays?: number;
  totalExercises?: number;
  totalSets?: number;
}

/**
 * Validates a string or object against the AI Workout Plan JSON schema
 */
export function validateWorkoutJSON(rawInput: string | object): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  let obj: any;

  if (typeof rawInput === 'string') {
    let clean = rawInput.trim();
    // Strip markdown code fences if present
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      obj = JSON.parse(clean);
    } catch (e: any) {
      // Try to detect common json issue
      return {
        isValid: false,
        errors: [`خطای نحوی JSON (Syntax Error): ${e.message}`],
        warnings: ['اطمینان حاصل کنید کاراکترهای اضافی یا کامای اضافی در انتهای آرایه‌ها وجود نداشته باشد.'],
      };
    }
  } else {
    obj = rawInput;
  }

  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return {
      isValid: false,
      errors: ['ساختار داده باید یک آبجکت (Object) اصلی حاوی program_name و days باشد.'],
      warnings: [],
    };
  }

  // Validate root fields
  if (!obj.program_name || typeof obj.program_name !== 'string' || obj.program_name.trim() === '') {
    errors.push('فیلد "program_name" الزامی است و باید عنوان متنی برنامه باشد.');
  }

  if (!obj.duration || typeof obj.duration !== 'string') {
    warnings.push('فیلد "duration" وجود ندارد یا متنی نیست (پیش‌فرض ۸ هفته در نظر گرفته خواهد شد).');
    obj.duration = obj.duration || '8 هفته';
  }

  if (!Array.isArray(obj.days) || obj.days.length === 0) {
    errors.push('فیلد "days" باید یک آرایه شامل حداقل ۱ روز تمرینی باشد.');
  } else {
    let exerciseCount = 0;
    let setsCount = 0;

    obj.days.forEach((day: any, dIdx: number) => {
      const dayNum = dIdx + 1;
      if (!day || typeof day !== 'object') {
        errors.push(`روز شماره ${dayNum} ساختار نامعتبر دارد.`);
        return;
      }

      if (!day.day || typeof day.day !== 'string') {
        warnings.push(`عنوان روز شماره ${dayNum} مشخص نشده است؛ عنوان پیش‌فرض اختصاص داده شد.`);
        day.day = day.day || `روز ${dayNum}`;
      }

      if (!Array.isArray(day.muscle_groups)) {
        day.muscle_groups = day.muscle_groups ? [String(day.muscle_groups)] : ['عضلات عمومی'];
      }

      if (!Array.isArray(day.exercises) || day.exercises.length === 0) {
        errors.push(`روز "${day.day}" دارای هیچ حرکتی در آرایه exercises نیست.`);
      } else {
        day.exercises.forEach((ex: any, exIdx: number) => {
          const exNum = exIdx + 1;
          if (!ex || typeof ex !== 'object') {
            errors.push(`حرکت شماره ${exNum} در روز "${day.day}" نامعتبر است.`);
            return;
          }

          if (!ex.name || typeof ex.name !== 'string') {
            errors.push(`حرکت شماره ${exNum} در روز "${day.day}" فاقد نام ("name") است.`);
          }

          if (ex.sets === undefined || ex.sets === null) {
            warnings.push(`حرکت "${ex.name || exNum}" فاقد تعداد ست مشخص است (پیش‌فرض ۳ ست تعیین شد).`);
            ex.sets = '3';
          }

          if (!ex.reps) {
            warnings.push(`حرکت "${ex.name || exNum}" فاقد تکرار مشخص است (پیش‌فرض 8-12 تعیین شد).`);
            ex.reps = '8-12';
          }

          if (!ex.rest) {
            ex.rest = '90s';
          }

          exerciseCount++;
          const parsedSets = parseInt(String(ex.sets), 10);
          setsCount += isNaN(parsedSets) ? 3 : parsedSets;
        });
      }
    });

    if (errors.length === 0) {
      return {
        isValid: true,
        errors: [],
        warnings,
        program: obj as WorkoutProgram,
        totalDays: obj.days.length,
        totalExercises: exerciseCount,
        totalSets: setsCount,
      };
    }
  }

  return {
    isValid: false,
    errors,
    warnings,
    program: undefined,
  };
}

/**
 * Pre-loaded sample workout programs for instant import & testing
 */
export const SAMPLE_PROGRAMS: WorkoutProgram[] = [
  {
    program_name: 'برنامه تخصصی هایپرتروفی ۴ روزه (Upper / Lower Split)',
    duration: '8 هفته',
    version: 1,
    authorAi: 'Gemini CSCS Hypertrophy Engine',
    days: [
      {
        day: 'روز ۱: بالاتنه قدرتی و هایپرتروفی (Upper Strength & Hypertrophy)',
        muscle_groups: ['سینه', 'زیربغل و پشت', 'سرشانه', 'بازو'],
        exercises: [
          {
            name: 'پرس سینه هالتر روی نیمکت صاف (Barbell Bench Press)',
            sets: '4',
            reps: '6-8',
            rest: '120s',
            tempo: '3-0-1-0',
            notes: 'تمرکز بر فاز منفی کنترل‌شده، قوس متقارن کمر و پایدارسازی اسکاپولا (RPE 8)',
          },
          {
            name: 'بارفیکس با وزن اضافی یا زیربغل سیمکش دست باز (Weighted Pull-ups / Lat Pulldown)',
            sets: '4',
            reps: '8-10',
            rest: '90s',
            tempo: '2-1-1-1',
            notes: 'انقباض کامل عضله پشتی بزرگ در نقطه اوج و کشش ماکزیمم در فاز منفی',
          },
          {
            name: 'پرس سرشانه دمبل نشسته (Seated DB Shoulder Press)',
            sets: '3',
            reps: '8-10',
            rest: '90s',
            tempo: '2-0-1-0',
            notes: 'زاویه آرنج ۴۵ درجه نسبت به بالاتنه برای حفظ سلامت مفصل روتاتور کاف',
          },
          {
            name: 'قایقی سیمکش دست جمع با دسته V (Seated Cable Row)',
            sets: '3',
            reps: '10-12',
            rest: '75s',
            tempo: '2-0-1-1',
            notes: 'تمرکز بر رومبوئیدها و بخش میانی ذوزنقه بدون استفاده از مومنتوم کمر',
          },
          {
            name: 'سوپرست: جلو بازو هالتر EZ + پشت بازو سیمکش طنابی (Superset Arms)',
            sets: '3',
            reps: '10-12',
            rest: '60s',
            tempo: '2-0-1-0',
            notes: 'پمپ عضلانی عمیق با حفظ ثبات شانه و تفکیک بازوها',
          },
        ],
      },
      {
        day: 'روز ۲: پایین‌تنه قدرتی (Lower Body Power & Quad Focus)',
        muscle_groups: ['چهارسر ران', 'همسترینگ', 'باسن', 'ساق پا'],
        exercises: [
          {
            name: 'اسکوات پشت با هالتر (Barbell Back Squat)',
            sets: '4',
            reps: '6-8',
            rest: '150s',
            tempo: '3-1-1-0',
            notes: 'عمق تا موازی ران‌ها با زمین، فعال‌سازی کامل کمربند شکمی و تنفس والسالوا',
          },
          {
            name: 'ددلیفت رومانیایی با دمبل (DB Romanian Deadlift)',
            sets: '3',
            reps: '8-10',
            rest: '90s',
            tempo: '3-1-1-0',
            notes: 'کشش حداکثری زنجیره خلفی و همسترینگ با خم جزئی زانو و حفظ ستون فقرات خنثی',
          },
          {
            name: 'پرس پا ۴۵ درجه دستگاه (Leg Press 45°)',
            sets: '3',
            reps: '10-12',
            rest: '90s',
            tempo: '2-1-1-0',
            notes: 'دامنه حرکتی کامل بدون جدا شدن کمر از تکیه‌گاه',
          },
          {
            name: 'پشت پا خوابیده دستگاه (Lying Leg Curl)',
            sets: '3',
            reps: '12-15',
            rest: '60s',
            tempo: '2-0-1-1',
            notes: 'هایپرتروفی مستقیم سرهای کوتاه و بلند عضلات همسترینگ',
          },
          {
            name: 'ساق پا ایستاده دستگاه (Standing Calf Raise)',
            sets: '4',
            reps: '12-15',
            rest: '60s',
            tempo: '2-2-1-1',
            notes: '۲ ثانیه مکث در اوج کشش پایین برای خنثی‌سازی اثر الاستیک تاندون آشیل',
          },
        ],
      },
      {
        day: 'روز ۳: بالاتنه پمپاژ و هایپرتروفی (Upper Hypertrophy & Volume)',
        muscle_groups: ['سینه بالایی', 'زیربغل', 'سرشانه کناری', 'دستگاه عصبی'],
        exercises: [
          {
            name: 'پرس بالاسینه دمبل (Incline Dumbbell Press 30°)',
            sets: '4',
            reps: '8-10',
            rest: '90s',
            tempo: '3-0-1-0',
            notes: 'تمرکز بر بخش ترقوه‌ای عضله سینه بزرگ با شیب ملایم ۳۰ درجه',
          },
          {
            name: 'زیربغل دمبل تک‌خم روی میز (Single-Arm DB Row)',
            sets: '3',
            reps: '10-12',
            rest: '75s',
            tempo: '2-1-1-0',
            notes: 'کشش عمیق لتیسیموس دورسی بدون چرخش ستون فقرات',
          },
          {
            name: 'فلای سینه دستگاه پک دک (Pec Deck Fly)',
            sets: '3',
            reps: '12-15',
            rest: '60s',
            tempo: '2-0-1-2',
            notes: 'فشار ایزوله بر فیبرهای عرضی سینه همراه با ۲ ثانیه انقباض در نقطه اوج',
          },
          {
            name: 'نشر جانب دمبل کنترل‌شده (Strict DB Lateral Raise)',
            sets: '4',
            reps: '12-15',
            rest: '60s',
            tempo: '2-0-1-1',
            notes: 'ایزولاسیون سر میانی دلتوئید با فرم تکنیکی بدون تقلب',
          },
          {
            name: 'فیس پول سیمکش طنابی (Cable Face Pulls)',
            sets: '3',
            reps: '15-20',
            rest: '60s',
            tempo: '2-0-1-2',
            notes: 'تقویت روتاتور کاف خارجی و سر خلفی دلتوئید جهت سلامت مفصل شانه',
          },
        ],
      },
      {
        day: 'روز ۴: پایین‌تنه همسترینگ و گلوت (Lower Posterior Chain & Core)',
        muscle_groups: ['همسترینگ', 'سرینی (گلوت)', 'چهارسر', 'میان‌تنه'],
        exercises: [
          {
            name: 'هیپ تراست با هالتر (Barbell Hip Thrust)',
            sets: '4',
            reps: '8-10',
            rest: '120s',
            tempo: '2-1-1-1',
            notes: 'انقباض انفجاری ماکزیمم عضله سرینی با مکث یک ثانیه‌ای در بالای دامنه',
          },
          {
            name: 'لانگز متناوب دمبل یا بلغاری (Bulgarian Split Squat)',
            sets: '3',
            reps: '10 هر پا',
            rest: '75s',
            tempo: '2-1-1-0',
            notes: 'اصلاح عدم تقارن عضلانی و تحریک عمیق چهارسر و گلوتئوس',
          },
          {
            name: 'جلو پا دستگاه ایزوله (Leg Extension)',
            sets: '3',
            reps: '12-15',
            rest: '60s',
            tempo: '2-0-1-2',
            notes: 'تنش مکانیکی پیوسته روی عضله راست رانی (Rectus Femoris)',
          },
          {
            name: 'پشت پا نشسته دستگاه (Seated Leg Curl)',
            sets: '3',
            reps: '12-15',
            rest: '60s',
            tempo: '2-1-1-0',
            notes: 'برتری بیومکانیکی نسبت به حالت خوابیده در هایپرتروفی همسترینگ',
          },
          {
            name: 'پلانک با وزنه + کرانچ شکم روی میز شیب‌دار (Core Finisher)',
            sets: '3',
            reps: '45s / 15 reps',
            rest: '45s',
            tempo: '2-0-1-1',
            notes: 'تقویت ثبات مرکزی بدن و عضلات رکتوس ابدومینیس',
          },
        ],
      },
    ],
  },
  {
    program_name: 'برنامه تفکیک و کات ۶ روزه پوش/پول/لگز (PPL Advanced)',
    duration: '10 هفته',
    version: 1,
    authorAi: 'AI CSCS Pro System',
    days: [
      {
        day: 'روز ۱: پوش ۱ (Push Focus - سینه، سرشانه، پشت‌بازو)',
        muscle_groups: ['سینه', 'دلتوئید قدامی و میانی', 'سه سر بازویی'],
        exercises: [
          {
            name: 'پرس بالا سینه هالتر (Incline BB Bench Press)',
            sets: '4',
            reps: '8-10',
            rest: '90s',
            tempo: '3-0-1-0',
            notes: 'تحریک تار های سینه بالایی با زاویه بهینه',
          },
          {
            name: 'دیپ پارالل با وزن بدن/اضافی (Chest Dips)',
            sets: '3',
            reps: '8-12',
            rest: '90s',
            tempo: '2-1-1-0',
            notes: 'کمی متمایل به جلو برای درگیری بیشتر سینه',
          },
          {
            name: 'نشر جانب سیمکش (Cable Lateral Raise)',
            sets: '4',
            reps: '12-15',
            rest: '60s',
            tempo: '2-0-1-1',
            notes: 'تنش یکنواخت در تمام طول مسیر حرکت',
          },
          {
            name: 'پشت بازو پرس فرانسوی هالتر EZ خوابیده (Skull Crushers)',
            sets: '3',
            reps: '10-12',
            rest: '60s',
            tempo: '2-1-1-0',
            notes: 'کشش سر طویل سه سر بازویی با زاویه ملایم دست‌ها به عقب',
          },
        ],
      },
      {
        day: 'روز ۲: پول ۱ (Pull Focus - پشت، دلتوئید خلفی، جلوبازو)',
        muscle_groups: ['زیربغل', 'پشت بالایی', 'دلتوئید خلفی', 'دو سر بازویی'],
        exercises: [
          {
            name: 'زیربغل هالتر خم دست برعکس (Reverse Grip BB Row)',
            sets: '4',
            reps: '8-10',
            rest: '90s',
            tempo: '2-1-1-0',
            notes: 'کشش عالی و درگیری عمیق بخش پایینی لتیسیموس',
          },
          {
            name: 'لت سیمکش دست باز از جلو (Lat Pulldown Wide)',
            sets: '3',
            reps: '10-12',
            rest: '75s',
            tempo: '2-0-1-1',
            notes: 'پایین آوردن شانه قبل از شروع کشش',
          },
          {
            name: 'فلای معکوس دمبل روی میز شیب‌دار (Incline Rear Delt Fly)',
            sets: '4',
            reps: '12-15',
            rest: '60s',
            tempo: '2-0-1-1',
            notes: 'تمرکز صد در صد بر سر خلفی بدون درگیری کول',
          },
          {
            name: 'جلو بازو دمبل روی میز بالاسینه شیب‌دار (Incline DB Curl)',
            sets: '3',
            reps: '10-12',
            rest: '60s',
            tempo: '3-0-1-0',
            notes: 'کشش ماکزیمم سر بلند بایسپس در انتهای دامنه',
          },
        ],
      },
      {
        day: 'روز ۳: لگز ۱ (Legs Focus - چهارسر، همسترینگ، ساق)',
        muscle_groups: ['چهارسر', 'همسترینگ', 'باسن', 'ساق'],
        exercises: [
          {
            name: 'هک اسکوات دستگاه (Hack Squat)',
            sets: '4',
            reps: '8-10',
            rest: '120s',
            tempo: '3-1-1-0',
            notes: 'ایمن‌ترین حالت برای اعمال بار سنگین بر چهارسر زانو',
          },
          {
            name: 'ددلیفت رومانیایی هالتر (Barbell RDL)',
            sets: '3',
            reps: '8-10',
            rest: '90s',
            tempo: '3-1-1-0',
            notes: 'فشار یکپارچه بر همسترینگ و گلوت',
          },
          {
            name: 'جلو پا دستگاه (Leg Extension)',
            sets: '3',
            reps: '12-15',
            rest: '60s',
            tempo: '2-0-1-2',
            notes: 'پمپ عضلانی نهایی',
          },
          {
            name: 'ساق پا نشسته دستگاه (Seated Calf Raise)',
            sets: '4',
            reps: '15-20',
            rest: '45s',
            tempo: '2-1-1-1',
            notes: 'تمرکز بر عضله نعلی (Soleus)',
          },
        ],
      },
    ],
  },
];
