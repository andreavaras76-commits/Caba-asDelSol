# Cabañas del Sol — Tafí del Valle

Sitio web (catálogo + consultas por WhatsApp) y panel de administración del complejo **Cabañas del Sol**, Tafí del Valle, Tucumán.

- **Sitio público:** cabañas, promociones, eventos, galería, clima en vivo, ubicación y preguntas frecuentes. Cada consulta se guarda en la base y abre WhatsApp con un mensaje prearmado. No hay reservas ni pagos online.
- **Panel (`/admin`):** una única cuenta de administración con acceso a todo: dashboard, consultas, cabañas, promociones, fechas bloqueadas, galería, contenidos, clientes, envío de promos por WhatsApp y configuración general.

```
/client   React + Vite + Tailwind + Framer Motion + Zustand + RHF/Zod
/server   Node + Express (CommonJS) + MongoDB/Mongoose + JWT (cookie httpOnly) + Cloudinary
```

---

## 1. Requisitos

- Node.js 18 o superior
- Una base en **MongoDB Atlas**
- Una cuenta de **Cloudinary**

## 2. Instalación local

```bash
npm run install:all       # instala raíz, server y client
cp server/.env.example server/.env   # completar (ver sección 3)
cp client/.env.example client/.env
npm run seed              # datos iniciales (cuenta de administración, configuración, servicios…)
npm run dev               # levanta API (:4000) y sitio (:5173) juntos
```

Sitio: http://localhost:5173 · Panel: http://localhost:5173/admin

En desarrollo, Vite redirige `/api` y `/sitemap.xml` al backend local (`localhost:4000`). Por eso el front y la API comparten el mismo origen, igual que en producción.

El seed es **idempotente**: no pisa datos existentes y cada colección se carga solo si está vacía. Las 3 cabañas que crea son **de ejemplo** y hay que reemplazarlas desde el panel.

## 3. Variables de entorno

### `server/.env`

| Variable | Descripción |
|---|---|
| `NODE_ENV` | `development` en local, `production` en Vercel (activa la cookie `Secure`) |
| `PORT` | Puerto local (4000) |
| `MONGODB_URI` | Cadena de conexión de Atlas, con el nombre de la base (`/cabanas-del-sol`) |
| `JWT_SECRET` | Secreto largo y aleatorio. Para generarlo: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Duración de la sesión (`7d`) |
| `CORS_ORIGINS` | Orígenes permitidos separados por coma (en producción, **el dominio del sitio**) |
| `SITE_URL` | URL pública del sitio (para el sitemap) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Credenciales de Cloudinary |
| `CLOUDINARY_FOLDER` | Carpeta raíz de las imágenes (`cabanas-del-sol`) |
| `SEED_ADMIN_NAME` / `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD` | Cuenta única de administración que crea el seed (sólo si no existe ninguna). El usuario no distingue mayúsculas y acepta ñ |

### `client/.env`

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | Dejarla en `/api` (ver la sección 5: la API pasa por el mismo dominio) |
| `VITE_SITE_URL` | URL pública del sitio, sin barra final (Open Graph, canonical) |

> Los `.env` están en `.gitignore`. **Nunca los subas al repositorio.**

## 4. Deploy en Vercel

Se crean **dos proyectos de Vercel** desde el mismo repositorio.

### 4.1 Backend (`/server`)

1. En Vercel: **New Project** → importar el repo → **Root Directory: `server`**.
2. En **Environment Variables**, cargar todas las variables de `server/.env` con estos valores:
   - `NODE_ENV=production`
   - `CORS_ORIGINS=https://delsoltafidelvalle.com.ar` (y el dominio `*.vercel.app` del front si lo vas a usar)
   - `SITE_URL=https://delsoltafidelvalle.com.ar`
3. Hacer el deploy. `server/vercel.json` expone Express como función serverless y la conexión a Mongo se reutiliza entre invocaciones.
4. Verificar que `https://TU-BACKEND.vercel.app/api/health` responda `{ ok: true }`.
5. **MongoDB Atlas → Network Access:** permitir `0.0.0.0/0`, porque Vercel no usa IPs fijas.

### 4.2 Frontend (`/client`)

