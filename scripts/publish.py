#!/usr/bin/env python3
"""
Alofoke.ai Publishing Pipeline
Publishes approved articles to Markdown files and updates indices
"""

import os
import json
from datetime import datetime
from pathlib import Path
import argparse

# Configuration
DATA_DIR = Path("data")
APPROVED_DIR = DATA_DIR / "approved"
ARTICLES_DIR = DATA_DIR / "articles"
INDICES_DIR = DATA_DIR / "indices"
HISTORY_DIR = DATA_DIR / "publish_history"

def load_approved_articles():
    """Load all approved articles"""
    approved_files = list(APPROVED_DIR.glob("*.json"))
    approved = []
    
    for afile in approved_files:
        with open(afile, 'r', encoding='utf-8') as f:
            article = json.load(f)
            article["_filepath"] = afile
            approved.append(article)
    
    return approved

def generate_markdown_frontmatter(article):
    """Generate YAML frontmatter for article"""
    frontmatter = f"""---
title: "{article['title']}"
subtitle: "{article['subtitle']}"
date: "{article['date']}"
country: "{article['country']}"
type: "{article['type']}"
tier: "{article['tier']}"
human_verified: {str(article.get('human_verified', False)).lower()}
low_confidence: {str(article.get('low_confidence', False)).lower()}
sources: {json.dumps(article.get('sources', []))}
tags: {json.dumps(article.get('tags', []))}
slug: "{article['slug']}"
---
"""
    return frontmatter

def publish_article(article):
    """Publish article as Markdown file"""
    # Parse date for directory structure
    date_obj = datetime.fromisoformat(article['date'])
    year = date_obj.strftime("%Y")
    month = date_obj.strftime("%m")
    day = date_obj.strftime("%d")
    
    # Create directory structure: articles/country/year/month/day/
    article_dir = ARTICLES_DIR / article['country'] / year / month / day
    article_dir.mkdir(parents=True, exist_ok=True)
    
    # Create filename: slug.md
    filename = f"{article['slug']}.md"
    filepath = article_dir / filename
    
    # Check if article already exists (avoid duplicates)
    if filepath.exists():
        print(f"  ⚠️  Article already exists: {filename}")
        return None
    
    # Generate Markdown content
    markdown_content = generate_markdown_frontmatter(article) + "\n" + article['content']
    
    # Write file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(markdown_content)
    
    print(f"  ✅ Published: {article['country']}/{year}/{month}/{day}/{filename}")
    
    # Return metadata for index
    return {
        "title": article['title'],
        "subtitle": article['subtitle'],
        "date": article['date'],
        "country": article['country'],
        "type": article['type'],
        "tier": article['tier'],
        "slug": article['slug'],
        "url": f"/articulo/{year}/{month}/{day}/{article['slug']}",
        "tags": article.get('tags', []),
        "human_verified": article.get('human_verified', False),
        "low_confidence": article.get('low_confidence', False)
    }

def update_country_index(country, articles):
    """Update country-specific index"""
    index_file = INDICES_DIR / f"{country}.json"
    
    # Load existing index
    if index_file.exists():
        with open(index_file, 'r', encoding='utf-8') as f:
            index_data = json.load(f)
    else:
        index_data = {"country": country, "articles": []}
    
    # Add new articles (avoid duplicates by slug)
    existing_slugs = {a['slug'] for a in index_data['articles']}
    new_articles = [a for a in articles if a['slug'] not in existing_slugs]
    
    index_data['articles'].extend(new_articles)
    
    # Sort by date (newest first)
    index_data['articles'].sort(key=lambda x: x['date'], reverse=True)
    
    # Update metadata
    index_data['last_updated'] = datetime.now().isoformat()
    index_data['total_articles'] = len(index_data['articles'])
    
    # Save index
    INDICES_DIR.mkdir(parents=True, exist_ok=True)
    with open(index_file, 'w', encoding='utf-8') as f:
        json.dump(index_data, f, ensure_ascii=False, indent=2)
    
    print(f"  📇 Updated index: {country}.json ({len(new_articles)} new)")

