from __future__ import annotations

import datetime as dt
import hashlib
import json

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models import Chunk, Document, Source
from .chunker import chunk_text, token_count
from .crawler import crawl
from .embeddings import get_embedder
from .extractor import extract_file


def _hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8", errors="ignore")).hexdigest()


def _naive_utc_now() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc).replace(tzinfo=None)


def _clear_documents(db: Session, source: Source) -> None:
    """Drop a source's existing documents (and their chunks) before re-ingest."""
    docs = db.execute(
        select(Document).where(Document.source_id == source.id)
    ).scalars().all()
    for doc in docs:
        db.delete(doc)
    if docs:
        db.commit()


def _store_document(
    db: Session, source: Source, *, url: str, title: str, text: str
) -> int:
    """Chunk + embed a single document, persist, return number of chunks."""
    chunks = chunk_text(text)
    if not chunks:
        return 0

    doc = Document(
        source_id=source.id,
        bot_id=source.bot_id,
        url=url,
        title=title,
        content_hash=_hash(text),
    )
    db.add(doc)
    db.flush()

    embedder = get_embedder()
    vectors = embedder.embed(chunks, task="retrieval_document")
    for content, vec in zip(chunks, vectors):
        db.add(
            Chunk(
                document_id=doc.id,
                bot_id=source.bot_id,
                content=content,
                embedding=json.dumps(vec),
                token_count=token_count(content),
                source_url=url,
                source_title=title,
            )
        )
    return len(chunks)


def ingest_url(db: Session, source_id: str, max_pages: int | None = None) -> None:
    source = db.get(Source, source_id)
    if source is None:
        return
    source.status = "processing"
    db.commit()

    try:
        # Replace any previously-indexed content so re-crawls stay in sync.
        _clear_documents(db, source)
        pages = crawl(source.location, max_pages=max_pages)
        total_chunks = 0
        for page in pages:
            total_chunks += _store_document(
                db, source, url=page.url, title=page.title, text=page.text
            )
        source.pages_count = len(pages)
        source.chunks_count = total_chunks
        source.status = "done" if pages else "error"
        source.detail = "" if pages else "No readable pages found."
        source.last_synced_at = _naive_utc_now()
        db.commit()
    except Exception as exc:  # noqa: BLE001
        db.rollback()
        source.status = "error"
        source.detail = str(exc)[:500]
        db.commit()


def ingest_url_task(source_id: str, max_pages: int | None = None) -> None:
    db = SessionLocal()
    try:
        ingest_url(db, source_id, max_pages=max_pages)
    finally:
        db.close()


def ingest_file_task(source_id: str, filename: str, data: bytes) -> None:
    db = SessionLocal()
    try:
        ingest_file(db, source_id, filename, data)
    finally:
        db.close()


def ingest_file(db: Session, source_id: str, filename: str, data: bytes) -> None:
    source = db.get(Source, source_id)
    if source is None:
        return
    source.status = "processing"
    db.commit()

    try:
        title, text = extract_file(filename, data)
        chunks = _store_document(db, source, url=filename, title=title, text=text)
        source.pages_count = 1
        source.chunks_count = chunks
        source.status = "done" if chunks else "error"
        source.detail = "" if chunks else "No extractable text found."
        db.commit()
    except Exception as exc:  # noqa: BLE001
        db.rollback()
        source.status = "error"
        source.detail = str(exc)[:500]
        db.commit()
