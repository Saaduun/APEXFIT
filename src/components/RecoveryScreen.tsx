import React, { useState } from 'react';
import {
  RECOVERY_PRINCIPLES,
  MOBILITY_FLOWS,
  SAFETY_WARNINGS,
  MobilityFlow,
} from '../data/recoveryData';
import {
  HeartPulse,
  Moon,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Play,
  ShieldAlert,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

export const RecoveryScreen: React.FC = () => {
  const [selectedFlow, setSelectedFlow] = useState<MobilityFlow>(MOBILITY_FLOWS[0]);
  const [sleepScore, setSleepScore] = useState<number>(8);
  const [sorenessScore, setSorenessScore] = useState<number>(3); // 1 = Fresh, 10 = Exhausted
  const [stressScore, setStressScore] = useState<number>(3);

  // Recovery Readiness Formula: 100 - (Soreness*5 + Stress*4) + (Sleep*4) capped at 100
  const readinessScore = Math.max(
    10,
    Math.min(100, Math.round(50 + sleepScore * 5 - sorenessScore * 4 - stressScore * 3))
  );

  const getReadinessStatus = (score: number) => {
    if (score >= 80) return { label: 'Optimal Readiness', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
    if (score >= 60) return { label: 'Moderate Capacity', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
    return { label: 'Rest / Active Recovery Advised', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };
  };

  const status = getReadinessStatus(readinessScore);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
          Neural & Connective Tissue Restoration
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Recovery & Athletic Safety
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-xl">
          Track recovery readiness, master sleep hygiene, and execute sport-specific mobility routines to balance heavy resistance and combat demands.
        </p>
      </div>

      {/* Critical Medical Safety Alert Banner */}
      <div className="p-5 rounded-3xl bg-rose-950/30 border border-rose-500/40 flex items-start gap-4">
        <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 flex-shrink-0 mt-0.5">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-rose-300">
            Medical Safety & Discontinuation Criteria
          </h3>
          <p className="text-xs text-rose-200/80 leading-relaxed">
            Immediately cease training and seek immediate medical evaluation if you experience:
            <strong className="text-white"> sharp or shooting joint pain, dizziness or lightheadedness, chest tightness, numbness or tingling, fainting, or head impact/concussion symptoms</strong>.
            This application provides training education and cannot diagnose or treat medical injuries.
          </p>
        </div>
      </div>

      {/* Recovery Readiness Calculator Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Daily Athletic Readiness Calculator
            </h2>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold border ${status.bg} ${status.color}`}>
            {status.label}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 items-center">
          {/* Sleep Hours Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
              <span>Sleep Duration</span>
              <span className="text-cyan-400 font-mono">{sleepScore} Hours</span>
            </div>
            <input
              type="range"
              min="4"
              max="11"
              value={sleepScore}
              onChange={(e) => setSleepScore(parseInt(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Muscle Soreness */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
              <span>Muscle Soreness</span>
              <span className="text-amber-400 font-mono">{sorenessScore}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={sorenessScore}
              onChange={(e) => setSorenessScore(parseInt(e.target.value))}
              className="w-full accent-amber-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Central Stress */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
              <span>Life/Mental Fatigue</span>
              <span className="text-rose-400 font-mono">{stressScore}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={stressScore}
              onChange={(e) => setStressScore(parseInt(e.target.value))}
              className="w-full accent-rose-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Readiness Score Gauge */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block font-medium">Readiness Index</span>
            <span className="text-4xl font-extrabold text-white font-mono mt-0.5 block">
              {readinessScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Sport-Specific Follow-Along Mobility Routines */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Targeted Mobility & Joint Decompression
          </h2>
          <p className="text-xs text-slate-400">
            Follow-along routines designed specifically for combat sports and heavy resistance recovery.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Flow Cards */}
          <div className="lg:col-span-4 space-y-3">
            {MOBILITY_FLOWS.map((flow) => {
              const isSelected = selectedFlow.id === flow.id;
              return (
                <button
                  key={flow.id}
                  onClick={() => setSelectedFlow(flow)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-500 text-white shadow-lg shadow-cyan-950/30'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800 font-semibold">
                      {flow.targetSport}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" /> {flow.durationMin}m
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{flow.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {flow.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Flow Movements Detail */}
          <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  {selectedFlow.targetSport}
                </span>
                <h3 className="text-2xl font-extrabold text-white mt-1">
                  {selectedFlow.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {selectedFlow.description}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono">
                {selectedFlow.durationMin} Minutes
              </span>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Movement Sequence:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedFlow.movements.map((move, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{move.name}</span>
                      <span className="text-[10px] text-cyan-400 font-mono">{move.durationOrReps}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {move.cues}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recovery Science Principles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {RECOVERY_PRINCIPLES.map((principle) => (
          <div key={principle.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
              {principle.category}
            </span>
            <h4 className="text-sm font-bold text-white">{principle.title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{principle.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
