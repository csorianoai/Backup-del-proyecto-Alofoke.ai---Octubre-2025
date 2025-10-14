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
    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!PERPLEXITY_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log('Generating AI news article with Perplexity AI...');

    // Generar contenido con Perplexity AI
    const aiResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: `Eres un periodista experto en inteligencia artificial para Alofoke.ai, un portal de noticias tech en español para Latinoamérica. 

IMPORTANTE: Tu respuesta debe ser SOLO un objeto JSON válido, sin texto adicional antes o después.

Genera un artículo de noticia sobre IA actual con esta estructura JSON:
{
  "title": "Título llamativo de 50-60 caracteres",
  "excerpt": "Resumen de 150-160 caracteres",
  "content": "Contenido completo del artículo en HTML (800-1500 palabras, usa <h2>, <p>, <ul>, <li>)",
  "category": "noticias"
}

El artículo debe:
- Ser sobre noticias recientes y actuales de IA (últimas 24-48 horas)
- Ser relevante para profesionales tech latinoamericanos
- Incluir datos concretos y ejemplos prácticos
- Usar lenguaje accesible pero profesional
- Tener formato HTML bien estructurado
- Incluir fuentes cuando sea apropiado

Responde ÚNICAMENTE con el JSON, sin explicaciones adicionales.`
          },
          {
            role: 'user',
            content: 'Genera un artículo sobre las últimas noticias de IA relevantes para Latinoamérica.'
          }
        ],
        temperature: 0.2,
        max_tokens: 2000
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');

    // Perplexity retorna el contenido directamente
    const content = aiData.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Extraer JSON del contenido
    let articleData;
    try {
      // Intentar parsear directamente
      articleData = JSON.parse(content);
    } catch (e) {
      // Si falla, intentar extraer JSON de markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        articleData = JSON.parse(jsonMatch[1]);
      } else {
        // Último intento: buscar cualquier objeto JSON en el texto
        const objectMatch = content.match(/\{[\s\S]*\}/);
        if (objectMatch) {
          articleData = JSON.parse(objectMatch[0]);
        } else {
          throw new Error('Could not extract JSON from AI response');
        }
      }
    }
    
    console.log('Article data parsed:', articleData.title);

    // Generar slug único - solo el título sin URLs
    const cleanTitle = articleData.title
      .replace(/https?:\/\/[^\s]+/g, '') // Remover cualquier URL del título
      .trim();
    
    const slug = cleanTitle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) // Limitar longitud del slug
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

  } catch (err) {
    console.error('Error in generate-news-article:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    const details = err instanceof Error ? err.stack : String(err);
    return new Response(
      JSON.stringify({ 
        error: message,
        details
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
