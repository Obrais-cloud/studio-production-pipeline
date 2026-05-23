import os
from typing import Optional

import vimeo

from app.config import get_settings


def get_vimeo_client() -> Optional[vimeo.VimeoClient]:
    settings = get_settings()
    token = settings.vimeo_access_token
    if not token:
        return None
    return vimeo.VimeoClient(
        token=token,
        key=settings.vimeo_client_id or None,
        secret=settings.vimeo_client_secret or None,
    )


def upload_video(
    video_path: str,
    title: str,
    description: str = "",
    tags: list[str] | None = None,
    privacy: str = "disable",  # disable (private), anybody, unlisted
) -> dict:
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video file not found: {video_path}")

    client = get_vimeo_client()
    if not client:
        raise RuntimeError("Vimeo service not configured. Set VIMEO_ACCESS_TOKEN.")

    privacy_map = {
        "public": "anybody",
        "private": "disable",
        "unlisted": "unlisted",
    }
    vimeo_privacy = privacy_map.get(privacy, privacy)

    try:
        # Upload using PyVimeo which handles Tus internally
        uri = client.upload(video_path, data={
            "name": title,
            "description": description,
            "privacy": {"view": vimeo_privacy},
        })

        # Get video details
        response = client.get(uri)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise RuntimeError(f"Vimeo upload failed: {e}")


def get_video_status(video_id: str) -> dict:
    client = get_vimeo_client()
    if not client:
        raise RuntimeError("Vimeo service not configured.")

    try:
        uri = f"/videos/{video_id}"
        response = client.get(uri)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}


def list_videos(page: int = 1, per_page: int = 10) -> list[dict]:
    client = get_vimeo_client()
    if not client:
        raise RuntimeError("Vimeo service not configured.")

    try:
        response = client.get("/me/videos", params={"page": page, "per_page": per_page})
        response.raise_for_status()
        return response.json().get("data", [])
    except Exception:
        return []
