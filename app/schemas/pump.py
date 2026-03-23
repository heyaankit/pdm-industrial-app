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
    temperature: int = Field(...)
    vibration: int = Field(...)
    pressure: int = Field(...)
    flow_rate: int = Field(...)
    rpm: int = Field(...)
    operational_hours: int = Field(...)

class PredictionLogResponse(BaseModel):
    id: int
    pump_id: int
    temperature: int
    vibration: int
    pressure: int
    flow_rate: int
    rpm: int 
    operational_hours: int 
    maintenance_required: int 
    confidence_score: int 
    created_at: datetime

    model_config = {
        'from_attributes': True
    }

class PredictionLogUpdate(BaseModel):
    pump_id: Optional[int] = Field(..., ge=1)
    temperature: Optional[int] = Field(...)
    vibration: Optional[int] = Field(...)
    pressure: Optional[int] = Field(...)
    flow_rate: Optional[int] = Field(...)
    rpm: Optional[int] = Field(...)
    operational_hours: Optional[int] = Field(...)