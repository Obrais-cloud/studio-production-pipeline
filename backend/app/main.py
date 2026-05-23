from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import get_settings
from app.routers import projects, production, assets, chat, publish

settings = get_settings()

app = FastAPI(title=settings.app_name, version="1.0.0")

# CORS
origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(status_code=500, content={"detail": str(exc)})


app.include_router(projects.router, prefix=f"{settings.api_prefix}")
app.include_router(production.router, prefix=f"{settings.api_prefix}")
app.include_router(assets.router, prefix=f"{settings.api_prefix}")
app.include_router(chat.router, prefix=f"{settings.api_prefix}")
app.include_router(publish.router, prefix=f"{settings.api_prefix}")


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "app": settings.app_name}
