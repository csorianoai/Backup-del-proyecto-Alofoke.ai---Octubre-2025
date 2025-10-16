import { lazy, Suspense, useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CuratedArticleCard from "@/components/articles/CuratedArticleCard";
import { Skeleton } from "@/components/ui/skeleton";

const NadakkiAd = lazy(() => import("@/components/NadakkiAd"));

interface ArticleIndex {
  title: string;
  subtitle: string;
  slug: string;
  url: string;
  date: string;
  country: string;
  type: string;
  tier: string;
  tags: string[];
  human_verified?: boolean;
  low_confidence?: boolean;
}

const Index = () => {
  const [articles, setArticles] = useState<ArticleIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/data/indices/global.json?v=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        setArticles(data.articles || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading articles:', err);
        setError('Error cargando artículos');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // Add comprehensive JSON-LD structured data for SEO
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "NewsMediaOrganization",
      "name": "Alofoke.ai",
      "description": "Portal líder de noticias sobre inteligencia artificial en República Dominicana",
      "url": "https://alofoke.ai",
      "logo": "https://alofoke.ai/images/latam-ai-brasil-mexico.jpg",
      "sameAs": [
        "https://twitter.com/alofoke_ai"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Editorial",
        "areaServed": "DO",
        "availableLanguage": "Spanish"
      },
      "areaServed": {
        "@type": "Country",
        "name": "República Dominicana"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://alofoke.ai/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Inicio",
          "item": "https://alofoke.ai"
        }
      ]
    };

    const script1 = document.createElement('script');
    script1.type = 'application/ld+json';
    script1.text = JSON.stringify(organizationSchema);
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.type = 'application/ld+json';
    script2.text = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(script2);
    
    return () => {
      const scripts = document.head.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(s => s.remove());
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-fade-in">
            Inteligencia Artificial en Latinoamérica
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Noticias, análisis y casos de uso de IA en RD, Colombia, México y Argentina. Actualizado 3 veces al día.
          </p>
        </div>

        <Suspense fallback={<div className="h-32 animate-pulse bg-muted rounded-lg mb-12" />}>
          <div className="mb-12">
            <NadakkiAd />
          </div>
        </Suspense>

        <div className="space-y-8">
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
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
              <p className="text-destructive">{error}</p>
            </div>
          )}

          {!loading && !error && articles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay artículos disponibles todavía.</p>
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
