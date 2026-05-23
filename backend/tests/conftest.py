import os
import sys

# Set test environment BEFORE importing app modules so get_settings() picks up the test DB.
os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("CORS_ORIGINS", "http://localhost,http://127.0.0.1")
os.environ.setdefault("SKIP_ALEMBIC", "1")

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker

from app.database import engine, Base, get_db
import app.models  # noqa: F401 — registers ORM classes with Base.metadata

from app.main import app  # noqa: E402

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Create and clean up the test database around the test session."""
    # Remove stale DB files from previous runs
    for db_file in ("test.db", "studio.db", "test_alembic.db", "ci.db"):
        if os.path.exists(db_file):
            os.remove(db_file)

    # Create tables fresh for this session
    Base.metadata.create_all(bind=engine)

    yield

    Base.metadata.drop_all(bind=engine)
    for db_file in ("test.db", "studio.db", "test_alembic.db", "ci.db"):
        if os.path.exists(db_file):
            os.remove(db_file)


@pytest.fixture(scope="function")
def db_session():
    """Provide a transactional scope around each test."""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(db_session):
    """Provide a FastAPI test client with DB override."""
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    del app.dependency_overrides[get_db]
