import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log('Generating AI news article...');

    // Generar contenido con Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Eres un periodista experto en inteligencia artificial para Alofoke.ai, un portal de noticias tech en español para Latinoamérica. 

Genera un artículo de noticia sobre IA con esta estructura JSON:
{
  "title": "Título llamativo de 50-60 caracteres",
  "excerpt": "Resumen de 150-160 caracteres",
  "content": "Contenido completo del artículo en HTML (800-1500 palabras, usa <h2>, <p>, <ul>, <li>)",
  "category": "uno de: noticias, analisis, tutoriales, casos_de_uso",
  "seo_keywords": ["keyword1", "keyword2", "keyword3"]
}

El artículo debe:
- Ser actual y relevante para profesionales tech latinoamericanos
- Incluir datos concretos y ejemplos prácticos
- Usar lenguaje accesible pero profesional
- Tener formato HTML bien estructurado
- Incluir fuentes y referencias cuando sea apropiado`
          },
          {
            role: 'user',
            content: 'Genera un artículo de noticia sobre un avance reciente en inteligencia artificial que sea relevante para la audiencia latinoamericana.'
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_article",
              description: "Crea un artículo de noticias sobre IA",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  excerpt: { type: "string" },
                  content: { type: "string" },
                  category: { 
                    type: "string",
                    enum: ["noticias", "analisis", "tutoriales", "casos_de_uso"]
                  },
                  seo_keywords: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["title", "excerpt", "content", "category", "seo_keywords"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_article" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const articleData = JSON.parse(toolCall.function.arguments);
    console.log('Article data parsed:', articleData.title);

    // Generar slug único
    const slug = articleData.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      + '-' + Date.now();

    // Guardar artículo en la base de datos
    const { data: newArticle, error: insertError } = await supabase
      .from('articles')
      .insert({
        title: articleData.title,
        slug: slug,
        excerpt: articleData.excerpt,
        content: articleData.content,
        category: articleData.category,
        author: 'Equipo Alofoke.ai',
        read_time: '5 min',
        image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=630&fit=crop',
        is_featured: false
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw insertError;
    }

    console.log('Article created successfully:', newArticle.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        article: newArticle,
        message: 'Artículo generado y publicado exitosamente'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-news-article:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
