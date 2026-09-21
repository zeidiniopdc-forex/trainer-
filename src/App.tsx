import React, { useState, useEffect } from 'react';
import {
  AthleteProfile,
  WorkoutProgram,
  WorkoutSessionLog,
  CalendarReminder,
} from './types';
import {
  getStoredProfile,
  saveProfile,
  getStoredPrograms,
  savePrograms,
  getActiveProgram,
  setActiveProgram,
  getSessionLogs,
  saveSessionLogs,
  getCalendarReminders,
  saveCalendarReminders,
} from './utils/storage';
import { Header, ActiveTab } from './components/Header';
import { AthleteProfileView } from './components/AthleteProfileView';
import { PromptGeneratorView } from './components/PromptGeneratorView';
import { JsonImportView } from './components/JsonImportView';
import { WorkoutTrackerView } from './components/WorkoutTrackerView';
import { ProgressDashboardView } from './components/ProgressDashboardView';
import { JalaliCalendarView } from './components/JalaliCalendarView';

export const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');

  // Theme State ('dark' | 'light')
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('ai_fitness_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('ai_fitness_theme', next);
      return next;
    });
  };

  // Core Persistent States
  const [profile, setProfileState] = useState<AthleteProfile>(getStoredProfile);
  const [programs, setProgramsState] = useState<WorkoutProgram[]>(getStoredPrograms);
  const [activeProgram, setActiveProgramState] = useState<WorkoutProgram>(getActiveProgram);
  const [sessionLogs, setSessionLogsState] = useState<WorkoutSessionLog[]>(getSessionLogs);
  const [reminders, setRemindersState] = useState<CalendarReminder[]>(getCalendarReminders);

  // Active workout day index
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);

  // State Handlers with Auto-Persistence
  const handleUpdateProfile = (newProfile: AthleteProfile) => {
    setProfileState(newProfile);
    saveProfile(newProfile);
  };

  const handleUpdatePrograms = (newPrograms: WorkoutProgram[]) => {
    setProgramsState(newPrograms);
    savePrograms(newPrograms);
  };

  const handleSetActiveProgram = (name: string) => {
    setActiveProgram(name);
    const found = programs.find((p) => p.program_name === name);
    if (found) {
      setActiveProgramState(found);
    }
  };

  const handleAddSessionLog = (log: WorkoutSessionLog) => {
    const updated = [log, ...sessionLogs];
    setSessionLogsState(updated);
    saveSessionLogs(updated);
  };

  const handleUpdateReminders = (newReminders: CalendarReminder[]) => {
    setRemindersState(newReminders);
    saveCalendarReminders(newReminders);
  };

  const handleImportAndNavigate = (importedProgram: WorkoutProgram) => {
    const existingIndex = programs.findIndex(
      (p) => p.program_name === importedProgram.program_name
    );
    let updated: WorkoutProgram[];
    if (existingIndex >= 0) {
      updated = [...programs];
      updated[existingIndex] = importedProgram;
    } else {
      updated = [importedProgram, ...programs];
    }
    handleUpdatePrograms(updated);
    handleSetActiveProgram(importedProgram.program_name);
    setActiveProgramState(importedProgram);
    setActiveTab('tracker');
  };

  const handleStartWorkoutForDay = (program: WorkoutProgram, dayIndex: number) => {
    handleSetActiveProgram(program.program_name);
    setActiveProgramState(program);
    setActiveDayIndex(dayIndex);
    setActiveTab('tracker');
  };

  const isLight = theme === 'light';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans selection:bg-amber-500 selection:text-black transition-colors ${
        isLight
          ? 'bg-[#f8fafc] text-slate-900'
          : 'bg-[#0d1017] text-slate-100'
      }`}
      dir="rtl"
    >
      {/* Top Universal RTL Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeProgramName={activeProgram.program_name}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Screen Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'profile' && (
          <AthleteProfileView
            profile={profile}
            onSaveProfile={handleUpdateProfile}
            onNavigateToPrompt={() => setActiveTab('prompt')}
            theme={theme}
          />
        )}

        {activeTab === 'prompt' && (
          <PromptGeneratorView
            profile={profile}
            onImportProgram={handleImportAndNavigate}
            onNavigateToImport={() => setActiveTab('import')}
          />
        )}

        {activeTab === 'import' && (
          <JsonImportView
            programs={programs}
            activeProgram={activeProgram}
            onSavePrograms={handleUpdatePrograms}
            onSetActiveProgram={handleSetActiveProgram}
            onStartWorkout={(prog, dayIdx) => handleStartWorkoutForDay(prog, dayIdx)}
          />
        )}

        {activeTab === 'tracker' && (
          <WorkoutTrackerView
            activeProgram={activeProgram}
            profile={profile}
            initialDayIndex={activeDayIndex}
            onFinishSession={handleAddSessionLog}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'dashboard' && (
          <ProgressDashboardView
            profile={profile}
            sessionLogs={sessionLogs}
            onStartNewWorkout={() => setActiveTab('tracker')}
          />
        )}

        {activeTab === 'calendar' && (
          <JalaliCalendarView
            reminders={reminders}
            onSaveReminders={handleUpdateReminders}
            activeProgram={activeProgram}
            onStartWorkoutForDay={(dayIdx) => {
              setActiveDayIndex(dayIdx);
              setActiveTab('tracker');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer
        className={`border-t py-6 text-center text-xs transition-colors ${
          isLight
            ? 'border-slate-200 bg-white text-slate-500'
            : 'border-slate-800/80 bg-[#0a0d13] text-slate-500'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>دستیار هوشمند مربیگری بدنسازی (AI Fitness Coach Assistant)</span>
          <span className={isLight ? 'text-slate-400' : 'text-slate-600'}>
            طراحی علمی بر اساس اصول هایپرتروفی Brad Schoenfeld & Renaissance Periodization
          </span>
        </div>
      </footer>
    </div>
  );
};

export default App;
