export interface NutritionTopic {
  id: string;
  title: string;
  summary: string;
  category: 'Fueling' | 'Macronutrients' | 'Hydration' | 'Recovery';
  highlights: string[];
  foodExamples: { name: string; portionNote: string; benefits: string }[];
  preCombatTip?: string;
  postCombatTip?: string;
}

export const NUTRITION_TOPICS: NutritionTopic[] = [
  {
    id: 'protein_foundations',
    title: 'Protein for Muscle Repair & Joint Recovery',
    summary: 'Protein provides essential amino acids needed to rebuild muscle tissue broken down during resistance training and withstand martial arts impact.',
    category: 'Macronutrients',
    highlights: [
      'Aim for a consistent distribution of protein throughout the day (e.g. 20–40g per meal).',
      'Combine diverse sources to ensure a complete essential amino acid profile.',
      'Supports muscle protein synthesis, tendon health, and immune system function.',
    ],
    foodExamples: [
      { name: 'Eggs & Egg Whites', portionNote: '2-3 whole eggs or 1 cup whites', benefits: 'High bioavailability, choline for neural firing' },
      { name: 'Chicken Breast / Turkey', portionNote: '120g - 180g cooked', benefits: 'Lean source of complete amino acids, zinc, niacin' },
      { name: 'Greek Yogurt / Cottage Cheese', portionNote: '200g (approx 1 cup)', benefits: 'Slow-digesting casein + whey, calcium for bone density' },
      { name: 'Tofu, Tempeh & Edamame', portionNote: '150g - 200g', benefits: 'Plant-based complete protein, isoflavones, iron' },
      { name: 'Lentils, Chickpeas & Black Beans', portionNote: '1 cup cooked', benefits: 'Plant protein paired with prebiotic fiber and magnesium' },
      { name: 'Wild Salmon & Mackerel', portionNote: '140g - 180g', benefits: 'High protein plus anti-inflammatory Omega-3 fatty acids' },
    ],
  },
  {
    id: 'carbohydrates_energy',
    title: 'Carbohydrates: High-Intensity Glycogen Fuel',
    summary: 'Carbohydrates are the primary fuel source for fast-twitch muscle contractions, explosive striking, heavy compound lifting, and intense sparring rounds.',
    category: 'Macronutrients',
    highlights: [
      'Complex carbohydrates provide sustained, slow-release energy for long training days.',
      'Simple, easily digestible carbohydrates replenish muscle glycogen quickly post-workout.',
      'Adequate carbohydrates preserve muscle tissue by preventing protein from being used as fuel.',
    ],
    foodExamples: [
      { name: 'Rolled / Steel Cut Oats', portionNote: '1/2 to 1 cup dry', benefits: 'Sustained energy, beta-glucan soluble fiber' },
      { name: 'Brown / Jasmine / Basmati Rice', portionNote: '1 cup cooked', benefits: 'Easy on the digestive tract before tough training sessions' },
      { name: 'Sweet Potatoes & Yams', portionNote: '1 medium baked', benefits: 'Rich in potassium, beta-carotene, and complex starch' },
      { name: 'Bananas & Berries', portionNote: '1 banana or 1 cup berries', benefits: 'Quick glucose + fructose for fast glycogen top-off and antioxidants' },
      { name: 'Quinoa & Whole Grain Pasta', portionNote: '1 cup cooked', benefits: 'Complex carbs with trace minerals (iron, magnesium)' },
    ],
  },
  {
    id: 'healthy_fats',
    title: 'Healthy Fats for Hormonal & Cellular Health',
    summary: 'Fats are vital for steroid hormone production (such as testosterone), nerve myelination, cellular membrane integrity, and fat-soluble vitamin absorption (A, D, E, K).',
    category: 'Macronutrients',
    highlights: [
      'Focus on unsaturated fats, monounsaturated oils, and omega-3 polyunsaturated fatty acids.',
      'Avoid high-fat meals immediately before intense sparring to prevent gastrointestinal sluggishness.',
    ],
    foodExamples: [
      { name: 'Extra Virgin Olive Oil', portionNote: '1-2 tablespoons', benefits: 'Oleic acid, polyphenols that reduce systemic inflammation' },
      { name: 'Avocados', portionNote: '1/2 to 1 avocado', benefits: 'Monounsaturated fats, potassium to prevent muscle cramps' },
      { name: 'Walnuts, Almonds & Chia Seeds', portionNote: '1 handful (30g)', benefits: 'Plant ALA Omega-3s, vitamin E for antioxidant defense' },
    ],
  },
  {
    id: 'hydration_electrolytes',
    title: 'Hydration & Electrolyte Management',
    summary: 'Water loss of even 2% of body weight degrades reaction time, punching power, and thermal regulation. Martial arts sparring and heavy lifting generate significant fluid loss.',
    category: 'Hydration',
    highlights: [
      'Drink 500ml of water upon waking to rehydrate after sleep.',
      'Sip fluids regularly during sessions (approx 150-250ml every 15-20 minutes of intense sweating).',
      'Replenish electrolytes (sodium, potassium, magnesium) during hot, heavy sweat sessions.',
    ],
    foodExamples: [
      { name: 'Mineral Water with Pinch of Sea Salt', portionNote: '500ml bottle', benefits: 'Restores extracellular sodium and fluid balance' },
      { name: 'Coconut Water', portionNote: '250ml - 300ml', benefits: 'Natural potassium and easily absorbed electrolytes' },
      { name: 'Watermelon & Cucumber', portionNote: '1 bowl sliced', benefits: 'High water volume with citrulline for nitric oxide support' },
    ],
  },
  {
    id: 'pre_training_meals',
    title: 'Pre-Training Fueling Strategy',
    summary: 'Fuel your sessions to maintain high energy levels without feeling heavy, bloated, or sluggish on the mats or in the squat rack.',
    category: 'Fueling',
    highlights: [
      '2–3 hours before: Balanced meal of moderate protein, complex carbs, low fat, and low fiber.',
      '30–45 minutes before (optional): Quick carbohydrate snack (e.g. banana, rice cake with honey).',
    ],
    foodExamples: [
      { name: 'Oatmeal with Whey Protein & Sliced Banana', portionNote: '1 bowl, 2 hours before', benefits: 'Smooth energy release without stomach distress' },
      { name: 'Grilled Chicken, White Rice & Steamed Zucchini', portionNote: 'Moderate portion, 2.5 hours before', benefits: 'Clean glycogen storage and amino acids' },
      { name: 'Whole Grain Toast with Natural Honey & Handful of Berries', portionNote: '45 mins before', benefits: 'Fast-acting glucose for explosive sparring rounds' },
    ],
  },
  {
    id: 'post_training_recovery',
    title: 'Post-Training Recovery & Rebuilding',
    summary: 'Optimize the recovery window after demanding gym lifts and martial arts sessions to accelerate glycogen resynthesis and muscle protein repair.',
    category: 'Recovery',
    highlights: [
      'Consume 25–40g of quality protein combined with 40–80g of carbohydrates within 1–2 hours after training.',
      'Rehydrate with fluids and electrolytes to replace sweat loss.',
    ],
    foodExamples: [
      { name: 'Whey / Plant Protein Smoothie with Berries & Oats', portionNote: '1 large smoothie', benefits: 'Rapid amino acid delivery and glycogen replenishment' },
      { name: 'Salmon Bowl with Jasmine Rice & Avocado', portionNote: 'Full balanced meal', benefits: 'Omega-3 anti-inflammatory fats, protein, clean carbohydrates' },
    ],
  },
];
