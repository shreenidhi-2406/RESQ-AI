import requests
import json
import xml.etree.ElementTree as ET
import sys

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

print("=== Testing Realtime Fetch from https://www.gdacs.org/ ===")

# 1. Fetch GeoJSON Search API
try:
    print("\n1. Fetching GeoJSON API (https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH)...")
    url = "https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH"
    res = requests.get(url, timeout=15)
    data = res.json()
    features = data.get("features", [])
    print(f"✓ Retrieved {len(features)} total global events from GDACS GeoJSON API.")
    
    # Print sample events
    for f in features[:5]:
        props = f.get("properties", {})
        print(f"  - [{props.get('eventtype')}] {props.get('eventname')} | Country: {props.get('country')} | Alert: {props.get('alertlevel')}")
except Exception as e:
    print(f"✗ Error fetching GeoJSON API: {e}")

# 2. Fetch Live RSS Feed
try:
    print("\n2. Fetching Live RSS Feed (https://www.gdacs.org/xml/rss.xml)...")
    rss_url = "https://www.gdacs.org/xml/rss.xml"
    res = requests.get(rss_url, timeout=15)
    root = ET.fromstring(res.text)
    items = root.findall(".//item")
    print(f"✓ Retrieved {len(items)} realtime events from GDACS RSS feed.")
    for item in items[:5]:
        title = item.findtext("title")
        pubDate = item.findtext("pubDate")
        print(f"  - {title} | {pubDate}")
except Exception as e:
    print(f"✗ Error fetching RSS feed: {e}")
