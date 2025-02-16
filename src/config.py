from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    # API Keys
    WEATHER_API_KEY = os.getenv('WEATHER_API_KEY')
    EARTHQUAKE_API_KEY = os.getenv('EARTHQUAKE_API_KEY')
    
    # Database
    DATABASE_URL = os.getenv('DATABASE_URL')
    
    # Notification Services
    FIREBASE_CREDENTIALS = os.getenv('FIREBASE_CREDENTIALS')
    
    # Model Parameters
    UPDATE_INTERVAL = int(os.getenv('UPDATE_INTERVAL', '300'))  # 5 minutes default
    RISK_THRESHOLD = float(os.getenv('RISK_THRESHOLD', '0.7')) 