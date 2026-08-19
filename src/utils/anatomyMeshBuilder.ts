import * as THREE from 'three';
import { MuscleGroup } from '../types';

// ==========================================
// 1. PROCEDURAL TEXTURES & MEDICAL SHADERS
// ==========================================

let cachedMuscleTexture: THREE.CanvasTexture | null = null;
let cachedBoneTexture: THREE.CanvasTexture | null = null;

/**
 * Generates an organic muscle striation bump/normal map
 */
export function getMuscleStriationTexture(): THREE.CanvasTexture {
  if (cachedMuscleTexture) return cachedMuscleTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Base dark red-burgundy tone
    ctx.fillStyle = '#6b1d2f';
    ctx.fillRect(0, 0, 512, 512);

    // Generate longitudinal muscle fiber striations
    for (let y = 0; y < 512; y += 2) {
      const alpha = 0.15 + Math.random() * 0.35;
      const lightness = 35 + Math.sin(y * 0.1) * 15 + Math.random() * 20;
      ctx.fillStyle = `hsla(345, 65%, ${lightness}%, ${alpha})`;
      ctx.fillRect(0, y, 512, 1.5 + Math.random());
    }

    // Fascial sheen highlights (white connective tissue filaments)
    ctx.fillStyle = 'rgba(240, 240, 255, 0.08)';
    for (let i = 0; i < 40; i++) {
      const y = Math.random() * 512;
      ctx.fillRect(0, y, 512, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 6);
  cachedMuscleTexture = texture;
  return texture;
}

/**
 * Generates osteological bone surface texture
 */
export function getBoneTexture(): THREE.CanvasTexture {
  if (cachedBoneTexture) return cachedBoneTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#e8e3d5';
    ctx.fillRect(0, 0, 256, 256);

    // Subtle bone porosity grain
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

// Medical Materials
export function createMuscleMaterial(colorHex: string = '#9e2a2b', isDeep: boolean = false): THREE.MeshStandardMaterial {
  const texture = getMuscleStriationTexture();
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

export function createTendonMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xf0ede6),
    roughness: 0.3,
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

// ==========================================
// 2. PROCEDURAL ANATOMICAL SKELETON BUILDER
// ==========================================

export function buildRealisticSkeleton(isSemiTransparent: boolean = false): THREE.Group {
  const skeleton = new THREE.Group();
  skeleton.name = 'RealisticHumanSkeleton';

  const boneMat = createBoneMaterial(isSemiTransparent, isSemiTransparent ? 0.38 : 1.0);
  const cartilageMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x99ccdd),
    roughness: 0.2,
    transparent: true,
    opacity: isSemiTransparent ? 0.4 : 0.75,
  });

  // --- A. SKULL & MANDIBLE ---
  const skullGroup = new THREE.Group();
  skullGroup.position.set(0, 1.58, 0);

  // Cranium (Neurocranium vault)
  const craniumGeo = new THREE.SphereGeometry(0.115, 24, 20);
  craniumGeo.scale(0.9, 1.15, 1.05);
  const cranium = new THREE.Mesh(craniumGeo, boneMat);
  skullGroup.add(cranium);

  // Facial Skeleton & Maxilla
  const faceGeo = new THREE.BoxGeometry(0.12, 0.1, 0.09);
  faceGeo.translate(0, -0.06, 0.06);
  const face = new THREE.Mesh(faceGeo, boneMat);
  skullGroup.add(face);

  // Mandible (Jawbone)
  const jawGeo = new THREE.TorusGeometry(0.06, 0.018, 12, 20, Math.PI);
  jawGeo.rotateX(Math.PI / 2);
  jawGeo.rotateY(Math.PI);
  const jaw = new THREE.Mesh(jawGeo, boneMat);
  jaw.position.set(0, -0.11, 0.04);
  skullGroup.add(jaw);

  // Eye Orbits (recesses)
  const orbitMat = new THREE.MeshBasicMaterial({ color: 0x1a1a24 });
  const orbitGeo = new THREE.CircleGeometry(0.022, 16);
  const leftOrbit = new THREE.Mesh(orbitGeo, orbitMat);
  leftOrbit.position.set(0.038, -0.03, 0.108);
  const rightOrbit = leftOrbit.clone();
  rightOrbit.position.set(-0.038, -0.03, 0.108);
  skullGroup.add(leftOrbit, rightOrbit);

  skeleton.add(skullGroup);

  // --- B. VERTEBRAL COLUMN (Spine with natural cervical lordosis, thoracic kyphosis, lumbar lordosis) ---
  const spineGroup = new THREE.Group();
  const vertebraCount = 24;
  for (let i = 0; i < vertebraCount; i++) {
    const t = i / (vertebraCount - 1);
    const y = 1.45 - t * 0.65; // Y: 1.45 to 0.80

    // Curvature: Cervical (forward), Thoracic (backward), Lumbar (forward)
    let z = 0;
    if (t < 0.25) {
      z = -0.02 - Math.sin((t / 0.25) * Math.PI) * 0.02; // Cervical
    } else if (t < 0.7) {
      const tt = (t - 0.25) / 0.45;
      z = -0.04 - Math.sin(tt * Math.PI) * 0.045; // Thoracic kyphosis
    } else {
      const tt = (t - 0.7) / 0.3;
      z = -0.085 + Math.sin(tt * Math.PI) * 0.035; // Lumbar lordosis
    }

    const scale = 0.02 + t * 0.015;
    const vGeo = new THREE.CylinderGeometry(scale * 1.3, scale * 1.4, 0.022, 12);
    vGeo.rotateX(Math.PI / 2);
    const vMesh = new THREE.Mesh(vGeo, boneMat);
    vMesh.position.set(0, y, z);

    // Spinous process (posterior spine protrusion)
    const spGeo = new THREE.ConeGeometry(0.008, 0.035, 6);
    spGeo.rotateX(-Math.PI / 3);
    const spMesh = new THREE.Mesh(spGeo, boneMat);
    spMesh.position.set(0, y, z - scale * 1.5);
    spineGroup.add(vMesh, spMesh);
  }

  // Sacrum & Coccyx
  const sacrumGeo = new THREE.ConeGeometry(0.065, 0.12, 12);
  sacrumGeo.rotateX(Math.PI);
  sacrumGeo.scale(1.1, 1, 0.6);
  const sacrum = new THREE.Mesh(sacrumGeo, boneMat);
  sacrum.position.set(0, 0.74, -0.08);
  spineGroup.add(sacrum);

  skeleton.add(spineGroup);

  // --- C. STERNUM & RIBCAGE (12 pairs of anatomically curved ribs) ---
  const ribcageGroup = new THREE.Group();

  // Sternum (Manubrium + Body + Xiphoid)
  const sternumGeo = new THREE.BoxGeometry(0.045, 0.17, 0.018);
  const sternum = new THREE.Mesh(sternumGeo, boneMat);
  sternum.position.set(0, 1.18, 0.165);
  sternum.rotation.x = -0.08;
  ribcageGroup.add(sternum);

  // Ribs (10 prominent anatomical pairs)
  for (let r = 0; r < 10; r++) {
    const ry = 1.32 - r * 0.034;
    const width = 0.15 + Math.sin((r / 9) * Math.PI) * 0.09;
    const depth = 0.12 + Math.sin((r / 9) * Math.PI) * 0.06;

    [-1, 1].forEach((side) => {
      // Left and Right Rib Curves
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, ry + 0.01, -0.07), // Spine attachment
        new THREE.Vector3(side * (width * 0.75), ry - 0.005, -0.04), // Lateral rib angle
        new THREE.Vector3(side * width, ry - 0.02, 0.05), // Mid-axillary rib sweep
        new THREE.Vector3(side * (width * 0.45), ry - 0.03, depth + 0.03), // Anterior turn
        new THREE.Vector3(side * 0.03, ry - 0.025, 0.16), // Sternal cartilage junction
      ]);

      const ribTube = new THREE.TubeGeometry(curve, 16, 0.0065, 8, false);
      const ribMesh = new THREE.Mesh(ribTube, r < 7 ? boneMat : cartilageMat);
      ribcageGroup.add(ribMesh);
    });
  }
  skeleton.add(ribcageGroup);

  // --- D. SHOULDER GIRDLE (Clavicles & Scapulae) ---
  const shoulderGirdle = new THREE.Group();

  [-1, 1].forEach((side) => {
    // S-curved Clavicle
    const clavicleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.025, 1.34, 0.15), // Sternoclavicular joint
      new THREE.Vector3(side * 0.11, 1.35, 0.14), // Anterior convex curve
      new THREE.Vector3(side * 0.21, 1.33, 0.06), // Acromioclavicular joint
    ]);
    const clavicleGeo = new THREE.TubeGeometry(clavicleCurve, 12, 0.009, 8, false);
    const clavicle = new THREE.Mesh(clavicleGeo, boneMat);
    shoulderGirdle.add(clavicle);

    // Scapula (Shoulder blade with spine & acromion)
    const scapulaGroup = new THREE.Group();
    scapulaGroup.position.set(side * 0.15, 1.18, -0.11);

    const scapulaBladeGeo = new THREE.ConeGeometry(0.07, 0.15, 3);
    scapulaBladeGeo.scale(1, 1, 0.15);
    scapulaBladeGeo.rotateZ(side * 0.3);
    const scapulaBlade = new THREE.Mesh(scapulaBladeGeo, boneMat);

    // Spine of Scapula & Acromion process
    const spineOfScapGeo = new THREE.BoxGeometry(0.12, 0.015, 0.03);
    spineOfScapGeo.translate(side * 0.02, 0.05, 0.02);
    const spineOfScap = new THREE.Mesh(spineOfScapGeo, boneMat);

    scapulaGroup.add(scapulaBlade, spineOfScap);
    shoulderGirdle.add(scapulaGroup);
  });
  skeleton.add(shoulderGirdle);

  // --- E. UPPER LIMBS (Humerus, Radius, Ulna, Hands) ---
  const armSkeleton = new THREE.Group();

  [-1, 1].forEach((side) => {
    // Humerus (Upper Arm Bone)
    const humerusGeo = new THREE.CylinderGeometry(0.016, 0.014, 0.28, 12);
    // Head of Humerus & Condyles
    const humHeadGeo = new THREE.SphereGeometry(0.028, 12, 12);
    humHeadGeo.translate(0, 0.14, 0);
    const humerus = new THREE.Mesh(humerusGeo, boneMat);
    const humHead = new THREE.Mesh(humHeadGeo, boneMat);
    const humerusFull = new THREE.Group();
    humerusFull.add(humerus, humHead);
    humerusFull.position.set(side * 0.34, 1.12, 0.0);
    humerusFull.rotation.z = side * -0.08;
    armSkeleton.add(humerusFull);

    // Radius & Ulna (Forearm Bones)
    const ulnaGeo = new THREE.CylinderGeometry(0.012, 0.009, 0.25, 10);
    const olecranon = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.022, 0.025), boneMat);
    olecranon.position.set(0, 0.125, -0.01);
    const ulna = new THREE.Mesh(ulnaGeo, boneMat);
    const ulnaGroup = new THREE.Group();
    ulnaGroup.add(ulna, olecranon);
    ulnaGroup.position.set(side * 0.39, 0.83, -0.015);
    ulnaGroup.rotation.z = side * -0.06;

    const radiusGeo = new THREE.CylinderGeometry(0.011, 0.013, 0.24, 10);
    const radius = new THREE.Mesh(radiusGeo, boneMat);
    radius.position.set(side * 0.425, 0.83, 0.015);
    radius.rotation.z = side * -0.06;

    // Hand Carpal/Metacarpal Plate
    const handGeo = new THREE.BoxGeometry(0.035, 0.11, 0.016);
    const hand = new THREE.Mesh(handGeo, boneMat);
    hand.position.set(side * 0.43, 0.63, 0.02);
    hand.rotation.z = side * -0.05;

    armSkeleton.add(ulnaGroup, radius, hand);
  });
  skeleton.add(armSkeleton);

  // --- F. PELVIC GIRDLE (Ilium, Ischium, Pubis) ---
  const pelvisGroup = new THREE.Group();
  pelvisGroup.position.set(0, 0.74, 0);

  [-1, 1].forEach((side) => {
    // Flared Iliac Wing
    const iliumGeo = new THREE.SphereGeometry(0.12, 16, 12, 0, Math.PI);
    iliumGeo.scale(0.85, 0.8, 0.35);
    iliumGeo.rotateZ(side * 0.25);
    iliumGeo.rotateY(side * 0.4);
    const ilium = new THREE.Mesh(iliumGeo, boneMat);
    ilium.position.set(side * 0.11, 0.03, -0.01);

    // Ischium & Pubic ramus
    const ischiumGeo = new THREE.TorusGeometry(0.045, 0.014, 8, 12, Math.PI * 1.2);
    ischiumGeo.rotateX(Math.PI / 2);
    const ischium = new THREE.Mesh(ischiumGeo, boneMat);
    ischium.position.set(side * 0.07, -0.07, 0.01);

    pelvisGroup.add(ilium, ischium);
  });
  skeleton.add(pelvisGroup);

  // --- G. LOWER LIMBS (Femur, Patella, Tibia, Fibula, Feet) ---
  const legSkeleton = new THREE.Group();

  [-1, 1].forEach((side) => {
    // Femur (Thigh Bone with Neck, Greater Trochanter, and Condyles)
    const femurGroup = new THREE.Group();
    femurGroup.position.set(side * 0.14, 0.46, 0.01);
    femurGroup.rotation.z = side * 0.04; // Slight anatomical valgus angle

    const femurShaftGeo = new THREE.CylinderGeometry(0.018, 0.02, 0.42, 14);
    const femurShaft = new THREE.Mesh(femurShaftGeo, boneMat);

    // Femoral Head & Neck
    const femHeadGeo = new THREE.SphereGeometry(0.032, 12, 12);
    femHeadGeo.translate(side * -0.035, 0.22, 0.01);
    const femHead = new THREE.Mesh(femHeadGeo, boneMat);

    // Greater Trochanter
    const trochanter = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.035), boneMat);
    trochanter.position.set(side * 0.025, 0.2, 0);

    // Femoral Condyles (Knee joint surface)
    const condyles = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.035, 0.05), boneMat);
    condyles.position.set(0, -0.21, 0);

    femurGroup.add(femurShaft, femHead, trochanter, condyles);
    legSkeleton.add(femurGroup);

    // Patella (Kneecap sesamoid bone)
    const patellaGeo = new THREE.SphereGeometry(0.022, 12, 10);
    patellaGeo.scale(1, 1.2, 0.6);
    const patella = new THREE.Mesh(patellaGeo, boneMat);
    patella.position.set(side * 0.125, 0.23, 0.048);
    legSkeleton.add(patella);

    // Tibia (Shin bone with Medial Malleolus) & Fibula
    const tibiaGroup = new THREE.Group();
    tibiaGroup.position.set(side * 0.12, -0.06, 0.01);

    const tibiaShaftGeo = new THREE.CylinderGeometry(0.022, 0.016, 0.4, 12);
    const tibia = new THREE.Mesh(tibiaShaftGeo, boneMat);

    // Fibula (Lateral slender bone)
    const fibulaShaftGeo = new THREE.CylinderGeometry(0.008, 0.007, 0.38, 8);
    const fibula = new THREE.Mesh(fibulaShaftGeo, boneMat);
    fibula.position.set(side * 0.038, -0.01, -0.01);

    tibiaGroup.add(tibia, fibula);
    legSkeleton.add(tibiaGroup);

    // Foot (Tarsals, Metatarsals, Calcaneus heel)
    const footGroup = new THREE.Group();
    footGroup.position.set(side * 0.12, -0.28, 0.06);

    const calcaneus = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.035, 0.06), boneMat);
    calcaneus.position.set(0, 0.01, -0.05);

    const metatarsals = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.025, 0.12), boneMat);
    metatarsals.position.set(0, -0.005, 0.03);

    footGroup.add(calcaneus, metatarsals);
    legSkeleton.add(footGroup);
  });
  skeleton.add(legSkeleton);

  return skeleton;
}

