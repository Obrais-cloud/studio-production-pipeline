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

- `CORS_ORIGINS` — URLs del frontend permitidas
- `API_PREFIX` — Prefijo de rutas API (default: `/api`)

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
| GET | `/health` | Healthcheck |
