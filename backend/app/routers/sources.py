from __future__ import annotations

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_owned_bot
from ..models import Bot, Source
from ..schemas import SourceCreateUrl, SourceOut, SourceSyncUpdate
from ..services.ingest import ingest_file_task, ingest_url_task

router = APIRouter(prefix="/api/bots/{bot_id}/sources", tags=["sources"])


@router.get("", response_model=list[SourceOut])
def list_sources(
    bot: Bot = Depends(get_owned_bot),
    db: Session = Depends(get_db),
):
    return (
        db.execute(
            select(Source).where(Source.bot_id == bot.id).order_by(Source.created_at.desc())
        )
        .scalars()
        .all()
    )


@router.post("/url", response_model=SourceOut)
def add_url_source(
    payload: SourceCreateUrl,
    background: BackgroundTasks,
    bot: Bot = Depends(get_owned_bot),
    db: Session = Depends(get_db),
):
    url = payload.url.strip()
    if not url.startswith(("http://", "https://")):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "URL must start with http:// or https://")
    source = Source(bot_id=bot.id, kind="url", location=url, status="pending")
    db.add(source)
    db.commit()
    db.refresh(source)
    background.add_task(ingest_url_task, source.id, payload.max_pages)
    return source


@router.post("/file", response_model=SourceOut)
async def add_file_source(
    background: BackgroundTasks,
    file: UploadFile = File(...),
    bot: Bot = Depends(get_owned_bot),
    db: Session = Depends(get_db),
):
    data = await file.read()
    if not data:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Empty file")
    source = Source(
        bot_id=bot.id, kind="file", location=file.filename or "upload", status="pending"
    )
    db.add(source)
    db.commit()
    db.refresh(source)
    background.add_task(ingest_file_task, source.id, file.filename or "upload", data)
    return source


def _owned_source(db: Session, bot: Bot, source_id: str) -> Source:
    source = db.get(Source, source_id)
    if source is None or source.bot_id != bot.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Source not found")
    return source


@router.patch("/{source_id}/sync", response_model=SourceOut)
def update_sync(
    source_id: str,
    payload: SourceSyncUpdate,
    bot: Bot = Depends(get_owned_bot),
    db: Session = Depends(get_db),
):
    source = _owned_source(db, bot, source_id)
    if source.kind != "url":
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "Only crawled URL sources can auto-sync"
        )
    source.auto_sync = payload.auto_sync
    source.sync_interval_hours = payload.sync_interval_hours
    db.commit()
    db.refresh(source)
    return source


@router.post("/{source_id}/resync", response_model=SourceOut)
def resync_source(
    source_id: str,
    background: BackgroundTasks,
    bot: Bot = Depends(get_owned_bot),
    db: Session = Depends(get_db),
):
    source = _owned_source(db, bot, source_id)
    if source.kind != "url":
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "Only crawled URL sources can be re-synced"
        )
    source.status = "pending"
    db.commit()
    db.refresh(source)
    background.add_task(ingest_url_task, source.id, None)
    return source


@router.delete("/{source_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_source(
    source_id: str,
    bot: Bot = Depends(get_owned_bot),
    db: Session = Depends(get_db),
):
    source = _owned_source(db, bot, source_id)
    db.delete(source)
    db.commit()
