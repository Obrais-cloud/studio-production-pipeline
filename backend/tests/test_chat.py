from fastapi.testclient import TestClient


def test_chat_keyword_presupuesto(client: TestClient) -> None:
    response = client.post("/api/chat", json={"message": "¿Cuál es el presupuesto?"})
    assert response.status_code == 200
    data = response.json()
    assert "presupuesto" in data["reply"].lower()
    assert isinstance(data["suggested_actions"], list)


def test_chat_keyword_guion(client: TestClient) -> None:
    response = client.post("/api/chat", json={"message": "Necesito ayuda con el guion"})
    assert response.status_code == 200
    data = response.json()
    assert "guion" in data["reply"].lower() or "tres actos" in data["reply"].lower()
    assert isinstance(data["suggested_actions"], list)


def test_chat_keyword_deadline(client: TestClient) -> None:
    response = client.post("/api/chat", json={"message": "¿Cuándo es la deadline?"})
    assert response.status_code == 200
    data = response.json()
    assert "15 de julio" in data["reply"]
    assert isinstance(data["suggested_actions"], list)


def test_chat_fallback(client: TestClient) -> None:
    response = client.post("/api/chat", json={"message": "Hola, ¿qué tal?"})
    assert response.status_code == 200
    data = response.json()
    assert "asistente de producción" in data["reply"].lower()
    assert isinstance(data["suggested_actions"], list)


def test_chat_empty_message(client: TestClient) -> None:
    response = client.post("/api/chat", json={"message": ""})
    assert response.status_code == 422  # pydantic validation error