// ==========================================
// 3. REALISTIC PROCEDURAL MUSCULATURE BUILDER
// ==========================================

export interface MuscleMeshRegistry {
  meshMap: Map<MuscleGroup, THREE.Mesh[]>;
  allMusclesGroup: THREE.Group;
  deepMusclesGroup: THREE.Group;
  superficialMusclesGroup: THREE.Group;
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

  // --- CHEST: Pectoralis Major (Sternal & Costal Heads) ---
  const chestMat = createMuscleMaterial('#d92448');
  [-1, 1].forEach((side) => {
    // Fan-shaped sternal pectoralis major belly
    const chestGeo = new THREE.CylinderGeometry(0.095, 0.05, 0.14, 20, 4, false, 0, Math.PI);
    chestGeo.scale(1.25, 1, 0.65);
    chestGeo.rotateZ(side * -0.42);
    chestGeo.rotateY(side * 0.35);
    const chestMesh = new THREE.Mesh(chestGeo, chestMat.clone());
    chestMesh.position.set(side * 0.13, 1.15, 0.145);
    registerMuscle('chest', [chestMesh]);
  });

  // --- UPPER CHEST: Pectoralis Major (Clavicular Head) ---
  const upperChestMat = createMuscleMaterial('#e83758');
  [-1, 1].forEach((side) => {
    const upChestGeo = new THREE.BoxGeometry(0.12, 0.065, 0.065);
    upChestGeo.rotateZ(side * -0.28);
    upChestGeo.rotateY(side * 0.2);
    const upChestMesh = new THREE.Mesh(upChestGeo, upperChestMat.clone());
    upChestMesh.position.set(side * 0.11, 1.25, 0.155);
    registerMuscle('upper_chest', [upChestMesh]);
  });

