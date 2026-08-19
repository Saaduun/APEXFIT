import React from 'react';
import { UserProfile } from '../types';
import { Dumbbell, Swords, Shield, Sparkles, User, MessageSquare, AlertCircle } from 'lucide-react';

interface HeaderProps {
  profile: UserProfile | null;
  activeTab: 'home' | 'workout' | 'anatomy' | 'progress' | 'nutrition' | 'recovery';
  setActiveTab: (tab: 'home' | 'workout' | 'anatomy' | 'progress' | 'nutrition' | 'recovery') => void;
  onOpenAiChat: () => void;
  onOpenProfile: () => void;
  onOpenOnboarding: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  activeTab,
  setActiveTab,
  onOpenAiChat,
  onOpenProfile,
  onOpenOnboarding,
}) => {
  const getModeBadge = () => {
    if (!profile) return null;
    switch (profile.trainingMode) {
      case 'HYBRID':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-300 border border-amber-500/30">
            <Swords className="w-3.5 h-3.5 text-rose-400" />
            <Dumbbell className="w-3.5 h-3.5 text-amber-400" />
            Hybrid Mode
          </span>
        );
      case 'MARTIAL_ARTS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30">
            <Swords className="w-3.5 h-3.5 text-rose-400" />
            {profile.martialArt || 'Martial Arts'}
          </span>
        );
      case 'WEIGHT_TRAINING':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/30">
            <Dumbbell className="w-3.5 h-3.5 text-blue-400" />
            Weight Training
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Mode */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2.5 group text-left focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-amber-600 flex items-center justify-center shadow-lg shadow-rose-900/30 group-hover:scale-105 transition-transform">
                <Swords className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                  Apex Coach <span className="text-xs font-normal text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/40">AI</span>
                </span>
                <span className="text-[11px] text-slate-400 block -mt-0.5">
                  Gym & Martial Arts
                </span>
              </div>
            </button>

            {profile && <div className="hidden sm:block ml-2">{getModeBadge()}</div>}
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              id="nav-tab-home"
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'home'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              Today
            </button>
            <button
              id="nav-tab-workout"
              onClick={() => setActiveTab('workout')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'workout'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              Workout
            </button>
            <button
              id="nav-tab-anatomy"
              onClick={() => setActiveTab('anatomy')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'anatomy'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              3D Anatomy
            </button>
            <button
              id="nav-tab-nutrition"
              onClick={() => setActiveTab('nutrition')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'nutrition'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              Nutrition
            </button>
            <button
              id="nav-tab-recovery"
              onClick={() => setActiveTab('recovery')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'recovery'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              Recovery
            </button>
            <button
              id="nav-tab-progress"
              onClick={() => setActiveTab('progress')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'progress'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              Progress
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            <button
              id="btn-open-ai-chat"
              onClick={onOpenAiChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600/20 to-amber-600/20 hover:from-rose-600/30 hover:to-amber-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold shadow-sm transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Ask Coach</span>
            </button>

            {profile ? (
              <button
                id="btn-open-profile"
                onClick={onOpenProfile}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                title="Profile & Privacy"
              >
                <User className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onOpenOnboarding}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all shadow-md shadow-rose-900/30"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden flex items-center justify-around bg-slate-950/95 border-t border-slate-800/80 px-2 py-2">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-2.5 rounded-lg ${
            activeTab === 'home' ? 'text-rose-400 font-bold' : 'text-slate-400'
          }`}
        >
          <span>Home</span>
        </button>
        <button
          onClick={() => setActiveTab('workout')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-2.5 rounded-lg ${
            activeTab === 'workout' ? 'text-rose-400 font-bold' : 'text-slate-400'
          }`}
        >
          <span>Workout</span>
        </button>
        <button
          onClick={() => setActiveTab('anatomy')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-2.5 rounded-lg ${
            activeTab === 'anatomy' ? 'text-rose-400 font-bold' : 'text-slate-400'
          }`}
        >
          <span>3D Anatomy</span>
        </button>
        <button
          onClick={() => setActiveTab('nutrition')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-2.5 rounded-lg ${
            activeTab === 'nutrition' ? 'text-rose-400 font-bold' : 'text-slate-400'
          }`}
        >
          <span>Nutrition</span>
        </button>
        <button
          onClick={() => setActiveTab('recovery')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-2.5 rounded-lg ${
            activeTab === 'recovery' ? 'text-rose-400 font-bold' : 'text-slate-400'
          }`}
        >
          <span>Recovery</span>
        </button>
        <button
          onClick={() => setActiveTab('progress')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-2.5 rounded-lg ${
            activeTab === 'progress' ? 'text-rose-400 font-bold' : 'text-slate-400'
          }`}
        >
          <span>Progress</span>
        </button>
      </div>
    </header>
  );
};
