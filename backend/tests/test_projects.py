from fastapi.testclient import TestClient


def test_list_projects(client: TestClient) -> None:
    response = client.get("/api/projects")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


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


def test_get_project_not_found(client: TestClient) -> None:
    response = client.get("/api/projects/nonexistent-id")
    assert response.status_code == 404
