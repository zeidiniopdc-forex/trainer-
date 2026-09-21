import React, { useState, useEffect } from 'react';
import {
  AthleteProfile,
  WorkoutProgram,
  WorkoutSessionLog,
  CalendarReminder,
} from './types';
import {
  getStoredAthletes,
  saveAthletes,
  getActiveAthleteId,
  setActiveAthleteId as saveActiveAthleteId,
  getActiveAthlete,
  createBlankAthlete,
  resetToCleanSlate,
  loadDemoData,
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
import { HomeDashboardView } from './components/HomeDashboardView';
import { AthleteProfileView } from './components/AthleteProfileView';
import { PromptGeneratorView } from './components/PromptGeneratorView';
import { JsonImportView } from './components/JsonImportView';
import { WorkoutTrackerView } from './components/WorkoutTrackerView';
import { ProgressDashboardView } from './components/ProgressDashboardView';
import { JalaliCalendarView } from './components/JalaliCalendarView';
import { AthleteManagerModal } from './components/AthleteManagerModal';
import { BottomNavBar } from './components/BottomNavBar';

export const App: React.FC = () => {
  // Navigation State - Default to 'home' hub dashboard
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isAthleteModalOpen, setIsAthleteModalOpen] = useState(false);

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

  // Multi-Athlete Management States
  const [athletes, setAthletes] = useState<AthleteProfile[]>(getStoredAthletes);
  const [activeAthleteId, setActiveAthleteIdState] = useState<string>(getActiveAthleteId);
  const [profile, setProfileState] = useState<AthleteProfile>(getActiveAthlete);

  // Core Persistent States for Programs, Logs and Reminders
  const [programs, setProgramsState] = useState<WorkoutProgram[]>(getStoredPrograms);
  const [activeProgram, setActiveProgramState] = useState<WorkoutProgram>(getActiveProgram);
  const [sessionLogs, setSessionLogsState] = useState<WorkoutSessionLog[]>(getSessionLogs);
  const [reminders, setRemindersState] = useState<CalendarReminder[]>(getCalendarReminders);

  // Active workout day index
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);

  // Athlete Operations
  const handleSelectAthlete = (athleteId: string) => {
    saveActiveAthleteId(athleteId);
    setActiveAthleteIdState(athleteId);
    const selected = athletes.find((a) => a.id === athleteId);
    if (selected) {
      setProfileState(selected);
      saveProfile(selected);
    }
  };

  const handleAddNewAthlete = (name: string) => {
    const newAth = createBlankAthlete(name);
    const updated = [newAth, ...athletes];
    setAthletes(updated);
    saveAthletes(updated);
    handleSelectAthlete(newAth.id);
    setIsAthleteModalOpen(false);
  };

  const handleDeleteAthlete = (athleteId: string) => {
    if (athletes.length <= 1) return;
    const filtered = athletes.filter((a) => a.id !== athleteId);
    setAthletes(filtered);
    saveAthletes(filtered);
    if (activeAthleteId === athleteId) {
      handleSelectAthlete(filtered[0].id);
    }
  };

  const handleResetToCleanSlate = () => {
    const result = resetToCleanSlate();
    setAthletes(result.athletes);
    setActiveAthleteIdState(result.activeAthlete.id);
    setProfileState(result.activeAthlete);
    setSessionLogsState(result.sessionLogs);
    setRemindersState(result.reminders);
    setIsAthleteModalOpen(false);
  };

  const handleLoadDemo = () => {
    const result = loadDemoData();
    setAthletes(result.athletes);
    setActiveAthleteIdState(result.activeAthlete.id);
    setProfileState(result.activeAthlete);
    setSessionLogsState(result.sessionLogs);
    setRemindersState(result.reminders);
    setIsAthleteModalOpen(false);
  };

  // Profile Update Handler
  const handleUpdateProfile = (newProfile: AthleteProfile) => {
    setProfileState(newProfile);
    saveProfile(newProfile);
    // Sync into athletes list
    const updated = athletes.map((a) => (a.id === newProfile.id ? newProfile : a));
    setAthletes(updated);
    saveAthletes(updated);
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
      className={`min-h-screen flex flex-col font-sans selection:bg-amber-500 selection:text-black transition-colors w-full max-w-full overflow-x-hidden ${
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
        activeAthlete={profile}
        onOpenAthleteManager={() => setIsAthleteModalOpen(true)}
      />

      {/* Main Screen Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 lg:pb-12 overflow-x-hidden">
        
        {/* 1. Home Dashboard Hub View */}
        {activeTab === 'home' && (
          <HomeDashboardView
            athletes={athletes}
            activeAthlete={profile}
            onSelectAthlete={handleSelectAthlete}
            onOpenAthleteManager={() => setIsAthleteModalOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            activeProgram={activeProgram}
            sessionLogs={sessionLogs}
            theme={theme}
          />
        )}

        {/* 2. Athlete Profile Dedicated Page */}
        {activeTab === 'profile' && (
          <AthleteProfileView
            profile={profile}
            onSaveProfile={handleUpdateProfile}
            onNavigateToPrompt={() => setActiveTab('prompt')}
            onOpenAthleteManager={() => setIsAthleteModalOpen(true)}
            theme={theme}
          />
        )}

        {/* 3. Smart Prompt Generator Dedicated Page */}
        {activeTab === 'prompt' && (
          <PromptGeneratorView
            profile={profile}
            onImportProgram={handleImportAndNavigate}
            onNavigateToImport={() => setActiveTab('import')}
          />
        )}

        {/* 4. Programs & JSON Import Dedicated Page */}
        {activeTab === 'import' && (
          <JsonImportView
            programs={programs}
            activeProgram={activeProgram}
            onSavePrograms={handleUpdatePrograms}
            onSetActiveProgram={handleSetActiveProgram}
            onStartWorkout={(prog, dayIdx) => handleStartWorkoutForDay(prog, dayIdx)}
          />
        )}

        {/* 5. Live Workout Tracker Dedicated Page */}
        {activeTab === 'tracker' && (
          <WorkoutTrackerView
            activeProgram={activeProgram}
            profile={profile}
            initialDayIndex={activeDayIndex}
            onFinishSession={handleAddSessionLog}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
            theme={theme}
          />
        )}

        {/* 6. Hypertrophy Progress & Analysis Dashboard Dedicated Page */}
        {activeTab === 'dashboard' && (
          <ProgressDashboardView
            profile={profile}
            sessionLogs={sessionLogs}
            onStartNewWorkout={() => setActiveTab('tracker')}
            theme={theme}
          />
        )}

        {/* 7. Jalali Calendar & Scheduling Dedicated Page */}
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

      {/* Athlete Manager Modal */}
      <AthleteManagerModal
        isOpen={isAthleteModalOpen}
        onClose={() => setIsAthleteModalOpen(false)}
        athletes={athletes}
        activeAthleteId={activeAthleteId}
        onSelectAthlete={handleSelectAthlete}
        onAddNewAthlete={handleAddNewAthlete}
        onDeleteAthlete={handleDeleteAthlete}
        onResetToCleanSlate={handleResetToCleanSlate}
        onLoadDemoData={handleLoadDemo}
        theme={theme}
      />

      {/* Mobile Ergonomic Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAthleteManager={() => setIsAthleteModalOpen(true)}
        activeAthleteName={profile.name}
        theme={theme}
      />

      {/* Desktop Footer */}
      <footer
        className={`hidden lg:block border-t py-6 text-center text-xs transition-colors ${
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
