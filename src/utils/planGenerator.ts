import { EXERCISE_DATABASE } from '../data/exerciseDatabase';
import {
  UserProfile,
  WeeklyPlan,
  WorkoutSession,
  WorkoutExerciseItem,
  MuscleGroup,
} from '../types';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

function getExercise(id: string) {
  return (
    EXERCISE_DATABASE.find((e) => e.id === id) || EXERCISE_DATABASE[0]
  );
}

function createWorkoutItem(
  exerciseId: string,
  sets: number,
  repsOrDuration: string,
  restSec: number,
  notes?: string
): WorkoutExerciseItem {
  const exercise = getExercise(exerciseId);
  return {
    exerciseId: exercise.id,
    exercise,
    sets,
    repsOrDuration,
    restPeriodSec: restSec,
    notes,
    completedSets: Array.from({ length: sets }, (_, i) => ({
      setNumber: i + 1,
      reps: parseInt(repsOrDuration) || 10,
      completed: false,
    })),
  };
}

export function generateDeterministicPlan(profile: UserProfile): WeeklyPlan {
  const { trainingMode, experienceLevel, goal, daysPerWeek, martialArt } = profile;
  const sessions: WorkoutSession[] = [];
  const artName = martialArt || 'Striking & Grappling';

  // Helper to construct muscle summary
  const getMuscles = (items: WorkoutExerciseItem[]): MuscleGroup[] => {
    const set = new Set<MuscleGroup>();
    items.forEach((item) => {
      item.exercise.targetMuscles.forEach((m) => set.add(m));
    });
    return Array.from(set);
  };

  if (trainingMode === 'WEIGHT_TRAINING') {
    // 1. Weight Training Exclusive Schedules
    if (daysPerWeek === 2 || daysPerWeek === 3) {
      // Full Body A / B / C
      const days = daysPerWeek === 2 ? [0, 3] : [0, 2, 4];
      days.forEach((dayIdx, i) => {
        let items: WorkoutExerciseItem[] = [];
        let title = '';
        let purpose = '';

        if (i % 2 === 0) {
          title = 'Full Body Power & Posterior Chain (Day A)';
          purpose = 'Develop foundational compound strength, spine rigidity, and explosive hip extension.';
          items = [
            createWorkoutItem('barbell_back_squat', 4, '6 - 8 reps', 120, 'Focus on parallel depth and upright torso.'),
            createWorkoutItem('barbell_bench_press', 4, '8 - 10 reps', 90, 'Controlled eccentric tempo; touch mid-chest.'),
            createWorkoutItem('pull_ups', 3, '6 - 10 reps', 90, 'Full range of motion, dead hang to chin over bar.'),
            createWorkoutItem('paloff_press', 3, '12 reps / side', 45, 'Strict anti-rotational core lock.'),
          ];
        } else {
          title = 'Full Body Strength & Upper Push/Pull (Day B)';
          purpose = 'Target posterior chain hinge power, overhead pressing strength, and core stability.';
          items = [
            createWorkoutItem('conventional_deadlift', 3, '5 reps', 150, 'Reset each repetition; maintain neutral spine.'),
            createWorkoutItem('overhead_press', 4, '6 - 8 reps', 90, 'Lock out bar stacked directly over base of neck.'),
            createWorkoutItem('kettlebell_swings', 4, '20 reps', 60, 'Ballistic hip hinge power.'),
            createWorkoutItem('combat_mobility_flow', 3, '5 flows / side', 30, 'Decompress hips, thoracic spine, and ankles.'),
          ];
        }

        sessions.push({
          id: `session_wt_${dayIdx}`,
          dayIndex: dayIdx,
          dayName: DAYS_OF_WEEK[dayIdx],
          title,
          sessionType: 'Gym Strength',
          durationMin: 60,
          difficulty: 'Moderate',
          focusCategories: ['Strength', 'Compound Lifts', 'Hypertrophy'],
          purpose,
          targetMusclesSummary: getMuscles(items),
          exercises: items,
          safetyNotes: 'Warm up shoulders and hip joints thoroughly with dynamic stretches before loading heavy barbell work.',
        });
      });
    } else {
      // 4 to 6 days: Upper / Lower / Upper / Lower or Push / Pull / Legs
      const days = daysPerWeek === 4 ? [0, 1, 3, 4] : [0, 1, 2, 3, 4];
      days.forEach((dayIdx, i) => {
        let items: WorkoutExerciseItem[] = [];
        let title = '';
        let purpose = '';

        if (i % 2 === 0) {
          title = 'Upper Body Strength & Hypertrophy';
          purpose = 'Build upper body pushing and pulling mass and glenohumeral stability.';
          items = [
            createWorkoutItem('barbell_bench_press', 4, '8 reps', 90),
            createWorkoutItem('pull_ups', 4, '8 reps', 90),
            createWorkoutItem('overhead_press', 3, '8 reps', 75),
            createWorkoutItem('paloff_press', 3, '12 reps / side', 45),
          ];
        } else {
          title = 'Lower Body Power & Core Foundation';
          purpose = 'Strengthen quadriceps, glutes, hamstrings, and spinal erectors.';
          items = [
            createWorkoutItem('barbell_back_squat', 4, '6 - 8 reps', 120),
            createWorkoutItem('conventional_deadlift', 3, '5 reps', 150),
            createWorkoutItem('kettlebell_swings', 4, '20 reps', 60),
            createWorkoutItem('combat_mobility_flow', 3, '5 flows', 30),
          ];
        }

        sessions.push({
          id: `session_wt_${dayIdx}`,
          dayIndex: dayIdx,
          dayName: DAYS_OF_WEEK[dayIdx],
          title,
          sessionType: 'Gym Strength',
          durationMin: 60,
          difficulty: 'Demanding',
          focusCategories: ['Strength', 'Hypertrophy'],
          purpose,
          targetMusclesSummary: getMuscles(items),
          exercises: items,
          safetyNotes: 'Always utilize safety pins in the squat rack and allow 48 hours before retraining the same primary muscle group.',
        });
      });
    }
  } else if (trainingMode === 'MARTIAL_ARTS') {
    // 2. Martial Arts Focused Schedules
    const days =
      daysPerWeek === 2
        ? [1, 3]
        : daysPerWeek === 3
        ? [0, 2, 4]
        : daysPerWeek === 4
        ? [0, 1, 3, 4]
        : [0, 1, 2, 4, 5];

    days.forEach((dayIdx, i) => {
      let items: WorkoutExerciseItem[] = [];
      let title = '';
      let purpose = '';

      if (i % 3 === 0) {
        title = `${artName}: Technical Combinations & Footwork Mechanics`;
        purpose = 'Hone fundamental foot positioning, distance control, and crisp strike/shot mechanics.';
        items = [
          createWorkoutItem('boxing_combination_drills', 5, '3 min rounds', 60, 'Sharp hand snaps, head movement, and pivots.'),
          createWorkoutItem('muay_thai_roundhouse_drills', 4, '15 kicks / side', 60, 'Turn hip completely over; shin impact.'),
          createWorkoutItem('paloff_press', 3, '12 reps / side', 45, 'Core anti-rotational stiffness for strike delivery.'),
        ];
      } else if (i % 3 === 1) {
        title = `${artName}: Grappling Defense & Takedown Dynamics`;
        purpose = 'Condition hip explosion, bridging leverage, and sprawl reaction speed.';
        items = [
          createWorkoutItem('wrestling_level_change_sprawl', 4, '10 shot + sprawls', 60, 'Low center of gravity with instant hip drop.'),
          createWorkoutItem('bjj_shrimping_bridging', 4, '20 reps continuous', 45, 'Bridge onto shoulder; push off floor.'),
          createWorkoutItem('kettlebell_swings', 4, '20 reps', 60, 'Explosive hip extension for takedown power.'),
        ];
      } else {
        title = `${artName}: Combat Conditioning & Active Mobility`;
        purpose = 'Build sport-specific lactic threshold, aerobic gas tank, and joint decompression.';
        items = [
          createWorkoutItem('boxing_combination_drills', 4, '3 min rounds', 45),
          createWorkoutItem('muay_thai_roundhouse_drills', 4, '15 kicks / side', 45),
          createWorkoutItem('combat_mobility_flow', 4, '5 deep flows / side', 30),
        ];
      }

      sessions.push({
        id: `session_ma_${dayIdx}`,
        dayIndex: dayIdx,
        dayName: DAYS_OF_WEEK[dayIdx],
        title,
        sessionType: 'Martial Arts',
        durationMin: 60,
        difficulty: 'Demanding',
        focusCategories: ['Technique', 'Footwork', 'Conditioning', 'Speed'],
        purpose,
        targetMusclesSummary: getMuscles(items),
        exercises: items,
        safetyNotes: 'Wear wraps and protective gear; never hyperextend joints on missed strikes.',
      });
    });
  } else {
    // 3. HYBRID MODE - Intelligent Scheduling separating Heavy Lower Body from Sparring/Martial Arts!
    // Monday (0): Heavy Upper Body Strength + Core Anti-Rotation (Fresh neural state)
    // Tuesday (1): Martial Arts Technical Striking & Footwork (Legs are not fatigued from squats)
    // Wednesday (2): Active Mobility / Rest (Mid-week recovery)
    // Thursday (3): Lower Body Power & Posterior Chain (Safe distance from sparring)
    // Friday (4): Martial Arts Grappling / Defense / Conditioning
    // Saturday (5): Full Body Athletic Conditioning & Mobility (Optional based on days)
    // Sunday (6): Rest Day

    if (daysPerWeek === 2) {
      // Day 1: Strength, Day 2: Martial Arts
      sessions.push({
        id: 'session_hyb_0',
        dayIndex: 1, // Tuesday
        dayName: 'Tuesday',
        title: 'Hybrid Pillar 1: Full-Body Athletic Strength',
        sessionType: 'Gym Strength',
        durationMin: 60,
        difficulty: 'Moderate',
        focusCategories: ['Strength', 'Compound Power'],
        purpose: 'Build structural armor and rotational force capability across the entire body.',
        targetMusclesSummary: ['chest', 'lats', 'glutes', 'quadriceps', 'abs'],
        exercises: [
          createWorkoutItem('barbell_back_squat', 3, '6 - 8 reps', 120, 'Moderate loading to protect recovery.'),
          createWorkoutItem('barbell_bench_press', 3, '8 reps', 90, 'Focus on pressing velocity.'),
          createWorkoutItem('pull_ups', 3, '6 - 8 reps', 90, 'Vertical lat power for clinch work.'),
          createWorkoutItem('paloff_press', 3, '12 reps / side', 45, 'Core anti-rotational stiffness.'),
        ],
        safetyNotes: 'Keep 1-2 reps in reserve (RPE 7-8) to prevent excessive fatigue for combat sessions.',
        hybridRecoveryAdvice: 'Scheduled with 48 hours before technical martial arts to ensure fresh connective tissue.',
      });

      sessions.push({
        id: 'session_hyb_1',
        dayIndex: 4, // Friday
        dayName: 'Friday',
        title: `Hybrid Pillar 2: ${artName} Striking & Grappling Drills`,
        sessionType: 'Martial Arts',
        durationMin: 60,
        difficulty: 'Demanding',
        focusCategories: ['Technique', 'Footwork', 'Conditioning'],
        purpose: 'Translate gym horsepower directly into martial arts velocity and timing.',
        targetMusclesSummary: ['calves', 'obliques', 'glutes', 'anterior_deltoid', 'hip_flexors'],
        exercises: [
          createWorkoutItem('boxing_combination_drills', 4, '3 min rounds', 60),
          createWorkoutItem('muay_thai_roundhouse_drills', 4, '15 kicks / side', 60),
          createWorkoutItem('wrestling_level_change_sprawl', 3, '8 combos', 60),
          createWorkoutItem('combat_mobility_flow', 3, '5 flows', 30),
        ],
        safetyNotes: 'Focus on clean technique over raw strain.',
        hybridRecoveryAdvice: 'Hydrate well with electrolytes to prevent post-sparring cramping.',
      });
    } else if (daysPerWeek === 3) {
      // Mon: Upper Body Strength, Wed: Martial Arts Striking/Grappling, Fri: Lower Body & Posterior Chain
      sessions.push({
        id: 'session_hyb_0',
        dayIndex: 0, // Mon
        dayName: 'Monday',
        title: 'Hybrid Phase 1: Upper Body Strength & Grip Armor',
        sessionType: 'Gym Strength',
        durationMin: 55,
        difficulty: 'Moderate',
        focusCategories: ['Strength', 'Hypertrophy'],
        purpose: 'Develop upper body pressing, pulling mass, and neck/grip stability for combat resilience.',
        targetMusclesSummary: ['chest', 'lats', 'anterior_deltoid', 'biceps', 'triceps', 'forearms'],
        exercises: [
          createWorkoutItem('barbell_bench_press', 4, '8 reps', 90),
          createWorkoutItem('pull_ups', 4, '8 reps', 90),
          createWorkoutItem('overhead_press', 3, '8 reps', 75),
          createWorkoutItem('paloff_press', 3, '12 reps / side', 45),
        ],
        safetyNotes: 'Legs remain completely fresh for Tuesday/Wednesday martial arts sessions.',
        hybridRecoveryAdvice: 'Zero heavy leg fatigue allows optimal footwork and kicking elasticity later in the week.',
      });

      sessions.push({
        id: 'session_hyb_1',
        dayIndex: 2, // Wed
        dayName: 'Wednesday',
        title: `Hybrid Phase 2: ${artName} Technical Striking & Footwork`,
        sessionType: 'Martial Arts',
        durationMin: 60,
        difficulty: 'Demanding',
        focusCategories: ['Technique', 'Footwork', 'Speed', 'Conditioning'],
        purpose: 'Master distance management, angle changes, and explosive multi-strike combinations.',
        targetMusclesSummary: ['calves', 'obliques', 'anterior_deltoid', 'glutes', 'hip_flexors'],
        exercises: [
          createWorkoutItem('boxing_combination_drills', 5, '3 min rounds', 60),
          createWorkoutItem('muay_thai_roundhouse_drills', 4, '15 kicks / side', 60),
          createWorkoutItem('wrestling_level_change_sprawl', 3, '10 combos', 60),
          createWorkoutItem('combat_mobility_flow', 3, '5 flows', 30),
        ],
        safetyNotes: 'Wrap wrists firmly; maintain active eye contact and relaxed breathing.',
        hybridRecoveryAdvice: 'Perform the mobility flow immediately following rounds to clear lactate.',
      });

      sessions.push({
        id: 'session_hyb_2',
        dayIndex: 4, // Fri
        dayName: 'Friday',
        title: 'Hybrid Phase 3: Lower Body Power & Explosive Hip Hinge',
        sessionType: 'Gym Strength',
        durationMin: 60,
        difficulty: 'Demanding',
        focusCategories: ['Lower Body Power', 'Posterior Chain'],
        purpose: 'Strengthen the kinetic chain engine (glutes, hamstrings, quads) to boost punching and takedown power.',
        targetMusclesSummary: ['quadriceps', 'glutes', 'hamstrings', 'erector_spinae'],
        exercises: [
          createWorkoutItem('barbell_back_squat', 4, '6 - 8 reps', 120),
          createWorkoutItem('conventional_deadlift', 3, '5 reps', 150),
          createWorkoutItem('kettlebell_swings', 4, '20 reps', 60),
          createWorkoutItem('bjj_shrimping_bridging', 3, '15 reps', 45),
        ],
        safetyNotes: 'Scheduled strategically before weekend rest days so heavy leg fatigue does NOT compromise sparring.',
        hybridRecoveryAdvice: 'Enjoy 48 hours of recovery over the weekend before restarting the cycle.',
      });
    } else {
      // 4 to 5 days: Mon (Upper Strength), Tue (Martial Arts Striking), Thu (Lower Strength), Fri (Martial Arts Grappling/Conditioning), Sat (Recovery/Mobility)
      sessions.push({
        id: 'session_hyb_0',
        dayIndex: 0,
        dayName: 'Monday',
        title: 'Hybrid Day 1: Upper Body Push/Pull Strength',
        sessionType: 'Gym Strength',
        durationMin: 55,
        difficulty: 'Moderate',
        focusCategories: ['Strength', 'Upper Armor'],
        purpose: 'Build upper torso frame strength and scapular integrity without fatiguing legs.',
        targetMusclesSummary: ['chest', 'lats', 'anterior_deltoid', 'triceps', 'biceps'],
        exercises: [
          createWorkoutItem('barbell_bench_press', 4, '8 reps', 90),
          createWorkoutItem('pull_ups', 4, '8 reps', 90),
          createWorkoutItem('overhead_press', 3, '8 reps', 75),
          createWorkoutItem('paloff_press', 3, '12 reps', 45),
        ],
        safetyNotes: 'Keep joints protected; warm up rotator cuff thoroughly.',
        hybridRecoveryAdvice: 'Intelligent scheduling keeps legs totally fresh for Tuesday striking footwork.',
      });

      sessions.push({
        id: 'session_hyb_1',
        dayIndex: 1,
        dayName: 'Tuesday',
        title: `Hybrid Day 2: ${artName} Striking, Footwork & Speed`,
        sessionType: 'Martial Arts',
        durationMin: 60,
        difficulty: 'Demanding',
        focusCategories: ['Technique', 'Footwork', 'Speed'],
        purpose: 'Sharpen footwork speed, pivot angles, and combination fluidity.',
        targetMusclesSummary: ['calves', 'obliques', 'anterior_deltoid', 'hip_flexors'],
        exercises: [
          createWorkoutItem('boxing_combination_drills', 5, '3 min rounds', 60),
          createWorkoutItem('muay_thai_roundhouse_drills', 5, '15 kicks / side', 60),
          createWorkoutItem('combat_mobility_flow', 3, '5 flows', 30),
        ],
        safetyNotes: 'Keep hands up and chin tucked; avoid over-reaching.',
        hybridRecoveryAdvice: 'Rehydrate thoroughly and refuel with carbohydrates post-sparring.',
      });

      sessions.push({
        id: 'session_hyb_2',
        dayIndex: 3,
        dayName: 'Thursday',
        title: 'Hybrid Day 3: Lower Body Power & Hip Drive',
        sessionType: 'Gym Strength',
        durationMin: 60,
        difficulty: 'Demanding',
        focusCategories: ['Lower Body Power', 'Posterior Chain'],
        purpose: 'Develop deep squat power, deadlift hip hinge force, and core armor.',
        targetMusclesSummary: ['quadriceps', 'glutes', 'hamstrings', 'erector_spinae'],
        exercises: [
          createWorkoutItem('barbell_back_squat', 4, '6 - 8 reps', 120),
          createWorkoutItem('conventional_deadlift', 3, '5 reps', 150),
          createWorkoutItem('kettlebell_swings', 4, '20 reps', 60),
        ],
        safetyNotes: 'Deliberately placed with a 48-hour gap after striking and before grappling.',
        hybridRecoveryAdvice: 'Take advantage of Wednesday rest to enter this session with high energy.',
      });

      sessions.push({
        id: 'session_hyb_3',
        dayIndex: 4,
        dayName: 'Friday',
        title: `Hybrid Day 4: ${artName} Grappling, Takedowns & Conditioning`,
        sessionType: 'Martial Arts',
        durationMin: 60,
        difficulty: 'Demanding',
        focusCategories: ['Grappling', 'Defense', 'Conditioning'],
        purpose: 'Condition takedown shot entries, reaction sprawls, and ground hip escapes.',
        targetMusclesSummary: ['glutes', 'erector_spinae', 'quadriceps', 'abs', 'obliques'],
        exercises: [
          createWorkoutItem('wrestling_level_change_sprawl', 4, '10 shot + sprawls', 60),
          createWorkoutItem('bjj_shrimping_bridging', 4, '20 reps', 45),
          createWorkoutItem('paloff_press', 3, '12 reps / side', 45),
          createWorkoutItem('combat_mobility_flow', 3, '5 flows', 30),
        ],
        safetyNotes: 'Control training partners safely during takedowns and submissions.',
        hybridRecoveryAdvice: 'Finish with 10 minutes of deep diaphragmatic breathing and mobility.',
      });

      if (daysPerWeek >= 5) {
        sessions.push({
          id: 'session_hyb_4',
          dayIndex: 5,
          dayName: 'Saturday',
          title: 'Hybrid Day 5: Active Recovery, Mobility & Core Flow',
          sessionType: 'Active Recovery',
          durationMin: 40,
          difficulty: 'Easy',
          focusCategories: ['Mobility', 'Recovery', 'Joint Health'],
          purpose: 'Decompress joints, restore tissue length, and promote parasympathetic nervous system recovery.',
          targetMusclesSummary: ['hip_flexors', 'hamstrings', 'upper_back', 'rotator_cuff'],
          exercises: [
            createWorkoutItem('combat_mobility_flow', 5, '6 slow flows', 30),
            createWorkoutItem('paloff_press', 3, '10 reps (light)', 45),
            createWorkoutItem('kettlebell_swings', 3, '15 reps (light tempo)', 60),
          ],
          safetyNotes: 'Stay in low heart-rate zone 1-2; zero maximal strain.',
          hybridRecoveryAdvice: 'A gentle recovery session that accelerates systemic blood flow.',
        });
      }
    }
  }

  // Generate overview text
  let weeklyOverview = '';
  if (trainingMode === 'HYBRID') {
    weeklyOverview = `Intelligently structured Hybrid Protocol balancing ${artName} skill acquisition with progressive gym overload. Neural and lower-body strain is sequenced away from high-impact sparring to safeguard your joints and prevent overtraining.`;
  } else if (trainingMode === 'MARTIAL_ARTS') {
    weeklyOverview = `Dedicated Combat Performance Routine tailored for ${artName} focusing on rotational velocity, footwork fluidity, conditioning, and kinetic chain power transfer.`;
  } else {
    weeklyOverview = `Structured Resistance Training Routine designed for ${goal} across ${daysPerWeek} training days, focusing on progressive overload, compound movement mastery, and injury prevention.`;
  }

  return {
    id: `plan_${Date.now()}`,
    createdAt: new Date().toISOString(),
    generatedByAi: false,
    userGoal: goal,
    sessions,
    weeklyOverview,
    recoveryGuideline:
      'Prioritize 7-9 hours of restorative sleep, drink 3L+ of water daily, and never ignore persistent joint discomfort or lightheadedness.',
  };
}

