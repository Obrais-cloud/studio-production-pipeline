import os

from alembic.config import Config
from alembic import command


def test_alembic_migrations() -> None:
    """Verify that Alembic migrations can be generated and applied against the test DB."""
    # Clean up any leftover test DB from a previous failed run
    if os.path.exists("test_alembic.db"):
        os.remove("test_alembic.db")

    backend_dir = os.path.join(os.path.dirname(__file__), "..")
    alembic_ini = os.path.join(backend_dir, "alembic.ini")

    assert os.path.exists(alembic_ini), "alembic.ini not found"

    alembic_cfg = Config(alembic_ini)
    # Point Alembic to the test database
    alembic_cfg.set_main_option("sqlalchemy.url", "sqlite:///./test_alembic.db")

    # Apply all migrations
    command.upgrade(alembic_cfg, "head")

    # Verify current revision is not None
    from alembic.script import ScriptDirectory
    from alembic.runtime.migration import MigrationContext
    from sqlalchemy import create_engine

    engine = create_engine("sqlite:///./test_alembic.db")
    with engine.connect() as connection:
        context = MigrationContext.configure(connection)
        current_rev = context.get_current_revision()
        assert current_rev is not None, "No current revision after migration"

    engine.dispose()
    os.remove("test_alembic.db")
