from fastapi import APIRouter, HTTPException
from app.schemas.pump import PredictionLogCreate
from app.services.pump_service import build_features
from ml.pump.preprocess import preprocess
from ml.pump.predict import predict
from app.db.base import SessionLocal
from app.models.pump import MaintenanceRequired
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/predict")
def predict_maintenance(sensor_data: PredictionLogCreate):
    """Predict if maintenance is required based on sensor data."""
    features = build_features(sensor_data)
    X = preprocess(features)
    maintenance_required, confidence, details = predict(X)

    db: Session = SessionLocal()
    try:
        from app.models.pump import PumpPredictionLog

        log = PumpPredictionLog(
            pump_id=sensor_data.pump_id,
            temperature=sensor_data.temperature,
            vibration=sensor_data.vibration,
            pressure=sensor_data.pressure,
            flow_rate=sensor_data.flow_rate,
            rpm=sensor_data.rpm,
            operational_hours=sensor_data.operational_hours,
            maintenance_required=MaintenanceRequired.yes
            if maintenance_required == "Yes"
            else MaintenanceRequired.no,
            confidence_score=confidence,
        )
        db.add(log)
        db.commit()
    finally:
        db.close()

    return {
        "maintenance_required": maintenance_required,
        "confidence_score": confidence,
        "details": details,
    }
