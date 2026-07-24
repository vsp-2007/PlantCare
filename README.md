# 🌿 PlantCare Pro: Smart Plant Maintenance & Health Platform

> **Smart, AI-Powered Plant Care, Health Diagnostics, and Schedule Automation for Homes, Offices, and Campuses.**

---

## 📖 Overview

**PlantCare Pro** is a software-driven platform designed to eliminate plant neglect in indoor, home, office, and enterprise campus environments. By leveraging computer vision, multi-llm AI diagnostics, and hyper-local environmental data streams, PlantCare Pro delivers tailored maintenance routines, intelligent plant health diagnostics, dynamic scheduling, and campus-scale caretaker management.

---

## ✨ Key Features

- **📸 Computer Vision & AI Species Identification**: Instant species identification and care guidelines from plant photos powered by Google Gemini Vision and Kindwise API.
- **🤖 Interactive AI Plant Doctor**: Multi-turn plant health consultations using `@google/genai` (Gemini 3.6 Flash) and LLM endpoints to diagnose drooping, leaf discoloration, pests, or nutrient deficiencies.
- **⛅ Context-Aware Smart Care Scheduling**: Dynamic watering algorithm that adjusts alert schedules based on real-time weather data and hyper-local forecasts from WeatherAPI.
- **📊 AI Survival Scoring & Health Insights**: Predictive analytics providing 0-100 survival scores, stress risk assessments, growth forecasts, and emergency rescue action plans.
- **🌿 Virtual Garden & Plant Passport**: Complete plant management with historical care logs, milestone timeline tracking, visual photo logs, and complete exportable plant passports.
- **🏫 Enterprise & Campus Delegation**: Multi-role support for assigning zones to caretakers, tracking task completion, calculating fertilizer requirements, and supply restock management.

---

## 🛠️ Architecture & Tech Stack

```
 ┌─────────────────────────────────────────────────────────────┐
 │                PlantCare Pro Web Application                │
 │       React 19 + TypeScript + Vite 6 + Tailwind CSS v4      │
 └──────────────┬───────────────────────────────┬──────────────┘
                │                               │
                ▼                               ▼
 ┌──────────────────────────────┐ ┌─────────────────────────────┐
 │      Express Node Server     │ │      FastAPI Python Backend │
 │         (Port 3001)          │ │         (Port 3000)         │
 │  - Vite Dev Middleware       │ │  - Plant CRUD & History     │
 │  - Google Gemini AI API      │ │  - Weather & Kindwise APIs  │
 │    (/api/gemini/*)           │ │  - SQLite DB + SQLAlchemy   │
 └──────────────────────────────┘ └─────────────────────────────┘
```

### Frontend & App Server
- **Framework**: React 19, TypeScript, Vite 6
- **UI & Styling**: Tailwind CSS v4, Motion (Framer Motion), Lucide React Icons, Recharts
- **Server**: Express Node.js (`server.ts`) serving Vite middleware and Gemini AI endpoints

### Backend Service
- **Framework**: Python 3.10+, FastAPI, Uvicorn
- **ORM & DB**: SQLAlchemy, SQLite (`plantcare.db`)
- **Validation**: Pydantic v2

### AI & External APIs
- **Google Gemini AI**: `@google/genai` (`gemini-3.6-flash`) for Plant Doctor and Vision Identification
- **Kindwise Crop API**: Plant species identification
- **WeatherAPI.com**: Hyper-local weather data & forecasts
- **LLM Integrations**: OpenAI-compatible API providers (NVIDIA NIM / OpenRouter / OpenAI)

---

## 📂 Project Structure

