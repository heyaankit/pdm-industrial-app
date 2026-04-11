# PdM Pump API - ML Integration Work Plan

## TL;DR

> FastAPI app with ML model for pump predictive maintenance. Fix bugs, complete ML pipeline, add prediction endpoints.

**Deliverables**:
- Working FastAPI server with pump CRUD operations
- ML model integrated for maintenance prediction
- Prediction API endpoint

**Estimated**: Short  
**Parallel**: No (sequential - bugs must be fixed first)

---

## Context

This is a resume project for a beginner. Simple FastAPI + ML integration for industrial pump predictive maintenance. Don't use advanced patterns like routers - keep it simple and understandable.

---

## Work Objectives

### Core Objective
Get a working FastAPI server that can:
1. Store pump assets in database
2. Accept sensor data (temperature, vibration, pressure, etc.)
3. Predict maintenance needs using ML model

### Must Have
- Working FastAPI server (no bugs)
- PostgreSQL database with Pump and PredictionLog tables
- Prediction endpoint returning maintenance_required + confidence_score

### Must NOT Have
- No routers/blueprints (keep simple - beginner project)
- No authentication (development mode)
- No advanced ML features (keep it basic for resume)

---

## Tasks

### Task 1: Fix Critical Bugs in main.py

**What to do**:
- Fix line 23: `app = fastapi()` → `app = FastAPI()`
- Update `app/db/base.py` to use SQLite: `DATABASE_URL = "sqlite:///pdm.db"`
- Fix line 5: Delete `import models.pump_models` (module doesn't exist)
- Fix line 34: Change `models.Base` to import Base from db.base

**QA Scenarios**:
- Run `python -c "from app.main import app"` - should import without errors

- [x] Task 1: Fix Critical Bugs in main.py

---

### Task 2: Fix Model Imports

**File**: `app/models/pump.py`

**What to do**:
- Line 3: `from database import Base` → `from app.db.base import Base`
- Line 5: `import Enum` → `import enum` and use `enum.Enum`

**QA Scenarios**:
- Run `python -c "from app.models.pump import Pump"` - should import without errors

- [x] Task 2: Fix Model Imports

---

### Task 3: Fix Schema Imports

**File**: `app/schemas/pump.py`

**What to do**:
- Line 5: Fix import paths for PumpStatus, MaintenanceRequired from models

**QA Scenarios**:
- Run `python -c "from app.schemas.pump import PredictionLogCreate"` - should import without errors

- [x] Task 3: Fix Schema Imports

---

### Task 4: Fix Feature Engineering Service

**File**: `app/services/pump_service.py`

**What to do**:
- Complete the `build_features()` function - currently returns empty dict
- Return all computed features as a dictionary with proper keys
- Fix typos (line 43: `labels` → `label`)

**Reference**: See notebook `notebooks/2_pump_preprocessing.ipynb` for feature engineering logic

**QA Scenarios**:
- Import and call the function with sample data - should return features dict

- [x] Task 4: Fix Feature Engineering Service

---

### Task 5: Implement ML Preprocessing Pipeline

**File**: `ml/pump/preprocess.py`

**What to do**:
- Copy feature engineering logic from notebook to this file
- Create `preprocess(data: dict) -> np.array` function
- Match exactly what was done in notebook (interaction features, ratio features, log transforms, polynomial, bins)

**Reference**: `notebooks/2_pump_preprocessing.ipynb` lines 783-842

- [x] Task 5: Implement ML Preprocessing Pipeline

---

### Task 6: Implement ML Prediction

**File**: `ml/pump/predict.py`

**What to do**:
- Train a DecisionTreeClassifier on the processed data
- Save the model to `ml/pump/model.pkl` using joblib
- Create `predict(features) -> (prediction, confidence)` function
- Use the same preprocessing as notebook

**Reference**: Notebook shows DecisionTree was used

- [x] Task 6: Implement ML Prediction

---

### Task 7: Implement Prediction API Endpoint

**File**: `app/api/v1/endpoints/pump.py`

**What to do**:
- Add POST endpoint `/predict` that:
  - Accepts sensor data (PredictionLogCreate schema)
  - Calls ML pipeline to get prediction
  - Returns maintenance_required + confidence_score
- Also save prediction to database (PumpPredictionLog)

**QA Scenarios**:
- Start server, send POST to /predict with sensor data
- Should return prediction and confidence

- [x] Task 7: Implement Prediction API Endpoint

---

### Task 8: Add Basic Pump CRUD Endpoints

**File**: `app/main.py` (keep it simple - no separate router file)

**What to do**:
- Add GET `/pumps` - list all pumps
- Add POST `/pumps` - create pump
- Add GET `/pumps/{id}` - get pump by ID

Keep everything in main.py for simplicity (beginner project)

- [x] Task 8: Add Basic Pump CRUD Endpoints

---

### Task 9: Test and Verify

**What to do**:
- Start the server with uvicorn
- Test all endpoints with curl or Postman
- Verify prediction works with sample sensor data

- [x] Task 9: Test and Verify

---

### Task 10: Create Comprehensive Interview Guide

**File to create**: `INTERVIEW_GUIDE.md` (in project root)

**What to do**:
Create a comprehensive markdown file that covers:

1. **Project Overview**
   - What is this project (Predictive Maintenance API)
   - Business problem it solves
   - Why this matters for industrial applications

2. **Architecture & Stack**
   - Why FastAPI (modern, auto-docs, type hints)
   - Why SQLite (simple, no setup, beginner-friendly)
   - Why scikit-learn (simple API, good for beginners)
   - Comparison with alternatives (Flask, Django, PostgreSQL)

3. **Directory Structure**
   - Explain each folder and file
   - Why this structure (beginner-friendly vs enterprise)

4. **Database Design**
   - ER diagram explanation
   - Why two tables (pumps + prediction_logs)
   - Relationship between them (one-to-many)
   - Schema decisions explained

5. **ML Pipeline Deep Dive**
   - Step-by-step workflow (raw data → features → model → prediction)
   - Why feature engineering matters
   - What features were created and why
   - Domain knowledge applied (how pump failures work)

6. **Code Deep Dive** (explain each major file)
   - `app/main.py` - Entry point, middleware, routing
   - `app/db/base.py` - Database configuration
   - `app/models/pump.py` - SQLAlchemy models, relationships
   - `app/schemas/pump.py` - Pydantic validation
   - `app/services/pump_service.py` - Feature engineering logic
   - `ml/pump/predict.py` - Model loading, prediction

7. **Interview Talking Points** (answer expected questions)
   - "Tell me about this project" (30-second pitch)
   - "How does the ML pipeline work?"
   - "Why did you choose Decision Tree?"
   - "How do you handle feature engineering?"
   - "What's the database schema?"
   - "What challenges did you face?"
   - "How would you improve this?"
   - "Walk me through the code flow when a prediction is made"

8. **Challenges & Lessons Learned**
   - Initial model only got 50% accuracy → fixed with feature engineering
   - Import bugs (fastapi vs FastAPI)
   - Model persistence (saving both model AND scaler)
   - What you learned about ML pipelines

9. **Future Improvements**
   - Short-term (more endpoints, error handling)
   - Medium-term (better models, Docker)
   - Long-term (auth, PostgreSQL, CI/CD)

10. **Quick Reference**
    - Key files to remember
    - Important commands
    - Library explanations

**Reference**: Look at `notebooks/2_pump_preprocessing.ipynb` for ML details and `learnings.md` for personal notes

**QA Scenarios**:
- File is created at project root
- Contains all sections listed above
- Can answer any technical question an interviewer might ask

- [x] Server starts without errors
- [x] Can create a pump
- [x] Can get pump by ID
- [x] Prediction endpoint returns maintenance_required and confidence_score
- [x] All sensor data features work (temperature, vibration, pressure, flow_rate, rpm, operational_hours)

---

## Notes for Resume

This project demonstrates:
- FastAPI basics (Pydantic, SQLAlchemy)
- ML integration with sklearn
- Feature engineering
- API design basics
- Database operations

Keep it simple - resume reviewers prefer clean, working code over complex but broken architectures.