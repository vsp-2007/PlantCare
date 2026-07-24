# Stitch Prompts for PlantCare Frontend

**Target:** React + TypeScript + Vite + Tailwind CSS + Framer Motion  
**Backend:** Existing FastAPI at `http://localhost:3000/api/v1` (see `backend/app/api/routes.py`)  
**Scope:** Home/office/campus plant care — **NOT** enterprise fleet/inventory/logistics.

---

## 🎯 Prompt 1: Project Setup & Design System

```
Create a React + TypeScript + Vite project with Tailwind CSS for a plant care app called "PlantCare".

**Design System:**
- Colors: Green primary (#166534), Light green accent (#4ade80), Neutral grays, Red for urgent/overdue
- Radius: 12px cards, 8px buttons, 4px inputs
- Shadows: Subtle elevation (0 2px 8px rgba(0,0,0,0.08)), subtle glow for urgent states
- Typography: Inter, 14px base, fluid clamp(1rem, 2vw, 1.25rem)
- Icons: Lucide React
- Dark mode via prefers-color-scheme (class strategy)

**Motion & Atmosphere (MANDATORY):**
- Framer Motion for ALL transitions: page (fade+slide 200ms), hover/tap, stagger, scroll-reveal
- Aceternity UI components (copy to src/components/aceternity/): BackgroundBeams, SpotlightCard, AnimatedGridPattern, NumberTicker, Marquee
- tailwindcss-animate for micro-interactions: pulse, ring, shake, bounce
- Respect prefers-reduced-motion

**Layout:**
- Desktop: Sidebar nav (280px) + main content
- Mobile: Bottom tab bar (5 tabs: Dashboard, Plants, Add, Insights, Settings)
- Responsive breakpoints: sm 640, md 768, lg 1024, xl 1280

**Project Structure:**
- src/components/ui/ (Button, Input, Card, Modal, Toast, Avatar, Badge, Tabs, Select, Textarea, Skeleton)
- src/components/aceternity/ (copied Aceternity components)
- src/hooks/ (useApi, usePlants, useWeather, useChat)
- src/lib/api.ts (typed API client with SSE support for chat streaming)
- src/types/index.ts (all TypeScript interfaces matching backend schemas)
- src/App.tsx with React Router v6 + lazy routes
- .env.example with VITE_API_BASE_URL

**Performance:**
- Lazy load: Chat, Passport, IdentifyModal
- React.memo on list items
- Code-split routes
- Target <100KB JS gzipped initial
```

---

## 🎯 Prompt 2: Dashboard (Home) — `/`

```
Dashboard page showing all plants in a responsive grid.

**PlantCard Component (wraps SpotlightCard):**
- Photo: aspect-square, object-cover, fallback 🌱 emoji
- Nickname + species common name
- Location badge
- Survival Score: Large circular progress ring (NumberTicker 0→score)
  - Green >70, Amber >40, Red ≤40 with animate-ring
- Next care due: "Water in 2 days" / "Fertilize tomorrow" / "Overdue!" (red, animate-pulse)
- Quick actions: Water (💧), Chat (💬), Menu (⋮)
- Framer Motion: whileHover scale=1.02, y=-4, box-shadow glow; whileTap scale=0.98
- Drag to reorder (drag="y", constraints)

**Dashboard Page:**
- Aceternity BackgroundBeams (subtle green, opacity 0.15)
- Header: "My Plants" + FAB "Add Plant" (bottom-right mobile, top-right desktop)
- Empty state: Illustration + "Add your first plant" CTA
- Loading: Skeleton cards (animate-pulse)
- Error toast + retry button

**Navigation:**
- Desktop sidebar: Dashboard, Plants, Insights, Settings
- Mobile bottom tabs: same 4 items
```

**Backend API used:** `GET /api/v1/plants` → `PlantResponse[]`

---

## 🎯 Prompt 3: Add/Edit Plant Modal

