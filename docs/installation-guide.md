# DropBot Installation Guide

**Add the DropBot chat widget to your website in a few minutes.**

This guide explains exactly where to paste your embed code, step by step, for the most common website builders and tech stacks. No coding experience required for most platforms.

> **Using this guide in Notion?** Markdown anchor links (like `#get-your-embed-code`) do **not** work after import. For clickable navigation, delete the table of contents below and type **`/table of contents`** on this page — Notion will add a live, clickable index of all headings automatically.

---

## Table of contents

1. Before you start
2. Get your embed code
3. General rules (read this first)
4. Website builders (no code)
   - WordPress
   - Shopify
   - Wix
   - Squarespace
   - Webflow
   - Google Sites
   - Weebly
   - Blogger
   - Carrd
   - Framer
   - BigCommerce
   - Ghost
5. Custom / developer-built websites
   - Plain HTML website
   - React (Create React App, Vite)
   - Next.js
   - Vue.js / Nuxt
   - Angular
   - Gatsby / Astro / Hugo (static sites)
   - PHP / Laravel / WordPress theme (manual)
   - Joomla
   - Drupal
   - HubSpot CMS
6. Don't know your platform?
7. Send this to your developer
8. Verify the installation
9. Troubleshooting
10. Need help?

---

## Before you start

Make sure you have completed these steps in your **DropBot dashboard** before installing the widget on your site:

| Step | Where in dashboard | What to do |
|------|-------------------|------------|
| 1 | **Knowledge** tab | Add your website URL or upload documents so the bot can answer questions |
| 2 | **Appearance** tab | Set your colors, greeting, and bot name |
| 3 | **Appearance → Allowed domains** | Enter your live website domain (e.g. `yourbusiness.com`). Add `www.yourbusiness.com` too if your site uses `www` |
| 4 | **Embed** tab | Copy your personal embed code (one line starting with `<script`) |

> **Important:** If **Allowed domains** does not match your live website address, the chat widget may appear but **will not answer messages**. Always save your real domain before going live.

---

## Get your embed code

1. Log in to your DropBot dashboard.
2. Open your bot.
3. Click the **Embed** tab.
4. Click **Copy** to copy your embed code.

Your code will look like this (your `data-bot-id` will be unique):

```html
<script src="https://cdn.yourbot.com/embed.js" data-bot-id="pub_xxxxxxxx" data-api="https://api.yourbot.com" defer></script>
```

Keep this code in your clipboard — you will paste it in the steps below.

---

## General rules (read this first)

These rules apply to **every** platform:

1. **Paste the entire line** — do not break it into multiple lines unless your platform requires it.
2. **Do not edit** the `data-bot-id` or `data-api` values unless DropBot support asks you to.
3. **Place it on every page** where you want the chat bubble to appear. Most platforms have a "site-wide" or "all pages" option — use that.
4. **Preferred location:** just before the closing `</body>` tag, or in a "Footer code" / "Before `</body>`" section in your site settings.
5. **Publish / save / clear cache** after pasting. On some platforms you must click **Publish** or **Update** for changes to go live.
6. **One bot = one embed code.** If you manage multiple websites, create a separate bot for each site in DropBot.

---

## Website builders (no code)

These platforms are designed for business owners who don't write code. Follow the section that matches your website.

---

### WordPress

WordPress is the most common platform for business websites. There are two easy methods.

#### Method A — Plugin (recommended, safest)

Use a plugin so you never touch theme files directly.

1. In WordPress admin, go to **Plugins → Add New**.
2. Search for one of these (any works):
   - **WPCode** (recommended)
   - **Insert Headers and Footers**
   - **Header Footer Code Manager**
3. Install and **Activate** the plugin.
4. Open the plugin settings:
   - **WPCode:** **Code Snippets → Add Snippet → Add Your Custom Code → HTML Snippet**
   - **Insert Headers and Footers:** **Settings → Insert Headers and Footers**
5. Paste your DropBot embed code into the **Footer** or **Body (footer)** field — **not** the header.
6. Set the snippet to run on **Site Wide** / **Everywhere**.
7. **Save** and visit your live website.

#### Method B — Theme editor (advanced)

Only use this if you cannot install a plugin.

