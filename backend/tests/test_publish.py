from fastapi.testclient import TestClient


def test_list_platforms_disconnected(client: TestClient) -> None:
    response = client.get("/api/publish/status/platforms")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2

    youtube = next((p for p in data if p["platform"] == "youtube"), None)
    vimeo = next((p for p in data if p["platform"] == "vimeo"), None)
    assert youtube is not None
    assert vimeo is not None
    assert youtube["connected"] is False
    assert vimeo["connected"] is False


def test_list_jobs_empty(client: TestClient) -> None:
    response = client.get("/api/publish/jobs")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_get_job_not_found(client: TestClient) -> None:
    response = client.get("/api/publish/jobs/nonexistent-id")
    assert response.status_code == 404
    assert response.json()["detail"] == "Job not found"


def test_publish_youtube_missing_file(client: TestClient) -> None:
    payload = {
        "project_id": "proj-1",
        "platform": "youtube",
        "title": "Test YouTube Upload",
        "description": "Test description",
        "tags": ["test"],
        "privacy": "private",
        "video_path": "/nonexistent/path/video.mp4",
    }
    response = client.post("/api/publish/youtube", json=payload)
    assert response.status_code == 400
    assert "not found" in response.json()["detail"].lower()


def test_publish_youtube_wrong_platform(client: TestClient) -> None:
    payload = {
        "project_id": "proj-1",
        "platform": "vimeo",
        "title": "Test YouTube Upload",
        "description": "Test description",
        "tags": ["test"],
        "privacy": "private",
        "video_path": "/nonexistent/path/video.mp4",
    }
    response = client.post("/api/publish/youtube", json=payload)
    assert response.status_code == 400
    assert "platform must be youtube" in response.json()["detail"].lower()


def test_publish_vimeo_missing_file(client: TestClient) -> None:
    payload = {
        "project_id": "proj-1",
        "platform": "vimeo",
        "title": "Test Vimeo Upload",
        "description": "Test description",
        "tags": ["test"],
        "privacy": "private",
        "video_path": "/nonexistent/path/video.mp4",
    }
    response = client.post("/api/publish/vimeo", json=payload)
    assert response.status_code == 400
    assert "not found" in response.json()["detail"].lower()


def test_publish_vimeo_wrong_platform(client: TestClient) -> None:
    payload = {
        "project_id": "proj-1",
        "platform": "youtube",
        "title": "Test Vimeo Upload",
        "description": "Test description",
        "tags": ["test"],
        "privacy": "private",
        "video_path": "/nonexistent/path/video.mp4",
    }
    response = client.post("/api/publish/vimeo", json=payload)
    assert response.status_code == 400
    assert "platform must be vimeo" in response.json()["detail"].lower()