```
Full-screen modal (mobile) / centered modal (desktop) for adding/editing plants.

**Form Fields:**
- Nickname* (text, required)
- Species: Searchable autocomplete (GET /api/v1/species/search?q=)
  - Option: "🔍 Identify with Camera" button → opens IdentifyModal
- Location* (text, placeholder: "Living room - north window")
- Acquired Date* (date picker, default today)
- Latitude/Longitude (optional, hidden advanced toggle)
- Photo Upload: Drag-drop zone + camera capture (input type=file accept=image/*)
  - Client-side compress to 1024px max, preview thumbnail
  - Convert to base64 for API

**Validation:** Inline errors, disable submit until valid
**Submit:** POST /api/v1/plants (multipart/form-data) or PUT /api/v1/plants/{id}
**Success:** Toast + close modal + refresh list
```

**Backend API used:** `POST /api/v1/plants`, `PUT /api/v1/plants/{id}`, `GET /api/v1/species/search?q=`

---

## 🎯 Prompt 4: Identify Modal (Kindwise Integration)

```
Full-screen modal for plant identification.

**Step 1 - Capture:**
- Video element (facing="environment") + "Capture" button
- OR file upload fallback
- Preview captured image

**Step 2 - Analyze:**
- "Analyze" button (disabled until image captured)
- Loading: AnimatedGridPattern background + spinner + "Identifying with Kindwise..."

**Step 3 - Results:**
- List up to 5 suggestions (IdentifySuggestion card):
  - Thumbnail, Scientific name, Common name, Confidence % (NumberTicker)
  - "Select" button → fills species in Add/Edit form + closes modal
- Error states: "No match", "Monthly limit reached (10/mo)", "Network error"
- "Try Again" button resets to step 1

**API:** POST /api/v1/vision/identify { image_base64 }
```

**Backend API used:** `POST /api/v1/vision/identify` (Kindwise integration)

---

## 🎯 Prompt 5: Plant Detail Page — `/plant/:id`

```
Tabbed layout (4 tabs) with scroll-reveal animations.

**Tab 1: Timeline (Chronological Feed)**
- Merged timeline: Care logs + Chat messages + Milestones
- Newest top, infinite scroll / "Load more" (20 per page)
- CareLogEntry: Icon + type + timestamp + notes + metadata badges
- ChatMessage: User/Assistant bubbles with timestamps (group by date)
- Milestone: Special card with icon (🌱🌸⚠️📦) + glow border
- Floating "Add Care" button (bottom-right) → opens CareLogModal

**Tab 2: Chat Doctor**
- Full chat interface with streaming support
- Message list: date separators, user right / assistant left bubbles
- Typing indicator: 3 bouncing dots
- Streaming: Typewriter effect (Framer Motion stagger chars 0.02s)
- Input: Textarea + Send (Enter=send, Shift+Enter=newline)
- Top-right buttons: "Emergency Rescue" (red, pulse), "Stress Check", "Growth Forecast"
- API: POST /api/v1/plants/{id}/chat/stream (SSE)

**Tab 3: Insights (Dashboard Cards Grid)**
- SurvivalScoreCard: Large ring + factors list (stagger fade-in)
- NextCareCard: Water/Fertilize/Prune countdowns
- WeatherCard: Current + 3-day forecast (Aceternity Marquee for alerts)
- StressPredictionCard: AI risk factors with severity badges
- GrowthForecastCard: Timeline visualization of predicted milestones

**Tab 4: Passport**
- Read-only summary: Photo, nickname, species, stats (total waters, ferts, days owned)
- Milestones timeline
- Export buttons: "Download JSON", "Print PDF" (window.print())

**Shared:**
- Header: Plant photo + nickname + species + location + back button
- All tabs lazy-loaded
```

