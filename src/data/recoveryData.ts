export interface RecoveryPrinciple {
  id: string;
  title: string;
  category: string;
  summary: string;
  details: string;
}

export interface MobilityMovement {
  name: string;
  durationOrReps: string;
  cues: string;
}

export interface MobilityFlow {
  id: string;
  name: string;
  targetSport: string;
  durationMin: number;
  description: string;
  movements: MobilityMovement[];
}

export const RECOVERY_PRINCIPLES: RecoveryPrinciple[] = [
  {
    id: 'sleep_hygiene',
    title: 'Sleep Architecture (7-9 Hours)',
    category: 'CNS & Hormonal Recovery',
    summary: 'Deep slow-wave sleep is the primary biological window for growth hormone release, muscle protein synthesis, and martial arts kinetic pattern consolidation.',
    details: 'Aim for a pitch-dark, cool room (65-68°F / 18-20°C). Avoid blue screens 60 minutes before bed to allow natural melatonin surge.',
  },
  {
    id: 'neural_load_management',
    title: 'Hybrid Load Sequencing',
    category: 'Overtraining Prevention',
    summary: 'Stagger heavy lower-body barbell squats/deadlifts at least 24-48 hours away from high-impact martial arts sparring or kicking sessions.',
    details: 'Heavy compound leg lifts place intense demand on the central nervous system and knee/hip joint capsules. Allowing 48 hours prevents technical breakdown and fatigue.',
  },
  {
    id: 'active_mobility',
    title: 'Fascial & Joint Decompression',
    category: 'Mobility & Range of Motion',
    summary: 'Daily 10-15 minute low-intensity dynamic flows restore resting sarcomere length and relieve posture stiffness from guard/striking stances.',
    details: 'Target the thoracic spine, rotator cuffs, hip flexors, and spinal erectors.',
  },
];

export const MOBILITY_FLOWS: MobilityFlow[] = [
  {
    id: 'striker_reset',
    name: 'Striker Shoulder & Hip Capsule Reset',
    targetSport: 'Boxing, Kickboxing & Muay Thai',
    durationMin: 12,
    description: 'Decompresses the shoulders, opens tight hip flexors from kicking, and restores thoracic rotational mobility.',
    movements: [
      {
        name: 'Thoracic Bench/Foam Roller Extension',
        durationOrReps: '8 deep breaths × 2 sets',
        cues: 'Elbows rested on bench, palms together, sink chest toward the floor to open mid-back.',
      },
      {
        name: 'Half-Kneeling Hip Flexor Opening',
        durationOrReps: '45s per side',
        cues: 'Tuck pelvis under (posterior pelvic tilt), squeeze trailing glute, reach arm overhead.',
      },
      {
        name: 'Band Pass-Throughs / Broomstick Dislocates',
        durationOrReps: '15 smooth reps',
        cues: 'Keep elbows locked and ribcage down; move shoulders in smooth full arcs.',
      },
      {
        name: 'Sleeper Stretch (Gentle Internal Rotation)',
        durationOrReps: '30s gentle per side',
        cues: 'Lie on side, gently press wrist toward floor without forcing acute pain.',
      },
    ],
  },
  {
    id: 'grappler_flow',
    name: 'Grappler Decompression & Posterior Chain Flow',
    targetSport: 'BJJ, Wrestling & Judo',
    durationMin: 15,
    description: 'Releases spinal compression from takedowns, opens tight adductors from guard play, and relaxes the neck.',
    movements: [
      {
        name: 'Segmented Cat-Cow Spinal Articulation',
        durationOrReps: '10 slow cycles',
        cues: 'Move vertebra by vertebra from the sacrum through the thoracic spine to the neck.',
      },
      {
        name: 'Frog Stretch (Adductor & Hip Opener)',
        durationOrReps: '60s hold with soft rocking',
        cues: 'Knees wide on mat, feet turned out, push hips back smoothly.',
      },
      {
        name: 'Supine Figure-4 / 90-90 Hip Mobility',
        durationOrReps: '90s per side',
        cues: 'Keep chest proud, breathe deeply into outer glute and piriformis.',
      },
      {
        name: 'Slow Jefferson Curl / Standing Forward Fold',
        durationOrReps: '6 gentle reps',
        cues: 'Tuck chin, roll down vertebra by vertebra feeling each spinal segment relax.',
      },
    ],
  },
];

export const SAFETY_WARNINGS = [
  'Persistent, sharp, localized joint or tendon pain.',
  'Dizziness, lightheadedness, disorientation, or blurred vision.',
  'Shortness of breath, chest pressure, irregular heartbeat, or palpitations.',
  'Fainting, nausea, loss of balance, or numbness/tingling in extremities.',
  'Suspected head impact symptoms or concussion indicators (headache, light sensitivity, confusion).',
];

// Aliases for legacy compatibility
export const RECOVERY_METRICS = RECOVERY_PRINCIPLES;
export const MOBILITY_ROUTINES = MOBILITY_FLOWS;
export const MEDICAL_SAFETY_WARNINGS = SAFETY_WARNINGS;