1. Go to **Appearance → Theme File Editor**.
2. Select your active theme.
3. Open **`footer.php`** (or **`theme footer`** in block themes).
4. Find the line `</body>` near the bottom.
5. Paste your embed code **immediately above** `</body>`.
6. Click **Update File**.
7. Visit your live site to confirm the chat bubble appears.

> **Tip:** If you use a page builder (Elementor, Divi, Beaver Builder), still use Method A. Page builders often don't support site-wide footer scripts on their own.

---

### Shopify

1. Log in to **Shopify Admin**.
2. Go to **Online Store → Themes**.
3. Click **⋯ (Actions) → Edit code** on your current theme.
4. In the left sidebar, open **`Layout → theme.liquid`**.
5. Scroll to the very bottom and find `</body>`.
6. Paste your DropBot embed code **directly above** `</body>`.
7. Click **Save**.
8. Open your storefront in a new tab and check for the chat bubble.

**Alternative (Shopify Online Store 2.0):**

1. Go to **Online Store → Themes → Customize**.
2. Some themes support **App embeds** or custom liquid blocks — if available, add a **Custom Liquid** block in the footer and paste the script there.
3. **Save** and **Publish**.

---

### Wix

1. Open your site in the **Wix Editor**.
2. Click **Settings** (gear icon) in the left panel.
3. Go to **Custom Code** (under Advanced / Website settings depending on your Wix version).
4. Click **+ Add Custom Code**.
5. Paste your DropBot embed code.
6. Set placement to **Body - end** (loads before `</body>` closes).
7. Set **Apply to:** **All pages**.
8. Click **Apply** → **Publish** your site.

---

### Squarespace

1. Log in to **Squarespace**.
2. Go to **Settings → Advanced → Code Injection**.
3. Paste your DropBot embed code into the **Footer** box (not Header).
4. Click **Save**.
5. If your site is not live yet, click **Publish**.
6. Visit your domain and look for the chat launcher in the bottom corner.

> **Note:** Code Injection is available on Squarespace **Business** and **Commerce** plans. Personal plans may not support custom code.

---

### Webflow