**Backend APIs used:**
- `GET /api/v1/plants/{id}`
- `GET /api/v1/plants/{id}/care`
- `GET /api/v1/plants/{id}/chat`
- `POST /api/v1/plants/{id}/chat/stream` (SSE)
- `POST /api/v1/ai/survival-score`
- `POST /api/v1/ai/stress-prediction`
- `POST /api/v1/ai/emergency-rescue`
- `POST /api/v1/ai/growth-forecast`
- `GET /api/v1/plants/{id}/passport`
- `GET /api/v1/weather/current?lat=&lon=`

---

## 🎯 Prompt 6: Care Log Entry Modal

```
Slide-up sheet (mobile) / modal (desktop) for logging care actions.

**Type Selector:** Segmented control (Water, Fertilize, Prune, Repot, Inspect, Move)

**Dynamic Fields by Type:**
- Water: Volume (ml), Water source (tap/filtered/rain)
- Fertilize: NPK ratio, Concentration, Volume
- Prune: Parts removed, Reason
- Repot: New pot size, Soil mix
- Move: From location, To location
- Inspect: Notes only

**Common:** Timestamp (default now, editable), Notes (textarea)

**Submit:** POST /api/v1/plants/{id}/care
**Success:** Close + refresh timeline + check for new milestone toast
```

**Backend API used:** `POST /api/v1/plants/{id}/care`

---

## 🎯 Prompt 7: Emergency Rescue Modal

```
Full-screen urgent UI (red accent).

**Header:** "🚨 Emergency Rescue Mode" + plant nickname
**Stepper:** 1. Assess → 2. Act → 3. Monitor

**Content:** AI-generated steps from POST /api/v1/ai/emergency-rescue
- Each step: Number, Title, Description, Checkbox
- "Mark Complete" → enables next step
- Timer: "Check again in 2 hours" → sets reminder

**Footer:** "Contact Expert" (placeholder), "Resolved" button
- Resolved: Creates stress_recovery milestone + closes modal
```

**Backend API used:** `POST /api/v1/ai/emergency-rescue`

---

## 🎯 Prompt 8: Settings & Data Management

```
Settings page with tabs:

**Profile:** Nickname, default location, notification preferences

**Plants:** List with delete confirmation

**Data Management:**
- "Export All Data" → downloads complete JSON backup
- "Import Data" → file picker, validates, merges
- "Clear All Data" → danger zone, double confirmation

**API Keys (Admin):**
- WeatherAPI Key (masked input)
- Kindwise Key (masked)
- LLM Key + Base URL + Model (masked)
- "Test Connection" buttons for each

**About:** Version, links to WeatherAPI/Kindwise/LLM docs
```

**Backend APIs used:** None new (uses existing plant CRUD, localStorage for settings)

---

## 🔧 Technical Requirements for All Prompts

**API Client (src/lib/api.ts):**
- Typed fetch wrapper with error handling
- SSE support for chat streaming
- Automatic base URL from import.meta.env.VITE_API_BASE_URL
- Request/response interceptors for auth (future)

**State Management:**
- Zustand stores: usePlantsStore, useChatStore, useSettingsStore
- Persist to localStorage (settings only)

**Error Handling:**
- Toast notifications (success/error/info)
- Global error boundary
- Offline detection banner

**Accessibility:**
- Semantic HTML, ARIA labels
- Focus management in modals
- Keyboard navigation
- Color contrast AA+

**Testing Checklist:**
- [ ] Add plant → identify → appears on dashboard
- [ ] Log water → timeline updates → milestone appears
- [ ] Chat doctor → streaming response → Why/What/How format
- [ ] Emergency rescue → steps → resolved → milestone
- [ ] Passport export → valid JSON
- [ ] Mobile: bottom nav, touch gestures, camera capture
- [ ] Dark mode: all components adapt
- [ ] Reduced motion: animations disabled

---

## 📦 Post-Stitch Integration Steps

