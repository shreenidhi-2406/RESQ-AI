import argparse
import sys
import json
import csv
from datetime import datetime, timedelta
import os

from config import (
    COUNTRY, STATE, DISASTER_TYPES, DISASTER_TYPE_NAMES, 
    ALERT_LEVELS, DAYS_BACK, STATE_BBOX, STATE_POLYGON
)
from gdacs_client import get_event_list, get_event_details
from filters import filter_by_alert, filter_by_type, filter_geographic
from change_detector import detect_changes, load_previous_events, save_current_events

def parse_args():
    parser = argparse.ArgumentParser(description="GDACS Data Acquisition Module for RESQ-AI")
    parser.add_argument("--days", type=int, default=DAYS_BACK, help="Number of days to search back")
    parser.add_argument("--type", type=str, nargs="+", default=DISASTER_TYPES, help="Disaster types (e.g. FL TC)")
    parser.add_argument("--alert", type=str, nargs="+", default=ALERT_LEVELS, help="Alert levels (e.g. red orange)")
    parser.add_argument("--state", type=str, default=STATE, help="Target state/region")
    return parser.parse_args()

def normalize_event(feature, details_data, near=False):
    props = feature.get("properties", {})
    geom = feature.get("geometry", {})
    
    event_id = str(props.get("eventid", ""))
    etype = props.get("eventtype", "")
    etype_name = DISASTER_TYPE_NAMES.get(etype, etype)
    
    coords = geom.get("coordinates") if geom and geom.get("type") == "Point" else None
    lon = coords[0] if coords and len(coords) >= 2 else None
    lat = coords[1] if coords and len(coords) >= 2 else None
    
    # Defaults from initial list
    severity = props.get("severitydata", {}).get("severity")
    pop_affected = None
    pop_exposed = None
    
    # Enhance with details if available
    if details_data:
        # details_data often contains more info, but structure varies by disaster type
        pass
        
    url = props.get("url", {}).get("report", "")
    
    return {
        "source": "GDACS",
        "event_id": event_id,
        "event_type": etype,
        "event_type_name": etype_name,
        "event_name": props.get("eventname", f"{etype_name} event"),
        "country": "India",
        "state": STATE,
        "location": props.get("country", ""),
        "latitude": lat,
        "longitude": lon,
        "alert_level": props.get("alertlevel", ""),
        "start_time": props.get("fromdate", ""),
        "last_update": props.get("datemodified", ""),
        "event_status": "Active" if str(props.get("iscurrent")).lower() == "true" else "Past",
        "population_exposed": pop_exposed,
        "population_affected": pop_affected,
        "severity": severity,
        "geometry": geom,
        "gdacs_url": url,
        "retrieved_at": datetime.now().isoformat(),
        "tamil_nadu_relevant": not near,
        "near_tamil_nadu": near
    }

def main():
    args = parse_args()
    
    print("====================================================")
    print("       RESQ-AI GDACS DATA ACQUISITION ENGINE")
    print("====================================================")
    print(f"\nSource: GDACS")
    print(f"Country: {COUNTRY}")
    print(f"State: {args.state}")
    print(f"Period: Last {args.days} days")
    print(f"Alert levels: {', '.join(args.alert)}")
    
    print("\nConnecting to GDACS API...")
    to_date = datetime.utcnow()
    from_date = to_date - timedelta(days=args.days)
    
    events = get_event_list(from_date, to_date, country=COUNTRY)
    if events is None:
        print("✗ API connection failed or timeout.")
        sys.exit(1)
        
    print("✓ API connection successful")
    
    print("\nRetrieving events...")
    print(f"✓ {len(events)} events retrieved for generic {COUNTRY} query")
    
    print(f"\nFiltering {COUNTRY} (Strict)...")
    india_events = []
    for ev in events:
        iso3 = ev.get("properties", {}).get("iso3", "")
        if "IND" in iso3 or "India" in ev.get("properties", {}).get("country", ""):
            india_events.append(ev)
            
    print(f"✓ {len(india_events)} relevant national events")
    
    # Filter alert and type
    filtered_events = []
    for ev in india_events:
        if filter_by_alert(ev, args.alert) and filter_by_type(ev, args.type):
            filtered_events.append(ev)
            
    print(f"\nFiltering {args.state}...")
    tn_events = []
    
    if args.state.lower() in ["india", "all", "none"]:
        # Skip the polygon restriction to let all India events through
        for ev in filtered_events:
            tn_events.append((ev, False))
    else:
        for ev in filtered_events:
            geo_result = filter_geographic(ev, args.state, STATE_BBOX, STATE_POLYGON)
            if geo_result["relevant"] or geo_result["near"]:
                tn_events.append((ev, geo_result["near"]))
            
    print(f"✓ {len(tn_events)} {args.state} events")
    
    if len(tn_events) > 0:
        print("\nRetrieving event details...")
        normalized = []
        for i, (ev, is_near) in enumerate(tn_events):
            etype = ev.get("properties", {}).get("eventtype", "")
            eid = ev.get("properties", {}).get("eventid", "")
            ename = ev.get("properties", {}).get("eventname", "Unknown")
            
            details = get_event_details(etype, eid)
            norm = normalize_event(ev, details, near=is_near)
            normalized.append(norm)
            print(f"[{i+1}/{len(tn_events)}] {ename[:20].ljust(20)} ✓")
            
        print("\nChecking previous data...")
        prev_data = load_previous_events()
        
        # compare
        results_with_diff = detect_changes(normalized, prev_data)
        
        new_count = sum(1 for e in results_with_diff if e["change_status"] == "NEW EVENT")
        upd_count = sum(1 for e in results_with_diff if e["change_status"] == "UPDATED EVENT")
        unchanged = len(results_with_diff) - new_count - upd_count
        
        if new_count > 0: print(f"🚨 {new_count} NEW EVENT(S)")
        if upd_count > 0: print(f"⚠ {upd_count} UPDATED EVENT(S)")
        if unchanged > 0: print(f"✓ {unchanged} UNCHANGED")
        
        # save for next run (as dictionary mapped by event_id)
        next_prev_data = load_previous_events() # load again to keep old ones not in window?
        # better to just update dictionary
        for ev in results_with_diff:
            next_prev_data[str(ev["event_id"])] = ev
            
        save_current_events(next_prev_data)
        
        print("\nSaving results...")
        os.makedirs("output", exist_ok=True)
        
        json_path = "output/gdacs_tamilnadu_events.json"
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(results_with_diff, f, ensure_ascii=False, indent=2)
        print(f"✓ {json_path}")
        
        csv_path = "output/gdacs_tamilnadu_events.csv"
        flat_keys = [
            "event_id", "event_type", "event_type_name", "event_name", 
            "country", "state", "location", "latitude", "longitude", 
            "alert_level", "start_time", "last_update", "event_status", 
            "population_exposed", "population_affected", "gdacs_url", 
            "retrieved_at", "tamil_nadu_relevant", "near_tamil_nadu",
            "change_status", "escalated"
        ]
        
        with open(csv_path, "w", encoding="utf-8", newline='') as f:
            writer = csv.DictWriter(f, fieldnames=flat_keys, extrasaction='ignore')
            writer.writeheader()
            writer.writerows(results_with_diff)
        print(f"✓ {csv_path}")
    else:
        print("\nNo events found matching criteria. Exiting cleanly.")
        
    print("\n====================================================")
    print("Complete")
    print("====================================================\n")

if __name__ == "__main__":
    main()
