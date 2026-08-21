import requests
from datetime import datetime, timedelta

def get_event_list(from_date: datetime, to_date: datetime, country="India"):
    url = "https://www.gdacs.org/gdacsapi/api/events/geteventlist/Search"
    params = {
        "fromDate": from_date.strftime("%Y-%m-%d"),
        "toDate": to_date.strftime("%Y-%m-%d"),
        "country": country
    }
    
    try:
        response = requests.get(url, params=params, timeout=20)
        response.raise_for_status()
        
        if response.status_code == 204:
            return []
            
        data = response.json()
        if data and "features" in data:
            return data["features"]
        return []
    except Exception as e:
        print(f"[ERROR] Failed to retrieve events from GDACS API: {e}")
        return []

def get_event_details(event_type: str, event_id: str):
    url = "https://www.gdacs.org/gdacsapi/api/events/geteventdata"
    params = {
        "eventtype": event_type,
        "eventid": event_id
    }
    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            return response.json()
        return None
    except Exception:
        return None
