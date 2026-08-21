import argparse
import sys
import os
import json
import csv
import re
from datetime import datetime
import urllib.parse
import traceback

import requests
from bs4 import BeautifulSoup
import trafilatura

from config import LOCATIONS, DISASTER_KEYWORDS

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 RESQ-AI/1.0"

def fetch_html(url):
    try:
        headers = {"User-Agent": USER_AGENT}
        resp = requests.get(url, headers=headers, timeout=15)
        resp.raise_for_status()
        return resp.text
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def fetch_with_playwright(url):
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(url, timeout=30000)
            content = page.content()
            browser.close()
            return content
    except ImportError:
        print("Playwright not installed. Skipping JS fallback.")
        return None
    except Exception as e:
        print(f"Playwright error: {e}")
        return None

def clean_text(text):
    if not text:
        return ""
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def check_disaster_relevance(text):
    if not text:
        return False
    text_lower = text.lower()
    for kw in DISASTER_KEYWORDS:
        if kw in text_lower:
            return True
    return False

def extract_location(text):
    if not text:
        return None
    text_lower = text.lower()
    for loc in LOCATIONS:
        if loc.lower() in text_lower:
            return loc
    return None

def extract_community_posts(html, base_url):
    soup = BeautifulSoup(html, 'html.parser')
    posts = soup.find_all(class_='disaster-post')
    results = []
    
    for post in posts:
        title_el = post.find(class_='post-title')
        author_el = post.find(class_='post-author')
        loc_el = post.find(class_='post-location')
        time_el = post.find(class_='post-time')
        content_el = post.find(class_='post-content')
        dtype_el = post.find(class_='post-disaster-type')
        sev_el = post.find(class_='post-severity')
        p_aff_el = post.find(class_='post-people-affected')
        
        post_id = post.get('data-post-id', '')
        url = urllib.parse.urljoin(base_url, f"/post/{post_id}" if post_id else "")
        
        title = clean_text(title_el.text) if title_el else ""
        content = clean_text(content_el.text) if content_el else ""
        
        rel_text = f"{title} {content}"
        
        affected = None
        if p_aff_el:
            aff_text = clean_text(p_aff_el.text)
            nums = re.findall(r'\d+', aff_text)
            if nums:
                affected = int(nums[0])
                
        dtype_text = clean_text(dtype_el.text).replace("Disaster: ", "") if dtype_el else ""
        sev_text = clean_text(sev_el.text).replace("Severity: ", "") if sev_el else ""

        results.append({
            "source_type": "community",
            "source_name": "Disaster Community",
            "source_url": base_url,
            "title": title,
            "author": clean_text(author_el.text) if author_el else "",
            "published_time": clean_text(time_el.text) if time_el else "",
            "location": clean_text(loc_el.text) if loc_el else "",
            "content": content,
            "url": url,
            "disaster_relevant": check_disaster_relevance(rel_text),
            "scraped_at": datetime.now().isoformat(),
            "disaster_type": dtype_text,
            "severity": sev_text,
            "people_affected": affected
        })
    return results

def discover_articles(html, base_url):
    soup = BeautifulSoup(html, 'html.parser')
    links = soup.find_all('a', href=True)
    
    candidates = []
    seen = set()
    
    for a in links:
        href = a['href']
        url = urllib.parse.urljoin(base_url, href)
        
        # normalize
        url = url.split('#')[0]
        
        if url in seen:
            continue
        if base_url not in url: # strictly same domain for now
            continue
            
        lower_href = href.lower()
        if any(bad in lower_href for bad in ['/login', '/signup', '/privacy', '/terms', '/contact', '/about']):
            continue
            
        score = 0
        if any(kw in lower_href for kw in ['/news/', '/article/', '/story/', '/202']):
            score += 2
        
        text = clean_text(a.text)
        if len(text) > 20:
            score += 1
            
        parent = a.find_parent('article')
        if parent:
            score += 1
            
        if score > 0:
            candidates.append({'url': url, 'score': score})
            seen.add(url)
            
    candidates.sort(key=lambda x: x['score'], reverse=True)
    return [c['url'] for c in candidates]

def extract_news_article(url, html):
    # Try trafilatura first
    t_text = trafilatura.extract(html, include_comments=False, include_tables=False)
    
    soup = BeautifulSoup(html, 'html.parser')
    
    # JSON-LD
    json_ld = {}
    for script in soup.find_all('script', type='application/ld+json'):
        try:
            data = json.loads(script.string)
            if isinstance(data, list):
                for item in data:
                    if item.get('@type') in ['NewsArticle', 'Article']:
                        json_ld = item
                        break
            elif data.get('@type') in ['NewsArticle', 'Article']:
                json_ld = data
        except:
            pass

    # Title
    title = json_ld.get('headline')
    if not title:
        og_title = soup.find('meta', property='og:title')
        title = og_title['content'] if og_title and og_title.get('content') else ""
    if not title:
        h1 = soup.find('h1')
        title = clean_text(h1.text) if h1 else ""
    if not title and soup.title:
        title = clean_text(soup.title.text)
        
    # Content
    content = t_text
    if not content:
        article_el = soup.find('article')
        if article_el:
            content = clean_text(article_el.text)
        else:
            ps = soup.find_all('p')
            content = " ".join([clean_text(p.text) for p in ps if len(clean_text(p.text)) > 30])
            
    # Description
    desc = json_ld.get('description')
    if not desc:
        m_desc = soup.find('meta', attrs={'name': 'description'})
        desc = m_desc['content'] if m_desc and m_desc.get('content') else ""
        
    # Author
    author = ""
    a_data = json_ld.get('author')
    if isinstance(a_data, dict):
        author = a_data.get('name', '')
    elif isinstance(a_data, list) and len(a_data) > 0:
        author = a_data[0].get('name', '')
    elif isinstance(a_data, str):
        author = a_data
        
    if not author:
        m_auth = soup.find('meta', attrs={'name': 'author'}) or soup.find('meta', property='article:author')
        author = m_auth['content'] if m_auth and m_auth.get('content') else ""
        
    # Published Time
    pub_time = json_ld.get('datePublished', '')
    if not pub_time:
        m_time = soup.find('meta', property='article:published_time')
        pub_time = m_time['content'] if m_time and m_time.get('content') else ""
    if not pub_time:
        time_el = soup.find('time')
        pub_time = time_el.get('datetime', clean_text(time_el.text)) if time_el else ""
        
    loc = extract_location(title + " " + (content or ""))
    rel = check_disaster_relevance(title + " " + desc + " " + (content or ""))
    
    return {
        "source_type": "news",
        "source_name": urllib.parse.urlparse(url).netloc,
        "source_url": url,
        "title": title,
        "author": author,
        "published_time": pub_time,
        "location": loc,
        "content": content or desc,
        "url": url,
        "disaster_relevant": rel,
        "scraped_at": datetime.now().isoformat(),
        "disaster_type": None,
        "severity": None,
        "people_affected": None
    }

