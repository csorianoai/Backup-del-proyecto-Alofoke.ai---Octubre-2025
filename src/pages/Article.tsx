import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
    const tryMarkdown = async (slugPath: string): Promise<ArticleData | null> => {
      const parts = slugPath.split('/').filter(Boolean);
      if (parts.length < 5) return null;
      const [country, year, month, day, ...rest] = parts;
      const articleSlugRaw = rest.join('/');
      const articleSlug = articleSlugRaw.replace(/\.+$/, '');
      const modules = import.meta.glob('/data/articles/**/*.md', { as: 'raw' });
      const suffix = `/${country}/${year}/${month}/${day}/${articleSlug}.md`;
      const matchKey = Object.keys(modules).find((k) => k.endsWith(suffix));
      let content: string;
      if (matchKey) {
        const loader: any = modules[matchKey as keyof typeof modules];
        content = await loader();
      } else {
        const base = import.meta.env.BASE_URL || '/';
        const resp = await fetch(`${base}data/articles/${country}/${year}/${month}/${day}/${articleSlug}.md?v=${Date.now()}`, { cache: 'no-store' });
        if (!resp.ok) return null;
        content = await resp.text();
      }
      const lines = content.split('\n');
      let fmStart = -1;
      let fmEnd = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === '---') {
          if (fmStart === -1) fmStart = i; else { fmEnd = i; break; }
        }
      }
      let metadata: any = {};
      let articleContent = content;
      if (fmStart !== -1 && fmEnd !== -1) {
        const fmLines = lines.slice(fmStart + 1, fmEnd);
        fmLines.forEach(line => {
          const [key, ...valueParts] = line.split(':');
          if (key && valueParts.length > 0) {
            const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
            metadata[key.trim()] = value;
          }
        });
        articleContent = lines.slice(fmEnd + 1).join('\n').trim();
      }
      return {
        id: articleSlug,
        title: metadata.title || 'Sin título',
        excerpt: metadata.excerpt || metadata.description || '',
        content: articleContent,
        category: metadata.category || 'News Brief',
        author: metadata.author || 'Alofoke.ai',
        read_time: metadata.read_time || '5 min',
        published_at: metadata.date || new Date().toISOString(),
        image_url: metadata.image || '/placeholder.svg',
      } as ArticleData;
    };

    const tryDB = async (slugValue: string): Promise<ArticleData | null> => {
      if (!slugValue) return null;
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slugValue)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        id: data.id,
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        category: data.category,
        author: data.author || 'Alofoke.ai',
        read_time: data.read_time || '5 min',
        published_at: data.published_at,
        image_url: data.image_url || '/placeholder.svg',
      } as ArticleData;
    };

    const load = async () => {
      if (!decodedSlug) return;
      setLoading(true);
      try {
        let result: ArticleData | null = null;
        const hasPath = decodedSlug.includes('/');
        if (hasPath) {
          result = await tryMarkdown(decodedSlug);
          if (!result) {
            const last = decodedSlug.split('/').pop() || decodedSlug;
            result = await tryDB(last);
          }
        } else {
          result = await tryDB(decodedSlug);
          if (!result) {
            result = await tryMarkdown(decodedSlug);
          }
        }

        if (!result) throw new Error('Artículo no encontrado');
        setArticle(result);

        document.title = `${result.title} - Alofoke.ai`;
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) metaDescription.setAttribute('content', result.excerpt || result.title);
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', result.title);
        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription) ogDescription.setAttribute('content', result.excerpt || result.title);
        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) ogImage.setAttribute('content', result.image_url);
        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) ogUrl.setAttribute('content', `https://alofoke.ai/articulo/${decodedSlug}`);
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify({
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "headline": result.title,
          "image": result.image_url,
          "datePublished": result.published_at,
          "author": { "@type": "Person", "name": result.author },
          "publisher": { "@type": "Organization", "name": "Alofoke.ai", "logo": { "@type": "ImageObject", "url": "https://alofoke.ai/og-image.png" } },
          "description": result.excerpt || result.title
        });
        document.head.appendChild(script);
      } catch (error: any) {
        console.error('Error loading article:', error);
        toast({ title: 'Error al cargar artículo', description: error.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    load();
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
