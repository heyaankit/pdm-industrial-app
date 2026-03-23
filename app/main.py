from fastapi import FastAPI, Depends, status, HTTPException
from typing import Optional, Annotated, List
from database import engine, SessionLocal
from sqlalchemy.orm import Session
import models.pump_models
from schemas.pump import *

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
app = fastapi()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins (for development)
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods
    allow_headers=["*"], # Allow all headers
)

# Mapping the created models to the database to create an actual database
models.Base.metadata.create_all(bind=engine)

# Home API
@app.get('/')
def index():
    return {'Message': 'Welcome to this app'}

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