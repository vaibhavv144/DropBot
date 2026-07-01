from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import settings


class Base(DeclarativeBase):
    pass


def _normalize_db_url(url: str) -> str:
    # Render/Heroku hand out "postgres://" URLs, but SQLAlchemy 2.x needs the
    # "postgresql://" scheme (with the psycopg2 driver).
    if url.startswith("postgres://"):
        return "postgresql://" + url[len("postgres://") :]
    return url


def _engine_kwargs() -> dict:
    if settings.database_url.startswith("sqlite"):
        return {"connect_args": {"check_same_thread": False}}
    return {"pool_pre_ping": True}


engine = create_engine(_normalize_db_url(settings.database_url), **_engine_kwargs())
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Columns added after the initial release. SQLAlchemy's create_all() creates
# missing *tables* but never alters existing ones, so we add new columns by hand
# with a portable `ALTER TABLE ... ADD COLUMN` (works on both SQLite and Postgres).
# Each entry: table -> { column_name: column_definition }.
_ADDED_COLUMNS: dict[str, dict[str, str]] = {
    "bots": {
        "suggested_questions": "TEXT NOT NULL DEFAULT ''",
    },
    "sources": {
        "auto_sync": "INTEGER NOT NULL DEFAULT 0",
        "sync_interval_hours": "INTEGER NOT NULL DEFAULT 24",
        "last_synced_at": "TIMESTAMP NULL",
    },
    "messages": {
        "rating": "INTEGER NOT NULL DEFAULT 0",
        "is_fallback": "INTEGER NOT NULL DEFAULT 0",
    },
}


def _run_migrations() -> None:
    """Idempotently add columns introduced after the first schema version."""
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    with engine.begin() as conn:
        for table, columns in _ADDED_COLUMNS.items():
            if table not in existing_tables:
                continue  # create_all already built it with the new columns
            present = {c["name"] for c in inspector.get_columns(table)}
            for name, ddl in columns.items():
                if name not in present:
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {ddl}"))


def init_db() -> None:
    """Create tables, then apply additive column migrations."""
    from . import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _run_migrations()
