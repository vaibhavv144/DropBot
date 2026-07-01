# Backend — FastAPI RAG service

## Run

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Interactive API docs: http://127.0.0.1:8000/docs

## Providers (free by default)

| Concern    | With `GEMINI_API_KEY`            | Without a key (default)                     |
| ---------- | -------------------------------- | ------------------------------------------- |
| Embeddings | Gemini `text-embedding-004`      | Deterministic feature-hashing (local)       |
| Answers    | Gemini `gemini-2.0-flash` stream | Extractive answer from retrieved context    |

This means the whole pipeline runs and is testable offline; adding a key upgrades
quality with no code changes.

## API overview

Auth (Bearer JWT for the dashboard):
- `POST /api/auth/signup` · `POST /api/auth/login` · `GET /api/auth/me`

Bots (owner-only):
- `GET/POST /api/bots` · `GET/PATCH/DELETE /api/bots/{id}`
- `GET /api/bots/{id}/conversations`

Sources / ingestion (owner-only):
- `POST /api/bots/{id}/sources/url`   — crawl a website (background job)
- `POST /api/bots/{id}/sources/file`  — upload PDF/MD/TXT/HTML (background job)
- `GET  /api/bots/{id}/sources` · `DELETE .../sources/{sid}`

Public (used by the widget; CORS-open but each bot enforces `allowed_domains`):
- `GET  /api/public/config/{bot_key}`
- `POST /api/public/chat`          — JSON response
- `POST /api/public/chat/stream`   — Server-Sent Events stream

## Pipeline

1. **Ingest:** crawl/extract → chunk (`services/chunker.py`) → embed
   (`services/embeddings.py`) → store `Chunk` rows scoped by `bot_id`.
2. **Retrieve:** embed the query, cosine-rank stored chunks (`services/retriever.py`).
3. **Answer:** build a grounded prompt (`services/llm.py`) and stream the reply.

## Postgres + pgvector (production)

```bash
docker compose -f ../infra/docker-compose.yml up -d
# in .env:
DATABASE_URL=postgresql+psycopg2://chatbot:chatbot@localhost:5432/chatbot
```

Tables are created automatically on startup.
