import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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

const COUNTRY_NAMES = {
  do: "República Dominicana",
  co: "Colombia",
  mx: "México",
  ar: "Argentina",
  es: "España",
  pe: "Perú",
  pa: "Panamá",
  cl: "Chile",
  uy: "Uruguay",
};

const CountryFeed = () => {
  const { country } = useParams<{ country: string }>();
  const [articles, setArticles] = useState<ArticleIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const modules = import.meta.glob('/data/indices/*.json');
        const path = `/data/indices/${country}.json`;
        const loader = modules[path as keyof typeof modules];
        let data: any | null = null;
        if (loader) {
          try {
            const mod: any = await (loader as any)();
            data = mod.default || mod;
          } catch (e) {
            console.warn('Country index import failed, will fetch', e);
          }
        }
        if (!data) {
          const base = import.meta.env.BASE_URL || '/';
          const basePath = base.endsWith('/') ? base : `${base}/`;
          const resp = await fetch(`${basePath}data/indices/${country}.json?v=${Date.now()}`, { cache: 'no-store' });
          if (!resp.ok) throw new Error('Índice del país no encontrado');
          data = await resp.json();
        }
        const allArticles = data.articles || [];
        const uniqueArticles = allArticles.filter((a: ArticleIndex, i: number, self: ArticleIndex[]) =>
          i === self.findIndex(b => b.slug === a.slug)
        );
        setArticles(uniqueArticles);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Error loading articles:', err);
      } finally {
        setLoading(false);
      }
    };

    if (country) load();
  }, [country]);

  const countryName = COUNTRY_NAMES[country as keyof typeof COUNTRY_NAMES] || country;

  return (
    <>
      <Helmet>
        <title>Noticias IA {countryName} | Alofoke.ai</title>
        <meta
          name="description"
          content={`Últimas noticias sobre inteligencia artificial en ${countryName}. Análisis, tendencias y casos de uso.`}
        />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                IA en {countryName}
              </h1>
              <p className="text-muted-foreground">
                Noticias curadas sobre inteligencia artificial
              </p>
            </div>
            
            <CountrySelector currentCountry={country} />
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
                No hay artículos disponibles para este país aún.
              </p>
            </div>
          )}

          {!loading && !error && articles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No hay artículos disponibles para {countryName} aún.
              </p>
            </div>
          )}

          {!loading && !error && articles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <CuratedArticleCard
                  key={article.slug}
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

export default CountryFeed;
