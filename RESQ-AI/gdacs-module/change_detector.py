import os
import json

def load_previous_events(filepath="output/previous_events.json"):
    if os.path.exists(filepath):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_current_events(events_dict, filepath="output/previous_events.json"):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(events_dict, f, ensure_ascii=False, indent=2)

def detect_changes(current_events, previous_events):
    results = []
    alert_hierarchy = {"green": 1, "orange": 2, "red": 3}
    
    for event in current_events:
        eid = str(event["event_id"])
        if eid not in previous_events:
            event["change_status"] = "NEW EVENT"
            event["escalated"] = False
        else:
            prev = previous_events[eid]
            
            p_alert = (prev.get("current_alert_level") or prev.get("alert_level") or "").lower()
            c_alert = (event.get("alert_level") or "").lower()
            
            p_update = prev.get("last_update")
            c_update = event.get("last_update")
            
            p_score = alert_hierarchy.get(p_alert, 0)
            c_score = alert_hierarchy.get(c_alert, 0)
            
            escalated = c_score > p_score and p_score != 0
            
            if p_update != c_update or c_alert != p_alert:
                event["change_status"] = "UPDATED EVENT"
                event["escalated"] = escalated
                if escalated or c_alert != p_alert:
                    event["previous_alert_level"] = p_alert
                    event["current_alert_level"] = c_alert
            else:
                event["change_status"] = "UNCHANGED EVENT"
                event["escalated"] = False
                
        results.append(event)
        
    return results
