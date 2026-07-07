# Arx Mobile UI Kit

A high-fidelity recreation of Arx's mobile copy-trading app, applying **Design System v6.0** (Violet · Purple · Frost · Midnight, with Electric reserved for brand) to the screens defined in the source Figma (`/April`).

## Screens

| Screen | What it shows | Source frame |
|---|---|---|
| **Home** | Total equity hero, gradient promo cards, Feed/Watchlist/Traders tabs, two insight cards with primary CTA | `Home-Radar-Trade-Markets-Portfolio` |
| **Radar** | Trader leaderboard with regime context, trust badges, copy-with-one-tap | `Radar` |
| **Trade** | Long/Short toggle, size pad, entry/liq/funding summary, primary "halo" execute button | `5.3-Buy`, `Buy` |
| **Markets** | Compressed asset list with sparklines + regime header | `Market` |
| **You** | Profile, wallet/allocation settings entry points | `Wallet`, `Allocation-settings` |

## Files

- `index.html` — clickable prototype with bottom-tab nav + trade modal
- `components.jsx` — `TopBar`, `BalanceHeader`, `PromoCard`, `PillTabs`, `InsightCard`, `TraderCard`, `MarketRow`, `Sparkline`, `RegimePill`, `BottomTabBar`, `AssetGlyph`, icon set
- `screens.jsx` — full screens composed from components
- `ios-frame.jsx` — device bezel (status bar + home indicator)

## Design notes

- All colors come from `colors_and_type.css` — no raw hex in components.
- The Trade button is the **only** UI surface that uses the violet halo glow (`--shadow-execute`). Every other "depth" comes from surface stacking, not shadow.
- Numerals use `font-variant-numeric: lining-nums tabular-nums` and **JetBrains Mono** so columns of money line up cleanly.
- Regime pills are **immutable** — six possible states only. They never get re-themed even if the rest of the UI is re-skinned.
- Components are intentionally *cosmetic-only* — no real data, no real validation. They exist so designers can mix them into mocks.
