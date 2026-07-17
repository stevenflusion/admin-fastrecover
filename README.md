# SH Fast Recover | Admin Panel

Panel de administración interno para SH Fast Recover. Gestión de leads, analytics y administración de usuarios.

## Stack Tecnológico

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Runtime**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Auth**: JWT + httpOnly cookies
- **Container**: Docker + Docker Compose

## Requisitos Previos

- Node.js >= 20.0.0
- npm >= 10.0.0
- Docker (opcional, para despliegue con containers)

## Instalación Local

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Copiar variables de entorno:
   ```bash
   cp .env.local.example .env.local
   ```
4. Editar `.env.local` con los valores reales (ver sección Variables de Entorno)
5. Iniciar servidor de desarrollo:
   ```bash
   npm run dev
   ```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

## Variables de Entorno

Crear un archivo `.env.local` en la raíz del proyecto:

```env
# Client-exposed (seguras para el navegador)
NEXT_PUBLIC_API_URL=https://sh-api.happyground-63307e62.eastus.azurecontainerapps.io/api

# Server-only (NUNCA expuestas al cliente)
API_KEY=tu-api-key-secreta
API_URL=https://sh-api.happyground-63307e62.eastus.azurecontainerapps.io/api
```

> ⚠️ **IMPORTANTE**: Nunca uses el prefijo `NEXT_PUBLIC_` para claves API, tokens, passwords o cualquier secreto. Las variables con `NEXT_PUBLIC_` se incluyen en el bundle JavaScript del cliente y cualquier usuario puede leerlas inspeccionando el código.

## Despliegue con Docker

### Build y run local

```bash
npm run docker:build
npm run docker:up
```

### Manual

```bash
docker build -t fastrecover-admin .
docker run -p 3000:3000 --env-file .env.local fastrecover-admin
```

### Docker Compose

```bash
docker-compose up -d
```

## Seguridad

### Arquitectura de Proxy

Todas las peticiones del cliente al backend pasan por `/api/proxy/*`. Esto garantiza que:

1. La `API_KEY` real **nunca** llega al navegador
2. Cada petición proxy valida el cookie `auth-token` antes de reenviar
3. El backend recibe la API key desde el servidor, no desde el cliente

### Headers de Seguridad

La aplicación envía los siguientes headers en todas las respuestas:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security` (HSTS)
- `Content-Security-Policy`
- `Permissions-Policy`

### Autenticación

- JWT almacenado en cookie `httpOnly` (no accesible desde JavaScript)
- Cookie `secure` en producción (solo HTTPS)
- Cookie `sameSite: lax`
- Middleware de Next.js protege todas las rutas `/dashboard/*`

## Despliegue en VPS (Hostinger)

El deploy usa GitHub Actions + self-hosted runner + Docker Compose + Traefik.

### Dominio

`https://admin.shfastrecover.com`

### Requisitos previos en la VPS

1. **Crear la carpeta del proyecto:**
   ```bash
   ssh -i ~/.ssh/docker-steven docker-steven@2a02:4780:75:1d76::1
   mkdir -p /home/docker-steven/fastrecover-admin
   cd /home/docker-steven/fastrecover-admin
   ```

2. **Crear el archivo `.env`** (valores reales, nunca versionados):
   ```bash
   nano .env
   ```
   ```env
   API_KEY=tu-api-key-secreta
   API_URL=https://sh-api.happyground-63307e62.eastus.azurecontainerapps.io/api
   NEXT_PUBLIC_API_URL=https://sh-api.happyground-63307e62.eastus.azurecontainerapps.io/api
   ```

3. **Configurar el self-hosted runner** de GitHub Actions en la VPS (una sola vez):
   Seguir [la guía oficial](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/adding-self-hosted-runners) para registrar el runner en este repositorio.

4. **Crear el registro DNS** `admin.shfastrecover.com` apuntando a la IP de la VPS.

### Flujo de deploy automático

```
1. Push a main en GitHub
   ↓
2. GitHub Actions activa el workflow deploy.yml
   ↓
3. Self-hosted runner en la VPS recibe el job
   ↓
4. Valida .env (env.required vs .env actual)
   ↓
5. git pull origin main
   ↓
6. docker compose -f docker-compose.prod.yml up -d --build
   ↓
7. Espera container healthy + HTTP responding
   ↓
8. Deploy exitoso ✅
```

### Rebuild manual (si GitHub Actions falla)

```bash
ssh -i ~/.ssh/docker-steven docker-steven@2a02:4780:75:1d76::1
cd /home/docker-steven/fastrecover-admin
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
```

### Verificar estado

```bash
# Contenedores
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'

# Logs
docker logs --tail 50 fastrecover-admin

# Health check manual
docker exec fastrecover-admin wget -qO- http://localhost:3000/
```

## CI/CD

El workflow `.github/workflows/deploy.yml` corre en un **self-hosted runner** en la VPS:

1. Valida `.env` contra `env.required`
2. Hace `git pull` descartando cambios locales
3. Build con Docker Compose (`docker-compose.prod.yml`)
4. Espera a que el container esté `healthy` (Docker healthcheck)
5. Confirma que HTTP responde dentro del container

> **Nota:** El build ocurre en la VPS, no en GitHub. Esto evita tener que pushiar imágenes a un registry y permite que Traefik (ya levantado por Coolify) enrute el tráfico automáticamente.

## Estructura del Proyecto

```
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD — self-hosted runner en VPS
├── scripts/
│   ├── check-env.sh            # Valida .env vs env.required
│   └── wait-healthy.sh         # Espera healthy + HTTP response
├── docker-compose.prod.yml     # Compose con labels de Traefik
├── docker-compose.yml          # Compose local (desarrollo)
├── env.required                # Variables obligatorias (versionado)
├── Dockerfile                  # Multi-stage build
├── .env.local.example          # Ejemplo de variables (seguras)
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── actions/            # Server Actions (login, logout)
│   │   ├── api/                # API Routes (proxy, health)
│   │   ├── dashboard/          # Rutas protegidas del panel
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Login page
│   │   └── globals.css         # Tailwind + tema
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   └── leads/              # Leads management
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities, API client, types
│   │   ├── api-client.ts       # Fetch wrapper con proxy
│   │   ├── auth.ts             # JWT decoding
│   │   ├── types.ts            # TypeScript types
│   │   └── ...
│   └── middleware.ts           # Route protection
└── next.config.ts              # Config de producción + headers
```

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo local |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | ESLint |
| `npm run docker:build` | Build imagen Docker |
| `npm run docker:up` | Levantar con Docker Compose |
| `npm run docker:down` | Detener Docker Compose |

## Notas de Versión

### v1.0.0

- Preparación para producción
- Proxy API (`/api/proxy`) para ocultar API key del cliente
- Headers de seguridad HTTP (CSP, HSTS, X-Frame-Options, etc.)
- Dockerfile multi-stage con non-root user
- Docker Compose con Traefik labels para `admin.shfastrecover.com`
- GitHub Actions CI/CD con self-hosted runner
- Scripts de deploy (`check-env.sh`, `wait-healthy.sh`)
- Health check endpoint (`/api/health`)
- Configuración de deploy con Docker Compose

## Licencia

Proyecto privado - SH Fast Recover.
