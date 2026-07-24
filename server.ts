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

// Plant Doctor AI Chat API
app.post('/api/gemini/doctor', async (req, res) => {
  try {
    const { message, plantName, plantSpecies, history } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback mock response if API key is not yet set
      return res.json({
        reply: `As a digital plant doctor for ${plantName || 'your plant'} (${plantSpecies || 'Botanic'}), I recommend inspecting soil moisture 2 inches deep and ensuring bright, indirect light.`
      });
    }

    const systemInstruction = `You are a warm, highly expert botanical doctor and plant care specialist named 'PlantAI Doctor' inside PlantCare Pro. 
The user is asking about their plant: ${plantName || 'Monty'} (${plantSpecies || 'Monstera Deliciosa'}).
Give accurate, clear, actionable advice on plant health, watering, light requirements, pest control, and humidity. Keep responses conversational and structured with bullet points if helpful.`;

    const chat = ai.chats.create({
      model: 'gemini-3.6-flash',
      config: {
        systemInstruction
      }
    });

    if (Array.isArray(history)) {
      for (const h of history) {
        if (h.sender === 'user') {
          await chat.sendMessage({ message: h.text });
        }
      }
    }

    const response = await chat.sendMessage({ message: message || 'How is my plant doing?' });
    res.json({ reply: response.text || 'I have analyzed your plant query. Everything looks on track!' });
  } catch (error: any) {
    console.error('Error in Plant Doctor API:', error);
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
