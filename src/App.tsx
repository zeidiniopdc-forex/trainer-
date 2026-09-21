import React, { useState } from 'react';
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
import { SAMPLE_PROGRAMS } from './utils/jsonValidator';
import { Header, ActiveTab } from './components/Header';
import { AthleteProfileView } from './components/AthleteProfileView';
import { PromptGeneratorView } from './components/PromptGeneratorView';
import { JsonImportView } from './components/JsonImportView';
import { WorkoutTrackerView } from './components/WorkoutTrackerView';
import { ProgressDashboardView } from './components/ProgressDashboardView';
import { JalaliCalendarView } from './components/JalaliCalendarView';
import { AndroidExportView } from './components/AndroidExportView';

export const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');

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

  return (
    <div className="min-h-screen bg-[#0d1017] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black" dir="rtl">
      {/* Top Universal RTL Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeProgramName={activeProgram.program_name}
      />

      {/* Main Screen Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'profile' && (
          <AthleteProfileView
            profile={profile}
            onSaveProfile={handleUpdateProfile}
            onNavigateToPrompt={() => setActiveTab('prompt')}
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

        {activeTab === 'android_code' && <AndroidExportView />}
      </main>

      {/* Footer Branding & Version */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 bg-[#0a0d13]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>دستیار هوشمند مربیگری بدنسازی (AI Fitness Coach Assistant) • نسخه ۱.۰.۰ نیتیو اندروید</span>
          <span className="text-slate-600">طراحی شده بر اساس متدولوژی Brad Schoenfeld & Renaissance Periodization</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
