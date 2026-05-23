from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models import Asset, PipelineItem, Project, PublishJob, TaskItem
from app.models.schemas import AssetType, ProjectStatus


def seed_database(db: Session) -> None:
    """Seed the database with initial data if tables are empty."""

    # Seed projects if empty
    if db.query(Project).first() is None:
        projects = [
            Project(
                id="proj-1",
                title="Cortometraje Verano 2026",
                studio="Cinefactory",
                description="Producción de cortometraje independiente para festival de cine.",
                status=ProjectStatus.PRODUCTION.value,
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
                status=ProjectStatus.POST_PRODUCTION.value,
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
                status=ProjectStatus.REVIEW.value,
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
                status=ProjectStatus.IDEA.value,
                budget=2000.0,
                deadline=datetime(2026, 8, 1, tzinfo=timezone.utc),
                created_at=datetime(2026, 5, 15, tzinfo=timezone.utc),
                updated_at=datetime(2026, 5, 15, tzinfo=timezone.utc),
                tasks_completed=0,
                tasks_total=6,
                assets_count=0,
            ),
        ]
        db.add_all(projects)
        db.commit()

    # Seed assets if empty
    if db.query(Asset).first() is None:
        assets = [
            Asset(id="a1", project_id="proj-1", name="Guion v3.pdf", type=AssetType.SCRIPT.value, url="/assets/guion-v3.pdf", size_bytes=245000, created_at=datetime(2026, 3, 10, tzinfo=timezone.utc), uploaded_by="Ana"),
            Asset(id="a2", project_id="proj-1", name="Storyboard escenas 1-5.png", type=AssetType.STORYBOARD.value, url="/assets/storyboard-1-5.png", size_bytes=3200000, created_at=datetime(2026, 3, 20, tzinfo=timezone.utc), uploaded_by="Carlos"),
            Asset(id="a3", project_id="proj-1", name="Footage día 1.zip", type=AssetType.FOOTAGE.value, url="/assets/footage-d1.zip", size_bytes=64424509440, created_at=datetime(2026, 4, 11, tzinfo=timezone.utc), uploaded_by="Equipo A"),
            Asset(id="a4", project_id="proj-1", name="Rough cut v2.mp4", type=AssetType.EXPORT.value, url="/assets/rough-cut-v2.mp4", size_bytes=2147483648, created_at=datetime(2026, 5, 8, tzinfo=timezone.utc), uploaded_by="Luis"),
            Asset(id="a5", project_id="proj-2", name="Ep1 - Audio master.wav", type=AssetType.AUDIO.value, url="/assets/ep1-audio.wav", size_bytes=1073741824, created_at=datetime(2026, 4, 25, tzinfo=timezone.utc), uploaded_by="María"),
            Asset(id="a6", project_id="proj-2", name="Ep1 - Thumbnail.jpg", type=AssetType.THUMBNAIL.value, url="/assets/ep1-thumb.jpg", size_bytes=450000, created_at=datetime(2026, 4, 26, tzinfo=timezone.utc), uploaded_by="Diseño"),
        ]
        db.add_all(assets)
        db.commit()

    # Seed pipeline items if empty
    if db.query(PipelineItem).first() is None:
        scripting = PipelineItem(
            id="pipe-1", phase="scripting", status="completed", progress_pct=100,
            deliverables=["Guion final v3.pdf"],
        )
        shooting = PipelineItem(
            id="pipe-2", phase="shooting", status="completed", progress_pct=100,
            deliverables=["Footage RAW (120GB)"],
        )
        editing = PipelineItem(
            id="pipe-3", phase="editing", status="active", progress_pct=65,
            deliverables=["Rough cut v2.mp4"],
        )
        promotion = PipelineItem(
            id="pipe-4", phase="promotion", status="pending", progress_pct=0,
            deliverables=[],
        )
        publishing = PipelineItem(
            id="pipe-5", phase="publishing", status="pending", progress_pct=0,
            deliverables=[],
        )
        db.add_all([scripting, shooting, editing, promotion, publishing])
        db.commit()

        # Seed tasks linked to pipeline items
        if db.query(TaskItem).first() is None:
            tasks = [
                TaskItem(id="t1", pipeline_id="pipe-1", project_id="proj-1", title="Borrador de guion", status="done", assignee="Ana", created_at=datetime(2026, 3, 1, tzinfo=timezone.utc)),
                TaskItem(id="t2", pipeline_id="pipe-1", project_id="proj-1", title="Revisión de guion", status="done", assignee="Carlos", created_at=datetime(2026, 3, 5, tzinfo=timezone.utc)),
                TaskItem(id="t3", pipeline_id="pipe-2", project_id="proj-1", title="Rodaje día 1", status="done", assignee="Equipo A", created_at=datetime(2026, 4, 10, tzinfo=timezone.utc)),
                TaskItem(id="t4", pipeline_id="pipe-2", project_id="proj-1", title="Rodaje día 2", status="done", assignee="Equipo A", created_at=datetime(2026, 4, 11, tzinfo=timezone.utc)),
                TaskItem(id="t5", pipeline_id="pipe-3", project_id="proj-1", title="Montaje rough cut", status="done", assignee="Luis", created_at=datetime(2026, 4, 20, tzinfo=timezone.utc)),
                TaskItem(id="t6", pipeline_id="pipe-3", project_id="proj-1", title="Corrección de color", status="in_progress", assignee="Luis", created_at=datetime(2026, 5, 5, tzinfo=timezone.utc)),
                TaskItem(id="t7", pipeline_id="pipe-3", project_id="proj-1", title="Mezcla de audio", status="todo", assignee="María", created_at=datetime(2026, 5, 10, tzinfo=timezone.utc)),
                TaskItem(id="t8", pipeline_id="pipe-4", project_id="proj-1", title="Diseño de poster", status="todo", assignee="Diseño", created_at=datetime(2026, 5, 15, tzinfo=timezone.utc)),
                TaskItem(id="t9", pipeline_id="pipe-4", project_id="proj-1", title="Trailer 60s", status="todo", assignee="Luis", created_at=datetime(2026, 5, 16, tzinfo=timezone.utc)),
                TaskItem(id="t10", pipeline_id="pipe-5", project_id="proj-1", title="Subida a Vimeo / YouTube", status="todo", assignee="Admin", created_at=datetime(2026, 5, 18, tzinfo=timezone.utc)),
                TaskItem(id="t11", pipeline_id="pipe-5", project_id="proj-1", title="Programar redes sociales", status="todo", assignee="Marketing", created_at=datetime(2026, 5, 18, tzinfo=timezone.utc)),
            ]
            db.add_all(tasks)
            db.commit()
