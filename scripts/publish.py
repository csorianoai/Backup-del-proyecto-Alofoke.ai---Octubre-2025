#!/usr/bin/env python3
"""
Publish approved articles to data/articles/ as Markdown files
"""
import json
import re
from datetime import datetime
from pathlib import Path
import frontmatter

def slugify(text):
    """Convert text to URL-friendly slug"""
    text = text.lower()
    text = re.sub(r'[áàäâ]', 'a', text)
    text = re.sub(r'[éèëê]', 'e', text)
    text = re.sub(r'[íìïî]', 'i', text)
    text = re.sub(r'[óòöô]', 'o', text)
    text = re.sub(r'[úùüû]', 'u', text)
    text = re.sub(r'[ñ]', 'n', text)
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = text.strip('-')
    return text[:60]

def create_article_file(article, country, date_obj):
    """Create markdown file for an article"""
    year = date_obj.strftime('%Y')
    month = date_obj.strftime('%m')
    day = date_obj.strftime('%d')
    
    slug = slugify(article['title'])
    
    article_dir = Path(f"data/articles/{country}/{year}/{month}/{day}")
    article_dir.mkdir(parents=True, exist_ok=True)
    
    filename = f"{slug}.md"
    filepath = article_dir / filename
    
    metadata = {
        'title': article['title'],
        'subtitle': article.get('subtitle', ''),
        'date': date_obj.isoformat(),
        'country': country,
        'type': article['type'],
        'tier': article['tier'],
        'value_score': article.get('value_score', 0),
        'human_verified': article.get('human_verified', False),
        'low_confidence': article.get('low_confidence', False),
        'sources': article.get('sources', []),
        'tags': article.get('tags', []),
        'slug': slug
    }
    
    post = frontmatter.Post(article['body_html'], **metadata)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(frontmatter.dumps(post))
    
    return {
        'title': article['title'],
        'subtitle': article.get('subtitle', ''),
        'slug': slug,
        'url': f"/{country}/{year}/{month}/{day}/{slug}",
        'date': date_obj.isoformat(),
        'type': article['type'],
        'tier': article['tier'],
        'tags': article.get('tags', []),
        'country': country
    }

def update_indices(published_articles, country, date_obj):
    """Update JSON indices"""
    indices_dir = Path('data/indices')
    indices_dir.mkdir(parents=True, exist_ok=True)
    
    country_index_file = indices_dir / f"{country}.json"
    if country_index_file.exists():
        with open(country_index_file) as f:
            country_index = json.load(f)
    else:
        country_index = {'country': country, 'articles': []}
    
    country_index['articles'] = published_articles + country_index['articles']
    country_index['updated_at'] = datetime.now().isoformat()
    country_index['articles'] = country_index['articles'][:100]
    
    with open(country_index_file, 'w', encoding='utf-8') as f:
        json.dump(country_index, f, ensure_ascii=False, indent=2)
    
    global_index_file = indices_dir / 'global.json'
    if global_index_file.exists():
        with open(global_index_file) as f:
            global_index = json.load(f)
    else:
        global_index = {'articles': []}
    
    global_index['articles'] = published_articles + global_index['articles']
    global_index['updated_at'] = datetime.now().isoformat()
    global_index['articles'] = global_index['articles'][:200]
    
    with open(global_index_file, 'w', encoding='utf-8') as f:
        json.dump(global_index, f, ensure_ascii=False, indent=2)

def main():
    today = datetime.now().strftime('%Y-%m-%d')
    date_obj = datetime.now()
    approved_dir = Path('data/approved')
    
    total_published = 0
    
    for approved_file in approved_dir.glob(f'{today}_*.json'):
        if '_held' in approved_file.stem:
            continue
        
        country = approved_file.stem.split('_')[-1]
        print(f"\n📰 Publishing {country.upper()}...")
        
        with open(approved_file) as f:
            approved_data = json.load(f)
        
        articles = approved_data['articles']
        published = []
        
        for i, article in enumerate(articles, 1):
            print(f"  → Publishing article {i}/{len(articles)}: {article['title'][:50]}...")
            
            try:
                article_info = create_article_file(article, country, date_obj)
                published.append(article_info)
                print(f"    ✓ {article_info['url']}")
            except Exception as e:
                print(f"    ❌ Error: {e}")
        
        if published:
            update_indices(published, country, date_obj)
            print(f"  ✓ Published {len(published)} articles for {country}")
            total_published += len(published)
    
    print(f"\n✅ Total published: {total_published} articles")
    
    summary = {
        'date': today,
        'published_at': datetime.now().isoformat(),
        'total_articles': total_published,
        'countries_updated': []
    }
    
    for approved_file in approved_dir.glob(f'{today}_*.json'):
        if '_held' not in approved_file.stem:
            country = approved_file.stem.split('_')[-1]
            with open(approved_file) as f:
                data = json.load(f)
            summary['countries_updated'].append({
                'country': country,
                'count': data['count']
            })
    
    summary_file = Path('data/publish_history') / f"{today}.json"
    summary_file.parent.mkdir(parents=True, exist_ok=True)
    with open(summary_file, 'w', encoding='utf-8') as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
    
    print(f"\n📊 Summary saved to {summary_file}")

if __name__ == '__main__':
    main()
