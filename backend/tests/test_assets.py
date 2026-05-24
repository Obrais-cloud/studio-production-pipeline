from fastapi.testclient import TestClient


def test_list_assets(client: TestClient) -> None:
    response = client.get("/api/assets")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 6  # seeded assets


def test_list_assets_filter_by_type(client: TestClient) -> None:
    response = client.get("/api/assets?type=script")
    assert response.status_code == 200
    data = response.json()
    assert all(a["type"] == "script" for a in data)
    assert any(a["name"] == "Guion v3.pdf" for a in data)


def test_list_assets_filter_by_project(client: TestClient) -> None:
    response = client.get("/api/assets?project_id=proj-1")
    assert response.status_code == 200
    data = response.json()
    assert all(a["project_id"] == "proj-1" for a in data)
    assert len(data) >= 4  # proj-1 has 4 seeded assets


def test_asset_types(client: TestClient) -> None:
    response = client.get("/api/assets/types")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 7  # all AssetType enum values
    type_values = {t["type"] for t in data}
    assert "script" in type_values
    assert "footage" in type_values
    assert "audio" in type_values
