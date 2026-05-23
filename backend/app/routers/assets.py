from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Asset as AssetDB
from app.models.schemas import Asset, AssetType

router = APIRouter(prefix="/assets", tags=["assets"])


@router.get("", response_model=list[Asset])
def list_assets(
    project_id: Optional[str] = Query(None),
    type: Optional[AssetType] = Query(None),
    db: Session = Depends(get_db),
) -> list[Asset]:
    query = db.query(AssetDB)
    if project_id:
        query = query.filter(AssetDB.project_id == project_id)
    if type:
        query = query.filter(AssetDB.type == type.value)
    return query.all()


@router.get("/types")
def asset_types() -> list[dict]:
    return [{"type": t.value, "label": t.value.replace("_", " ").title()} for t in AssetType]
