#!/usr/bin/env python3
"""
Compose articles from queued sources using LLM
"""
import argparse
import json
import os
from datetime import datetime
from pathlib import Path
import openai

# API Legacy configuration
openai.api_key = os.getenv('OPENAI_API_KEY')

COUNTRY_NAMES = {
    'do': 'República Dominicana',
    'co': 'Colombia',
    'mx': 'México',
    'cl': 'Chile',
    'ar': 'Argentina',
    'pe': 'Perú'
}

PROMPTS = {
    'news_brief': """Eres un editor de Alofoke.ai sobre IA.
Tema: {title}
País: {country_name}
Fuentes: {sources}

Escribe NEWS BRIEF (150-220 palabras) español.
Estructura:
1. Qué pasó (60-80 palabras)
2. Por qué importa en {country_name} (80-100 palabras):
   - Dato del país con fuente
   - Impacto en empresas/gobierno/ciudadanos
   - Contraste regional/global
3. Fuentes (≥2 URLs)

Devuelve SOLO JSON:
{{"type":"news_brief","country":"{country_code}","title":"...","subtitle":"...","body_html":"<p>...</p>","sources":["url1","url2"],"tags":["tag1","tag2"]}}""",

    'explainer': """Editor Alofoke.ai.
Tema: {title}, País: {country_name}
Crea EXPLAINER (250-400 palabras):
Qué es, Antecedentes, Impacto en {country_name}, Riesgos, Próximos pasos.
≥2 fuentes, 1 dato país.
Devuelve SOLO JSON:
{{"type":"explainer","country":"{country_code}","title":"Explicador: ...","subtitle":"...","body_html":"<h3>...</h3>","sources":["url1","url2"],"tags":["tag1","tag2"]}}""",

    'trend_radar': """Analista Alofoke.ai.
Tendencias: {trends_summary}
TREND RADAR LATAM (200-280 palabras).
3 tendencias IA LATAM, oportunidades, perspectiva 3 meses.
Devuelve SOLO JSON:
{{"type":"trend_radar","country":"latam","title":"Trend Radar: ...","subtitle":"...","body_html":"<p>...</p>","sources":["url1","url2","url3"],"tags":["trends","latam","ia"]}}"""
}

def compose_article(article_type, source_data, country_code):
    """Generate article using OpenAI API Legacy"""
    country_name = COUNTRY_NAMES.get(country_code, country_code.upper())
    
    if article_type == 'trend_radar':
        prompt_data = {'trends_summary': json.dumps(source_data, indent=2)}
    else:
        prompt_data = {
            'title': source_data.get('title', 'Sin título'),
            'summary': source_data.get('summary', ''),
            'sources': json.dumps([source_data.get('url', '')], indent=2),
            'country_name': country_name,
            'country_code': country_code
        }
    
    prompt = PROMPTS[article_type].format(**prompt_data)
    
    try:
        # OpenAI 0.28.1 API
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Periodista experto IA LATAM. Respondes SOLO JSON válido."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            max_tokens=600
        )
        
        content = response.choices[0].message.content.strip()
        
        if content.startswith('```'):
            content = content.split('\n', 1)[1].rsplit('\n```', 1)[0]
        
        article = json.loads(content)
        article['model_used'] = 'gpt-4o-mini'
        article['generated_at'] = datetime.now().isoformat()
        
        return article
        
    except Exception as e:
        print(f"❌ Error composing {article_type}: {e}")
        return None

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--mix', default='brief=5,explainer=3,trend=1')
    args = parser.parse_args()
    
    mix = {}
    for item in args.mix.split(','):
        article_type, count = item.split('=')
        mix[article_type] = int(count)
    
    today = datetime.now().strftime('%Y-%m-%d')
    queue_dir = Path('data/queue')
    drafts_dir = Path('data/drafts')
    drafts_dir.mkdir(parents=True, exist_ok=True)
    
    for queue_file in queue_dir.glob(f'{today}_*.json'):
        country = queue_file.stem.split('_')[-1]
        print(f"\n✍️  Composing {country.upper()}...")
        
        with open(queue_file) as f:
            queue_data = json.load(f)
        
        articles = queue_data['articles']
        if not articles:
            continue
        
        composed = []
        idx = 0
        
        for i in range(mix.get('brief', 0)):
            if idx >= len(articles): break
            print(f"  Brief {i+1}...")
            article = compose_article('news_brief', articles[idx], country)
            if article: composed.append(article)
            idx += 1
        
        for i in range(mix.get('explainer', 0)):
            if idx >= len(articles): break
            print(f"  Explainer {i+1}...")
            article = compose_article('explainer', articles[idx], country)
            if article: composed.append(article)
            idx += 1
        
        if mix.get('trend', 0) > 0 and len(articles) >= 3:
            print(f"  Trend...")
            article = compose_article('trend_radar', articles[:3], country)
            if article: composed.append(article)
        
        output = drafts_dir / f"{today}_{country}.json"
        with open(output, 'w', encoding='utf-8') as f:
            json.dump({'date': today, 'country': country, 'articles': composed, 'count': len(composed)}, f, ensure_ascii=False, indent=2)
        
        print(f"  ✓ {len(composed)} articles")
    
    print("\n✅ Done!")

if __name__ == '__main__':
    main()
