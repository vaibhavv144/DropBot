from __future__ import annotations

import json
from dataclasses import dataclass

import numpy as np
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import settings
from ..models import Chunk
from .embeddings import get_embedder


@dataclass
class RetrievedChunk:
    content: str
    score: float
    url: str
    title: str


def retrieve(db: Session, bot_id: str, query: str, top_k: int | None = None) -> list[RetrievedChunk]:
    """Embed the query and return the most similar chunks for this bot.

    Uses in-process cosine similarity (portable across SQLite/Postgres). For
    large corpora, swap this for a pgvector `ORDER BY embedding <=> :q` query.
    """
    k = top_k or settings.retrieval_top_k
    rows = db.execute(select(Chunk).where(Chunk.bot_id == bot_id)).scalars().all()
    if not rows:
        return []

    embedder = get_embedder()
    q = np.array(embedder.embed_one(query, task="retrieval_query"), dtype=np.float32)
    q_norm = np.linalg.norm(q)
    if q_norm > 0:
        q = q / q_norm

    matrix = np.array([json.loads(r.embedding) for r in rows], dtype=np.float32)
    norms = np.linalg.norm(matrix, axis=1)
    norms[norms == 0] = 1.0
    matrix = matrix / norms[:, None]

    scores = matrix @ q
    top_idx = np.argsort(-scores)[:k]

    results: list[RetrievedChunk] = []
    for i in top_idx:
        results.append(
            RetrievedChunk(
                content=rows[i].content,
                score=float(scores[i]),
                url=rows[i].source_url,
                title=rows[i].source_title,
            )
        )
    return results


def build_context(chunks: list[RetrievedChunk]) -> str:
    blocks = []
    for c in chunks:
        header = c.title or c.url or "source"
        blocks.append(f"[{header}]\n{c.content}")
    return "\n\n---\n\n".join(blocks)
