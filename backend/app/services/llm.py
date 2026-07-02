from __future__ import annotations

import logging
from collections.abc import Iterator

from ..config import settings
from .gemini_client import get_genai

logger = logging.getLogger("llm")

GROUNDED_SYSTEM = (
    "You are a helpful assistant embedded on a specific website. "
    "Answer ONLY using the provided context from that website and its documents. "
    "If the answer is not contained in the context, say you can only help with "
    "questions about this site/product and suggest contacting the team. "
    "Be concise, friendly, and never invent facts or URLs."
)

HYBRID_SYSTEM = (
    "You are a helpful assistant embedded on a specific website. "
    "Prefer the provided context to answer. If the context does not cover the "
    "question, you may answer from general knowledge, but make clear it is general "
    "information. Be concise and friendly."
)


def build_prompt(
    *,
    bot_system_prompt: str,
    answer_mode: str,
    context: str,
    history: list[tuple[str, str]],
    question: str,
) -> str:
    base = HYBRID_SYSTEM if answer_mode == "hybrid" else GROUNDED_SYSTEM
    parts = [base]
    if bot_system_prompt.strip():
        parts.append("Additional instructions from the site owner:\n" + bot_system_prompt.strip())
    parts.append("Context:\n" + (context.strip() or "(no relevant context found)"))
    if history:
        convo = "\n".join(f"{r.capitalize()}: {c}" for r, c in history[-6:])
        parts.append("Recent conversation:\n" + convo)
    parts.append(f"User question: {question}\n\nAnswer:")
    return "\n\n".join(parts)


class LLMProvider:
    def __init__(self) -> None:
        self._gemini = get_genai()
        self._model = (
            self._gemini.GenerativeModel(settings.gemini_chat_model) if self._gemini else None
        )

    @property
    def backend(self) -> str:
        return "gemini" if self._gemini else "extractive-fallback"

    def stream(self, prompt: str, *, context: str, answer_mode: str) -> Iterator[str]:
        if self._model is not None:
            produced = False
            try:
                resp = self._model.generate_content(prompt, stream=True)
                for chunk in resp:
                    if getattr(chunk, "text", None):
                        produced = True
                        yield chunk.text
                if produced:
                    return
                # Model returned no text (e.g. blocked/empty response).
                logger.warning(
                    "Gemini model %s returned no text; using fallback",
                    settings.gemini_chat_model,
                )
            except Exception:
                # Log the real reason (bad model name, quota, key scope, etc.)
                # instead of silently degrading to the extractive dump.
                logger.exception(
                    "Gemini generate_content failed for model %s; using fallback",
                    settings.gemini_chat_model,
                )
        # Offline fallback: return an extractive answer from the context.
        yield self._fallback_answer(context, answer_mode)

    def complete(self, prompt: str, *, context: str, answer_mode: str) -> str:
        return "".join(self.stream(prompt, context=context, answer_mode=answer_mode))

    @staticmethod
    def _fallback_answer(context: str, answer_mode: str) -> str:
        ctx = context.strip()
        if not ctx:
            if answer_mode == "hybrid":
                return (
                    "I don't have specific information about that yet. "
                    "Once this site's content is added, I'll be able to help."
                )
            return (
                "I can only help with questions about this site/product, and I "
                "couldn't find anything relevant. Please contact the team for more help."
            )
        snippet = ctx[:700].rsplit(".", 1)[0].strip()
        return (
            "Based on this site's content:\n\n"
            + (snippet + "." if snippet else ctx[:700])
            + "\n\n(Set GEMINI_API_KEY for fully conversational answers.)"
        )


_llm: LLMProvider | None = None


def get_llm() -> LLMProvider:
    global _llm
    if _llm is None:
        _llm = LLMProvider()
    return _llm
