# Embeddable RAG Chatbot

A multi-tenant chatbot that any website can embed with a single `<script>` tag. It
learns a site's content (by crawling URLs and/or uploading documents), stores it in a
RAG knowledge base, and answers visitor questions grounded in that content.

Built to run **for free**: Google Gemini (free tier) for the LLM + embeddings, and a
zero-setup local fallback so the whole stack runs offline with no API keys.

```
┌────────────┐   embed.js (Shadow DOM)   ┌──────────────┐
│  Visitor   │ ────────────────────────▶ │   Widget     │
└────────────┘                            └──────┬───────┘
                                                 │ /api/public/chat
┌────────────┐   dashboard (Next.js)     ┌───────▼───────┐   Gemini
│ Site owner │ ────────────────────────▶ │   FastAPI     │ ─────────▶ answer
└────────────┘  create bot, add sources  │   backend     │
                                          └───────┬───────┘
                                                  │ pgvector / SQLite
                                          ┌───────▼───────┐
                                          │  Knowledge DB │
                                          └───────────────┘
```

## About this project

This is a **"chatbot-as-a-service" platform**, similar in spirit to Intercom, Crisp, or
Chatbase. A business owner signs up, points the product at their website (and/or uploads
documents), and gets an AI assistant that can be embedded on any site with one line of
code. The assistant answers visitor questions using **Retrieval-Augmented Generation
(RAG)** — it only speaks from the knowledge it has been given, which keeps answers
accurate and on-brand instead of hallucinating.

### Key features

- **One-line, drop-in embed.** Add a single `<script>` tag — no framework, no build step,
  works on any website (WordPress, Shopify, plain HTML, React, etc.).
- **No CSS conflicts.** The widget renders inside a Shadow DOM, so it never breaks the host
  site's styles and the host's styles never break the widget.
- **Understands the website automatically.** Crawls the owner's URL/sitemap and indexes the
  content; owners can also upload PDFs, Markdown, TXT, and HTML to extend the knowledge base.
- **Grounded RAG answers with citations.** Replies are based on the indexed content and
  include the source pages they came from.
- **Fully customizable.** Color, greeting, launcher text, position, persona/system prompt,
  and grounded-vs-hybrid answer mode — all from the dashboard, no redeploy needed.
- **Multi-tenant + secure.** Each bot is isolated, enforces an allowed-domains list, and is
  rate-limited per visitor.
- **Streaming responses.** Answers stream token-by-token for a fast, "live typing" feel.
- **Runs for free.** Google Gemini free tier for the LLM + embeddings, with a zero-key local
  fallback so the whole stack works offline during development.

### Tech stack

| Layer        | Technology                                                            |
| ------------ | --------------------------------------------------------------------- |
| Backend/RAG  | Python, FastAPI, SQLAlchemy, BeautifulSoup, pypdf, NumPy              |
| LLM / Embed. | Google Gemini (`gemini-2.0-flash`, `text-embedding-004`) + local fallback |
| Vector store | pgvector / Postgres in production, SQLite + cosine search for dev      |
| Widget       | Vanilla JS in a Shadow DOM (zero dependencies)                        |
| Dashboard    | Next.js (App Router), Tailwind CSS, shadcn-style UI, lucide icons      |
| Infra        | Docker Compose (Postgres + pgvector)                                  |

### Who it's for / use cases

- SaaS & startups — instant support + onboarding assistant trained on the docs.
- E-commerce — product questions, shipping/returns policy, order help.
- Documentation & knowledge bases — "ask the docs" search.
- Agencies — deploy a branded assistant for each client site from one dashboard.

### Roadmap ideas

- Native pgvector similarity query for large corpora
- Incremental re-crawl / scheduled sync and content-change detection
- Human handoff / live-agent escalation and lead capture
- Analytics dashboard (top questions, unanswered queries, CSAT)
- Multi-language support and per-bot usage quotas / billing

## Repository layout

| Path         | What it is                                                            |
| ------------ | --------------------------------------------------------------------- |
| `backend/`   | FastAPI app: auth, bots, ingestion (crawl + upload), RAG chat, streaming |
| `widget/`    | `embed.js` — the drop-in Shadow-DOM chat widget + a demo page          |
| `dashboard/` | Next.js app: **public landing page** (`/`) + owner console (`/dashboard`) |
| `infra/`     | `docker-compose.yml` for Postgres + pgvector (production)              |

## Quick start (3 terminals)

