from datetime import datetime, timezone
from fastapi import APIRouter
from app.models.schemas import DashboardSummary, PipelineItem, ProductionPhase, Task

router = APIRouter(prefix="/production", tags=["production"])

PIPELINE: list[PipelineItem] = [
    PipelineItem(
        phase=ProductionPhase.SCRIPTING,
        status="completed",
        progress_pct=100,
        tasks=[
            Task(id="t1", project_id="proj-1", title="Borrador de guion", status="done", assignee="Ana", created_at=datetime(2026, 3, 1, tzinfo=timezone.utc)),
            Task(id="t2", project_id="proj-1", title="Revisión de guion", status="done", assignee="Carlos", created_at=datetime(2026, 3, 5, tzinfo=timezone.utc)),
        ],
        deliverables=["Guion final v3.pdf"],
    ),
    PipelineItem(
        phase=ProductionPhase.SHOOTING,
        status="completed",
        progress_pct=100,
        tasks=[
            Task(id="t3", project_id="proj-1", title="Rodaje día 1", status="done", assignee="Equipo A", created_at=datetime(2026, 4, 10, tzinfo=timezone.utc)),
            Task(id="t4", project_id="proj-1", title="Rodaje día 2", status="done", assignee="Equipo A", created_at=datetime(2026, 4, 11, tzinfo=timezone.utc)),
        ],
        deliverables=["Footage RAW (120GB)"],
    ),
    PipelineItem(
        phase=ProductionPhase.EDITING,
        status="active",
        progress_pct=65,
        tasks=[
            Task(id="t5", project_id="proj-1", title="Montaje rough cut", status="done", assignee="Luis", created_at=datetime(2026, 4, 20, tzinfo=timezone.utc)),
            Task(id="t6", project_id="proj-1", title="Corrección de color", status="in_progress", assignee="Luis", created_at=datetime(2026, 5, 5, tzinfo=timezone.utc)),
            Task(id="t7", project_id="proj-1", title="Mezcla de audio", status="todo", assignee="María", created_at=datetime(2026, 5, 10, tzinfo=timezone.utc)),
        ],
        deliverables=["Rough cut v2.mp4"],
    ),
    PipelineItem(
        phase=ProductionPhase.PROMOTION,
        status="pending",
        progress_pct=0,
        tasks=[
            Task(id="t8", project_id="proj-1", title="Diseño de poster", status="todo", assignee="Diseño", created_at=datetime(2026, 5, 15, tzinfo=timezone.utc)),
            Task(id="t9", project_id="proj-1", title="Trailer 60s", status="todo", assignee="Luis", created_at=datetime(2026, 5, 16, tzinfo=timezone.utc)),
        ],
        deliverables=[],
    ),
    PipelineItem(
        phase=ProductionPhase.PUBLISHING,
        status="pending",
        progress_pct=0,
        tasks=[
            Task(id="t10", project_id="proj-1", title="Subida a Vimeo / YouTube", status="todo", assignee="Admin", created_at=datetime(2026, 5, 18, tzinfo=timezone.utc)),
            Task(id="t11", project_id="proj-1", title="Programar redes sociales", status="todo", assignee="Marketing", created_at=datetime(2026, 5, 18, tzinfo=timezone.utc)),
        ],
        deliverables=[],
    ),
]


@router.get("/pipeline", response_model=list[PipelineItem])
def get_pipeline() -> list[PipelineItem]:
    return PIPELINE


@router.get("/dashboard", response_model=DashboardSummary)
def get_dashboard() -> DashboardSummary:
    return DashboardSummary(
        total_projects=4,
        active_projects=3,
        completed_this_month=1,
        total_assets=106,
        pipeline=PIPELINE,
        upcoming_deadlines=[],
    )
