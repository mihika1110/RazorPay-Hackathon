# 🛡️ RefundShield — AI-Powered Refund Abuse Detection

> **Razorpay AI Buildathon 2026** | Team Entry

RefundShield is a full-stack, real-time fraud intelligence platform that detects coordinated refund abuse rings using graph-based cluster analysis and a machine learning risk scoring engine. It is purpose-built for payment processors like Razorpay to protect merchants from organized refund fraud while ensuring legitimate customers are never blocked.

---

## 🚀 Live Demo

| Service | URL |
|---|---|
| **Frontend Dashboard** | http://localhost:5173 |
| **Backend API** | http://localhost:8000 |
| **API Docs (Swagger)** | http://localhost:8000/docs |

---

## 🧠 The Problem

Refund abuse costs e-commerce merchants billions annually. Fraudsters exploit refund policies through:
- **Coordinated rings** — multiple fake accounts sharing the same device/address/IP to order and refund repeatedly
- **Wardrobing** — buying, using, and returning items systematically
- **Synthetic identity fraud** — new accounts with high velocity and refund rates

Traditional rule-based systems produce too many false positives, blocking legitimate customers. RefundShield uses graph analysis + ML to detect *clusters* of coordinated behavior, not just individual signals.

---

## ✨ Key Features

### 🔍 Cluster Detection Engine
- **Graph-Based Analysis**: Builds a shared-attribute graph (device ID, address ID) across all accounts
- Detects connected components of accounts exhibiting coordinated behavior
- Assigns `HIGH / MEDIUM / LOW` risk levels per cluster based on refund rates and velocity

### 🤖 ML Risk Scoring
- Trained `RandomForestClassifier` on a 60/20/20 train/val/test split
- Features: order velocity, refund rate, account age, average order value
- Evaluated strictly on **held-out test data** — no data leakage
- Real metrics: **~94.9% Precision | ~83.9% Recall | ~89.1% F1**

### 🏘️ Dense Living Detection
- Intelligently distinguishes **genuine dense-living nodes** (hostels, corporate offices, PGs) from **fraud clusters**
- Uses mock reverse-geocoding to verify location type and suppress false positives

### 🤖 AI Investigation Agent
- Powered by **Gemini 2.0 Flash** via Google Generative AI SDK
- On-demand cluster investigation generates a full natural-language risk assessment report
- Highlights key risk signals: shared devices, refund patterns, product targeting

### 📡 Live Data Streaming
- Background thread (`live_streamer.py`) generates new synthetic orders every **5 seconds**
- All new orders are scored by the ML model in real time
- Frontend **auto-polls** the API every 5 seconds — the dashboard counters tick upward live
- A pulsing **🟢 LIVE** indicator confirms real-time data flow

### 🎨 Premium Dashboard UI
- Dark/Light mode toggle with persistent state
- Glassmorphism design with floating ambient orbs
- Staggered entrance animations, hover-lift card effects
- **Flip-cards** on Metrics page reveal mathematical formulas (click any metric card!)
- Fully animated Confusion Matrix with colour-coded quadrants

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│              React Frontend             │
│  Dashboard │ Clusters │ Metrics │ AI    │
│         (Vite + Tailwind CSS)           │
└───────────────────┬─────────────────────┘
                    │ REST API (axios, 5s poll)
┌───────────────────▼─────────────────────┐
│           FastAPI Backend               │
│                                         │
│  ┌──────────────┐  ┌─────────────────┐  │
│  │  ML Engine   │  │  Graph Engine   │  │
│  │  (sklearn RF)│  │  (networkx)     │  │
│  └──────────────┘  └─────────────────┘  │
│                                         │
│  ┌──────────────┐  ┌─────────────────┐  │
│  │  AI Agent    │  │  Live Streamer  │  │
│  │  (Gemini)    │  │  (background)   │  │
│  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
RefundShield/
├── backend/
│   ├── main.py              # FastAPI app + API routes
│   ├── ml_model.py          # Model training + evaluation pipeline
│   ├── graph_engine.py      # Graph construction + cluster detection
│   ├── agent.py             # Gemini AI investigation agent
│   ├── live_streamer.py     # Background live data generation thread
│   ├── data_generator.py    # Synthetic dataset generator (HIGH/MEDIUM/LOW cases)
│   ├── accounts.csv         # Generated account data
│   ├── orders.csv           # Generated order data
│   ├── orders_scored.csv    # Orders with ML risk scores
│   ├── clusters.json        # Detected clusters with risk levels
│   ├── metrics.json         # Model evaluation metrics (test set)
│   └── model.pkl            # Trained RandomForest model
│
└── frontend/
    ├── src/
    │   ├── App.jsx           # Root app with routing + dark mode
    │   ├── index.css         # Global styles + animation keyframes
    │   └── pages/
    │       ├── Dashboard.jsx    # Live risk overview + recent orders
    │       ├── Clusters.jsx     # Cluster table with search + filter
    │       ├── Investigation.jsx # AI report generation
    │       └── Metrics.jsx      # Model performance + flip-cards
    └── index.html
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.9+
- Node.js 18+
- A **Gemini API key** (for the AI Investigation feature)

### 1. Clone the repository
```bash
git clone https://github.com/mihika1110/RazorPay-Hackathon.git
cd RazorPay-Hackathon
```

### 2. Backend Setup
```bash
cd RefundShield/backend

# Install dependencies
pip install fastapi uvicorn pandas numpy scikit-learn networkx pickle google-generativeai

# Set your Gemini API key
$env:GEMINI_API_KEY = "your-api-key-here"   # Windows PowerShell
# export GEMINI_API_KEY="your-api-key-here" # Linux/macOS

# Generate synthetic data (21,000+ orders)
python data_generator.py

# Train the ML model and evaluate on held-out test set
python ml_model.py

# Start the backend server
uvicorn main:app --reload
```

### 3. Frontend Setup
```bash
cd RefundShield/frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 📊 ML Model Details

| Parameter | Value |
|---|---|
| Algorithm | Random Forest Classifier |
| Estimators | 50 trees |
| Max Depth | 5 |
| Train / Val / Test Split | 60% / 20% / 20% |
| Label Noise (anti-overfit) | 5% random flip |
| Precision (Test Set) | ~94.9% |
| Recall (Test Set) | ~83.9% |
| F1 Score (Test Set) | ~89.1% |
| False Positive Rate | ~1.8% |

**Features Used:**
- `amount` — order value
- `account_age_days` — account tenure
- `total_orders` — order velocity
- `total_refunds` — refund count
- `refund_rate` — derived ratio
- `avg_order_value` — average spend

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/stats` | Dashboard summary stats |
| `GET` | `/api/orders` | Recent scored orders |
| `GET` | `/api/clusters` | All detected clusters |
| `GET` | `/api/clusters/{id}` | Single cluster detail |
| `POST` | `/api/investigate/{id}` | Run AI investigation |
| `GET` | `/api/metrics` | Model evaluation metrics |
| `GET` | `/api/stream/status` | Live stream health check |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v4 |
| Backend | FastAPI, Uvicorn |
| ML | scikit-learn (RandomForest), pandas, numpy |
| Graph | networkx |
| AI Agent | Google Generative AI (Gemini 2.0 Flash) |
| Charts/Icons | Lucide React |

---

## 👩‍💻 Team

Built with ❤️ for the **Razorpay AI Buildathon 2026**