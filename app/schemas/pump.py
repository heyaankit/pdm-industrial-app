# necessary imports

from pydantic import BaseModel, Field
from datetime import datetime
from models import PumpStatus, MaintenanceRequired
from typing import Any, Optional 

# Pump's Schema

class PumpCreate(BaseModel):
    name: str = Field(..., max_length=50, description="Pump name")
    location: str = Field(..., max_length=100, description="Pump's location")
    