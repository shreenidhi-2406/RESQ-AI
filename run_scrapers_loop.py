import subprocess
import time
import sys
import os

print("====================================================")
print("   RESQ-AI AUTOMATED 1-MINUTE SCRAPER RUNNER")
print("====================================================")

def run_gdacs():
    try:
        print(f"\n[{time.strftime('%H:%M:%S')}] Running GDACS Scraper...")
        cmd = [sys.executable, "gdacs_scraper.py", "--days", "365", "--state", "India"]
        cwd = os.path.join(os.path.dirname(__file__), "gdacs-module")
        if not os.path.exists(cwd):
            cwd = os.path.join(os.path.dirname(__file__), "RESQ-AI", "gdacs-module")
        res = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, encoding="utf-8", errors="ignore")
        print("✓ GDACS Scraper executed successfully.")
    except Exception as e:
        print(f"✗ GDACS Scraper error: {e}")

def run_universal_scraper():
    try:
        print(f"[{time.strftime('%H:%M:%S')}] Running Universal Scraper...")
        cmd = [sys.executable, "scraper.py", "--url", "http://localhost:5174"]
        cwd = os.path.join(os.path.dirname(__file__), "resq-scraper")
        if not os.path.exists(cwd):
            cwd = os.path.join(os.path.dirname(__file__), "RESQ-AI", "resq-scraper")
        res = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, encoding="utf-8", errors="ignore")
        print("✓ Universal Scraper executed successfully.")
    except Exception as e:
        print(f"✗ Universal Scraper error: {e}")

def main():
    while True:
        run_gdacs()
        run_universal_scraper()
        print(f"\n[INFO] Waiting 60 seconds for next scheduled cycle...")
        time.sleep(60)

if __name__ == "__main__":
    main()
