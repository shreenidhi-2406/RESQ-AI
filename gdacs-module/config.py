COUNTRY = "India"
STATE = "Tamil Nadu"

DISASTER_TYPES = [
    "FL",  # Flood
    "TC",  # Tropical Cyclone
    "EQ",  # Earthquake
    "DR",  # Drought
    "VO"   # Volcano
]

DISASTER_TYPE_NAMES = {
    "FL": "Flood",
    "TC": "Tropical Cyclone",
    "EQ": "Earthquake",
    "VO": "Volcano",
    "DR": "Drought"
}

ALERT_LEVELS = [
    "orange",
    "red"
]

DAYS_BACK = 7

# Rough bounding box [min_lon, min_lat, max_lon, max_lat]
STATE_BBOX = [76.2, 8.0, 80.4, 13.6]

# Simplified Polygon coordinates for Tamil Nadu (lon, lat)
STATE_POLYGON = [
    (76.2, 11.5),
    (76.7, 11.9),
    (77.6, 11.5),
    (78.2, 12.5),
    (79.3, 13.5),
    (80.2, 13.5),
    (80.4, 13.0),
    (79.8, 10.5),
    (79.2, 9.3),
    (78.2, 8.6),
    (77.5, 8.0),
    (77.1, 8.3),
    (76.9, 9.5),
    (77.2, 10.2),
    (76.7, 10.8),
    (76.2, 11.5)
]
