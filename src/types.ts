export type TrainingMode = 'WEIGHT_TRAINING' | 'MARTIAL_ARTS' | 'HYBRID';

export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type TrainingGoal =
  | 'Strength'
  | 'Muscle Development'
  | 'Power & Explosiveness'
  | 'Conditioning & Stamina'
  | 'Martial Arts Performance'
  | 'General Functional Fitness';

export type MartialArtDiscipline =
  | 'Boxing'
  | 'Kickboxing'
  | 'Muay Thai'
  | 'MMA (Mixed Martial Arts)'
  | 'Brazilian Jiu-Jitsu (BJJ) / Grappling'
  | 'Wrestling'
  | 'Judo'
  | 'Karate / Taekwondo';

export type EquipmentOption =
  | 'Full Gym (Barbell, Dumbbells, Cables, Machines)'
  | 'Dumbbells & Adjustable Bench'
  | 'Bodyweight & Pull-up Bar'
  | 'Combat Gear (Pads, Heavy Bag, Mat Space)'
  | 'Minimal Home Setup (Bands & Light Dumbbells)';

export type SessionDuration = '30 min' | '45 min' | '60 min' | '90+ min';

export interface UserProfile {
  id: string;
  name: string;
  trainingMode: TrainingMode;
  experienceLevel: ExperienceLevel;
  goal: TrainingGoal;
  daysPerWeek: number;
  sessionDuration: SessionDuration;
  equipment: EquipmentOption[];
  martialArt?: MartialArtDiscipline;
  secondaryMartialArt?: MartialArtDiscipline;
  injuryNotes?: string;
  createdAt: string;
  completedOnboarding: boolean;
}

export type MuscleGroup =
  | 'chest'
  | 'upper_chest'
  | 'lats'
  | 'upper_back'
  | 'traps'
  | 'rhomboids'
  | 'erector_spinae'
  | 'serratus_anterior'
  | 'anterior_deltoid'
  | 'lateral_deltoid'
  | 'posterior_deltoid'
  | 'rotator_cuff'
  | 'biceps'
  | 'brachialis'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'obliques'
  | 'transverse_abdominis'
  | 'hip_flexors'
  | 'psoas_major'
  | 'glutes'
  | 'gluteus_medius'
  | 'quadriceps'
  | 'rectus_femoris'
  | 'vastus_medialis'
  | 'vastus_lateralis'
  | 'hamstrings'
  | 'calves'
  | 'soleus'
  | 'tibialis';

export type AnatomyLayerMode = 'muscular' | 'skeletal' | 'deep' | 'composite';

export interface MuscleDetail {
  id: MuscleGroup;
  name: string;
  latinName: string;
  layer: 'superficial' | 'deep';
  deepLevel?: number; // 1 = intermediate, 2 = deep, 3 = deepest/sub-articular
  region: 'Upper Body' | 'Core' | 'Lower Body' | 'Arms';
  primaryFunction: string;
  mainMovements: string[];
  keyExercises: string[];
  origin: string;
  insertion: string;
  innervation: string;
  martialArtsRelevance: string;
  position3D: { x: number; y: number; z: number };
  color: string;
}

export interface BiomechanicsInfo {
  jointMovement: string;
  rangeOfMotion: string;
  bodyPosition: string;
  movementDirection: string;
  primaryForcePlane: string;
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  stabilizingMuscles: string[];
  notes: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: 'Weight Training' | 'Martial Arts' | 'Conditioning' | 'Mobility' | 'Recovery';
  subCategory?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  targetMuscles: MuscleGroup[];
  primaryMuscles?: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  stabilizingMuscles?: MuscleGroup[];
  equipmentNeeded: string[];
  defaultSets: number;
  defaultReps: string;
  defaultRestSec: number;
  startingPosition: string;
  movementInstructions: string[];
  techniqueCues: string[];
  commonMistakes: string[];
  safetyConsiderations: string[];
  estimatedMuscleActivation: { [key in MuscleGroup]?: number }; // 0 to 100%
  biomechanics: BiomechanicsInfo;
  martialArtsDisciplines?: MartialArtDiscipline[];
}

export interface WorkoutExerciseItem {
  exerciseId: string;
  exercise: Exercise;
  sets: number;
  repsOrDuration: string;
  restPeriodSec: number;
  notes?: string;
  completedSets?: {
    setNumber: number;
    reps: number;
    weightKg?: number;
    completed: boolean;
  }[];
}

export interface WorkoutSession {
  id: string;
  dayIndex: number; // 0 = Mon, 6 = Sun
  dayName: string;
  title: string;
  sessionType: 'Gym Strength' | 'Martial Arts' | 'Hybrid Conditioning' | 'Active Recovery' | 'Rest Day';
  durationMin: number;
  difficulty: 'Easy' | 'Moderate' | 'Demanding' | 'High Intensity';
  focusCategories: string[];
  purpose: string;
  targetMusclesSummary: MuscleGroup[];
  exercises: WorkoutExerciseItem[];
  safetyNotes: string;
  hybridRecoveryAdvice?: string;
}

export interface WeeklyPlan {
  id: string;
  createdAt: string;
  generatedByAi: boolean;
  userGoal: string;
  sessions: WorkoutSession[];
  weeklyOverview: string;
  recoveryGuideline: string;
}

export interface CompletedWorkoutLog {
  id: string;
  sessionId: string;
  sessionTitle: string;
  date: string;
  durationMinutes: number;
  exercisesCompleted: number;
  totalVolumeKg?: number;
  perceivedEffort: number; // 1 - 10
  notes?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  category?: 'training' | 'anatomy' | 'nutrition' | 'recovery' | 'safety';
}
