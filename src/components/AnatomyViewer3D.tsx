import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { MUSCLE_CATALOG } from '../data/anatomyData';
import {
  AnatomyLayerMode,
  AnatomyVisualTheme,
  BiomechanicsInfo,
  ExerciseMovementPhase,
  MuscleDetail,
  MuscleGroup,
} from '../types';
import {
  buildRealisticSkeleton,
  buildRealisticMusculature,
  detectExerciseKinematics,
  MUSCLE_3D_ANCHORS,
  MuscleMeshRegistry,
} from '../utils/anatomyMeshBuilder';
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Sliders,
  Play,
  Pause,
  Sun,
  Moon,
  Tag,
  Columns,
  Crosshair,
  Activity,
  Layers,
  MapPin,
  Sparkles,
  Zap,
} from 'lucide-react';

export interface AnatomyViewer3DProps {
  exerciseId?: string;
  targetMuscles?: MuscleGroup[];
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
  deepLevel?: number;
  onDeepLevelChange?: (level: number) => void;
  activeBiomechanics?: BiomechanicsInfo | null;
  exerciseName?: string;
  initialTheme?: AnatomyVisualTheme;
  initialPhase?: ExerciseMovementPhase;
}

interface CalloutItem {
  muscleId: MuscleGroup;
  label: string;
  screenX: number;
  screenY: number;
  anchorX: number;
  anchorY: number;
  role: 'primary' | 'secondary' | 'stabilizer' | 'selected';
  visible: boolean;
}

