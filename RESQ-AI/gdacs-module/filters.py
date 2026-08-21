def point_in_polygon(x, y, polygon):
    n = len(polygon)
    inside = False
    p1x, p1y = polygon[0]
    for i in range(1, n + 1):
        p2x, p2y = polygon[i % n]
        if min(p1y, p2y) < y <= max(p1y, p2y):
            if x <= max(p1x, p2x):
                if p1y != p2y:
                    xints = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                if p1x == p2x or x <= xints:
                    inside = not inside
        p1x, p1y = p2x, p2y
    return inside

def filter_by_alert(event, allowed_alerts):
    alert_level = event.get("properties", {}).get("alertlevel", "").lower()
    if not allowed_alerts:
        return True
    return alert_level in [a.lower() for a in allowed_alerts]

def filter_by_type(event, allowed_types):
    etype = event.get("properties", {}).get("eventtype", "")
    if not allowed_types:
        return True
    return etype.upper() in [t.upper() for t in allowed_types]

def filter_geographic(event, state_name, bbox, polygon):
    properties = event.get("properties", {})
    geometry = event.get("geometry", {})
    
    # 1. Check administrative string (country / descriptions can sometimes have it)
    desc = properties.get("htmldescription", "") + " " + properties.get("description", "")
    has_text_mention = state_name.lower() in desc.lower()

    # 2. Check coordinates
    in_bbox = False
    in_poly = False
    coords = None
    
    if geometry and geometry.get("type") == "Point":
        coords = geometry.get("coordinates")
        if coords and len(coords) >= 2:
            lon, lat = coords[0], coords[1]
            if bbox[0] <= lon <= bbox[2] and bbox[1] <= lat <= bbox[3]:
                in_bbox = True
                
            in_poly = point_in_polygon(lon, lat, polygon)
            
    # Combine signals
    if in_poly:
        return {"relevant": True, "near": False}
    if in_bbox:
        return {"relevant": False, "near": True}
    
    # Since text matching is a fallback, avoid false positives. 
    # If it is strongly stated in the text but not in poly, mark near/relevant carefully.
    if has_text_mention:
        return {"relevant": False, "near": True} # Fall back to near safely
        
    return {"relevant": False, "near": False}
