# 📡 RefundRadar — Intelligent Refund Abuse & Fraud Ring Detection

> Built for the **Razorpay AI Buildathon 2026**

RefundRadar is a real-time fraud intelligence platform that detects coordinated refund abuse syndicates, wardrobing, and serial return fraud. By combining **entity relationship graph clustering**, **machine learning risk scoring**, and an **autonomous AI investigation agent**, RefundRadar uncovers organized fraud rings while ensuring legitimate customers—like students in dorms or families sharing devices—are protected from false positive blocks.

---

## ⚡ Quick Start

### 1. Backend (FastAPI + ML Engine)
Open a terminal and start the backend service:

```powershell
# Navigate to the backend directory
cd "RefundShield/backend"

# (Optional) Set your Gemini API key for live AI synthesis
$env:GEMINI_API_KEY = "your-api-key-here"

# Start the API server with hot-reloading
python -m uvicorn main:app --reload --port 8000
```
* **API Base URL:** http://127.0.0.1:8000  
* **Interactive Swagger Docs:** http://127.0.0.1:8000/docs  

---

### 2. Frontend (React Dashboard)
Open a separate terminal and start the user interface:

```powershell
# Navigate to the frontend directory
cd "RefundShield/frontend"

# Install dependencies (first time only)
npm install

# Start the Vite development server
npm run dev
```
* **Web Application:** http://localhost:5173  

---

## 💡 Why We Built RefundRadar

Refund abuse costs digital merchants and payment gateways billions of rupees every year. Fraudsters game merchant return policies through:
* **Coordinated Fraud Rings:** Creating dozens of disposable accounts across a small set of shared phones, laptops, and delivery drop points to repeatedly claim refunds.
* **Wardrobing & Serial Abuse:** Purchasing high-ticket electronics or luxury apparel with the planned intent of using and returning them.
* **The False Positive Dilemma:** Conventional rule engines (like *"flag any address with >3 accounts"*) end up blocking entire university dorms, shared PG hostels, and corporate apartment complexes.

RefundRadar solves this by analyzing the entire **relationship graph** and evaluating behavioral velocity, rather than making isolated judgments on single transactions.

---

## ✨ Core Capabilities

### 🕸️ 1. Graph-Powered Cluster Detection
* Constructs a bipartite graph linking accounts that share hardware fingerprints (`device_id`) or physical locations (`address_id`).
* Uses connected component algorithms via `networkx` to isolate discrete account clusters (e.g., `Cluster C207`).
* Continuously calculates cumulative order value, refund velocity, and cluster-wide risk levels (`HIGH`, `MEDIUM`, `LOW`).

### 🏘️ 2. Dense-Living & False Positive Protection
* Distinguishes legitimate dense-living environments (university hostels, co-living PGs, corporate campuses) from malicious fraud rings.
* When hundreds of students share the same building address and Wi-Fi router, the system verifies the location type and suppresses automatic blocking, keeping false positives near zero.

### 🤖 3. Real-Time Machine Learning Risk Scoring
* A `RandomForestClassifier` evaluates transactions across 6 behavioral dimensions:
  * Transaction amount & average basket value
  * Account age & tenure
  * Lifetime order count & refund request count
  * Proportional refund rate
* Delivers **97%+ Precision** and **96%+ Recall** with live confusion matrix tracking.

### 🧠 4. Autonomous AI Investigator Agent
* Powered by Google's **Gemini 2.0 Flash** (with a built-in deterministic fallback engine).
* Generates structured investigation dossiers with:
  * **Executive Summary:** High-level metrics and impact.
  * **Key Risk Signals:** Concrete evidence of shared hardware, address collusions, and return velocities.
  * **Assessment & Confidence Score:** Probabilistic verdict on coordinated ring activity vs. normal behavior.
  * **Actionable Next Steps:** Clear instructions for fraud operations teams (e.g., *Monitor*, *Manual Review*, *Do Not Block*).

### 📡 5. Continuous Live Data Streamer & Production Persistence
* Runs an asynchronous background generator (`live_streamer.py`) that simulates live incoming production orders every few seconds.
* Automatically scores incoming orders, updates live metrics, and dynamically recalibrates cluster graphs in real time.
* **Production-Grade Persistence:** Historical memory is never wiped on server restart—new transactions seamlessly append to `orders_scored.csv` and `clusters.json`.

---

## 🔍 How to Test Custom Scenarios

You can test the machine learning model with custom numbers directly in your terminal to see how it scores different customer personas:

