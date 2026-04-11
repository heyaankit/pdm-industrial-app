from fastapi import FastAPI, Depends, status, HTTPException, Query
from typing import Optional, Annotated, List
from app.db.base import engine, SessionLocal, Base
from sqlalchemy.orm import Session
from app.models.pump import Pump, PumpStatus
from app.schemas.pump import PumpCreate
from app.api.v1.endpoints import pump as pump_endpoints

from fastapi.middleware.cors import CORSMiddleware

# Creating an instance of a Local session


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Creating session dependency
db_dependency = Annotated[Session, Depends(get_db)]

# Creating an instance of fastapi
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Mapping the created models to the database to create an actual database
Base.metadata.create_all(bind=engine)

# Include prediction endpoint
app.include_router(pump_endpoints.router, prefix="/api/v1")


@app.post("/pumps", status_code=status.HTTP_201_CREATED)
def create_pump(pump: PumpCreate, db: db_dependency):
    db_pump = Pump(name=pump.name, location=pump.location)
    db.add(db_pump)
    db.commit()
    db.refresh(db_pump)
    return db_pump


@app.get("/pumps")
def list_pumps(db: db_dependency):
    return db.query(Pump).all()


@app.get("/pumps/{pump_id}")
def get_pump(pump_id: int, db: db_dependency):
    pump = db.query(Pump).filter(Pump.id == pump_id).first()
    if not pump:
        raise HTTPException(status_code=404, detail="Pump not found")
    return pump


@app.patch("/pumps/{pump_id}/status")
def update_pump_status(pump_id: int, db: db_dependency, status: str = Query(...)):
    if status is None:
        raise HTTPException(status_code=400, detail="Status parameter is required")

    valid_statuses = ["Operational", "Under Maintenance", "Decommissioned"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}"
        )

    pump = db.query(Pump).filter(Pump.id == pump_id).first()
    if not pump:
        raise HTTPException(status_code=404, detail="Pump not found")

    pump.status = PumpStatus(status)
    db.commit()
    db.refresh(pump)
    return pump


# Home API
@app.get("/")
def index():
    return {"Message": "Welcome to this app"}


# ------------------------------------------Operations on Pump table---------------------------------------------

# List all pumps

# Create a new pump

# View a pump by it's id

# Update any existing pump

# Delete a pump


# ------------------------------------------Operations on Prediction Log table---------------------------------------

# List all prediction logs

# Create a new prediction log

# View a log by it's id

# Delete a prediction log
