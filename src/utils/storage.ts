import {
  AthleteProfile,
  WorkoutProgram,
  WorkoutSessionLog,
  CalendarReminder,
  AppNotification,
} from '../types';
import { SAMPLE_PROGRAMS } from './jsonValidator';
import { getCurrentJalaliDate, formatJalaliDate } from './jalali';

const STORAGE_KEYS = {
  ATHLETES_LIST: 'ai_fitness_athletes_list_v2',
  ACTIVE_ATHLETE_ID: 'ai_fitness_active_athlete_id_v2',
  ATHLETE_PROFILE: 'ai_fitness_athlete_profile_v1',
  WORKOUT_PROGRAMS: 'ai_fitness_workout_programs_v1',
  ACTIVE_PROGRAM_ID: 'ai_fitness_active_program_id_v1',
  SESSION_LOGS: 'ai_fitness_session_logs_v1',
  REMINDERS: 'ai_fitness_calendar_reminders_v1',
  NOTIFICATIONS: 'ai_fitness_notifications_v1',
  API_KEY: 'ai_fitness_gemini_api_key_v1',
};

export const BLANK_ATHLETE_TEMPLATE: AthleteProfile = {
  id: 'athlete-new-1',
  name: 'شاگرد جدید',
  age: 25,
  gender: 'male',
  heightCm: 175,
  weightKg: 75,
  bodyFatPercentage: undefined,
  experienceLevel: 'intermediate',
  trainingHistoryYears: 1,
  weeklyDays: 4,
  trainingLocation: 'gym',
  availableEquipment: [
    'هالتر و دمبل',
    'دستگاه‌های سیم‌کش',
    'نیمکت‌های مدرج',
  ],
  sessionDurationMinutes: 60,
  injuries: [],
  medicalLimitations: [],
  movementRestrictions: [],
  exerciseAvoidanceList: [],
  primaryGoal: 'hypertrophy',
  secondaryGoal: '',
  targetMuscles: ['سینه بالایی', 'سرشانه کناری (دلتوئید میانی)', 'زیربغل و لاتیسموس (Lats)'],
  timelineWeeks: 8,
  measurements: [],
  strengthRecords: [],
  notes: '',
  updatedAt: new Date().toISOString(),
};

export function createBlankAthlete(customName?: string): AthleteProfile {
  const newId = `athlete-${Date.now()}`;
  return {
    ...BLANK_ATHLETE_TEMPLATE,
    id: newId,
    name: customName || `شاگرد ${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`,
    measurements: [],
    strengthRecords: [],
    updatedAt: new Date().toISOString(),
  };
}

export function getStoredAthletes(): AthleteProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATHLETES_LIST);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  // Fallback to legacy single profile if available
  try {
    const legacy = localStorage.getItem(STORAGE_KEYS.ATHLETE_PROFILE);
    if (legacy) {
      const parsedLegacy = JSON.parse(legacy);
      if (parsedLegacy && parsedLegacy.name) {
        const list = [parsedLegacy];
        saveAthletes(list);
        return list;
      }
    }
  } catch {}

  const initialList = [DEFAULT_PROFILE];
  saveAthletes(initialList);
  return initialList;
}

export function saveAthletes(athletes: AthleteProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ATHLETES_LIST, JSON.stringify(athletes));
  } catch {}
}

export function getActiveAthleteId(): string {
  try {
    const active = localStorage.getItem(STORAGE_KEYS.ACTIVE_ATHLETE_ID);
    if (active) return active;
  } catch {}
  const athletes = getStoredAthletes();
  return athletes[0]?.id || DEFAULT_PROFILE.id;
}

export function setActiveAthleteId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ATHLETE_ID, id);
  } catch {}
}

export function getActiveAthlete(): AthleteProfile {
  const athletes = getStoredAthletes();
  const activeId = getActiveAthleteId();
  const found = athletes.find((a) => a.id === activeId);
  return found || athletes[0] || DEFAULT_PROFILE;
}

export function resetToCleanSlate(): {
  athletes: AthleteProfile[];
  activeAthlete: AthleteProfile;
  sessionLogs: WorkoutSessionLog[];
  reminders: CalendarReminder[];
} {
  const blankAthlete = createBlankAthlete('شاگرد اول');
  const cleanAthletes = [blankAthlete];
  
  saveAthletes(cleanAthletes);
  setActiveAthleteId(blankAthlete.id);
  saveProfile(blankAthlete);
  
  // Clear mock session logs and mock reminders to prevent corrupting real analysis
  saveSessionLogs([]);
  saveCalendarReminders([]);

  return {
    athletes: cleanAthletes,
    activeAthlete: blankAthlete,
    sessionLogs: [],
    reminders: [],
  };
}