  // --- SERRATUS ANTERIOR (The Boxer's Muscle: 6 Distinct Slips) ---
  const serratusMat = createMuscleMaterial('#f43f5e');
  [-1, 1].forEach((side) => {
    const slips: THREE.Mesh[] = [];
    for (let s = 0; s < 5; s++) {
      const slipGeo = new THREE.CylinderGeometry(0.012, 0.015, 0.075, 8);
      slipGeo.rotateZ(side * 1.1);
      slipGeo.rotateY(side * 0.35);
      const slip = new THREE.Mesh(slipGeo, serratusMat.clone());
      slip.position.set(side * (0.19 + s * 0.012), 1.14 - s * 0.032, 0.1 - s * 0.008);
      slips.push(slip);
    }
    registerMuscle('serratus_anterior', slips);
  });

  // --- DELTOIDS: Anterior, Lateral & Posterior Heads ---
  [-1, 1].forEach((side) => {
    // 1. Anterior Deltoid
    const antDeltGeo = new THREE.SphereGeometry(0.06, 16, 14, 0, Math.PI);
    antDeltGeo.scale(0.9, 1.35, 0.9);
    antDeltGeo.rotateZ(side * -0.25);
    antDeltGeo.rotateY(side * 0.6);
    const antDeltMesh = new THREE.Mesh(antDeltGeo, createMuscleMaterial('#ea580c'));
    antDeltMesh.position.set(side * 0.27, 1.25, 0.1);
    registerMuscle('anterior_deltoid', [antDeltMesh]);

    // 2. Lateral Deltoid (Multipennate acromial cap)
    const latDeltGeo = new THREE.SphereGeometry(0.068, 16, 14, 0, Math.PI);
    latDeltGeo.scale(0.85, 1.5, 1.1);
    latDeltGeo.rotateZ(side * -0.15);
    const latDeltMesh = new THREE.Mesh(latDeltGeo, createMuscleMaterial('#f97316'));
    latDeltMesh.position.set(side * 0.32, 1.23, -0.01);
    registerMuscle('lateral_deltoid', [latDeltMesh]);

    // 3. Posterior Deltoid (Spinal head)
    const postDeltGeo = new THREE.SphereGeometry(0.058, 16, 14, 0, Math.PI);
    postDeltGeo.scale(0.9, 1.35, 0.9);
    postDeltGeo.rotateZ(side * -0.25);
    postDeltGeo.rotateY(side * -0.7);
    const postDeltMesh = new THREE.Mesh(postDeltGeo, createMuscleMaterial('#c2410c'));
    postDeltMesh.position.set(side * 0.28, 1.24, -0.11);
    registerMuscle('posterior_deltoid', [postDeltMesh]);
  });

