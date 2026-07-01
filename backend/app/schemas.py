from __future__ import annotations

import datetime as dt

from pydantic import BaseModel, EmailStr, Field


# ---------- Auth ----------
class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: str
    email: str

    class Config:
        from_attributes = True


# ---------- Bots ----------
class BotCreate(BaseModel):
    name: str = "My Assistant"
    allowed_domains: str = "*"


class BotUpdate(BaseModel):
    name: str | None = None
    allowed_domains: str | None = None
    system_prompt: str | None = None
    answer_mode: str | None = None
    theme_color: str | None = None
    greeting: str | None = None
    position: str | None = None
    launcher_text: str | None = None
    suggested_questions: str | None = None


class BotOut(BaseModel):
    id: str
    public_key: str
    name: str
    allowed_domains: str
    system_prompt: str
    answer_mode: str
    theme_color: str
    greeting: str
    position: str
    launcher_text: str
    suggested_questions: str
    created_at: dt.datetime

    class Config:
        from_attributes = True


class BotPublicConfig(BaseModel):
    public_key: str
    name: str
    theme_color: str
    greeting: str
    position: str
    launcher_text: str
    suggested_questions: list[str] = []


# ---------- Sources ----------
class SourceCreateUrl(BaseModel):
    url: str
    max_pages: int | None = None


class SourceOut(BaseModel):
    id: str
    kind: str
    location: str
    status: str
    detail: str
    pages_count: int
    chunks_count: int
    auto_sync: int
    sync_interval_hours: int
    last_synced_at: dt.datetime | None = None
    created_at: dt.datetime

    class Config:
        from_attributes = True


class SourceSyncUpdate(BaseModel):
    auto_sync: int = Field(ge=0, le=1)
    sync_interval_hours: int = Field(default=24, ge=1, le=720)


# ---------- Chat ----------
class ChatRequest(BaseModel):
    bot_key: str
    message: str
    conversation_id: str | None = None
    visitor_id: str | None = None


class SourceRef(BaseModel):
    title: str
    url: str


class ChatResponse(BaseModel):
    conversation_id: str
    message_id: str
    answer: str
    sources: list[SourceRef] = []


# ---------- Feedback ----------
class FeedbackRequest(BaseModel):
    bot_key: str
    message_id: str
    rating: int = Field(ge=-1, le=1)


# ---------- Conversations ----------
class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    rating: int = 0
    is_fallback: int = 0
    created_at: dt.datetime

    class Config:
        from_attributes = True


class ConversationOut(BaseModel):
    id: str
    visitor_id: str
    created_at: dt.datetime
    messages: list[MessageOut] = []

    class Config:
        from_attributes = True


# ---------- Analytics ----------
class DailyPoint(BaseModel):
    date: str
    conversations: int
    messages: int


class TopQuestion(BaseModel):
    question: str
    count: int


class DownvotedAnswer(BaseModel):
    question: str
    answer: str
    created_at: dt.datetime


class AnalyticsOut(BaseModel):
    days: int
    total_conversations: int
    total_messages: int
    visitor_messages: int
    answered: int
    unanswered: int
    unanswered_rate: float
    thumbs_up: int
    thumbs_down: int
    daily: list[DailyPoint] = []
    top_questions: list[TopQuestion] = []
    recent_downvoted: list[DownvotedAnswer] = []
