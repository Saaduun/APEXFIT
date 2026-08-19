import React, { useState } from 'react';
import { NUTRITION_TOPICS, NutritionTopic } from '../data/nutritionData';
import { Utensils, Droplet, Flame, ShieldCheck, Apple, Fish, Wheat, Sparkles } from 'lucide-react';

export const NutritionScreen: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<NutritionTopic>(NUTRITION_TOPICS[0]);
  const [bodyWeightKg, setBodyWeightKg] = useState<number>(75);
  const [trainingHours, setTrainingHours] = useState<number>(1.0);

  // Daily baseline water calculation: ~35ml per kg + ~500-750ml per training hour
  const calculatedWaterLiters = (
    (bodyWeightKg * 0.035) +
    (trainingHours * 0.7)
  ).toFixed(1);

  const categories = ['Fueling', 'Macronutrients', 'Hydration', 'Recovery'];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
          Performance Fueling & Recovery
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Athletic Nutrition & Hydration
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-xl">
          Evidence-based athletic fueling principles. Designed for sustained energy, muscle repair, and combat resilience without harmful calorie restriction or crash diets.
        </p>
      </div>

      {/* Hydration Estimator Interactive Widget */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-cyan-400">
          <Droplet className="w-5 h-5" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Hydration & Sweat Loss Estimator
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Body Weight (kg)
            </label>
            <input
              type="number"
              value={bodyWeightKg}
              onChange={(e) => setBodyWeightKg(Math.max(40, Math.min(150, parseFloat(e.target.value) || 75)))}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Daily Training Duration (Hours)
            </label>
            <input
              type="number"
              step="0.5"
              value={trainingHours}
              onChange={(e) => setTrainingHours(Math.max(0, Math.min(6, parseFloat(e.target.value) || 1)))}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-white font-mono"
            />
          </div>

          <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-center">
            <span className="text-xs text-cyan-300 font-medium block">
              Estimated Daily Fluid Target
            </span>
            <span className="text-3xl font-extrabold text-white font-mono mt-0.5 block">
              {calculatedWaterLiters} Liters
            </span>
            <span className="text-[10px] text-cyan-400/80 mt-1 block">
              Includes water + electrolytes during sparring
            </span>
          </div>
        </div>
      </div>

      {/* Main Educational Cards Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Topic Selector */}
        <div className="lg:col-span-4 space-y-2.5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Nutrition Educational Topics
          </h3>
          {NUTRITION_TOPICS.map((topic) => {
            const isSelected = selectedTopic.id === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic)}
                className={`w-full p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500 text-white shadow-lg shadow-emerald-950/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-slate-800 font-semibold block w-max mb-1">
                  {topic.category}
                </span>
                <h4 className="text-sm font-bold text-white">{topic.title}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                  {topic.summary}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right: Topic Detailed Card */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                {selectedTopic.category}
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-1">
                {selectedTopic.title}
              </h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {selectedTopic.summary}
              </p>
            </div>

            {/* Key Highlights */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Key Nutritional Principles
              </span>
              <div className="space-y-1.5">
                {selectedTopic.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Food Examples */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Recommended Nutrient-Dense Sources
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedTopic.foodExamples.map((food, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{food.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{food.portionNote}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {food.benefits}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety & Educational Disclaimer */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-slate-300">Educational Notice:</strong> Nutrition guidance is provided for general health, energy optimization, and sports recovery. Individuals with clinical medical conditions or specific dietary restrictions should consult a registered dietitian or medical specialist.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
