import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ArticleData {
  id: string;
  title: string;
  excerpt?: string;
  content: string;
  category: string;
  author: string;
  read_time: string;
  published_at: string;
  image_url: string;
}

const Article = () => {
  const params = useParams();
  const rawSlug = (params.slug as string) ?? (params["*"] as string) ?? "";
  const decodedSlug = decodeURIComponent(rawSlug);

  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadArticle = async () => {
      if (!decodedSlug) return;

      try {
        setLoading(true);
        
        // Parse the slug to extract country, date, and article slug
        // Format: /articulo/ar/2025/10/16/article-slug
        const parts = decodedSlug.split('/').filter(Boolean);
        
        if (parts.length < 5) {
          throw new Error('Formato de URL inválido');
        }
        
        const country = parts[0];
        const year = parts[1];
        const month = parts[2];
        const day = parts[3];
        const articleSlug = parts.slice(4).join('/');
        
        // Construct the path to the markdown file
        const articlePath = `/data/articles/${country}/${year}/${month}/${day}/${articleSlug}.md`;
        
        const base = import.meta.env.BASE_URL || '/';
        const response = await fetch(`${base}${articlePath}?v=${Date.now()}`, { cache: 'no-store' });
        
        if (!response.ok) {
          throw new Error('Artículo no encontrado');
        }
        
        const content = await response.text();
        
        // Parse markdown frontmatter and content
        const lines = content.split('\n');
        let frontmatterEnd = -1;
        let frontmatterStart = -1;
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trim() === '---') {
            if (frontmatterStart === -1) {
              frontmatterStart = i;
            } else {
              frontmatterEnd = i;
              break;
            }
          }
        }
        
        let metadata: any = {};
        let articleContent = content;
        
        if (frontmatterStart !== -1 && frontmatterEnd !== -1) {
          const frontmatterLines = lines.slice(frontmatterStart + 1, frontmatterEnd);
          frontmatterLines.forEach(line => {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length > 0) {
              const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
              metadata[key.trim()] = value;
            }
          });
          articleContent = lines.slice(frontmatterEnd + 1).join('\n').trim();
        }
        
        const articleData: ArticleData = {
          id: articleSlug,
          title: metadata.title || 'Sin título',
          excerpt: metadata.excerpt || metadata.description || '',
          content: articleContent,
          category: metadata.category || 'News Brief',
          author: metadata.author || 'Alofoke.ai',
          read_time: metadata.read_time || '5 min',
          published_at: metadata.date || new Date().toISOString(),
          image_url: metadata.image || '/placeholder.svg',
        };

        setArticle(articleData);
        
        // Update meta tags for SEO
        document.title = `${articleData.title} - Alofoke.ai`;
        
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', articleData.excerpt || articleData.title);
        }
        
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', articleData.title);
        
        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription) ogDescription.setAttribute('content', articleData.excerpt || articleData.title);
        
        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) ogImage.setAttribute('content', articleData.image_url);
        
        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) ogUrl.setAttribute('content', `https://alofoke.ai/articulo/${decodedSlug}`);
        
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify({
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "headline": articleData.title,
          "image": articleData.image_url,
          "datePublished": articleData.published_at,
          "author": {
            "@type": "Person",
            "name": articleData.author
          },
          "publisher": {
            "@type": "Organization",
            "name": "Alofoke.ai",
            "logo": {
              "@type": "ImageObject",
              "url": "https://alofoke.ai/og-image.png"
            }
          },
          "description": articleData.excerpt || articleData.title
        });
        document.head.appendChild(script);
        
      } catch (error: any) {
        console.error('Error loading article:', error);
        toast({
          title: "Error al cargar artículo",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [decodedSlug, toast]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Artículo no encontrado</h1>
          <Link to="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>

        <div className="relative h-96 w-full mb-8 rounded-lg overflow-hidden">
          <img 
            src={article.image_url} 
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="mb-6">
          <Badge className="mb-4">{article.category}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{article.title}</h1>
          
          <div className="flex items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(article.published_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{article.read_time}</span>
            </div>
            <span>Por {article.author}</span>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          {article.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-4 text-foreground leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default Article;
