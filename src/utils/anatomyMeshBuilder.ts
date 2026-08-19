import * as THREE from 'three';
import { MuscleGroup } from '../types';

// ==========================================
// 1. PROCEDURAL TEXTURES & MEDICAL SHADERS
// ==========================================

let cachedGrayscaleMuscleTexture: THREE.CanvasTexture | null = null;
let cachedRedHighlightTexture: THREE.CanvasTexture | null = null;
let cachedBoneTexture: THREE.CanvasTexture | null = null;

export function getWeightTrainingGuideGrayscaleTexture(): THREE.CanvasTexture {
  if (cachedGrayscaleMuscleTexture) return cachedGrayscaleMuscleTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#e2e8f0');
    grad.addColorStop(0.5, '#cbd5e1');
    grad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    for (let y = 0; y < 512; y += 2) {
      const alpha = 0.12 + Math.random() * 0.28;
      const shade = 140 + Math.sin(y * 0.08) * 45 + Math.random() * 40;
      ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade + 5}, ${alpha})`;
      ctx.fillRect(0, y, 512, 1.2 + Math.random() * 0.8);
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 35; i++) {
      const y = Math.random() * 512;
      ctx.fillRect(0, y, 512, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 6);
  cachedGrayscaleMuscleTexture = texture;
  return texture;
}

export function getWeightTrainingGuideRedHighlightTexture(): THREE.CanvasTexture {
  if (cachedRedHighlightTexture) return cachedRedHighlightTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#f97316'); // Coral orange apex
    grad.addColorStop(0.4, '#ea580c'); // Deep orange
    grad.addColorStop(1, '#dc2626'); // Rich crimson red
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    for (let y = 0; y < 512; y += 2) {
      const alpha = 0.15 + Math.random() * 0.3;
      const lightness = 45 + Math.sin(y * 0.1) * 15 + Math.random() * 20;
      ctx.fillStyle = `hsla(15, 90%, ${lightness}%, ${alpha})`;
      ctx.fillRect(0, y, 512, 1.5);
    }

    ctx.fillStyle = 'rgba(255, 240, 230, 0.35)';
    for (let i = 0; i < 30; i++) {
      const y = Math.random() * 512;
      ctx.fillRect(0, y, 512, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 6);
  cachedRedHighlightTexture = texture;
  return texture;
}

export function getBoneTexture(): THREE.CanvasTexture {
  if (cachedBoneTexture) return cachedBoneTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#e8e3d5';
    ctx.fillRect(0, 0, 256, 256);

    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const radius = 0.5 + Math.random() * 0.8;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(180, 170, 150, 0.15)' : 'rgba(255, 255, 250, 0.2)';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  cachedBoneTexture = texture;
  return texture;
}

// Materials
export function createWeightTrainingGuideGrayscaleMaterial(): THREE.MeshStandardMaterial {
  const texture = getWeightTrainingGuideGrayscaleTexture();
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color('#d4d4d8'),
    roughness: 0.55,
    metalness: 0.05,
    bumpMap: texture,
    bumpScale: 0.04,
    side: THREE.DoubleSide,
  });
}

export function createWeightTrainingGuideRedHighlightMaterial(intensity: 'primary' | 'secondary' = 'primary'): THREE.MeshStandardMaterial {
  const texture = getWeightTrainingGuideRedHighlightTexture();
  const baseColor = intensity === 'primary' ? '#ea580c' : '#f97316';
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(baseColor),
    roughness: 0.35,
    metalness: 0.1,
    bumpMap: texture,
    bumpScale: 0.045,
    emissive: new THREE.Color(intensity === 'primary' ? '#c2410c' : '#ea580c'),
    emissiveIntensity: intensity === 'primary' ? 0.45 : 0.3,
    side: THREE.DoubleSide,
  });
}

export function createTendonMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xf1f5f9),
    roughness: 0.3,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
}

export function createCompressionShortsMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x18181b),
    roughness: 0.8,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });
}

export function createSkinHeadMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xd4d4d8),
    roughness: 0.6,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
}

export function createBoneMaterial(transparent: boolean = false, opacity: number = 1.0): THREE.MeshStandardMaterial {
  const texture = getBoneTexture();
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xe6e0d2),
    roughness: 0.5,
    metalness: 0.05,
    bumpMap: texture,
    bumpScale: 0.02,
    transparent,
    opacity,
    side: THREE.DoubleSide,
  });
}

export function createMuscleMaterial(colorHex: string = '#9e2a2b', isDeep: boolean = false): THREE.MeshStandardMaterial {
  const texture = getWeightTrainingGuideGrayscaleTexture();
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    roughness: 0.45,
    metalness: 0.1,
    bumpMap: texture,
    bumpScale: 0.035,
    transparent: true,
    opacity: isDeep ? 0.95 : 1.0,
    side: THREE.DoubleSide,
  });
}

// ==========================================
// 2. EQUIPMENT BUILDERS (Plates, Barbells, Dumbbells)
// ==========================================

export function createOlympicWeightPlate(): THREE.Group {
  const plateGroup = new THREE.Group();
  plateGroup.name = 'OlympicWeightPlate';

  const ironMat = new THREE.MeshStandardMaterial({
    color: 0x1e2229,
    roughness: 0.7,
    metalness: 0.6,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x111318,
    roughness: 0.5,
    metalness: 0.7,
  });

  const outerRimGeo = new THREE.TorusGeometry(0.24, 0.022, 16, 48);
  const outerRim = new THREE.Mesh(outerRimGeo, rimMat);
  plateGroup.add(outerRim);

  const diskGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.025, 48);
  diskGeo.rotateX(Math.PI / 2);
  const disk = new THREE.Mesh(diskGeo, ironMat);
  plateGroup.add(disk);

  const hubRimGeo = new THREE.TorusGeometry(0.08, 0.015, 16, 32);
  const hubRim = new THREE.Mesh(hubRimGeo, rimMat);
  plateGroup.add(hubRim);

  const holeGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.03, 24);
  holeGeo.rotateX(Math.PI / 2);
  const centerHole = new THREE.Mesh(holeGeo, new THREE.MeshBasicMaterial({ color: 0x050608 }));
  plateGroup.add(centerHole);

  [-1, 1].forEach((side) => {
    const gripHoleGeo = new THREE.TorusGeometry(0.045, 0.008, 12, 24);
    gripHoleGeo.scale(1.8, 0.8, 1);
    const gripHole = new THREE.Mesh(gripHoleGeo, rimMat);
    gripHole.position.set(side * 0.14, 0, 0);
    plateGroup.add(gripHole);
  });

  return plateGroup;
}

export function createOlympicBarbell(): THREE.Group {
  const barbell = new THREE.Group();
  barbell.name = 'OlympicBarbell';

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.2,
    metalness: 0.9,
  });
  const plateMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.6,
    metalness: 0.5,
  });

  // Shaft (2.2m scale ~ 1.3 units)
  const shaftGeo = new THREE.CylinderGeometry(0.014, 0.014, 1.4, 16);
  shaftGeo.rotateZ(Math.PI / 2);
  const shaft = new THREE.Mesh(shaftGeo, chromeMat);
  barbell.add(shaft);

  // Weight plates on both ends
  [-1, 1].forEach((side) => {
    const plate1Geo = new THREE.CylinderGeometry(0.18, 0.18, 0.04, 32);
    plate1Geo.rotateZ(Math.PI / 2);
    const p1 = new THREE.Mesh(plate1Geo, plateMat);
    p1.position.set(side * 0.58, 0, 0);

    const plate2Geo = new THREE.CylinderGeometry(0.16, 0.16, 0.035, 32);
    plate2Geo.rotateZ(Math.PI / 2);
    const p2 = new THREE.Mesh(plate2Geo, plateMat);
    p2.position.set(side * 0.63, 0, 0);

    barbell.add(p1, p2);
  });

  return barbell;
}

export function createDumbbellPair(): { left: THREE.Group; right: THREE.Group } {
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 0.9 });
  const bellMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6, metalness: 0.5 });

  const buildOne = () => {
    const db = new THREE.Group();
    const handleGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.16, 12);
    const handle = new THREE.Mesh(handleGeo, chromeMat);
    db.add(handle);

    [-1, 1].forEach((side) => {
      const headGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.05, 16);
      const head = new THREE.Mesh(headGeo, bellMat);
      head.position.set(0, side * 0.09, 0);
      db.add(head);
    });
    return db;
  };

  return { left: buildOne(), right: buildOne() };
}

// ==========================================
// 3. PROCEDURAL SKELETON BUILDER
// ==========================================

export function buildRealisticSkeleton(isSemiTransparent: boolean = false): THREE.Group {
  const skeleton = new THREE.Group();
  skeleton.name = 'RealisticHumanSkeleton';

  const boneMat = createBoneMaterial(isSemiTransparent, isSemiTransparent ? 0.38 : 1.0);

  // Skull
  const skullGroup = new THREE.Group();
  skullGroup.position.set(0, 1.58, 0);

  const craniumGeo = new THREE.SphereGeometry(0.115, 24, 20);
  craniumGeo.scale(0.9, 1.15, 1.05);
  const cranium = new THREE.Mesh(craniumGeo, boneMat);
  skullGroup.add(cranium);

  const faceGeo = new THREE.BoxGeometry(0.12, 0.1, 0.09);
  faceGeo.translate(0, -0.06, 0.06);
  const face = new THREE.Mesh(faceGeo, boneMat);
  skullGroup.add(face);

  const jawGeo = new THREE.TorusGeometry(0.06, 0.018, 12, 20, Math.PI);
  jawGeo.rotateX(Math.PI / 2);
  jawGeo.rotateY(Math.PI);
  const jaw = new THREE.Mesh(jawGeo, boneMat);
  jaw.position.set(0, -0.11, 0.04);
  skullGroup.add(jaw);
  skeleton.add(skullGroup);

  // Spine
  const spineGroup = new THREE.Group();
  for (let i = 0; i < 24; i++) {
    const t = i / 23;
    const y = 1.45 - t * 0.65;
    let z = 0;
    if (t < 0.25) z = -0.02 - Math.sin((t / 0.25) * Math.PI) * 0.02;
    else if (t < 0.7) z = -0.04 - Math.sin(((t - 0.25) / 0.45) * Math.PI) * 0.045;
    else z = -0.085 + Math.sin(((t - 0.7) / 0.3) * Math.PI) * 0.035;

    const scale = 0.02 + t * 0.015;
    const vGeo = new THREE.CylinderGeometry(scale * 1.3, scale * 1.4, 0.022, 12);
    vGeo.rotateX(Math.PI / 2);
    const vMesh = new THREE.Mesh(vGeo, boneMat);
    vMesh.position.set(0, y, z);
    spineGroup.add(vMesh);
  }
  skeleton.add(spineGroup);

  // Sternum & Ribs
  const ribcageGroup = new THREE.Group();
  const sternumGeo = new THREE.BoxGeometry(0.042, 0.17, 0.018);
  const sternum = new THREE.Mesh(sternumGeo, boneMat);
  sternum.position.set(0, 1.16, 0.125);
  ribcageGroup.add(sternum);

  for (let r = 0; r < 12; r++) {
    const y = 1.3 - r * 0.025;
    const radiusX = 0.11 + Math.sin((r / 11) * Math.PI) * 0.075;
    const radiusZ = 0.08 + Math.sin((r / 11) * Math.PI) * 0.055;
    [-1, 1].forEach((side) => {
      const ribCurve = new THREE.EllipseCurve(0, 0, radiusX, radiusZ, 0, Math.PI, false, 0);
      const points = ribCurve.getPoints(24);
      const ribGeo = new THREE.BufferGeometry().setFromPoints(
        points.map((p) => new THREE.Vector3(p.x * side, (p.y - radiusZ) * 0.15, p.y))
      );
      const ribMesh = new THREE.Line(ribGeo, new THREE.LineBasicMaterial({ color: 0xd4cabb, linewidth: 2 }));
      ribMesh.position.set(0, y, -0.04);
      ribMesh.rotateX(0.2);
      ribcageGroup.add(ribMesh);
    });
  }
  skeleton.add(ribcageGroup);

  // Clavicles & Scapulae
  [-1, 1].forEach((side) => {
    const clavicleGeo = new THREE.CylinderGeometry(0.012, 0.01, 0.17, 10);
    clavicleGeo.rotateZ(side * 1.38);
    const clavicle = new THREE.Mesh(clavicleGeo, boneMat);
    clavicle.position.set(side * 0.11, 1.33, 0.08);
    skeleton.add(clavicle);

    const scapulaGeo = new THREE.BoxGeometry(0.085, 0.12, 0.015);
    scapulaGeo.rotateZ(side * -0.2);
    const scapula = new THREE.Mesh(scapulaGeo, boneMat);
    scapula.position.set(side * 0.14, 1.2, -0.1);
    skeleton.add(scapula);
  });

  // Pelvis
  const pelvisGroup = new THREE.Group();
  pelvisGroup.position.set(0, 0.74, -0.02);
  [-1, 1].forEach((side) => {
    const iliumGeo = new THREE.TorusGeometry(0.085, 0.02, 10, 20, Math.PI * 0.85);
    iliumGeo.rotateZ(side * 0.4);
    iliumGeo.rotateY(side * 0.3);
    const ilium = new THREE.Mesh(iliumGeo, boneMat);
    ilium.position.set(side * 0.08, 0.06, 0);
    pelvisGroup.add(ilium);
  });
  skeleton.add(pelvisGroup);

  // Legs
  [-1, 1].forEach((side) => {
    const femurGeo = new THREE.CylinderGeometry(0.028, 0.022, 0.44, 12);
    const femur = new THREE.Mesh(femurGeo, boneMat);
    femur.position.set(side * 0.12, 0.48, 0.02);
    skeleton.add(femur);

    const patellaGeo = new THREE.SphereGeometry(0.02, 10, 10);
    const patella = new THREE.Mesh(patellaGeo, boneMat);
    patella.position.set(side * 0.125, 0.23, 0.048);
    skeleton.add(patella);

    const tibiaGeo = new THREE.CylinderGeometry(0.022, 0.016, 0.4, 12);
    const tibia = new THREE.Mesh(tibiaGeo, boneMat);
    tibia.position.set(side * 0.12, -0.06, 0.01);
    skeleton.add(tibia);
  });

  return skeleton;
}

// ==========================================
// 4. FULL ANATOMICAL MUSCULATURE & KINEMATICS REGISTRY
// ==========================================

export type ExerciseMovementType =
  | 'front_raise'
  | 'lateral_raise'
  | 'overhead_press'
  | 'bench_press'
  | 'bicep_curl'
  | 'tricep_extension'
  | 'squat'
  | 'deadlift'
  | 'pull_up'
  | 'punch'
  | 'kick'
  | 'core_crunch'
  | 'general';

export type EquipmentType = 'plate' | 'barbell' | 'dumbbells' | 'bodyweight' | 'none';

export interface MuscleMeshRegistry {
  meshMap: Map<MuscleGroup, THREE.Mesh[]>;
  allMusclesGroup: THREE.Group;
  deepMusclesGroup: THREE.Group;
  superficialMusclesGroup: THREE.Group;
  torsoGroup: THREE.Group;
  leftArmShoulderJoint: THREE.Group;
  rightArmShoulderJoint: THREE.Group;
  leftElbowJoint: THREE.Group;
  rightElbowJoint: THREE.Group;
  leftHipJoint: THREE.Group;
  rightHipJoint: THREE.Group;
  leftKneeJoint: THREE.Group;
  rightKneeJoint: THREE.Group;
  equipmentGroup: THREE.Group;
  plateMesh: THREE.Group;
  barbellMesh: THREE.Group;
  leftDumbbellMesh: THREE.Group;
  rightDumbbellMesh: THREE.Group;
  trunksMesh: THREE.Mesh;
  headGroup: THREE.Group;
  setEquipment: (eq: EquipmentType) => void;
  setMovementKinematics: (movementType: ExerciseMovementType, progress: number) => void;
}

export const MUSCLE_3D_ANCHORS: Record<MuscleGroup, { x: number; y: number; z: number; label: string }> = {
  anterior_deltoid: { x: 0.28, y: 1.25, z: 0.12, label: 'Anterior deltoid' },
  upper_chest: { x: 0.12, y: 1.25, z: 0.16, label: 'Upper pectoralis major' },
  lateral_deltoid: { x: 0.33, y: 1.24, z: 0.01, label: 'Lateral deltoid' },
  serratus_anterior: { x: 0.22, y: 1.08, z: 0.1, label: 'Serratus anterior' },
  chest: { x: 0.14, y: 1.15, z: 0.15, label: 'Pectoralis major' },
  posterior_deltoid: { x: 0.28, y: 1.24, z: -0.11, label: 'Posterior deltoid' },
  biceps: { x: 0.35, y: 1.05, z: 0.05, label: 'Biceps brachii' },
  brachialis: { x: 0.36, y: 0.98, z: 0.02, label: 'Brachialis' },
  triceps: { x: 0.35, y: 1.06, z: -0.06, label: 'Triceps brachii' },
  forearms: { x: 0.4, y: 0.82, z: 0.02, label: 'Forearms / Brachioradialis' },
  abs: { x: 0.0, y: 1.0, z: 0.16, label: 'Rectus abdominis' },
  obliques: { x: 0.16, y: 0.94, z: 0.09, label: 'External obliques' },
  transverse_abdominis: { x: 0.0, y: 0.94, z: 0.04, label: 'Transverse abdominis' },
  hip_flexors: { x: 0.08, y: 0.8, z: 0.03, label: 'Hip flexors' },
  psoas_major: { x: 0.06, y: 0.8, z: 0.02, label: 'Psoas major' },
  traps: { x: 0.14, y: 1.38, z: -0.05, label: 'Trapezius' },
  upper_back: { x: 0.12, y: 1.22, z: -0.12, label: 'Rhomboids & Mid-traps' },
  rhomboids: { x: 0.1, y: 1.17, z: -0.1, label: 'Rhomboids' },
  lats: { x: 0.19, y: 0.98, z: -0.12, label: 'Latissimus dorsi' },
  erector_spinae: { x: 0.06, y: 0.98, z: -0.11, label: 'Erector spinae' },
  rotator_cuff: { x: 0.18, y: 1.25, z: -0.1, label: 'Rotator cuff (SITS)' },
  glutes: { x: 0.13, y: 0.7, z: -0.12, label: 'Gluteus maximus' },
  gluteus_medius: { x: 0.17, y: 0.77, z: -0.04, label: 'Gluteus medius' },
  quadriceps: { x: 0.13, y: 0.45, z: 0.09, label: 'Quadriceps femoris' },
  rectus_femoris: { x: 0.12, y: 0.46, z: 0.1, label: 'Rectus femoris' },
  vastus_medialis: { x: 0.08, y: 0.33, z: 0.08, label: 'Vastus medialis' },
  vastus_lateralis: { x: 0.18, y: 0.44, z: 0.05, label: 'Vastus lateralis' },
  hamstrings: { x: 0.13, y: 0.44, z: -0.08, label: 'Hamstrings' },
  calves: { x: 0.12, y: -0.02, z: -0.06, label: 'Gastrocnemius' },
  soleus: { x: 0.11, y: -0.07, z: -0.04, label: 'Soleus' },
  tibialis: { x: 0.12, y: -0.06, z: 0.07, label: 'Tibialis anterior' },
};

/**
 * Detects appropriate exercise kinematic pattern from exercise id, category and target muscles
 */
export function detectExerciseKinematics(exerciseId: string, targetMuscles: MuscleGroup[] = []): {
  movementType: ExerciseMovementType;
  equipment: EquipmentType;
} {
  const id = exerciseId.toLowerCase();

  // 1. Plate Front Raise
  if (id.includes('plate') || id.includes('front_raise')) {
    return { movementType: 'front_raise', equipment: 'plate' };
  }

  // 2. Lateral Raise
  if (id.includes('lateral_raise') || id.includes('side_raise')) {
    return { movementType: 'lateral_raise', equipment: 'dumbbells' };
  }

  // 3. Overhead Press / Shoulder Press
  if (id.includes('overhead') || id.includes('shoulder_press') || id.includes('military')) {
    return { movementType: 'overhead_press', equipment: 'barbell' };
  }

  // 4. Bench Press / Incline / Push-up
  if (id.includes('bench') || id.includes('push_up') || id.includes('chest_press')) {
    return { movementType: 'bench_press', equipment: id.includes('dumbbell') ? 'dumbbells' : 'barbell' };
  }

  // 5. Bicep Curl
  if (id.includes('bicep') || id.includes('curl')) {
    return { movementType: 'bicep_curl', equipment: id.includes('barbell') ? 'barbell' : 'dumbbells' };
  }

  // 6. Tricep Extension / Dips / Pushdown
  if (id.includes('tricep') || id.includes('skull_crusher') || id.includes('pushdown')) {
    return { movementType: 'tricep_extension', equipment: 'dumbbells' };
  }

  // 7. Squat / Leg Press / Lunge
  if (id.includes('squat') || id.includes('lunge') || id.includes('leg_press')) {
    return { movementType: 'squat', equipment: 'barbell' };
  }

  // 8. Deadlift / RDL
  if (id.includes('deadlift') || id.includes('rdl') || id.includes('hinge')) {
    return { movementType: 'deadlift', equipment: 'barbell' };
  }

  // 9. Pull-ups / Lat Pulldown / Rows
  if (id.includes('pull_up') || id.includes('chin_up') || id.includes('lat_pulldown') || id.includes('row')) {
    return { movementType: 'pull_up', equipment: 'bodyweight' };
  }

  // 10. Martial Arts Strikes
  if (id.includes('punch') || id.includes('jab') || id.includes('cross') || id.includes('hook') || id.includes('boxing')) {
    return { movementType: 'punch', equipment: 'none' };
  }

  // 11. Martial Arts Kicks
  if (id.includes('kick') || id.includes('muay_thai') || id.includes('roundhouse') || id.includes('teep')) {
    return { movementType: 'kick', equipment: 'none' };
  }

  // Fallback by Target Muscles
  if (targetMuscles.includes('quadriceps') || targetMuscles.includes('glutes')) {
    return { movementType: 'squat', equipment: 'barbell' };
  }
  if (targetMuscles.includes('chest') || targetMuscles.includes('upper_chest')) {
    return { movementType: 'bench_press', equipment: 'barbell' };
  }
  if (targetMuscles.includes('lats') || targetMuscles.includes('upper_back')) {
    return { movementType: 'pull_up', equipment: 'bodyweight' };
  }
  if (targetMuscles.includes('anterior_deltoid') || targetMuscles.includes('lateral_deltoid')) {
    return { movementType: 'overhead_press', equipment: 'dumbbells' };
  }

  return { movementType: 'general', equipment: 'none' };
}

export function buildRealisticMusculature(): MuscleMeshRegistry {
  const allMusclesGroup = new THREE.Group();
  allMusclesGroup.name = 'RealisticHumanMusculature';

  const superficialMusclesGroup = new THREE.Group();
  superficialMusclesGroup.name = 'SuperficialMuscles';

  const deepMusclesGroup = new THREE.Group();
  deepMusclesGroup.name = 'DeepMuscles';

  allMusclesGroup.add(superficialMusclesGroup, deepMusclesGroup);

  const meshMap = new Map<MuscleGroup, THREE.Mesh[]>();

  function registerMuscle(id: MuscleGroup, meshes: THREE.Mesh[], isDeep: boolean = false) {
    meshes.forEach((mesh) => {
      mesh.userData.muscleId = id;
      mesh.userData.isDeep = isDeep;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });

    if (isDeep) {
      meshes.forEach((m) => deepMusclesGroup.add(m));
    } else {
      meshes.forEach((m) => superficialMusclesGroup.add(m));
    }

    const existing = meshMap.get(id) || [];
    meshMap.set(id, [...existing, ...meshes]);
  }

  const defaultMuscleMat = createWeightTrainingGuideGrayscaleMaterial();
  const tendonMat = createTendonMaterial();
  const headSkinMat = createSkinHeadMaterial();

  // Torso / Spine Pivot Group
  const torsoGroup = new THREE.Group();
  torsoGroup.name = 'TorsoGroup';
  allMusclesGroup.add(torsoGroup);

  // Head & Neck
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.58, 0);

  const headGeo = new THREE.SphereGeometry(0.115, 24, 20);
  headGeo.scale(0.88, 1.15, 1.05);
  const headMesh = new THREE.Mesh(headGeo, headSkinMat);
  headGroup.add(headMesh);

  const jawProfileGeo = new THREE.BoxGeometry(0.11, 0.1, 0.08);
  jawProfileGeo.translate(0, -0.05, 0.06);
  const jawProfile = new THREE.Mesh(jawProfileGeo, headSkinMat);
  headGroup.add(jawProfile);

  const noseGeo = new THREE.ConeGeometry(0.015, 0.035, 4);
  noseGeo.rotateX(Math.PI / 2);
  const nose = new THREE.Mesh(noseGeo, headSkinMat);
  nose.position.set(0, -0.02, 0.12);
  headGroup.add(nose);

  const neckGeo = new THREE.CylinderGeometry(0.06, 0.072, 0.14, 16);
  const neck = new THREE.Mesh(neckGeo, headSkinMat);
  neck.position.set(0, -0.12, 0);
  headGroup.add(neck);

  torsoGroup.add(headGroup);

  // Chest: Pectoralis Major
  [-1, 1].forEach((side) => {
    const chestGeo = new THREE.CylinderGeometry(0.095, 0.05, 0.14, 20, 4, false, 0, Math.PI);
    chestGeo.scale(1.25, 1, 0.65);
    chestGeo.rotateZ(side * -0.42);
    chestGeo.rotateY(side * 0.35);
    const chestMesh = new THREE.Mesh(chestGeo, defaultMuscleMat.clone());
    chestMesh.position.set(side * 0.13, 1.15, 0.145);
    registerMuscle('chest', [chestMesh]);
    torsoGroup.add(chestMesh);

    const upChestGeo = new THREE.BoxGeometry(0.12, 0.065, 0.065);
    upChestGeo.rotateZ(side * -0.28);
    upChestGeo.rotateY(side * 0.2);
    const upChestMesh = new THREE.Mesh(upChestGeo, defaultMuscleMat.clone());
    upChestMesh.position.set(side * 0.11, 1.25, 0.155);
    registerMuscle('upper_chest', [upChestMesh]);
    torsoGroup.add(upChestMesh);
  });

  // Serratus Anterior
  [-1, 1].forEach((side) => {
    const slips: THREE.Mesh[] = [];
    for (let s = 0; s < 5; s++) {
      const slipGeo = new THREE.CylinderGeometry(0.012, 0.015, 0.075, 8);
      slipGeo.rotateZ(side * 1.1);
      slipGeo.rotateY(side * 0.35);
      const slip = new THREE.Mesh(slipGeo, defaultMuscleMat.clone());
      slip.position.set(side * (0.19 + s * 0.012), 1.14 - s * 0.032, 0.1 - s * 0.008);
      slips.push(slip);
      torsoGroup.add(slip);
    }
    registerMuscle('serratus_anterior', slips);
  });

  // Back: Traps, Lats, Erector Spinae
  [-1, 1].forEach((side) => {
    const upTrapGeo = new THREE.CylinderGeometry(0.045, 0.07, 0.14, 12);
    upTrapGeo.scale(0.8, 1, 1.2);
    upTrapGeo.rotateZ(side * 0.45);
    const upTrap = new THREE.Mesh(upTrapGeo, defaultMuscleMat.clone());
    upTrap.position.set(side * 0.13, 1.38, -0.06);
    registerMuscle('traps', [upTrap]);
    torsoGroup.add(upTrap);

    const midTrapGeo = new THREE.BoxGeometry(0.13, 0.12, 0.025);
    midTrapGeo.rotateZ(side * -0.15);
    const midTrap = new THREE.Mesh(midTrapGeo, defaultMuscleMat.clone());
    midTrap.position.set(side * 0.1, 1.21, -0.115);
    registerMuscle('upper_back', [midTrap]);
    torsoGroup.add(midTrap);

    const rhombGeo = new THREE.BoxGeometry(0.09, 0.09, 0.02);
    rhombGeo.rotateZ(side * -0.5);
    const rhomb = new THREE.Mesh(rhombGeo, defaultMuscleMat.clone());
    rhomb.position.set(side * 0.1, 1.17, -0.095);
    registerMuscle('rhomboids', [rhomb], true);
    torsoGroup.add(rhomb);

    const latGeo = new THREE.CylinderGeometry(0.12, 0.06, 0.28, 16, 4, false, 0, Math.PI);
    latGeo.scale(1.1, 1, 0.55);
    latGeo.rotateZ(side * -0.32);
    latGeo.rotateY(side * -0.4);
    const latMesh = new THREE.Mesh(latGeo, defaultMuscleMat.clone());
    latMesh.position.set(side * 0.18, 0.98, -0.115);
    registerMuscle('lats', [latMesh]);
    torsoGroup.add(latMesh);

    const erectorGeo = new THREE.CylinderGeometry(0.026, 0.032, 0.38, 12);
    const erector = new THREE.Mesh(erectorGeo, defaultMuscleMat.clone());
    erector.position.set(side * 0.055, 0.98, -0.11);
    registerMuscle('erector_spinae', [erector], true);
    torsoGroup.add(erector);
  });

  // Abs & Obliques
  const absGroup: THREE.Mesh[] = [];
  const lineaAlbaGeo = new THREE.BoxGeometry(0.01, 0.32, 0.02);
  const lineaAlba = new THREE.Mesh(lineaAlbaGeo, tendonMat);
  lineaAlba.position.set(0, 0.98, 0.162);
  absGroup.push(lineaAlba);
  torsoGroup.add(lineaAlba);

  for (let tier = 0; tier < 3; tier++) {
    const yPos = 1.08 - tier * 0.09;
    [-1, 1].forEach((side) => {
      const segGeo = new THREE.BoxGeometry(0.052, 0.068, 0.032);
      const segMesh = new THREE.Mesh(segGeo, defaultMuscleMat.clone());
      segMesh.position.set(side * 0.038, yPos, 0.155);
      absGroup.push(segMesh);
      torsoGroup.add(segMesh);
    });
  }
  registerMuscle('abs', absGroup);

  [-1, 1].forEach((side) => {
    const obGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.22, 12, 3, false, 0, Math.PI);
    obGeo.scale(0.8, 1, 0.9);
    obGeo.rotateZ(side * -0.15);
    obGeo.rotateY(side * 0.8);
    const obMesh = new THREE.Mesh(obGeo, defaultMuscleMat.clone());
    obMesh.position.set(side * 0.15, 0.93, 0.08);
    registerMuscle('obliques', [obMesh]);
    torsoGroup.add(obMesh);
  });

  // Athletic Compression Shorts
  const trunksMat = createCompressionShortsMaterial();
  const trunksGeo = new THREE.CylinderGeometry(0.18, 0.17, 0.26, 24);
  trunksGeo.scale(1, 1, 0.85);
  const trunksMesh = new THREE.Mesh(trunksGeo, trunksMat);
  trunksMesh.position.set(0, 0.69, 0.01);
  allMusclesGroup.add(trunksMesh);

  // ==========================================
  // ARTICULATED LOWER BODY (Hips & Knees)
  // ==========================================
  const leftHipJoint = new THREE.Group();
  leftHipJoint.name = 'LeftHipJoint';
  leftHipJoint.position.set(0.125, 0.68, 0.01);

  const rightHipJoint = new THREE.Group();
  rightHipJoint.name = 'RightHipJoint';
  rightHipJoint.position.set(-0.125, 0.68, 0.01);

  const leftKneeJoint = new THREE.Group();
  leftKneeJoint.name = 'LeftKneeJoint';
  leftKneeJoint.position.set(0, -0.46, 0);
  leftHipJoint.add(leftKneeJoint);

  const rightKneeJoint = new THREE.Group();
  rightKneeJoint.name = 'RightKneeJoint';
  rightKneeJoint.position.set(0, -0.46, 0);
  rightHipJoint.add(rightKneeJoint);

  allMusclesGroup.add(leftHipJoint, rightHipJoint);

  // Build Thigh & Lower Leg Meshes inside joints
  [-1, 1].forEach((side) => {
    const hip = side === 1 ? leftArmShoulderJointSafe(leftHipJoint) : rightHipJoint;
    const knee = side === 1 ? leftKneeJoint : rightKneeJoint;

    // Gluteus Maximus & Medius
    const gMaxGeo = new THREE.SphereGeometry(0.098, 16, 14);
    gMaxGeo.scale(0.95, 1.1, 1.25);
    gMaxGeo.rotateZ(side * 0.15);
    gMaxGeo.rotateY(side * -0.4);
    const gMax = new THREE.Mesh(gMaxGeo, defaultMuscleMat.clone());
    gMax.position.set(side * 0.01, 0.01, -0.12);
    registerMuscle('glutes', [gMax]);
    allMusclesGroup.add(gMax); // Root anchored glute

    // Quadriceps
    const rfGeo = new THREE.CylinderGeometry(0.042, 0.032, 0.28, 14);
    rfGeo.scale(1.1, 1, 0.8);
    const rf = new THREE.Mesh(rfGeo, defaultMuscleMat.clone());
    rf.position.set(0, -0.22, 0.08);

    const vmoGeo = new THREE.SphereGeometry(0.045, 14, 12);
    vmoGeo.scale(0.85, 1.4, 0.9);
    vmoGeo.rotateZ(side * -0.22);
    const vmo = new THREE.Mesh(vmoGeo, defaultMuscleMat.clone());
    vmo.position.set(side * -0.04, -0.34, 0.07);

    const vLatGeo = new THREE.CylinderGeometry(0.055, 0.042, 0.32, 14);
    vLatGeo.scale(1.2, 1, 0.9);
    vLatGeo.rotateZ(side * 0.12);
    const vLat = new THREE.Mesh(vLatGeo, defaultMuscleMat.clone());
    vLat.position.set(side * 0.05, -0.23, 0.03);

    const patellarTendonGeo = new THREE.BoxGeometry(0.024, 0.07, 0.015);
    const patellarTendon = new THREE.Mesh(patellarTendonGeo, tendonMat);
    patellarTendon.position.set(0, -0.44, 0.075);

    registerMuscle('quadriceps', [rf, vmo, vLat, patellarTendon]);
    registerMuscle('rectus_femoris', [rf]);
    registerMuscle('vastus_medialis', [vmo]);
    registerMuscle('vastus_lateralis', [vLat]);
    hip.add(rf, vmo, vLat, patellarTendon);

    // Hamstrings
    const hamGeo = new THREE.CylinderGeometry(0.058, 0.042, 0.32, 14);
    hamGeo.scale(1.1, 1, 0.9);
    const ham = new THREE.Mesh(hamGeo, defaultMuscleMat.clone());
    ham.position.set(0, -0.23, -0.075);
    registerMuscle('hamstrings', [ham]);
    hip.add(ham);

    // Lower Leg inside Knee joint
    const gastrocMedGeo = new THREE.SphereGeometry(0.042, 14, 12);
    gastrocMedGeo.scale(0.85, 1.8, 1);
    const gastrocMed = new THREE.Mesh(gastrocMedGeo, defaultMuscleMat.clone());
    gastrocMed.position.set(side * -0.02, -0.24, -0.06);

    const gastrocLatGeo = new THREE.SphereGeometry(0.038, 14, 12);
    gastrocLatGeo.scale(0.85, 1.6, 1);
    const gastrocLat = new THREE.Mesh(gastrocLatGeo, defaultMuscleMat.clone());
    gastrocLat.position.set(side * 0.025, -0.22, -0.055);

    const soleusGeo = new THREE.CylinderGeometry(0.038, 0.024, 0.22, 12);
    const soleus = new THREE.Mesh(soleusGeo, defaultMuscleMat.clone());
    soleus.position.set(0, -0.28, -0.035);

    const achillesGeo = new THREE.CylinderGeometry(0.012, 0.018, 0.16, 10);
    const achilles = new THREE.Mesh(achillesGeo, tendonMat);
    achilles.position.set(0, -0.38, -0.055);

    registerMuscle('calves', [gastrocMed, gastrocLat, achilles]);
    registerMuscle('soleus', [soleus], true);
    knee.add(gastrocMed, gastrocLat, soleus, achilles);

    const tibGeo = new THREE.CylinderGeometry(0.028, 0.016, 0.28, 12);
    tibGeo.rotateZ(side * 0.04);
    const tib = new THREE.Mesh(tibGeo, defaultMuscleMat.clone());
    tib.position.set(0, -0.27, 0.065);
    registerMuscle('tibialis', [tib]);
    knee.add(tib);
  });

  // ==========================================
  // ARTICULATED UPPER BODY (Shoulders & Elbows)
  // ==========================================
  const leftArmShoulderJoint = new THREE.Group();
  leftArmShoulderJoint.name = 'LeftShoulderJoint';
  leftArmShoulderJoint.position.set(0.28, 1.25, 0.02);

  const rightArmShoulderJoint = new THREE.Group();
  rightArmShoulderJoint.name = 'RightShoulderJoint';
  rightArmShoulderJoint.position.set(-0.28, 1.25, 0.02);

  const leftElbowJoint = new THREE.Group();
  leftElbowJoint.name = 'LeftElbowJoint';
  leftElbowJoint.position.set(0.08, -0.32, 0);
  leftArmShoulderJoint.add(leftElbowJoint);

  const rightElbowJoint = new THREE.Group();
  rightElbowJoint.name = 'RightElbowJoint';
  rightElbowJoint.position.set(-0.08, -0.32, 0);
  rightArmShoulderJoint.add(rightElbowJoint);

  torsoGroup.add(leftArmShoulderJoint, rightArmShoulderJoint);

  // Build Arms & Forearms
  [-1, 1].forEach((side) => {
    const shoulder = side === 1 ? leftArmShoulderJoint : rightArmShoulderJoint;
    const elbow = side === 1 ? leftElbowJoint : rightElbowJoint;

    // Deltoids
    const antDeltGeo = new THREE.SphereGeometry(0.06, 16, 14, 0, Math.PI);
    antDeltGeo.scale(0.9, 1.35, 0.9);
    antDeltGeo.rotateZ(side * -0.25);
    antDeltGeo.rotateY(side * 0.6);
    const antDeltMesh = new THREE.Mesh(antDeltGeo, defaultMuscleMat.clone());
    antDeltMesh.position.set(side * -0.01, 0, 0.08);
    registerMuscle('anterior_deltoid', [antDeltMesh]);
    shoulder.add(antDeltMesh);

    const latDeltGeo = new THREE.SphereGeometry(0.068, 16, 14, 0, Math.PI);
    latDeltGeo.scale(0.85, 1.5, 1.1);
    latDeltGeo.rotateZ(side * -0.15);
    const latDeltMesh = new THREE.Mesh(latDeltGeo, defaultMuscleMat.clone());
    latDeltMesh.position.set(side * 0.04, -0.02, -0.03);
    registerMuscle('lateral_deltoid', [latDeltMesh]);
    shoulder.add(latDeltMesh);

    const postDeltGeo = new THREE.SphereGeometry(0.058, 16, 14, 0, Math.PI);
    postDeltGeo.scale(0.9, 1.35, 0.9);
    postDeltGeo.rotateZ(side * -0.25);
    postDeltGeo.rotateY(side * -0.7);
    const postDeltMesh = new THREE.Mesh(postDeltGeo, defaultMuscleMat.clone());
    postDeltMesh.position.set(side * 0.0, -0.01, -0.12);
    registerMuscle('posterior_deltoid', [postDeltMesh]);
    shoulder.add(postDeltMesh);

    // Biceps & Triceps
    const bicepsGeo = new THREE.SphereGeometry(0.048, 16, 14);
    bicepsGeo.scale(0.85, 1.7, 0.9);
    bicepsGeo.rotateZ(side * -0.08);
    const biceps = new THREE.Mesh(bicepsGeo, defaultMuscleMat.clone());
    biceps.position.set(side * 0.02, -0.16, 0.035);
    registerMuscle('biceps', [biceps]);
    shoulder.add(biceps);

    const brachGeo = new THREE.CylinderGeometry(0.028, 0.032, 0.12, 10);
    const brach = new THREE.Mesh(brachGeo, defaultMuscleMat.clone());
    brach.position.set(side * 0.04, -0.22, 0.01);
    registerMuscle('brachialis', [brach], true);
    shoulder.add(brach);

    const tricepsGeo = new THREE.SphereGeometry(0.056, 16, 14);
    tricepsGeo.scale(0.9, 1.7, 1.1);
    tricepsGeo.rotateZ(side * -0.08);
    const triceps = new THREE.Mesh(tricepsGeo, defaultMuscleMat.clone());
    triceps.position.set(side * 0.03, -0.16, -0.06);

    const triTendonGeo = new THREE.BoxGeometry(0.04, 0.08, 0.015);
    const triTendon = new THREE.Mesh(triTendonGeo, tendonMat);
    triTendon.position.set(side * 0.035, -0.26, -0.058);

    registerMuscle('triceps', [triceps, triTendon]);
    shoulder.add(triceps, triTendon);

    // Forearm & Hand inside Elbow Joint
    const forearmGeo = new THREE.CylinderGeometry(0.042, 0.026, 0.24, 14);
    forearmGeo.scale(1.15, 1, 0.85);
    const forearm = new THREE.Mesh(forearmGeo, defaultMuscleMat.clone());
    forearm.position.set(0, -0.14, 0.0);
    registerMuscle('forearms', [forearm]);
    elbow.add(forearm);

    const handGeo = new THREE.BoxGeometry(0.045, 0.06, 0.03);
    const hand = new THREE.Mesh(handGeo, headSkinMat);
    hand.position.set(0, -0.28, 0.01);
    elbow.add(hand);
  });

  // ==========================================
  // EQUIPMENT REGISTRY (Dynamic Swappable 3D Models)
  // ==========================================
  const equipmentGroup = new THREE.Group();
  equipmentGroup.name = 'WorkoutEquipmentGroup';
  allMusclesGroup.add(equipmentGroup);

  const plateMesh = createOlympicWeightPlate();
  const barbellMesh = createOlympicBarbell();
  const { left: leftDumbbellMesh, right: rightDumbbellMesh } = createDumbbellPair();

  equipmentGroup.add(plateMesh, barbellMesh, leftDumbbellMesh, rightDumbbellMesh);

  // Attach dumbbells to hands
  leftElbowJoint.add(leftDumbbellMesh);
  leftDumbbellMesh.position.set(0, -0.28, 0.01);
  rightElbowJoint.add(rightDumbbellMesh);
  rightDumbbellMesh.position.set(0, -0.28, 0.01);

  const setEquipment = (eq: EquipmentType) => {
    plateMesh.visible = eq === 'plate';
    barbellMesh.visible = eq === 'barbell';
    leftDumbbellMesh.visible = eq === 'dumbbells';
    rightDumbbellMesh.visible = eq === 'dumbbells';
  };
  setEquipment('plate'); // Default plate

  /**
   * Universal Kinematics Engine: smoothly articulates limbs and equipment for any exercise
   */
  const setMovementKinematics = (movementType: ExerciseMovementType, progress: number) => {
    // Reset all joint transforms to zero base
    leftArmShoulderJoint.rotation.set(0, 0, 0);
    rightArmShoulderJoint.rotation.set(0, 0, 0);
    leftElbowJoint.rotation.set(0, 0, 0);
    rightElbowJoint.rotation.set(0, 0, 0);
    leftHipJoint.rotation.set(0, 0, 0);
    rightHipJoint.rotation.set(0, 0, 0);
    leftKneeJoint.rotation.set(0, 0, 0);
    rightKneeJoint.rotation.set(0, 0, 0);
    torsoGroup.position.set(0, 0, 0);
    torsoGroup.rotation.set(0, 0, 0);

    switch (movementType) {
      case 'front_raise': {
        // Shoulder sagittal flexion 0° -> 90°
        const angle = progress * 1.57;
        leftArmShoulderJoint.rotation.x = angle;
        rightArmShoulderJoint.rotation.x = angle;
        plateMesh.position.set(0, 0.72 + progress * 0.53, 0.22 + progress * 0.36);
        plateMesh.rotation.x = progress * 0.2;
        break;
      }
      case 'lateral_raise': {
        // Shoulder abduction 0° -> 90°
        const angle = progress * 1.5;
        leftArmShoulderJoint.rotation.z = angle;
        rightArmShoulderJoint.rotation.z = -angle;
        break;
      }
      case 'overhead_press': {
        // Press from collar to overhead lockout
        const shoulderAngle = 1.2 + progress * 0.37;
        const elbowAngle = (1 - progress) * 1.8;
        leftArmShoulderJoint.rotation.set(0.2, 0, 0.4);
        rightArmShoulderJoint.rotation.set(0.2, 0, -0.4);
        leftArmShoulderJoint.rotation.x = shoulderAngle;
        rightArmShoulderJoint.rotation.x = shoulderAngle;
        leftElbowJoint.rotation.x = elbowAngle;
        rightElbowJoint.rotation.x = elbowAngle;

        barbellMesh.position.set(0, 1.35 + progress * 0.48, 0.15 + (1 - progress) * 0.05);
        break;
      }
      case 'bench_press': {
        // Pressing motion
        leftArmShoulderJoint.rotation.set(1.5, 0, 0.2);
        rightArmShoulderJoint.rotation.set(1.5, 0, -0.2);
        const elbowAngle = (1 - progress) * 1.6;
        leftElbowJoint.rotation.x = elbowAngle;
        rightElbowJoint.rotation.x = elbowAngle;

        barbellMesh.position.set(0, 1.22, 0.18 + progress * 0.28);
        break;
      }
      case 'bicep_curl': {
        // Elbow flexion 0° -> 135°
        const elbowFlex = progress * 2.3;
        leftElbowJoint.rotation.x = -elbowFlex;
        rightElbowJoint.rotation.x = -elbowFlex;
        break;
      }
      case 'tricep_extension': {
        // Elbow extension
        leftArmShoulderJoint.rotation.x = 2.8;
        rightArmShoulderJoint.rotation.x = 2.8;
        const elbowFlex = (1 - progress) * 2.0;
        leftElbowJoint.rotation.x = elbowFlex;
        rightElbowJoint.rotation.x = elbowFlex;
        break;
      }
      case 'squat': {
        // Hip & Knee flexion
        const squatDepth = progress * 0.35;
        const hipAngle = progress * 1.4;
        const kneeAngle = progress * 1.5;

        torsoGroup.position.y = -squatDepth;
        torsoGroup.rotation.x = progress * 0.35; // Forward torso incline

        leftHipJoint.position.y = 0.68 - squatDepth;
        rightHipJoint.position.y = 0.68 - squatDepth;

        leftHipJoint.rotation.x = -hipAngle;
        rightHipJoint.rotation.x = -hipAngle;

        leftKneeJoint.rotation.x = kneeAngle;
        rightKneeJoint.rotation.x = kneeAngle;

        // Barbell on upper traps
        barbellMesh.position.set(0, 1.42 - squatDepth, -0.06 - progress * 0.08);
        break;
      }
      case 'deadlift': {
        // Hip hinge
        const hingeDepth = (1 - progress) * 0.3;
        torsoGroup.position.y = -hingeDepth;
        torsoGroup.rotation.x = (1 - progress) * 0.85;

        leftHipJoint.rotation.x = -(1 - progress) * 0.9;
        rightHipJoint.rotation.x = -(1 - progress) * 0.9;
        leftKneeJoint.rotation.x = (1 - progress) * 0.7;
        rightKneeJoint.rotation.x = (1 - progress) * 0.7;

        barbellMesh.position.set(0, 0.45 + progress * 0.4, 0.25);
        break;
      }
      case 'pull_up': {
        // Pulling down
        const pullProgress = progress;
        leftArmShoulderJoint.rotation.set(2.8 - pullProgress * 0.9, 0, 0.3);
        rightArmShoulderJoint.rotation.set(2.8 - pullProgress * 0.9, 0, -0.3);
        leftElbowJoint.rotation.x = pullProgress * 2.2;
        rightElbowJoint.rotation.x = pullProgress * 2.2;
        torsoGroup.position.y = pullProgress * 0.25;
        break;
      }
      case 'punch': {
        // Boxing jab/cross extension
        torsoGroup.rotation.y = progress * 0.55;
        leftArmShoulderJoint.rotation.set(1.4, 0, 0.1);
        leftElbowJoint.rotation.x = (1 - progress) * 1.5; // Snap jab

        rightArmShoulderJoint.rotation.set(0.6, 0, -0.3); // Guard hand
        rightElbowJoint.rotation.x = 1.8;
        break;
      }
      case 'kick': {
        // Muay Thai roundhouse kick
        torsoGroup.rotation.y = progress * 0.6;
        rightHipJoint.rotation.set(progress * 1.2, progress * 0.5, -progress * 0.8);
        rightKneeJoint.rotation.x = (1 - progress) * 1.4; // Snap kick
        break;
      }
      default: {
        // Default gentle breathing articulation
        torsoGroup.position.y = Math.sin(progress * Math.PI) * 0.01;
        break;
      }
    }
  };

  return {
    meshMap,
    allMusclesGroup,
    superficialMusclesGroup,
    deepMusclesGroup,
    torsoGroup,
    leftArmShoulderJoint,
    rightArmShoulderJoint,
    leftElbowJoint,
    rightElbowJoint,
    leftHipJoint,
    rightHipJoint,
    leftKneeJoint,
    rightKneeJoint,
    equipmentGroup,
    plateMesh,
    barbellMesh,
    leftDumbbellMesh,
    rightDumbbellMesh,
    trunksMesh,
    headGroup,
    setEquipment,
    setMovementKinematics,
  };
}

function leftArmShoulderJointSafe(group: THREE.Group): THREE.Group {
  return group;
}
