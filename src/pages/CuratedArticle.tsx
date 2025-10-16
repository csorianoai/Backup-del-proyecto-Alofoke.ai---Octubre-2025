import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CuratedArticleCard from "@/components/articles/CuratedArticleCard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ExternalLink } from "lucide-react";

interface ArticleData {
  title: string;
  subtitle: string;
  date: string;
  country: string;
  type: string;
  tier: string;
  value_score?: number;
  human_verified?: boolean;
  low_confidence?: boolean;
  sources: string[];
  tags: string[];
  slug: string;
  body_html: string;
}

interface RelatedArticle {
  title: string;
  subtitle: string;
  slug: string;
  url: string;
  date: string;
  type: string;
  tier: string;
  tags: string[];
  country: string;
  human_verified?: boolean;
  low_confidence?: boolean;
}

const TIER_COLORS = {
  gold: "bg-yellow-500 text-white",
  silver: "bg-gray-400 text-white",
  bronze: "bg-amber-700 text-white",
};

const TIER_ICONS = {
  gold: "🥇",
  silver: "🥈",
  bronze: "🥉",
};

const TYPE_LABELS = {
  news_brief: "News Brief",
  explainer: "Explainer",
  trend_radar: "Trend Radar",
};

const COUNTRY_FLAGS = {
  do: "🇩🇴",
  co: "🇨🇴",
  mx: "🇲🇽",
  ar: "🇦🇷",
  es: "🇪🇸",
  pe: "🇵🇪",
  pa: "🇵🇦",
  cl: "🇨🇱",
  uy: "🇺🇾",
};

