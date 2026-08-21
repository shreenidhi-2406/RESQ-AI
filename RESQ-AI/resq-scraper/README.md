# RESQ-AI Universal Scraper

A robust python-based web scraping module designed to collect disaster-related information from disaster community platforms as well as generic news websites.

## Features
- **Two Scraping Modes**: Custom community extraction and generic news article extraction.
- **Adaptive Scraping**: Utilizes BeautifulSoup and Trafilatura to adaptively gather metadata (title, content, author, timestamp) and structured JSON-LD.
- **Relevance Filtering**: Automatically identifies if the article mentions key disaster words like flood, earthquake, rescue.
- **Deduplication**: Filters out duplicate urls and identical titles automatically.
- **Universal Common Output schema**: Saves out standardized fields for cross-referencing capabilities to JSON and CSV formats.

## Setup
```bash
pip install -r requirements.txt
```

## Running
With interactive prompt for URL:
```bash
python scraper.py
```

With CLI Arguments:
```bash
python scraper.py --url "http://localhost:5173"
python scraper.py --url "https://example-news.com" --limit 20
```

## Folder Structure
- `scraper.py`: Core functionality.
- `config.py`: Defined disaster words and local regions list.
- `output/`: Folder generated housing scraped JSON/CSV files.