def main():
    print("=" * 50)
    print("        RESQ-AI UNIVERSAL SCRAPER")
    print("=" * 50)

    parser = argparse.ArgumentParser()
    parser.add_argument("--url", type=str, help="Target website URL")
    parser.add_argument("--limit", type=int, default=10, help="Max articles to scrape")
    parser.add_argument("--mode", type=str, default="auto", choices=["auto", "community", "news"], help="Scraping mode")
    
    args, unknown = parser.parse_known_args()
    
    url = args.url
    if not url:
        url = input("Enter website URL:\n> ").strip()
        
    if not url:
        print("Error: No URL provided.")
        return
        
    print(f"\nURL:\n{url}\n")
    print("Detecting website type...")
    
    html = fetch_html(url)
    
    if html:
        soup_test = BeautifulSoup(html, 'html.parser')
        if len(soup_test.find_all(['p', 'article', 'h1', 'h2', 'li'])) < 3 or 'id="root"' in html:
            print("Page appears JavaScript-dependent. Trying Playwright fallback...")
            p_html = fetch_with_playwright(url)
            if p_html:
                html = p_html

    if not html:
        print("Trying Playwright fallback...")
        html = fetch_with_playwright(url)
        
    if not html:
        print("⚠ Website unreachable or blocking requests.")
        return
        
    print("\n✓ Website reachable")
    
    mode = args.mode
    if mode == "auto":
        soup = BeautifulSoup(html, 'html.parser')
        if soup.find(class_='disaster-post'):
            mode = "community"
        elif 'disaster-post' in html:
            mode = "community" # loose check
        else:
            mode = "news"
            
    results = []
    
    if mode == "community":
        print("\n✓ Disaster Community detected")
        posts = extract_community_posts(html, url)
        print(f"✓ Found {len(posts)} community posts")
        results = [p for p in posts if p.get('content') or p.get('title')]
        print(f"✓ Scraped {len(results)} posts")
        
    elif mode == "news":
        print("\n✓ Generic news website detected")
        print("Discovering articles...\n")
        
        candidate_urls = discover_articles(html, url)
        if url not in candidate_urls:
             candidate_urls.insert(0, url)
            
        candidate_urls = candidate_urls[:args.limit]
        print(f"Found {len(candidate_urls)} candidate articles.\n")
        
        print("Scraping...\n")
        
        for i, curr_url in enumerate(candidate_urls):
            try:
                a_html = fetch_html(curr_url)
                if not a_html:
                    continue
                data = extract_news_article(curr_url, a_html)
                results.append(data)
                short_title = data['title'][:30] if data['title'] else "Unknown Title"
                print(f"[{i+1}/{len(candidate_urls)}] {short_title.ljust(30)} ✓")
            except Exception as e:
                print(f"[{i+1}/{len(candidate_urls)}] Failed {curr_url}: {e} ✗")
                
    # Deduplication
    unique_results = []
    seen_titles = set()
    seen_urls = set()
    
    for r in results:
        t = r['title'].strip().lower() if r['title'] else ""
        u = r['url']
        
        # basic detection for duplicates
        t_base = t.split('|')[0].strip()
        
        if u in seen_urls:
            continue
        if t_base and t_base in seen_titles:
            continue
            
        seen_urls.add(u)
        if t_base:
            seen_titles.add(t_base)
            
        unique_results.append(r)
        
    disaster_count = sum(1 for r in unique_results if r['disaster_relevant'])
    
    print("\nFiltering disaster relevance...")
    print(f"Disaster-related articles: {disaster_count}")
    
    print("\nRemoving duplicates...")
    print(f"Final records: {len(unique_results)}")
    print("\nSaving data...")
    
    os.makedirs("output", exist_ok=True)
    
    with open("output/scraped_data.json", "w", encoding="utf-8") as f:
        json.dump(unique_results, f, ensure_ascii=False, indent=2)
    print("✓ JSON saved")
        
    if unique_results:
        keys = unique_results[0].keys()
        with open("output/scraped_data.csv", "w", encoding="utf-8", newline='') as f:
            writer = csv.DictWriter(f, fieldnames=keys)
            writer.writeheader()
            writer.writerows(unique_results)
        print("✓ CSV saved")
        
    print("\n" + "=" * 50)

if __name__ == "__main__":
    main()
