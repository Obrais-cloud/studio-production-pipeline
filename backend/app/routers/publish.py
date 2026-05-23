import os
from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import PublishJob as PublishJobDB
from app.models.schemas import (
    Platform,
    PlatformStatus,
    PublishJob,
    PublishRequest,
    PublishStatus,
)
from app.services import youtube_service, vimeo_service

router = APIRouter(prefix="/publish", tags=["publish"])


@router.get("/status/platforms", response_model=list[PlatformStatus])
def list_platform_status() -> list[PlatformStatus]:
    settings = get_settings()
    results = []

    yt_connected = bool(settings.youtube_refresh_token and settings.youtube_client_secrets)
    results.append(PlatformStatus(platform=Platform.YOUTUBE, connected=yt_connected))

    vimeo_connected = bool(settings.vimeo_access_token)
    results.append(PlatformStatus(platform=Platform.VIMEO, connected=vimeo_connected))

    return results


@router.post("/youtube", response_model=PublishJob)
def publish_to_youtube(payload: PublishRequest, db: Session = Depends(get_db)) -> PublishJob:
    if payload.platform != Platform.YOUTUBE:
        raise HTTPException(status_code=400, detail="Platform must be youtube")

    if not os.path.exists(payload.video_path):
        raise HTTPException(status_code=400, detail=f"Video file not found: {payload.video_path}")

    job = PublishJobDB(
        id=f"pub-{uuid4().hex[:12]}",
        project_id=payload.project_id,
        platform=Platform.YOUTUBE.value,
        title=payload.title,
        status=PublishStatus.UPLOADING.value,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    try:
        response = youtube_service.upload_video(
            video_path=payload.video_path,
            title=payload.title,
            description=payload.description or "",
            tags=payload.tags,
            privacy=payload.privacy,
        )
        job.external_id = response.get("id")
        job.url = f"https://www.youtube.com/watch?v={job.external_id}"
        job.status = PublishStatus.LIVE.value
    except Exception as e:
        job.status = PublishStatus.FAILED.value
        job.error_message = str(e)

    job.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(job)
    return job


@router.get("/youtube/{video_id}/status")
def youtube_video_status(video_id: str) -> dict:
    try:
        return youtube_service.get_video_status(video_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/vimeo", response_model=PublishJob)
def publish_to_vimeo(payload: PublishRequest, db: Session = Depends(get_db)) -> PublishJob:
    if payload.platform != Platform.VIMEO:
        raise HTTPException(status_code=400, detail="Platform must be vimeo")

    if not os.path.exists(payload.video_path):
        raise HTTPException(status_code=400, detail=f"Video file not found: {payload.video_path}")

    job = PublishJobDB(
        id=f"pub-{uuid4().hex[:12]}",
        project_id=payload.project_id,
        platform=Platform.VIMEO.value,
        title=payload.title,
        status=PublishStatus.UPLOADING.value,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    try:
        response = vimeo_service.upload_video(
            video_path=payload.video_path,
            title=payload.title,
            description=payload.description or "",
            tags=payload.tags,
            privacy=payload.privacy,
        )
        job.external_id = response.get("uri", "").split("/")[-1]
        job.url = response.get("link")
        job.status = PublishStatus.LIVE.value
    except Exception as e:
        job.status = PublishStatus.FAILED.value
        job.error_message = str(e)

    job.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(job)
    return job


@router.get("/vimeo/{video_id}/status")
def vimeo_video_status(video_id: str) -> dict:
    try:
        return vimeo_service.get_video_status(video_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/jobs", response_model=list[PublishJob])
def list_jobs(
    project_id: Optional[str] = None,
    platform: Optional[Platform] = None,
    db: Session = Depends(get_db),
) -> list[PublishJob]:
    query = db.query(PublishJobDB)
    if project_id:
        query = query.filter(PublishJobDB.project_id == project_id)
    if platform:
        query = query.filter(PublishJobDB.platform == platform.value)
    return query.order_by(PublishJobDB.created_at.desc()).all()


@router.get("/jobs/{job_id}", response_model=PublishJob)
def get_job(job_id: str, db: Session = Depends(get_db)) -> PublishJob:
    job = db.query(PublishJobDB).filter(PublishJobDB.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
