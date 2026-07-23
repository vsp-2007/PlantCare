# PlantCare Backend API

FastAPI backend for the PlantCare plant management application.

## Features

- **Plant Management**: CRUD operations for plants with species info, photos, locations
- **Care Logging**: Track watering, fertilizing, pruning, repotting, inspections, moves
- **AI Chat Doctor**: LLM-powered plant health consultations with streaming responses
- **Species Identification**: Kindwise API integration for plant identification
- **Weather Integration**: WeatherAPI.com for location-based weather data
- **Smart Insights**: AI-powered survival scoring, stress prediction, emergency rescue, growth forecasting
- **Milestone Tracking**: Automatic and manual plant milestones
- **Plant Passport**: Complete export of plant history

## Quick Start

### Local Development

```bash
cd backend

# 1. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy environment template and fill in your API keys
cp .env.example .env
# Edit .env with your keys:
# - WEATHERAPI_KEY (from weatherapi.com)
# - KINDWISE_KEY (from crop.kindwise.com)
# - LLM_API_KEY (your OpenAI-compatible API key)

# 4. Initialize database and seed species data
python -c "from app.database import init_db; init_db()"
python seed_data.py

# 5. Run development server
uvicorn app.main:app --reload --port 3000
```

API available at: http://localhost:3000
Interactive docs: http://localhost:3000/docs

### Docker (Recommended for Evaluation)

```bash
# From project root
cp backend/.env.example .env
# Edit .env with your API keys

docker compose up --build
```

Backend runs at: http://localhost:3000

## API Endpoints

### Plants
- `GET /api/v1/plants` - List all plants
- `POST /api/v1/plants` - Create plant (multipart/form-data with optional photo)
- `GET /api/v1/plants/{id}` - Get plant details
- `PUT /api/v1/plants/{id}` - Update plant
- `DELETE /api/v1/plants/{id}` - Delete plant

### Species
- `GET /api/v1/species` - List species (paginated)
- `GET /api/v1/species/search?q=` - Search species by name

### Care Logs
- `GET /api/v1/plants/{id}/care` - Paginated care history
- `POST /api/v1/plants/{id}/care` - Add care entry (auto-creates milestones)

### Chat Doctor
- `GET /api/v1/plants/{id}/chat` - Chat history
- `POST /api/v1/plants/{id}/chat` - Send message (non-streaming)
- `POST /api/v1/plants/{id}/chat/stream` - Send message (SSE streaming)

### Milestones
- `GET /api/v1/plants/{id}/milestones` - Get milestones
- `POST /api/v1/plants/{id}/milestones` - Add custom milestone

### Vision (Kindwise)
- `POST /api/v1/vision/identify` - Identify plant from base64 image

### Weather
- `GET /api/v1/weather/current?lat=&lon=` - Current + 3-day forecast

### AI Insights
- `POST /api/v1/ai/survival-score` - Get survival score (0-100)
- `POST /api/v1/ai/stress-prediction` - Predict stress risks
- `POST /api/v1/ai/emergency-rescue` - Get rescue steps for symptoms
- `POST /api/v1/ai/growth-forecast` - Predict growth milestones

### Plant Passport
- `GET /api/v1/plants/{id}/passport` - Complete plant history export

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `WEATHERAPI_KEY` | Yes | WeatherAPI.com key (100k/mo free) |
| `KINDWISE_KEY` | Yes | Kindwise Crop API key (10/mo free) |
| `LLM_API_KEY` | Yes | OpenAI-compatible API key |
| `LLM_BASE_URL` | No | Default: `https://api.openai.com/v1` |
| `LLM_MODEL` | No | Default: `gpt-4o-mini` |
| `DATABASE_URL` | No | Default: `sqlite:///./plantcare.db` |
| `PORT` | No | Default: `3000` |

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app factory
│   ├── database.py          # SQLAlchemy setup
│   ├── models.py            # Database models
│   ├── schemas.py           # Pydantic schemas
│   ├── api/
│   │   └── routes.py        # All API endpoints
│   └── services/
│       ├── kindwise.py      # Plant identification
│       ├── weather.py       # Weather data
│       └── llm.py           # AI chat & insights
├── data/
│   └── species.json         # 20+ common houseplants
├── seed_data.py             # Database seeder
├── requirements.txt
├── Dockerfile
├── .env.example
└── README.md
```

## API Keys Setup

1. **WeatherAPI**: Sign up at https://www.weatherapi.com/ → My Account → API Key
2. **Kindwise**: Sign up at https://crop.kindwise.com/ → Demo → Get API Key (10 requests/month free)
3. **LLM**: Any OpenAI-compatible endpoint (OpenAI, Groq, OpenRouter, local llama.cpp, etc.)

## Evaluation Notes

- Database is SQLite (file-based, no external dependency)
- All external API keys are server-side only (never exposed to frontend)
- Kindwise limited to 10 identifications/month - pre-seeded species cover demo needs
- CORS enabled for all origins (development convenience)
- Health check: `GET /health`

## Frontend Integration

Frontend built separately with Stitch (React + Tailwind). Configure `VITE_API_BASE_URL=http://localhost:3000/api/v1` in frontend `.env`.

The backend serves no static files - purely API.