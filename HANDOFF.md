# ARX Mobile (Remix) — Engineer Handoff

Paste this whole doc into Claude Code (or read it yourself) before touching the repo. It covers the architecture, every live data source, exactly what survives a zip/GitHub move vs. what doesn't, and the deploy steps to make all data sources work for a new person on a new machine.

---

## 1. What this is

A React 18 + inline-Babel prototype (no build step — runs directly in the browser via `<script type="text/babel">`). Canonical entry point: **`app/index.html`**. It loads ~40 `.jsx` modules in sequence (each cache-busted with `?v=N`), plus `colors_and_type.css` / `styles.css` for the design system tokens, and `/assets` for images/icons.

There is **no bundler, no npm install, no server-side code** — it's a static site. That's both the reason it's zero-setup to run, and the reason live data sources need CORS-friendly public APIs or a small proxy.

## 2. How to run it locally (critical — read before debugging "broken" data)

**Never open `index.html` via `file://` (double-click).** Most live fetches (Hyperliquid, quant-api, RSS proxies, the Lucid router) get blocked by the browser under `file://` due to CORS / mixed-content / Private Network Access rules. This is the #1 cause of "data sources don't work after I moved it."

Instead, serve it:
```bash
cd app
npx serve .
# or: python3 -m http.server 8080
# or: VS Code "Live Server" extension → Open with Live Server
```
Then open the printed `http://localhost:PORT/index.html`.

## 3. Architecture: what's baked into the code vs. what's per-browser config

This is the part that determines what survives a zip export or a GitHub clone.

### Baked into the JS files (travels with the code, works immediately, anywhere)
These are hardcoded fetch calls + API keys already committed in the source — no setup needed on a new machine:

| Source | File | Endpoint | Notes |
|---|---|---|---|
| Hyperliquid markets (crypto perps) | `app/quant-api.jsx` | `https://quant-api.arxtrade.dev` | API key baked in (`ARX_QUANT_KEY`). Real mark price / OI / funding / volume for ~19 coins. 60s cache. |
| Hyperliquid wallet positions (whales/KOLs) | `app/arx-whales.jsx` | `https://api.hyperliquid.xyz/info` | Public endpoint, no key. 21 real wallet addresses + Elon Musk demo wallet, `clearinghouseState` polled every 90s. |
| DataWorks tag catalog | `app/lucid.jsx` (`loadTagCatalog`) | `https://dataworks-api.arxtrade.dev/v1/tags/catalog` | API key baked in (`ARX_TAG_API_KEY`). Wallet taxonomy/tag vocabulary for Lucid. |
| Stock quotes (NVDA/TSLA/etc.) | `app/lib/finnhub-client.jsx` | Finnhub free tier | Check this file for its own key/config before assuming it's live. |
| News (fallback path) | `app/news-live.jsx` | rss2json.com + curated fallback list | Works with **no key** on rss2json's free tier (rate-limited); falls back to a curated real-headline list if every live fetch fails, so News is never empty. |

**These require zero setup for your engineer** — clone/unzip, serve, done.

### Per-browser config (localStorage) — does NOT travel with a zip/clone
These are optional **upgrades** to the sources above, entered through the in-app **You → Account → Settings → Data sources** screen (`app/data-sources.jsx`). They're stored in `localStorage` **on whichever browser you configured them in** — so if your engineer opens the app in their own browser (a new machine, a fresh profile, or even just a different browser on your machine), these will be **blank again** and need to be re-entered:

| Field | localStorage key | What it upgrades |
|---|---|---|
| News endpoint URL | `arx_news_url` | Your own backend for News — no CORS/rate-limit risk, real images. If set, this wins over rss2json. |
| rss2json API key | `arx_rss2json_key` | Raises the rss2json free-tier ceiling. |
| Lucid router URL | `arx_lucid_router` | Local multi-LLM router (`grok→groq→claude→qwen→deepseek`), e.g. `http://localhost:3000/lucid/ask`. Tried first; silently falls back to the built-in Claude cascade if unreachable. **Only reachable from the SAME machine the router runs on** — this is expected, not a bug, if it's `localhost`. |
| Lucid backend URL | `arx_ai_endpoint` | Routes Lucid to a DataWorks/Hologres `run_sql`-style service. |
| Warehouse snapshot URL | `arx_snapshot_url` | A baked wallet-classification snapshot JSON so Lucid can answer real count/filter questions. |
| Deposit flow URL | `arx_deposit_flow_url` | Real Arbitrum Bridge2 deposits/withdrawals-by-cohort from your Lucid router (`getDepositFlow` tool). Include `withdrawalsByCohort` in the response for a real net figure — otherwise Lucid states deposits-only. |

