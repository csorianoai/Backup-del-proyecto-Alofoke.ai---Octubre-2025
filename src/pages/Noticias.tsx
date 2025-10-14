import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ArticleCard from "@/components/articles/ArticleCard";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  image_url: string;
  read_time: string;
  published_at: string;
}

const Noticias = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Update meta tags for SEO
    document.title = 'Noticias de Inteligencia Artificial - Alofoke.ai';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Últimas noticias sobre inteligencia artificial en República Dominicana y el mundo. Mantente informado sobre IA, ChatGPT, machine learning y más.');
    }

    // Add JSON-LD structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Noticias de Inteligencia Artificial",
      "description": "Últimas noticias sobre IA en República Dominicana",
      "url": "https://alofoke.ai/noticias",
      "inLanguage": "es-DO"
    });
    document.head.appendChild(script);

    loadArticles();

    return () => {
      const scripts = document.head.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(s => s.remove());
    };
  }, []);

  const loadArticles = async () => {
    try {
      setIsRefreshing(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('category', 'noticias')
        .order('published_at', { ascending: false })
        .limit(12);

      if (error) throw error;
      setArticles(data || []);
    } catch (error: any) {
      console.error('Error loading articles:', error);
      toast({
        title: "Error al cargar noticias",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Noticias de Inteligencia Artificial
            </h1>
            <p className="text-muted-foreground">
              Últimas actualizaciones sobre IA en República Dominicana y el mundo
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadArticles}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 animate-pulse bg-muted rounded-lg" />
            ))}
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <div
                key={article.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ArticleCard
                  title={article.title}
                  excerpt={article.excerpt}
                  category={article.category}
                  date={formatDate(article.published_at)}
                  readTime={article.read_time}
                  image={article.image_url}
                  slug={article.slug}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              No hay noticias disponibles en este momento
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Noticias;
