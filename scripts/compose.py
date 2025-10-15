#!/usr/bin/env python3
"""
Compose articles from queued sources using LLM
Outputs: data/drafts/YYYY-MM-DD_{country}.json
"""
import argparse
import json
import os
from datetime import datetime
from pathlib import Path
from openai import OpenAI

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

COUNTRY_NAMES = {
    'do': 'República Dominicana',
    'co': 'Colombia',
    'mx': 'México',
    'cl': 'Chile',
    'ar': 'Argentina',
    'pe': 'Perú'
}

PROMPTS = {
    'news_brief': """Eres un editor de Alofoke.ai, un periódico latinoamericano sobre IA.

Tema: {title}
País: {country_name}
Fuentes: {sources}

Escribe un NEWS BRIEF (150-220 palabras) en español claro.

Estructura OBLIGATORIA:
1. Qué pasó (hechos verificables, 60-80 palabras)
2. Por qué importa en {country_name} (80-100 palabras) con:
   - Un dato o estadística del país (con fuente)
   - Impacto práctico para un grupo (empresas/gobierno/ciudadanos)
   - Contraste con tendencia regional o global
3. Lista las fuentes usadas (mínimo 2 URLs)

Tono: periodístico, neutral, concreto.

Devuelve SOLO JSON válido:
{{
  "type": "news_brief",
  "country": "{country_code}",
  "title": "título SEO optimizado",
  "subtitle": "bajada de 1 línea",
  "body_html": "<p>Qué pasó...</p><h3>Por qué importa</h3><p>...</p>",
  "sources": ["url1", "url2"],
  "tags": ["tag1", "tag2"]
}}""",

    'explainer': """Eres un editor de explicadores para Alofoke.ai.

Tema: {title}
País: {country_name}
Contexto: {summary}

Crea un EXPLAINER (250-400 palabras) en español.

Secciones OBLIGATORIAS:
1. Qué es (definición clara)
2. Antecedentes (contexto histórico breve)
3. Impacto en {country_name} (con estadística local)
4. Riesgos o desafíos
5. Próximos pasos

Incluye al menos 2 fuentes confiables y 1 dato específico del país.

Devuelve SOLO JSON válido:
{{
  "type": "explainer",
  "country": "{country_code}",
  "title": "Explicador: [tema] en {country_name}",
  "subtitle": "bajada explicativa",
  "body_html": "<h3>Qué es</h3><p>...</p><h3>Antecedentes</h3><p>...</p>...",
  "sources": ["url1", "url2"],
  "tags": ["tag1", "tag2"]
}}""",

    'trend_radar': """Eres un analista regional para Alofoke.ai.

Tendencias detectadas: {trends_summary}

Crea un TREND RADAR LATAM (200-280 palabras).

Estructura:
1. Resumen de 3 tendencias recientes de IA en LATAM
2. Análisis de oportunidades locales
3. Perspectiva para los próximos 3 meses

Devuelve SOLO JSON válido:
{{
  "type": "trend_radar",
  "country": "latam",
  "title": "Trend Radar: [tema principal]",
  "subtitle": "Panorama IA en América Latina",
  "body_html": "<p>...</p>",
  "sources": ["url1", "url2", "url3"],
  "tags": ["trends", "latam", "ia"]
}}"""
}

def compose_article(article_type, source_data, country_code):
    """Generate one article using LLM"""
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
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Eres un periodista experto en IA para América Latina. Respondes SOLO con JSON válido."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            max_tokens=600
        )
        
        content = response.choices[0].message.content.strip()
        
        if content.startswith('```'):
            content = content.split('\n', 1)[1]
            content = content.rsplit('\n```', 1)[0]
        
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
        print(f"\n✍️  Composing articles for {country.upper()}...")
        
        with open(queue_file) as f:
            queue_data = json.load(f)
        
        articles = queue_data['articles']
        if not articles:
            print(f"  ⚠️  No articles in queue for {country}")
            continue
        
        composed = []
        article_idx = 0
        
        for i in range(mix.get('brief', 0)):
            if article_idx >= len(articles):
                break
            print(f"  → News Brief {i+1}/{mix.get('brief', 0)}...")
            article = compose_article('news_brief', articles[article_idx], country)
            if article:
                composed.append(article)
            article_idx += 1
        
        for i in range(mix.get('explainer', 0)):
            if article_idx >= len(articles):
                break
            print(f"  → Explainer {i+1}/{mix.get('explainer', 0)}...")
            article = compose_article('explainer', articles[article_idx], country)
            if article:
                composed.append(article)
            article_idx += 1
        
        if mix.get('trend', 0) > 0 and len(articles) >= 3:
            print(f"  → Trend Radar...")
            trend_data = articles[:3]
            article = compose_article('trend_radar', trend_data, country)
            if article:
                composed.append(article)
        
        output_file = drafts_dir / f"{today}_{country}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump({
                'date': today,
                'country': country,
                'articles': composed,
                'count': len(composed)
            }, f, ensure_ascii=False, indent=2)
        
        print(f"  ✓ Saved {len(composed)} articles to {output_file}")
    
    print("\n✅ Composition complete!")

if __name__ == '__main__':
    main()
