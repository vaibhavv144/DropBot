from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from .config import settings
from .database import init_db
from .routers import auth, bots, public, sources
from .services.embeddings import get_embedder
from .services.llm import get_llm
from .services.scheduler import start_scheduler, stop_scheduler

# The widget loader lives in the repo's widget/ folder (sibling of backend/).
# Serving it from the API means one deployment and no cross-origin/mixed-content
# headaches — customers point their <script src> at https://<api-host>/embed.js.
_WIDGET_FILE = Path(__file__).resolve().parents[2] / "widget" / "embed.js"


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    start_scheduler()
    try:
        yield
    finally:
        await stop_scheduler()


app = FastAPI(title="Embeddable RAG Chatbot API", version="0.1.0", lifespan=lifespan)

# Dashboard endpoints are restricted to configured origins.
# The public chat endpoints are open here (CORS-wise) but each bot enforces its
# own allowed_domains list at the application layer.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(bots.router)
app.include_router(sources.router)
app.include_router(public.router)


@app.get("/embed.js")
def embed_js():
    """Serve the drop-in widget loader. This is the single file every customer's
    <script src> points at; only their data-bot-id attribute differs."""
    return FileResponse(
        _WIDGET_FILE,
        media_type="application/javascript",
        headers={"Cache-Control": "public, max-age=300"},
    )


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "llm_backend": get_llm().backend,
        "embedding_backend": get_embedder().backend,
        "answer_mode_default": settings.answer_mode,
    }
