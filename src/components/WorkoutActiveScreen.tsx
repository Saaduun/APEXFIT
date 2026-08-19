import React, { useState, useEffect } from 'react';
import { WorkoutSession, WorkoutExerciseItem, CompletedWorkoutLog } from '../types';
import { AnatomyViewer3D } from './AnatomyViewer3D';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  ShieldAlert,
  Flame,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  Maximize2,
} from 'lucide-react';

interface WorkoutActiveScreenProps {
  session: WorkoutSession;
  onFinishWorkout: (log: CompletedWorkoutLog) => void;
  onExit: () => void;
}

export const WorkoutActiveScreen: React.FC<WorkoutActiveScreenProps> = ({
  session,
  onFinishWorkout,
  onExit,
}) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [sessionDurationSec, setSessionDurationSec] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(true);

  // Rest Timer State
  const [restTimerSec, setRestTimerSec] = useState(0);
  const [isRestTimerRunning, setIsRestTimerRunning] = useState(false);

  // Sets State
  const [exerciseSets, setExerciseSets] = useState<{
    [exerciseIdx: number]: { setNumber: number; reps: number; weightKg: number; completed: boolean }[];
  }>({});

  const [activeTab, setActiveTab] = useState<'technique' | 'biomechanics' | 'safety'>('technique');
  const [showCelebration, setShowCelebration] = useState(false);

  const currentItem: WorkoutExerciseItem = session.exercises[currentExerciseIndex] || session.exercises[0];
  const currentExercise = currentItem.exercise;

  // Initialize set logging state
  useEffect(() => {
    const initial: {
      [exerciseIdx: number]: { setNumber: number; reps: number; weightKg: number; completed: boolean }[];
    } = {};
    session.exercises.forEach((item, idx) => {
      const defaultSets = item.sets || 3;
      const parsedReps = parseInt(item.repsOrDuration) || 10;
      initial[idx] = Array.from({ length: defaultSets }, (_, i) => ({
        setNumber: i + 1,
        reps: parsedReps,
        weightKg: 0,
        completed: false,
      }));
    });
    setExerciseSets(initial);
  }, [session]);

  // Overall workout session timer
  useEffect(() => {
    let interval: any;
    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionDurationSec((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive]);

  // Rest timer countdown
  useEffect(() => {
    let timer: any;
    if (isRestTimerRunning && restTimerSec > 0) {
      timer = setInterval(() => {
        setRestTimerSec((prev) => {
          if (prev <= 1) {
            setIsRestTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRestTimerRunning, restTimerSec]);

  const startRestTimer = (seconds: number) => {
    setRestTimerSec(seconds);
    setIsRestTimerRunning(true);
  };

  const toggleSetComplete = (setIndex: number) => {
    setExerciseSets((prev) => {
      const currentSets = [...(prev[currentExerciseIndex] || [])];
      const targetSet = currentSets[setIndex];
      if (targetSet) {
        targetSet.completed = !targetSet.completed;
        // If completed, trigger rest timer
        if (targetSet.completed) {
          startRestTimer(currentItem.restPeriodSec || 60);
        }
      }
      return { ...prev, [currentExerciseIndex]: currentSets };
    });
  };

  const updateSetWeight = (setIndex: number, weight: number) => {
    setExerciseSets((prev) => {
      const currentSets = [...(prev[currentExerciseIndex] || [])];
      if (currentSets[setIndex]) {
        currentSets[setIndex].weightKg = weight;
      }
      return { ...prev, [currentExerciseIndex]: currentSets };
    });
  };

  const updateSetReps = (setIndex: number, reps: number) => {
    setExerciseSets((prev) => {
      const currentSets = [...(prev[currentExerciseIndex] || [])];
      if (currentSets[setIndex]) {
        currentSets[setIndex].reps = reps;
      }
      return { ...prev, [currentExerciseIndex]: currentSets };
    });
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompleteSession = () => {
    let totalCompletedSets = 0;
    let totalVolume = 0;

    Object.values(exerciseSets).forEach((sets: { setNumber: number; reps: number; weightKg: number; completed: boolean }[]) => {
      sets.forEach((s) => {
        if (s.completed) {
          totalCompletedSets += 1;
          totalVolume += (s.weightKg || 0) * (s.reps || 0);
        }
      });
    });

    const log: CompletedWorkoutLog = {
      id: `log_${Date.now()}`,
      sessionId: session.id,
      sessionTitle: session.title,
      date: new Date().toISOString(),
      durationMinutes: Math.max(1, Math.round(sessionDurationSec / 60)),
      exercisesCompleted: session.exercises.length,
      totalVolumeKg: totalVolume,
      perceivedEffort: 7,
      notes: `${session.sessionType} workout completed successfully.`,
    };

    setShowCelebration(true);
    setTimeout(() => {
      onFinishWorkout(log);
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
              {session.sessionType} • Exercise {currentExerciseIndex + 1} of {session.exercises.length}
            </span>
            <h2 className="text-lg font-bold text-white leading-tight">
              {session.title}
            </h2>
          </div>
        </div>

        {/* Live Timers */}
        <div className="flex items-center gap-3">
          {/* Session Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-semibold text-slate-300">
            <Clock className="w-3.5 h-3.5 text-rose-400" />
            <span>{formatTime(sessionDurationSec)}</span>
          </div>

          {/* Complete Button */}
          <button
            id="btn-complete-workout"
            onClick={handleCompleteSession}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/40 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            Finish Workout
          </button>
        </div>
      </div>

      {/* Main Dual-Column Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Anatomical Activation Visualizer */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-400" />
                Muscle Activation Visualization
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                Educational Estimate
              </span>
            </div>

            {/* 3D WebGL Canvas */}
            <AnatomyViewer3D
              height={360}
              highlightedMuscles={currentExercise.estimatedMuscleActivation}
              primaryMuscles={currentExercise.primaryMuscles || currentExercise.targetMuscles || []}
              secondaryMuscles={currentExercise.secondaryMuscles || []}
              stabilizingMuscles={currentExercise.stabilizingMuscles || []}
              activeBiomechanics={currentExercise.biomechanics}
              showControls={true}
              compact={true}
            />

            {/* Muscle Activation Progress Bars */}
            <div className="mt-4 space-y-2 pt-3 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Primary & Secondary Drivers
              </span>
              {Object.entries(currentExercise.estimatedMuscleActivation || {}).map(
                ([muscle, pct]) => (
                  <div key={muscle} className="flex items-center justify-between text-xs">
                    <span className="capitalize text-slate-300 font-medium">
                      {muscle.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 w-8 text-right">
                        {pct}%
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Rest Stopwatch Widget */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Rest Period Timer
              </span>
              <div className="text-2xl font-black font-mono text-rose-400">
                {formatTime(restTimerSec)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => startRestTimer(restTimerSec > 0 ? restTimerSec : currentItem.restPeriodSec || 60)}
                className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-md shadow-rose-950/30"
              >
                {isRestTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              </button>
              <button
                onClick={() => {
                  setIsRestTimerRunning(false);
                  setRestTimerSec(0);
                }}
                className="p-2.5 rounded-xl bg-slate-950 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRestTimerSec((p) => p + 30)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
              >
                +30s
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Active Exercise Logger & Technical Instructions */}
        <div className="lg:col-span-7 space-y-6">
          {/* Exercise Hero Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  {currentExercise.category} • {currentExercise.difficulty}
                </span>
                <h1 className="text-2xl font-extrabold text-white mt-2">
                  {currentExercise.name}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Target: {currentItem.sets} Sets × {currentItem.repsOrDuration} • Rest: {currentItem.restPeriodSec}s
                </p>
              </div>

              {/* Prev / Next Exercise Switcher */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  disabled={currentExerciseIndex === 0}
                  onClick={() => setCurrentExerciseIndex((i) => Math.max(0, i - 1))}
                  className="p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Previous Exercise"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-400 px-2 font-mono">
                  {currentExerciseIndex + 1}/{session.exercises.length}
                </span>
                <button
                  disabled={currentExerciseIndex === session.exercises.length - 1}
                  onClick={() => setCurrentExerciseIndex((i) => Math.min(session.exercises.length - 1, i + 1))}
                  className="p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Next Exercise"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Interactive Sets Table */}
            <div className="space-y-2 pt-4 border-t border-slate-800">
              <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                <div className="col-span-2">Set</div>
                <div className="col-span-3">Target</div>
                <div className="col-span-3">Weight (kg)</div>
                <div className="col-span-2">Reps</div>
                <div className="col-span-2 text-right">Done</div>
              </div>

              {(exerciseSets[currentExerciseIndex] || []).map((set, setIdx) => (
                <div
                  key={setIdx}
                  className={`grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl border transition-all ${
                    set.completed
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-white'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="col-span-2 text-xs font-bold text-slate-400 font-mono">
                    #{set.setNumber}
                  </div>

                  <div className="col-span-3 text-xs text-slate-300 font-medium">
                    {currentItem.repsOrDuration}
                  </div>

                  <div className="col-span-3">
                    <input
                      type="number"
                      placeholder="0"
                      value={set.weightKg || ''}
                      onChange={(e) => updateSetWeight(setIdx, parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-rose-500 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => updateSetReps(setIdx, parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-rose-500 rounded-lg px-2 py-1 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="col-span-2 flex justify-end">
                    <button
                      onClick={() => toggleSetComplete(setIdx)}
                      className={`p-1.5 rounded-lg transition-all ${
                        set.completed
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-900/40'
                          : 'bg-slate-900 text-slate-500 hover:text-slate-200 border border-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Guidance Tabs: Instructions, Biomechanics, Safety */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <button
                onClick={() => setActiveTab('technique')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'technique'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Technique & Cues
              </button>
              <button
                onClick={() => setActiveTab('biomechanics')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'biomechanics'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Biomechanics Panel
              </button>
              <button
                onClick={() => setActiveTab('safety')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'safety'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Safety & Common Faults
              </button>
            </div>

            {/* Tab Content: Technique */}
            {activeTab === 'technique' && (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="font-bold text-slate-300 block mb-1">Starting Position:</span>
                  <p className="text-slate-400 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    {currentExercise.startingPosition}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-slate-300 block mb-1">Step-by-Step Movement:</span>
                  <ul className="space-y-1.5 list-disc pl-4 text-slate-400 leading-relaxed">
                    {currentExercise.movementInstructions.map((inst, i) => (
                      <li key={i}>{inst}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-bold text-slate-300 block mb-1">Key Technique Cues:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentExercise.techniqueCues.map((cue, i) => (
                      <div key={i} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-slate-300 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span>{cue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content: Biomechanics */}
            {activeTab === 'biomechanics' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300">Joint Movement:</span>
                    <span className="text-slate-400 text-right">{currentExercise.biomechanics.jointMovement}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-800/60 pt-2">
                    <span className="font-bold text-slate-300">Estimated Range of Motion:</span>
                    <span className="text-slate-400 text-right">{currentExercise.biomechanics.rangeOfMotion}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-800/60 pt-2">
                    <span className="font-bold text-slate-300">Primary Force Plane:</span>
                    <span className="text-slate-400">{currentExercise.biomechanics.primaryForcePlane}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-800/60 pt-2">
                    <span className="font-bold text-slate-300">Stabilizing Muscles:</span>
                    <span className="text-slate-400">{currentExercise.biomechanics.stabilizingMuscles.join(', ')}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  * Note: {currentExercise.biomechanics.notes}
                </p>
              </div>
            )}

            {/* Tab Content: Safety & Common Mistakes */}
            {activeTab === 'safety' && (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="font-bold text-rose-400 block mb-1.5 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400" /> Common Mistakes to Avoid:
                  </span>
                  <ul className="space-y-1.5 list-disc pl-4 text-slate-400 leading-relaxed">
                    {currentExercise.commonMistakes.map((mistake, i) => (
                      <li key={i}>{mistake}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-bold text-emerald-400 block mb-1.5">Safety Considerations:</span>
                  <ul className="space-y-1.5 list-disc pl-4 text-slate-400 leading-relaxed">
                    {currentExercise.safetyConsiderations.map((safety, i) => (
                      <li key={i}>{safety}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
          <div className="text-center p-8 rounded-3xl bg-slate-900 border border-slate-800 max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-extrabold text-white">Workout Complete!</h3>
            <p className="text-xs text-slate-400">
              Great training effort. Your session has been recorded into your progress log. Rehydrate and refuel!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
