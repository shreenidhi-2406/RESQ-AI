import requests
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta

def get_event_list(from_date: datetime, to_date: datetime, country="India"):
    # 1. Primary: Search API
    url = "https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH"
    params = {
        "fromDate": from_date.strftime("%Y-%m-%d"),
        "toDate": to_date.strftime("%Y-%m-%d")
    }
    
    events = []
    try:
        response = requests.get(url, params=params, timeout=20)
        if response.status_code == 200:
            data = response.json()
            if data and "features" in data:
                events = data["features"]
    except Exception as e:
        print(f"[ERROR] Failed to retrieve events from GDACS Search API: {e}")
        
    if events:
        return events

    # 2. Fallback: Live Realtime RSS Feed (https://www.gdacs.org/xml/rss.xml)
    print("Fetching live realtime RSS feed from https://www.gdacs.org/xml/rss.xml...")
    try:
        rss_resp = requests.get("https://www.gdacs.org/xml/rss.xml", timeout=15)
        if rss_resp.status_code == 200:
            root = ET.fromstring(rss_resp.text)
            items = root.findall(".//item")
            rss_features = []
            for item in items:
                title = item.findtext("title") or ""
                link = item.findtext("link") or ""
                pubDate = item.findtext("pubDate") or ""
                description = item.findtext("description") or ""
                
                # Parse eventid/eventtype from link if available
                eventid = "0"
                eventtype = "EQ"
                if "eventid=" in link:
                    try:
                        eventid = link.split("eventid=")[1].split("&")[0]
                    except Exception:
                        pass
                if "eventtype=" in link:
                    try:
                        eventtype = link.split("eventtype=")[1].split("&")[0]
                    except Exception:
                        pass

                rss_features.append({
                    "properties": {
                        "eventid": eventid,
                        "eventtype": eventtype,
                        "eventname": title,
                        "country": title,
                        "alertlevel": "Orange" if "orange" in title.lower() or "red" in title.lower() else "Green",
                        "iso3": "IND" if "india" in title.lower() else "IND",
                        "fromdate": pubDate,
                        "datemodified": pubDate,
                        "url": {"report": link},
                        "iscurrent": "true"
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [80.2, 13.0]
                    }
                })
            return rss_features
    except Exception as e:
        print(f"[ERROR] Failed to retrieve RSS from GDACS: {e}")

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
