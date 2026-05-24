from fastapi.testclient import TestClient


def test_list_projects(client: TestClient) -> None:
    response = client.get("/api/projects")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 4  # seeded projects


def test_get_project_success(client: TestClient) -> None:
    response = client.get("/api/projects/proj-1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "proj-1"
    assert data["title"] == "Cortometraje Verano 2026"
    assert data["studio"] == "Cinefactory"
    assert data["status"] == "production"


def test_get_project_not_found(client: TestClient) -> None:
    response = client.get("/api/projects/nonexistent-id")
    assert response.status_code == 404
    assert response.json()["detail"] == "Project not found"


def test_list_projects_filter_by_status(client: TestClient) -> None:
    response = client.get("/api/projects?status=production")
    assert response.status_code == 200
    data = response.json()
    assert all(p["status"] == "production" for p in data)
    assert any(p["id"] == "proj-1" for p in data)


def test_list_projects_filter_by_studio(client: TestClient) -> None:
    response = client.get("/api/projects?studio=Cinefactory")
    assert response.status_code == 200
    data = response.json()
    assert all("cinefactory" in p["studio"].lower() for p in data)
    assert any(p["id"] == "proj-1" for p in data)


def test_list_projects_search(client: TestClient) -> None:
    response = client.get("/api/projects?q=Historias")
    assert response.status_code == 200
    data = response.json()
    assert any("historias" in p["title"].lower() for p in data)


def test_create_project(client: TestClient) -> None:
    payload = {
        "title": "Test Project CI",
        "studio": "TestStudio",
        "description": "Created by CI test",
        "status": "idea",
        "budget": 1000.0,
    }
    response = client.post("/api/projects", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Project CI"
    assert data["studio"] == "TestStudio"
    assert data["status"] == "idea"
    assert "id" in data

    # Verify it appears in the list
    list_response = client.get("/api/projects")
    projects = list_response.json()
    assert any(p["title"] == "Test Project CI" for p in projects)
