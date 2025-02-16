from typing import Dict, Any, List
import aiohttp
import asyncio
from datetime import datetime, timedelta
from models import Location
from config import Config

class DataService:
    def __init__(self, config: Config):
        self.config = config
        self.session = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def get_weather_data(self, location: Location) -> Dict[str, Any]:
        """Fetch weather data from OpenWeatherMap API"""
        url = "http://api.openweathermap.org/data/2.5/weather"
        params = {
            'lat': location.latitude,
            'lon': location.longitude,
            'appid': self.config.WEATHER_API_KEY,
            'units': 'metric'
        }
        
        async with self.session.get(url, params=params) as response:
            if response.status == 200:
                return await response.json()
            else:
                return {}
    
    async def get_seismic_data(self, location: Location) -> Dict[str, Any]:
        """Fetch seismic data from USGS API"""
        # Calculate bounding box (roughly 300km around the location)
        lat_range = 2.7  # approximately 300km
        lon_range = 2.7 / abs(location.latitude)
        
        url = "https://earthquake.usgs.gov/fdsnws/event/1/query"
        params = {
            'format': 'geojson',
            'starttime': (datetime.utcnow() - timedelta(days=1)).isoformat(),
            'minlatitude': location.latitude - lat_range,
            'maxlatitude': location.latitude + lat_range,
            'minlongitude': location.longitude - lon_range,
            'maxlongitude': location.longitude + lon_range,
            'minmagnitude': 2.5
        }
        
        async with self.session.get(url, params=params) as response:
            if response.status == 200:
                return await response.json()
            else:
                return {}

    async def collect_all_data(self, location: Location) -> Dict[str, Any]:
        """Collect all relevant data for a location"""
        weather_data = await self.get_weather_data(location)
        seismic_data = await self.get_seismic_data(location)
        
        return {
            'weather': weather_data,
            'seismic': seismic_data,
            'timestamp': datetime.utcnow().isoformat()
        } 