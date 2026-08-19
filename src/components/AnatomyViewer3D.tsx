import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { MUSCLE_CATALOG } from '../data/anatomyData';
import { AnatomyLayerMode, BiomechanicsInfo, MuscleDetail, MuscleGroup } from '../types';
import {
  buildRealisticSkeleton,
  buildRealisticMusculature,
  createMuscleMaterial,
} from '../utils/anatomyMeshBuilder';
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Layers,
  Activity,
  Sliders,
  ChevronRight,
  Eye,
} from 'lucide-react';

export interface AnatomyViewer3DProps {
  highlightedMuscles?: { [key in MuscleGroup]?: number } | MuscleGroup[];
  primaryMuscles?: MuscleGroup[];
  secondaryMuscles?: MuscleGroup[];
  stabilizingMuscles?: MuscleGroup[];
  selectedMuscleId?: MuscleGroup | null;
  onSelectMuscle?: (muscle: MuscleDetail | null) => void;
  height?: number | string;
  showControls?: boolean;
  compact?: boolean;
  layerMode?: AnatomyLayerMode;
  onLayerChange?: (mode: AnatomyLayerMode) => void;
  deepLevel?: number; // 1 = intermediate, 2 = deep, 3 = deepest
  onDeepLevelChange?: (level: number) => void;
  activeBiomechanics?: BiomechanicsInfo | null;
  animateJoints?: boolean;
}

