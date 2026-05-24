from fastapi.testclient import TestClient


def test_get_pipeline(client: TestClient) -> None:
    response = client.get("/api/production/pipeline")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 5  # seeded pipeline phases

    phases = {item["phase"] for item in data}
    assert "scripting" in phases
    assert "shooting" in phases
    assert "editing" in phases
    assert "promotion" in phases
    assert "publishing" in phases

    # editing is active with 65% progress in seed data
    editing = next((item for item in data if item["phase"] == "editing"), None)
    assert editing is not None
    assert editing["status"] == "active"
    assert editing["progress_pct"] == 65


def test_get_dashboard(client: TestClient) -> None:
    response = client.get("/api/production/dashboard")
    assert response.status_code == 200
    data = response.json()

    assert data["total_projects"] >= 4
    assert data["active_projects"] >= 3
    assert data["total_assets"] >= 6
    assert "pipeline" in data
    assert isinstance(data["pipeline"], list)
    assert "upcoming_deadlines" in data
    assert isinstance(data["upcoming_deadlines"], list)