### 1. Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # optional: add GEMINI_API_KEY for real answers
uvicorn app.main:app --reload --port 8000
```

Backend runs at http://127.0.0.1:8000 (docs at `/docs`). With no `GEMINI_API_KEY`,
it uses a local hashing embedder + extractive answers so you can test end-to-end
offline. Add a free key from https://aistudio.google.com/app/apikey to enable real
conversational answers.

### 2. Dashboard

```bash
cd dashboard
npm install
cp .env.local.example .env.local
npm run dev          # http://localhost:3000
```

> macOS note: if `npm run dev` logs `EMFILE: too many open files`, raise the file
> limit first: `ulimit -n 4096 && npm run dev`. Alternatively use `npm run build && npm run start`.

Sign up, create a bot, add a website URL or upload a file, then open the **Embed** tab
to copy your script snippet.

### 3. Widget demo

```bash
cd widget
npm run serve        # serves the folder at http://localhost:5173
```

Open `http://localhost:5173/demo/` — paste your bot's `public_key` into
`demo/index.html` first (the `data-bot-id` attribute).

## How integration works

A website owner just drops this in their HTML:

```html
<script src="https://cdn.yourbot.com/embed.js"
        data-bot-id="pub_xxx"
        data-api="https://your-backend.com" defer></script>
```

The script:
1. Reads its own `data-bot-id` and fetches the bot's public config (color, greeting, etc.).
2. Mounts a floating launcher + chat panel inside a **Shadow DOM** so the host site's
   CSS never clashes with the widget (and vice-versa).
3. Streams answers from `POST /api/public/chat/stream`.

## Production notes

- **Database / vectors:** switch `DATABASE_URL` to Postgres and run
  `docker compose -f infra/docker-compose.yml up -d` (image includes pgvector).
  Embeddings are stored as JSON for portability; for large corpora, migrate the
  retriever to a native `pgvector` similarity query.
- **LLM:** set `GEMINI_API_KEY`. Free tier has rate limits — the backend already
  enforces per-bot rate limiting and degrades gracefully.
- **Security:** each bot has an `allowed_domains` list enforced on every chat request
  (via `Origin`/`Referer`), plus per-IP rate limiting.

## Marketing website — what to put on the landing page

This is the public-facing site used to *sell* the product (separate from the owner
dashboard). Below is a recommended page structure and the assets/copy you'll need to add.

### Page sections (top to bottom)

1. **Navbar** — logo, links (Features, How it works, Pricing, Docs), and two CTAs:
   `Log in` and a prominent `Get started free`.
2. **Hero** — one-line value proposition + sub-headline + primary CTA + a live demo.
   - Headline example: "Add an AI chatbot to your website in 60 seconds."
   - Sub-headline: "It reads your site, answers customer questions 24/7, and installs
     with one line of code. No coding required."
   - Show the actual widget running on the page itself (best demo = the product live).
3. **Social proof** — logos of companies using it, star ratings, or user counts
   ("Trusted by 1,000+ websites"). Use placeholders until you have real ones.
4. **How it works (3 steps)** — with icons/screenshots:
   1. Connect your website (paste a URL or upload docs).
   2. Customize the look (color, greeting, persona).
   3. Copy one line of code and paste it on your site.
5. **Features grid** — 6 cards pulled from the "Key features" list above
   (drop-in embed, RAG accuracy, customization, no CSS conflicts, multi-language, security).
6. **Live demo / interactive section** — let visitors type a question and see a real answer,
   or embed a short product video/GIF.
7. **Integration snippet** — show the actual code so it feels effortless:
   ```html
   <script src="https://cdn.yourbot.com/embed.js" data-bot-id="pub_xxx" defer></script>
   ```
8. **Use cases** — tabs or cards for SaaS, E-commerce, Docs, Agencies (from the list above).
9. **Pricing** — a 3-tier table (e.g. Free / Pro / Business) with message limits, number of
   bots, and features per tier. Highlight the recommended plan.
10. **FAQ** — accordion: "Is it free?", "Will it slow my site down?", "How does it learn my
    content?", "Is my data secure?", "Which platforms are supported?", "Can I remove the
    branding?".
11. **Final CTA banner** — "Ready to add AI to your website?" + `Get started free` button.
12. **Footer** — product links, legal (Privacy Policy, Terms, GDPR), social, contact email.

### Copy / brand assets to prepare

- Product name, logo (SVG), favicon, and a brand color palette.
- A 30–60s demo video or animated GIF of creating a bot and chatting.
- 3–5 screenshots: dashboard, customization panel, widget on a real site.
- Value proposition, 6 feature blurbs, 3 customer testimonials/quotes.
- Pricing tiers and limits; SEO meta title/description + Open Graph share image.

### Trust & legal (needed before launch)

- Privacy Policy and Terms of Service (you process customer site content + visitor chats).
- Cookie/consent notice and a data-handling/GDPR statement.
- A "Powered by" link in the widget (already present) — make it removable on paid tiers.

### Suggested tech for the marketing site

The marketing site can be a separate page in the existing `dashboard/` Next.js app (e.g. a
public `app/(marketing)/page.tsx` landing route) reusing the Tailwind + shadcn components,
or a standalone static site. Keep the `Get started free` button linked to `/login`.

See [backend/README.md](backend/README.md) for API details.
