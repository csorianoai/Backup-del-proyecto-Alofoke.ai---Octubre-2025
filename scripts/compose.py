#!/usr/bin/env python3
import argparse
import json
import os
from datetime import datetime
from pathlib import Path

# ---------- Parche anti-'proxies' (debe ejecutarse ANTES de instanciar OpenAI) ----------
import httpx as _httpx

class _PatchedClient(_httpx.Client):
    def __init__(self, *args, **kwargs):
        # httpx>=0.28 no acepta 'proxies'; lo removemos si aparece
        kwargs.pop("proxies", None)
        super().__init__(*args, **kwargs)

# Monkey-patch global: cualquier uso interno de httpx.Client ahora ignora 'proxies'
_httpx.Client = _PatchedClient

# ---------- Ahora sí, OpenAI ----------
from openai import OpenAI

# Capa 1: inyectamos nuestro propio http_client para evitar que OpenAI cree el suyo
_transport = _httpx.HTTPTransport(retries=2)
_http_client = _httpx.Client(transport=_transport, timeout=60)  # sin proxies

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    http_client=_http_client
)

COUNTRY_NAMES = {"do": "República Dominicana", "co": "Colombia"}

PROMPTS = {
    "news_brief": """Editor Alofoke.ai. Tema: {title}, País: {country_name}
Escribe NEWS BRIEF (150-220 palabras) español.
1. Qué pasó (60-80 palabras)
2. Por qué importa en {country_name} (80-100 palabras): dato país, impacto, contraste regional
3. Fuentes (≥2)
JSON: {{"type":"news_brief","country":"{country_code}","title":"...","subtitle":"...","body_html":"<p>...</p>","sources":["url1","url2"],"tags":["tag1","tag2"]}}""",

    "explainer": """Editor Alofoke.ai. {title} en {country_name}
EXPLAINER (250-400 palabras): Qué es, Antecedentes, Impacto {country_name}, Riesgos, Próximos pasos
JSON: {{"type":"explainer","country":"{country_code}","title":"...","subtitle":"...","body_html":"...","sources":["url1","url2"],"tags":["tag1","tag2"]}}""",

    "trend_radar": """Analista Alofoke.ai. Tendencias: {trends_summary}
TREND RADAR (200-280 palabras): 3 tendencias IA LATAM, oportunidades, perspectiva 3 meses
JSON: {{"type":"trend_radar","country":"latam","title":"...","subtitle":"...","body_html":"...","sources":["url1","url2"],"tags":["trends","latam"]}}"""
}


def compose_article(article_type, source_data, country_code):
    country_name = COUNTRY_NAMES.get(country_code, country_code.upper())

    if article_type == "trend_radar":
        prompt_data = {"trends_summary": json.dumps(source_data, indent=2, ensure_ascii=False)}
    else:
        prompt_data = {
            "title": source_data.get("title", "Sin título"),
            "sources": json.dumps([source_data.get("url", "")], ensure_ascii=False),
            "country_name": country_name,
            "country_code": country_code,
        }

    prompt = PROMPTS[article_type].format(**prompt_data)

    try:
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Periodista IA LATAM. SOLO responde JSON válido."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.4,
            max_tokens=900,
        )

        content = (resp.choices[0].message.content or "").strip()

        if content.startswith("```"):
            content = content.split("\n", 1)[1]
            if content.endswith("```"):
                content = content[:-3]
            if "\n```" in content:
                content = content.rsplit("\n```", 1)[0]

        article = json.loads(content)
        article["generated_at"] = datetime.now().isoformat()
        return article

    except Exception as e:
        print(f"❌ Error compose_article({article_type}): {e}")
        return None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mix", default="brief=5,explainer=3,trend=1")
    args = parser.parse_args()

    mix = {}
    for item in args.mix.split(","):
        t, c = item.split("=")
        mix[t.strip()] = int(c.strip())

    today = datetime.now().strftime("%Y-%m-%d")
    drafts_dir = Path("data/drafts")
    drafts_dir.mkdir(parents=True, exist_ok=True)

    for queue_file in Path("data/queue").glob(f"{today}_*.json"):
        country = queue_file.stem.split("_")[-1]
        print(f"\n✍️  País: {country.upper()}  /  Fuente: {queue_file.name}")

        with open(queue_file, "r", encoding="utf-8") as f:
            payload = json.load(f)
        articles = payload.get("articles", [])
        if not articles:
            print("  (sin artículos en cola)")
            continue

        composed = []
        idx = 0

        for i in range(mix.get("brief", 0)):
            if idx >= len(articles):
                break
            print(f"  • Brief {i+1}")
            a = compose_article("news_brief", articles[idx], country)
            if a:
                composed.append(a)
            idx += 1

        for i in range(mix.get("explainer", 0)):
            if idx >= len(articles):
                break
            print(f"  • Explainer {i+1}")
            a = compose_article("explainer", articles[idx], country)
            if a:
                composed.append(a)
            idx += 1

        if mix.get("trend", 0) > 0 and len(articles) >= 3:
            print("  • Trend Radar")
            a = compose_article("trend_radar", articles[:3], country)
            if a:
                composed.append(a)

        out = drafts_dir / f"{today}_{country}.json"
        with open(out, "w", encoding="utf-8") as f:
            json.dump(
                {"date": today, "country": country, "articles": composed, "count": len(composed)},
                f,
                ensure_ascii=False,
                indent=2,
            )
        print(f"  ✓ Generados: {len(composed)}  → {out}")

    print("\n✅ Composición completada.")


if __name__ == "__main__":
    main()
```

5. **Scroll hasta abajo**

6. **En el cuadro "Commit message"** escribe:
```
   FIX: Update compose.py with httpx monkey-patch
```

7. **Click en el botón verde "Commit changes"**

---

## **PASO 2: Ejecutar el workflow (desde donde estás)**

Ahora vuelve a la pestaña donde estás (workflow runs):

1. **Arriba a la derecha** verás un botón gris/verde que dice **"Run workflow"**

2. **Click en "Run workflow"**

3. **En el menú desplegable**, click en **"Run workflow"** de nuevo (botón verde)

4. **Espera 1-2 minutos** a que el workflow corra

5. **Verás un nuevo run aparecer** con un círculo amarillo ⚫ (en progreso)

6. **Click en ese nuevo run** para ver el progreso en tiempo real

---

## **PASO 3: Ver el resultado**

Cuando termine (1-2 minutos):

- ✅ **Si tiene palomita verde** → ¡FUNCIONÓ! 🎉
- ❌ **Si tiene X roja** → Click en "generate-content" → "Compose articles" → Copia el error aquí

---

## 🎯 **RESUMEN RÁPIDO:**
```
1. Editar compose.py en GitHub web (link arriba)
2. Borrar todo el contenido viejo
3. Pegar el código nuevo
4. Commit changes
5. Volver a donde estás (workflow runs)
6. Click "Run workflow" → "Run workflow"
7. Esperar resultado
