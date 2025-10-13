// Mock service para demostrar actualizaciones de artículos
// En producción, esto se conectaría a una API o base de datos

export interface Article {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  publishedAt: Date;
}

const imageUrls = [
  "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
  "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&q=80",
  "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80",
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
  "https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=800&q=80",
  "https://images.unsplash.com/photo-1676277791608-3b792f9e9b89?w=800&q=80",
];

// Simula obtener artículos basados en la hora del día
export const getArticlesByTimeOfDay = (): Article[] => {
  const now = new Date();
  const hour = now.getHours();
  
  // Determina si es la edición de la mañana (6 AM) o tarde (6 PM)
  const isMorningEdition = hour < 18;
  const editionLabel = isMorningEdition ? "Edición Mañana" : "Edición Tarde";
  
  const baseArticles: Omit<Article, 'id' | 'date' | 'publishedAt'>[] = [
    {
      title: `${editionLabel}: GPT-5 revoluciona el procesamiento de lenguaje natural`,
      excerpt: "OpenAI anuncia avances significativos en comprensión contextual y razonamiento multimodal con su nuevo modelo de IA.",
      category: "Noticias",
      readTime: "5 min",
      image: imageUrls[0]
    },
    {
      title: `${editionLabel}: IA generativa transforma la medicina diagnóstica`,
      excerpt: "Nuevos modelos de IA detectan enfermedades con 95% de precisión, superando diagnósticos tradicionales en hospitales latinoamericanos.",
      category: "Análisis",
      readTime: "7 min",
      image: imageUrls[1]
    },
    {
      title: `${editionLabel}: Agentes autónomos de IA en atención al cliente`,
      excerpt: "Empresas en México y Colombia implementan chatbots avanzados que resuelven 80% de consultas sin intervención humana.",
      category: "Casos de Uso",
      readTime: "6 min",
      image: imageUrls[2]
    },
    {
      title: `${editionLabel}: Regulación de IA en Europa impacta Latinoamérica`,
      excerpt: "El AI Act europeo establece precedentes que influirán en legislaciones tech de Argentina, Brasil y Chile.",
      category: "Noticias",
      readTime: "8 min",
      image: imageUrls[3]
    },
    {
      title: `${editionLabel}: Automatización inteligente en manufactura`,
      excerpt: "Robots colaborativos con IA aumentan productividad 40% en plantas industriales de Buenos Aires y Córdoba.",
      category: "Casos de Uso",
      readTime: "5 min",
      image: imageUrls[4]
    },
    {
      title: `${editionLabel}: Modelos de lenguaje en español al día`,
      excerpt: "Análisis comparativo de rendimiento entre LLMs entrenados específicamente para mercados hispanohablantes.",
      category: "Análisis",
      readTime: "9 min",
      image: imageUrls[5]
    }
  ];

  const today = now.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
  
  return baseArticles.map((article, index) => ({
    ...article,
    id: Date.now() + index,
    date: today,
    publishedAt: now
  }));
};

// Para producción: Función que obtendría artículos desde Supabase
export const fetchArticlesFromDatabase = async (): Promise<Article[]> => {
  // Esta función se conectaría a Supabase cuando esté habilitado
  // const { data, error } = await supabase
  //   .from('articles')
  //   .select('*')
  //   .order('published_at', { ascending: false })
  //   .limit(6);
  
  // Por ahora retorna los artículos mock
  return getArticlesByTimeOfDay();
};
