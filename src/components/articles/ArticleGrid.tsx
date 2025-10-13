import ArticleCard from "./ArticleCard";

const mockArticles = [
  {
    id: 1,
    title: "GPT-5 revoluciona el procesamiento de lenguaje natural",
    excerpt: "OpenAI anuncia avances significativos en comprensión contextual y razonamiento multimodal con su nuevo modelo de IA.",
    category: "Noticias",
    date: "13 Oct 2025",
    readTime: "5 min",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80"
  },
  {
    id: 2,
    title: "IA generativa transforma la medicina diagnóstica",
    excerpt: "Nuevos modelos de IA detectan enfermedades con 95% de precisión, superando diagnósticos tradicionales en hospitales latinoamericanos.",
    category: "Análisis",
    date: "13 Oct 2025",
    readTime: "7 min",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80"
  },
  {
    id: 3,
    title: "Agentes autónomos de IA en atención al cliente",
    excerpt: "Empresas en México y Colombia implementan chatbots avanzados que resuelven 80% de consultas sin intervención humana.",
    category: "Casos de Uso",
    date: "13 Oct 2025",
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&q=80"
  },
  {
    id: 4,
    title: "Regulación de IA en Europa: Impacto en Latinoamérica",
    excerpt: "El AI Act europeo establece precedentes que influirán en legislaciones tech de Argentina, Brasil y Chile.",
    category: "Noticias",
    date: "13 Oct 2025",
    readTime: "8 min",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80"
  },
  {
    id: 5,
    title: "Automatización inteligente en manufactura argentina",
    excerpt: "Robots colaborativos con IA aumentan productividad 40% en plantas industriales de Buenos Aires y Córdoba.",
    category: "Casos de Uso",
    date: "13 Oct 2025",
    readTime: "5 min",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80"
  },
  {
    id: 6,
    title: "Modelos de lenguaje en español: Estado actual",
    excerpt: "Análisis comparativo de rendimiento entre LLMs entrenados específicamente para mercados hispanohablantes.",
    category: "Análisis",
    date: "13 Oct 2025",
    readTime: "9 min",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80"
  }
];

const ArticleGrid = () => {
  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Últimas Noticias</h2>
          <p className="text-muted-foreground">Actualizadas cada 12 horas • 6 AM y 6 PM</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockArticles.map((article) => (
          <ArticleCard key={article.id} {...article} />
        ))}
      </div>
    </div>
  );
};

export default ArticleGrid;
