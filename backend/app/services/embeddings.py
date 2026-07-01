from __future__ import annotations

import hashlib
import re

import numpy as np

from ..config import settings
from .gemini_client import get_genai

_WORD_RE = re.compile(r"[a-z0-9]+")


def _tokenize(text: str) -> list[str]:
    return _WORD_RE.findall(text.lower())


def _hash_embed(text: str, dim: int) -> list[float]:
    """Deterministic feature-hashing embedding used when no Gemini key is set.

    Captures lexical overlap well enough for meaningful cosine similarity in
    local/dev mode. Uses unigrams + bigrams with signed hashing.
    """
    vec = np.zeros(dim, dtype=np.float32)
    tokens = _tokenize(text)
    grams = tokens + [f"{a}_{b}" for a, b in zip(tokens, tokens[1:])]
    for gram in grams:
        h = int(hashlib.md5(gram.encode()).hexdigest(), 16)
        idx = h % dim
        sign = 1.0 if (h >> 8) & 1 else -1.0
        vec[idx] += sign
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec /= norm
    return vec.tolist()


class EmbeddingProvider:
    """Embeds text via Gemini when configured, else a local fallback."""

    def __init__(self) -> None:
        self.dim = settings.embedding_dim
        self._gemini = get_genai()

    @property
    def backend(self) -> str:
        return "gemini" if self._gemini else "local-hash"

    def embed(self, texts: list[str], *, task: str = "retrieval_document") -> list[list[float]]:
        if self._gemini is not None:
            try:
                return self._embed_gemini(texts, task)
            except Exception:
                # Fall back gracefully (quota errors, network, etc.)
                pass
        return [_hash_embed(t, self.dim) for t in texts]

    def embed_one(self, text: str, *, task: str = "retrieval_query") -> list[float]:
        return self.embed([text], task=task)[0]

    def _embed_gemini(self, texts: list[str], task: str) -> list[list[float]]:
        model = settings.gemini_embed_model
        if not model.startswith("models/"):
            model = f"models/{model}"
        out: list[list[float]] = []
        for t in texts:
            res = self._gemini.embed_content(model=model, content=t, task_type=task)
            out.append(res["embedding"])
        return out


_provider: EmbeddingProvider | None = None


def get_embedder() -> EmbeddingProvider:
    global _provider
    if _provider is None:
        _provider = EmbeddingProvider()
    return _provider
