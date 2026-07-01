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

## 1. Backend on Render

1. Go to **render.com** → **New +** → **Blueprint**.
2. Connect your GitHub repo. Render detects **`render.yaml`** and shows a service
   `dropbot-api` + a free Postgres `dropbot-db`. Click **Apply**.
   - `DATABASE_URL` is wired automatically from the database.
   - `SECRET_KEY` is auto-generated.
3. Add your LLM key: open the **dropbot-api** service → **Environment** →
   add `GEMINI_API_KEY` = *your key from https://aistudio.google.com/app/apikey*.
   (Skip this to run with the offline fallback.)
4. Wait for the deploy to go green, then copy the service URL, e.g.
   **`https://dropbot-api.onrender.com`**.
5. Verify:
   - `https://dropbot-api.onrender.com/api/health` → JSON `{"status":"ok", ...}`
   - `https://dropbot-api.onrender.com/embed.js` → the widget JavaScript

> ⏳ Render's free tier sleeps after inactivity, so the first request after idle
> takes ~30–60s to wake. Fine for testing.

---

## 2. Dashboard on Vercel

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

## 3. Try the full flow

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

- **Free Postgres expires** after ~90 days on Render's free plan. Upgrade or
  recreate for anything long-lived.
- **Redeploys:** push to `main` → both Render and Vercel auto-redeploy.
- **Rate limiting & scheduler** run in-process on the single Render instance —
  fine for one instance. If you scale to multiple, move them to Redis.
- **Custom domain later:** point DNS at Vercel (dashboard) and Render (api), then
  update the two `NEXT_PUBLIC_*` env vars in Vercel to the new api host.
