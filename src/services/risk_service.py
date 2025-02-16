from typing import Dict, Any, List, Tuple
import numpy as np
from datetime import datetime, timedelta
from models import Location, RiskAssessment, Alert
from sqlalchemy.orm import Session

class RiskService:
    def __init__(self, config):
        self.config = config
        
    def analyze_weather_risk(self, weather_data: Dict[str, Any]) -> Tuple[float, List[str]]:
        """Analyze weather data for risks"""
        risk_score = 0.0
        risk_factors = []
        
        if not weather_data:
            return 0.0, []
            
        # Wind speed analysis
        if 'wind' in weather_data:
            wind_speed = weather_data['wind'].get('speed', 0)
            if wind_speed > 32.7:  # Hurricane force winds
                risk_score += 0.4
                risk_factors.append(f"Hurricane force winds detected: {wind_speed} m/s")
            elif wind_speed > 17.2:  # Gale force winds
                risk_score += 0.2
                risk_factors.append(f"Gale force winds detected: {wind_speed} m/s")
        
        # Rainfall analysis
        if 'rain' in weather_data:
            rain_volume = weather_data['rain'].get('1h', 0)
            if rain_volume > 50:  # Extreme rainfall
                risk_score += 0.3
                risk_factors.append(f"Extreme rainfall detected: {rain_volume}mm/h")
            elif rain_volume > 20:  # Heavy rainfall
                risk_score += 0.2
                risk_factors.append(f"Heavy rainfall detected: {rain_volume}mm/h")
        
        # Temperature extremes
        if 'main' in weather_data:
            temp = weather_data['main'].get('temp', 0)
            if temp > 45:  # Extreme heat
                risk_score += 0.2
                risk_factors.append(f"Extreme heat detected: {temp}°C")
            elif temp < -30:  # Extreme cold
                risk_score += 0.2
                risk_factors.append(f"Extreme cold detected: {temp}°C")
        
        return min(risk_score, 0.8), risk_factors
    
    def analyze_seismic_risk(self, seismic_data: Dict[str, Any]) -> Tuple[float, List[str]]:
        """Analyze seismic data for risks"""
        risk_score = 0.0
        risk_factors = []
        
        if not seismic_data or 'features' not in seismic_data:
            return 0.0, []
        
        recent_earthquakes = seismic_data['features']
        significant_quakes = []
        
        for quake in recent_earthquakes:
            properties = quake['properties']
            magnitude = properties.get('mag', 0)
            
            if magnitude >= 7.0:
                significant_quakes.append((magnitude, "Major earthquake"))
                risk_score = max(risk_score, 0.9)
            elif magnitude >= 6.0:
                significant_quakes.append((magnitude, "Strong earthquake"))
                risk_score = max(risk_score, 0.7)
            elif magnitude >= 5.0:
                significant_quakes.append((magnitude, "Moderate earthquake"))
                risk_score = max(risk_score, 0.5)
        
        for magnitude, description in significant_quakes:
            risk_factors.append(f"{description} detected: Magnitude {magnitude}")
        
        return risk_score, risk_factors
    
    def calculate_combined_risk(self, weather_risk: float, seismic_risk: float) -> float:
        """Calculate combined risk score"""
        # Using a weighted maximum approach
        return max(weather_risk, seismic_risk)
    
    def analyze_location_risk(self, 
                            location: Location, 
                            weather_data: Dict[str, Any], 
                            seismic_data: Dict[str, Any]) -> Tuple[float, List[str]]:
        """Analyze all risks for a location"""
        weather_risk, weather_factors = self.analyze_weather_risk(weather_data)
        seismic_risk, seismic_factors = self.analyze_seismic_risk(seismic_data)
        
        combined_risk = self.calculate_combined_risk(weather_risk, seismic_risk)
        all_factors = weather_factors + seismic_factors
        
        return combined_risk, all_factors
    
    def create_alert(self, 
                    db: Session,
                    location: Location, 
                    risk_assessment: RiskAssessment, 
                    risk_factors: List[str]) -> Alert:
        """Create an alert if risk level is high enough"""
        if risk_assessment.risk_score >= self.config.RISK_THRESHOLD:
            alert = Alert(
                location_id=location.id,
                risk_assessment_id=risk_assessment.id,
                alert_type="HIGH_RISK",
                message=f"High risk detected: {'; '.join(risk_factors)}",
                severity=int(risk_assessment.risk_score * 10)
            )
            db.add(alert)
            db.commit()
            return alert
        return None 