  // --- ROTATOR CUFF (Deep SITS Complex: Supraspinatus, Infraspinatus, Teres Minor, Subscapularis) ---
  const rotatorMat = createMuscleMaterial('#b91c1c', true);
  [-1, 1].forEach((side) => {
    const supraGeo = new THREE.BoxGeometry(0.09, 0.035, 0.04);
    supraGeo.rotateZ(side * 0.1);
    const supra = new THREE.Mesh(supraGeo, rotatorMat.clone());
    supra.position.set(side * 0.18, 1.3, -0.09);

    const infraGeo = new THREE.BoxGeometry(0.08, 0.08, 0.03);
    infraGeo.rotateZ(side * 0.2);
    const infra = new THREE.Mesh(infraGeo, rotatorMat.clone());
    infra.position.set(side * 0.19, 1.19, -0.1);

    registerMuscle('rotator_cuff', [supra, infra], true);
  });

  // --- TRAPEZIUS (Superficial Upper Neck & Mid-Back Diamond Plate) ---
  const trapsUpperMat = createMuscleMaterial('#3b82f6');
  const trapsMidMat = createMuscleMaterial('#2563eb');

  [-1, 1].forEach((side) => {
    // Upper Trapezius (Neck descent)
    const upTrapGeo = new THREE.CylinderGeometry(0.045, 0.07, 0.14, 12);
    upTrapGeo.scale(0.8, 1, 1.2);
    upTrapGeo.rotateZ(side * 0.45);
    const upTrap = new THREE.Mesh(upTrapGeo, trapsUpperMat.clone());
    upTrap.position.set(side * 0.13, 1.38, -0.06);
    registerMuscle('traps', [upTrap]);

    // Middle Trapezius (Scapular retractors)
    const midTrapGeo = new THREE.BoxGeometry(0.13, 0.12, 0.025);
    midTrapGeo.rotateZ(side * -0.15);
    const midTrap = new THREE.Mesh(midTrapGeo, trapsMidMat.clone());
    midTrap.position.set(side * 0.1, 1.21, -0.115);
    registerMuscle('upper_back', [midTrap]);
  });

