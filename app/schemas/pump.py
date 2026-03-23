# necessary imports

from pydantic import BaseModel, Field
from datetime import datetime
from models import PumpStatus, MaintenanceRequired
from typing import Any, Optional 

# Pump's Schema

class PumpCreate(BaseModel):
    name: str = Field(..., max_length=50, description="Pump name")
    location: str = Field(..., max_length=100, description="Pump's location")
    
class PumpResponse(BaseModel):
    id: int 
    name: str
    location: str
    installation_date: datetime
    status: PumpStatus

    model_config = {
        "from_attributes": True
    }

class PumpUpdate(BaseModel):
    name: Optional[str]
    location: Optional[str]
    status: Optional[PumpStatus]

# Prediction Log Schema

class PredictionLogCreate(BaseModel):
    pump_id: int = Field(..., ge=1)
    temperature: float = Field(...)
    vibration: float = Field(...)
    pressure: float = Field(...)
    flow_rate: float = Field(...)
    rpm: float = Field(...)
    operational_hours: float = Field(...)

class PredictionLogResponse(BaseModel):
    id: int
    pump_id: int
    temperature: float
    vibration: float
    pressure: float
    flow_rate: float
    rpm: float
    operational_hours: float
    maintenance_required: int
    confidence_score: float
    created_at: datetime

    model_config = {
        'from_attributes': True
    }

class PredictionLogUpdate(BaseModel):
    pump_id: Optional[int] = Field(..., ge=1)
    temperature: Optional[float] = Field(...)
    vibration: Optional[float] = Field(...)
    pressure: Optional[float] = Field(...)
    flow_rate: Optional[float] = Field(...)
    rpm: Optional[float] = Field(...)
    operational_hours: Optional[float] = Field(...)