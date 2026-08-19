import React from 'react';
import { WorkoutSession } from '../types';
import { Play, X, Clock, Activity, Shield, Dumbbell, Sparkles, ChevronRight } from 'lucide-react';

interface SessionPreviewModalProps {
  session: WorkoutSession | null;
  onClose: () => void;
  onStartWorkout: (session: WorkoutSession) => void;
}

export const SessionPreviewModal: React.FC<SessionPreviewModalProps> = ({
  session,
  onClose,
  onStartWorkout,
}) => {
  if (!session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider">
                {session.dayName}
              </span>
              <span className="text-xs text-slate-400 font-medium">{session.sessionType}</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">{session.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-950 border border-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
          {session.purpose}
        </p>

        {session.hybridRecoveryAdvice && (
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed">
            <strong className="text-amber-300">Hybrid Recovery Note:</strong> {session.hybridRecoveryAdvice}
          </div>
        )}

        {/* Exercise Sequence List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Exercise Routine ({session.exercises.length})</span>
            <span>{session.durationMin} Minutes</span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {session.exercises.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 text-[11px] font-bold text-rose-400 flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.exercise.name}</h4>
                    <span className="text-[11px] text-slate-400">
                      {item.exercise.category} • {item.sets} sets × {item.repsOrDuration}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {item.restPeriodSec}s rest
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-2">
          <button
            id="btn-start-modal-workout"
            onClick={() => {
              onClose();
              onStartWorkout(session);
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm shadow-xl shadow-rose-900/40 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" /> Start This Workout
          </button>
        </div>
      </div>
    </div>
  );
};
