from pydantic import BaseModel, confloat
from typing import Optional, Dict, Any
from datetime import datetime

class LocationBase(BaseModel):
    name: str
    latitude: confloat(ge=-90, le=90)
    longitude: confloat(ge=-180, le=180)

class LocationCreate(LocationBase):
    pass

class Location(LocationBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class RiskAssessmentBase(BaseModel):
    location_id: int
    risk_score: confloat(ge=0, le=1)
    weather_data: Dict[str, Any]
    seismic_data: Dict[str, Any]

class RiskAssessment(RiskAssessmentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class AlertBase(BaseModel):
    location_id: int
    risk_assessment_id: int
    alert_type: str
    message: str
    severity: int

class Alert(AlertBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True 