```
PlantCare/
├── backend/                  # Python FastAPI Backend
│   ├── app/                  # Application source
│   │   ├── api/routes.py     # REST API endpoints
│   │   ├── database.py       # SQLAlchemy setup
│   │   ├── models.py         # DB models (Plant, CareLog, Milestone, etc.)
│   │   ├── schemas.py        # Pydantic data schemas
│   │   └── services/         # Kindwise, Weather, and LLM integrations
│   ├── data/                 # Pre-seeded species JSON dataset
│   ├── seed_data.py          # Database seeding script
│   ├── Dockerfile            # Container build for FastAPI backend
│   └── requirements.txt      # Python dependencies
├── src/                      # React 19 Frontend
│   ├── components/           # React components (Dashboard, Chat, AI tools)
│   ├── data/                 # Mock data & fallback assets
│   ├── App.tsx               # Main frontend container
│   ├── index.css             # Tailwind v4 styles & custom utilities
│   └── types.ts              # TypeScript interfaces
├── server.ts                 # Express Node server with Gemini API handlers
├── docker-compose.yml        # Docker service orchestration
├── package.json              # Frontend scripts & dependencies
├── tsconfig.json             # TypeScript configuration
└── vite.config.ts            # Vite configuration
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **Python**: v3.9 or higher
- **Package Manager**: `npm` (or `bun` / `pnpm`)

---

### Setup & Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/PlantCare.git
cd PlantCare
```

#### 2. Configure Environment Variables
Create a `.env` file in the root directory (and/or inside `backend/.env`):

```env
# Gemini API Key for Express App Server (/api/gemini/*)
GEMINI_API_KEY=your_gemini_api_key

# FastAPI Backend Services (.env)
WEATHERAPI_KEY=your_weatherapi_key
KINDWISE_KEY=your_kindwise_api_key
LLM_API_KEY=your_llm_api_key
LLM_BASE_URL=https://integrate.api.nvidia.com/v1
LLM_MODEL=nvidia/nemotron-3.5-nano-30b-a3b
DATABASE_URL=sqlite:///./plantcare.db
PORT=3000
```

#### 3. Setup Backend (Python FastAPI)
```bash
# Navigate to backend directory
cd backend

# Create & activate a virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Initialize database schema and seed default species data
python -c "from app.database import init_db; init_db()"
python seed_data.py

# Start the FastAPI backend server (Port 3000)
uvicorn app.main:app --reload --port 3000
```

#### 4. Setup Frontend & Express Server
In a separate terminal tab at the root directory:

```bash
# Install Node dependencies
npm install

# Start the development server (Port 3001)
npm run dev
```

Open your browser at **`http://localhost:3001`**.

---

## 🐳 Docker Deployment

To launch the backend container with Docker Compose:

```bash
# Ensure .env is populated in the root directory
docker compose up --build
```

The backend container will run on `http://localhost:3000`.

---

## 📡 API Reference

### Express Server Endpoints (`http://localhost:3001`)
| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | Health check endpoint |
| `/api/gemini/doctor` | `POST` | Interactive Gemini AI Plant Doctor consultation |
| `/api/gemini/identify` | `POST` | Vision AI plant species & condition identification |

### FastAPI Backend Endpoints (`http://localhost:3000`)
| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/plants` | `GET`, `POST` | List all plants or create a new plant |
| `/api/v1/plants/{id}` | `GET`, `PUT`, `DELETE` | Retrieve, update, or delete a specific plant |
| `/api/v1/species` | `GET` | Paginated catalog of plant species |
| `/api/v1/species/search` | `GET` | Search species catalog by query string |
| `/api/v1/plants/{id}/care` | `GET`, `POST` | Fetch care logs or submit new care actions |
| `/api/v1/plants/{id}/chat` | `GET`, `POST` | Chat history and non-streaming LLM responses |
| `/api/v1/plants/{id}/chat/stream` | `POST` | SSE streaming LLM chat doctor |
| `/api/v1/vision/identify` | `POST` | Identify plant species via Kindwise API |
| `/api/v1/weather/current` | `GET` | Real-time weather and 3-day forecast |
| `/api/v1/ai/survival-score` | `POST` | Calculate 0-100 plant survival index |
| `/api/v1/ai/stress-prediction` | `POST` | Predict stress factors and risks |
| `/api/v1/ai/emergency-rescue` | `POST` | Generate step-by-step emergency rescue plans |
| `/api/v1/ai/growth-forecast` | `POST` | Forecast growth milestones and target sizes |
| `/api/v1/plants/{id}/passport` | `GET` | Export complete plant care passport |

Interactive Swagger documentation for the FastAPI backend is available at **`http://localhost:3000/docs`**.

---

## 🧪 Testing & Verification

Run project linter and Python backend unit test suite:

```bash
npm run test
```

Or run Python unit tests directly:

```bash
cd backend
python -m unittest discover -s tests
```

---

## 📄 License

This project is licensed under the MIT License.
