import { lazy, Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ArticleGridDatabase from "@/components/articles/ArticleGridDatabase";
import EditorialSection from "@/components/editorials/EditorialSection";

const NadakkiAd = lazy(() => import("@/components/NadakkiAd"));

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
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
