from __future__ import annotations

import json
import time
import uuid
from collections import defaultdict, deque
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import settings
from ..database import SessionLocal, get_db
from ..models import Bot, Conversation, Message
from ..schemas import (
    BotPublicConfig,
    ChatRequest,
    ChatResponse,
    FeedbackRequest,
    SourceRef,
)
from ..services.llm import build_prompt, get_llm
from ..services.retriever import build_context, retrieve

router = APIRouter(prefix="/api/public", tags=["public"])

# Simple in-memory rate limiter: { (bot_id, ip): deque[timestamps] }
_hits: dict[tuple[str, str], deque[float]] = defaultdict(deque)


def _rate_limited(bot_id: str, ip: str) -> bool:
    now = time.time()
    window = 60.0
    key = (bot_id, ip)
    dq = _hits[key]
    while dq and now - dq[0] > window:
        dq.popleft()
    if len(dq) >= settings.chat_rate_limit_per_min:
        return True
    dq.append(now)
    return False


def _origin_allowed(bot: Bot, request: Request) -> bool:
    allowed = [d.strip().lower() for d in (bot.allowed_domains or "").split(",") if d.strip()]
    if not allowed or "*" in allowed:
        return True
    origin = request.headers.get("origin") or request.headers.get("referer") or ""
    if not origin:
        return False
    host = urlparse(origin).netloc.lower()
    host_no_port = host.split(":")[0]
    for dom in allowed:
        dom_clean = dom.replace("https://", "").replace("http://", "").split("/")[0]
        if host == dom_clean or host_no_port == dom_clean or host_no_port.endswith("." + dom_clean):
            return True
    return False


def _get_bot(db: Session, bot_key: str) -> Bot:
    bot = db.execute(select(Bot).where(Bot.public_key == bot_key)).scalar_one_or_none()
    if bot is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Unknown bot")
    return bot


@router.get("/config/{bot_key}", response_model=BotPublicConfig)
def public_config(bot_key: str, db: Session = Depends(get_db)) -> BotPublicConfig:
    bot = _get_bot(db, bot_key)
    questions = [q.strip() for q in (bot.suggested_questions or "").splitlines() if q.strip()][:6]
    return BotPublicConfig(
        public_key=bot.public_key,
        name=bot.name,
        theme_color=bot.theme_color,
        greeting=bot.greeting,
        position=bot.position,
        launcher_text=bot.launcher_text,
        suggested_questions=questions,
    )


def _prepare(db: Session, payload: ChatRequest, request: Request):
    bot = _get_bot(db, payload.bot_key)
    if not _origin_allowed(bot, request):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This domain is not allowed to use this bot")

    ip = request.client.host if request.client else "unknown"
    if _rate_limited(bot.id, ip):
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Too many requests, slow down")

    # Resolve / create conversation
    convo = None
    if payload.conversation_id:
        convo = db.get(Conversation, payload.conversation_id)
        if convo and convo.bot_id != bot.id:
            convo = None
    if convo is None:
        convo = Conversation(bot_id=bot.id, visitor_id=payload.visitor_id or "")
        db.add(convo)
        db.commit()
        db.refresh(convo)

    history = [
        (m.role, m.content)
        for m in db.execute(
            select(Message)
            .where(Message.conversation_id == convo.id)
            .order_by(Message.created_at)
        ).scalars().all()
    ]

    chunks = retrieve(db, bot.id, payload.message)
    context = build_context(chunks)
    # No relevant context retrieved → the answer can't be grounded. We track this
    # so the dashboard can report an "unanswered" rate.
    no_context = not chunks or not context.strip()
    prompt = build_prompt(
        bot_system_prompt=bot.system_prompt,
        answer_mode=bot.answer_mode,
        context=context,
        history=history,
        question=payload.message,
    )
    seen = {}
    for c in chunks:
        if c.url and c.url not in seen:
            seen[c.url] = c.title or c.url
    sources = [SourceRef(title=t, url=u) for u, t in seen.items()]

    # Persist the user message now
    db.add(Message(conversation_id=convo.id, role="user", content=payload.message))
    db.commit()
    return bot, convo, context, prompt, sources, no_context


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, request: Request, db: Session = Depends(get_db)) -> ChatResponse:
    bot, convo, context, prompt, sources, no_context = _prepare(db, payload, request)
    answer = get_llm().complete(prompt, context=context, answer_mode=bot.answer_mode)
    msg = Message(
        conversation_id=convo.id,
        role="assistant",
        content=answer,
        sources_json=json.dumps([s.model_dump() for s in sources]),
        is_fallback=1 if no_context else 0,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return ChatResponse(
        conversation_id=convo.id, message_id=msg.id, answer=answer, sources=sources
    )


@router.post("/chat/stream")
def chat_stream(payload: ChatRequest, request: Request, db: Session = Depends(get_db)):
    bot, convo, context, prompt, sources, no_context = _prepare(db, payload, request)
    # Capture plain values; the request session is closed before the generator runs.
    conversation_id = convo.id
    answer_mode = bot.answer_mode
    sources_payload = [s.model_dump() for s in sources]
    # Pre-generate the assistant message id so the widget can attach feedback to it.
    message_id = uuid.uuid4().hex

    def event_gen():
        yield f"event: meta\ndata: {json.dumps({'conversation_id': conversation_id, 'message_id': message_id})}\n\n"
        collected: list[str] = []
        for token in get_llm().stream(prompt, context=context, answer_mode=answer_mode):
            collected.append(token)
            yield f"event: token\ndata: {json.dumps({'t': token})}\n\n"
        answer = "".join(collected)
        # Persist with a fresh session (the request-scoped one is gone).
        write_db = SessionLocal()
        try:
            write_db.add(
                Message(
                    id=message_id,
                    conversation_id=conversation_id,
                    role="assistant",
                    content=answer,
                    sources_json=json.dumps(sources_payload),
                    is_fallback=1 if no_context else 0,
                )
            )
            write_db.commit()
        finally:
            write_db.close()
        yield f"event: sources\ndata: {json.dumps(sources_payload)}\n\n"
        yield "event: done\ndata: {}\n\n"

    return StreamingResponse(event_gen(), media_type="text/event-stream")


@router.post("/feedback", status_code=status.HTTP_204_NO_CONTENT)
def feedback(payload: FeedbackRequest, db: Session = Depends(get_db)):
    """Record a visitor's thumbs up/down on an assistant answer."""
    bot = _get_bot(db, payload.bot_key)
    msg = db.get(Message, payload.message_id)
    if msg is None or msg.role != "assistant":
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Message not found")
    convo = db.get(Conversation, msg.conversation_id)
    if convo is None or convo.bot_id != bot.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Message not found")
    msg.rating = payload.rating
    db.commit()
