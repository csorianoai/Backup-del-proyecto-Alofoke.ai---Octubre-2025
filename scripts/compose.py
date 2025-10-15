#!/usr/bin/env python3
"""
Alofoke.ai Article Composition Pipeline
Generates articles from queued news using OpenAI GPT-4
"""

import os
import json
import re
from datetime import datetime
from pathlib import Path
import argparse
from openai import OpenAI

# Configuration
DATA_DIR = Path("data")
QUEUE_DIR = DATA_DIR / "queue"
DRAFTS_DIR = DATA_DIR / "drafts"

# Article type templates
ARTICLE_TYPES = {
    "news_brief": {
        "name": "News Brief",
        "word_count": "300-400",
        "style": "quick, scannable, bullet-friendly",
        "tier_default": "bronze"
    },
    "explainer": {
        "name": "Explainer",
        "word_count": "600-800",
        "style": "educational, structured with clear sections",
        "tier_default": "silver"
    },
    "trend_radar": {
        "name": "Trend Radar",
        "word_count": "500-700",
        "style": "analytical, forward-looking, connects multiple signals",
        "tier_default": "gold"
    }
}

def load_queue_files():
    """Load all JSON files from queue directory"""
    queue_files = list(QUEUE_DIR.glob("*.json"))
    
    all_articles = []
    for qfile in queue_files:
        with open(qfile, 'r', encoding='utf-8') as f:
            data = json.load(f)
            for article in data.get("articles", []):
                article["country"] = data.get("country")
                article["queue_file"] = qfile.name
                all_articles.append(article)
    
    return all_articles

def generate_article_prompt(source_articles, article_type, country_name):
    """Generate OpenAI prompt for article composition"""
    
    atype = ARTICLE_TYPES[article_type]
    
    # Combine source articles
    sources_text = "\n\n".join([
        f"Fuente {i+1}: {art['title']}\n{art['summary']}\nURL: {art['link']}"
        for i, art in enumerate(source_articles)
    ])
    
    prompt = f"""Eres un editor de tecnología en Alofoke.ai, un medio de noticias sobre IA en América Latina.

CONTEXTO:
- País foco: {country_name}
- Tipo de artículo: {atype['name']}
- Longitud objetivo: {atype['word_count']} palabras
- Estilo: {atype['style']}

FUENTES:
{sources_text}

INSTRUCCIONES:
1. Analiza las fuentes y genera un artículo original en español
2. Usa HTML semántico (<p>, <h2>, <ul>, <li>, <strong>, <em>)
3. Incluye una sección "Por qué importa" al final
4. Mantén un tono profesional pero accesible
5. Enfoca en el impacto para {country_name} y la región
6. NO inventes datos, solo usa información de las fuentes
7. Cita las fuentes relevantes con enlaces HTML

FORMATO REQUERIDO:
- Título: máximo 60 caracteres, atractivo y claro
- Subtítulo: extracto de 1-2 líneas (120-150 caracteres)
- Cuerpo: HTML bien estructurado
- Sección final: <div class="why-it-matters"><h2>Por qué importa</h2><p>...</p></div>

RESPONDE EN FORMATO JSON:
{{
  "title": "Título del artículo",
  "subtitle": "Extracto breve",
  "content": "<p>Contenido HTML completo del artículo...</p>",
  "tags": ["tag1", "tag2", "tag3"],
  "sources_used": ["https://...", "https://..."]
}}
"""
    
    return prompt

def call_openai(prompt, model="gpt-4o-mini"):
    """Call OpenAI API"""
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "Eres un editor experto en tecnología e IA para América Latina. Generas contenido preciso, bien estructurado y engaging."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        content = response.choices[0].message.content
        
        # Try to parse JSON from response
        # Sometimes GPT wraps it in ```json ... ```
        json_match = re.search(r'```json\s*(\{.*?\})\s*```', content, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(1))
        else:
            return json.loads(content)
    
    except Exception as e:
        print(f"❌ OpenAI API error: {e}")
        return None

def generate_slug(title):
    """Generate URL-friendly slug from title"""
    slug = title.lower()
    slug = re.sub(r'[áàäâ]', 'a', slug)
    slug = re.sub(r'[éèëê]', 'e', slug)
    slug = re.sub(r'[íìïî]', 'i', slug)
    slug = re.sub(r'[óòöô]', 'o', slug)
    slug = re.sub(r'[úùüû]', 'u', slug)
    slug = re.sub(r'[ñ]', 'n', slug)
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug[:60]  # Max 60 chars

