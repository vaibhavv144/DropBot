"""Background re-crawl scheduler.

A single asyncio task wakes up periodically, finds URL sources whose auto-sync
interval has elapsed, and re-ingests them in a worker thread (ingestion is
synchronous and network-bound). Intentionally dependency-free — no Celery/cron.
"""
from __future__ import annotations

import asyncio
import datetime as dt
import logging

from sqlalchemy import select

from ..database import SessionLocal
from ..models import Source
from .ingest import ingest_url_task

logger = logging.getLogger("scheduler")

# How often the loop checks for due sources. The per-source cadence is governed
# by each source's `sync_interval_hours`; this is just the polling granularity.
_TICK_SECONDS = 300


def _due_source_ids() -> list[str]:
    """Return ids of URL sources whose auto-sync interval has elapsed."""
    now = dt.datetime.now(dt.timezone.utc).replace(tzinfo=None)
    db = SessionLocal()
    try:
        sources = (
            db.execute(
                select(Source).where(
                    Source.kind == "url",
                    Source.auto_sync == 1,
                    Source.status != "processing",
                )
            )
            .scalars()
            .all()
        )
        due: list[str] = []
        for s in sources:
            interval = dt.timedelta(hours=max(1, s.sync_interval_hours or 24))
            last = s.last_synced_at
            if last is not None and last.tzinfo is not None:
                last = last.replace(tzinfo=None)
            if last is None or (now - last) >= interval:
                due.append(s.id)
        return due
    finally:
        db.close()


async def _run() -> None:
    while True:
        try:
            due = await asyncio.to_thread(_due_source_ids)
            for source_id in due:
                logger.info("Auto-syncing source %s", source_id)
                # Re-ingest off the event loop; failures are isolated per source.
                await asyncio.to_thread(ingest_url_task, source_id, None)
        except asyncio.CancelledError:
            raise
        except Exception:  # noqa: BLE001
            logger.exception("Scheduler tick failed")
        await asyncio.sleep(_TICK_SECONDS)


_task: asyncio.Task | None = None


def start_scheduler() -> None:
    global _task
    if _task is None or _task.done():
        _task = asyncio.create_task(_run())


async def stop_scheduler() -> None:
    global _task
    if _task is not None:
        _task.cancel()
        try:
            await _task
        except asyncio.CancelledError:
            pass
        _task = None
