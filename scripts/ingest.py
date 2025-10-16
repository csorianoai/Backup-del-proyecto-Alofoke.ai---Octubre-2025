#!/usr/bin/env python3
"""
Ingest news from RSS feeds and Google News
Outputs: data/queue/YYYY-MM-DD_{country}.json
"""
import argparse
import json
import os
from datetime import datetime
from pathlib import Path
from urllib.parse import quote_plus, urlencode
import feedparser
import requests

def load_sources(country_code):
    """Load source configuration for a country"""
    source_file = Path(f"data/sources/sources_{country_code}.json")
    if not source_file.exists():
        print(f"⚠️  No sources found for {country_code}")
        return None
    
    with open(source_file) as f:
        return json.load(f)

def fetch_rss_feeds(feeds):
    """Fetch articles from RSS feeds"""
    articles = []
    for feed in feeds:
        try:
            parsed = feedparser.parse(feed['url'])
            for entry in parsed.entries[:5]:
                articles.append({
                    'title': entry.title,
                    'url': entry.link,
                    'source': feed['name'],
                    'category': feed.get('category', 'general'),
                    'published': entry.get('published', ''),
                    'summary': entry.get('summary', '')[:300]
                })
        except Exception as e:
            print(f"❌ Error fetching {feed['name']}: {e}")
    return articles

def fetch_google_news(queries):
    """Fetch from Google News RSS"""
    articles = []
    base_url = "https://news.google.com/rss/search"
    
    for query in queries:
        try:
            # CRITICAL: Clean query of invisible characters before encoding
            clean_query = query.strip().replace('\n', ' ').replace('\r', '').replace('\t', ' ')
            # Remove multiple spaces
            clean_query = ' '.join(clean_query.split())
            # URL encode safely using urlencode to avoid any space/control character issues
            params = {"q": clean_query, "hl": "es", "gl": "CO", "ceid": "CO:es"}
            url = f"{base_url}?{urlencode(params)}"
            
            print(f"  → Fetching: {clean_query[:50]}...")
            parsed = feedparser.parse(url)
            
            for entry in parsed.entries[:3]:
                articles.append({
                    'title': entry.title,
                    'url': entry.link,
                    'source': 'Google News',
                    'category': 'news',
                    'published': entry.get('published', ''),
                    'summary': entry.get('summary', '')[:300]
                })
        except Exception as e:
            print(f"❌ Error with Google News query '{query[:30]}...': {e}")
    
    return articles

def deduplicate_articles(articles):
    """Remove duplicate articles by URL"""
    seen = set()
    unique = []
    for article in articles:
        if article['url'] not in seen:
            seen.add(article['url'])
            unique.append(article)
    return unique

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--countries', nargs='+', default=['do', 'co'])
    parser.add_argument('--target', type=int, default=14)
    args = parser.parse_args()
    
    today = datetime.now().strftime('%Y-%m-%d')
    queue_dir = Path('data/queue')
    queue_dir.mkdir(parents=True, exist_ok=True)
    
    for country in args.countries:
        print(f"\n📥 Ingesting content for {country.upper()}...")
        
        sources = load_sources(country)
        if not sources:
            continue
        
        all_articles = []
        
        print(f"  → Fetching RSS feeds...")
        all_articles.extend(fetch_rss_feeds(sources.get('feeds', [])))
        
        print(f"  → Fetching Google News...")
        all_articles.extend(fetch_google_news(sources.get('google_news_queries', [])))
        
        unique_articles = deduplicate_articles(all_articles)
        final_articles = unique_articles[:args.target]
        
        output_file = queue_dir / f"{today}_{country}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump({
                'date': today,
                'country': country,
                'articles': final_articles,
                'count': len(final_articles)
            }, f, ensure_ascii=False, indent=2)
        
        print(f"  ✓ Saved {len(final_articles)} articles to {output_file}")
    
    print("\n✅ Ingestion complete!")

if __name__ == '__main__':
    main()
