import React from 'react';
import { UserProfile, WeeklyPlan, WorkoutSession } from '../types';
import { Play, Calendar, Shield, Flame, Activity, Sparkles, ChevronRight, Clock, Dumbbell, Swords, HeartPulse } from 'lucide-react';

interface HomeScreenProps {
  profile: UserProfile;
  plan: WeeklyPlan;
  onStartWorkout: (session: WorkoutSession) => void;
  onSelectSession: (session: WorkoutSession) => void;
  onNavigateTab: (tab: 'workout' | 'anatomy' | 'nutrition' | 'recovery' | 'progress') => void;
  onRegeneratePlan: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  plan,
  onStartWorkout,
  onSelectSession,
  onNavigateTab,
  onRegeneratePlan,
}) => {
  // Determine today's session based on current weekday or first available session
  const currentDayIndex = (new Date().getDay() + 6) % 7; // 0 = Mon, 6 = Sun
  const todaySession =
    plan.sessions.find((s) => s.dayIndex === currentDayIndex) || plan.sessions[0];

  const nextSession =
    plan.sessions.find((s) => s.dayIndex > currentDayIndex) || plan.sessions[0];

  const getSessionBadgeColor = (type: string) => {
    if (type.includes('Gym') || type.includes('Strength')) return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    if (type.includes('Martial') || type.includes('Striking') || type.includes('Grappling')) return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    if (type.includes('Hybrid')) return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Hero: Today's Training Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-rose-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-amber-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                Today's Training
              </span>
              <span className="text-xs text-slate-400">
                {todaySession?.dayName || 'Scheduled'}
              </span>
            </div>

            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getSessionBadgeColor(todaySession?.sessionType || '')}`}>
              {todaySession?.sessionType || 'Session'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {todaySession?.title || 'Personalized Training Session'}
          </h1>

          <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            {todaySession?.purpose || plan.weeklyOverview}
          </p>

          {/* Quick Metrics & Start Action */}
          <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6 pt-6 border-t border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{todaySession?.durationMin || 60} Minutes</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <Activity className="w-4 h-4 text-slate-400" />
              <span>{todaySession?.exercises?.length || 4} Exercises</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>{todaySession?.difficulty || 'Moderate'} Intensity</span>
            </div>

            <div className="w-full sm:w-auto sm:ml-auto">
              <button
                id="btn-start-workout-hero"
                onClick={() => todaySession && onStartWorkout(todaySession)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm shadow-xl shadow-rose-900/40 flex items-center justify-center gap-2.5 transition-all transform active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                Start Workout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Hybrid Fatigue Awareness & Safety Notification */}
      {profile.trainingMode === 'HYBRID' && (
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 flex-shrink-0">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-300">
              Hybrid Neural & Lower-Body Protection Active
            </h4>
            <p className="text-xs text-amber-200/80 mt-0.5 leading-relaxed">
              Your training schedule automatically staggers heavy barbell leg loading away from high-impact martial arts sparring and kicking to preserve connective tissue elasticity.
            </p>
          </div>
        </div>
      )}

      {/* 3. Weekly Schedule Carousel / Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rose-400" />
              Weekly Routine ({plan.sessions.length} Sessions)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any day to preview exercises and 3D anatomy activations.
            </p>
          </div>
          <button
            onClick={onRegeneratePlan}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" /> Re-generate
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plan.sessions.map((session, idx) => {
            const isToday = session.dayIndex === currentDayIndex;
            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session)}
                className={`p-5 rounded-2xl border text-left cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between group ${
                  isToday
                    ? 'bg-slate-900 border-rose-500/80 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400">
                      {session.dayName}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getSessionBadgeColor(session.sessionType)}`}>
                      {session.sessionType}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                    {session.title}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {session.purpose}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>{session.exercises.length} Exercises • {session.durationMin}m</span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Quick Access Hubs: 3D Anatomy Lab, Nutrition, Recovery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Anatomy Card */}
        <button
          id="btn-quick-anatomy"
          onClick={() => onNavigateTab('anatomy')}
          className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Flame className="w-5 h-5 text-rose-400" />
          </div>
          <h3 className="text-sm font-bold text-white">3D Anatomy Laboratory</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Inspect individual muscles, rotate 360°, switch deep/superficial layers, and view exercise activation maps.
          </p>
        </button>

        {/* Nutrition Card */}
        <button
          id="btn-quick-nutrition"
          onClick={() => onNavigateTab('nutrition')}
          className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-sm font-bold text-white">Athletic Nutrition Guide</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Science-based fueling, protein requirements, hydration calculations, and pre/post-combat meal ideas.
          </p>
        </button>

        {/* Recovery Card */}
        <button
          id="btn-quick-recovery"
          onClick={() => onNavigateTab('recovery')}
          className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <HeartPulse className="w-5 h-5 text-cyan-400" />
          </div>
          <h3 className="text-sm font-bold text-white">Recovery & Readiness</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Sleep hygiene guidelines, follow-along mobility flows for strikers and grapplers, and safety alerts.
          </p>
        </button>
      </div>
    </div>
  );
};
