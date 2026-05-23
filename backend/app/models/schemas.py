from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class ProjectStatus(str, Enum):
    IDEA = "idea"
    SCRIPTING = "scripting"
    PRE_PRODUCTION = "pre_production"
    PRODUCTION = "production"
    POST_PRODUCTION = "post_production"
    REVIEW = "review"
    PUBLISHED = "published"


class AssetType(str, Enum):
    SCRIPT = "script"
    STORYBOARD = "storyboard"
    FOOTAGE = "footage"
    AUDIO = "audio"
    GRAPHIC = "graphic"
    THUMBNAIL = "thumbnail"
    EXPORT = "export"


class ProjectBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    studio: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=2000)
    status: ProjectStatus = ProjectStatus.IDEA
    budget: Optional[float] = Field(None, ge=0)
    deadline: Optional[datetime] = None


class ProjectCreate(ProjectBase):
    pass


class Project(ProjectBase):
    id: str
    created_at: datetime
    updated_at: datetime
    tasks_completed: int = 0
    tasks_total: int = 0
    assets_count: int = 0

    class Config:
        from_attributes = True


class Task(BaseModel):
    id: str
    project_id: str
    title: str
    status: str  # todo, in_progress, done, blocked
    assignee: Optional[str] = None
    due_date: Optional[datetime] = None
    created_at: datetime


class Asset(BaseModel):
    id: str
    project_id: str
    name: str
    type: AssetType
    url: Optional[str] = None
    size_bytes: Optional[int] = None
    created_at: datetime
    uploaded_by: Optional[str] = None


class ProductionPhase(str, Enum):
    SCRIPTING = "scripting"
    SHOOTING = "shooting"
    EDITING = "editing"
    PROMOTION = "promotion"
    PUBLISHING = "publishing"


class PipelineItem(BaseModel):
    phase: ProductionPhase
    status: str  # pending, active, completed
    progress_pct: int = Field(0, ge=0, le=100)
    tasks: list[Task] = []
    deliverables: list[str] = []


class DashboardSummary(BaseModel):
    total_projects: int
    active_projects: int
    completed_this_month: int
    total_assets: int
    pipeline: list[PipelineItem]
    upcoming_deadlines: list[Project]


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    reply: str
    suggested_actions: list[str] = []
