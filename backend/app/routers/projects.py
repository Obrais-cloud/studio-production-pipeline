from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Project as ProjectDB
from app.models.schemas import Project, ProjectCreate, ProjectStatus

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[Project])
def list_projects(
    status: Optional[ProjectStatus] = Query(None),
    studio: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    db: Session = Depends(get_db),
) -> list[Project]:
    query = db.query(ProjectDB)
    if status:
        query = query.filter(ProjectDB.status == status.value)
    if studio:
        query = query.filter(ProjectDB.studio.ilike(f"%{studio}%"))
    if q:
        query = query.filter(
            (ProjectDB.title.ilike(f"%{q}%")) | (ProjectDB.description.ilike(f"%{q}%"))
        )
    return query.all()


@router.get("/{project_id}", response_model=Project)
def get_project(project_id: str, db: Session = Depends(get_db)) -> Project:
    project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.post("", response_model=Project)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)) -> Project:
    project = ProjectDB(
        id=f"proj-{uuid4().hex[:12]}",
        title=payload.title,
        studio=payload.studio,
        description=payload.description,
        status=payload.status.value,
        budget=payload.budget,
        deadline=payload.deadline,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        tasks_completed=0,
        tasks_total=0,
        assets_count=0,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project