export async function generateAiPersonalizedPlan(
  profile: UserProfile
): Promise<WeeklyPlan> {
  try {
    const res = await fetch('/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile }),
    });

    if (!res.ok) {
      console.warn('AI Plan generation endpoint returned error, falling back to intelligent deterministic generator.');
      return generateDeterministicPlan(profile);
    }

    const data = await res.json();
    if (data && data.plan && Array.isArray(data.plan.sessions)) {
      // Rehydrate exercises with local rich database references for complete metadata
      const rehydratedSessions: WorkoutSession[] = data.plan.sessions.map(
        (s: WorkoutSession, idx: number) => ({
          ...s,
          dayIndex: s.dayIndex !== undefined ? s.dayIndex : idx,
          dayName: s.dayName || DAYS_OF_WEEK[idx % 7],
          exercises: s.exercises.map((item) => {
            const dbMatch =
              EXERCISE_DATABASE.find(
                (e) =>
                  e.id === item.exerciseId ||
                  e.name.toLowerCase() === (item.exercise?.name || '').toLowerCase()
              ) || EXERCISE_DATABASE[0];
            return {
              ...item,
              exercise: dbMatch,
              exerciseId: dbMatch.id,
              completedSets: item.completedSets || Array.from({ length: item.sets || 3 }, (_, i) => ({
                setNumber: i + 1,
                reps: parseInt(item.repsOrDuration) || 10,
                completed: false,
              })),
            };
          }),
        })
      );

      return {
        ...data.plan,
        generatedByAi: true,
        sessions: rehydratedSessions,
      };
    }
  } catch (err) {
    console.warn('Network error calling AI generator, using offline deterministic generator:', err);
  }

  return generateDeterministicPlan(profile);
}