**Action needed after moving to a new environment:** re-open the app → **You → Data sources** → re-paste whichever of these six URLs/keys apply. This is a 2-minute manual step per browser/machine, not a code fix.

## 4. Zip export vs. GitHub — recommendation

**Recommendation: push to GitHub, deploy to a static host (Vercel / Netlify / GitHub Pages).** Reasoning:

- A zip works fine IF served locally (see §2), but a real `https://` deployed URL eliminates the `file://` CORS trap entirely, gives proper versioning/diffing, and lets you keep iterating without re-sending files.
- Nothing about "data sources" changes between zip and GitHub — the baked-in sources (§3, table 1) work identically either way, and the per-browser config (§3, table 2) is **never included in either format** — it's runtime browser state by design (so no one accidentally commits an API key/router URL into the repo).

## 5. Step-by-step: deploying to GitHub + Vercel (recommended path)

```bash
cd app
git init
git add -A
git commit -m "ARX Mobile — initial handoff"
git remote add origin <your-repo-url>
git push -u origin main
```

Then either:
- **Vercel**: import the repo at vercel.com/new, framework preset = "Other" (static), root directory = wherever `index.html` lives, no build command, output directory = `.`. Deploy.
- **GitHub Pages**: Settings → Pages → deploy from the branch/folder containing `index.html`.
- **Netlify**: drag-and-drop the `app/` folder onto app.netlify.com/drop for a one-off, or connect the repo for continuous deploy.

Any of these gives a real HTTPS origin where every baked-in data source (§3 table 1) works with zero extra setup, and the Data Sources screen (§3 table 2) becomes a real "each teammate configures their own" settings panel — exactly as intended.

## 6. `.gitignore` (add this before your first commit)

```
.DS_Store
node_modules/
*.log
```
(There's no `node_modules` today since there's no build step, but add it defensively in case someone `npm install`s a tool later.)

## 7. Known environment caveats to tell your engineer up front

- **`arx_lucid_router` only works from the machine actually running that router.** If they deploy this app to a public URL, `http://localhost:3000` will never be reachable from a visitor's browser — that's a hard browser-security fact, not a bug. For a shared/demo deployment, either deploy the router too (with a public HTTPS URL + CORS headers) or leave that field blank and let Lucid fall back to Claude.
- **RSS proxies (rss2json) are a free, best-effort, rate-limited service.** If News looks stale, it's likely hitting the rate limit — the curated fallback list keeps it from ever looking broken, but for reliability at scale, set `arx_news_url` to a real backend.
- **CORS**: any custom backend you point `arx_news_url` / `arx_ai_endpoint` / `arx_deposit_flow_url` / `arx_snapshot_url` at must send `Access-Control-Allow-Origin` headers (or `*`), or the browser will silently block the response with a `Failed to fetch` — this looks identical to "the server is down" from the app's side, so check CORS headers first when debugging.
- **Mixed content**: once this app is deployed on `https://`, any backend URL pasted into Data Sources must also be `https://` (except `localhost`, which browsers exempt) — an `http://` production URL will be blocked.

## 8. Quick verification checklist after moving/deploying

1. Serve `app/index.html` over `http://` or `https://` (never `file://`).
2. Open **Markets** — the heatmap/movers should show live prices within a few seconds (quant-api, no config needed).
3. Open **Copy** — whale wallet cards should show real account values (Hyperliquid, no config needed).
4. Open **Home** — News cards should populate within ~5s (rss2json/fallback, no config needed).
5. Open **You → Data sources** — confirm all six fields are blank (expected on a fresh browser) and re-enter any you use.
6. Ask Lucid a question — should answer via the built-in Claude cascade even with all six fields blank; wiring a router/endpoint upgrades this.

---

If anything above doesn't match what you find in the repo (a moved file, a renamed key), trust the code over this doc and let me know so I can correct it.
