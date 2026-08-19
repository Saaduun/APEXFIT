import React, { useState } from 'react';
import {
  TrainingMode,
  ExperienceLevel,
  TrainingGoal,
  MartialArtDiscipline,
  SessionDuration,
  EquipmentOption,
  UserProfile,
} from '../types';
import { Dumbbell, Swords, Sparkles, Check, ArrowRight, ShieldCheck, Flame, Zap, Compass } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: UserProfile) => void;
  onClose?: () => void;
  initialProfile?: UserProfile | null;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  onClose,
  initialProfile,
}) => {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<TrainingMode>(initialProfile?.trainingMode || 'HYBRID');
  const [martialArt, setMartialArt] = useState<MartialArtDiscipline>(
    initialProfile?.martialArt || 'Boxing'
  );
  const [experience, setExperience] = useState<ExperienceLevel>(
    initialProfile?.experienceLevel || 'Beginner'
  );
  const [goal, setGoal] = useState<TrainingGoal>(
    initialProfile?.goal || 'Martial Arts Performance'
  );
  const [daysPerWeek, setDaysPerWeek] = useState<number>(initialProfile?.daysPerWeek || 3);
  const [duration, setDuration] = useState<SessionDuration>(
    initialProfile?.sessionDuration || '60 min'
  );
  const [equipment, setEquipment] = useState<EquipmentOption[]>(
    initialProfile?.equipment || [
      'Full Gym (Barbell, Dumbbells, Cables, Machines)',
      'Combat Gear (Pads, Heavy Bag, Mat Space)',
    ]
  );
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const disciplines: MartialArtDiscipline[] = [
    'Boxing',
    'Kickboxing',
    'Muay Thai',
    'MMA (Mixed Martial Arts)',
    'Brazilian Jiu-Jitsu (BJJ) / Grappling',
    'Wrestling',
    'Judo',
    'Karate / Taekwondo',
  ];

  const goals: { label: TrainingGoal; desc: string; icon: any }[] = [
    { label: 'Martial Arts Performance', desc: 'Punching/kicking power, fight conditioning, and kinetic velocity.', icon: Swords },
    { label: 'Strength', desc: 'Maximal compound barbell force and structural bone density.', icon: Dumbbell },
    { label: 'Muscle Development', desc: 'Hypertrophy, symmetric muscle growth, and joint armor.', icon: Flame },
    { label: 'Power & Explosiveness', desc: 'Rate of force development, ballistic jumps, and speed.', icon: Zap },
    { label: 'Conditioning & Stamina', desc: 'Aerobic/anaerobic gas tank and rapid round recovery.', icon: Sparkles },
    { label: 'General Functional Fitness', desc: 'Everyday athletic resilience, mobility, and healthy longevity.', icon: Compass },
  ];

  const equipmentList: EquipmentOption[] = [
    'Full Gym (Barbell, Dumbbells, Cables, Machines)',
    'Dumbbells & Adjustable Bench',
    'Bodyweight & Pull-up Bar',
    'Combat Gear (Pads, Heavy Bag, Mat Space)',
    'Minimal Home Setup (Bands & Light Dumbbells)',
  ];

  const toggleEquipment = (item: EquipmentOption) => {
    if (equipment.includes(item)) {
      if (equipment.length > 1) {
        setEquipment(equipment.filter((e) => e !== item));
      }
    } else {
      setEquipment([...equipment, item]);
    }
  };

  const handleFinish = async () => {
    setIsGenerating(true);
    const newProfile: UserProfile = {
      id: initialProfile?.id || `user_${Date.now()}`,
      name: 'Athlete',
      trainingMode: mode,
      experienceLevel: experience,
      goal,
      daysPerWeek,
      sessionDuration: duration,
      equipment,
      martialArt: mode !== 'WEIGHT_TRAINING' ? martialArt : undefined,
      createdAt: new Date().toISOString(),
      completedOnboarding: true,
    };

    // Simulated short smooth generation transition
    setTimeout(() => {
      setIsGenerating(false);
      onComplete(newProfile);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
        {/* Progress Dots */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
            Step {step} of 4 • {step === 1 ? 'Select Discipline' : step === 2 ? 'Experience & Goal' : step === 3 ? 'Schedule & Duration' : 'Equipment & Setup'}
          </span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step
                    ? 'w-7 bg-rose-500'
                    : i < step
                    ? 'w-3 bg-rose-900/60'
                    : 'w-3 bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Main Training Mode (Weight Training, Martial Arts, Hybrid) */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                What do you train?
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Choose your primary focus. We tailor your schedule to avoid overtraining and fatigue interference.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Option 1: Weight Training */}
              <button
                id="btn-mode-weight"
                type="button"
                onClick={() => setMode('WEIGHT_TRAINING')}
                className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  mode === 'WEIGHT_TRAINING'
                    ? 'bg-gradient-to-b from-blue-900/40 to-slate-900 border-blue-500 shadow-xl shadow-blue-950/50 scale-[1.02]'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-3">
                    <Dumbbell className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-base font-bold text-white">Weight Training</h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Pure gym focus: Strength, muscle hypertrophy, power, and progressive barbell overload.
                  </p>
                </div>
                {mode === 'WEIGHT_TRAINING' && (
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-400">
                    <Check className="w-4 h-4" /> Selected
                  </div>
                )}
              </button>

              {/* Option 2: Martial Arts */}
              <button
                id="btn-mode-martial"
                type="button"
                onClick={() => setMode('MARTIAL_ARTS')}
                className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  mode === 'MARTIAL_ARTS'
                    ? 'bg-gradient-to-b from-rose-900/40 to-slate-900 border-rose-500 shadow-xl shadow-rose-950/50 scale-[1.02]'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-3">
                    <Swords className="w-6 h-6 text-rose-400" />
                  </div>
                  <h3 className="text-base font-bold text-white">Martial Arts</h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Striking, grappling, footwork, fight conditioning, and combat mobility.
                  </p>
                </div>
                {mode === 'MARTIAL_ARTS' && (
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-rose-400">
                    <Check className="w-4 h-4" /> Selected
                  </div>
                )}
              </button>

              {/* Option 3: HYBRID (Main Highlight) */}
              <button
                id="btn-mode-hybrid"
                type="button"
                onClick={() => setMode('HYBRID')}
                className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  mode === 'HYBRID'
                    ? 'bg-gradient-to-b from-amber-900/40 to-slate-900 border-amber-500 shadow-xl shadow-amber-950/50 scale-[1.02]'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                  Featured
                </div>
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3">
                    <div className="flex items-center -space-x-1">
                      <Swords className="w-5 h-5 text-rose-400" />
                      <Dumbbell className="w-5 h-5 text-amber-400" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white">Hybrid Athlete</h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Combines martial arts & weights with fatigue-aware scheduling to protect leg freshness.
                  </p>
                </div>
                {mode === 'HYBRID' && (
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-amber-400">
                    <Check className="w-4 h-4" /> Selected
                  </div>
                )}
              </button>
            </div>

            {/* If Martial Arts or Hybrid is selected, ask for discipline */}
            {mode !== 'WEIGHT_TRAINING' && (
              <div className="pt-4 border-t border-slate-800">
                <label className="block text-sm font-semibold text-slate-200 mb-3">
                  Which martial art do you practice?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {disciplines.map((art) => (
                    <button
                      key={art}
                      type="button"
                      onClick={() => setMartialArt(art)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-medium text-center transition-all border ${
                        martialArt === art
                          ? 'bg-rose-600 text-white border-rose-500 font-semibold shadow-md shadow-rose-950/40'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {art}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Experience Level & Main Goal */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Experience & Goal
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Help us calibrate volume, complexity, and recovery pacing.
              </p>
            </div>

            {/* Experience Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Your Experience Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['Beginner', 'Intermediate', 'Advanced'] as ExperienceLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperience(lvl)}
                    className={`py-3 px-4 rounded-xl border text-center text-sm font-semibold transition-all ${
                      experience === lvl
                        ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-900/30'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Goal Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Primary Training Objective
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {goals.map((g) => {
                  const Icon = g.icon;
                  const isSelected = goal === g.label;
                  return (
                    <button
                      key={g.label}
                      type="button"
                      onClick={() => setGoal(g.label)}
                      className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-slate-800 border-rose-500 shadow-md shadow-rose-950/30'
                          : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          isSelected ? 'bg-rose-500 text-white' : 'bg-slate-900 text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{g.label}</div>
                        <div className="text-xs text-slate-400 mt-0.5 leading-snug">{g.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Training Days & Session Duration */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Schedule & Duration
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Select your weekly availability. Consistency beats overtraining.
              </p>
            </div>

            {/* Days per week */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-white">Training Days Per Week</span>
                <span className="text-lg font-extrabold text-rose-400">{daysPerWeek} Days</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setDaysPerWeek(num)}
                    className={`py-3 rounded-xl font-bold text-sm transition-all border ${
                      daysPerWeek === num
                        ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-900/30'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {num} Days
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-3">
                {daysPerWeek === 2 && 'Ideal for busy schedules maintaining strength & basic combat skills.'}
                {daysPerWeek === 3 && 'The sweet spot for hybrid athletes (e.g. 2 martial arts + 1 full body gym or vice versa).'}
                {daysPerWeek === 4 && 'Optimal 4-day hybrid split with designated recovery windows.'}
                {daysPerWeek >= 5 && 'High volume training split requiring disciplined nutrition and 8+ hours sleep.'}
              </p>
            </div>

            {/* Session Duration */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Preferred Session Duration
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['30 min', '45 min', '60 min', '90+ min'] as SessionDuration[]).map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setDuration(dur)}
                    className={`py-3 px-3 rounded-xl border text-center text-sm font-semibold transition-all ${
                      duration === dur
                        ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-900/30'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Equipment & Confirmation */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Available Equipment
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Select all equipment you have access to. Tap to toggle.
              </p>
            </div>

            <div className="space-y-2.5">
              {equipmentList.map((eq) => {
                const isSelected = equipment.includes(eq);
                return (
                  <button
                    key={eq}
                    type="button"
                    onClick={() => toggleEquipment(eq)}
                    className={`w-full p-3.5 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-800/90 border-rose-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{eq}</span>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                        isSelected
                          ? 'bg-rose-600 border-rose-500 text-white'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Safety & Medical Disclaimers */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed">
                <strong className="text-slate-200">Safety First:</strong> This coach provides educational athletic programming. It does NOT prescribe medical treatments or claim to prevent injuries. Always stop immediately if you experience sharp pain or dizziness.
              </p>
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              id="btn-onboarding-next"
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-rose-900/30 transition-all"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="btn-onboarding-generate"
              type="button"
              disabled={isGenerating}
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-rose-900/40 transition-all active:scale-95 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create My Routine
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
