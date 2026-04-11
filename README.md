# Predictive Maintenance API (PDM Industrial App)

A FastAPI-based predictive maintenance system for industrial pumps. The API predicts whether pumps require maintenance based on sensor data and provides detailed breakdown of which factors need attention.

## Features

- **Create, Read, Update pumps** - Full CRUD operations for pump assets
- **ML-powered predictions** - Predicts maintenance needs based on sensor data
- **Detailed factor analysis** - Shows exactly which parameters (temperature, vibration, pressure, etc.) are problematic
- **Status management** - Track pump status (Operational, Under Maintenance, Decommissioned)
- **SQLite database** - Simple, file-based database for easy setup

## Tech Stack

- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **SQLite** - File-based database
- **Pydantic** - Data validation
- **Python** - Core language

## Project Structure

```
pdm-industrial-app/
├── app/                    # FastAPI application
│   ├── main.py            # App entry point & endpoints
│   ├── api/v1/endpoints/  # API route handlers
│   ├── models/            # SQLAlchemy models
│   ├── schemas/           # Pydantic schemas
│   ├── services/          # Business logic
│   ├── db/                # Database config
│   └── core/              # Config & security
├── ml/pump/               # ML prediction module
│   ├── predict.py        # Prediction logic with factor analysis
│   ├── preprocess.py      # Feature preprocessing
│   └── preprocessing.py  # Colab notebook code
├── data/                  # Database (pdm.db)
├── dataset/               # Training data
└── requirements.txt       # Python dependencies
```

## Quick Start

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Run the server

```bash
uvicorn app.main:app --reload
```

Server runs at: http://127.0.0.1:8000

### 3. Access API docs

Open http://127.0.0.1:8000/docs for interactive Swagger documentation

## API Endpoints

### Pump Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/pumps` | Create a new pump |
| GET | `/pumps` | List all pumps |
| GET | `/pumps/{id}` | Get pump by ID |
| PATCH | `/pumps/{id}/status?status=Value` | Update pump status |

**Valid status values:** `Operational`, `Under Maintenance`, `Decommissioned`

### Prediction

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/predict` | Get maintenance prediction |

**Request body:**
```json
{
  "pump_id": 1,
  "temperature": 85.5,
  "vibration": 0.042,
  "pressure": 120.3,
  "flow_rate": 95.7,
  "rpm": 1450,
  "operational_hours": 3500
}
```

**Response:**
```json
{
  "maintenance_required": "Yes",
  "confidence_score": 0.95,
  "details": {
    "factor_details": {
      "temperature": {
        "status": "critical",
        "value": 145.0,
        "threshold": 140.0,
        "reason": "Temperature critically high"
      }
    },
    "score_breakdown": {
      "thermal": {"score": 5, "threshold": 3, "triggered": true},
      "mechanical": {"score": 3, "threshold": 3, "triggered": true},
      "hydraulic": {"score": 0, "threshold": 3, "triggered": false},
      "wearout": {"score": 0, "threshold": 3, "triggered": false}
    }
  }
}
```

## Prediction Logic

The API uses a scoring system based on domain knowledge to predict maintenance:

- **Thermal Failure**: High temperature + high RPM
- **Mechanical Failure**: High vibration + high RPM
- **Hydraulic Failure**: High pressure + low flow rate
- **Wear-out Failure**: High operational hours + high vibration

Each failure type has a score calculated from sensor values against thresholds (derived from dataset quantiles). If any score >= 3, maintenance is required.

## Example Usage

### Create a pump
```bash
curl -X POST http://localhost:8000/pumps \
  -H "Content-Type: application/json" \
  -d '{"name": "Pump-001", "location": "Building A"}'
```

### Get a prediction
```bash
curl -X POST http://localhost:8000/api/v1/predict \
  -H "Content-Type: application/json" \
  -d '{"pump_id": 1, "temperature": 145, "vibration": 5.0, "pressure": 280, "flow_rate": 5, "rpm": 2800, "operational_hours": 9500}'
```

### Update pump status
```bash
curl -X PATCH "http://localhost:8000/pumps/1/status?status=Under%20Maintenance"
```

## Database

The database file is stored at `data/pdm.db`. You can inspect it:

```bash
sqlite3 data/pdm.db "SELECT * FROM pumps;"
sqlite3 data/pdm.db "SELECT * FROM pump_prediction_logs;"
```

## Requirements

- Python 3.10+
- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn

See `requirements.txt` for full list.

## License

MIT License