  // --- RHOMBOIDS (Deep Scapular Stabilizers) ---
  const rhomboidMat = createMuscleMaterial('#1d4ed8', true);
  [-1, 1].forEach((side) => {
    const rhombGeo = new THREE.BoxGeometry(0.09, 0.09, 0.02);
    rhombGeo.rotateZ(side * -0.5);
    const rhomb = new THREE.Mesh(rhombGeo, rhomboidMat.clone());
    rhomb.position.set(side * 0.1, 1.17, -0.095);
    registerMuscle('rhomboids', [rhomb], true);
  });

  // --- LATISSIMUS DORSI (Broad Back Wing Sheet) ---
  const latsMat = createMuscleMaterial('#1e40af');
  [-1, 1].forEach((side) => {
    const latGeo = new THREE.CylinderGeometry(0.12, 0.06, 0.28, 16, 4, false, 0, Math.PI);
    latGeo.scale(1.1, 1, 0.55);
    latGeo.rotateZ(side * -0.32);
    latGeo.rotateY(side * -0.4);
    const latMesh = new THREE.Mesh(latGeo, latsMat.clone());
    latMesh.position.set(side * 0.18, 0.98, -0.115);
    registerMuscle('lats', [latMesh]);
  });

  // --- ERECTOR SPINAE (Deep Spinal Column Columns) ---
  const erectorMat = createMuscleMaterial('#0369a1', true);
  [-1, 1].forEach((side) => {
    const erectorGeo = new THREE.CylinderGeometry(0.026, 0.032, 0.38, 12);
    const erector = new THREE.Mesh(erectorGeo, erectorMat.clone());
    erector.position.set(side * 0.055, 0.98, -0.11);
    registerMuscle('erector_spinae', [erector], true);
  });

