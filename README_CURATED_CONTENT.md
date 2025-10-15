# 🤖 Sistema de Curación de Contenido - Alofoke.ai

## Descripción General

Pipeline automatizado que genera artículos sobre IA para DO y CO, ejecutándose 3 veces al día mediante GitHub Actions.

---

## 📁 Estructura de Datos

```
data/
├── sources/                 # Configuración de fuentes por país
│   ├── sources_do.json     # República Dominicana
│   └── sources_co.json     # Colombia
├── queue/                   # Artículos recolectados (temp)
│   └── YYYY-MM-DD_{country}.json
├── drafts/                  # Artículos generados por IA (temp)
│   └── YYYY-MM-DD_{country}.json
├── approved/                # Artículos aprobados (temp)
│   └── YYYY-MM-DD_{country}.json
├── articles/                # Artículos publicados (permanente)
│   └── {country}/{year}/{month}/{day}/{slug}.md
├── indices/                 # Índices JSON para el frontend
│   ├── do.json             # Índice RD
│   ├── co.json             # Índice Colombia
│   └── global.json         # Índice LATAM
└── publish_history/         # Historial de publicaciones
    └── YYYY-MM-DD.json
```

---

## 🔄 Pipeline de Curación (4 Scripts)

### 1️⃣ `scripts/ingest.py` - Recolección
**Qué hace:**
- Fetch RSS feeds (Diario Libre, Listín Diario, El Tiempo, etc.)
- Fetch Google News con queries específicas por país
- Deduplicación y filtrado de relevancia (keywords de IA)
- Guarda en `data/queue/`

**Comando:**
```bash
python scripts/ingest.py --countries do co --target 14
```

**Output:**
```json
{
  "date": "2025-10-14",
  "country": "do",
  "articles": [
    {
      "title": "...",
      "url": "...",
      "source": "Diario Libre",
      "category": "tech",
      "summary": "..."
    }
  ],
  "count": 14
}
```

---

### 2️⃣ `scripts/compose.py` - Generación con IA
**Qué hace:**
- Lee artículos de `data/queue/`
- Usa GPT-4o-mini para generar 3 tipos de contenido:
  - **News Brief** (150-220 palabras): Qué pasó + Por qué importa
  - **Explainer** (250-400 palabras): Qué es + Antecedentes + Impacto
  - **Trend Radar** (200-280 palabras): Análisis de tendencias LATAM
- Guarda en `data/drafts/`

**Comando:**
```bash
python scripts/compose.py --mix "brief=5,explainer=3,trend=1"
```

**Output:**
```json
{
  "type": "news_brief",
  "country": "do",
  "title": "...",
  "subtitle": "...",
  "body_html": "<p>...</p>",
  "sources": ["url1", "url2"],
  "tags": ["ia", "educacion"]
}
```

---

### 3️⃣ `scripts/quality.py` - Control de Calidad
**Qué hace:**
- Valida longitud, fuentes, contexto local
- Calcula **value score** (0-1) basado en:
  - Diversidad de fuentes (20%)
  - Novedad (15%)
  - Contexto local (30%)
  - Actionability (20%)
  - Data points (15%)
- Asigna **tier**:
  - **Gold** (🥇): Explainers y Trend Radars (requieren revisión humana)
  - **Silver** (🥈): News Briefs con score ≥ 0.75
  - **Bronze** (🥉): News Briefs con score ≥ 0.70
  - **Hold**: Score < 0.70 (no se publica)
- Guarda en `data/approved/` o `data/approved/{country}_held.json`

**Comando:**
```bash
python scripts/quality.py --threshold 0.80
```

---

### 4️⃣ `scripts/publish.py` - Publicación
**Qué hace:**
- Lee artículos de `data/approved/`
- Crea archivos Markdown con frontmatter en `data/articles/`
- Actualiza índices JSON en `data/indices/`:
  - `do.json`: 100 artículos más recientes de RD
  - `co.json`: 100 artículos más recientes de CO
  - `global.json`: 200 artículos más recientes de toda LATAM
- Guarda historial en `data/publish_history/`
- Limpia archivos temporales (queue) mayores a 7 días

**Comando:**
```bash
python scripts/publish.py
```

**Formato del Markdown:**
```markdown
---
title: "Título del artículo"
subtitle: "Extracto"
date: "2025-10-14T10:00:00"
country: "do"
type: "news_brief"
tier: "silver"
value_score: 0.82
human_verified: false
low_confidence: false
sources: ["https://...", "https://..."]
tags: ["ia", "educacion"]
slug: "titulo-url-friendly"
---

<p>Contenido HTML del artículo...</p>
<h3>Por qué importa</h3>
<p>Análisis de impacto local...</p>
```

---

## 🤖 GitHub Actions Workflow

**Archivo:** `.github/workflows/daily-content.yml`

**Ejecuta 3 veces al día:**
- 10:00 AM UTC (6:00 AM EST)
- 2:00 PM UTC (10:00 AM EST)
- 6:00 PM UTC (2:00 PM EST)

**Flujo:**
1. Ingest → 14 artículos/país
2. Compose → 5 briefs + 3 explainers + 1 trend
3. Quality → Filtrado y tier assignment
4. Publish → Markdown + índices JSON
5. Commit & Push → Cambios automáticos

**Secrets requeridos en GitHub:**
- `OPENAI_API_KEY` (obligatorio)
- `PPLX_API_KEY` (opcional, ya no se usa)

---

## 🌐 Frontend - Consumo de Datos

### Rutas Creadas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/latam` | `LatamFeed` | Feed global LATAM |
| `/pais/do` | `CountryFeed` | Feed República Dominicana |
| `/pais/co` | `CountryFeed` | Feed Colombia |
| `/:country/:year/:month/:day/:slug` | `CuratedArticle` | Artículo individual |

