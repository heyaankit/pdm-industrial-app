# necessary imports 
from sqlalchemy import Boolean, Column, String, Integer, Float, DateTime, ForeignKey, Enum, JSON
from database import Base
from datetime import datetime
import Enum
from sqlalchemy.orm import relationship

# Pumps (Asset) table 

class PumpStatus(str, enum.Enum):
    operational = 'Operational'
    under_maintainence = 'Under Maintenance'
    decommissioned = 'Decommissioned'

class Pump(Base):
    __tablename__= 'pumps'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True)
    location = Column(String(100))
    installation_date = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(PumpStatus), nullable=False, default=PumpStatus.operational)

# Prediction Log

class MaintenanceRequired(str, enum.Enum):
    yes = 'Yes'
    no = 'No'

class PumpPredictionLog(Base):
    __tablename__ = 'pump_prediction_logs'

    id = Column(Integer, primary_key=True, index=True)
    pump_id = Column(Integer, ForeignKey('pumps.id'), nullable=False, index=True)
    temperature = Column(Float, nullable=False)
    vibration = Column(Float, nullable=False)
    pressure = Column(Float, nullable=False)
    flow_rate = Column(Float, nullable=False)
    rpm = Column(Float, nullable=False)
    operational_hours = Column(Float, nullable=False)
    maintenance_required = Column(Enum(MaintenanceRequired), nullable=False, default=MaintenanceRequired.no)
    confidence_score = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)