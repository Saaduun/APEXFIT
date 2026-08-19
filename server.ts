import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// AI Plan Generation Endpoint
app.post('/api/generate-plan', async (req, res) => {
  try {
    const { profile } = req.body;
    if (!profile) {
      return res.status(400).json({ error: 'Profile is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY missing',
        message: 'Using offline deterministic generator.',
      });
    }

    const ai = getAiClient();

    const systemPrompt = `You are an elite, modern sports scientist and martial arts strength & conditioning coach.
Generate a structured, safe, and effective weekly workout plan for a user.

Rules:
1. Focus on the user's specific training mode: Weight Training, Martial Arts, or Hybrid.
2. For HYBRID athletes: Intelligently separate heavy lower-body strength sessions (squats/deadlifts) from high-impact martial arts sparring or kicking by at least 24-48 hours to avoid excessive neural/joint fatigue.
3. Absolutely DO NOT rely on outdated body-type classifications such as ectomorph, mesomorph, or endomorph.
4. Do NOT present medical diagnoses or claim that the AI can prevent injuries.
5. Provide realistic, scientifically grounded exercise parameters, sets, reps/duration, rest periods, technique notes, and safety warnings.
6. Return purely valid JSON following the schema.`;

    const userPrompt = `User Profile:
- Name: ${profile.name || 'Athlete'}
- Training Mode: ${profile.trainingMode}
- Martial Art Practiced: ${profile.martialArt || 'None'}
- Experience Level: ${profile.experienceLevel}
- Primary Goal: ${profile.goal}
- Days Per Week: ${profile.daysPerWeek}
- Session Duration: ${profile.sessionDuration}
- Equipment: ${(profile.equipment || []).join(', ')}
${profile.injuryNotes ? `- Note on physical limitations: ${profile.injuryNotes}` : ''}

Generate a comprehensive weekly plan with exactly ${profile.daysPerWeek} sessions.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weeklyOverview: {
              type: Type.STRING,
              description: 'Executive summary of the weekly training structure and energy systems targeted.',
            },
            recoveryGuideline: {
              type: Type.STRING,
              description: 'Clear recovery and hydration guidance for this specific split.',
            },
            sessions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  dayIndex: { type: Type.INTEGER, description: '0 for Mon to 6 for Sun' },
                  dayName: { type: Type.STRING },
                  title: { type: Type.STRING },
                  sessionType: {
                    type: Type.STRING,
                    description: 'Gym Strength, Martial Arts, Hybrid Conditioning, or Active Recovery',
                  },
                  durationMin: { type: Type.INTEGER },
                  difficulty: { type: Type.STRING, description: 'Easy, Moderate, Demanding, or High Intensity' },
                  focusCategories: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  purpose: { type: Type.STRING },
                  safetyNotes: { type: Type.STRING },
                  hybridRecoveryAdvice: { type: Type.STRING },
                  exercises: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        exerciseId: { type: Type.STRING },
                        sets: { type: Type.INTEGER },
                        repsOrDuration: { type: Type.STRING },
                        restPeriodSec: { type: Type.INTEGER },
                        notes: { type: Type.STRING },
                      },
                      required: ['exerciseId', 'sets', 'repsOrDuration', 'restPeriodSec'],
                    },
                  },
                },
                required: ['dayIndex', 'dayName', 'title', 'sessionType', 'durationMin', 'purpose', 'exercises', 'safetyNotes'],
              },
            },
          },
          required: ['weeklyOverview', 'recoveryGuideline', 'sessions'],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || '{}');
    return res.json({
      plan: {
        id: `ai_plan_${Date.now()}`,
        createdAt: new Date().toISOString(),
        generatedByAi: true,
        userGoal: profile.goal,
        ...parsedJson,
      },
    });
  } catch (err: any) {
    console.error('Error generating AI plan:', err);
    return res.status(500).json({ error: 'Failed to generate AI plan', details: err.message });
  }
});

// AI Coach Assistant Endpoint
app.post('/api/ai-coach-chat', async (req, res) => {
  try {
    const { messages, userContext } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        reply:
          "I am your Gym & Martial Arts AI Coach! To enable live generative AI responses, ensure your GEMINI_API_KEY is active. In the meantime, you can explore the 3D Anatomy Laboratory, Biomechanics guide, and intelligent training generator.",
      });
    }

    const ai = getAiClient();

    const systemPrompt = `You are a certified Strength & Conditioning Specialist (CSCS) and Martial Arts Performance Coach.
You provide clear, beginner-friendly, science-backed guidance on:
- Weight training technique & programming
- Martial arts conditioning (Boxing, Kickboxing, Muay Thai, BJJ, Wrestling, MMA)
- Muscle anatomy and joint biomechanics
- Safe athletic recovery & sleep hygiene
- Non-restrictive, healthy athletic nutrition and hydration

CRITICAL SAFETY & MEDICAL RULES:
1. You MUST NEVER diagnose injuries, prescribe medical treatments, or claim to prevent injuries.
2. If a user describes acute, persistent joint pain, dizziness, fainting, shortness of breath, numbness, or head trauma/concussion symptoms, tell them clearly and immediately to stop physical activity and consult a qualified healthcare professional.
3. Label all biomechanical values and activation numbers as educational estimates.
4. Keep answers friendly, motivating, concise, and structured with bullet points.`;

    const formattedContents = messages.map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: formattedContents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    return res.json({ reply: response.text });
  } catch (err: any) {
    console.error('AI Coach Chat error:', err);
    return res.status(500).json({ error: 'Failed to process AI chat', details: err.message });
  }
});

// Mount Vite in dev mode or serve static files in production
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
