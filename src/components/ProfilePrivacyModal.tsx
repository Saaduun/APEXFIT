import React from 'react';
import { UserProfile, CompletedWorkoutLog } from '../types';
import { ShieldCheck, Download, Trash2, X, User, Dumbbell, Swords, Calendar } from 'lucide-react';

interface ProfilePrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  logs: CompletedWorkoutLog[];
  onResetData: () => void;
  onEditProfile: () => void;
}

export const ProfilePrivacyModal: React.FC<ProfilePrivacyModalProps> = ({
  isOpen,
  onClose,
  profile,
  logs,
  onResetData,
  onEditProfile,
}) => {
  if (!isOpen || !profile) return null;

  const handleExportJson = () => {
    const exportData = {
      profile,
      workoutHistory: logs,
      exportedAt: new Date().toISOString(),
      appVersion: '1.0.0',
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `apex_coach_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-rose-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Profile & Data Privacy</h2>
              <p className="text-xs text-slate-400">Your information is stored locally and securely.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-950 border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Profile Specs */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Athlete Configuration</span>
            <button
              onClick={() => {
                onClose();
                onEditProfile();
              }}
              className="text-xs font-bold text-rose-400 hover:text-rose-300"
            >
              Modify Routine
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Training Mode:</span>
              <span className="text-white font-semibold">{profile.trainingMode}</span>
            </div>
            {profile.martialArt && (
              <div>
                <span className="text-slate-500 block">Martial Art:</span>
                <span className="text-white font-semibold">{profile.martialArt}</span>
              </div>
            )}
            <div>
              <span className="text-slate-500 block">Experience Level:</span>
              <span className="text-white font-semibold">{profile.experienceLevel}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Weekly Frequency:</span>
              <span className="text-white font-semibold">{profile.daysPerWeek} Days/Week</span>
            </div>
            <div>
              <span className="text-slate-500 block">Session Target:</span>
              <span className="text-white font-semibold">{profile.sessionDuration}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Recorded Logs:</span>
              <span className="text-white font-semibold">{logs.length} Sessions</span>
            </div>
          </div>
        </div>

        {/* Privacy Best Practices Notice */}
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-300/90 leading-relaxed">
            <strong>Local Data Ownership:</strong> We only collect data strictly necessary to generate your workouts. We do not track biometric identifiers, sell data, or use invasive trackers.
          </p>
        </div>

        {/* Data Actions */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleExportJson}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-slate-700"
          >
            <Download className="w-4 h-4" /> Export Complete Data (JSON)
          </button>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset your training profile and clear all logged workout histories?')) {
                onResetData();
                onClose();
              }
            }}
            className="w-full py-3 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-rose-800/40"
          >
            <Trash2 className="w-4 h-4" /> Reset & Clear All Local Data
          </button>
        </div>
      </div>
    </div>
  );
};