1. Open your **Webflow project**.
2. Click the **gear icon (Project Settings)**.
3. Go to the **Custom Code** tab.
4. Paste your DropBot embed code into **Footer Code**.
5. Click **Save Changes**.
6. **Publish** your site to your custom domain (the widget won't show on the `webflow.io` preview URL until published, depending on settings).

---

### Google Sites

Google Sites has limited custom code support.

1. Open your Google Site in edit mode.
2. Click **Insert → Embed**.
3. Choose **Embed code** (not URL).
4. Paste your DropBot embed code.
5. Click **Insert** and position the embed (often in the footer area).
6. **Publish** the site.

> **Limitation:** Google Sites may not run scripts on all page types the same way a full website does. If the widget does not appear, you may need a different hosting platform or a Google Sites workaround via an iframe (contact DropBot support).

---

### Weebly

1. In the Weebly editor, go to **Settings → SEO**.
2. Find **Footer Code** (or **Header Code** if Footer is not available — Footer is preferred).
3. Paste your DropBot embed code.
4. **Save** and **Publish**.

---

### Blogger

1. Go to **Blogger dashboard → Theme**.
2. Click **⋮ → Edit HTML**.
3. Find `</body>` near the bottom.
4. Paste your embed code **above** `</body>`.
5. **Save theme**.

---

### Carrd

1. Open your Carrd site editor.
2. Add an element: **+ → Embed → Code**.
3. Paste your DropBot embed code.
4. Set the embed to appear on **All Pages** (Site Settings → Pages).
5. **Publish** the site.

For Carrd Pro, you can also use **Site Settings → Scripts → Footer** if available on your plan.

---

### Framer

1. Open your Framer project.
2. Go to **Site Settings → General → Custom Code**.
3. Paste your embed code in **End of `<body>` tag** (footer).
4. **Publish** your site.

---

### BigCommerce

1. Go to **Storefront → Script Manager** (or **Storefront → Themes → Edit Theme Files**).
2. **Script Manager (easier):**
   - Click **Create a Script**.
   - Name: `DropBot Chat`.
   - Location: **Footer**.
   - Pages: **All pages**.
   - Script type: **Script tag** — paste your full embed code.
   - **Save**.
3. Visit your storefront to verify.

---

### Ghost

1. Log in to **Ghost Admin**.
2. Go to **Settings → Code injection**.
3. Paste your embed code into **Site Footer**.
4. **Save**.
5. Visit your published site.

---

## Custom / developer-built websites

Use this section if your site was built by a developer or uses a JavaScript framework.

---

### Plain HTML website

1. Open your site's main HTML file(s) — usually `index.html`, or a shared template like `footer.html`.
2. Find `</body>` at the bottom of the file.
3. Paste your embed code **immediately above** `</body>`:

```html
  <!-- DropBot chat widget -->
  <script src="https://cdn.yourbot.com/embed.js" data-bot-id="pub_xxxxxxxx" data-api="https://api.yourbot.com" defer></script>
</body>
</html>
```

4. Upload the updated file to your web host (FTP, cPanel, Netlify, etc.).
5. Hard-refresh your browser (`Ctrl+Shift+R` or `Cmd+Shift+R`).

---

### React (Create React App, Vite)

Give this to your developer, or if you edit code yourself:

**Option 1 — `public/index.html` (simplest)**

1. Open `public/index.html`.
2. Paste the script before `</body>`.
3. Rebuild and redeploy.

**Option 2 — Load in `App` or layout component**

In your root layout or `App.tsx`:

```jsx
import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.yourbot.com/embed.js";
    script.setAttribute("data-bot-id", "pub_xxxxxxxx");
    script.setAttribute("data-api", "https://api.yourbot.com");
    script.defer = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (/* your app */);
}
```

Replace `pub_xxxxxxxx` and the API URL with your values from the Embed tab.

---

### Next.js

**Option 1 — App Router (`app/layout.tsx`)**

Add a client component or use `next/script`:

```tsx
import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="https://cdn.yourbot.com/embed.js"
          data-bot-id="pub_xxxxxxxx"
          data-api="https://api.yourbot.com"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
```

**Option 2 — Pages Router (`pages/_document.tsx`)**

Paste the script inside `<body>` before `</body>` in your custom Document.

---

### Vue.js / Nuxt

**Vue 3 (`App.vue` or main layout):**

```javascript
onMounted(() => {
  const script = document.createElement("script");
  script.src = "https://cdn.yourbot.com/embed.js";
  script.setAttribute("data-bot-id", "pub_xxxxxxxx");
  script.setAttribute("data-api", "https://api.yourbot.com");
  script.defer = true;
  document.body.appendChild(script);
});
```

**Nuxt 3 (`app.vue` or a plugin):**

Use `useHead` with a script tag, or create a client-only plugin that appends the script on mount.

---

### Angular

In `src/index.html`, paste before `</body>`:

```html
<script src="https://cdn.yourbot.com/embed.js" data-bot-id="pub_xxxxxxxx" data-api="https://api.yourbot.com" defer></script>
```

Or inject via `APP_INITIALIZER` / a root component `ngAfterViewInit` if you need dynamic loading.

---

### Gatsby / Astro / Hugo (static sites)

| Framework | Where to paste |
|-----------|----------------|
| **Gatsby** | `src/html.js` (custom HTML shell) or `gatsby-ssr.js` / `gatsby-browser.js` via `setPostBodyComponents` |
| **Astro** | Base layout file (e.g. `src/layouts/BaseLayout.astro`) before `</body>` |
| **Hugo** | `layouts/_default/baseof.html` before `</body>` |
| **Jekyll** | `_includes/footer.html` or `_layouts/default.html` |

After editing, rebuild the site and redeploy.

---

### PHP / Laravel / WordPress theme (manual)

**Laravel (Blade layout):**

Open `resources/views/layouts/app.blade.php` (or your main layout) and add before `</body>`:

```blade
<script src="https://cdn.yourbot.com/embed.js" data-bot-id="pub_xxxxxxxx" data-api="https://api.yourbot.com" defer></script>
```

**Plain PHP:**

Include the script in your shared footer file (e.g. `footer.php`) that every page loads.

---

### Joomla

1. **System → Site Templates → Your template → index.php** (or use a plugin like **Custom HTML Module**).
2. Paste the script before `</body>`, or create a **Custom HTML** module assigned to the **footer** position on all pages.
3. **Save** and clear Joomla cache (**System → Clear Cache**).

---

### Drupal

1. **Configuration → Development → Performance → Clear all caches** (do this after install too).
2. Add the script via your theme's `html.html.twig` before `</body>`, or use the **Google Tag** module / a custom block in the footer region.

---

### HubSpot CMS

1. **Settings → Website → Pages → Templates** — edit your base template, or
2. **Settings → Tracking Code → Site Footer HTML** (if available on your plan).
3. Paste your embed code in the **footer** section.
4. **Publish** affected pages.

---

## Don't know your platform?

Try this decision tree:

| If your site URL or admin looks like… | You probably use… |
|---------------------------------------|-------------------|
| `yoursite.wordpress.com` or `/wp-admin` | WordPress |
| `admin.shopify.com` | Shopify |
| `editor.wix.com` | Wix |
| `squarespace.com/config` | Squarespace |
| `webflow.com/dashboard` | Webflow |
| You paid a developer and log into cPanel/FTP | Plain HTML or custom code |
| You edit files in GitHub / VS Code | See **Custom / developer-built websites** (section 5 above) |

Still unsure? Skip to **Send this to your developer** (section 7) and forward the email template below.

---

## Send this to your developer

Copy and send this message to whoever manages your website:

---

**Subject:** Please install DropBot chat widget on our website

Hi,

Please add our DropBot AI chat widget to our website on all public pages.

**Embed code** (paste before `</body>` or in site-wide footer scripts):

```
[PASTE YOUR FULL EMBED CODE FROM DROPBOT DASHBOARD HERE]
```

**Requirements:**
- Script must load on all customer-facing pages (homepage, product pages, contact, etc.).
- Do not modify `data-bot-id` or `data-api`.
- Our DropBot **Allowed domains** must include: `[yourbusiness.com]` (and `www.yourbusiness.com` if we use www).

Please confirm once it's live so we can test the chat bubble.

Thanks!

---

## Verify the installation

After pasting and publishing, check these items:

- [ ] Visit your **live** website (not just the editor preview).
- [ ] A chat bubble / launcher appears in the bottom-left or bottom-right corner.
- [ ] Click it — the chat panel opens with your custom greeting.
- [ ] Send a test question about your business (e.g. "What are your opening hours?").
- [ ] You receive an answer (not an error message).
- [ ] Test on mobile as well as desktop.

If the bubble appears but messages fail, go to **Appearance → Allowed domains** in DropBot and make sure your exact domain is listed.

---

## Troubleshooting

### Chat bubble does not appear

| Possible cause | What to do |
|----------------|------------|
| Code not published | Click **Publish** / **Update** on your platform |
| Code in wrong place | Move to **Footer** / **Body end** / before `</body>` |
| Browser cache | Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac) |
| Ad blocker | Disable ad blockers and test again |
| Preview vs live URL | Test on your real domain, not editor preview |
| Plan limits | Squarespace Personal and some free plans block custom code |