export function loadDemoData(): {
  athletes: AthleteProfile[];
  activeAthlete: AthleteProfile;
  sessionLogs: WorkoutSessionLog[];
  reminders: CalendarReminder[];
} {
  const demoAthletes = [
    DEFAULT_PROFILE,
    {
      ...BLANK_ATHLETE_TEMPLATE,
      id: 'athlete-demo-02',
      name: 'سارا کاظمی',
      gender: 'female' as const,
      age: 24,
      heightCm: 168,
      weightKg: 58,
      experienceLevel: 'intermediate' as const,
      primaryGoal: 'recomposition' as const,
      weeklyDays: 3,
      targetMuscles: ['سرینی و باسن (Glutes)', 'همسترینگ و زنجیره خلفی', 'عضلات میان‌تنه و شکم (Core/Abs)'],
      measurements: [
        { date: '۱۴۰۵/۰۶/۰۱', waist: 68, hips: 96, thighRight: 54, thighLeft: 54 },
      ],
      strengthRecords: [
        { exerciseName: 'هیپ تراست با هالتر', weightKg: 90, reps: 8, date: '۱۴۰۵/۰۶/۱۰', estimatedOneRepMax: 111 },
      ],
    },
  ];

  saveAthletes(demoAthletes);
  setActiveAthleteId(DEFAULT_PROFILE.id);
  saveProfile(DEFAULT_PROFILE);
  saveSessionLogs(DEFAULT_SESSION_LOGS);
  saveCalendarReminders(DEFAULT_REMINDERS);

  return {
    athletes: demoAthletes,
    activeAthlete: DEFAULT_PROFILE,
    sessionLogs: DEFAULT_SESSION_LOGS,
    reminders: DEFAULT_REMINDERS,
  };
}


const DEFAULT_PROFILE: AthleteProfile = {
  id: 'athlete-default-01',
  name: 'آرش رادمنش',
  age: 26,
  gender: 'male',
  heightCm: 182,
  weightKg: 84.5,
  bodyFatPercentage: 14.2,
  experienceLevel: 'intermediate',
  trainingHistoryYears: 3.5,
  weeklyDays: 4,
  trainingLocation: 'gym',
  availableEquipment: [
    'هالتر المپیکی و صفحات کالیبره',
    'ست کامل دمبل (۲ تا ۵۰ کیلوگرم)',
    'دستگاه سیمکش دوطرفه کراس‌اور',
    'دستگاه پرس پا و هک اسکوات',
    'نیمکت‌های مدرج و زیربغل قایقی',
    'میله بارفیکس و پارالل دیپ',
  ],
  sessionDurationMinutes: 75,
  injuries: ['حساسیت جزئی مفصل شانه راست در انتهای دامنه کشش'],
  medicalLimitations: ['بدون منع پزشکی حاد قلب و عروق'],
  movementRestrictions: ['پرس سرشانه هالتر از پشت گردن'],
  exerciseAvoidanceList: ['پشت بازو دیپ با زاویه حادتر از ۹۰ درجه'],
  primaryGoal: 'hypertrophy',
  secondaryGoal: 'افزایش تقارن بالاتنه و هایپرتروفی دلتوئید جانبی و سینه بالایی',
  targetMuscles: ['سینه بالایی', 'سرشانه کناری (دلتوئید میانی)', 'پشت بازو (سر طویل)', 'چهارسر ران'],
  timelineWeeks: 8,
  measurements: [
    {
      date: '۱۴۰۵/۰۵/۰۱',
      chest: 104,
      waist: 82,
      shoulders: 122,
      bicepsRight: 38.5,
      bicepsLeft: 38.0,
      thighRight: 60.5,
      thighLeft: 60.0,
      calfRight: 38.0,
      calfLeft: 38.0,
    },
    {
      date: '۱۴۰۵/۰۵/۲۵',
      chest: 105.5,
      waist: 81.5,
      shoulders: 123.5,
      bicepsRight: 39.2,
      bicepsLeft: 38.8,
      thighRight: 61.2,
      thighLeft: 61.0,
      calfRight: 38.5,
      calfLeft: 38.5,
    },
    {
      date: '۱۴۰۵/۰۶/۲۰',
      chest: 107.0,
      waist: 81.0,
      shoulders: 125.0,
      bicepsRight: 40.0,
      bicepsLeft: 39.6,
      thighRight: 62.0,
      thighLeft: 61.8,
      calfRight: 39.0,
      calfLeft: 39.0,
    },
  ],
  strengthRecords: [
    {
      exerciseName: 'پرس سینه هالتر صاف',
      weightKg: 110,
      reps: 6,
      date: '۱۴۰۵/۰۶/۱۵',
      estimatedOneRepMax: 128,
    },
    {
      exerciseName: 'اسکوات پشت با هالتر',
      weightKg: 140,
      reps: 5,
      date: '۱۴۰۵/۰۶/۱۰',
      estimatedOneRepMax: 158,
    },
    {
      exerciseName: 'ددلیفت رومانیایی با هالتر',
      weightKg: 135,
      reps: 8,
      date: '۱۴۰۵/۰۶/۱۸',
      estimatedOneRepMax: 167,
    },
    {
      exerciseName: 'پرس سرشانه دمبل نشسته',
      weightKg: 34,
      reps: 8,
      date: '۱۴۰5/۰۶/۱۲',
      estimatedOneRepMax: 42,
    },
  ],
  notes: 'تمرکز بر تغذیه پروتئینی ۲ گرم به ازای هر کیلو وزن بدن و خواب منظم ۸ ساعته',
  updatedAt: new Date().toISOString(),
};

