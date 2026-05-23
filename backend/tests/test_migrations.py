import os

from alembic.config import Config
from alembic import command


def test_alembic_migrations() -> None:
    """Verify that Alembic migrations can be generated and applied against the test DB."""
    db_path = "test_alembic.db"
    # Clean up any leftover test DB from a previous failed run
    if os.path.exists(db_path):
        os.remove(db_path)

    backend_dir = os.path.join(os.path.dirname(__file__), "..")
    alembic_ini = os.path.join(backend_dir, "alembic.ini")

    assert os.path.exists(alembic_ini), "alembic.ini not found"

    alembic_cfg = Config(alembic_ini)
    # Point Alembic to the test database
    alembic_cfg.set_main_option("sqlalchemy.url", f"sqlite:///./{db_path}")

    # Apply all migrations
    command.upgrade(alembic_cfg, "head")

    # Verify current revision is not None
    from alembic.runtime.migration import MigrationContext
    from sqlalchemy import create_engine

    engine = create_engine(f"sqlite:///./{db_path}")
    try:
        with engine.connect() as connection:
            context = MigrationContext.configure(connection)
            current_rev = context.get_current_revision()
            assert current_rev is not None, "No current revision after migration"
    finally:
        engine.dispose()
        if os.path.exists(db_path):
            os.remove(db_path)