```powershell
python -c "
import pickle, pandas as pd
clf = pickle.load(open('RefundShield/backend/model.pkl', 'rb'))

test_cases = {
    '1. University Student (₹220 basket, 0 refunds)':      [220, 180, 5, 0, 0.0, 200],
    '2. Regular Shopper   (₹320 basket, 1 in 10 refunds)': [320, 240, 10, 1, 1/10, 300],
    '3. Moderate Returner (₹450 basket, 2 in 7 refunds)':  [450, 120, 7, 2, 2/7, 420],
    '4. Fraud Ring Member (₹1200 basket, 6 in 7 refunds)': [1200, 15, 7, 6, 6/7, 1150],
}

cols = ['amount', 'account_age_days', 'total_orders', 'total_refunds', 'refund_rate', 'avg_order_value']
for name, vals in test_cases.items():
    df = pd.DataFrame([vals], columns=cols)
    prob = clf.predict_proba(df)[0][1]
    risk = 'HIGH' if prob > 0.8 else ('MEDIUM' if prob > 0.4 else 'LOW')
    print(f'{name} -> Score = {prob:.4f} ({prob*100:.1f}%) -> {risk} RISK')
"
```

---

## 🏛️ System Architecture

```
┌───────────────────────────────────────────────────────────┐
│              React Frontend (Vite + Tailwind)             │
│   • Live Overview Dashboard   • Entity Relationship Table │
│   • AI Dossier Generator      • Real-Time Model Metrics   │
└─────────────────────────────┬─────────────────────────────┘
                              │ REST API (JSON / Real-Time Polling)
┌─────────────────────────────▼─────────────────────────────┐
│                   FastAPI Backend Server                  │
│                                                           │
│  ┌───────────────────┐               ┌─────────────────┐  │
│  │   ML Scoring      │               │  Graph Engine   │  │
│  │ (Random Forest)   │               │   (NetworkX)    │  │
│  └─────────▲─────────┘               └────────▲────────┘  │
│            │                                  │           │
│  ┌─────────┴─────────┐               ┌────────┴────────┐  │
│  │   AI Investigator │               │ Live Streamer   │  │
│  │  (Gemini Agent)   │               │ (Worker Thread) │  │
│  └───────────────────┘               └─────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
RazorPay-Hackathon/
├── README.md                          # Project documentation and setup guide
└── RefundShield/
    ├── backend/
    │   ├── main.py                    # FastAPI server & API endpoints
    │   ├── ml_model.py                # Model training, feature pipeline & validation
    │   ├── graph_engine.py            # Bipartite entity graph & cluster analyzer
    │   ├── agent.py                   # Autonomous AI investigator agent
    │   ├── live_streamer.py           # Background live order streamer & scorer
    │   ├── data_generator.py          # Baseline synthetic dataset generation
    │   ├── model.pkl                  # Serialized Random Forest classifier
    │   ├── accounts.csv               # Account & device/address registry
    │   ├── orders.csv                 # Raw historical transactions
    │   ├── orders_scored.csv          # Accumulated transactions with risk scores
    │   ├── clusters.json              # Extracted entity clusters & metadata
    │   └── metrics.json               # Live confusion matrix & evaluation metrics
    │
    └── frontend/
        ├── src/
        │   ├── App.jsx                # Main navigation & app routing
        │   ├── config.js              # Centralized API endpoints configuration
        │   ├── index.css              # Custom styling & animation tokens
        │   └── pages/
        │       ├── Dashboard.jsx      # Summary metrics & live high-risk transactions
        │       ├── Clusters.jsx       # Cluster registry with search & filters
        │       ├── Investigation.jsx  # Structured AI investigation report & order log
        │       └── Metrics.jsx        # Model performance analytics & formulas
        ├── package.json
        └── vite.config.js
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/stats` | High-level summary (total orders, flagged orders, exposure, clusters) |
| `GET` | `/api/orders` | Retrieves recent scored orders (filterable by risk and timestamp) |
| `GET` | `/api/clusters` | Returns all detected account clusters and risk ratings |
| `GET` | `/api/clusters/{id}` | Detailed cluster breakdown, shared entities, and order ledger |
| `POST` | `/api/investigate/{id}` | Triggers AI agent synthesis to generate an investigation report |
| `GET` | `/api/metrics` | Retrieves precision, recall, F1, and confusion matrix |
| `GET` | `/api/stream/status` | Streaming engine health check and total order counter |
| `POST`| `/api/stream/toggle` | Pauses or resumes the real-time background stream |

---

## 🛠️ Technology Stack

* **Frontend:** React 19, Vite, Tailwind CSS, Lucide React, Recharts
* **Backend:** Python 3.12, FastAPI, Uvicorn, Pandas, NumPy
* **Machine Learning & Graph:** Scikit-Learn (Random Forest), NetworkX
* **AI Intelligence:** Google Generative AI (Gemini 2.0 Flash)

---

## 👩‍💻 Team & Acknowledgments

Developed with ❤️ for the **Razorpay AI Buildathon 2026**.