export const AnatomyViewer3D: React.FC<AnatomyViewer3DProps> = ({
  exerciseId = 'plate_front_raise',
  targetMuscles = [],
  highlightedMuscles = {},
  primaryMuscles = [],
  secondaryMuscles = [],
  stabilizingMuscles = [],
  selectedMuscleId = null,
  onSelectMuscle,
  height = 540,
  showControls = true,
  compact = false,
  layerMode: externalLayerMode,
  onLayerChange,
  deepLevel: externalDeepLevel = 1,
  onDeepLevelChange,
  activeBiomechanics,
  exerciseName = 'Weight Plate Front Raise',
  initialTheme = 'weight_training_guide',
  initialPhase = 'dual',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelRootRef = useRef<THREE.Group | null>(null);
  const figureStartRef = useRef<MuscleMeshRegistry | null>(null);
  const figurePeakRef = useRef<MuscleMeshRegistry | null>(null);
  const skeletonGroupRef = useRef<THREE.Group | null>(null);

  // Detect appropriate exercise kinematics and equipment
  const { movementType, equipment } = React.useMemo(() => {
    const combinedTargets = [
      ...primaryMuscles,
      ...secondaryMuscles,
      ...targetMuscles,
      ...(Array.isArray(highlightedMuscles) ? highlightedMuscles : Object.keys(highlightedMuscles) as MuscleGroup[]),
    ];
    return detectExerciseKinematics(exerciseId, combinedTargets);
  }, [exerciseId, primaryMuscles, secondaryMuscles, targetMuscles, highlightedMuscles]);

  // States
  const [theme, setTheme] = useState<AnatomyVisualTheme>(initialTheme);
  const [phaseMode, setPhaseMode] = useState<ExerciseMovementPhase>(initialPhase === 'animated' ? 'dual' : initialPhase);
  const [showCallouts, setShowCallouts] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [internalLayerMode, setInternalLayerMode] = useState<AnatomyLayerMode>('muscular');
  const [internalDeepLevel, setInternalDeepLevel] = useState<number>(1);
  const [callouts, setCallouts] = useState<CalloutItem[]>([]);

  // Hover & Medical Tooltip State
  const [hoveredMuscle, setHoveredMuscle] = useState<MuscleDetail | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);

  const activeLayerMode = externalLayerMode || internalLayerMode;
  const activeDeepLevel = externalDeepLevel !== undefined ? externalDeepLevel : internalDeepLevel;

  // Interaction refs
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const animTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);

  // Normalize highlight maps
  const activeHighlights: Record<string, number> = React.useMemo(() => {
    if (Array.isArray(highlightedMuscles)) {
      const map: Record<string, number> = {};
      highlightedMuscles.forEach((m) => {
        map[m] = 90;
      });
      return map;
    }
    return (highlightedMuscles as Record<string, number>) || {};
  }, [highlightedMuscles]);

  const getMuscleRole = useCallback(
    (muscleId: MuscleGroup): 'primary' | 'secondary' | 'stabilizer' | 'passive' => {
      if (selectedMuscleId === muscleId) return 'primary';
      if (primaryMuscles.includes(muscleId)) return 'primary';
      if (secondaryMuscles.includes(muscleId)) return 'secondary';
      if (stabilizingMuscles.includes(muscleId)) return 'stabilizer';
      if (activeHighlights[muscleId] && activeHighlights[muscleId] > 70) return 'primary';
      if (activeHighlights[muscleId] && activeHighlights[muscleId] > 35) return 'secondary';
      if (activeHighlights[muscleId] && activeHighlights[muscleId] > 0) return 'stabilizer';
      return 'passive';
    },
    [primaryMuscles, secondaryMuscles, stabilizingMuscles, activeHighlights, selectedMuscleId]
  );

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const isGuideTheme = theme === 'weight_training_guide';
    scene.background = new THREE.Color(isGuideTheme ? 0xffffff : 0x060913);

    // 2. Camera
    const containerHeight = typeof height === 'number' ? height : container.clientHeight || 540;
    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / containerHeight, 0.1, 100);
    camera.position.set(0, 0.75, 2.85);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, containerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isGuideTheme ? 1.05 : 1.2;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Medical Lighting Studio
    const ambientLight = new THREE.AmbientLight(0xffffff, isGuideTheme ? 1.0 : 0.75);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, isGuideTheme ? 1.5 : 1.4);
    keyLight.position.set(2.5, 4.0, 3.5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(isGuideTheme ? 0xe2e8f0 : 0x7dd3fc, 0.85);
    fillLight.position.set(-3.0, 2.5, 2.0);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, isGuideTheme ? 0.9 : 1.1);
    rimLight.position.set(0, 3.0, -3.0);
    scene.add(rimLight);

    // 5. Model Root Group
    const modelRoot = new THREE.Group();
    modelRoot.name = 'AnatomySimulationRoot';
    modelRoot.position.set(0, -0.32, 0);
    scene.add(modelRoot);
    modelRootRef.current = modelRoot;

    // 6. Figure 1 (Left / Primary Interactive Figure)
    const figure1 = buildRealisticMusculature();
    figure1.allMusclesGroup.position.set(0, 0, 0);
    figure1.setEquipment(equipment);
    figure1.setMovementKinematics(movementType, 0.0);
    figureStartRef.current = figure1;
    modelRoot.add(figure1.allMusclesGroup);

    // 7. Figure 2 (Right Figure for Dual-Phase Comparison)
    const figure2 = buildRealisticMusculature();
    figure2.allMusclesGroup.position.set(0.65, 0, 0);
    figure2.allMusclesGroup.rotation.y = -0.35;
    figure2.setEquipment(equipment);
    figure2.setMovementKinematics(movementType, 1.0); // Peak contraction
    figurePeakRef.current = figure2;
    modelRoot.add(figure2.allMusclesGroup);

    // 8. Skeleton
    const skeleton = buildRealisticSkeleton(false);
    skeleton.visible = false;
    skeletonGroupRef.current = skeleton;
    modelRoot.add(skeleton);

    // 9. Pointer Drag Rotation & 3D Raycasting Hover Interaction
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let dragStartPos = { x: 0, y: 0 };
    let hasDragged = false;

    const performRaycast = (clientX: number, clientY: number, triggerSelect = false) => {
      if (!container || !cameraRef.current || !modelRootRef.current) return;
      const rect = domEl.getBoundingClientRect();
      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;

      if (mouseX < 0 || mouseX > rect.width || mouseY < 0 || mouseY > rect.height) {
        setHoveredMuscle(null);
        setHoverPosition(null);
        domEl.style.cursor = 'grab';
        return;
      }

      pointer.x = (mouseX / rect.width) * 2 - 1;
      pointer.y = -(mouseY / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, cameraRef.current);
      const intersects = raycaster.intersectObjects(modelRootRef.current.children, true);

      let detectedMuscleId: MuscleGroup | null = null;
      for (const hit of intersects) {
        if (hit.object && hit.object.userData && hit.object.userData.muscleId) {
          detectedMuscleId = hit.object.userData.muscleId;
          break;
        }
      }

      if (detectedMuscleId && MUSCLE_CATALOG[detectedMuscleId]) {
        const detail = MUSCLE_CATALOG[detectedMuscleId];
        setHoveredMuscle(detail);
        setHoverPosition({ x: mouseX, y: mouseY });
        domEl.style.cursor = 'pointer';

        if (triggerSelect && onSelectMuscle) {
          onSelectMuscle(detail);
        }
      } else {
        setHoveredMuscle(null);
        setHoverPosition(null);
        domEl.style.cursor = isDraggingRef.current ? 'grabbing' : 'grab';
      }
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDraggingRef.current = true;
      hasDragged = false;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      dragStartPos = { x: clientX, y: clientY };
      previousMousePositionRef.current = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (isDraggingRef.current) {
        if (!modelRootRef.current) return;
        const deltaX = clientX - previousMousePositionRef.current.x;
        const deltaY = clientY - previousMousePositionRef.current.y;

        if (Math.abs(clientX - dragStartPos.x) > 4 || Math.abs(clientY - dragStartPos.y) > 4) {
          hasDragged = true;
          // Hide floating tooltip while user is actively rotating/orbiting
          setHoveredMuscle(null);
          setHoverPosition(null);
        }

        modelRootRef.current.rotation.y += deltaX * 0.008;
        modelRootRef.current.rotation.x = Math.max(-0.5, Math.min(0.5, modelRootRef.current.rotation.x + deltaY * 0.006));
        previousMousePositionRef.current = { x: clientX, y: clientY };
      } else {
        // Hover raycast when cursor glides over anatomy
        performRaycast(clientX, clientY, false);
      }
    };

    const handlePointerUp = (e: MouseEvent | TouchEvent) => {
      isDraggingRef.current = false;
      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;

      // If clicked without dragging, select and lock muscle
      if (!hasDragged && clientX !== undefined && clientY !== undefined) {
        performRaycast(clientX, clientY, true);
      }
    };

    const handlePointerLeave = () => {
      if (!isDraggingRef.current) {
        setHoveredMuscle(null);
        setHoverPosition(null);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      const zoomFactor = e.deltaY * 0.0012;
      const newZ = Math.max(1.3, Math.min(4.5, cameraRef.current.position.z + zoomFactor));
      cameraRef.current.position.z = newZ;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', handlePointerDown);
    domEl.addEventListener('mouseleave', handlePointerLeave);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    domEl.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);
    domEl.addEventListener('wheel', handleWheel, { passive: false });

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = typeof height === 'number' ? height : container.clientHeight || 540;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 10. Animation Loop & Dynamic 2D/3D Callout Projector (Static Model)
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (autoRotate && modelRootRef.current && !isDraggingRef.current) {
        modelRootRef.current.rotation.y += 0.006;
      }

      // Render Static Three.js Scene
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);

        // Project Medical Callout Leader Lines onto 2D Canvas space (throttled to ~15fps)
        frameCountRef.current = (frameCountRef.current || 0) + 1;
        if (showCallouts && containerRef.current && modelRootRef.current && (frameCountRef.current % 4 === 0 || isDraggingRef.current)) {
          const w = containerRef.current.clientWidth;
          const h = typeof height === 'number' ? height : containerRef.current.clientHeight || 540;

          const targetFigGroup =
            phaseMode === 'dual' && figureStartRef.current
              ? figureStartRef.current.allMusclesGroup
              : modelRootRef.current;

          // Target muscles specific to THIS exercise!
          const targetMusclesToLabel: MuscleGroup[] = [
            ...primaryMuscles,
            ...secondaryMuscles,
            ...targetMuscles,
          ].slice(0, 4);

          // Fallback if none provided
          if (targetMusclesToLabel.length === 0) {
            targetMusclesToLabel.push('anterior_deltoid', 'upper_chest', 'lateral_deltoid', 'serratus_anterior');
          }

          if (selectedMuscleId && !targetMusclesToLabel.includes(selectedMuscleId)) {
            targetMusclesToLabel.unshift(selectedMuscleId);
          }

          const newCallouts: CalloutItem[] = [];

          targetMusclesToLabel.forEach((mId, index) => {
            const anchor = MUSCLE_3D_ANCHORS[mId];
            if (!anchor) return;

            const worldVec = new THREE.Vector3(anchor.x, anchor.y, anchor.z);
            targetFigGroup.localToWorld(worldVec);

            const ndc = worldVec.clone().project(cameraRef.current!);
            const anchorX = (ndc.x * 0.5 + 0.5) * w;
            const anchorY = (-(ndc.y * 0.5) + 0.5) * h;

            const isRightSide = ndc.x > (phaseMode === 'dual' ? -0.2 : 0);
            const labelOffsetY = -60 + index * 36;
            const screenX = isRightSide ? Math.min(w - 180, anchorX + 75) : Math.max(180, anchorX - 85);
            const screenY = Math.max(40, Math.min(h - 40, anchorY + labelOffsetY));

            const role = selectedMuscleId === mId ? 'selected' : getMuscleRole(mId);

            newCallouts.push({
              muscleId: mId,
              label: anchor.label,
              anchorX,
              anchorY,
              screenX,
              screenY,
              role: role === 'passive' ? 'primary' : role,
              visible: ndc.z < 1.0,
            });
          });

          setCallouts(newCallouts);
        }
      }
    };
    animate();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      resizeObserver.disconnect();
      domEl.removeEventListener('mousedown', handlePointerDown);
      domEl.removeEventListener('mouseleave', handlePointerLeave);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      domEl.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      domEl.removeEventListener('wheel', handleWheel);
      renderer.dispose();
    };
  }, [
    height,
    theme,
    phaseMode,
    showCallouts,
    getMuscleRole,
    selectedMuscleId,
    movementType,
    equipment,
    primaryMuscles,
    secondaryMuscles,
    targetMuscles,
  ]);

  // Update Visual Theme & Background Color
  useEffect(() => {
    if (!sceneRef.current || !rendererRef.current) return;
    const isGuideTheme = theme === 'weight_training_guide';
    sceneRef.current.background = new THREE.Color(isGuideTheme ? 0xffffff : 0x060913);
    rendererRef.current.toneMappingExposure = isGuideTheme ? 1.05 : 1.2;
  }, [theme]);

  // Update Exercise Equipment and Kinematics when exercise changes
  useEffect(() => {
    if (figureStartRef.current && figurePeakRef.current) {
      figureStartRef.current.setEquipment(equipment);
      figurePeakRef.current.setEquipment(equipment);

      if (phaseMode === 'dual') {
        figureStartRef.current.setMovementKinematics(movementType, 0.0);
        figurePeakRef.current.setMovementKinematics(movementType, 1.0);
      } else if (phaseMode === 'start') {
        figureStartRef.current.setMovementKinematics(movementType, 0.0);
      } else {
        figureStartRef.current.setMovementKinematics(movementType, 1.0);
      }
    }
  }, [equipment, movementType, phaseMode]);

  // Update Figure Layout based on Phase Mode (Static Atlas Plates)
  useEffect(() => {
    if (!figureStartRef.current || !figurePeakRef.current || !cameraRef.current) return;

    if (phaseMode === 'dual') {
      figureStartRef.current.allMusclesGroup.visible = true;
      figureStartRef.current.allMusclesGroup.position.set(-0.55, 0, 0);
      figureStartRef.current.allMusclesGroup.rotation.y = 0.35;
      figureStartRef.current.setMovementKinematics(movementType, 0.0);

      figurePeakRef.current.allMusclesGroup.visible = true;
      figurePeakRef.current.allMusclesGroup.position.set(0.55, 0, 0);
      figurePeakRef.current.allMusclesGroup.rotation.y = -0.38;
      figurePeakRef.current.setMovementKinematics(movementType, 1.0);

      cameraRef.current.position.set(0, 0.75, 3.1);
    } else if (phaseMode === 'start') {
      figureStartRef.current.allMusclesGroup.visible = true;
      figureStartRef.current.allMusclesGroup.position.set(0, 0, 0);
      figureStartRef.current.allMusclesGroup.rotation.y = 0;
      figureStartRef.current.setMovementKinematics(movementType, 0.0);

      figurePeakRef.current.allMusclesGroup.visible = false;
      cameraRef.current.position.set(0, 0.75, 2.7);
    } else if (phaseMode === 'peak') {
      figureStartRef.current.allMusclesGroup.visible = true;
      figureStartRef.current.allMusclesGroup.position.set(0, 0, 0);
      figureStartRef.current.allMusclesGroup.rotation.y = 0;
      figureStartRef.current.setMovementKinematics(movementType, 1.0);

      figurePeakRef.current.allMusclesGroup.visible = false;
      cameraRef.current.position.set(0, 0.75, 2.7);
    }
  }, [phaseMode, movementType]);

  // Update Materials & Muscle Highlighting
  useEffect(() => {
    const figures = [figureStartRef.current, figurePeakRef.current];

    figures.forEach((fig) => {
      if (!fig) return;

      const isSkeletal = activeLayerMode === 'skeletal';
      fig.allMusclesGroup.visible = !isSkeletal;

      if (!isSkeletal) {
        fig.meshMap.forEach((meshes, mId) => {
          const detail = MUSCLE_CATALOG[mId];
          const isSelected = selectedMuscleId === mId;
          const role = getMuscleRole(mId);

          let isVisible = true;
          if (activeLayerMode === 'deep') {
            const mDeepLvl = detail?.deepLevel || (detail?.layer === 'deep' ? 1 : 0);
            if (detail?.layer !== 'deep' && !isSelected && role === 'passive') {
              isVisible = false;
            } else if (mDeepLvl > activeDeepLevel && !isSelected && role === 'passive') {
              isVisible = false;
            }
          }

          meshes.forEach((mesh) => {
            mesh.visible = isVisible;
            const mat = mesh.material as THREE.MeshStandardMaterial;
            if (!mat) return;

            if (theme === 'weight_training_guide') {
              if (isSelected) {
                mat.color.set('#00f2fe');
                mat.emissive.set('#0284c7');
                mat.emissiveIntensity = 0.8;
              } else if (role === 'primary') {
                mat.color.set('#ea580c');
                mat.emissive.set('#dc2626');
                mat.emissiveIntensity = 0.55;
              } else if (role === 'secondary') {
                mat.color.set('#f97316');
                mat.emissive.set('#ea580c');
                mat.emissiveIntensity = 0.4;
              } else if (role === 'stabilizer') {
                mat.color.set('#fb923c');
                mat.emissive.set('#9a3412');
                mat.emissiveIntensity = 0.25;
              } else {
                mat.color.set('#d4d4d8');
                mat.emissive.set('#000000');
                mat.emissiveIntensity = 0.0;
              }
            } else {
              if (isSelected) {
                mat.color.set('#00f2fe');
                mat.emissive.set('#0284c7');
                mat.emissiveIntensity = 0.8;
              } else if (role === 'primary') {
                mat.color.set('#ff1e56');
                mat.emissive.set('#ff003c');
                mat.emissiveIntensity = 0.6;
              } else if (role === 'secondary') {
                mat.color.set('#f59e0b');
                mat.emissive.set('#d97706');
                mat.emissiveIntensity = 0.45;
              } else if (role === 'stabilizer') {
                mat.color.set('#06b6d4');
                mat.emissive.set('#0891b2');
                mat.emissiveIntensity = 0.4;
              } else {
                const baseColor = detail?.color || '#9e2a2b';
                mat.color.set(baseColor);
                mat.emissive.set('#000000');
                mat.emissiveIntensity = 0.0;
              }
            }
          });
        });
      }
    });

    if (skeletonGroupRef.current) {
      skeletonGroupRef.current.visible = activeLayerMode === 'skeletal' || activeLayerMode === 'composite';
    }
  }, [theme, activeLayerMode, activeDeepLevel, selectedMuscleId, getMuscleRole]);

  // Camera Presets
  const setPresetCamera = (view: 'anterior' | 'lateral' | 'posterior' | 'upper') => {
    if (!cameraRef.current || !modelRootRef.current) return;
    modelRootRef.current.rotation.set(0, 0, 0);

    switch (view) {
      case 'anterior':
        cameraRef.current.position.set(0, 0.75, phaseMode === 'dual' ? 3.1 : 2.7);
        break;
      case 'lateral':
        modelRootRef.current.rotation.y = Math.PI / 2;
        cameraRef.current.position.set(0, 0.75, 2.7);
        break;
      case 'posterior':
        modelRootRef.current.rotation.y = Math.PI;
        cameraRef.current.position.set(0, 0.75, 2.7);
        break;
      case 'upper':
        cameraRef.current.position.set(0, 1.2, 1.85);
        break;
    }
  };

  const handleZoom = (delta: number) => {
    if (!cameraRef.current) return;
    const newZ = Math.max(1.3, Math.min(4.5, cameraRef.current.position.z + delta));
    cameraRef.current.position.z = newZ;
  };

  const handleReset = () => {
    if (!cameraRef.current || !modelRootRef.current) return;
    modelRootRef.current.rotation.set(0, 0, 0);
    cameraRef.current.position.set(0, 0.75, phaseMode === 'dual' ? 3.1 : 2.7);
    setAutoRotate(false);
  };

  const isGuideStyle = theme === 'weight_training_guide';

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden border select-none shadow-2xl flex flex-col transition-colors duration-300 ${
        isGuideStyle
          ? 'bg-white border-slate-200 text-slate-900 shadow-slate-200/80'
          : 'bg-slate-950 border-slate-800 text-white shadow-black'
      }`}
    >
      {/* Top Bar: Visual Theme, Phase View & Callout Toggles */}
      <div
        className={`p-3 sm:p-4 backdrop-blur-md border-b flex flex-wrap items-center justify-between gap-3 z-20 ${
          isGuideStyle ? 'bg-slate-50/90 border-slate-200' : 'bg-slate-900/90 border-slate-800'
        }`}
      >
        {/* Left: Static Atlas Plate Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl border bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setPhaseMode('dual')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              phaseMode === 'dual'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Dual-figure static plate view (Start Setup vs Peak Contraction)"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Dual Plate (Fig A & B)</span>
          </button>

          <button
            onClick={() => setPhaseMode('start')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              phaseMode === 'start'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Figure A: Initial Stance & Setup"
          >
            Figure A (Start)
          </button>

          <button
            onClick={() => setPhaseMode('peak')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              phaseMode === 'peak'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Figure B: Peak Target Contraction"
          >
            Figure B (Peak Contraction)
          </button>
        </div>

        {/* Right: Theme Toggle & Callout Leader Lines Switch */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCallouts(!showCallouts)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              showCallouts
                ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/40'
                : 'bg-transparent text-slate-400 border-slate-300 dark:border-slate-800'
            }`}
            title="Toggle Medical Callout Leader Lines"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Leader Lines</span>
          </button>

          <button
            onClick={() => setTheme(isGuideStyle ? 'dark_slate' : 'weight_training_guide')}
            className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              isGuideStyle
                ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-cyan-400 hover:bg-slate-800'
            }`}
            title="Switch Visual Style Theme"
          >
            {isGuideStyle ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
            <span className="text-[11px] hidden sm:inline">
              {isGuideStyle ? 'Dark Studio' : 'Medical Atlas (White)'}
            </span>
          </button>
        </div>
      </div>

      {/* Static Exercise Plate Sub-header */}
      <div
        className={`px-4 py-2 border-b flex items-center justify-between gap-4 z-20 ${
          isGuideStyle ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}
      >
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
          <Activity className="w-3.5 h-3.5 text-orange-500" />
          <span>
            {phaseMode === 'dual'
              ? `Dual Anatomical Plate • Initial Setup & Target Peak Lockout`
              : phaseMode === 'start'
              ? `Figure A • Initial Stance & Biomechanical Starting Setup`
              : `Figure B • Peak Target Contraction & Muscle Recruitment`}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="font-semibold">{equipment ? `Equipment: ${equipment}` : 'Bodyweight'}</span>
          <span>•</span>
          <span className="text-orange-400 font-bold capitalize">{movementType.replace('_', ' ')}</span>
        </div>
      </div>

      {/* 3D WebGL Canvas */}
      <div
        ref={containerRef}
        className="w-full relative cursor-grab active:cursor-grabbing focus:outline-none"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      />

      {/* Dynamic 3D-to-2D Medical Callout Leader Lines */}
      {showCallouts && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <marker id="dot-marker-orange" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#ea580c" />
            </marker>
            <marker id="dot-marker-cyan" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2.5" fill="#0284c7" />
            </marker>
          </defs>

          {callouts
            .filter((c) => c.visible)
            .map((c) => {
              const isSelected = c.role === 'selected';
              const strokeColor = isSelected ? '#0284c7' : isGuideStyle ? '#334155' : '#cbd5e1';
              const midX = (c.anchorX + c.screenX) / 2;

              return (
                <g key={c.muscleId} className="transition-opacity duration-300">
                  <polyline
                    points={`${c.anchorX},${c.anchorY} ${midX},${c.screenY} ${c.screenX},${c.screenY}`}
                    fill="none"
                    stroke={isSelected ? '#38bdf8' : isGuideStyle ? '#ffffff' : '#000000'}
                    strokeWidth="3.5"
                    strokeOpacity="0.8"
                  />
                  <polyline
                    points={`${c.anchorX},${c.anchorY} ${midX},${c.screenY} ${c.screenX},${c.screenY}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="1.6"
                    markerStart={isSelected ? 'url(#dot-marker-cyan)' : 'url(#dot-marker-orange)'}
                  />
                </g>
              );
            })}
        </svg>
      )}

      {/* Static Anatomical Figure Phase Plaques */}
      {phaseMode === 'dual' ? (
        <>
          <div className="absolute top-4 left-5 px-3.5 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/70 shadow-lg flex items-center gap-2 pointer-events-none z-20">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="text-[11px] font-bold text-slate-200 tracking-wide">Figure A • Initial Stance & Setup</span>
          </div>
          <div className="absolute top-4 right-5 px-3.5 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-orange-500/50 shadow-lg shadow-orange-950/20 flex items-center gap-2 pointer-events-none z-20">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-sm shadow-orange-500/50" />
            <span className="text-[11px] font-bold text-orange-200 tracking-wide">Figure B • Peak Target Contraction</span>
          </div>
        </>
      ) : phaseMode === 'start' ? (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/70 shadow-lg flex items-center gap-2 pointer-events-none z-20">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          <span className="text-[11px] font-bold text-slate-200 tracking-wide">Figure A • Initial Setup & Starting Stance</span>
        </div>
      ) : (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-orange-500/50 shadow-lg shadow-orange-950/20 flex items-center gap-2 pointer-events-none z-20">
          <span className="w-2 h-2 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50" />
          <span className="text-[11px] font-bold text-orange-200 tracking-wide">Figure B • Peak Muscle Contraction & Lockout</span>
        </div>
      )}

      {/* Floating Badges */}
      {showCallouts &&
        callouts
          .filter((c) => c.visible)
          .map((c) => {
            const isSelected = selectedMuscleId === c.muscleId;
            const detail = MUSCLE_CATALOG[c.muscleId];

            return (
              <button
                key={`badge-${c.muscleId}`}
                onClick={() => detail && onSelectMuscle && onSelectMuscle(detail)}
                style={{
                  left: `${c.screenX}px`,
                  top: `${c.screenY - 14}px`,
                  transform: 'translate(0, -50%)',
                }}
                className={`absolute pointer-events-auto px-2.5 py-1 rounded-lg text-xs font-extrabold tracking-wide transition-all shadow-md flex items-center gap-1.5 z-20 ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/30 ring-2 ring-cyan-300 scale-105'
                    : isGuideStyle
                    ? 'bg-white/95 text-slate-900 border border-slate-300 hover:border-orange-500 hover:text-orange-600 shadow-slate-200'
                    : 'bg-slate-900/90 text-white border border-slate-700 hover:border-orange-400 shadow-black'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isSelected ? 'bg-slate-950' : 'bg-orange-500 shadow-sm shadow-orange-500/50 animate-pulse'
                  }`}
                />
                <span>{c.label}</span>
              </button>
            );
          })}

      {/* Refined Floating Medical Anatomy Tooltip */}
      {hoveredMuscle && hoverPosition && (
        <div
          style={{
            left: `${Math.max(12, Math.min(hoverPosition.x + 20, (containerRef.current?.clientWidth || 600) - 340))}px`,
            top: `${Math.max(12, Math.min(hoverPosition.y - 30, (typeof height === 'number' ? height : 540) - 270))}px`,
          }}
          className={`absolute pointer-events-none z-40 w-80 rounded-2xl p-4 shadow-2xl backdrop-blur-xl border transition-all duration-150 animate-in fade-in zoom-in-95 ${
            isGuideStyle
              ? 'bg-white/95 text-slate-900 border-slate-300 shadow-slate-400/30'
              : 'bg-slate-950/95 text-white border-cyan-500/40 shadow-black/80 ring-1 ring-cyan-500/20'
          }`}
        >
          {/* Top Header Bar with Accent Glow */}
          <div className="flex items-start justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 mb-2">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400/50" />
                <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                  {hoveredMuscle.region} • {hoveredMuscle.layer} layer
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                {hoveredMuscle.name}
              </h4>
              <p className="text-[11px] font-serif italic text-slate-500 dark:text-cyan-200/80 mt-0.5">
                {hoveredMuscle.latinName}
              </p>
            </div>

            {/* Exercise Role Badge */}
            {getMuscleRole(hoveredMuscle.id) !== 'passive' && (
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30 flex-shrink-0">
                {getMuscleRole(hoveredMuscle.id) === 'primary'
                  ? 'Agonist'
                  : getMuscleRole(hoveredMuscle.id) === 'secondary'
                  ? 'Synergist'
                  : 'Stabilizer'}
              </span>
            )}
          </div>

          {/* Primary Movement & Function */}
          <div className="space-y-2 text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Activity className="w-3 h-3 text-orange-500" />
                Primary Movement
              </span>
              <p className="text-[11px] text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                {hoveredMuscle.primaryFunction}
              </p>
            </div>

            {/* Origin & Insertion Points */}
            <div className="grid grid-cols-1 gap-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex-shrink-0">Origin:</span>
                <span className="text-slate-600 dark:text-slate-300 leading-tight">
                  {hoveredMuscle.origin}
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-rose-600 dark:text-rose-400 font-bold flex-shrink-0">Insertion:</span>
                <span className="text-slate-600 dark:text-slate-300 leading-tight">
                  {hoveredMuscle.insertion}
                </span>
              </div>
            </div>

            {/* Innervation Pathway */}
            {hoveredMuscle.innervation && (
              <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                <Zap className="w-3 h-3 text-amber-400 flex-shrink-0" />
                <span className="font-semibold text-slate-500 dark:text-slate-300">Nerve:</span>
                <span className="truncate">{hoveredMuscle.innervation}</span>
              </div>
            )}

            {/* Click to Lock Hint */}
            <div className="pt-1.5 flex items-center justify-between text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold border-t border-slate-100 dark:border-slate-800/60">
              <span className="flex items-center gap-1">
                <Crosshair className="w-3 h-3 text-cyan-500" />
                Click muscle to focus details
              </span>
              <span className="text-slate-400 font-mono text-[9px]">Medical Atlas</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      {showControls && (
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-20">
          <div
            className={`flex items-center gap-1 p-1 rounded-2xl border pointer-events-auto shadow-lg backdrop-blur-md ${
              isGuideStyle ? 'bg-white/90 border-slate-200' : 'bg-slate-900/85 border-slate-800'
            }`}
          >
            {(
              [
                { id: 'anterior', label: 'Anterior' },
                { id: 'lateral', label: 'Lateral' },
                { id: 'posterior', label: 'Posterior' },
                { id: 'upper', label: 'Upper' },
              ] as const
            ).map((view) => (
              <button
                key={view.id}
                onClick={() => setPresetCamera(view.id)}
                className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-orange-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                {view.label}
              </button>
            ))}
          </div>

          <div
            className={`flex items-center gap-1.5 p-1 rounded-2xl border pointer-events-auto shadow-lg backdrop-blur-md ${
              isGuideStyle ? 'bg-white/90 border-slate-200' : 'bg-slate-900/85 border-slate-800'
            }`}
          >
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`p-2 rounded-xl text-xs font-bold transition-all ${
                autoRotate
                  ? 'bg-orange-500 text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Toggle 360° Orbit Rotation"
            >
              <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => handleZoom(-0.35)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom(0.35)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              title="Reset View"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Exercise Legend */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center pointer-events-none hidden md:block z-10">
        <span className={`text-[11px] font-bold tracking-wider ${isGuideStyle ? 'text-slate-400' : 'text-slate-600'}`}>
          {exerciseName} • Interactive Kinesiology Model
        </span>
      </div>
    </div>
  );
};
