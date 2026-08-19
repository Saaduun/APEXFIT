import React, { useState } from 'react';
import { AnatomyViewer3D } from './AnatomyViewer3D';
import { MUSCLE_CATALOG } from '../data/anatomyData';
import { EXERCISE_DATABASE } from '../data/exerciseDatabase';
import { MuscleDetail, MuscleGroup, Exercise, AnatomyLayerMode } from '../types';
import {
  Search,
  Dumbbell,
  Swords,
  Sparkles,
  Info,
  Activity,
  Layers,
  Sliders,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  RotateCw,
} from 'lucide-react';

export const AnatomyScreen: React.FC = () => {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleDetail>(
    MUSCLE_CATALOG.chest
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [activeBiomechanicsExercise, setActiveBiomechanicsExercise] = useState<Exercise>(
    EXERCISE_DATABASE[0] // Incline Barbell Bench Press
  );
  const [activeTab, setActiveTab] = useState<'atlas' | 'biomechanics'>('atlas');
  const [layerMode, setLayerMode] = useState<AnatomyLayerMode>('muscular');
  const [deepLevel, setDeepLevel] = useState<number>(1);

  const muscleList = Object.values(MUSCLE_CATALOG);

  const filteredMuscles = muscleList.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.latinName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.primaryFunction.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.origin && m.origin.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.insertion && m.insertion.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRegion = selectedRegion === 'All' || m.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const regions = ['All', 'Upper Body', 'Core', 'Lower Body', 'Arms'];

  // Identify primary, secondary, and stabilizing muscles for the active exercise
  const primaryMuscles: MuscleGroup[] = activeBiomechanicsExercise.primaryMuscles || activeBiomechanicsExercise.targetMuscles || [];
  const secondaryMuscles: MuscleGroup[] = activeBiomechanicsExercise.secondaryMuscles || [];
  const stabilizingMuscles: MuscleGroup[] = activeBiomechanicsExercise.stabilizingMuscles || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Mode Switch */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
            Medical Atlas & Kinetic Laboratory
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            3D Human Anatomy & Biomechanics
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Medical-grade 3D anatomical visualization. Inspect superficial & deep muscle bellies, tendons, osteological structures, and combat transfer.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-lg">
          <button
            onClick={() => setActiveTab('atlas')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'atlas'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3D Anatomical Atlas
          </button>
          <button
            onClick={() => setActiveTab('biomechanics')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'biomechanics'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Exercise Biomechanics Lab
          </button>
        </div>
      </div>

      {activeTab === 'atlas' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: 3D Interactive WebGL Anatomy Model */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 shadow-2xl space-y-3">
              {/* Header info bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400/50" />
                  <span className="text-xs font-bold text-white">
                    Inspecting: {selectedMuscle.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-slate-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800 font-semibold">
                    {selectedMuscle.region}
                  </span>
                  <span className="text-cyan-300 bg-cyan-950/50 px-2.5 py-1 rounded-full border border-cyan-800/40 font-semibold">
                    {selectedMuscle.layer === 'deep' ? `Deep Layer (L${selectedMuscle.deepLevel || 1})` : 'Superficial'}
                  </span>
                </div>
              </div>

              {/* 3D Anatomical Viewer */}
              <AnatomyViewer3D
                height={520}
                selectedMuscleId={selectedMuscle.id}
                onSelectMuscle={(m) => m && setSelectedMuscle(m)}
                layerMode={layerMode}
                onLayerChange={setLayerMode}
                deepLevel={deepLevel}
                onDeepLevelChange={setDeepLevel}
                showControls={true}
              />
            </div>

            {/* Muscle Quick Context Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5" /> Resistance Training
                </span>
                <ul className="space-y-1 text-xs text-slate-300">
                  {selectedMuscle.keyExercises.map((ex, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5" /> Martial Arts Application
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedMuscle.martialArtsRelevance}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Medical Encyclopedia & Muscle Directory */}
          <div className="lg:col-span-5 space-y-4">
            {/* Selected Muscle Deep-Dive Card */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase block tracking-wider">
                  {selectedMuscle.latinName}
                </span>
                <h2 className="text-2xl font-extrabold text-white mt-1">
                  {selectedMuscle.name}
                </h2>
              </div>

              {/* Origin, Insertion & Innervation Medical Block */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-2.5 text-xs">
                <div>
                  <span className="font-bold text-rose-400 block mb-0.5">Origin (Proximal Attachment):</span>
                  <p className="text-slate-300 leading-relaxed">
                    {selectedMuscle.origin || 'Anatomical proximal skeletal landmark'}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-900">
                  <span className="font-bold text-cyan-400 block mb-0.5">Insertion (Distal Attachment):</span>
                  <p className="text-slate-300 leading-relaxed">
                    {selectedMuscle.insertion || 'Distal tendon insertion on bone'}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-900">
                  <span className="font-bold text-amber-400 block mb-0.5">Innervation (Nerve Pathway):</span>
                  <p className="text-slate-300 font-mono text-[11px] leading-relaxed">
                    {selectedMuscle.innervation || 'Spinal nerve roots'}
                  </p>
                </div>
              </div>

              {/* Function & Vectors */}
              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <span className="font-bold text-slate-300 block mb-1">Primary Kinesiological Action:</span>
                  <p className="text-slate-400 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    {selectedMuscle.primaryFunction}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-slate-300 block mb-1">Movement Vectors:</span>
                  <div className="space-y-1">
                    {selectedMuscle.mainMovements.map((move, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800/60"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                        <span>{move}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Muscle Search & Directory List */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Anatomical Muscle Directory ({filteredMuscles.length})
              </h3>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search muscle name, Latin term, or attachment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500"
                />
              </div>

              {/* Region Filter Chips */}
              <div className="flex flex-wrap gap-1.5">
                {regions.map((reg) => (
                  <button
                    key={reg}
                    onClick={() => setSelectedRegion(reg)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                      selectedRegion === reg
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {reg}
                  </button>
                ))}
              </div>

              {/* Scrollable Muscle List */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {filteredMuscles.map((muscle) => {
                  const isSelected = selectedMuscle.id === muscle.id;
                  return (
                    <button
                      key={muscle.id}
                      onClick={() => setSelectedMuscle(muscle)}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-md'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-white block">{muscle.name}</span>
                        <span className="text-[10px] text-slate-500 italic">{muscle.latinName}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {muscle.region}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Biomechanics Panel View with Live 3D Model Integration */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Exercise Biomechanics Selector */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Select Exercise for Biomechanical Analysis
            </h3>
            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {EXERCISE_DATABASE.map((ex) => {
                const isSelected = activeBiomechanicsExercise.id === ex.id;
                return (
                  <button
                    key={ex.id}
                    onClick={() => setActiveBiomechanicsExercise(ex)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-500 text-white shadow-lg shadow-cyan-950/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800 font-semibold">
                        {ex.category}
                      </span>
                      <span className="text-[10px] text-slate-500">{ex.difficulty}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{ex.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {ex.biomechanics.primaryForcePlane}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: 3D Visualization + Detailed Biomechanical Breakdown Card */}
          <div className="lg:col-span-8 space-y-6">
            {/* 3D Anatomical Viewer highlighting active exercise muscle roles */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 shadow-2xl space-y-3">
              <div className="flex items-center justify-between px-1">
                <div>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                    Interactive Muscle Recruitment & Joint Vector Kinematics
                  </span>
                  <h3 className="text-base font-bold text-white">
                    {activeBiomechanicsExercise.name}
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {activeBiomechanicsExercise.subCategory}
                </span>
              </div>

              <AnatomyViewer3D
                height={420}
                primaryMuscles={primaryMuscles}
                secondaryMuscles={secondaryMuscles}
                stabilizingMuscles={stabilizingMuscles}
                activeBiomechanics={activeBiomechanicsExercise.biomechanics}
                layerMode={layerMode}
                onLayerChange={setLayerMode}
                deepLevel={deepLevel}
                onDeepLevelChange={setDeepLevel}
                showControls={true}
              />
            </div>

            {/* Detailed Biomechanical Analysis Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium">Joint Movement & Articulation:</span>
                  <p className="text-white font-semibold leading-relaxed">
                    {activeBiomechanicsExercise.biomechanics.jointMovement}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium">Range of Motion (ROM):</span>
                  <p className="text-white font-semibold leading-relaxed">
                    {activeBiomechanicsExercise.biomechanics.rangeOfMotion}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium">Body Stance & Position:</span>
                  <p className="text-white font-semibold leading-relaxed">
                    {activeBiomechanicsExercise.biomechanics.bodyPosition}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium">Primary Force Vector Plane:</span>
                  <p className="text-white font-semibold leading-relaxed">
                    {activeBiomechanicsExercise.biomechanics.primaryForcePlane}
                  </p>
                </div>
              </div>

              {/* Muscles Involved Breakdown with Visual Role Chips */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Recruited Anatomical Musculature by Functional Tier
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1.5">
                    <span className="text-rose-400 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      Primary Movers (Agonists)
                    </span>
                    <ul className="space-y-1 list-disc pl-4 text-slate-300">
                      {primaryMuscles.map((mId, i) => (
                        <li key={i}>{MUSCLE_CATALOG[mId]?.name || mId}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1.5">
                    <span className="text-amber-300 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Secondary (Synergists)
                    </span>
                    <ul className="space-y-1 list-disc pl-4 text-slate-300">
                      {secondaryMuscles.map((mId, i) => (
                        <li key={i}>{MUSCLE_CATALOG[mId]?.name || mId}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-1.5">
                    <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      Joint Stabilizers
                    </span>
                    <ul className="space-y-1 list-disc pl-4 text-slate-300">
                      {stabilizingMuscles.map((mId, i) => (
                        <li key={i}>{MUSCLE_CATALOG[mId]?.name || mId}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Educational Disclaimer */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  <strong className="text-slate-300">Biomechanical Modeling:</strong> All joint angle ranges, kinetic vector trajectories, and muscle recruitment tiers are calibrated to peer-reviewed kinesiology principles for educational purposes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