### Componentes Nuevos

**`CountrySelector`**
- Dropdown con banderas 🇩🇴 🇨🇴 🌎
- Guarda preferencia en localStorage
- Cambia URL automáticamente

**`CuratedArticleCard`**
- Badges: Tipo (News Brief/Explainer/Trend Radar)
- Badges: Tier (🥇 Gold / 🥈 Silver / 🥉 Bronze)
- Flags: País (🇩🇴 / 🇨🇴)
- Tags: Máximo 3 visible
- Disclaimers: ✓ Verificado / ⚠️ En revisión

**`LatamFeed`**
- Lee `/data/indices/global.json`
- Muestra artículos de todos los países
- Grid responsive (3 columnas desktop)

**`CountryFeed`**
- Lee `/data/indices/{country}.json`
- Filtra por país seleccionado
- Incluye CountrySelector

**`CuratedArticle`**
- Lee `/data/articles/{country}/{year}/{month}/{day}/{slug}.md`
- Parsea frontmatter YAML
- Renderiza HTML con estilos prose
- Muestra fuentes citadas
- Disclaimers: 🤖 IA / ✓ Verificado / ⚠️ En revisión

---

## 🎨 Estilo de Artículos

**Clase `.prose`** en `src/index.css`:
- Tipografía: Headings con jerarquía clara
- Espaciado: Párrafos y listas bien aireados
- Links: Color primary con hover:underline
- Sección especial: `.why-it-matters` con fondo azul y borde

---

## 🚀 Cómo Probar Localmente

### 1. Instalar dependencias Python
```bash
pip install -r requirements.txt
```

### 2. Configurar variables de entorno
```bash
export OPENAI_API_KEY="sk-..."
```

### 3. Ejecutar pipeline completo
```bash
python scripts/ingest.py --countries do co --target 14
python scripts/compose.py --mix "brief=5,explainer=3,trend=1"
python scripts/quality.py --threshold 0.80
python scripts/publish.py
```

### 4. Verificar outputs
```bash
ls data/articles/do/2025/10/14/  # Ver artículos publicados
cat data/indices/do.json          # Ver índice RD
cat data/indices/global.json      # Ver índice LATAM
```

---

## 📊 Métricas y Seguimiento

**Archivo de historial:** `data/publish_history/YYYY-MM-DD.json`

```json
{
  "date": "2025-10-14",
  "published_at": "2025-10-14T14:30:00",
  "total_articles": 18,
  "countries_updated": [
    {"country": "do", "count": 9},
    {"country": "co", "count": 9}
  ]
}
```

**KPIs a monitorear:**
- Artículos publicados/día (target: 18)
- % de artículos Gold vs Silver/Bronze
- Tiempo promedio del pipeline
- Fallos en quality check

---

## 🔧 Troubleshooting

### Error: "No sources found for {country}"
**Solución:** Verificar que exista `data/sources/sources_{country}.json`

### Error: "OPENAI_API_KEY not found"
**Solución:** 
```bash
export OPENAI_API_KEY="sk-..."
# O agregar en GitHub Secrets
```

### Error: "Artículo no encontrado" en frontend
**Solución:**
- Verificar que el archivo MD exista en `data/articles/`
- Verificar que el índice JSON esté actualizado
- Revisar que el slug no tenga caracteres especiales

### Pipeline no se ejecuta en GitHub Actions
**Solución:**
- Verificar que el workflow esté habilitado
- Revisar que los secrets estén configurados
- Revisar logs en Actions tab

---

## 🛡️ Seguridad y Disclaimers

**Todos los artículos incluyen:**
- 🤖 "Artículo asistido por IA" (siempre)
- ✓ "Verificado por humanos" (si `human_verified: true`)
- ⚠️ "En revisión" (si `low_confidence: true`)

**Artículos Gold (🥇):**
- Requieren revisión humana antes de publicarse
- Se marcan automáticamente con `low_confidence: true`
- Un editor debe marcar `human_verified: true` después de revisión

---

## 📈 Escalabilidad

### Agregar un nuevo país (ej: México)

1. **Crear sources config:**
```json
// data/sources/sources_mx.json
{
  "country": "mx",
  "country_name": "México",
  "feeds": [...],
  "google_news_queries": [...]
}
```

2. **Actualizar ingest.py:**
```bash
python scripts/ingest.py --countries do co mx
```

3. **Actualizar frontend:**
```tsx
// src/components/CountrySelector.tsx
const COUNTRIES = [
  { code: "mx", name: "México", flag: "🇲🇽" },
  ...
];
```

4. **Crear ruta:**
```tsx
// src/App.tsx
<Route path="/pais/mx" element={<CountryFeed />} />
```

---

## 🎯 Roadmap

### Corto plazo
- [ ] Dashboard de métricas (artículos/día, quality scores)
- [ ] Sistema de revisión humana para artículos Gold
- [ ] Notificaciones por email cuando hay artículos en hold

### Mediano plazo
- [ ] Agregar más países (MX, AR, CL, PE)
- [ ] Integración con CMS para edición manual
- [ ] A/B testing de títulos y extractos

### Largo plazo
- [ ] Fine-tuning de modelo para estilo Alofoke.ai
- [ ] Sistema de recomendaciones personalizado
- [ ] Multi-idioma (inglés, portugués)

---

## 📞 Contacto

Para dudas sobre el pipeline de curación:
- Email: info@alofoke.ai
- GitHub Issues: [Reportar problema](https://github.com/tu-repo/issues)

---

**Última actualización:** 2025-10-15  
**Versión:** 1.0.0  
**Mantenedor:** Equipo Alofoke.ai
