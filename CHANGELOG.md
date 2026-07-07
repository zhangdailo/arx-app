# ARX Mobile — Version Change Log

**Build:** ARX Mobile (Remix) · standalone export
**Date:** 22 June 2026
**File:** `ARX Mobile — Standalone.html` (single self-contained file, ~7 MB, opens in any browser — no server/build needed)

---

## This export includes the full app, with focus on **Daily PnL** and **Rewards + Referrals**

### Daily PnL (You tab)
- **True daily calendar** — 30 real days ending today, padded so each column lands on its real weekday (Mon-first). The M–T–W–T–F–S–S labels are now honest (previously a generic 7×5 grid that mislabelled days).
- **Tap any day** → expands an inline breakdown: the day's date, per-trade rows (symbol · direction · leverage · PnL), and a "X of N trades green · realized, after fees" summary.
- **Clean legend** — two swatches (● Profit ● Loss) + "No trades", replacing the old red↔green rainbow gradient bar.
- Removed the unexplained "+" cell marks.
- Net-PnL figure in the header (green/red), "X of Y days green · last 30 days" subtitle.

### Rewards (You tab → Rewards card → full screen)
- **Points hero** with tier ladder — Bronze → Silver → Gold → Diamond — and a progress bar to the next tier.
- **Daily streak** (12-day) with a 7-day claim grid (+10/day).
- **Ways to earn** — copy a trader (+50), daily trade (+20), keep the streak (+10), refer a friend (+200).
- **Redeem $ARX points** catalog (Bonvoy-style tiered rewards).

### Referrals (You tab → Referrals card → full screen)
- **Multi-level L1 / L2 / L3 structure** — Direct (30% cut), Indirect (5%), Network (2%).
- **L1/L2/L3 rows are tappable** → open the list of referrals at that level with each one's commission % and $ contribution.
- **Claimable USDC hero** + Claim button (once claimed, button locks and shows the payout date/time).
- Lifetime-earned / active-30d stat cards, by-tier earnings with sparklines + 7d/30d/All period toggle.
- "$0-fee swaps at 100 referrals" milestone bar.
- Sticky copy-link + Share footer; referral code **ARX-ELON**.

---

## Other changes in this build (since the prior export)

**Membership & sharing**
- Coincall-style fee tiers converted to ARX; Silver tier card is clickable → full Bonvoy-style **membership benefits** page.
- **Share a trade** → pick one of your trades → black/purple PnL share card (Coincall template, green replaced with ARX purple) with a URL referral code, using the Elon Musk profile.

**Markets tab overhaul**
- **What-if** link → full **What-if leverage simulator** (gain/loss symmetry, Trade CTA, Ask 大佬 explainer).
- **Market regime** link → **regime explainer** page (today's read, 3 inputs: funding/volatility/positioning, Ask 大佬).
- **Smart-traders chips** (Smart money / Whales / Funds) → route to Copy → Smart Money for that asset.
- **Latest-trades rows** now tappable → open the trader's wallet detail.
- **Sortable table headers** (Last / Vol / Change) with ↓/↑.
- **Row → Trade** one-tap fast path on every market row.
- **Funding countdown** (next 8h boundary) on the instrument signals view — Pro only.
- Instrument signals page now defaults to **Positioning**.

**Settings / experience**
- New **Experience** toggle in Account → General: 🌱 **Simple** (default) vs ⚡ **Pro**. Persists, broadcasts a change event, exposes `window.__arxPro`. Pro-only data (e.g. funding countdown) is gated behind it.

**Home**
- Promo **banner carousel** now scroll-reveals (hidden on initial view, fades in once you scroll) so the landing screen reads clean.
- Equity-card carousel sizes to the active slide (no empty gap below Holdings); pager dots removed.
- Live-news ticker slimmed to a quiet FYI strip; pauses on hover/touch.
- Quick-actions row sits directly under the equity card.

**News**
- Live-news layer: real crypto-RSS headlines + images on each login (12 feeds), cache-first with graceful fallback to curated stories. **Infinite scroll** on the Home feed.

**Polish (You tab)**
- Section headers unified to the violet eyebrow-pill style.
- Reward/referral counts moved to body font (mono reserved for trading data).
- Positions row no longer clipped by the tab bar; even vertical rhythm.

**Platform**
- Device frame fit-to-viewport scaling (top status bar + bottom tab bar always visible).
- Bottom gradient scrim so content fades cleanly under the floating tab bar.
- 大佬 (AI copilot) backend wiring: `localStorage.arx_ai_endpoint` → DataWorks/Hologres; warehouse snapshot + tag-catalog aware.

---

## Notes for the engineer
- **This standalone HTML is a reference build**, not the source. The buildable project is the `app/` folder (React 18 + inline Babel; `index.html` + `.jsx` modules + `colors_and_type.css` / `styles.css` tokens + `/assets`).
- Fonts load from Google (Plus Jakarta Sans · Inter · JetBrains Mono).
- For live news + 大佬 warehouse answers, set `localStorage.arx_news_url` / `arx_ai_endpoint` to your backend, or `arx_rss2json_key` for browser-direct RSS.