  // --- BICEPS BRACHII & BRACHIALIS ---
  const bicepsMat = createMuscleMaterial('#10b981');
  const brachialisMat = createMuscleMaterial('#059669', true);
  [-1, 1].forEach((side) => {
    // Biceps Long & Short heads
    const bicepsGeo = new THREE.SphereGeometry(0.048, 16, 14);
    bicepsGeo.scale(0.85, 1.7, 0.9);
    bicepsGeo.rotateZ(side * -0.08);
    const biceps = new THREE.Mesh(bicepsGeo, bicepsMat.clone());
    biceps.position.set(side * 0.34, 1.05, 0.045);
    registerMuscle('biceps', [biceps]);

    // Brachialis (Deep elbow flexor)
    const brachGeo = new THREE.CylinderGeometry(0.028, 0.032, 0.12, 10);
    const brach = new THREE.Mesh(brachGeo, brachialisMat.clone());
    brach.position.set(side * 0.365, 0.98, 0.02);
    registerMuscle('brachialis', [brach], true);
  });

  // --- TRICEPS BRACHII (Long, Lateral & Medial Heads + Tendon Plate) ---
  const tricepsMat = createMuscleMaterial('#047857');
  const tendonMat = createTendonMaterial();
  [-1, 1].forEach((side) => {
    // Triceps Long & Lateral Bellies
    const tricepsGeo = new THREE.SphereGeometry(0.056, 16, 14);
    tricepsGeo.scale(0.9, 1.7, 1.1);
    tricepsGeo.rotateZ(side * -0.08);
    const triceps = new THREE.Mesh(tricepsGeo, tricepsMat.clone());
    triceps.position.set(side * 0.345, 1.06, -0.05);

    // Pearlescent Triceps Tendon Plate inserting into olecranon
    const triTendonGeo = new THREE.BoxGeometry(0.04, 0.08, 0.015);
    const triTendon = new THREE.Mesh(triTendonGeo, tendonMat);
    triTendon.position.set(side * 0.35, 0.96, -0.048);

    registerMuscle('triceps', [triceps, triTendon]);
  });

  // --- FOREARMS (Brachioradialis, Flexor & Extensor Compartments) ---
  const forearmsMat = createMuscleMaterial('#065f46');
  [-1, 1].forEach((side) => {
    const forearmGeo = new THREE.CylinderGeometry(0.045, 0.026, 0.22, 14);
    forearmGeo.scale(1.15, 1, 0.85);
    forearmGeo.rotateZ(side * -0.06);
    const forearm = new THREE.Mesh(forearmGeo, forearmsMat.clone());
    forearm.position.set(side * 0.395, 0.82, 0.01);
    registerMuscle('forearms', [forearm]);
  });

