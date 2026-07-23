# PlantCare
 PlantCare: Smart Plant Maintenance
## Scenario
Plants maintained in homes, offices, or campuses are often neglected because caretakers forget watering schedules or maintenance routines.
--
🌿 PlantCare: Smart Plant Maintenance
> **Scenario:** Plants maintained in homes, offices, or campuses are often neglected because caretakers forget watering schedules or maintenance routines.  
> **Challenge:** Design and develop a solution that helps users monitor and manage plant care activities efficiently.

---

📖 About the Project
PlantCare is a fully software-driven platform designed to eliminate plant neglect in indoor, office, and campus environments. By replacing the need for physical IoT hardware sensors with smartphone cameras, computer vision, and hyper-local environmental data streams, PlantCare provides accessible and highly accurate plant 
maintenance routines.

✨ Core Features
1. Computer Vision & AI Diagnosis
Turn any smartphone camera into a powerful plant health diagnostic tool.
Species Identification: Leverages deep learning (CNNs like ResNet/MobileNet) to identify plants and instantly pull their baseline care requirements.
Health & Disease Detection: Multi-label classification models analyze leaf discoloration, spots, or drooping to diagnose fungal infections, nutrient deficiencies, and watering issues.
Actionable Insights: Outputs a health score and generates tailored recovery plans (e.g., "Nitrogen deficiency detected. Add organic fertilizer.").
2. Context-Aware Smart Scheduling
Rely on data, not just static timers.
Weather API Integration: Utilizes hyper-local weather services (e.g., OpenWeatherMap) to track ambient temperature, humidity, and rainfall.
Dynamic Watering Algorithm: Automatically recalibrates schedules. If an outdoor/balcony plant is scheduled for watering but a 90% chance of rain is forecasted, the system delays the alert.
Botanical Database: Backed by structured parameters for hundreds of species' optimal growth conditions.
3. Intuitive Management Dashboard
Virtual Garden Inventory: Catalog plants by location (e.g., "Main Library", "Balcony", "Office Desk").
Smart Notification Engine: Automated push notifications for watering, misting, repotting, and fertilizing.
Visual Progress Logging: Track growth over time via periodic photo uploads.

🚀 Advanced Enterprise & Campus Capabilities
Designed for scale and team management:
Caretaker Accountability: Multi-role dashboards allow facility managers to assign specific plant zones to staff, track task completion, and trigger escalation alerts for neglected plants.
Geo-Tagged Pest Alerts: Detects and tracks localized transmissible issues (e.g., spider mites in a specific building) and automatically alerts caretakers in adjacent areas.
Community Expert Loop: Low-confidence AI scans are flagged for manual review by a designated head groundskeeper or botanist.
Inventory & Restock Integrations: Tracks campus supplies (soil, fertilizer) based on usage logs and generates automatic restock lists.
Fertilizer Volume Calculator: Computes exact fertilizer demands based on plant species and pot/plot dimensions.

🆚 PlantCare vs. Plantix
While utilizing similar deep learning diagnostic concepts as Plantix, PlantCare is fundamentally different in its target audience and environment. Plantix optimizes large-scale agricultural yield for farmers. PlantCare is strictly tailored for indoor, home, and enterprise/campus environments where the primary challenge is caretaker neglect, routine management, and team delegation.

🛠️ Proposed Tech Stack
AI/ML: Python, TensorFlow/PyTorch, Convolutional Neural Networks (CNN)
Backend: Python (FastAPI/Django), PostgreSQL
External APIs: OpenWeatherMap, Botanical Data APIs
Frontend: React Native / Flutter (Cross-platform mobile access for camera integration)

⚙️ Getting Started
Prerequisites
Python 3.9+
Node.js (for frontend)
API Keys for OpenWeatherMap
Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/PlantCare.git

# Navigate to the backend directory
cd PlantCare/backend

# Install dependencies
pip install -r requirements.txt

# Run the backend server
python manage.py runserver
```
---
Developed for smart campus and home maintenance solutions.