### Bubble appears but chat does not respond

| Possible cause | What to do |
|----------------|------------|
| Wrong **Allowed domains** | In DropBot dashboard → **Appearance**, set domain to your live site (e.g. `yourbusiness.com`) |
| Missing `www` | Add both `yourbusiness.com` and `www.yourbusiness.com` |
| Knowledge not indexed | **Knowledge** tab — ensure crawl finished (status: ready) |
| Typo in embed code | Re-copy from **Embed** tab; don't edit the script manually |

### Widget looks wrong or overlaps content

- Change **Position** (left/right) in DropBot **Appearance** tab.
- The widget uses an isolated layer and should not break your site design. If it overlaps important buttons, adjust position or contact support.

### I pasted the code but nothing changed

1. Confirm you edited the **active/live theme**, not a draft or inactive theme.
2. Clear your platform cache (WordPress cache plugins, Shopify, Cloudflare, etc.).
3. Wait 2–5 minutes — some CDNs take a moment to update.

---

## Need help?

If you're stuck after following this guide:

1. Note which platform you use (WordPress, Shopify, etc.).
2. Share your website URL.
3. Confirm whether the chat **bubble** appears and whether **messages** work.
4. Contact DropBot support with the above details.

---

*Last updated: June 2026 · DropBot — AI chatbot for your website*
