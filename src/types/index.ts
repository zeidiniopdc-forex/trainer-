export type Gender = 'male' | 'female';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';
export type TrainingLocation = 'gym' | 'home' | 'hybrid';
export type PrimaryGoal = 'hypertrophy' | 'strength' | 'fat_loss' | 'recomposition' | 'contest_prep' | 'general_fitness';

export interface BodyMeasurements {
  neck?: number;
  shoulders?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  bicepsRight?: number;
  bicepsLeft?: number;
  forearm?: number;
  thighRight?: number;
  thighLeft?: number;
  calfRight?: number;
  calfLeft?: number;
  date: string; // Jalali or ISO
}

export interface StrengthRecord {
  exerciseName: string;
  weightKg: number;
  reps: number;
  date: string;
  estimatedOneRepMax: number;
}

export interface AthleteProfile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  bodyFatPercentage?: number;
  experienceLevel: ExperienceLevel;
  trainingHistoryYears: number;
  weeklyDays: number;
  trainingLocation: TrainingLocation;
  availableEquipment: string[];
  sessionDurationMinutes: number;
  injuries: string[];
  medicalLimitations: string[];
  movementRestrictions: string[];
  exerciseAvoidanceList: string[];
  primaryGoal: PrimaryGoal;
  secondaryGoal?: string;
  targetMuscles: string[];
  timelineWeeks: number;
  measurements: BodyMeasurements[];
  strengthRecords: StrengthRecord[];
  notes?: string;
  updatedAt: string;
}

export interface ExerciseItem {
  name: string;
  sets: string | number;
  reps: string;
  rest: string; // e.g. "90s", "120s"
  tempo?: string; // e.g. "3-0-1-0"
  notes?: string;
  targetMuscle?: string;
  substitutionOptions?: string[];
}

export interface WorkoutDay {
  day: string; // e.g. "روز ۱: بالاتنه قدرتی"
  muscle_groups: string[];
  exercises: ExerciseItem[];
}

export interface WorkoutProgram {
  id?: string;
  program_name: string;
  duration: string; // e.g. "8 هفته"
  days: WorkoutDay[];
  createdAt?: string;
  version?: number;
  authorAi?: string;
  athleteId?: string;
}

export interface LoggedSet {
  setNumber: number;
  targetWeightKg: number;
  targetReps: number;
  actualWeightKg: number;
  actualReps: number;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  rir?: number; // Reps In Reserve (0-4)
  completed: boolean;
  completedAt?: string;
}

export interface LoggedExercise {
  exerciseName: string;
  targetMuscle?: string;
  targetSets: number;
  targetReps: string;
  restSeconds: number;
  tempo?: string;
  notes?: string;
  skipped: boolean;
  replacedWith?: string;
  sets: LoggedSet[];
}

export interface WorkoutSessionLog {
  id: string;
  programName: string;
  dayTitle: string;
  jalaliDate: string;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  totalVolumeTonnageKg: number;
  totalSetsCompleted: number;
  totalRepsCompleted: number;
  exercises: LoggedExercise[];
  rating: number; // 1-5
  sessionNotes: string;
  personalRecordsAchieved: { exercise: string; weightKg: number; reps: number }[];
}

export interface CalendarReminder {
  id: string;
  title: string;
  jalaliDate: string;
  time?: string;
  type: 'workout' | 'measurement' | 'photo' | 'review' | 'nutrition';
  completed: boolean;
  description?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
}
