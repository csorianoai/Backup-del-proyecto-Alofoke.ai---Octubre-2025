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

- **Crear editoriales**: Publica cada lunes
- **Guardar borradores**: No publiques inmediatamente
- **Toggle de publicación**: Publica o guarda como borrador

### Página Principal (`/`)

- **Artículos automáticos**: Cargados desde base de datos
- **Editorial del director**: Muestra la última editorial publicada
- **Banner nadakki.com**: Con colores de bandera dominicana
- **Botón actualizar**: Recarga artículos manualmente

### Sistema de Actualización

**Actualización manual disponible:**
- Botón "Actualizar" en la página principal
- Recarga artículos desde base de datos
- Muestra fecha y hora de última actualización

**Para actualización automática (2 veces al día a las 6 AM y 6 PM):**
1. Necesitas crear una Edge Function que obtenga noticias de APIs externas
2. Configurar un Cron Job en Lovable Cloud
3. La función insertará automáticamente nuevos artículos

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

1. **Crear tu usuario admin** (ver Paso 2 arriba)
2. **Publicar tu primera editorial** en `/admin`
3. **Agregar más artículos** a la base de datos
4. **Configurar automatización** con Edge Functions y Cron Jobs

## 🚀 URLs Importantes

- Página principal: `/`
- Login: `/auth`
- Panel admin: `/admin`
- Backend: Usa el botón "View Backend" abajo