  // --- ABDOMEN: Rectus Abdominis (Anatomical 6-Pack with Inscriptions & Linea Alba) ---
  const absMat = createMuscleMaterial('#8b5cf6');
  const absGroup: THREE.Mesh[] = [];

  // Linea Alba (Midline fibrous groove)
  const lineaAlbaGeo = new THREE.BoxGeometry(0.01, 0.32, 0.02);
  const lineaAlba = new THREE.Mesh(lineaAlbaGeo, tendonMat);
  lineaAlba.position.set(0, 0.98, 0.162);
  absGroup.push(lineaAlba);

  // 6 Sculpted Segments (3 tiers)
  for (let tier = 0; tier < 3; tier++) {
    const yPos = 1.08 - tier * 0.09;
    [-1, 1].forEach((side) => {
      const segGeo = new THREE.BoxGeometry(0.052, 0.068, 0.032);
      const segMesh = new THREE.Mesh(segGeo, absMat.clone());
      segMesh.position.set(side * 0.038, yPos, 0.155);
      absGroup.push(segMesh);
    });
  }
  registerMuscle('abs', absGroup);

  // --- OBLIQUES: External & Internal Obliques ---
  const obliquesMat = createMuscleMaterial('#7c3aed');
  [-1, 1].forEach((side) => {
    const obGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.22, 12, 3, false, 0, Math.PI);
    obGeo.scale(0.8, 1, 0.9);
    obGeo.rotateZ(side * -0.15);
    obGeo.rotateY(side * 0.8);
    const obMesh = new THREE.Mesh(obGeo, obliquesMat.clone());
    obMesh.position.set(side * 0.15, 0.93, 0.08);
    registerMuscle('obliques', [obMesh]);
  });

  // --- TRANSVERSE ABDOMINIS (Deep Core Corset Sheath) ---
  const transverseMat = createMuscleMaterial('#6d28d9', true);
  const transGeo = new THREE.CylinderGeometry(0.12, 0.11, 0.26, 16, 2, true);
  transGeo.scale(1, 1, 0.8);
  const transverse = new THREE.Mesh(transGeo, transverseMat);
  transverse.position.set(0, 0.94, 0.02);
  registerMuscle('transverse_abdominis', [transverse], true);

  // --- HIP FLEXORS: Psoas Major & Iliacus ---
  const psoasMat = createMuscleMaterial('#9333ea', true);
  [-1, 1].forEach((side) => {
    const psoasGeo = new THREE.CylinderGeometry(0.024, 0.032, 0.24, 10);
    psoasGeo.rotateZ(side * -0.28);
    const psoas = new THREE.Mesh(psoasGeo, psoasMat.clone());
    psoas.position.set(side * 0.065, 0.8, 0.015);
    registerMuscle('psoas_major', [psoas], true);
    registerMuscle('hip_flexors', [psoas]);
  });

  // --- GLUTEUS MAXIMUS (Heavy Hip Extensor) & GLUTEUS MEDIUS ---
  const gluteMaxMat = createMuscleMaterial('#ec4899');
  const gluteMedMat = createMuscleMaterial('#db2777', true);

  [-1, 1].forEach((side) => {
    // Gluteus Maximus
    const gMaxGeo = new THREE.SphereGeometry(0.098, 16, 14);
    gMaxGeo.scale(0.95, 1.1, 1.25);
    gMaxGeo.rotateZ(side * 0.15);
    gMaxGeo.rotateY(side * -0.4);
    const gMax = new THREE.Mesh(gMaxGeo, gluteMaxMat.clone());
    gMax.position.set(side * 0.125, 0.69, -0.115);
    registerMuscle('glutes', [gMax]);

    // Gluteus Medius (Fan shaped pelvic stabilizer)
    const gMedGeo = new THREE.BoxGeometry(0.08, 0.09, 0.06);
    gMedGeo.rotateZ(side * 0.25);
    const gMed = new THREE.Mesh(gMedGeo, gluteMedMat.clone());
    gMed.position.set(side * 0.17, 0.77, -0.04);
    registerMuscle('gluteus_medius', [gMed], true);
  });

  // --- QUADRICEPS: Rectus Femoris, Vastus Medialis (Teardrop), Vastus Lateralis ---
  const quadMat = createMuscleMaterial('#e11d48');
  const vmoMat = createMuscleMaterial('#be123c');
  const vLatMat = createMuscleMaterial('#9f1239');

  [-1, 1].forEach((side) => {
    // 1. Rectus Femoris (Bipennate center thigh)
    const rfGeo = new THREE.CylinderGeometry(0.042, 0.032, 0.28, 14);
    rfGeo.scale(1.1, 1, 0.8);
    const rf = new THREE.Mesh(rfGeo, quadMat.clone());
    rf.position.set(side * 0.125, 0.46, 0.095);

    // 2. Vastus Medialis Obliquus (VMO Teardrop at inner knee)
    const vmoGeo = new THREE.SphereGeometry(0.045, 14, 12);
    vmoGeo.scale(0.85, 1.4, 0.9);
    vmoGeo.rotateZ(side * -0.22);
    const vmo = new THREE.Mesh(vmoGeo, vmoMat.clone());
    vmo.position.set(side * 0.08, 0.33, 0.08);

    // 3. Vastus Lateralis (Outer thigh sweep)
    const vLatGeo = new THREE.CylinderGeometry(0.055, 0.042, 0.32, 14);
    vLatGeo.scale(1.2, 1, 0.9);
    vLatGeo.rotateZ(side * 0.12);
    const vLat = new THREE.Mesh(vLatGeo, vLatMat.clone());
    vLat.position.set(side * 0.175, 0.44, 0.04);

    // Patellar Tendon
    const patellarTendonGeo = new THREE.BoxGeometry(0.024, 0.07, 0.015);
    const patellarTendon = new THREE.Mesh(patellarTendonGeo, tendonMat);
    patellarTendon.position.set(side * 0.118, 0.18, 0.085);

    registerMuscle('quadriceps', [rf, vmo, vLat, patellarTendon]);
    registerMuscle('rectus_femoris', [rf]);
    registerMuscle('vastus_medialis', [vmo]);
    registerMuscle('vastus_lateralis', [vLat]);
  });

  // --- HAMSTRINGS (Biceps Femoris, Semitendinosus, Semimembranosus) ---
  const hamstringsMat = createMuscleMaterial('#0284c7');
  [-1, 1].forEach((side) => {
    const hamGeo = new THREE.CylinderGeometry(0.058, 0.042, 0.32, 14);
    hamGeo.scale(1.1, 1, 0.9);
    const ham = new THREE.Mesh(hamGeo, hamstringsMat.clone());
    ham.position.set(side * 0.13, 0.44, -0.075);
    registerMuscle('hamstrings', [ham]);
  });

  // --- CALVES & ACHILLES TENDON: Gastrocnemius (Medial & Lateral) & Soleus ---
  const gastrocMat = createMuscleMaterial('#06b6d4');
  const soleusMat = createMuscleMaterial('#0891b2', true);

  [-1, 1].forEach((side) => {
    // Gastrocnemius Medial & Lateral Bellies
    const gastrocMedGeo = new THREE.SphereGeometry(0.042, 14, 12);
    gastrocMedGeo.scale(0.85, 1.8, 1);
    const gastrocMed = new THREE.Mesh(gastrocMedGeo, gastrocMat.clone());
    gastrocMed.position.set(side * 0.095, -0.03, -0.06);

    const gastrocLatGeo = new THREE.SphereGeometry(0.038, 14, 12);
    gastrocLatGeo.scale(0.85, 1.6, 1);
    const gastrocLat = new THREE.Mesh(gastrocLatGeo, gastrocMat.clone());
    gastrocLat.position.set(side * 0.145, -0.01, -0.055);

    // Soleus (Deep broad muscle)
    const soleusGeo = new THREE.CylinderGeometry(0.038, 0.024, 0.22, 12);
    const soleus = new THREE.Mesh(soleusGeo, soleusMat.clone());
    soleus.position.set(side * 0.115, -0.07, -0.035);

    // Prominent Achilles Tendon (Tendo Calcaneus)
    const achillesGeo = new THREE.CylinderGeometry(0.012, 0.018, 0.16, 10);
    const achilles = new THREE.Mesh(achillesGeo, tendonMat);
    achilles.position.set(side * 0.118, -0.16, -0.055);

    registerMuscle('calves', [gastrocMed, gastrocLat, achilles]);
    registerMuscle('soleus', [soleus], true);
  });

  // --- TIBIALIS ANTERIOR (Shin Armor & Decelerator) ---
  const tibialisMat = createMuscleMaterial('#0e7490');
  [-1, 1].forEach((side) => {
    const tibGeo = new THREE.CylinderGeometry(0.028, 0.016, 0.28, 12);
    tibGeo.rotateZ(side * 0.04);
    const tib = new THREE.Mesh(tibGeo, tibialisMat.clone());
    tib.position.set(side * 0.122, -0.06, 0.065);
    registerMuscle('tibialis', [tib]);
  });

  return {
    meshMap,
    allMusclesGroup,
    superficialMusclesGroup,
    deepMusclesGroup,
  };
}
