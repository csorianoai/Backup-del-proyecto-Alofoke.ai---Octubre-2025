#!/usr/bin/env python3
"""
Quality check for drafted articles
Outputs: data/approved/YYYY-MM-DD_{country}.json
"""
import argparse
import json
import os
import re
from datetime import datetime
from pathlib import Path
from openai import OpenAI

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def calculate_similarity(text1, text2):
    """Calculate similarity using OpenAI embeddings"""
    try:
        import numpy as np
        
        emb1 = client.embeddings.create(
            input=text1[:8000],
            model="text-embedding-3-small"
        ).data[0].embedding
        
        emb2 = client.embeddings.create(
            input=text2[:8000],
            model="text-embedding-3-small"
        ).data[0].embedding
        
        emb1 = np.array(emb1)
        emb2 = np.array(emb2)
        similarity = np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))
        
        return float(similarity)
    except Exception as e:
        print(f"  ⚠️  Similarity calc error: {e}")
        return 0.5

def strip_html(html_text):
    """Remove HTML tags"""
    return re.sub(r'<[^>]+>', '', html_text)

def validate_article(article, threshold=0.80):
    """Run quality checks on an article"""
    checks = {
        'has_title': bool(article.get('title')),
        'has_body': len(strip_html(article.get('body_html', ''))) > 100,
        'has_sources': len(article.get('sources', [])) >= 2,
        'has_tags': len(article.get('tags', [])) >= 2,
        'local_context_sufficient': False,
        'similarity_ok': True
    }
    
    body = strip_html(article.get('body_html', ''))
    if 'por qué importa' in body.lower():
        parts = body.lower().split('por qué importa')
        if len(parts) > 1:
            local_section = parts[1][:500]
            checks['local_context_sufficient'] = len(local_section.split()) >= 80
    
    return checks

def calculate_value_score(article, checks):
    """Calculate value score (0-1)"""
    weights = {
        'sources_diversity': 0.20,
        'novelty': 0.15,
        'local_context': 0.30,
        'actionability': 0.20,
        'data_points': 0.15
    }
    
    score = 0.0
    
    if len(article.get('sources', [])) >= 2:
        score += weights['sources_diversity']
    
    if checks['similarity_ok']:
        score += weights['novelty']
    
    if checks['local_context_sufficient']:
        score += weights['local_context']
    
    body = strip_html(article.get('body_html', '')).lower()
    action_words = ['puede', 'debe', 'necesita', 'implica', 'requiere', 'oportunidad']
    if any(word in body for word in action_words):
        score += weights['actionability']
    
    if re.search(r'\d+%|\d+\s*(millones|mil|billones)', body):
        score += weights['data_points']
    
    return round(score, 2)

def assign_tier(article, value_score):
    """Assign tier: gold, silver, or bronze"""
    article_type = article.get('type', 'news_brief')
    
    if article_type in ['explainer', 'trend_radar']:
        return 'gold', False, False
    
    if value_score >= 0.75:
        return 'silver', True, False
    elif value_score >= 0.70:
        return 'bronze', True, True
    else:
        return 'hold', False, True

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--threshold', type=float, default=0.80)
    args = parser.parse_args()
    
    today = datetime.now().strftime('%Y-%m-%d')
    drafts_dir = Path('data/drafts')
    approved_dir = Path('data/approved')
    approved_dir.mkdir(parents=True, exist_ok=True)
    
    for draft_file in drafts_dir.glob(f'{today}_*.json'):
        country = draft_file.stem.split('_')[-1]
        print(f"\n🔍 Quality checking {country.upper()}...")
        
        with open(draft_file) as f:
            draft_data = json.load(f)
        
        articles = draft_data['articles']
        approved = []
        held = []
        
        for i, article in enumerate(articles, 1):
            print(f"  → Article {i}/{len(articles)} ({article['type']})...")
            
            checks = validate_article(article, args.threshold)
            value_score = calculate_value_score(article, checks)
            tier, auto_publish, low_confidence = assign_tier(article, value_score)
            
            article['tier'] = tier
            article['value_score'] = value_score
            article['human_verified'] = False
            article['low_confidence'] = low_confidence
            article['checks'] = checks
            article['checked_at'] = datetime.now().isoformat()
            
            if auto_publish:
                approved.append(article)
                status = f"✓ {tier.upper()} (score: {value_score})"
            else:
                held.append(article)
                status = f"⏸ HELD (score: {value_score})"
            
            print(f"    {status}")
        
        if approved:
            output_file = approved_dir / f"{today}_{country}.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump({
                    'date': today,
                    'country': country,
                    'articles': approved,
                    'count': len(approved)
                }, f, ensure_ascii=False, indent=2)
            print(f"  ✓ Approved {len(approved)} articles")
        
        if held:
            held_file = approved_dir / f"{today}_{country}_held.json"
            with open(held_file, 'w', encoding='utf-8') as f:
                json.dump({
                    'date': today,
                    'country': country,
                    'articles': held,
                    'count': len(held)
                }, f, ensure_ascii=False, indent=2)
            print(f"  ⏸ Held {len(held)} articles for review")
    
    print("\n✅ Quality check complete!")

if __name__ == '__main__':
    main()
