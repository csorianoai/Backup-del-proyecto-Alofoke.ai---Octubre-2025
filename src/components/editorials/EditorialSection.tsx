import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Editorial {
  id: string;
  title: string;
  content: string;
  author: string;
  published_at: string;
}

const EditorialSection = () => {
  const [editorial, setEditorial] = useState<Editorial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLatestEditorial();
  }, []);

  const loadLatestEditorial = async () => {
    try {
      const { data, error } = await supabase
        .from('director_editorials')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setEditorial(data);
    } catch (error) {
      console.error('Error loading editorial:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-8">
        <Card className="animate-pulse">
          <CardHeader className="h-24 bg-muted" />
          <CardContent className="h-48 bg-muted/50" />
        </Card>
      </div>
    );
  }

  if (!editorial) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="py-8">
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-secondary text-secondary-foreground">
              Editorial del Director
            </Badge>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{editorial.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(editorial.published_at)}</span>
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foreground">{editorial.title}</h2>
        </CardHeader>
        <CardContent>
          <div className="prose prose-lg max-w-none text-foreground/90">
            {editorial.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditorialSection;
