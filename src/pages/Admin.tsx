import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Brain, LogOut, PlusCircle, Newspaper } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Admin = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Editorial fields
  const [editorialTitle, setEditorialTitle] = useState("");
  const [editorialContent, setEditorialContent] = useState("");
  const [editorialPublished, setEditorialPublished] = useState(false);
  
  // Article fields
  const [articleTitle, setArticleTitle] = useState("");
  const [articleSlug, setArticleSlug] = useState("");
  const [articleExcerpt, setArticleExcerpt] = useState("");
  const [articleContent, setArticleContent] = useState("");
  const [articleCategory, setArticleCategory] = useState("noticias");
  const [articleImageUrl, setArticleImageUrl] = useState("");
  const [articleReadTime, setArticleReadTime] = useState("5 min");
  const [articleAuthor, setArticleAuthor] = useState("Equipo Alofoke.ai");
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Verificar autenticación
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        checkAdminRole(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAdminRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (error || !data) {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos de administrador.",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleEditorialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('director_editorials')
        .insert({
          title: editorialTitle,
          content: editorialContent,
          is_published: editorialPublished,
          author: 'Director Editorial'
        });

      if (error) throw error;

      toast({
        title: "¡Editorial creada!",
        description: editorialPublished ? "La editorial ha sido publicada." : "La editorial ha sido guardada como borrador.",
      });

      setEditorialTitle("");
      setEditorialContent("");
      setEditorialPublished(false);
    } catch (error: any) {
      toast({
        title: "Error al guardar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const articleData: Database['public']['Tables']['articles']['Insert'] = {
        title: articleTitle,
        slug: articleSlug,
        excerpt: articleExcerpt,
        content: articleContent,
        category: articleCategory as Database['public']['Enums']['article_category'],
        image_url: articleImageUrl,
        read_time: articleReadTime,
        author: articleAuthor,
      };

      const { error } = await supabase
        .from('articles')
        .insert(articleData);

      if (error) throw error;

      toast({
        title: "¡Artículo creado!",
        description: "El artículo ha sido publicado exitosamente.",
      });

      setArticleTitle("");
      setArticleSlug("");
      setArticleExcerpt("");
      setArticleContent("");
      setArticleCategory("noticias");
      setArticleImageUrl("");
      setArticleReadTime("5 min");
      setArticleAuthor("Equipo Alofoke.ai");
    } catch (error: any) {
      toast({
        title: "Error al guardar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Panel de Administración</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="article" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="article">
              <Newspaper className="h-4 w-4 mr-2" />
              Nuevo Artículo
            </TabsTrigger>
            <TabsTrigger value="editorial">
              <PlusCircle className="h-4 w-4 mr-2" />
              Nueva Editorial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="article">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5" />
                  Crear Nuevo Artículo
                </CardTitle>
                <CardDescription>
                  Publica noticias, análisis o casos de uso de IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleArticleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="article-title">Título</Label>
                      <Input
                        id="article-title"
                        placeholder="Título del artículo"
                        value={articleTitle}
                        onChange={(e) => setArticleTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="article-slug">Slug (URL)</Label>
                      <Input
                        id="article-slug"
                        placeholder="mi-articulo-2025"
                        value={articleSlug}
                        onChange={(e) => setArticleSlug(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="article-excerpt">Extracto</Label>
                    <Textarea
                      id="article-excerpt"
                      placeholder="Breve descripción del artículo (150-200 caracteres)"
                      value={articleExcerpt}
                      onChange={(e) => setArticleExcerpt(e.target.value)}
                      required
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="article-content">Contenido Completo</Label>
                    <Textarea
                      id="article-content"
                      placeholder="Escribe el contenido completo del artículo aquí. Separa párrafos con líneas en blanco."
                      value={articleContent}
                      onChange={(e) => setArticleContent(e.target.value)}
                      required
                      className="min-h-[400px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="article-category">Categoría</Label>
                      <Select value={articleCategory} onValueChange={setArticleCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="noticias">Noticias</SelectItem>
                          <SelectItem value="analisis">Análisis</SelectItem>
                          <SelectItem value="casos_de_uso">Casos de Uso</SelectItem>
                          <SelectItem value="tutoriales">Tutoriales</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="article-read-time">Tiempo de Lectura</Label>
                      <Input
                        id="article-read-time"
                        placeholder="5 min"
                        value={articleReadTime}
                        onChange={(e) => setArticleReadTime(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="article-author">Autor</Label>
                      <Input
                        id="article-author"
                        placeholder="Equipo Alofoke.ai"
                        value={articleAuthor}
                        onChange={(e) => setArticleAuthor(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="article-image">URL de Imagen</Label>
                    <Input
                      id="article-image"
                      type="url"
                      placeholder="https://ejemplo.com/imagen.jpg"
                      value={articleImageUrl}
                      onChange={(e) => setArticleImageUrl(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? "Publicando..." : "Publicar Artículo"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="editorial">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5" />
                  Nueva Editorial del Director
                </CardTitle>
                <CardDescription>
                  Publica editoriales cada lunes para mantener informada a la audiencia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEditorialSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="editorial-title">Título</Label>
                    <Input
                      id="editorial-title"
                      placeholder="Título de la editorial"
                      value={editorialTitle}
                      onChange={(e) => setEditorialTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editorial-content">Contenido</Label>
                    <Textarea
                      id="editorial-content"
                      placeholder="Escribe tu editorial aquí... Puedes usar párrafos separados por líneas en blanco."
                      value={editorialContent}
                      onChange={(e) => setEditorialContent(e.target.value)}
                      required
                      className="min-h-[400px]"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="editorial-publish"
                      checked={editorialPublished}
                      onCheckedChange={setEditorialPublished}
                    />
                    <Label htmlFor="editorial-publish">
                      Publicar inmediatamente (si no, guardar como borrador)
                    </Label>
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? "Guardando..." : editorialPublished ? "Publicar Editorial" : "Guardar Borrador"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
