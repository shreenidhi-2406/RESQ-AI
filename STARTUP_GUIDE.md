# RESQ-AI Emergency Intelligence Platform — Mini Startup Guide

Welcome to the **RESQ-AI** system. This document provides a quick reference guide and step-by-step instructions to initialize, execute, and verify all microservices within the RESQ-AI disaster management platform.

---

## 🏛️ System Architecture Overview

RESQ-AI consists of 5 modular services:

| Component | Technology Stack | Port / Path | Purpose |
| :--- | :--- | :--- | :--- |
| **AI Intelligence Service** | Python, FastAPI, PyTorch, HuggingFace | `http://localhost:8000` | Fine-tuned DistilBERT models for disaster text informativeness and humanitarian categorisation. |
| **RESQ-AI Node Backend** | Node.js, Express, MongoDB Atlas | `http://localhost:3001` | Core REST API, GDACS ingestion engine, change streams, and AI proxy pipeline. |
| **RESQ-AI Dashboard** | React, Vite, Leaflet Maps, Tailwind CSS | `http://localhost:5173` | Command Center UI featuring live India disaster map, incident triage, and analytics. |
| **Disaster Community Portal**| React, Vite | `http://localhost:5174` | Crowdsourced citizen report stream simulating ground-level emergency posts. |
| **GDACS & Scraper Modules** | Python, BeautifulSoup, Trafilatura | CLI (`python gdacs_scraper.py`) | Automated acquisition and normalization of GDACS alerts & news sources. |

---

## ⚙️ Prerequisites

- **Node.js**: v18.x or v22.x (Verified with `v22.18.0`)
- **Python**: 3.10+ or 3.13 (Py launcher `py`)
- **MongoDB**: Active connection string configured in backend `.env`

---

## 🚀 Step-by-Step Launch Guide

To start the full RESQ-AI suite, run each service in separate terminal windows (or run in background):

### 1. Start the AI Microservice (Port 8000)
```bash
cd ai-service
py -u app.py
```
> **Note**: On startup, PyTorch loads both the `informativeness` and `humanitarian` DistilBERT models into memory (~10-15 seconds). Wait until `[AI] RESQ-AI AI service ready.` appears.

### 2. Start the Backend API Server (Port 3001)
```bash
cd resq-ai-dashboard/backend
node server.js
```
> Express will start listening on `http://localhost:3001` and launch `startSourceManager()` to sync GDACS feeds.

### 3. Start the RESQ-AI Dashboard UI (Port 5173)
```bash
cd resq-ai-dashboard
npm run dev
```
> Access the Command Center UI in your browser at: `http://localhost:5173/`

### 4. Start the Disaster Community Portal (Port 5174)
```bash
cd disaster-community
npm run dev
```
> Access the Community Feed UI in your browser at: `http://localhost:5174/`

---

## 🔍 Verification & Health Checks

Once services are running, verify their status via HTTP requests or terminal commands:

- **AI Service Health**:
  ```bash
  curl http://localhost:8000/health
  ```
  *Response*: `{"status":"healthy","models_loaded":true}`

- **Backend Service Health**:
  ```bash
  curl http://localhost:3001/api/health
  ```
  *Response*: `{"status":"alive"}`

- **AI Inference Test**:
  ```bash
  curl -X POST http://localhost:8000/api/ai/analyze ^
    -H "Content-Type: application/json" ^
    -d "{\"text\": \"Heavy rainfall caused severe flooding near Erode. 8 people trapped needing immediate rescue.\"}"
  ```

---

## 🛰️ Running Data Acquisition & Scraper Engines

### Fetch Latest GDACS Natural Disasters (India Scoped):
```bash
cd gdacs-module
py gdacs_scraper.py --days 30 --alert red orange
```
*Outputs JSON and CSV data to `gdacs-module/output/`.*

### Run Universal Community/News Scraper:
```bash
cd resq-scraper
py scraper.py --url "http://localhost:5174"
```
*Outputs scraped structured records to `resq-scraper/output/`.*

---

## 🛠️ Environment Configuration

### `resq-ai-dashboard/backend/.env`
```env
PORT=3001
MONGO_URI=mongodb+srv://codecatalystzzz_db_user:<password>@resq-cluster.cccpioi.mongodb.net/resq_ai?retryWrites=true&w=majority
AI_SERVICE_URL=http://localhost:8000
```

---

## ❓ Troubleshooting

1. **Port Conflicts**:
   If port `5173` or `3001` is occupied, Vite will automatically select `5174`. Ensure backend `.env` and AI service CORS settings reflect your updated ports.
2. **PyTorch Model Loading Delay**:
   First launch might take a moment to load weights into RAM/GPU. Monitor logs for `Application startup complete`.
3. **MongoDB Connectivity**:
   Ensure IP access is allowed on MongoDB Atlas if hosted remotely.
