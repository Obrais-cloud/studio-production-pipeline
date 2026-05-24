from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models import Asset as AssetDB, PipelineItem as PipelineItemDB, Project as ProjectDB
from app.models.schemas import DashboardSummary, PipelineItem

router = APIRouter(prefix="/production", tags=["production"])


@router.get("/pipeline", response_model=list[PipelineItem])
def get_pipeline(db: Session = Depends(get_db)) -> list[PipelineItem]:
    items = (
        db.query(PipelineItemDB)
        .options(selectinload(PipelineItemDB.tasks))
        .order_by(PipelineItemDB.id)
        .all()
    )
    result = []
    for item in items:
        result.append({
            "phase": item.phase,
            "status": item.status,
            "progress_pct": item.progress_pct,
            "tasks": [
                {
                    "id": t.id,
                    "project_id": t.project_id,
                    "title": t.title,
                    "status": t.status,
                    "assignee": t.assignee,
                    "due_date": t.due_date.isoformat() if t.due_date else None,
                    "created_at": t.created_at.isoformat() if t.created_at else None,
                }
                for t in item.tasks
            ],
            "deliverables": item.deliverables or [],
        })
    return result


@router.get("/dashboard", response_model=DashboardSummary)
def get_dashboard(db: Session = Depends(get_db)) -> DashboardSummary:
    total_projects = db.query(ProjectDB).count()
    active_projects = db.query(ProjectDB).filter(ProjectDB.status != "published").count()
    total_assets = db.query(AssetDB).count()

    pipeline = get_pipeline(db)

    now = datetime.now(timezone.utc)
    upcoming = (
        db.query(ProjectDB)
        .filter(ProjectDB.deadline.isnot(None))
        .filter(ProjectDB.deadline >= now)
        .order_by(ProjectDB.deadline.asc())
        .limit(5)
        .all()
    )

    return DashboardSummary(
        total_projects=total_projects,
        active_projects=active_projects,
        completed_this_month=0,
        total_assets=total_assets,
        pipeline=pipeline,
        upcoming_deadlines=upcoming,
    )
