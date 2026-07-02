# Deploying DropBot

Two deployments:

1. **Backend** → Render (FastAPI + Postgres). Also serves the widget at `/embed.js`.
2. **Dashboard** → Vercel (Next.js).

There's a chicken-and-egg with URLs, so the order below is deliberate: deploy the
backend first, grab its URL, then deploy the dashboard pointing at it.

---

## 0. Push the code to GitHub

You create an empty repo on github.com (no README/gitignore — this repo has them),
then from the project root:

```bash
git remote add origin https://github.com/<you>/<repo>.git
git branch -M main
git push -u origin main
```

(The repo is already `git init`'d and committed for you.)

> ✅ Secrets are safe: `.gitignore` excludes `backend/.env`, the SQLite db, and
> `.env.local`. Only `*.example` env files are committed.

---

## 1. Database on Supabase (free, permanent Postgres)

1. Go to **supabase.com** → sign in → **New project**.
2. Pick a name, a **region close to your Render region**, and set a **database
   password** (save it somewhere — you'll need it in a moment).
3. Wait ~1 minute for it to provision.
4. Get the connection string: top bar **Connect** (or **Project Settings →
   Database → Connection string**) → choose **Session pooler** → copy the **URI**.
   It looks like:
   ```
   postgresql://postgres.abcxyz:[YOUR-PASSWORD]@aws-0-xx.pooler.supabase.com:5432/postgres
   ```
   Replace `[YOUR-PASSWORD]` with the password from step 2.

> Use the **Session pooler** string (works cleanly with SQLAlchemy). No need to
> enable any extensions — embeddings are stored as JSON, so it works out of the box.

## 2. Backend on Render

1. Go to **render.com** → **New +** → **Blueprint**.
2. Connect your GitHub repo. Render detects **`render.yaml`** and shows the
   `dropbot-api` service. Click **Apply**.
   - `SECRET_KEY` is auto-generated.
3. Open the **dropbot-api** service → **Environment** and add:
   - `DATABASE_URL` = your Supabase Session-pooler URI from step 1
   - `GEMINI_API_KEY` = *your key from https://aistudio.google.com/app/apikey*
     (skip to run with the offline fallback)
4. Wait for the deploy to go green, then copy the service URL, e.g.
   **`https://dropbot-api.onrender.com`**. On first boot the backend creates all
   its tables in your Supabase database automatically.
5. Verify:
   - `https://dropbot-api.onrender.com/api/health` → JSON `{"status":"ok", ...}`
   - `https://dropbot-api.onrender.com/embed.js` → the widget JavaScript

> ⏳ Render's free tier sleeps after inactivity, so the first request after idle
> takes ~30–60s to wake. Fine for testing.

---

## 3. Dashboard on Vercel

1. Go to **vercel.com** → **Add New… → Project** → import the same repo.
2. **Root Directory:** set to **`dashboard`** (important — the repo has multiple apps).
   Framework preset auto-detects **Next.js**.
3. Add **Environment Variables** (use your real Render URL from step 1):

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_API_BASE` | `https://dropbot-api.onrender.com` |
   | `NEXT_PUBLIC_WIDGET_SRC` | `https://dropbot-api.onrender.com/embed.js` |

4. **Deploy.** You'll get a URL like **`https://dropbot.vercel.app`**.

That's it — CORS on the backend is already open (`*`) and auth uses a Bearer
token (no cookies), so the dashboard talks to the API cross-origin with no extra
config.

---

## 4. Try the full flow

1. Open your Vercel dashboard URL → sign up → create a bot (or use Guided setup).
2. Add a website URL or upload a doc; wait for it to finish indexing.
3. In **Appearance → Allowed domains**, add the domain of the site you'll embed
   on (or `*` while testing).
4. **Embed tab** → copy the snippet. It now points at your real hosts:
   ```html
   <script src="https://dropbot-api.onrender.com/embed.js"
           data-bot-id="pub_xxx"
           data-api="https://dropbot-api.onrender.com" defer></script>
   ```
5. Paste it into any website's HTML before `</body>`. The bubble appears and answers.

---

## Notes / gotchas

- **Supabase free tier pauses** the database after ~1 week of inactivity — just
  click **Restore** in the Supabase dashboard to wake it. It does not expire/delete.
- **Redeploys:** push to `main` → both Render and Vercel auto-redeploy.
- **Rate limiting & scheduler** run in-process on the single Render instance —
  fine for one instance. If you scale to multiple, move them to Redis.
- **Custom domain later:** point DNS at Vercel (dashboard) and Render (api), then
  update the two `NEXT_PUBLIC_*` env vars in Vercel to the new api host.