export const AnatomyViewer3D: React.FC<AnatomyViewer3DProps> = ({
  highlightedMuscles = {},
  primaryMuscles = [],
  secondaryMuscles = [],
  stabilizingMuscles = [],
  selectedMuscleId = null,
  onSelectMuscle,
  height = 480,
  showControls = true,
  compact = false,
  layerMode: externalLayerMode,
  onLayerChange,
  deepLevel: externalDeepLevel = 1,
  onDeepLevelChange,
  activeBiomechanics,
  animateJoints = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelRootRef = useRef<THREE.Group | null>(null);
  const muscleMeshesRef = useRef<Map<MuscleGroup, THREE.Mesh[]>>(new Map());
  const skeletonGroupRef = useRef<THREE.Group | null>(null);
  const musculatureGroupRef = useRef<THREE.Group | null>(null);
  const biomechanicsVectorsGroupRef = useRef<THREE.Group | null>(null);

  // Interaction State
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);

  // Internal layer state if not controlled externally
  const [internalLayerMode, setInternalLayerMode] = useState<AnatomyLayerMode>('muscular');
  const [internalDeepLevel, setInternalDeepLevel] = useState<number>(1);
  const [autoRotate, setAutoRotate] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(1);
  const [cameraView, setCameraView] = useState<'anterior' | 'posterior' | 'lateral' | 'upper' | 'lower'>('anterior');

  const activeLayerMode = externalLayerMode || internalLayerMode;
  const activeDeepLevel = externalDeepLevel !== undefined ? externalDeepLevel : internalDeepLevel;

  const handleSetLayer = (mode: AnatomyLayerMode) => {
    if (onLayerChange) {
      onLayerChange(mode);
    } else {
      setInternalLayerMode(mode);
    }
  };

  const handleSetDeepLevel = (lvl: number) => {
    if (onDeepLevelChange) {
      onDeepLevelChange(lvl);
    } else {
      setInternalDeepLevel(lvl);
    }
  };

  // Normalize highlighted muscle map
  const activeHighlights: Record<string, number> = React.useMemo(() => {
    if (Array.isArray(highlightedMuscles)) {
      const map: Record<string, number> = {};
      highlightedMuscles.forEach((m) => {
        map[m] = 85;
      });
      return map;
    }
    return (highlightedMuscles as Record<string, number>) || {};
  }, [highlightedMuscles]);

  // Determine functional role for each muscle
  const getMuscleRole = useCallback(
    (muscleId: MuscleGroup): 'primary' | 'secondary' | 'stabilizer' | 'passive' => {
      if (primaryMuscles.includes(muscleId)) return 'primary';
      if (secondaryMuscles.includes(muscleId)) return 'secondary';
      if (stabilizingMuscles.includes(muscleId)) return 'stabilizer';
      if (activeHighlights[muscleId] && activeHighlights[muscleId] > 70) return 'primary';
      if (activeHighlights[muscleId] && activeHighlights[muscleId] > 40) return 'secondary';
      if (activeHighlights[muscleId] && activeHighlights[muscleId] > 0) return 'stabilizer';
      return 'passive';
    },
    [primaryMuscles, secondaryMuscles, stabilizingMuscles, activeHighlights]
  );

  // Initialize Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060913); // Medical Dark Slate

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / (typeof height === 'number' ? height : container.clientHeight || 480),
      0.1,
      100
    );
    camera.position.set(0, 0.75, 2.7);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, typeof height === 'number' ? height : container.clientHeight || 480);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Medical Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    // Key Light (Anterior Medical Illuminator)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(2.5, 3.5, 3.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Fill Light (Soft Cool Cyan Contrast)
    const fillLight = new THREE.DirectionalLight(0x7dd3fc, 0.85);
    fillLight.position.set(-3.0, 2.0, 2.0);
    scene.add(fillLight);

    // Rim Light (Backlight defining anatomical silhouette)
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.1);
    rimLight.position.set(0, 3.0, -3.0);
    scene.add(rimLight);

    // Bottom Bounce Light (prevents dark under-shadows on legs)
    const bounceLight = new THREE.DirectionalLight(0xe0e7ff, 0.45);
    bounceLight.position.set(0, -2.5, 1.5);
    scene.add(bounceLight);

    // 5. Model Root Group
    const modelRoot = new THREE.Group();
    modelRoot.name = 'HumanAnatomySystem';
    modelRoot.position.set(0, -0.3, 0); // Center anatomically
    scene.add(modelRoot);
    modelRootRef.current = modelRoot;

    // 6. Build Skeletal Anatomy
    const skeleton = buildRealisticSkeleton(false);
    skeletonGroupRef.current = skeleton;
    modelRoot.add(skeleton);

    // 7. Build Realistic Musculature with Tendons
    const { meshMap, allMusclesGroup } = buildRealisticMusculature();
    musculatureGroupRef.current = allMusclesGroup;
    muscleMeshesRef.current = meshMap;
    modelRoot.add(allMusclesGroup);

    // 8. Biomechanics Visual Vector Overlay Group
    const vectorsGroup = new THREE.Group();
    vectorsGroup.name = 'BiomechanicsJointVectors';
    modelRoot.add(vectorsGroup);
    biomechanicsVectorsGroupRef.current = vectorsGroup;

    // 9. Raycasting for Muscle Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      if (!musculatureGroupRef.current) return;

      const intersects = raycaster.intersectObjects(musculatureGroupRef.current.children, true);
      if (intersects.length > 0) {
        let hitObj: THREE.Object3D | null = intersects[0].object;
        while (hitObj && !hitObj.userData.muscleId) {
          hitObj = hitObj.parent;
        }
        if (hitObj && hitObj.userData.muscleId) {
          const muscleId = hitObj.userData.muscleId as MuscleGroup;
          const detail = MUSCLE_CATALOG[muscleId];
          if (detail && onSelectMuscle) {
            onSelectMuscle(detail);
          }
        }
      }
    };

    // 10. Pointer Drag Rotation
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDraggingRef.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      previousMousePositionRef.current = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current || !modelRootRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - previousMousePositionRef.current.x;
      const deltaY = clientY - previousMousePositionRef.current.y;

      modelRootRef.current.rotation.y += deltaX * 0.008;
      modelRootRef.current.rotation.x = Math.max(-0.6, Math.min(0.6, modelRootRef.current.rotation.x + deltaY * 0.006));

      previousMousePositionRef.current = { x: clientX, y: clientY };
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    // Wheel Zoom
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      const zoomFactor = e.deltaY * 0.0012;
      const newZ = Math.max(1.3, Math.min(4.2, cameraRef.current.position.z + zoomFactor));
      cameraRef.current.position.z = newZ;
      setCurrentZoom(parseFloat((2.7 / newZ).toFixed(2)));
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    domEl.addEventListener('click', handleClick);
    domEl.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);
    domEl.addEventListener('wheel', handleWheel, { passive: false });

    // Handle Window/Container Resize
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = typeof height === 'number' ? height : container.clientHeight || 480;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 11. Animation Loop with Breathing Pulse on Primary Muscles
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (autoRotate && modelRootRef.current && !isDraggingRef.current) {
        modelRootRef.current.rotation.y += 0.006;
      }

      // Dynamic Medical Highlight Pulse for Agonist Muscles
      if (muscleMeshesRef.current) {
        const pulse = 0.5 + 0.5 * Math.sin(elapsedTime * 4.5); // 0 to 1
        muscleMeshesRef.current.forEach((meshes, mId) => {
          const isSelected = selectedMuscleId === mId;
          const role = getMuscleRole(mId);

          if (isSelected || role === 'primary') {
            meshes.forEach((mesh) => {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              if (mat && mat.emissive) {
                const intensity = isSelected ? 0.6 + pulse * 0.4 : 0.4 + pulse * 0.35;
                mat.emissiveIntensity = intensity;
              }
            });
          }
        });
      }

      // Rotate/Animate Biomechanical Joint Vectors if active
      if (biomechanicsVectorsGroupRef.current && biomechanicsVectorsGroupRef.current.children.length > 0) {
        biomechanicsVectorsGroupRef.current.children.forEach((child) => {
          if (child.userData.isRotatingRing) {
            child.rotation.z += 0.02;
          }
        });
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      resizeObserver.disconnect();
      domEl.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      domEl.removeEventListener('click', handleClick);
      domEl.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      domEl.removeEventListener('wheel', handleWheel);
      renderer.dispose();
    };
  }, [height, onSelectMuscle, getMuscleRole]);

  // Update Visual Layering, Progressive Depth & Medical Highlighting
  useEffect(() => {
    if (!muscleMeshesRef.current || !skeletonGroupRef.current || !musculatureGroupRef.current) return;

    const isSkeletalOnly = activeLayerMode === 'skeletal';
    const isComposite = activeLayerMode === 'composite';
    const isDeepOnly = activeLayerMode === 'deep';
    const isMuscularSuperficial = activeLayerMode === 'muscular';

    // Skeleton Visibility & Material Translucency
    skeletonGroupRef.current.visible = isSkeletalOnly || isComposite;
    if (skeletonGroupRef.current.visible) {
      skeletonGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material.transparent = isComposite;
          child.material.opacity = isComposite ? 0.35 : 1.0;
        }
      });
    }

    // Musculature Visibility
    musculatureGroupRef.current.visible = !isSkeletalOnly;

    if (!isSkeletalOnly) {
      muscleMeshesRef.current.forEach((meshes, muscleId) => {
        const detail = MUSCLE_CATALOG[muscleId];
        const isSelected = selectedMuscleId === muscleId;
        const role = getMuscleRole(muscleId);
        const muscleDeepLevel = detail?.deepLevel || (detail?.layer === 'deep' ? 1 : 0);

        // Layer Filter Logic
        let isVisible = true;
        if (isMuscularSuperficial) {
          // In superficial muscular mode, display superficial muscles and prominent stabilizers
          if (detail?.layer === 'deep' && !isSelected && role === 'passive') {
            isVisible = false;
          }
        } else if (isDeepOnly) {
          // In Deep Muscles mode: progressive revelation based on activeDeepLevel (1, 2, or 3)
          if (detail?.layer !== 'deep' && !isSelected && role === 'passive') {
            // Hide superficial to reveal deep interior
            isVisible = false;
          } else if (muscleDeepLevel > activeDeepLevel && !isSelected && role === 'passive') {
            // Hide levels deeper than current slider threshold
            isVisible = false;
          }
        } else if (isComposite) {
          // In Composite mode: slightly translucent superficial muscles revealing underlying skeleton
          isVisible = true;
        }

        meshes.forEach((mesh) => {
          mesh.visible = isVisible;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (!mat) return;

          // Composite layer transparency
          if (isComposite) {
            mat.transparent = true;
            mat.opacity = isSelected || role !== 'passive' ? 0.95 : 0.65;
          } else {
            mat.transparent = false;
            mat.opacity = 1.0;
          }

          // HIGH-CONTRAST MEDICAL ROLE HIGHLIGHTING
          if (isSelected) {
            // Selected Muscle: Brilliant Neon Amber-Cyan Focus
            mat.color.set('#00f2fe');
            mat.emissive.set('#0284c7');
            mat.emissiveIntensity = 0.8;
            mat.roughness = 0.2;
          } else if (role === 'primary') {
            // Primary Agonist: High-Energy Medical Crimson Heat
            mat.color.set('#ff1e56');
            mat.emissive.set('#ff003c');
            mat.emissiveIntensity = 0.6;
            mat.roughness = 0.3;
          } else if (role === 'secondary') {
            // Secondary Synergist: Energetic Golden Amber
            mat.color.set('#f59e0b');
            mat.emissive.set('#d97706');
            mat.emissiveIntensity = 0.45;
            mat.roughness = 0.35;
          } else if (role === 'stabilizer') {
            // Stabilizer: Precision Electric Teal-Cyan
            mat.color.set('#06b6d4');
            mat.emissive.set('#0891b2');
            mat.emissiveIntensity = 0.4;
            mat.roughness = 0.35;
          } else {
            // Natural Anatomical Deep Burgundy Muscle Tone with striation map
            const baseColor = detail?.color || '#9e2a2b';
            mat.color.set(baseColor);
            mat.emissive.set('#000000');
            mat.emissiveIntensity = 0.0;
            mat.roughness = 0.45;
          }
        });
      });
    }
  }, [activeLayerMode, activeDeepLevel, selectedMuscleId, getMuscleRole]);

  // Update Biomechanical Joint Vectors 3D Visualizer
  useEffect(() => {
    if (!biomechanicsVectorsGroupRef.current) return;
    const group = biomechanicsVectorsGroupRef.current;
    group.clear();

    if (!activeBiomechanics) return;

    const jointStr = (activeBiomechanics.jointMovement || '').toLowerCase();

    // If shoulder joint involved (e.g. Bench Press, Military Press, Hook)
    if (jointStr.includes('shoulder') || jointStr.includes('glenohumeral') || jointStr.includes('arm pressing')) {
      [-1, 1].forEach((side) => {
        // Rotating Joint Vector Ring
        const ringGeo = new THREE.TorusGeometry(0.09, 0.008, 12, 32);
        ringGeo.rotateY(Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe, wireframe: true });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.set(side * 0.28, 1.24, 0.02);
        ringMesh.userData.isRotatingRing = true;

        // Force Arrow Vector
        const arrow = new THREE.ArrowHelper(
          new THREE.Vector3(0, jointStr.includes('overhead') ? 1 : 0.3, jointStr.includes('horizontal') ? 1 : 0.5).normalize(),
          new THREE.Vector3(side * 0.28, 1.24, 0.08),
          0.22,
          0xff3366,
          0.06,
          0.04
        );
        group.add(ringMesh, arrow);
      });
    }

    // If hip or knee joint involved (e.g. Squat, Deadlift, Kick)
    if (jointStr.includes('hip') || jointStr.includes('knee') || jointStr.includes('squat')) {
      [-1, 1].forEach((side) => {
        const ringGeo = new THREE.TorusGeometry(0.1, 0.008, 12, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.set(side * 0.14, 0.46, 0.05);
        ringMesh.userData.isRotatingRing = true;

        const arrow = new THREE.ArrowHelper(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(side * 0.14, 0.46, 0.1),
          0.24,
          0x10b981,
          0.06,
          0.04
        );
        group.add(ringMesh, arrow);
      });
    }
  }, [activeBiomechanics]);

  // Camera Presets
  const setPresetCamera = (view: 'anterior' | 'posterior' | 'lateral' | 'upper' | 'lower') => {
    if (!cameraRef.current || !modelRootRef.current) return;
    setCameraView(view);
    modelRootRef.current.rotation.set(0, 0, 0);

    switch (view) {
      case 'anterior':
        cameraRef.current.position.set(0, 0.75, 2.7);
        break;
      case 'posterior':
        modelRootRef.current.rotation.y = Math.PI;
        cameraRef.current.position.set(0, 0.75, 2.7);
        break;
      case 'lateral':
        modelRootRef.current.rotation.y = Math.PI / 2;
        cameraRef.current.position.set(0, 0.75, 2.7);
        break;
      case 'upper':
        cameraRef.current.position.set(0, 1.15, 1.8);
        break;
      case 'lower':
        cameraRef.current.position.set(0, 0.25, 1.9);
        break;
    }
  };

  const handleZoom = (delta: number) => {
    if (!cameraRef.current) return;
    const newZ = Math.max(1.3, Math.min(4.2, cameraRef.current.position.z + delta));
    cameraRef.current.position.z = newZ;
    setCurrentZoom(parseFloat((2.7 / newZ).toFixed(2)));
  };

  const handleReset = () => {
    if (!cameraRef.current || !modelRootRef.current) return;
    modelRootRef.current.rotation.set(0, 0, 0);
    cameraRef.current.position.set(0, 0.75, 2.7);
    setCurrentZoom(1);
    setAutoRotate(false);
    setCameraView('anterior');
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 select-none shadow-2xl flex flex-col">
      {/* Top Bar: Layer Selectors & Role Legend */}
      <div className="p-3 sm:p-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
        {/* Layer Mode Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
          {(
            [
              { id: 'muscular', label: 'Muscular' },
              { id: 'skeletal', label: 'Skeletal' },
              { id: 'deep', label: 'Deep Muscles' },
              { id: 'composite', label: 'Muscle + Skeleton' },
            ] as const
          ).map((tab) => {
            const isActive = activeLayerMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSetLayer(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Functional Role Legend */}
        <div className="flex items-center gap-3 text-[11px] font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50 animate-pulse" />
            <span className="text-rose-300">Primary (Agonist)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
            <span className="text-amber-200">Secondary</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
            <span className="text-cyan-200">Stabilizer</span>
          </div>
        </div>
      </div>

      {/* Deep Muscles Progressive Depth Slider (Visible only in 'deep' mode) */}
      {activeLayerMode === 'deep' && (
        <div className="px-4 py-2.5 bg-indigo-950/40 border-b border-indigo-500/30 flex items-center justify-between gap-4 z-10 animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-200">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Progressive Deep Muscle Peeling:</span>
          </div>
          <div className="flex items-center gap-2">
            {[
              { lvl: 1, label: 'Level 1: Intermediate (Brachialis, Rhomboids)' },
              { lvl: 2, label: 'Level 2: Deep (Rotator Cuff, Erector Spinae)' },
              { lvl: 3, label: 'Level 3: Deepest (Psoas, Transverse Core)' },
            ].map((item) => (
              <button
                key={item.lvl}
                onClick={() => handleSetDeepLevel(item.lvl)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                  activeDeepLevel === item.lvl
                    ? 'bg-indigo-500 text-white border-indigo-400 shadow-md'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
                }`}
                title={item.label}
              >
                Depth {item.lvl}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3D Canvas Viewport */}
      <div
        ref={containerRef}
        className="w-full relative cursor-grab active:cursor-grabbing focus:outline-none"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      />

      {/* Overlay UI Controls (Camera presets, Zoom, Auto-rotate, Reset) */}
      {showControls && (
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
          {/* Anatomical Camera View Presets */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/85 backdrop-blur-md rounded-2xl border border-slate-800 pointer-events-auto shadow-lg">
            {(
              [
                { id: 'anterior', label: 'Anterior (Front)' },
                { id: 'posterior', label: 'Posterior (Back)' },
                { id: 'lateral', label: 'Lateral (Side)' },
                { id: 'upper', label: 'Upper Body' },
                { id: 'lower', label: 'Lower Body' },
              ] as const
            ).map((view) => (
              <button
                key={view.id}
                onClick={() => setPresetCamera(view.id)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                  cameraView === view.id
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/85 backdrop-blur-md rounded-2xl border border-slate-800 pointer-events-auto shadow-lg">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`p-2 rounded-xl text-xs font-bold transition-all ${
                autoRotate ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Toggle 360° Continuous Orbit"
            >
              <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => handleZoom(-0.35)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom(0.35)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              title="Reset Anatomical Alignment"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Active Selected Muscle Floating Pill */}
      {selectedMuscleId && MUSCLE_CATALOG[selectedMuscleId] && (
        <div className="absolute top-16 left-4 p-3 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 shadow-xl max-w-xs pointer-events-none animate-fadeIn z-10">
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
            Selected Anatomical Structure:
          </span>
          <h4 className="text-sm font-extrabold text-white">
            {MUSCLE_CATALOG[selectedMuscleId].name}
          </h4>
          <span className="text-[11px] text-slate-400 italic block mt-0.5">
            {MUSCLE_CATALOG[selectedMuscleId].latinName}
          </span>
        </div>
      )}
    </div>
  );
};
