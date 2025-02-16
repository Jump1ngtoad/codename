from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import get_db, engine

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DisasterAlert AI",
    description="AI-powered natural disaster warning system",
    version="1.0.0"
)

@app.get("/")
async def root():
    return {"status": "online", "service": "DisasterAlert AI"}

@app.post("/locations/", response_model=schemas.Location)
async def create_location(location: schemas.LocationCreate, db: Session = Depends(get_db)):
    db_location = models.Location(**location.dict())
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location

@app.get("/locations/", response_model=List[schemas.Location])
async def get_locations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    locations = db.query(models.Location).offset(skip).limit(limit).all()
    return locations

@app.get("/locations/{location_id}/risk", response_model=schemas.RiskAssessment)
async def get_location_risk(location_id: int, db: Session = Depends(get_db)):
    risk = db.query(models.RiskAssessment)\
        .filter(models.RiskAssessment.location_id == location_id)\
        .order_by(models.RiskAssessment.created_at.desc())\
        .first()
    if risk is None:
        raise HTTPException(status_code=404, detail="No risk assessment found")
    return risk 