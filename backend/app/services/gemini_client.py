from __future__ import annotations

from ..config import settings

_genai = None


def get_genai():
    """Return a configured ``google.generativeai`` module, or None if unavailable."""
    global _genai
    if not settings.has_gemini:
        return None
    if _genai is None:
        try:
            import google.generativeai as genai

            genai.configure(api_key=settings.gemini_api_key)
            _genai = genai
        except Exception:
            return None
    return _genai
