-- Crear enum para categorías de artículos
CREATE TYPE public.article_category AS ENUM ('noticias', 'analisis', 'casos_de_uso', 'editorial');

-- Tabla de artículos
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category public.article_category NOT NULL DEFAULT 'noticias',
  image_url TEXT NOT NULL,
  read_time TEXT NOT NULL DEFAULT '5 min',
  author TEXT DEFAULT 'Equipo Alofoke.ai',
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de editoriales del director (publicadas los lunes)
CREATE TABLE public.director_editorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Director Editorial',
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crear enum para roles de usuario
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');

-- Tabla de roles de usuario
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.director_editorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Función de seguridad para verificar roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Políticas RLS para artículos (lectura pública, escritura solo admin/editor)
CREATE POLICY "Todos pueden leer artículos publicados"
ON public.articles FOR SELECT
USING (TRUE);

CREATE POLICY "Admins y editores pueden insertar artículos"
ON public.articles FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR 
  public.has_role(auth.uid(), 'editor'::public.app_role)
);

CREATE POLICY "Admins y editores pueden actualizar artículos"
ON public.articles FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR 
  public.has_role(auth.uid(), 'editor'::public.app_role)
);

CREATE POLICY "Admins pueden eliminar artículos"
ON public.articles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Políticas RLS para editoriales del director
CREATE POLICY "Todos pueden leer editoriales publicadas"
ON public.director_editorials FOR SELECT
USING (is_published = TRUE OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins pueden insertar editoriales"
ON public.director_editorials FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins pueden actualizar editoriales"
ON public.director_editorials FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins pueden eliminar editoriales"
ON public.director_editorials FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Políticas RLS para user_roles
CREATE POLICY "Usuarios pueden ver sus propios roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Solo admins pueden gestionar roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_articles_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_editorials_updated_at
BEFORE UPDATE ON public.director_editorials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insertar algunos artículos de ejemplo
INSERT INTO public.articles (title, slug, excerpt, content, category, image_url, read_time) VALUES
('GPT-5 revoluciona el procesamiento de lenguaje natural', 'gpt-5-revoluciona-pln', 'OpenAI anuncia avances significativos en comprensión contextual y razonamiento multimodal con su nuevo modelo de IA.', 'Contenido completo del artículo sobre GPT-5...', 'noticias', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80', '5 min'),
('IA generativa transforma la medicina diagnóstica', 'ia-medicina-diagnostica', 'Nuevos modelos de IA detectan enfermedades con 95% de precisión, superando diagnósticos tradicionales en hospitales latinoamericanos.', 'Contenido completo sobre IA en medicina...', 'analisis', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80', '7 min'),
('Agentes autónomos de IA en atención al cliente', 'agentes-autonomos-atencion-cliente', 'Empresas en México y Colombia implementan chatbots avanzados que resuelven 80% de consultas sin intervención humana.', 'Contenido sobre agentes de IA...', 'casos_de_uso', 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&q=80', '6 min');