def update_global_index(all_articles):
    """Update global LATAM index"""
    index_file = INDICES_DIR / "global.json"
    
    # Load existing index
    if index_file.exists():
        with open(index_file, 'r', encoding='utf-8') as f:
            index_data = json.load(f)
    else:
        index_data = {"region": "latam", "articles": []}
    
    # Add new articles
    existing_slugs = {a['slug'] for a in index_data['articles']}
    new_articles = [a for a in all_articles if a['slug'] not in existing_slugs]
    
    index_data['articles'].extend(new_articles)
    index_data['articles'].sort(key=lambda x: x['date'], reverse=True)
    
    # Update metadata
    index_data['last_updated'] = datetime.now().isoformat()
    index_data['total_articles'] = len(index_data['articles'])
    
    # Statistics by country
    by_country = {}
    for a in index_data['articles']:
        country = a['country']
        by_country[country] = by_country.get(country, 0) + 1
    index_data['by_country'] = by_country
    
    # Save
    with open(index_file, 'w', encoding='utf-8') as f:
        json.dump(index_data, f, ensure_ascii=False, indent=2)
    
    print(f"  🌎 Updated global index ({len(new_articles)} new)")

def save_publish_history(published_articles):
    """Save publication history"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    history_file = HISTORY_DIR / f"publish_{timestamp}.json"
    
    HISTORY_DIR.mkdir(parents=True, exist_ok=True)
    
    with open(history_file, 'w', encoding='utf-8') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "count": len(published_articles),
            "articles": published_articles
        }, f, ensure_ascii=False, indent=2)
    
    print(f"  📚 Saved publish history: {history_file.name}")

def publish_pipeline():
    """Main publishing pipeline"""
    print("\n🚀 Starting publishing pipeline...")
    
    # Load approved articles
    approved = load_approved_articles()
    if not approved:
        print("⚠️  No approved articles to publish")
        return
    
    print(f"📥 Publishing {len(approved)} approved articles...")
    
    published_metadata = []
    by_country = {}
    
    # Publish each article
    for article in approved:
        metadata = publish_article(article)
        
        if metadata:
            published_metadata.append(metadata)
            
            country = metadata['country']
            if country not in by_country:
                by_country[country] = []
            by_country[country].append(metadata)
            
            # Remove from approved directory
            article["_filepath"].unlink()
    
    # Update indices
    print(f"\n📇 Updating indices...")
    for country, articles in by_country.items():
        update_country_index(country, articles)
    
    update_global_index(published_metadata)
    
    # Save history
    save_publish_history(published_metadata)
    
    # Summary
    print(f"\n✅ Publishing complete!")
    print(f"  • Total published: {len(published_metadata)}")
    for country, articles in by_country.items():
        print(f"  • {country.upper()}: {len(articles)} articles")
    
    # Clean up queue (optional)
    cleanup_queue()

def cleanup_queue():
    """Clean up old queue files (keep last 7 days)"""
    from datetime import timedelta
    
    cutoff = datetime.now() - timedelta(days=7)
    queue_files = list(QUEUE_DIR.glob("*.json"))
    
    cleaned = 0
    for qfile in queue_files:
        # Parse timestamp from filename (format: do_20250114_120000.json)
        try:
            parts = qfile.stem.split("_")
            file_date = datetime.strptime(f"{parts[1]}_{parts[2]}", "%Y%m%d_%H%M%S")
            
            if file_date < cutoff:
                qfile.unlink()
                cleaned += 1
        except:
            pass
    
    if cleaned > 0:
        print(f"  🧹 Cleaned up {cleaned} old queue files")

def main():
    parser = argparse.ArgumentParser(description="Publish approved articles")
    
    args = parser.parse_args()
    
    print("🤖 Alofoke.ai Publishing Pipeline")
    print("=" * 50)
    
    publish_pipeline()

if __name__ == "__main__":
    main()
