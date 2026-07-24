import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const serverDirname = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

const app = express();
const PORT = 3001;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client server-side
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Plant Doctor AI Chat API (NVIDIA Nemotron Model)
app.post('/api/gemini/doctor', async (req, res) => {
  try {
    const { message, plantName, plantSpecies, history } = req.body;
    const apiKey = process.env.LLM_API_KEY || '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';

    const systemPrompt = `You are PlantAI Doctor, an expert botanical specialist in PlantCare.
The user is asking about their plant: ${plantName || 'Monty'} (${plantSpecies || 'Monstera Deliciosa'}).
STRICT DOMAIN SCOPING RULE: You ONLY answer questions related to plants, botanical health, gardening, soil, watering, sunlight, plant care, pests, vegetation, and agriculture.
If the user asks about ANY unrelated topic (such as general programming, sports, movies, mathematics, personal finance, or non-botanical topics), politely decline by stating: "I am PlantAI Doctor, specialized exclusively in plant care, botanical diagnostics, and gardening. I cannot assist with non-plant topics."

For plant-related queries, structure responses concisely as:
**Why:** Cause / Explanation (1-2 sentences)
**What:** Diagnosis or Observation
**How:** Actionable steps (numbered, specific)`;

    const messages: any[] = [{ role: 'system', content: systemPrompt }];

    if (Array.isArray(history)) {
      for (const h of history) {
        messages.push({
          role: h.sender === 'user' ? 'user' : 'assistant',
          content: h.text || h.content || ''
        });
      }
    }

    messages.push({ role: 'user', content: message || 'How is my plant doing?' });

    const candidateModels = [
      'nvidia/nemotron-3-nano-30b-a3b',
      'nvidia/llama-3.1-nemotron-70b-instruct',
      'meta/llama-3.3-70b-instruct',
      'nvidia/nemotron-4-340b-instruct'
    ];

    let lastError = null;
    let replyText = '';

    for (const modelName of candidateModels) {
      try {
        const nvResponse = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: modelName,
            messages,
            temperature: 0.7,
            top_p: 0.95,
            max_tokens: 4096
          })
        });

        if (nvResponse.ok) {
          const nvData = await nvResponse.json();
          const choice = nvData.choices?.[0];
          replyText = choice?.message?.content || choice?.message?.reasoning_content || '';
          if (replyText) break;
        } else {
          const errText = await nvResponse.text();
          lastError = `Model ${modelName} (${nvResponse.status}): ${errText}`;
        }
      } catch (err: any) {
        lastError = err.message;
      }
    }

    if (!replyText) {
      throw new Error(lastError || 'Failed to receive response from NVIDIA API candidate models');
    }

    res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Error in NVIDIA Plant Doctor API:', error);
    res.status(500).json({
      error: 'Failed to process AI Plant Doctor request',
      details: error.message
    });
  }
});

// Plant Identification AI API
app.post('/api/gemini/identify', async (req, res) => {
  try {
    const { imageBase64, mimeType, description } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback response if no API key
      return res.json({
        matches: [
          {
            species: 'Monstera deliciosa',
            commonName: 'Swiss Cheese Plant',
            confidence: 98,
            tags: ['Tropical', 'Climbing'],
            photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4pCGpENBOqU1X91S7MW4VB7gSBg9O1cwvp1kDMvWSmzZegP7t7vE9-34ru9fkMzdruWw-oSkWqwjyKe73nuOt6u080dG-EDI52k8b0pkeeAl2SFceoiXCFmSSknsWrWyWYe7WUivwiyKmGjHIwRZWH0UIYRXgZouw5K-vc-3AkOn_1rAi_BYjs_uRQEjFIvsaom3n2DEikfnPk4l4XCMCbfzt22fovIbhYXzP3D6BOuzS5s1d8ByAZuZQpRNx40kHL-g9fctPlEI',
            description: 'Identified based on split leaves (fenestrations) and waxy tropical foliage.'
          }
        ]
      });
    }

    const parts: any[] = [];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: imageBase64.replace(/^data:image\/\w+;base64,/, '')
        }
      });
    }
    parts.push({
      text: description || 'Identify this plant specimen. Return the top species matches with scientific name, common name, confidence percentage (0-100), brief description, and care tags.'
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matches: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  species: { type: Type.STRING },
                  commonName: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  description: { type: Type.STRING }
                },
                required: ['species', 'commonName', 'confidence', 'description']
              }
            }
          },
          required: ['matches']
        }
      }
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in Plant Identify API:', error);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PlantCare Pro server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
