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
  Zap,
  FastForward,
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

  // Auto-advance toggle (default enabled for seamless continuous flow)
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(true);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);

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

  // Auto-advance exercise countdown timer
  useEffect(() => {
    let timer: any;
    if (autoAdvanceCountdown !== null && autoAdvanceCountdown > 0) {
      timer = setInterval(() => {
        setAutoAdvanceCountdown((prev) => {
          if (prev === null || prev <= 1) {
            // Trigger transition to next exercise
            goToNextExercise();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [autoAdvanceCountdown]);

  const startRestTimer = (seconds: number) => {
    setRestTimerSec(seconds);
    setIsRestTimerRunning(true);
  };

  const goToNextExercise = () => {
    setAutoAdvanceCountdown(null);
    if (currentExerciseIndex < session.exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
    }
  };

  const goToPrevExercise = () => {
    setAutoAdvanceCountdown(null);
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex((prev) => prev - 1);
    }
  };

  const toggleSetComplete = (setIndex: number) => {
    setExerciseSets((prev) => {
      const currentSets = [...(prev[currentExerciseIndex] || [])];
      const targetSet = currentSets[setIndex];
      if (targetSet) {
        const nextStatus = !targetSet.completed;
        targetSet.completed = nextStatus;

        // If completed
        if (nextStatus) {
          // Trigger rest timer
          startRestTimer(currentItem.restPeriodSec || 60);

          // Check if all sets for this exercise are now finished
          const allCompleted = currentSets.every((s) => s.completed);
          if (allCompleted && autoAdvanceEnabled) {
            if (currentExerciseIndex < session.exercises.length - 1) {
              // Initiate 3-second auto-advance countdown to next exercise
              setAutoAdvanceCountdown(3);
            }
          }
        } else {
          // Cancel auto advance if unchecking
          setAutoAdvanceCountdown(null);
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

  const currentSets = exerciseSets[currentExerciseIndex] || [];
  const completedSetsCount = currentSets.filter((s) => s.completed).length;
  const isExerciseFullyCompleted = currentSets.length > 0 && completedSetsCount === currentSets.length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-2 rounded-2xl bg-slate-950 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="Exit Workout"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">
                {session.sessionType}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-[11px] text-slate-400 font-semibold">
                Exercise {currentExerciseIndex + 1} of {session.exercises.length}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white leading-tight">
              {session.title}
            </h2>
          </div>
        </div>

        {/* Live Timers & Finish Button */}
        <div className="flex items-center gap-3">
          {/* Session Timer */}
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono font-semibold text-slate-300">
            <Clock className="w-4 h-4 text-orange-400" />
            <span>{formatTime(sessionDurationSec)}</span>
          </div>

          {/* Auto-Advance Toggle */}
          <button
            onClick={() => setAutoAdvanceEnabled(!autoAdvanceEnabled)}
            className={`px-3 py-2 rounded-2xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              autoAdvanceEnabled
                ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
            title="Auto-advance to next exercise upon completing all sets"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Auto-Next: {autoAdvanceEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Complete Button */}
          <button
            id="btn-complete-workout"
            onClick={handleCompleteSession}
            className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            Finish Workout
          </button>
        </div>
      </div>

      {/* Auto-Advance Banner Alert */}
      {autoAdvanceCountdown !== null && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-950/80 to-amber-950/80 border border-orange-500/40 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <FastForward className="w-5 h-5 text-orange-400" />
            <div>
              <p className="text-sm font-bold text-white">
                Exercise Completed! Moving to next exercise simultaneously in{' '}
                <span className="text-orange-300 font-mono font-extrabold text-base">
                  {autoAdvanceCountdown}s
                </span>
                ...
              </p>
              <p className="text-xs text-slate-300">
                Next up: {session.exercises[currentExerciseIndex + 1]?.exercise.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToNextExercise}
              className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold transition-all"
            >
              Skip Wait & Go Now
            </button>
            <button
              onClick={() => setAutoAdvanceCountdown(null)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white text-xs font-bold transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Dual-Column Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Anatomical Activation Visualizer */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-400" />
                Anatomical Exercise Plate (Figure A & B)
              </span>
              <span className="text-[10px] text-orange-300 bg-orange-950/50 px-2.5 py-0.5 rounded-full border border-orange-800/40 font-semibold">
                {currentExercise.category}
              </span>
            </div>

            {/* 3D WebGL Canvas adapting dynamically to currentExercise */}
            <AnatomyViewer3D
              key={`active-viewer-${currentExercise.id}`}
              exerciseId={currentExercise.id}
              exerciseName={currentExercise.name}
              targetMuscles={currentExercise.targetMuscles || []}
              primaryMuscles={currentExercise.primaryMuscles || currentExercise.targetMuscles || []}
              secondaryMuscles={currentExercise.secondaryMuscles || []}
              stabilizingMuscles={currentExercise.stabilizingMuscles || []}
              highlightedMuscles={currentExercise.estimatedMuscleActivation}
              activeBiomechanics={currentExercise.biomechanics}
              height={380}
              showControls={true}
              compact={true}
              initialPhase="dual"
            />

            {/* Muscle Activation Progress Bars */}
            <div className="mt-4 space-y-2 pt-3 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Primary & Secondary Movers
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
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
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
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Rest Period Timer
              </span>
              <div className="text-2xl font-black font-mono text-orange-400">
                {formatTime(restTimerSec)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => startRestTimer(restTimerSec > 0 ? restTimerSec : currentItem.restPeriodSec || 60)}
                className="p-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold transition-all shadow-md shadow-orange-950/30"
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
                <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-orange-500/10 text-orange-300 border border-orange-500/20">
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
              <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                <button
                  disabled={currentExerciseIndex === 0}
                  onClick={goToPrevExercise}
                  className="p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Previous Exercise"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-300 px-2 font-mono">
                  {currentExerciseIndex + 1}/{session.exercises.length}
                </span>
                <button
                  disabled={currentExerciseIndex === session.exercises.length - 1}
                  onClick={goToNextExercise}
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
                  className={`grid grid-cols-12 gap-2 items-center p-3 rounded-2xl border transition-all ${
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
                      className="w-full bg-slate-900 border border-slate-700 focus:border-orange-500 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => updateSetReps(setIdx, parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-orange-500 rounded-xl px-2 py-1.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="col-span-2 flex justify-end">
                    <button
                      onClick={() => toggleSetComplete(setIdx)}
                      className={`p-2 rounded-xl transition-all ${
                        set.completed
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-900/40'
                          : 'bg-slate-900 text-slate-500 hover:text-white border border-slate-700 hover:border-emerald-500'
                      }`}
                      title={set.completed ? 'Completed' : 'Mark set completed'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Next Exercise Quick Bar when fully completed */}
            {isExerciseFullyCompleted && currentExerciseIndex < session.exercises.length - 1 && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  All sets logged!
                </span>
                <button
                  onClick={goToNextExercise}
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-orange-950/40"
                >
                  <span>Next: {session.exercises[currentExerciseIndex + 1]?.exercise.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Technical Guidance & Biomechanics Tabs */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <button
                onClick={() => setActiveTab('technique')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'technique'
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Technique Cues
              </button>
              <button
                onClick={() => setActiveTab('biomechanics')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'biomechanics'
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Biomechanics
              </button>
              <button
                onClick={() => setActiveTab('safety')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'safety'
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Safety & Common Mistakes
              </button>
            </div>

            {activeTab === 'technique' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white">Starting Stance:</strong> {currentExercise.startingPosition}
                </p>
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Execution Steps
                  </span>
                  <ol className="space-y-2 text-xs text-slate-300">
                    {currentExercise.movementInstructions.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-mono text-[10px] text-orange-400 flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {activeTab === 'biomechanics' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-400">Joint Articulation:</span>
                    <p className="text-white font-semibold">{currentExercise.biomechanics.jointMovement}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-400">Range of Motion:</span>
                    <p className="text-white font-semibold">{currentExercise.biomechanics.rangeOfMotion}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-400">Body Position:</span>
                    <p className="text-white font-semibold">{currentExercise.biomechanics.bodyPosition}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-400">Force Plane:</span>
                    <p className="text-white font-semibold">{currentExercise.biomechanics.primaryForcePlane}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'safety' && (
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                  <span className="text-rose-400 font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" /> Common Faults to Avoid
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300">
                    {currentExercise.commonMistakes.map((mistake, idx) => (
                      <li key={idx}>{mistake}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
