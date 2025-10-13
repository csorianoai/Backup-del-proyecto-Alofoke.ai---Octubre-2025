# Configuración del Sistema Alofoke.ai

## ✅ Sistema Configurado

El sistema está completamente configurado con:

- **Base de datos Lovable Cloud** ✓
- **Autenticación habilitada** (auto-confirm email) ✓
- **Colores de bandera dominicana** en nadakki.com ✓
- **Sistema de artículos** desde base de datos ✓
- **Sección editorial del director** ✓
- **Panel de administración** ✓

## 📋 Crear Usuario Administrador

Para acceder al panel de administración, necesitas crear un usuario administrador. Sigue estos pasos:

### Paso 1: Ir al Backend de Lovable Cloud

1. Haz clic en el botón "View Backend" que aparecerá abajo
2. Navega a la sección "SQL Editor"

### Paso 2: Ejecutar SQL para crear Admin

Ejecuta este script SQL (reemplaza el email y contraseña):

```sql
-- 1. Primero, regístrate normalmente en /auth con tu email
-- 2. Luego ejecuta este SQL para hacerte admin (usa tu email real):

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'TU_EMAIL_AQUI@ejemplo.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

### Paso 3: Acceder al Panel

1. Ve a `/auth` para iniciar sesión
2. Usa el email y contraseña que creaste
3. Serás redirigido a `/admin`

## 🎯 Funcionalidades

### Panel de Administración (`/admin`)

**Pestaña "Nuevo Artículo":**
- **Crear artículos completos**: Noticias, análisis, tutoriales, casos de uso
- **Título y Slug**: Define URL amigable para cada artículo
- **Extracto**: Resumen breve que aparece en las tarjetas
- **Contenido completo**: Texto largo para lectura completa (separa párrafos con líneas en blanco)
- **Categoría**: noticias, analisis, casos_de_uso, tutoriales
- **Imagen URL**: Link de imagen destacada
- **Tiempo de lectura y autor**: Personaliza metadatos

**Pestaña "Nueva Editorial":**
- **Crear editoriales del director**: Publica cada lunes
- **Guardar borradores**: No publiques inmediatamente
- **Toggle de publicación**: Publica o guarda como borrador

### Página Principal (`/`)

- **Artículos clickeables**: Clic en cualquier artículo para leer contenido completo
- **Grid de 6 artículos**: Los más recientes de la base de datos
- **Editorial del director**: Muestra la última editorial publicada
- **Banner nadakki.com**: Con colores de bandera dominicana
- **Botón actualizar**: Recarga artículos manualmente

### Página de Artículo Individual (`/articulo/:slug`)

- **Contenido completo**: Muestra todo el texto del artículo
- **Imagen destacada grande**: Header visual de 400px
- **Metadatos**: Categoría, fecha, tiempo de lectura, autor
- **Navegación**: Botón para volver al inicio

### Sistema de Publicación Programado

**📅 Calendario de Publicaciones:**

- **Lunes, Miércoles, Viernes**: 
  - 6 artículos a las 6:00 AM
  - 6 artículos a las 6:00 PM
  - Total: 12 artículos por día

- **Martes y Jueves**:
  - 6 artículos (una sola vez al día)

- **Sábado**:
  - 8 artículos (una sola vez al día)

- **Domingo**:
  - 8 artículos (una sola vez al día)

**Actualización manual disponible:**
- Botón "Actualizar" en la página principal
- Recarga artículos desde base de datos
- Muestra fecha y hora de última actualización

**Cómo crear tus propios artículos:**
1. Inicia sesión en `/auth` con tu cuenta de administrador
2. Ve a `/admin` (Panel de Administración)
3. Selecciona la pestaña "Nuevo Artículo"
4. Completa todos los campos del formulario:
   - **Título**: Llamativo y descriptivo
   - **Slug**: URL amigable (ej: "ia-en-latinoamerica-2025")
   - **Extracto**: Resumen de 150-200 caracteres
   - **Contenido**: Artículo completo (800-1500 palabras recomendadas)
   - **Categoría**: Selecciona entre noticias, análisis, casos_de_uso, tutoriales
   - **Imagen**: URL de imagen destacada (1200x630px recomendado)
   - **Tiempo de lectura**: Estimado (ej: "5 min", "10 min")
   - **Autor**: Tu nombre o "Equipo Alofoke.ai"
5. Haz clic en "Publicar Artículo"

**Para automatización futura (opcional):**
- Crear Edge Function que obtenga noticias de APIs externas
- Configurar Cron Jobs para ejecución programada
- La función insertará automáticamente nuevos artículos según el calendario

## 🎨 Colores de la Bandera Dominicana

El banner de nadakki.com usa:
- **Azul**: `#002D62` (Azul oscuro de la bandera)
- **Rojo**: `#CE1126` (Rojo de la bandera)
- **Blanco**: Para contraste

## 📊 Estructura de Base de Datos

### Tabla `articles`
- `id`, `title`, `slug`, `excerpt`, `content`
- `category` (noticias, analisis, casos_de_uso, editorial)
- `image_url`, `read_time`, `author`
- `published_at`, `is_featured`

### Tabla `director_editorials`
- `id`, `title`, `content`, `author`
- `published_at`, `is_published`

### Tabla `user_roles`
- `user_id`, `role` (admin, editor, user)

## 🔒 Seguridad

- **RLS habilitado** en todas las tablas
- **Solo admins** pueden crear/editar editoriales
- **Lectura pública** para artículos y editoriales publicadas
- **Políticas de seguridad** implementadas

## 📝 Próximos Pasos Recomendados

1. **Crear tu usuario admin** (ver instrucciones arriba)
2. **Publicar tu primer artículo** en `/admin` > Nuevo Artículo
3. **Publicar tu primera editorial** en `/admin` > Nueva Editorial
4. **Probar la navegación**: Haz clic en artículos para ver contenido completo
5. **Crear más contenido**: Sigue el calendario de publicaciones sugerido
6. **Opcional**: Configurar automatización con Edge Functions y Cron Jobs

## 🚀 URLs Importantes

- Página principal: `/`
- Login: `/auth`
- Panel admin: `/admin`
- Backend: Usa el botón "View Backend" abajo
