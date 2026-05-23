# Studio Production Pipeline

Gestor visual de producción de contenido para estudios (Cinefactory, 100 Sutton, Cinexin).

## Arquitectura

- **Backend:** FastAPI (Python 3.12) — `localhost:8001`
- **Frontend:** Next.js 16 + React 19 + Tailwind CSS v4 — `localhost:3001`
- **Orchestración:** Docker Compose

## Features

- Kanban board de proyectos por estado (Idea → Publicado)
- Timeline visual de fases de producción (Guion → Rodaje → Edición → Promoción → Publicación)
- Biblioteca de assets con filtros por tipo
- Dashboard con métricas de proyectos, tareas y assets
- Chatbot asistente de producción

## Setup

```bash
cd "Documents/New project/studio-production-pipeline"
docker compose up --build
```

O manualmente:

```bash
# Backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8001

# Frontend
cd frontend
npm install
npm run dev
```

## Variables de entorno

Copia `backend/.env.example` a `backend/.env` y ajusta:

- `DATABASE_URL` — SQLite para desarrollo local, PostgreSQL para Docker
- `CORS_ORIGINS` — URLs del frontend permitidas
- `API_PREFIX` — Prefijo de rutas API (default: `/api`)

## Migraciones de base de datos (Alembic)

Las migraciones gestionan el esquema de la base de datos de forma versionada.

```bash
cd backend

# Generar una nueva migración tras cambiar los modelos
alembic revision --autogenerate -m "descripción del cambio"

# Aplicar migraciones pendientes
alembic upgrade head

# Revertir la última migración
alembic downgrade -1

# Ver estado actual
alembic current
```

En Docker Compose, las migraciones se ejecutan automáticamente al iniciar el backend.

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/projects` | Listar proyectos (filtros: status, studio, q) |
| GET | `/api/projects/{id}` | Detalle de proyecto |
| POST | `/api/projects` | Crear proyecto |
| GET | `/api/production/pipeline` | Pipeline de fases |
| GET | `/api/production/dashboard` | Resumen del dashboard |
| GET | `/api/assets` | Listar assets |
| GET | `/api/assets/types` | Tipos de asset |
| POST | `/api/chat` | Chat con asistente |
| POST | `/api/publish/youtube` | Subir video a YouTube |
| POST | `/api/publish/vimeo` | Subir video a Vimeo |
| GET | `/api/publish/jobs` | Estado de publicaciones |
| GET | `/api/publish/status` | Plataformas conectadas |
| GET | `/health` | Healthcheck |

## Publicación automática (YouTube / Vimeo)

### YouTube
1. Crea un proyecto en [Google Cloud Console](https://console.cloud.google.com/)
2. Habilita la **YouTube Data API v3**
3. Descarga el `client_secret.json` de tipo **Desktop app**
4. Copia el archivo a `backend/client_secret.json`
5. Obtén un `refresh_token` ejecutando `python -m scripts.auth_youtube` (o genera uno manualmente con OAuth 2.0)
6. Guarda el `refresh_token` en `backend/.env` como `YOUTUBE_REFRESH_TOKEN`

### Vimeo
1. Genera un **Access Token** con permisos `upload`, `edit`, `delete` en [Vimeo Developer](https://developer.vimeo.com/)
2. Guarda el token en `backend/.env` como `VIMEO_ACCESS_TOKEN`

### Volúmenes de video
El `docker-compose.yml` monta `./videos` en el backend. Coloca tus archivos de video en esa carpeta antes de publicar, o usa una ruta accesible desde el contenedor.
