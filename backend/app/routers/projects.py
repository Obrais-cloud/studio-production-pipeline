from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import Project, ProjectCreate, ProjectStatus

router = APIRouter(prefix="/projects", tags=["projects"])

PROJECTS: list[Project] = [
    Project(
        id="proj-1",
        title="Cortometraje Verano 2026",
        studio="Cinefactory",
        description="Producción de cortometraje independiente para festival de cine.",
        status=ProjectStatus.PRODUCTION,
        budget=15000.0,
        deadline=datetime(2026, 7, 15, tzinfo=timezone.utc),
        created_at=datetime(2026, 3, 1, tzinfo=timezone.utc),
        updated_at=datetime(2026, 5, 10, tzinfo=timezone.utc),
        tasks_completed=8,
        tasks_total=12,
        assets_count=24,
    ),
    Project(
        id="proj-2",
        title="Serie YouTube: Historias Perdidas",
        studio="100 Sutton",
        description="Serie documental de 6 episodios sobre historia local.",
        status=ProjectStatus.POST_PRODUCTION,
        budget=8000.0,
        deadline=datetime(2026, 6, 30, tzinfo=timezone.utc),
        created_at=datetime(2026, 2, 10, tzinfo=timezone.utc),
        updated_at=datetime(2026, 5, 18, tzinfo=timezone.utc),
        tasks_completed=18,
        tasks_total=20,
        assets_count=67,
    ),
    Project(
        id="proj-3",
        title="Spot Publicitario Cinexin",
        studio="Cinexin",
        description="Spot de 30 segundos para campaña de verano del cine.",
        status=ProjectStatus.REVIEW,
        budget=5000.0,
        deadline=datetime(2026, 5, 28, tzinfo=timezone.utc),
        created_at=datetime(2026, 4, 5, tzinfo=timezone.utc),
        updated_at=datetime(2026, 5, 20, tzinfo=timezone.utc),
        tasks_completed=10,
        tasks_total=10,
        assets_count=15,
    ),
    Project(
        id="proj-4",
        title="Podcast: La Butaca",
        studio="100 Sutton",
        description="Podcast semanal de crítica cinematográfica.",
        status=ProjectStatus.IDEA,
        budget=2000.0,
        deadline=datetime(2026, 8, 1, tzinfo=timezone.utc),
        created_at=datetime(2026, 5, 15, tzinfo=timezone.utc),
        updated_at=datetime(2026, 5, 15, tzinfo=timezone.utc),
        tasks_completed=0,
        tasks_total=6,
        assets_count=0,
    ),
]


@router.get("", response_model=list[Project])
def list_projects(
    status: Optional[ProjectStatus] = Query(None),
    studio: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
) -> list[Project]:
    results = PROJECTS[:]
    if status:
        results = [p for p in results if p.status == status]
    if studio:
        results = [p for p in results if studio.lower() in p.studio.lower()]
    if q:
        results = [p for p in results if q.lower() in p.title.lower() or (p.description and q.lower() in p.description.lower())]
    return results


@router.get("/{project_id}", response_model=Project)
def get_project(project_id: str) -> Project:
    for p in PROJECTS:
        if p.id == project_id:
            return p
    raise HTTPException(status_code=404, detail="Project not found")


@router.post("", response_model=Project)
def create_project(payload: ProjectCreate) -> Project:
    project = Project(
        id=f"proj-{len(PROJECTS)+1}",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        tasks_completed=0,
        tasks_total=0,
        assets_count=0,
        **payload.model_dump(),
    )
    PROJECTS.append(project)
    return project
