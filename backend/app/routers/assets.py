from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Query
from app.models.schemas import Asset, AssetType

router = APIRouter(prefix="/assets", tags=["assets"])

ASSETS: list[Asset] = [
    Asset(id="a1", project_id="proj-1", name="Guion v3.pdf", type=AssetType.SCRIPT, url="/assets/guion-v3.pdf", size_bytes=245000, created_at=datetime(2026, 3, 10, tzinfo=timezone.utc), uploaded_by="Ana"),
    Asset(id="a2", project_id="proj-1", name="Storyboard escenas 1-5.png", type=AssetType.STORYBOARD, url="/assets/storyboard-1-5.png", size_bytes=3200000, created_at=datetime(2026, 3, 20, tzinfo=timezone.utc), uploaded_by="Carlos"),
    Asset(id="a3", project_id="proj-1", name="Footage día 1.zip", type=AssetType.FOOTAGE, url="/assets/footage-d1.zip", size_bytes=64424509440, created_at=datetime(2026, 4, 11, tzinfo=timezone.utc), uploaded_by="Equipo A"),
    Asset(id="a4", project_id="proj-1", name="Rough cut v2.mp4", type=AssetType.EXPORT, url="/assets/rough-cut-v2.mp4", size_bytes=2147483648, created_at=datetime(2026, 5, 8, tzinfo=timezone.utc), uploaded_by="Luis"),
    Asset(id="a5", project_id="proj-2", name="Ep1 - Audio master.wav", type=AssetType.AUDIO, url="/assets/ep1-audio.wav", size_bytes=1073741824, created_at=datetime(2026, 4, 25, tzinfo=timezone.utc), uploaded_by="María"),
    Asset(id="a6", project_id="proj-2", name="Ep1 - Thumbnail.jpg", type=AssetType.THUMBNAIL, url="/assets/ep1-thumb.jpg", size_bytes=450000, created_at=datetime(2026, 4, 26, tzinfo=timezone.utc), uploaded_by="Diseño"),
]


@router.get("", response_model=list[Asset])
def list_assets(
    project_id: Optional[str] = Query(None),
    type: Optional[AssetType] = Query(None),
) -> list[Asset]:
    results = ASSETS[:]
    if project_id:
        results = [a for a in results if a.project_id == project_id]
    if type:
        results = [a for a in results if a.type == type]
    return results


@router.get("/types")
def asset_types() -> list[dict]:
    return [{"type": t.value, "label": t.value.replace("_", " ").title()} for t in AssetType]
