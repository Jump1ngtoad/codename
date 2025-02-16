import asyncio
from datetime import datetime
from sqlalchemy.orm import Session
from typing import List
import models
from services.data_service import DataService
from services.risk_service import RiskService
from database import SessionLocal
from config import Config

class DataCollectionWorker:
    def __init__(self, config: Config):
        self.config = config
        self.running = False
        self.risk_service = RiskService(config)
    
    async def collect_and_store_data(self, db: Session):
        """Collect and store data for all locations"""
        locations = db.query(models.Location).all()
        
        async with DataService(self.config) as data_service:
            for location in locations:
                try:
                    data = await data_service.collect_all_data(location)
                    
                    # Analyze risks
                    risk_score, risk_factors = self.risk_service.analyze_location_risk(
                        location,
                        data['weather'],
                        data['seismic']
                    )
                    
                    # Create new risk assessment
                    risk_assessment = models.RiskAssessment(
                        location_id=location.id,
                        weather_data=data['weather'],
                        seismic_data=data['seismic'],
                        risk_score=risk_score
                    )
                    
                    db.add(risk_assessment)
                    db.commit()
                    
                    # Create alert if risk is high
                    self.risk_service.create_alert(db, location, risk_assessment, risk_factors)
                    
                except Exception as e:
                    print(f"Error collecting data for location {location.id}: {e}")
                    continue
    
    async def run(self):
        """Run the worker process"""
        self.running = True
        
        while self.running:
            try:
                db = SessionLocal()
                await self.collect_and_store_data(db)
            except Exception as e:
                print(f"Error in worker process: {e}")
            finally:
                db.close()
            
            await asyncio.sleep(self.config.UPDATE_INTERVAL)
    
    def stop(self):
        """Stop the worker process"""
        self.running = False 