```bash
# 1. After Stitch export, copy to frontend/
cd frontend
npm install
npm install framer-motion motion lucide-react clsx tailwind-merge date-fns zustand idb

# 2. Copy Aceternity components to src/components/aceternity/
#    (BackgroundBeams, SpotlightCard, AnimatedGridPattern, NumberTicker, Marquee)

# 3. Create .env
echo "VITE_API_BASE_URL=http://localhost:3000/api/v1" > .env

# 4. Run backend (from project root)
docker compose up --build -d

# 5. Run frontend
npm run dev
# Open http://localhost:5173
```

---

## 🎬 Demo Script for Evaluators (3 minutes)

1. **Dashboard** → Shows 3 pre-seeded plants with survival scores
2. **Add Plant** → "Monstera" → **Identify** (camera/upload) → Kindwise returns species → Save
3. **Plant Detail** → **Timeline** → **Water** (200ml) → Milestone "First Watering" appears
4. **Chat Doctor** → "Leaves yellowing" → Streaming Why/What/How response
5. **Emergency Rescue** → "Stem mushy" → 3-step triage → Mark resolved → Stress recovery milestone
6. **Insights** → Weather card (real API), Stress prediction, Growth forecast
7. **Passport** → Export JSON → Downloads complete history
8. **Mobile view** → Bottom nav, touch gestures, camera capture

---

## ❌ REMOVED FROM ORIGINAL STITCH PROMPTS (Not in Scope)

| Removed Feature | Reason |
|----------------|--------|
| Executive KPI Dashboard (Net Yield, Water Conservation, Carbon Offsets, Fleet Efficiency) | Enterprise farming metrics — not PlantCare scope |
| Fleet Logistics & Supply Chain (Live tracking map, driver roster, shipments) | Fleet management — not plant care |
| Inventory & Resource Allocation (SKU grid, resource cards, category pills) | Warehouse management — not plant care |
| Enterprise Settings (API key status for Gemini/Kindwise, Cloud Run logs, build telemetry) | Over-engineered; settings simplified to user API keys |
| Spatial 2D/3D Floorplan Visualizer | Requires floorplan data/modeling — out of scope |
| Plant Passport & Compliance (botanical origin, passport SKU, compliance records) | Regulatory — not needed for home/campus |
| Emergency Rescue "Expert contact dispatch" | Placeholder only — no backend integration |
| Sector/Zone multi-role dashboards, caretaker accountability | Enterprise team management — out of scope |
| Geo-tagged pest alerts, community expert loop | Requires multi-user backend — not built |
| Fertilizer volume calculator | Nice-to-have, not core MVP |

---

## ✅ ALIGNMENT CHECKLIST (Backend ↔ Frontend)

| Frontend Feature | Backend Endpoint | Status |
|------------------|------------------|--------|
| Plant CRUD | `/api/v1/plants` | ✅ Ready |
| Species search | `/api/v1/species/search` | ✅ Ready |
| Plant identification | `/api/v1/vision/identify` | ✅ Ready |
| Care logging | `/api/v1/plants/{id}/care` | ✅ Ready |
| Care history | `/api/v1/plants/{id}/care` | ✅ Ready |
| Chat (complete) | `/api/v1/plants/{id}/chat` | ✅ Ready |
| Chat (streaming) | `/api/v1/plants/{id}/chat/stream` | ✅ Ready |
| Milestones | `/api/v1/plants/{id}/milestones` | ✅ Ready |
| Survival score | `/api/v1/ai/survival-score` | ✅ Ready |
| Stress prediction | `/api/v1/ai/stress-prediction` | ✅ Ready |
| Emergency rescue | `/api/v1/ai/emergency-rescue` | ✅ Ready |
| Growth forecast | `/api/v1/ai/growth-forecast` | ✅ Ready |
| Plant passport | `/api/v1/plants/{id}/passport` | ✅ Ready |
| Weather | `/api/v1/weather/current` | ✅ Ready |
| Species list | `/api/v1/species` | ✅ Ready |