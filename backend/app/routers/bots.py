from __future__ import annotations

import datetime as dt
from collections import Counter

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user, get_owned_bot
from ..models import Bot, Conversation, Message, User
from ..schemas import (
    AnalyticsOut,
    BotCreate,
    BotOut,
    BotUpdate,
    ConversationOut,
    DailyPoint,
    DownvotedAnswer,
    TopQuestion,
)

router = APIRouter(prefix="/api/bots", tags=["bots"])


@router.get("", response_model=list[BotOut])
def list_bots(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.execute(select(Bot).where(Bot.owner_id == user.id)).scalars().all()


@router.post("", response_model=BotOut)
def create_bot(
    payload: BotCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    bot = Bot(owner_id=user.id, name=payload.name, allowed_domains=payload.allowed_domains)
    db.add(bot)
    db.commit()
    db.refresh(bot)
    return bot


@router.get("/{bot_id}", response_model=BotOut)
def get_bot(bot: Bot = Depends(get_owned_bot)):
    return bot


@router.patch("/{bot_id}", response_model=BotOut)
def update_bot(
    payload: BotUpdate,
    bot: Bot = Depends(get_owned_bot),
    db: Session = Depends(get_db),
):
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(bot, field, value)
    db.commit()
    db.refresh(bot)
    return bot


@router.delete("/{bot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bot(bot: Bot = Depends(get_owned_bot), db: Session = Depends(get_db)):
    db.delete(bot)
    db.commit()


@router.get("/{bot_id}/conversations", response_model=list[ConversationOut])
def list_conversations(
    bot: Bot = Depends(get_owned_bot),
    db: Session = Depends(get_db),
):
    convos = (
        db.execute(
            select(Conversation)
            .where(Conversation.bot_id == bot.id)
            .order_by(Conversation.created_at.desc())
            .limit(100)
        )
        .scalars()
        .all()
    )
    return convos


@router.get("/{bot_id}/analytics", response_model=AnalyticsOut)
def analytics(
    days: int = 30,
    bot: Bot = Depends(get_owned_bot),
    db: Session = Depends(get_db),
):
    days = max(1, min(days, 365))
    now = dt.datetime.now(dt.timezone.utc)
    # Stored timestamps are naive UTC; compare against a naive cutoff.
    since = (now - dt.timedelta(days=days)).replace(tzinfo=None)

    convos = (
        db.execute(
            select(Conversation).where(
                Conversation.bot_id == bot.id, Conversation.created_at >= since
            )
        )
        .scalars()
        .all()
    )
    msgs = (
        db.execute(
            select(Message)
            .join(Conversation, Message.conversation_id == Conversation.id)
            .where(Conversation.bot_id == bot.id, Message.created_at >= since)
            .order_by(Message.created_at)
        )
        .scalars()
        .all()
    )

    user_msgs = [m for m in msgs if m.role == "user"]
    bot_msgs = [m for m in msgs if m.role == "assistant"]
    unanswered = sum(1 for m in bot_msgs if m.is_fallback)
    answered = len(bot_msgs) - unanswered
    thumbs_up = sum(1 for m in bot_msgs if m.rating == 1)
    thumbs_down = sum(1 for m in bot_msgs if m.rating == -1)

    # Daily buckets (oldest → newest) across the whole window.
    buckets: dict[str, dict[str, int]] = {}
    for i in range(days):
        key = (since + dt.timedelta(days=i)).strftime("%Y-%m-%d")
        buckets[key] = {"conversations": 0, "messages": 0}
    for c in convos:
        key = c.created_at.strftime("%Y-%m-%d")
        if key in buckets:
            buckets[key]["conversations"] += 1
    for m in msgs:
        key = m.created_at.strftime("%Y-%m-%d")
        if key in buckets:
            buckets[key]["messages"] += 1
    daily = [
        DailyPoint(date=k, conversations=v["conversations"], messages=v["messages"])
        for k, v in buckets.items()
    ]

    # Top questions (group case-insensitively, keep a representative spelling).
    counter: Counter[str] = Counter()
    representative: dict[str, str] = {}
    for m in user_msgs:
        norm = " ".join(m.content.lower().split())
        if not norm:
            continue
        counter[norm] += 1
        representative.setdefault(norm, m.content.strip())
    top_questions = [
        TopQuestion(question=representative[norm], count=n)
        for norm, n in counter.most_common(10)
    ]

    # Recent downvoted answers, paired with the question that preceded them.
    by_convo: dict[str, list[Message]] = {}
    for m in msgs:
        by_convo.setdefault(m.conversation_id, []).append(m)
    downvoted = sorted(
        (m for m in bot_msgs if m.rating == -1),
        key=lambda m: m.created_at,
        reverse=True,
    )[:10]
    recent_downvoted: list[DownvotedAnswer] = []
    for m in downvoted:
        siblings = by_convo.get(m.conversation_id, [])
        question = ""
        for prev in siblings:
            if prev.created_at <= m.created_at and prev.role == "user":
                question = prev.content
        recent_downvoted.append(
            DownvotedAnswer(question=question, answer=m.content, created_at=m.created_at)
        )

    return AnalyticsOut(
        days=days,
        total_conversations=len(convos),
        total_messages=len(msgs),
        visitor_messages=len(user_msgs),
        answered=answered,
        unanswered=unanswered,
        unanswered_rate=round(unanswered / len(bot_msgs), 3) if bot_msgs else 0.0,
        thumbs_up=thumbs_up,
        thumbs_down=thumbs_down,
        daily=daily,
        top_questions=top_questions,
        recent_downvoted=recent_downvoted,
    )
