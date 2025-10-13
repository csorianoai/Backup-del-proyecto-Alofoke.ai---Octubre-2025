import { lazy, Suspense } from "react";

const NadakkiAd = lazy(() => import("@/components/NadakkiAd"));

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-bold text-primary">Alofoke.ai</h1>
            <p className="text-xl text-muted-foreground">
              Portal de noticias sobre inteligencia artificial en español
            </p>
          </div>
          
          <Suspense fallback={<div className="h-32 animate-pulse bg-muted rounded-lg" />}>
            <NadakkiAd />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default Index;