const CuratedArticle = () => {
  const { country, year, month, day, slug } = useParams();
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const slugNorm = (slug || '').replace(/\.+$/, '');
        const base = import.meta.env.BASE_URL || '/';
        const basePath = base.endsWith('/') ? base : `${base}/`;
        const url = `${basePath}data/articles/${country}/${year}/${month}/${day}/${slugNorm}.md?v=${Date.now()}`;
        const resp = await fetch(url, { cache: 'no-store' });
        if (!resp.ok) throw new Error("Artículo no encontrado");
        const markdown = await resp.text();
        
        
        // Parse frontmatter manually
        const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        
        if (!frontmatterMatch) {
          throw new Error("Formato de artículo inválido");
        }
        
        const frontmatter = frontmatterMatch[1];
        const body = frontmatterMatch[2];
        
        // Parse YAML frontmatter
        const metadata: any = {};
        const lines = frontmatter.split("\n");
        let currentKey: string | null = null;
        let currentArray: string[] = [];
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          // Check if line is an array item (starts with -)
          if (line.match(/^\s*-\s+(.+)$/)) {
            const arrayItem = line.match(/^\s*-\s+(.+)$/)?.[1] || "";
            currentArray.push(arrayItem);
            continue;
          }
          
          // If we were building an array and hit a new key, save it
          if (currentKey && currentArray.length > 0) {
            metadata[currentKey] = currentArray;
            currentArray = [];
            currentKey = null;
          }
          
          // Check if line is a key:value pair
          const match = line.match(/^(\w+):\s*(.*)$/);
          if (match) {
            const key = match[1];
            let value: any = match[2];
            
            // If value is empty, it might be a YAML array coming next
            if (!value || value.trim() === "") {
              currentKey = key;
              continue;
            }
            
            // Parse arrays in JSON format
            if (value.startsWith("[") && value.endsWith("]")) {
              value = JSON.parse(value);
            }
            // Parse booleans
            else if (value === "true") value = true;
            else if (value === "false") value = false;
            // Parse numbers
            else if (!isNaN(Number(value)) && value !== "") {
              value = Number(value);
            }
            // Remove quotes from strings
            else if ((value.startsWith('"') && value.endsWith('"')) ||
                     (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            
            metadata[key] = value;
            currentKey = null;
          }
        }
        
        // Handle last array if any
        if (currentKey && currentArray.length > 0) {
          metadata[currentKey] = currentArray;
        }
        
        setArticle({
          ...metadata,
          body_html: body,
        } as ArticleData);

        // Load related articles from same country
        try {
          const modules = import.meta.glob('/data/indices/*.json');
          const indexPath = `/data/indices/${country}.json`;
          const indexLoader = modules[indexPath as keyof typeof modules];
          if (indexLoader) {
            try {
              const mod: any = await indexLoader();
              const data = mod.default || mod;
              const allArticles = data.articles || [];
              const uniqueBySlug = allArticles.filter((a: RelatedArticle, i: number, self: RelatedArticle[]) =>
                i === self.findIndex(b => b.slug === a.slug)
              );
              const related = uniqueBySlug
                .filter((a: RelatedArticle) => a.slug !== slug)
                .slice(0, 6);
              console.debug('Related via import', related.length);
              setRelatedArticles(related);
              if (related.length > 0) return; // good, no need to fetch
            } catch (e) {
              console.warn('Index import failed, falling back to fetch', e);
            }
          }
          // Fallback to network fetch if dynamic import missing or empty
          try {
            const base = import.meta.env.BASE_URL || '/';
            const basePath = base.endsWith('/') ? base : `${base}/`;
            const resp = await fetch(`${basePath}data/indices/${country}.json?v=${Date.now()}`, { cache: 'no-store' });
            if (resp.ok) {
              const data = await resp.json();
              const allArticles = data.articles || [];
              const uniqueBySlug = allArticles.filter((a: RelatedArticle, i: number, self: RelatedArticle[]) =>
                i === self.findIndex(b => b.slug === a.slug)
              );
              const related = uniqueBySlug
                .filter((a: RelatedArticle) => a.slug !== slug)
                .slice(0, 6);
              console.debug('Related via fetch', related.length);
              setRelatedArticles(related);
            } else {
              console.warn('Related index fetch not ok', resp.status);
            }
          } catch (e) {
            console.error('Related index fetch error', e);
          }
        } catch (err) {
          console.error('Error loading related articles:', err);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        console.error("Error loading article:", err);
      } finally {
        setLoading(false);
      }
    };

    if (country && year && month && day && slug) {
      fetchArticle();
    }
  }, [country, year, month, day, slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !article) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">❌ {error || "Artículo no encontrado"}</h1>
            <p className="text-muted-foreground">
              El artículo que buscas no está disponible.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{article.title} | Alofoke.ai</title>
        <meta name="description" content={article.subtitle} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.subtitle} />
        <meta property="og:type" content="article" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-8">
          <article className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="text-sm">
                  {TYPE_LABELS[article.type as keyof typeof TYPE_LABELS] || article.type}
                </Badge>
                <Badge className={`text-sm ${TIER_COLORS[article.tier as keyof typeof TIER_COLORS]}`}>
                  {TIER_ICONS[article.tier as keyof typeof TIER_ICONS]} {article.tier.toUpperCase()}
                </Badge>
                <span className="text-2xl">
                  {COUNTRY_FLAGS[article.country as keyof typeof COUNTRY_FLAGS]}
                </span>
              </div>

              <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
              
              <p className="text-xl text-muted-foreground mb-4">{article.subtitle}</p>

              <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(article.date)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <span>📝</span>
                  <span>Director Editorial: César Soriano (Ramon Almonte Soriano)</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: article.body_html }}
            />

            {/* Sources */}
            {article.sources && article.sources.length > 0 && (
              <div className="mt-8 p-6 bg-muted rounded-lg">
                <h3 className="text-lg font-semibold mb-3">📚 Fuentes citadas</h3>
                <ul className="space-y-2">
                  {article.sources.map((source, index) => (
                    <li key={index}>
                      <a
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="line-clamp-1">{source}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Disclaimers */}
            <div className="mt-8 p-6 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-lg">✍️</span>
                <span className="font-medium">Supervisado por César Soriano (Ramon Almonte Soriano), Director Editorial de Alofoke.ai</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>🤖</span>
                <span>Artículo asistido por IA</span>
              </div>
              
              {article.human_verified && (
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <span>✓</span>
                  <span>Verificado por humanos</span>
                </div>
              )}
              
              {article.low_confidence && (
                <div className="flex items-center gap-2 text-sm text-amber-700">
                  <span>⚠️</span>
                  <span>En revisión - Puede contener imprecisiones</span>
                </div>
              )}
            </div>
          </article>

          {/* Related Articles */}
          {false && relatedArticles.length > 0 && (
            <div className="max-w-6xl mx-auto mt-16 mb-8">
              <h2 className="text-2xl font-bold mb-6">Más artículos de {article.country.toUpperCase()}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedArticles.map((related) => (
                  <CuratedArticleCard
                    key={related.slug}
                    title={related.title}
                    subtitle={related.subtitle}
                    country={related.country}
                    date={related.date}
                    type={related.type}
                    tier={related.tier}
                    url={related.url}
                    tags={related.tags}
                    human_verified={related.human_verified}
                    low_confidence={related.low_confidence}
                  />
                ))}
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CuratedArticle;
