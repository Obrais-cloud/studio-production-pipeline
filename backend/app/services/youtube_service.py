import json
import os
from typing import Optional

from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

from app.config import get_settings

SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]


def _load_client_credentials() -> Optional[tuple[str, str]]:
    settings = get_settings()

    # Prefer explicit env vars
    if settings.youtube_client_id and settings.youtube_client_secret:
        return settings.youtube_client_id, settings.youtube_client_secret

    # Fallback to client_secret.json
    path = settings.youtube_client_secrets
    if path and os.path.exists(path):
        with open(path, "r") as f:
            data = json.load(f)
        # Support both web and installed app flows
        client = data.get("web") or data.get("installed") or {}
        return client.get("client_id"), client.get("client_secret")

    return None


def get_youtube_service() -> Optional[build]:
    settings = get_settings()
    refresh_token = settings.youtube_refresh_token
    client_creds = _load_client_credentials()

    if not refresh_token or not client_creds:
        return None

    client_id, client_secret = client_creds

    creds = Credentials(
        token=None,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=client_id,
        client_secret=client_secret,
        scopes=SCOPES,
    )

    if creds.expired and creds.refresh_token:
        creds.refresh(Request())

    return build("youtube", "v3", credentials=creds, cache_discovery=False)


def upload_video(
    video_path: str,
    title: str,
    description: str = "",
    tags: list[str] | None = None,
    privacy: str = "private",
    category_id: str = "22",
) -> dict:
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video file not found: {video_path}")

    youtube = get_youtube_service()
    if not youtube:
        raise RuntimeError(
            "YouTube service not configured. Set YOUTUBE_CLIENT_ID + YOUTUBE_CLIENT_SECRET + YOUTUBE_REFRESH_TOKEN or YOUTUBE_CLIENT_SECRETS file."
        )

    body = {
        "snippet": {
            "title": title,
            "description": description,
            "tags": tags or [],
            "categoryId": category_id,
        },
        "status": {"privacyStatus": privacy, "selfDeclaredMadeForKids": False},
    }

    media = MediaFileUpload(video_path, chunksize=-1, resumable=True)
    request = youtube.videos().insert(part="snippet,status", body=body, media_body=media)
    response = request.execute()
    return response


def get_video_status(video_id: str) -> dict:
    youtube = get_youtube_service()
    if not youtube:
        raise RuntimeError("YouTube service not configured.")

    response = youtube.videos().list(part="status,snippet", id=video_id).execute()
    items = response.get("items", [])
    if not items:
        return {"error": "Video not found"}
    return items[0]
