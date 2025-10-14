import { lazy, Suspense, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ArticleGridDatabase from "@/components/articles/ArticleGridDatabase";
import EditorialSection from "@/components/editorials/EditorialSection";

const NadakkiAd = lazy(() => import("@/components/NadakkiAd"));

const Index = () => {
  useEffect(() => {
    // Add JSON-LD structured data for the website
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Alofoke.ai",
      "description": "Portal de noticias sobre inteligencia artificial en español - Análisis, casos de uso y tendencias de IA para Latinoamérica",
      "url": "https://alofoke.ai",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://alofoke.ai/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    });
    document.head.appendChild(script);
    
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
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-fade-in">
            Inteligencia Artificial para Latinoamérica
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Noticias, análisis y casos de uso actualizados dos veces al día
          </p>
        </div>

        <Suspense fallback={<div className="h-32 animate-pulse bg-muted rounded-lg mb-12" />}>
          <div className="mb-12">
            <NadakkiAd />
          </div>
        </Suspense>

        <EditorialSection />
        <ArticleGridDatabase />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
