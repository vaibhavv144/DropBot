from __future__ import annotations

import datetime as dt
import secrets
import uuid
from typing import Optional

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def _uuid() -> str:
    return uuid.uuid4().hex


def _public_key() -> str:
    return "pub_" + secrets.token_urlsafe(18)


def _now() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=_now)

    bots: Mapped[list["Bot"]] = relationship(back_populates="owner", cascade="all, delete-orphan")


class Bot(Base):
    __tablename__ = "bots"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    public_key: Mapped[str] = mapped_column(String(64), unique=True, index=True, default=_public_key)

    name: Mapped[str] = mapped_column(String(120), default="My Assistant")
    # Comma-separated list of domains allowed to embed this bot. "*" allows all (dev only).
    allowed_domains: Mapped[str] = mapped_column(Text, default="*")
    system_prompt: Mapped[str] = mapped_column(Text, default="")
    answer_mode: Mapped[str] = mapped_column(String(16), default="grounded")
    # Newline-separated starter prompts shown as clickable chips in the widget.
    suggested_questions: Mapped[str] = mapped_column(Text, default="")

    # Widget appearance
    theme_color: Mapped[str] = mapped_column(String(16), default="#4f46e5")
    greeting: Mapped[str] = mapped_column(Text, default="Hi! How can I help you today?")
    position: Mapped[str] = mapped_column(String(16), default="right")  # right | left
    launcher_text: Mapped[str] = mapped_column(String(60), default="Chat with us")

    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=_now)

    owner: Mapped[User] = relationship(back_populates="bots")
    sources: Mapped[list["Source"]] = relationship(back_populates="bot", cascade="all, delete-orphan")


class Source(Base):
    __tablename__ = "sources"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    bot_id: Mapped[str] = mapped_column(ForeignKey("bots.id", ondelete="CASCADE"), index=True)
    kind: Mapped[str] = mapped_column(String(16))  # url | file
    location: Mapped[str] = mapped_column(Text)  # url or original filename
    status: Mapped[str] = mapped_column(String(16), default="pending")  # pending|processing|done|error
    detail: Mapped[str] = mapped_column(Text, default="")
    pages_count: Mapped[int] = mapped_column(Integer, default=0)
    chunks_count: Mapped[int] = mapped_column(Integer, default=0)
    # Scheduled re-crawl (url sources only). 0 = off; otherwise re-sync every N hours.
    auto_sync: Mapped[int] = mapped_column(Integer, default=0)
    sync_interval_hours: Mapped[int] = mapped_column(Integer, default=24)
    last_synced_at: Mapped[Optional[dt.datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=_now)

    bot: Mapped[Bot] = relationship(back_populates="sources")
    documents: Mapped[list["Document"]] = relationship(
        back_populates="source", cascade="all, delete-orphan"
    )


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    source_id: Mapped[str] = mapped_column(ForeignKey("sources.id", ondelete="CASCADE"), index=True)
    bot_id: Mapped[str] = mapped_column(String(32), index=True)
    url: Mapped[str] = mapped_column(Text, default="")
    title: Mapped[str] = mapped_column(Text, default="")
    content_hash: Mapped[str] = mapped_column(String(64), default="")
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=_now)

    source: Mapped[Source] = relationship(back_populates="documents")
    chunks: Mapped[list["Chunk"]] = relationship(
        back_populates="document", cascade="all, delete-orphan"
    )


class Chunk(Base):
    __tablename__ = "chunks"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    document_id: Mapped[str] = mapped_column(
        ForeignKey("documents.id", ondelete="CASCADE"), index=True
    )
    bot_id: Mapped[str] = mapped_column(String(32), index=True)
    content: Mapped[str] = mapped_column(Text)
    # Embedding stored as JSON array of floats for portability (SQLite + Postgres).
    embedding: Mapped[str] = mapped_column(Text)
    token_count: Mapped[int] = mapped_column(Integer, default=0)
    source_url: Mapped[str] = mapped_column(Text, default="")
    source_title: Mapped[str] = mapped_column(Text, default="")

    document: Mapped["Document"] = relationship(back_populates="chunks")


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    bot_id: Mapped[str] = mapped_column(String(32), index=True)
    visitor_id: Mapped[str] = mapped_column(String(64), default="")
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=_now)

    messages: Mapped[list["Message"]] = relationship(
        back_populates="conversation", cascade="all, delete-orphan"
    )


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    conversation_id: Mapped[str] = mapped_column(
        ForeignKey("conversations.id", ondelete="CASCADE"), index=True
    )
    role: Mapped[str] = mapped_column(String(16))  # user | assistant
    content: Mapped[str] = mapped_column(Text)
    sources_json: Mapped[str] = mapped_column(Text, default="[]")
    # Visitor feedback on an assistant answer: 1 = up, -1 = down, 0 = none.
    rating: Mapped[int] = mapped_column(Integer, default=0)
    # True when the assistant could not ground the answer (no relevant context).
    is_fallback: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=_now)

    conversation: Mapped[Conversation] = relationship(back_populates="messages")