1. En **`client/vercel.json`**, reemplazar las **dos** apariciones de `https://TU-BACKEND.vercel.app` por la URL real del backend.
2. En Vercel: **New Project** → mismo repo → **Root Directory: `client`** (Framework: Vite).
3. Variables: `VITE_API_URL=/api` y `VITE_SITE_URL=https://delsoltafidelvalle.com.ar`.
4. Hacer el deploy y después conectar el dominio `delsoltafidelvalle.com.ar` en **Settings → Domains**.

### 4.3 Primera carga en producción

Si la base de producción es nueva, correr el seed una vez desde tu computadora con el `.env` apuntando a esa base:

```bash
cd server && npm run seed
```

Después, desde el panel:
- Cargar las cabañas reales con sus fotos.
- Subir las fotos del hero (verano e invierno).
- Revisar los datos en **Configuración**.
- **Cambiar la contraseña** desde **Mi cuenta**.

## 5. Seguridad (por qué está armado así)

- **Sesión:** se guarda en una cookie `httpOnly` + `SameSite=Strict`. El token **nunca** pasa por JavaScript, así que no se puede leer ni modificar desde la consola del navegador.
- **Mismo dominio:** como la cookie es estricta, el front proxea `/api/*` al backend con un rewrite en `client/vercel.json`. Para el navegador todo es el mismo dominio, sin depender de cookies de terceros.
- **Anti-CSRF:** toda escritura con cookie exige el header `X-Requested-With`, que un formulario de otro sitio no puede mandar.
- **Permisos:** se validan **siempre en el backend** (express-validator + sesión). Cambiar algo en el navegador no da acceso a nada.
- **Datos que entran:**
  - Se aceptan solo los campos validados.
  - Los query strings son planos, así que no pasan operadores de Mongo.
  - Hay límite de intentos en el login y en las consultas públicas.
- **Contraseña:** al cambiarla, se invalidan las sesiones anteriores.
- **En producción:**
  - React DevTools está desactivado.
  - La consola está silenciada.
  - El build no incluye `console` ni `debugger`.
  - No hay source maps.
  - Hay CSP y cabeceras de seguridad.
- **SweetAlert2:** los textos dinámicos se muestran siempre como texto plano (`titleText`), para evitar XSS.

## 6. SEO y rendimiento

- Meta tags y Open Graph estáticos en `index.html`, porque WhatsApp, Instagram y Facebook no ejecutan JS. Además, meta tags dinámicos por página con Helmet.
- Imagen para compartir: `client/public/og-default.jpg` (1200×630). Desde **Configuración → SEO** se puede subir otra.
- `robots.txt` (excluye `/admin`) y `sitemap.xml` dinámico con las cabañas activas.
- Datos estructurados `LodgingBusiness` (Schema.org).
- Imágenes de Cloudinary con `f_auto,q_auto`, `srcset` y carga diferida.
- Fuentes alojadas en el propio sitio.
- Code splitting por ruta.
- "Shell" del hero en `index.html`: el título se pinta apenas llega el HTML, y React lo reemplaza sin que se note. **Si cambiás el layout del hero, actualizá también ese bloque.**
- Mapas de Google con carga diferida: el iframe pesa ~500 KB y se carga recién al verlo.

## 7. Scripts

| Dónde | Comando | Qué hace |
|---|---|---|
| server | `npm run dev` | API con recarga automática |
| server | `npm start` | API en modo normal |
| server | `npm run seed` | Datos iniciales (idempotente) |
| client | `npm run dev` | Sitio en desarrollo |
| client | `npm run build` | Build de producción en `dist/` |
| client | `npm run preview` | Sirve el build localmente (con el mismo proxy `/api`) |

## 8. Pendientes conocidos

- **Fotos reales:** mientras no se suban, el sitio muestra ilustraciones propias. Las cabañas del seed son de ejemplo.
- **Vista previa por cabaña en WhatsApp:** hoy todas las páginas comparten la misma imagen al compartir el link. Para tener una por cabaña hace falta prerender o SSR.
- **Límite de intentos:** usa memoria por instancia serverless. Para un límite estricto, usar un store externo (por ejemplo, Upstash Redis).
# Caba-asDelSol
