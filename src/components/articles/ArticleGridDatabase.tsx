import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import ArticleCard from "./ArticleCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

const ArticleGridDatabase = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const loadArticles = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      if (data) {
        setArticles(data as Article[]);
        setLastUpdate(new Date());
        toast({
          title: "Artículos actualizados",
          description: `Se cargaron ${data.length} artículos exitosamente.`,
        });
      }
    } catch (error: any) {
      console.error('Error loading articles:', error);
      toast({
        title: "Error al cargar artículos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const getNextUpdateTime = () => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour < 6) return "6:00 AM";
    if (hour < 18) return "6:00 PM";
    return "6:00 AM (mañana)";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2">Últimas Noticias</h2>
          <p className="text-muted-foreground">
            Actualizadas desde la base de datos • Sistema automático 6 AM y 6 PM
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Última actualización: {lastUpdate.toLocaleTimeString('es')} • Próxima: {getNextUpdateTime()}
          </p>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={loadArticles}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          <div 
            key={article.id}
            className="animate-in fade-in slide-in-from-bottom"
            style={{ animationDelay: `${index * 100}ms` }}
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
    </div>
  );
};

export default ArticleGridDatabase;