def save_draft(article_data, article_type, country):
    """Save generated article as draft"""
    timestamp = datetime.now()
    date_str = timestamp.strftime("%Y-%m-%d")
    time_str = timestamp.strftime("%H%M%S")
    
    slug = generate_slug(article_data["title"])
    filename = f"{country}_{date_str}_{slug}_{time_str}.json"
    
    draft = {
        "title": article_data["title"],
        "subtitle": article_data["subtitle"],
        "content": article_data["content"],
        "date": timestamp.isoformat(),
        "country": country,
        "type": article_type,
        "tier": ARTICLE_TYPES[article_type]["tier_default"],
        "slug": slug,
        "tags": article_data.get("tags", []),
        "sources": article_data.get("sources_used", []),
        "human_verified": False,
        "low_confidence": False,
        "metadata": {
            "generated_at": timestamp.isoformat(),
            "model": "gpt-4o-mini"
        }
    }
    
    DRAFTS_DIR.mkdir(parents=True, exist_ok=True)
    draft_path = DRAFTS_DIR / filename
    
    with open(draft_path, 'w', encoding='utf-8') as f:
        json.dump(draft, f, ensure_ascii=False, indent=2)
    
    print(f"  ✅ Draft saved: {filename}")
    return draft_path

def compose_articles(article_mix):
    """Main composition pipeline"""
    print("\n📝 Starting article composition...")
    
    # Load queued articles
    queued = load_queue_files()
    if not queued:
        print("⚠️  No articles in queue")
        return
    
    print(f"📥 Loaded {len(queued)} articles from queue")
    
    # Group by country
    by_country = {}
    for art in queued:
        country = art.get("country", "unknown")
        if country not in by_country:
            by_country[country] = []
        by_country[country].append(art)
    
    # Parse mix (e.g., "brief=5,explainer=3,trend=1")
    mix = {}
    for item in article_mix.split(","):
        atype, count = item.split("=")
        mix[atype] = int(count)
    
    # Generate articles for each country
    for country, articles in by_country.items():
        print(f"\n🇩🇴 Processing {country.upper()}...")
        
        country_name = "República Dominicana" if country == "do" else "Colombia"
        
        # News Briefs (use individual articles)
        brief_count = mix.get("brief", 5)
        for i in range(min(brief_count, len(articles))):
            print(f"  📄 Generating News Brief {i+1}/{brief_count}...")
            prompt = generate_article_prompt([articles[i]], "news_brief", country_name)
            result = call_openai(prompt)
            if result:
                save_draft(result, "news_brief", country)
        
        # Explainers (combine 2-3 related articles)
        explainer_count = mix.get("explainer", 3)
        start_idx = brief_count
        for i in range(explainer_count):
            if start_idx + 2 >= len(articles):
                break
            print(f"  📘 Generating Explainer {i+1}/{explainer_count}...")
            sources = articles[start_idx:start_idx+3]
            prompt = generate_article_prompt(sources, "explainer", country_name)
            result = call_openai(prompt)
            if result:
                save_draft(result, "explainer", country)
            start_idx += 3
        
        # Trend Radar (combine 4-5 articles)
        trend_count = mix.get("trend", 1)
        for i in range(trend_count):
            if len(articles) < 5:
                break
            print(f"  🔮 Generating Trend Radar {i+1}/{trend_count}...")
            sources = articles[-5:]  # Use most recent 5
            prompt = generate_article_prompt(sources, "trend_radar", country_name)
            result = call_openai(prompt)
            if result:
                save_draft(result, "trend_radar", country)
    
    print("\n✅ Article composition complete!")

def main():
    parser = argparse.ArgumentParser(description="Compose articles from queue")
    parser.add_argument("--mix", type=str, default="brief=5,explainer=3,trend=1",
                       help="Article mix (e.g., brief=5,explainer=3,trend=1)")
    
    args = parser.parse_args()
    
    print("🤖 Alofoke.ai Article Composition Pipeline")
    print("=" * 50)
    
    if not os.getenv("OPENAI_API_KEY"):
        print("❌ OPENAI_API_KEY not found in environment")
        return
    
    compose_articles(args.mix)

if __name__ == "__main__":
    main()