const DEFAULT_SESSION_LOGS: WorkoutSessionLog[] = [
  {
    id: 'session-log-prev-1',
    programName: 'برنامه تخصصی هایپرتروفی ۴ روزه (Upper / Lower Split)',
    dayTitle: 'روز ۱: بالاتنه قدرتی و هایپرتروفی',
    jalaliDate: '۱۴۰۵/۰۶/۲۵',
    startTime: '17:30',
    endTime: '18:45',
    durationSeconds: 4500,
    totalVolumeTonnageKg: 14850,
    totalSetsCompleted: 17,
    totalRepsCompleted: 148,
    rating: 5,
    sessionNotes: 'انرژی عالی، پمپ عضلانی فوق‌العاده در سینه و بازو. رکورد پرس سینه شکسته شد.',
    personalRecordsAchieved: [
      { exercise: 'پرس سینه هالتر روی نیمکت صاف', weightKg: 110, reps: 6 },
    ],
    exercises: [
      {
        exerciseName: 'پرس سینه هالتر روی نیمکت صاف',
        targetSets: 4,
        targetReps: '6-8',
        restSeconds: 120,
        skipped: false,
        sets: [
          { setNumber: 1, targetWeightKg: 100, targetReps: 8, actualWeightKg: 100, actualReps: 8, completed: true, rpe: 8, rir: 2 },
          { setNumber: 2, targetWeightKg: 105, targetReps: 6, actualWeightKg: 105, actualReps: 7, completed: true, rpe: 8.5, rir: 1.5 },
          { setNumber: 3, targetWeightKg: 110, targetReps: 6, actualWeightKg: 110, actualReps: 6, completed: true, rpe: 9, rir: 1 },
          { setNumber: 4, targetWeightKg: 110, targetReps: 6, actualWeightKg: 110, actualReps: 5, completed: true, rpe: 9.5, rir: 0.5 },
        ],
      },
      {
        exerciseName: 'بارفیکس با وزن اضافی یا زیربغل سیمکش دست باز',
        targetSets: 4,
        targetReps: '8-10',
        restSeconds: 90,
        skipped: false,
        sets: [
          { setNumber: 1, targetWeightKg: 75, targetReps: 10, actualWeightKg: 75, actualReps: 10, completed: true, rpe: 8, rir: 2 },
          { setNumber: 2, targetWeightKg: 80, targetReps: 8, actualWeightKg: 80, actualReps: 8, completed: true, rpe: 8.5, rir: 1.5 },
          { setNumber: 3, targetWeightKg: 80, targetReps: 8, actualWeightKg: 80, actualReps: 8, completed: true, rpe: 9, rir: 1 },
          { setNumber: 4, targetWeightKg: 85, targetReps: 8, actualWeightKg: 85, actualReps: 7, completed: true, rpe: 9.5, rir: 0.5 },
        ],
      },
    ],
  },
  {
    id: 'session-log-prev-2',
    programName: 'برنامه تخصصی هایپرتروفی ۴ روزه (Upper / Lower Split)',
    dayTitle: 'روز ۲: پایین‌تنه قدرتی',
    jalaliDate: '۱۴۰۵/۰۶/۲۷',
    startTime: '18:00',
    endTime: '19:10',
    durationSeconds: 4200,
    totalVolumeTonnageKg: 18200,
    totalSetsCompleted: 16,
    totalRepsCompleted: 136,
    rating: 5,
    sessionNotes: 'تمرین سنگین پا، اسکوات با فرم بسیار پایدار و بدون درد در زانو.',
    personalRecordsAchieved: [],
    exercises: [],
  },
];

