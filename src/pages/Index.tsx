import { lazy, Suspense, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ArticleGridDatabase from "@/components/articles/ArticleGridDatabase";
import EditorialSection from "@/components/editorials/EditorialSection";

const NadakkiAd = lazy(() => import("@/components/NadakkiAd"));

const Index = () => {
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
            Inteligencia Artificial en República Dominicana
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            El portal líder de noticias sobre IA en RD. Análisis, casos de uso y tendencias actualizadas dos veces al día.
          </p>
        </div>

        <Suspense fallback={<div className="h-32 animate-pulse bg-muted rounded-lg mb-12" />}>
          <div className="mb-12">
            <NadakkiAd />
          </div>
        </Suspense>

        {/* <EditorialSection /> */}
        <ArticleGridDatabase />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
