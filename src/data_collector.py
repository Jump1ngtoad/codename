import requests
from datetime import datetime
from typing import Dict, Any

class DataCollector:
    def __init__(self, config):
        self.config = config
        
    async def collect_weather_data(self, location: Dict[str, float]) -> Dict[str, Any]:
        """Collect weather data for a specific location"""
        try:
            url = f"http://api.openweathermap.org/data/2.5/weather"
            params = {
                'lat': location['latitude'],
                'lon': location['longitude'],
                'appid': self.config.WEATHER_API_KEY
            }
            response = requests.get(url, params=params)
            return response.json()
        except Exception as e:
            print(f"Error collecting weather data: {e}")
            return {}
            
    async def collect_seismic_data(self) -> Dict[str, Any]:
        """Collect recent seismic activity data"""
        try:
            url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson"
            response = requests.get(url)
            return response.json()
        except Exception as e:
            print(f"Error collecting seismic data: {e}")
            return {} 