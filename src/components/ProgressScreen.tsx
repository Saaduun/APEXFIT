import React from 'react';
import { CompletedWorkoutLog, UserProfile } from '../types';
import { Trophy, Dumbbell, Calendar, Flame, Activity, Clock, CheckCircle2, Swords, Award } from 'lucide-react';

interface ProgressScreenProps {
  profile: UserProfile;
  logs: CompletedWorkoutLog[];
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({ profile, logs }) => {
  const totalWorkouts = logs.length;
  const totalVolume = logs.reduce((acc, l) => acc + (l.totalVolumeKg || 0), 0);
  const totalMinutes = logs.reduce((acc, l) => acc + (l.durationMinutes || 0), 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
          Consistency & Milestones
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Training Progress & History
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-xl">
          Clean, straightforward metrics to celebrate adherence, volume progression, and round endurance.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Completed Sessions
            </span>
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono mt-1">
            {totalWorkouts}
          </div>
          <span className="text-[11px] text-slate-500 block">
            {totalWorkouts === 0 ? 'Start your first workout today!' : `${totalWorkouts} sessions logged`}
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Volume Lifted
            </span>
            <Dumbbell className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono mt-1">
            {totalVolume.toLocaleString()} <span className="text-sm font-normal text-slate-400">kg</span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            Cumulative tonnage moved
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Mat & Gym Time
            </span>
            <Clock className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono mt-1">
            {totalMinutes} <span className="text-sm font-normal text-slate-400">min</span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            {(totalMinutes / 60).toFixed(1)} total training hours
          </span>
        </div>
      </div>

      {/* History Log List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Calendar className="w-5 h-5 text-rose-400" />
          Completed Workout Log
        </h2>

        {logs.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/60 border border-dashed border-slate-800 text-center space-y-3">
            <Award className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Workouts Recorded Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Once you finish your first training session, your exercise logs, tonnage, and duration will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-wrap items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">
                      {log.sessionTitle}
                    </h3>
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(log.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Duration</span>
                    <span className="font-mono font-semibold">{log.durationMinutes} min</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Volume</span>
                    <span className="font-mono font-semibold">{log.totalVolumeKg} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">RPE</span>
                    <span className="font-mono font-semibold">{log.perceivedEffort}/10</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
