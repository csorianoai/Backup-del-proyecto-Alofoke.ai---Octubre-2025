#!/usr/bin/env python3
"""
Alofoke.ai Content Ingestion Pipeline
Fetches news from RSS feeds and Google News for DO and CO
"""

import os
import json
import hashlib
import feedparser
import requests
from datetime import datetime, timedelta
from pathlib import Path
import argparse

# Configuration
DATA_DIR = Path("data")
QUEUE_DIR = DATA_DIR / "queue"
SOURCES_DIR = DATA_DIR / "sources"

def load_country_sources(country_code):
    """Load RSS feeds and queries for a specific country"""
    sources_file = SOURCES_DIR / f"sources_{country_code}.json"
    if not sources_file.exists():
        print(f"⚠️  No sources found for {country_code}")
        return None
    
    with open(sources_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def fetch_rss_feed(feed_url, category="general"):
    """Fetch and parse RSS feed"""
    try:
        feed = feedparser.parse(feed_url)
        articles = []
        
        for entry in feed.entries[:20]:  # Limit to 20 most recent
            article = {
                "title": entry.get("title", ""),
                "link": entry.get("link", ""),
                "summary": entry.get("summary", entry.get("description", "")),
                "published": entry.get("published", entry.get("updated", "")),
                "source": feed.feed.get("title", feed_url),
                "category": category
            }
            articles.append(article)
        
        return articles
    except Exception as e:
        print(f"❌ Error fetching {feed_url}: {e}")
        return []

def fetch_google_news(query, country="do", days_back=2):
    """Fetch news from Google News RSS (no API key needed)"""
    try:
        # Google News RSS format
        base_url = "https://news.google.com/rss/search"
        params = {
            "q": query,
            "hl": "es",
            "gl": country.upper(),
            "ceid": f"{country.upper()}:es"
        }
        
        # Build URL
        url = f"{base_url}?q={requests.utils.quote(query)}&hl=es&gl={country.upper()}&ceid={country.upper()}:es"
        
        feed = feedparser.parse(url)
        articles = []
        
        cutoff_date = datetime.now() - timedelta(days=days_back)
        
        for entry in feed.entries[:15]:  # Limit to 15 per query
            try:
                pub_date = datetime(*entry.published_parsed[:6])
                if pub_date < cutoff_date:
                    continue
            except:
                pass
            
            article = {
                "title": entry.get("title", ""),
                "link": entry.get("link", ""),
                "summary": entry.get("summary", ""),
                "published": entry.get("published", ""),
                "source": entry.get("source", {}).get("title", "Google News"),
                "category": "ai_news",
                "query": query
            }
            articles.append(article)
        
        return articles
    except Exception as e:
        print(f"❌ Error fetching Google News for '{query}': {e}")
        return []

def generate_article_id(article):
    """Generate unique ID for article based on title + link"""
    content = f"{article['title']}{article['link']}"
    return hashlib.md5(content.encode()).hexdigest()[:12]

def deduplicate_articles(articles):
    """Remove duplicate articles based on ID"""
    seen = set()
    unique = []
    
    for article in articles:
        article_id = generate_article_id(article)
        if article_id not in seen:
            seen.add(article_id)
            article["id"] = article_id
            unique.append(article)
    
    return unique

def filter_ai_relevant(articles):
    """Filter articles relevant to AI/tech"""
    ai_keywords = [
        "inteligencia artificial", "ia", "ai", "machine learning",
        "chatgpt", "openai", "automatización", "robot", "algoritmo",
        "deep learning", "neural", "datos", "tecnología", "startup",
        "innovación", "digital", "software", "app", "plataforma"
    ]
    
    relevant = []
    for article in articles:
        text = f"{article['title']} {article['summary']}".lower()
        if any(keyword in text for keyword in ai_keywords):
            relevant.append(article)
    
    return relevant

def save_to_queue(articles, country_code):
    """Save articles to queue directory"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = QUEUE_DIR / f"{country_code}_{timestamp}.json"
    
    QUEUE_DIR.mkdir(parents=True, exist_ok=True)
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump({
            "country": country_code,
            "timestamp": datetime.now().isoformat(),
            "count": len(articles),
            "articles": articles
        }, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Saved {len(articles)} articles to {filename}")

def ingest_country(country_code, target_count=14):
    """Main ingestion pipeline for a country"""
    print(f"\n🔍 Starting ingestion for {country_code.upper()}...")
    
    # Load sources
    sources = load_country_sources(country_code)
    if not sources:
        return
    
    all_articles = []
    
    # Fetch RSS feeds
    print(f"📰 Fetching RSS feeds...")
    for feed in sources.get("feeds", []):
        articles = fetch_rss_feed(feed["url"], feed.get("category", "general"))
        all_articles.extend(articles)
        print(f"  • {feed['name']}: {len(articles)} articles")
    
    # Fetch Google News
    print(f"🔎 Fetching Google News...")
    for query in sources.get("google_news_queries", []):
        articles = fetch_google_news(query, country_code)
        all_articles.extend(articles)
        print(f"  • '{query}': {len(articles)} articles")
    
    # Deduplicate
    unique_articles = deduplicate_articles(all_articles)
    print(f"🔄 Deduplicated: {len(all_articles)} → {len(unique_articles)}")
    
    # Filter AI-relevant
    relevant_articles = filter_ai_relevant(unique_articles)
    print(f"🎯 AI-relevant: {len(relevant_articles)} articles")
    
    # Sort by recency and take top N
    relevant_articles.sort(key=lambda x: x.get("published", ""), reverse=True)
    final_articles = relevant_articles[:target_count]
    
    # Save to queue
    save_to_queue(final_articles, country_code)
    
    print(f"✅ {country_code.upper()} ingestion complete: {len(final_articles)} articles queued\n")

def main():
    parser = argparse.ArgumentParser(description="Ingest news for Alofoke.ai")
    parser.add_argument("--countries", nargs="+", default=["do", "co"], 
                       help="Country codes to process (e.g., do co)")
    parser.add_argument("--target", type=int, default=14, 
                       help="Target number of articles per country")
    
    args = parser.parse_args()
    
    print("🤖 Alofoke.ai Content Ingestion Pipeline")
    print("=" * 50)
    
    for country in args.countries:
        ingest_country(country, args.target)
    
    print("🎉 Ingestion pipeline complete!")

if __name__ == "__main__":
    main()
