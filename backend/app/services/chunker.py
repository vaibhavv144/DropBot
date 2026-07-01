from __future__ import annotations

import re

from ..config import settings

# Approximate tokens as ~4 chars. Good enough for chunk sizing without a tokenizer.
_CHARS_PER_TOKEN = 4


def _approx_tokens(text: str) -> int:
    return max(1, len(text) // _CHARS_PER_TOKEN)


def _split_paragraphs(text: str) -> list[str]:
    text = re.sub(r"\n{3,}", "\n\n", text)
    parts = re.split(r"\n\s*\n", text)
    return [p.strip() for p in parts if p.strip()]


def chunk_text(text: str) -> list[str]:
    """Recursive-ish chunking: pack paragraphs up to chunk_size tokens with overlap."""
    max_chars = settings.chunk_size * _CHARS_PER_TOKEN
    overlap_chars = settings.chunk_overlap * _CHARS_PER_TOKEN

    paragraphs = _split_paragraphs(text)
    chunks: list[str] = []
    buf = ""

    for para in paragraphs:
        if len(para) > max_chars:
            # Hard-split very long paragraphs on sentence boundaries.
            sentences = re.split(r"(?<=[.!?])\s+", para)
            for sent in sentences:
                if len(buf) + len(sent) + 1 > max_chars and buf:
                    chunks.append(buf.strip())
                    buf = buf[-overlap_chars:] if overlap_chars else ""
                buf += " " + sent
            continue

        if len(buf) + len(para) + 2 > max_chars and buf:
            chunks.append(buf.strip())
            buf = buf[-overlap_chars:] if overlap_chars else ""
        buf += "\n\n" + para

    if buf.strip():
        chunks.append(buf.strip())

    return [c for c in chunks if c.strip()]


def token_count(text: str) -> int:
    return _approx_tokens(text)
