import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CuratedArticleCard from "@/components/articles/CuratedArticleCard";
import CountrySelector from "@/components/CountrySelector";
import { Skeleton } from "@/components/ui/skeleton";

interface ArticleIndex {
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

const LatamFeed = () => {
  const [articles, setArticles] = useState<ArticleIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        setError(null);

        // Intento 1: usar URL de activo para asegurarnos de que se incluya en el build
        const urlMods = import.meta.glob('/data/indices/*.json', { as: 'url', eager: true }) as Record<string, string>;
        const keys = Object.keys(urlMods);
        let data: any = null;
        const matchKey = keys.find(k => k.endsWith('/global.json') || k.includes('/data/indices/global.json'));
        if (matchKey) {
          const resp = await fetch(urlMods[matchKey], { cache: 'no-store' });
          if (resp.ok) data = await resp.json();
        }
        
        // Fallback: fetch directo desde rutas públicas
        if (!data) {
          const base = import.meta.env.BASE_URL || '/';
          const basePath = base.endsWith('/') ? base : `${base}/`;
          const urls = [
            `${basePath}data/indices/global.json?v=${Date.now()}`,
            `/data/indices/global.json?v=${Date.now()}`,
          ];
          for (const u of urls) {
            try {
              const r = await fetch(u, { cache: 'no-store' });
              if (r.ok) { data = await r.json(); break; }
            } catch {}
          }
        }
        if (!data) throw new Error('Índice global no encontrado');
        setArticles(data.articles || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Error loading articles:', err);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  return (
    <>
      <Helmet>
        <title>IA en América Latina | Alofoke.ai</title>
        <meta
          name="description"
          content="Últimas noticias sobre inteligencia artificial en América Latina. Análisis regional, tendencias y casos de uso."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                🌎 IA en América Latina
              </h1>
              <p className="text-muted-foreground">
                Panorama regional de inteligencia artificial
              </p>
            </div>
            
            <CountrySelector currentCountry="latam" />
          </div>

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">❌ {error}</p>
              <p className="text-muted-foreground">
                No hay artículos disponibles aún.
              </p>
            </div>
          )}

          {!loading && !error && articles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No hay artículos disponibles aún. El pipeline generará contenido pronto.
              </p>
            </div>
          )}

          {!loading && !error && articles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <CuratedArticleCard
                  key={`${article.country}-${article.slug}`}
                  title={article.title}
                  subtitle={article.subtitle}
                  country={article.country}
                  date={article.date}
                  type={article.type}
                  tier={article.tier}
                  url={article.url}
                  tags={article.tags}
                  human_verified={article.human_verified}
                  low_confidence={article.low_confidence}
                />
              ))}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default LatamFeed;