const DEFAULT_REMINDERS: CalendarReminder[] = [
  {
    id: 'rem-1',
    title: 'جلسه تمرینی: بالاتنه قدرتی و پمپاژ',
    jalaliDate: '۱۴۰۵/۰۶/۳۱',
    time: '18:00',
    type: 'workout',
    completed: false,
    description: 'پرس سینه و زیربغل با حداکثر تمرکز بر اضافه بار تدریجی',
  },
  {
    id: 'rem-2',
    title: 'ثبت اندازه‌گیری و سایزگیری ماهانه',
    jalaliDate: '۱۴۰۵/۰۷/۰۱',
    time: '09:00',
    type: 'measurement',
    completed: false,
    description: 'اندازه‌گیری دور بازو، سینه، کمر و ران ناشتا در صبح',
  },
  {
    id: 'rem-3',
    title: 'ثبت عکس‌های دوره‌ای پیشرفت (Front / Side / Back)',
    jalaliDate: '۱۴۰۵/۰۷/۰۱',
    time: '09:30',
    type: 'photo',
    completed: false,
    description: 'عکاسی در شرایط نوری یکسان و فیگورهای استاندارد',
  },
  {
    id: 'rem-4',
    title: 'ارزیابی دوره و بازبینی حجم تمرینات (Review)',
    jalaliDate: '۱۴۰۵/۰۷/۱۵',
    time: '20:00',
    type: 'review',
    completed: false,
    description: 'بررسی شاخص‌های خستگی سیستمیک و تنظیم مجدد لندمارک‌های حجمی (MAV/MRV)',
  },
];

export function getStoredProfile(): AthleteProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATHLETE_PROFILE);
    if (raw) return JSON.parse(raw);
  } catch {}
  saveProfile(DEFAULT_PROFILE);
  return DEFAULT_PROFILE;
}

export function saveProfile(profile: AthleteProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ATHLETE_PROFILE, JSON.stringify(profile));
  } catch {}
}

export function getStoredPrograms(): WorkoutProgram[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKOUT_PROGRAMS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  savePrograms(SAMPLE_PROGRAMS);
  return SAMPLE_PROGRAMS;
}

export function savePrograms(programs: WorkoutProgram[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WORKOUT_PROGRAMS, JSON.stringify(programs));
  } catch {}
}

export function getActiveProgram(): WorkoutProgram {
  const programs = getStoredPrograms();
  try {
    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROGRAM_ID);
    if (activeId) {
      const found = programs.find((p) => p.program_name === activeId || p.id === activeId);
      if (found) return found;
    }
  } catch {}
  return programs[0] || SAMPLE_PROGRAMS[0];
}

export function setActiveProgram(programName: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROGRAM_ID, programName);
  } catch {}
}

export function getSessionLogs(): WorkoutSessionLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION_LOGS);
    if (raw) return JSON.parse(raw);
  } catch {}
  saveSessionLogs(DEFAULT_SESSION_LOGS);
  return DEFAULT_SESSION_LOGS;
}

export function saveSessionLogs(logs: WorkoutSessionLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSION_LOGS, JSON.stringify(logs));
  } catch {}
}

export function addSessionLog(log: WorkoutSessionLog): void {
  const logs = getSessionLogs();
  logs.unshift(log);
  saveSessionLogs(logs);
}

export function getCalendarReminders(): CalendarReminder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (raw) return JSON.parse(raw);
  } catch {}
  saveCalendarReminders(DEFAULT_REMINDERS);
  return DEFAULT_REMINDERS;
}

export function saveCalendarReminders(reminders: CalendarReminder[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  } catch {}
}

export function getNotifications(): AppNotification[] {
  const currentJalali = getCurrentJalaliDate();
  const dateStr = formatJalaliDate(currentJalali, 'short');
  return [
    {
      id: 'notif-1',
      title: 'یادآور جلسه تمرینی امروز',
      message: `جلسه تمرین بالاتنه برای امروز (${dateStr}) در تقویم جلالی ثبت شده است. آماده‌اید؟`,
      timestamp: '۱۰ دقیقه پیش',
      type: 'info',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'ثبت رکورد شخصی جدید (New PR)!',
      message: 'تبریک! رکورد پرس سینه هالتر با وزن ۱۱۰ کیلوگرم با موفقیت در دیتابیس ثبت شد.',
      timestamp: '۲ روز پیش',
      type: 'success',
      read: true,
    },
    {
      id: 'notif-3',
      title: 'تولید برنامه جدید هوش مصنوعی',
      message: 'برنامه اختصاصی هایپرتروفی بر اساس اصول دکتر براد شونفلد با موفقیت اعتبارسنجی شد.',
      timestamp: '۴ روز پیش',
      type: 'info',
      read: true,
    },
  ];
}
