import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import ArticleCard from "./ArticleCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Article {
  title: string;
  subtitle: string;
  slug: string;
  url: string;
  date: string;
  type: string;
  tier: string;
  tags: string[];
  country: string;
}

const ArticleGridDatabase = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const loadArticles = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/data/indices/global.json');
      if (!response.ok) throw new Error('No se pudo cargar el índice');
      
      const data = await response.json();
      
      // Filter duplicates by slug before limiting
      const allArticles = data.articles || [];
      const uniqueArticles = allArticles.filter((article: Article, index: number, self: Article[]) => 
        index === self.findIndex((a) => a.slug === article.slug)
      );
      const latestArticles = uniqueArticles.slice(0, 18);
      
      setArticles(latestArticles);
      setLastUpdate(new Date());
      toast({
        title: "Artículos actualizados",
        description: `Se cargaron ${latestArticles.length} artículos desde el workflow.`,
      });
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
            key={article.slug}
            className="animate-in fade-in slide-in-from-bottom"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ArticleCard
              title={article.title}
              excerpt={article.subtitle}
              category={article.type === 'news_brief' ? 'Noticia' : article.type === 'explainer' ? 'Análisis' : 'Tendencias'}
              date={formatDate(article.date)}
              readTime={`${Math.ceil(article.subtitle.length / 200)} min`}
              image={`https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop`}
              url={article.url}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArticleGridDatabase;
