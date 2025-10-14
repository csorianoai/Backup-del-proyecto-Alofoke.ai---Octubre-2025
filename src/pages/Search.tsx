import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ArticleCard from "@/components/articles/ArticleCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon } from "lucide-react";

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

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Update meta tags for SEO
    document.title = searchQuery 
      ? `Búsqueda: ${searchQuery} - Alofoke.ai` 
      : 'Buscar Noticias de IA - Alofoke.ai';
    
    // Add JSON-LD for search page
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SearchResultsPage",
      "name": "Búsqueda de Noticias de Inteligencia Artificial",
      "url": `https://alofoke.ai/buscar${searchQuery ? `?q=${searchQuery}` : ''}`
    });
    document.head.appendChild(script);

    return () => {
      const scripts = document.head.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(s => s.remove());
    };
  }, [searchQuery]);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [searchParams]);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setArticles([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
        .order('published_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setArticles(data || []);

      if (!data || data.length === 0) {
        toast({
          title: "Sin resultados",
          description: `No se encontraron artículos para "${query}"`,
        });
      }
    } catch (error: any) {
      console.error('Error searching:', error);
      toast({
        title: "Error en la búsqueda",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
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
        <div className="max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold mb-6 text-center">
            Buscar Noticias de IA
          </h1>
          
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Buscar artículos sobre inteligencia artificial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              <SearchIcon className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </form>

          {searchParams.get('q') && (
            <p className="text-muted-foreground mt-4 text-center">
              {loading ? 'Buscando...' : `${articles.length} resultados para "${searchParams.get('q')}"`}
            </p>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 animate-pulse bg-muted rounded-lg" />
            ))}
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                title={article.title}
                excerpt={article.excerpt}
                category={article.category}
                date={formatDate(article.published_at)}
                readTime={article.read_time}
                image={article.image_url}
                slug={article.slug}
              />
            ))}
          </div>
        ) : searchParams.get('q') ? (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              No se encontraron resultados
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Intenta con otros términos de búsqueda
            </p>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
};

export default Search;
