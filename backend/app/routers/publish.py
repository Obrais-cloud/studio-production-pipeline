from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    Platform,
    PlatformStatus,
    PublishJob,
    PublishRequest,
    PublishStatus,
)
from app.services import youtube_service, vimeo_service
from app.config import get_settings

router = APIRouter(prefix="/publish", tags=["publish"])

PUBLISH_JOBS: list[PublishJob] = []


@router.get("/status/platforms", response_model=list[PlatformStatus])
def list_platform_status() -> list[PlatformStatus]:
    settings = get_settings()
    results = []

    # YouTube
    yt_connected = bool(settings.youtube_refresh_token and settings.youtube_client_secrets)
    results.append(PlatformStatus(platform=Platform.YOUTUBE, connected=yt_connected))

    # Vimeo
    vimeo_connected = bool(settings.vimeo_access_token)
    results.append(PlatformStatus(platform=Platform.VIMEO, connected=vimeo_connected))

    return results


@router.post("/youtube", response_model=PublishJob)
def publish_to_youtube(payload: PublishRequest) -> PublishJob:
    if payload.platform != Platform.YOUTUBE:
        raise HTTPException(status_code=400, detail="Platform must be youtube")

    import os as _os
    if not _os.path.exists(payload.video_path):
        raise HTTPException(status_code=400, detail=f"Video file not found: {payload.video_path}")

    job = PublishJob(
        id=f"pub-{len(PUBLISH_JOBS)+1}",
        project_id=payload.project_id,
        platform=Platform.YOUTUBE,
        title=payload.title,
        status=PublishStatus.UPLOADING,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    PUBLISH_JOBS.append(job)

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
        job.status = PublishStatus.LIVE
    except Exception as e:
        job.status = PublishStatus.FAILED
        job.error_message = str(e)

    job.updated_at = datetime.now(timezone.utc)
    return job


@router.get("/youtube/{video_id}/status")
def youtube_video_status(video_id: str) -> dict:
    try:
        return youtube_service.get_video_status(video_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/vimeo", response_model=PublishJob)
def publish_to_vimeo(payload: PublishRequest) -> PublishJob:
    if payload.platform != Platform.VIMEO:
        raise HTTPException(status_code=400, detail="Platform must be vimeo")

    import os as _os
    if not _os.path.exists(payload.video_path):
        raise HTTPException(status_code=400, detail=f"Video file not found: {payload.video_path}")

    job = PublishJob(
        id=f"pub-{len(PUBLISH_JOBS)+1}",
        project_id=payload.project_id,
        platform=Platform.VIMEO,
        title=payload.title,
        status=PublishStatus.UPLOADING,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    PUBLISH_JOBS.append(job)

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
        job.status = PublishStatus.LIVE
    except Exception as e:
        job.status = PublishStatus.FAILED
        job.error_message = str(e)

    job.updated_at = datetime.now(timezone.utc)
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
) -> list[PublishJob]:
    results = PUBLISH_JOBS[:]
    if project_id:
        results = [j for j in results if j.project_id == project_id]
    if platform:
        results = [j for j in results if j.platform == platform]
    return sorted(results, key=lambda j: j.created_at, reverse=True)


@router.get("/jobs/{job_id}", response_model=PublishJob)
def get_job(job_id: str) -> PublishJob:
    for j in PUBLISH_JOBS:
        if j.id == job_id:
            return j
    raise HTTPException(status_code=404, detail="Job not found")
