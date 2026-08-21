# GDACS Data Acquisition Engine for RESQ-AI

This standalone module is designed to collect and normalize disaster metadata from the official GDACS (Global Disaster Alert and Coordination System) API. 

## 1. What GDACS Is

GDACS provides near real-time alerts about natural disasters around the world and tools to facilitate response coordination, including multi-hazard disaster monitoring and alerting.

## 2. Why Use the Official API?

We use the `/events/geteventlist/Search` API from GDACS rather than scraping the GDACS homepage because the API returns predictable, schema-defined JSON/GeoJSON directly designed for machine consumption. HTML scraping on their interactive map dashboard would be fragile, slow, and violate standard API data-consumption agreements.

## 3. Installation

```bash
pip install -r requirements.txt
```

## 4. How to Run

By default, the script searches India for the past 7 days, filtering events geographically scoped to Tamil Nadu (or surrounding boxes), and captures Orange/Red alert disasters.

```bash
python gdacs_scraper.py
```

You can customize the parameters:

```bash
python gdacs_scraper.py --days 30 --type FL TC --alert red orange
```

## 5. Tamil Nadu Filtering

Tamil Nadu is filtered stringently using Geographic intersections:
- We compute whether the `Event Geometry` provided by GDACS intersects a hand-coded polygon simulating the Tamil Nadu State border.
- If it's near or within the broad bounding box but mathematically misses the precise polygon, it's flagged as `near_tamil_nadu = true`.
- Simple keyword descriptions are used only as a fallback.

## 6. How new/updated events are detected

A local `output/previous_events.json` state database stores the most recently retrieved instances of events hashed by `event_id`. Whenever a new run completes, fields like `datemodified` and `alertlevel` are compared to the saved state to accurately report:
- `NEW EVENT`
- `UPDATED EVENT`
- `UNCHANGED EVENT`

If an event escalates (e.g. `Orange` to `Red`), the field `escalated = true` is emitted.

## 7. Connecting to RESQ-AI

As part of the RESQ-AI pipeline, you should point your AI consumption scripts to read from:
- `output/gdacs_tamilnadu_events.json` 
- `output/gdacs_tamilnadu_events.csv`

The AI system will parse these clean records (such as coordinates, names, severity updates, and URLs) and formulate dispatch decisions or severity analysis based on real-time escalations.

*Note: Data extracted is for prototype decision support, not an autonomous emergency dispatch system.*
