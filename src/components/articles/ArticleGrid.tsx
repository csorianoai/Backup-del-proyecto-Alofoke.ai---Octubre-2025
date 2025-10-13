import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import ArticleCard from "./ArticleCard";
import { Button } from "@/components/ui/button";
import { getArticlesByTimeOfDay, type Article } from "@/utils/articleService";

const ArticleGrid = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadArticles = () => {
    setIsRefreshing(true);
    const newArticles = getArticlesByTimeOfDay();
    setArticles(newArticles);
    setLastUpdate(new Date());
    setTimeout(() => setIsRefreshing(false), 500);
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

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2">Últimas Noticias</h2>
          <p className="text-muted-foreground">
            Actualizadas cada 12 horas • 6 AM y 6 PM
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
            <ArticleCard {...article} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArticleGrid;
