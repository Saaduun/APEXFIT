import React, { useState, useEffect } from 'react';
import { UserProfile, WeeklyPlan, WorkoutSession, CompletedWorkoutLog } from './types';
import { generateDeterministicPlan } from './utils/planGenerator';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { WorkoutActiveScreen } from './components/WorkoutActiveScreen';
import { AnatomyScreen } from './components/AnatomyScreen';
import { NutritionScreen } from './components/NutritionScreen';
import { RecoveryScreen } from './components/RecoveryScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { OnboardingModal } from './components/OnboardingModal';
import { AiCoachChat } from './components/AiCoachChat';
import { ProfilePrivacyModal } from './components/ProfilePrivacyModal';
import { SessionPreviewModal } from './components/SessionPreviewModal';

const STORAGE_KEYS = {
  PROFILE: 'apex_athlete_profile',
  PLAN: 'apex_weekly_plan',
  LOGS: 'apex_workout_logs',
};

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved profile:', e);
      }
    }
    return null;
  });

  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLAN);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved plan:', e);
      }
    }
    return null;
  });

  const [workoutLogs, setWorkoutLogs] = useState<CompletedWorkoutLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved logs:', e);
      }
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState<
    'home' | 'workout' | 'anatomy' | 'progress' | 'nutrition' | 'recovery'
  >('home');

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(!profile);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [previewingSession, setPreviewingSession] = useState<WorkoutSession | null>(null);
  const [activeWorkoutSession, setActiveWorkoutSession] = useState<WorkoutSession | null>(null);

  // Sync to localStorage
  useEffect(() => {
    if (profile) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    }
  }, [profile]);

  useEffect(() => {
    if (weeklyPlan) {
      localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(weeklyPlan));
    }
  }, [weeklyPlan]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(workoutLogs));
  }, [workoutLogs]);

  // Handle plan generation (calls server-side AI or falls back to smart deterministic engine)
  const generatePlanForProfile = async (newProfile: UserProfile) => {
    // 1. Generate immediate high-quality deterministic plan so the user is never left waiting
    const localPlan = generateDeterministicPlan(newProfile);
    setWeeklyPlan(localPlan);
    setProfile(newProfile);
    setIsOnboardingOpen(false);

    // 2. Attempt AI upgrade in the background if server has GEMINI_API_KEY
    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: newProfile }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.plan && data.plan.sessions?.length > 0) {
          // Re-hydrate AI plan with exercise objects from database
          const hydratedPlan = generateDeterministicPlan(newProfile);
          hydratedPlan.weeklyOverview = data.plan.weeklyOverview || hydratedPlan.weeklyOverview;
          hydratedPlan.recoveryGuideline = data.plan.recoveryGuideline || hydratedPlan.recoveryGuideline;
          hydratedPlan.generatedByAi = true;
          setWeeklyPlan(hydratedPlan);
        }
      }
    } catch (err) {
      console.log('Using deterministic offline routine generator:', err);
    }
  };

  const handleStartWorkout = (session: WorkoutSession) => {
    setPreviewingSession(null);
    setActiveWorkoutSession(session);
    setActiveTab('workout');
  };

  const handleFinishWorkout = (log: CompletedWorkoutLog) => {
    setWorkoutLogs((prev) => [log, ...prev]);
    setActiveWorkoutSession(null);
    setActiveTab('progress');
  };

  const handleResetData = () => {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.PLAN);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    setProfile(null);
    setWeeklyPlan(null);
    setWorkoutLogs([]);
    setIsOnboardingOpen(true);
    setActiveTab('home');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Global Header */}
      <Header
        profile={profile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAiChat={() => setIsAiChatOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* If Active Workout is in progress and on workout tab */}
        {activeTab === 'workout' && activeWorkoutSession ? (
          <WorkoutActiveScreen
            session={activeWorkoutSession}
            onFinishWorkout={handleFinishWorkout}
            onExit={() => setActiveWorkoutSession(null)}
          />
        ) : activeTab === 'workout' && !activeWorkoutSession ? (
          /* Workout Tab without active session - Show quick start launcher */
          <div className="space-y-6 pb-12">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                  Session Launcher
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Select a Workout to Begin
                </h1>
              </div>
            </div>

            {weeklyPlan ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {weeklyPlan.sessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400">{session.dayName}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-950 text-rose-400 border border-slate-800">
                          {session.sessionType}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white">{session.title}</h3>
                      <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {session.purpose}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        {session.exercises.length} Exercises • {session.durationMin}m
                      </span>
                      <button
                        onClick={() => handleStartWorkout(session)}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-900/30 transition-all active:scale-95"
                      >
                        Start
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
                <p className="text-sm text-slate-400">
                  Please complete the onboarding setup to generate your custom weekly plan.
                </p>
                <button
                  onClick={() => setIsOnboardingOpen(true)}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                >
                  Create Routine
                </button>
              </div>
            )}
          </div>
        ) : null}

        {/* Home Screen Tab */}
        {activeTab === 'home' && profile && weeklyPlan && (
          <HomeScreen
            profile={profile}
            plan={weeklyPlan}
            onStartWorkout={handleStartWorkout}
            onSelectSession={(session) => setPreviewingSession(session)}
            onNavigateTab={setActiveTab}
            onRegeneratePlan={() => setIsOnboardingOpen(true)}
          />
        )}

        {/* Anatomy & Biomechanics Tab */}
        {activeTab === 'anatomy' && <AnatomyScreen />}

        {/* Athletic Nutrition Tab */}
        {activeTab === 'nutrition' && <NutritionScreen />}

        {/* Recovery & Safety Tab */}
        {activeTab === 'recovery' && <RecoveryScreen />}

        {/* Progress & Logs Tab */}
        {activeTab === 'progress' && profile && (
          <ProgressScreen profile={profile} logs={workoutLogs} />
        )}
      </main>

      {/* Modals & Drawers */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={generatePlanForProfile}
        initialProfile={profile}
      />

      <SessionPreviewModal
        session={previewingSession}
        onClose={() => setPreviewingSession(null)}
        onStartWorkout={handleStartWorkout}
      />

      <AiCoachChat
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        profile={profile}
      />

      <ProfilePrivacyModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        logs={workoutLogs}
        onResetData={handleResetData}
        onEditProfile={() => setIsOnboardingOpen(true)}
      />
    </div>
  );
}
