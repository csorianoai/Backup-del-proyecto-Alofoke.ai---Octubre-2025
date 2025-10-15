import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
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
};

const CuratedArticle = () => {
  const { country, year, month, day, slug } = useParams();
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `/data/articles/${country}/${year}/${month}/${day}/${slug}.md`
        );
        
        if (!response.ok) {
          throw new Error("Artículo no encontrado");
        }
        
        const markdown = await response.text();
        
        // Parse frontmatter manually
        const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        
        if (!frontmatterMatch) {
          throw new Error("Formato de artículo inválido");
        }
        
        const frontmatter = frontmatterMatch[1];
        const body = frontmatterMatch[2];
        
        // Parse YAML frontmatter
        const metadata: any = {};
        frontmatter.split("\n").forEach((line) => {
          const match = line.match(/^(\w+):\s*(.+)$/);
          if (match) {
            const key = match[1];
            let value: any = match[2];
            
            // Parse arrays
            if (value.startsWith("[") && value.endsWith("]")) {
              value = JSON.parse(value);
            }
            // Parse booleans
            else if (value === "true") value = true;
            else if (value === "false") value = false;
            // Remove quotes from strings
            else if (value.startsWith('"') && value.endsWith('"')) {
              value = value.slice(1, -1);
            }
            
            metadata[key] = value;
          }
        });
        
        setArticle({
          ...metadata,
          body_html: body,
        } as ArticleData);
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

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(article.date)}</span>
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
            <div className="mt-8 space-y-2">
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
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CuratedArticle;
