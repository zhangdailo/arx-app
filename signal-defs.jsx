/* ═══════════════════════════════════════════════════════════════════════════
   ARX · BUSINESS-LOGIC INDEX — the source of truth
   ═══════════════════════════════════════════════════════════════════════════

   WHAT THIS FILE IS
   -----------------
   The one place that records EVERY derived/computed piece of business logic in
   the app: tags, pips, labels, buckets, classification trees, and thresholds the
   UI paints on top of raw market data. Each entry records, together so they can
   never drift apart:

       1. DEFINITION   — glyph · label · plain-language copy
       2. LOGIC        — exact inputs · threshold · test()/bands
       3. RATIONALE    — WHY this rule, WHY this number
       4. PERSONA FIT  — which persona, in what situation, for what decision

   PROVENANCE
   ----------
   Thresholds are lifted verbatim from the canonical product spec:
     • Wallet taxonomy  → specs/08-capability/Arx_08-2-1 (5-7-1)
     • Signals S01–S07  → specs/08-capability/Arx_08-2-5 (5-7-5) + Threshold Registry
   The spec marks all values "MVP seed — calibrate on real Hyperliquid data."
   If a number changes, change it HERE; cite the spec ID in the rationale.

   HOW TO USE
   ----------
   • Read logic:     ARX_LOGIC[<group>][<key>].test(...)  → boolean   (where runtime)
   • Classify:       arxClassify.<fn>(...)                 → label     (decision trees)
   • Render legend:  iterate group → glyph · label · short
   • Render ⓘ help:  show .full
   • Inspect why:    read .rationale · .persona · .spec
   • CHANGE A NUMBER HERE ONLY — UI, legend, ⓘ, and classification all read here.

   PERSONAS (Arx design system)
   ----------------------------
   • S2 — independent trader (~5%). Trades own ideas; reads to ACT (enter/fade/size).
   • S7 — capital allocator (~95%). Copies leaders; reads as CONTEXT + Copy bridge.

   INDEX (mirrors the sitemap → where each rule is painted)
   --------------------------------------------------------
   Home › Markets › Overview
     • IA + widget catalogue           → group 'marketsOverview' (questions·metrics·visuals·filters)
     • Market pulse · Heatmap          → group 'heatmap'      (conviction/crowded/divergence)
     • Positioning matrix              → group 'positioning'  (cohort bias + split/consensus)
     • Flows · Wallet funding          → groups 'walletTaxonomy.*' (size & performance segments)
   Instrument detail (signal tabs)
     • Bias                            → group 'biasS01'
     • Flow                            → group 'flowS02'
     • Walls                           → group 'wallsS03'
     • Stress                          → group 'stressS04'
   Copy / Wallet detail
     • Performance type / size / style → group 'walletTaxonomy'
     • Cluster actors                  → group 'clusterActors'
     • Trajectory / Risk / Capital     → groups 'trajectoryS05' · 'riskBehaviorS06' · 'capitalFlowS07'
   Reference data tables (not thresholds): DISCOVER_FUNDING, DISCOVER_LEV (discover.jsx)
   ═══════════════════════════════════════════════════════════════════════════ */

var ARX_LOGIC = {

  /* ── GROUP: marketsOverview — Markets › Overview IA + widget catalogue ──────
     The merged Bento-cockpit + Tabbed-drill-in overview (markets-overview.jsx +
     markets-overview-shell.jsx). This records, per widget: the QUESTION it answers,
     the METRICS it uses, the VISUALIZATION chosen, and the FILTERS exposed.
     Persona: S2 (independent trader) scans the whole-market state, then drills.
     Grounded only in data we have (D.instruments + on-chain positioning/flow/liq);
     fields not in raw data (oiD, volD, liq, buy, cohort bias, rekt) are deterministically
     seeded in markets-overview.jsx (moHash/moBias) — flagged MVP-seed, calibrate on real data. */
  marketsOverview: {
    ia: {
      label: 'Flat · customizable widget stack',
      layout: 'Each widget renders in full inside a <MoWidget> shell (label · sub · inline control). No bento summary tiles, no drill-in. (Replaced the bento+tabbed IA.)',
      story: 'Capital-momentum lifecycle order: orient (conditions) → see field (map) → find (movers) → arrives (money flow) → deploys (trading flow) → commits (positioning) → unwinds (liquidations) → explain (catalysts).',
      customization: 'MO_WIDGETS registry (markets-overview-shell.jsx) drives order + visibility. Users show/hide + reorder via the Customize sheet; prefs persist in localStorage[arx-ov-prefs]. core widgets can\u2019t be hidden; perpOnly widgets auto-hide in Spot.',
      mvp6: ['dayread','map','movers','moneyflow','positioning','catalysts'],
      plus2: ['tradingflow','liquidations'],
      mvpRationale: 'The true 6 answer the glance loop (what day · what\u2019s moving · where smart money is · what changed) + money-flow (Arx-unique on-chain capital). The 2 PLUS are built but default-OFF: trading-flow (CVD) is advanced/noisy; standalone liquidations wants CoinGlass-style price-level data we don\u2019t have yet (map\u2019s liq lens covers it). Promoting either to default is a one-line registry change (defaultOn).',
      rationale: 'North star = Informed Composure. Flat is simpler than bento (no shallow summary + drill-in duality), each block immediately usable; customization lets each trader shape their cockpit.',
      filters: { instrument: 'Perps / Spot (Layer-2 scope)', assetClass: 'in Discover/Browse, not Overview (Overview map is OI-only + window)', cohort: 'lives in Positioning, not the map', window: '15m · 1H · 4H · 24H (collapsed 24H ▾ on the map)' },
    },
    marketMap: {
      question: 'Where is the weight / activity / pain, and where is it moving?',
      metrics: ['OI (oiUsd) + OI Δ', 'Volume (volUsd) + Vol Δ', 'Liquidations (liq $) + side', 'cohort long-share'],
      visualization: 'Squarified treemap — area = selected metric. SINGLE metric per lens; colour encodes that same metric (no congested multi-metric tiles).',
      lenses: {
        oi:           { area:'open interest', color:'OI Δ (bleeding↔building)', tile:'OI Δ% (primary) · OI $notional (secondary)', norm:'Coinglass OI map — sized by OI, labelled OI + change' },
        volume:       { area:'24h volume', color:'Volume Δ (falling↔rising)', tile:'Vol Δ% · Vol $notional', norm:'volume map — sized by turnover, labelled vol + change' },
        liquidations: { area:'$ liquidated', color:'squeeze side (longs flushed↔shorts squeezed)', tile:'$ liquidated · dominant side', norm:'Coinglass liquidation map — $ + long/short side' },
      },
      cohortOverlay: 'On OI/Volume, the "Color by" pills (Everyone/Smart/Whale) recolour by long-share instead of metric Δ; tile primary becomes long-share %. Hidden on Liquidations.',
      tileCap: { max: 8, rationale: 'Mobile readability floor — at ~334×300px, 8 tiles keep the smallest cell legible (symbol + one value); >8 degrades small cells to 2-char stubs.', overflow: 'Remainder anchored to a "See all N {class}" CTA below the map → routes to the Movers lens (full ranked, scrollable list).' },
      contrast: 'Tiles are a data-viz substrate: regime colour mixed over the --color-midnight-300 primitive (NOT --surface-modal) so cells stay dark and white tile text keeps contrast in every theme, incl. ios-light.',
      window: 'Live — 15m/1H/4H/24H scales move, OI Δ, Vol Δ and liq $.',
      filters: ['metric: OI/Volume/Liquidations', 'asset class', 'cohort (Everyone/Smart/Whale)', 'window'],
      rationale: 'One map serves all size metrics rather than three redundant heatmaps; each lens shows a single, norm-matching metric; Liquidations folds in, coloured by squeeze direction.' },
    topMovers: {
      question: 'What is moving worth my time?',
      metrics: ['24h move', 'OI Δ', 'Volume Δ', 'OI (liquidity tier)'],
      visualization: 'Ranked list (top 10), one dominating metric per lens — no composite score.',
      filters: ['metric: Gainers/Losers/OI Δ/Volume Δ', 'asset class', 'liquidity: Any / OK ≥$100M / Deep ≥$500M'],
      rationale: 'Liquidity is an explicit threshold FILTER (Deep ≥$500M OI, OK ≥$100M, Thin below) + a persistent tag — never a hidden multiplier.' },
    positioning: {
      question: 'Which way is each cohort positioned vs the crowd?',
      metrics: ['OI-weighted long-share % per cohort (crowd/smart/whale/rekt)'],
      visualization: 'Nested bias matrix: whole-market bias → 4 cohorts → asset class → individual coins (diverging long/short bar at every level; ⟂ when cohort opposes crowd).',
      filters: ['cohort lens', 'expand class → coins'],
      rationale: 'Bias readable at every level in one consistent bar; ⟂ flags divergence. Longs and shorts are always equal in size — this shows who is on each side, not how much.' },
    moneyFlow: {
      question: 'Where is capital arriving onto Hyperliquid?',
      metrics: ['net deposits', 'gross in/out', 'by-cohort share + destination'],
      visualization: 'Reuses the app WalletFunding (net headline + in/out + trend + cohort segments + destinations). NO asset-class filter — it is account-level.',
      rationale: 'Capital onto the venue is account-level, so asset-class filtering is not meaningful; we keep the existing, proven module.' },
    tradingFlow: {
      question: 'Who is pressing the bid vs the offer right now?',
      metrics: ['net taker CVD + Δ vs prev', 'buy/sell %', 'by-cohort buy aggression'],
      visualization: 'Net CVD headline with delta + buy/sell split + by-cohort segments (aggression split).',
      filters: ['asset class', 'window'],
      rationale: 'Distinct from money flow: trading flow is on-venue aggression. Segmented by cohort (not by class — the class filter scopes it).' },
    catalysts: {
      question: 'What just moved the tape that I should act on or protect against?',
      metrics: ['funding flips', 'smart-money initiations', 'liquidation cascades', 'vol/OI breakouts', 'news'],
      visualization: 'Event feed, newest first, type-tagged; filterable.',
      filters: ['type: All / Funding / On-chain / Liquidations / News'],
      rationale: 'Grounded in events we actually observe on-chain + news. Forward scheduled-event calendar (unlocks/earnings/CPI) is OUT until that data feed lands.' },
  },

  /* ── GROUP: heatmap — Markets › Overview › Market pulse tiles (perps) ─────
     Inputs: sig=arxSignalsFor(m) → sig._meta{mult,bi,bull}; m.deltaPct; f=discFunding.
     One pip per tile; priority divergence → crowded → conviction (risk-first). */
  heatmap: {
    conviction: {
      glyph: '◆', label: 'Conviction', short: 'flow heating — OI building with the move',
      full: 'Smart-money flow is ≥ 2.2× its own baseline while price moves the same direction.',
      inputs: ['sig._meta.mult'], threshold: { flowMultiple: 2.2 }, spec: 'derived from S02 TH-S02-FLOW-RISING',
      test: function (sig) { return !!sig && sig._meta.mult >= this.threshold.flowMultiple; },
      rationale: 'A price move alone is just price. 2.2× baseline = clearly above churn (≈ S02 "rising" gate) '
        + 'without firing on every wiggle; direction must agree so we never flag a move smart money is fading.',
      persona: { s2: 'Scanning for a real entry → heating tile is worth a tap to size into.',
                 s7: 'Glancing where proven money commits → candidate to open and find leaders → Copy.' },
    },
    crowded: {
      glyph: '⚠', label: 'Crowded', short: 'one-sided positioning — squeeze / fade risk',
      full: 'Net positioning bias is ≥ 40 (−100…+100) to one side. One-sided books carry squeeze/fade risk.',
      inputs: ['sig._meta.bi'], threshold: { biasAbs: 40 }, spec: 'S01 bias_index · Bullish/Bearish band edge',
      test: function (sig) { return !!sig && Math.abs(sig._meta.bi) >= this.threshold.biasAbs; },
      rationale: '|bias| ≥ 40 is the spec\'s "Bullish/Very Bullish" edge — clearly lopsided, past the ±20 '
        + 'Indecisive band. When everyone is one side there is no one left to push it; reversals cascade. A caution, not a green mark.',
      persona: { s2: 'Hunting reversals → fade candidate or "do not chase."',
                 s7: 'Avoiding being late → a leader\'s position may be late/exposed.' },
    },
    divergence: {
      glyph: '⚯', label: 'Divergence', short: 'price and funding disagree',
      full: 'Price direction (24h) and funding sign disagree — the move is not confirmed by perp positioning.',
      inputs: ['m.deltaPct', 'f (discFunding)'], threshold: {}, spec: 'S02 flow-flip intuition',
      test: function (sig, m, f) { if (f == null) return false; return (m.deltaPct >= 0) !== (f >= 0); },
      rationale: 'Price and funding usually agree (rising price → longs pay → +funding). A split means the move '
        + 'lacks positioning support and is likelier to fade. Binary by nature; top render priority because it is the subtlest and costliest to miss.',
      persona: { s2: 'Confirming a thesis → yellow flag, wait or fade.',
                 s7: 'Reading why a move may not last → anti-FOMO context.' },
    },
  },

  /* ── GROUP: positioning — Markets › Overview › Positioning matrix ─────────
     Cohort long/short bias per asset class & instrument (Everyone/Smart/Whale). */
  positioning: {
    split: {
      glyph: '⟂', label: 'Split', short: 'crowd and Smart money opposed',
      full: 'Smart-money bias and Everyone bias point to opposite sides — the proven side disagrees with the crowd.',
      inputs: ['smartBiasPct', 'everyoneBiasPct'], threshold: { gapClass: 12, gapInstrument: 18 },
      spec: 'S01 cohort bias divergence',
      test: function (everyone, smart, isClass) {
        var gap = isClass ? this.threshold.gapClass : this.threshold.gapInstrument;
        return Math.abs(smart - everyone) >= gap && ((smart >= 50) !== (everyone >= 50));
      },
      rationale: 'Two thresholds by aggregation level: class rows average many instruments so a 12-pt gap is '
        + 'already meaningful; single instruments are noisier, so require 18 pts. Both also need a side-cross '
        + '(one long, one short) — a gap on the same side is not a real disagreement.',
      persona: { s2: 'The highest-signal moment — fade the crowd or follow the proven side.',
                 s7: 'Caution: the leaders you might copy disagree with the herd.' },
    },
    consensus: {
      glyph: '◆', label: 'Consensus', short: 'cohorts aligned',
      full: 'Smart money, whales, and the crowd all lean the same way with conviction.',
      inputs: ['everyoneBiasPct', 'smartBiasPct', 'whaleBiasPct'], threshold: { smart: 62, everyone: 55, whale: 58 },
      spec: 'S01 cohort agreement',
      test: function (e, s, w) { return s >= this.threshold.smart && e >= this.threshold.everyone && w >= this.threshold.whale; },
      rationale: 'Alignment across all three cohorts above their bullish edges is rarer and stronger than any one '
        + 'cohort alone. Thresholds staggered (smart 62 > whale 58 > everyone 55) so the proven side must lead the agreement.',
      persona: { s2: 'Confluence — conviction in a directional idea.', s7: 'Broad agreement — a lower-controversy copy backdrop.' },
    },
  },

  /* ── GROUP: biasS01 — Instrument › Bias tab (spec 5-7-5 §1.1) ─────────────
     bias_index = (long−short)/(long+short) × 100. */
  biasS01: {
    buckets: {
      label: 'Position bias buckets',
      spec: '5-7-5 §1.1', inputs: ['bias_index'],
      bands: [ [-100, -60, 'Very Bearish'], [-60, -20, 'Bearish'], [-20, 20, 'Indecisive'], [20, 60, 'Bullish'], [60, 100, 'Very Bullish'] ],
      subIndecisive: [ [-20, -10, 'Indecisive, leaning Bearish'], [-10, 10, 'Indecisive'], [10, 20, 'Indecisive, leaning Bullish'] ],
      leaningEdge: 15,   // |bias|≥15 inside Indecisive → "near Bullish/Bearish edge" (TH-S01-LEANING-EDGE)
      rationale: 'Symmetric ±20/±60 cuts map the −100…+100 index to five readable buckets. ±20 is the neutral '
        + 'band (perp books lean long, so small skews are normal); ±60 marks strong one-sidedness. Sub-copy at ±10/±15 '
        + 'gives a directional hint without overstating a neutral read.',
      persona: { s2: 'First read of crowd positioning before forming a view.', s7: 'Plain "which way is the crowd leaning" context.' },
    },
    topWalletCap: {
      label: 'Single-wallet influence cap', spec: 'TH-S01-TOPWALLET-CAP', threshold: { share: 0.40 },
      inputs: ['top_wallet_notional', 'gross_notional'],
      test: function (topShare) { return topShare >= this.threshold.share; },
      rationale: 'If one wallet holds ≥40% of gross notional it could set the entire bias bucket alone. Above the cap '
        + 'we flag "single-wallet influenced" and recompute a capped bias so one whale cannot manufacture false consensus; raw stays in tap detail.',
      persona: { s2: 'Protects the fade/confirm read from one whale faking a crowd.', s7: 'Honesty: "this is one wallet, not the market."' },
    },
    thinData: {
      label: 'Thin-data guard', spec: 'TH-S01-THIN-WALLETS / TH-S01-THIN-NOTIONAL', threshold: { wallets: 20, notionalUsd: 1e6 },
      inputs: ['qualified_wallet_count', 'gross_notional_usd'],
      test: function (wallets, gross) { return wallets < this.threshold.wallets || gross < this.threshold.notionalUsd; },
      rationale: 'Below 20 wallets or $1M gross the cohort read is unstable — show "thin data" rather than a confident bias. Honest beats empty.',
      persona: { s2: 'Avoids trading a phantom signal on an illiquid market.', s7: 'Avoids copying into a market too thin to read.' },
    },
  },

  /* ── GROUP: flowS02 — Instrument › Flow tab (spec 5-7-5 §1.2) ─────────────
     flow_multiple = current_directional_flow / max(baseline, floor). First-match ladder. */
  flowS02: {
    states: {
      label: 'Flow display states', spec: '5-7-5 §1.2 (first-match ladder)',
      inputs: ['flow_multiple', 'acceleration_pct', 'directionFlipped'],
      ladder: [
        ['flipped',      'Flow flipped direction',  'direction opposite prior window AND magnitude ≥ baseline'],
        ['decreasing',   'Flow decreasing',         'acceleration_pct < −25%'],
        ['rising',       'Flow rising',             'flow_multiple ≥ 2.0 AND acceleration_pct > +25%'],
        ['above_normal', 'Flow above normal',       'flow_multiple ≥ 1.5'],
        ['near_normal',  'Flow near normal',        '0.75 ≤ flow_multiple < 1.5'],
        ['below_normal', 'Flow below normal',       'flow_multiple < 0.75'],
      ],
      threshold: { rising: 2.0, accelRising: 0.25, accelDecreasing: -0.25, aboveNormal: 1.5, nearNormalLow: 0.75 },
      rationale: 'First-match-wins so overlapping rules cannot collide. "Decreasing" outranks magnitude on purpose: '
        + 'a flow can be 2.5× normal yet fading at −30% — the actionable read is that it is fading, size as context ("Decreasing · still 2.5× normal").',
      persona: { s2: 'Is the move building or exhausting — the entry-timing read.', s7: 'Is proven flow arriving or leaving this market.' },
    },
    floor: {
      label: 'Minimum flow floor', spec: 'TH-S02-MIN-FLOW-FLOOR', inputs: ['open_interest_usd'],
      compute: function (oiUsd) { return Math.max(100000, 0.0001 * (oiUsd || 0)); },
      rationale: 'max($100K, 0.01% of OI). Prevents a tiny baseline from manufacturing a huge "multiple" on an illiquid market.',
      persona: { s2: 'Kills fake "10× flow" spikes on thin books.', s7: 'Same — trust the multiple.' },
    },
    minSamples: { label: 'Baseline minimum samples', spec: 'TH-S02-MIN-SAMPLES', threshold: { samples: 20 },
      rationale: 'Need ≥20 same-window samples (extend lookback to 30d to reach it) or show "baseline unavailable." Under 20 the median is noise.' },
  },

  /* ── GROUP: wallsS03 — Instrument › Walls tab (spec 5-7-5 §1.3) ───────────
     Price-bucket walls; a bucket qualifies on materiality OR concentration AND breadth OR whale. */
  wallsS03: {
    qualify: {
      label: 'Wall qualification', spec: '5-7-5 §1.3 + TH-S03-*',
      threshold: {
        entry:  { oiShare: 0.0025, localConc: 3.0, wallets: 20, walletPct: 0.005 },
        forced: { oiShare: 0.0010, localConc: 2.5, positions: 10, positionPct: 0.0025 },
        profit: { oiShare: 0.0025, localConc: 3.0, confidence: 'Inferred' },
        whaleException: 2,
        displayRangeDailyMoves: 2.0, displayRangeFallbackPct: 0.05,
      },
      rationale: 'Entry/profit need 0.25% of OI or 3× local concentration; forced-exit qualifies lower (0.10% / 2.5×) '
        + 'because forced flow matters at smaller size. All need breadth (≥20 wallets / ≥10 positions) OR ≥2 whales, so one wallet cannot draw a wall. '
        + 'Range scaled by normal daily move so walls are comparable across volatile and calm markets.',
      persona: { s2: 'The price map before placing orders — entry / stop / target zones.', s7: 'Context only; walls are an S2-grade microstructure read.' },
    },
    wallTypes: { label: 'Wall types', spec: '5-7-5 §1.3',
      values: ['Entry Wall', 'Forced-Exit Wall', 'Possible Profit-Taking Area (Inferred)'],
      rationale: 'Three only. "Possible Profit-Taking" is always labeled Inferred (built from prior reductions, not stated intent).' },
  },

  /* ── GROUP: liqWallSimpleChart — Instrument › Simple chart liquidation overlay ──
     MVP liquidation-wall rule for the SIMPLE price chart (Pro keeps the full S03 ladder).
     Decision trail: purpose-derived (risk · magnet · timing) → both sides, criteria-led count. */
  liqWallSimpleChart: {
    purpose: { label: 'Why walls on the Simple chart', spec: 'DEC · widget-2',
      uses: ['Risk — danger zone where price could accelerate / a stop could get swept',
             'Magnet/target — where price may get pulled, and a realistic exit',
             'Timing — wait vs enter now; where to set stop & target'],
      rationale: 'Liquidation (not entry-cost) is the one structure layer Simple keeps — it is risk, the thing a newbie must see, '
        + 'and it maps to a clear consequence. Entry-cost concentration is a Pro nuance. The full multi-wall ladder + composition + planner stay in Pro / the Risk tab.',
      persona: { s2: 'One glance read of nearby liquidation risk before acting.', s7: 'Context; deep map lives in Risk tab.' } },
    liquidityTier: { label: 'Asset liquidity tier (per-hour classify by 24h perp volume)', spec: 'MVP fixed rule',
      tiers: [
        { name: 'Highly liquid', minVolume24h: 500000000, bucketWidthPct: 0.005, minWallNotional: 10000000 },
        { name: 'Liquid',        minVolume24h: 100000000, bucketWidthPct: 0.0075, minWallNotional: 3000000 },
        { name: 'Small/illiquid', minVolume24h: 0,        bucketWidthPct: 0.01,   minWallNotional: 500000 },
      ],
      classify: function (volume24h) { var t = ARX_LOGIC.liqWallSimpleChart.liquidityTier.tiers; for (var i = 0; i < t.length; i++) if (volume24h >= t[i].minVolume24h) return t[i]; return t[t.length - 1]; },
      rationale: 'Blunt, predictable, testable: volume tier sets the price-bucket width and the absolute notional floor. No concentration score / order-book / persistence / confidence multiplier in MVP.' },
    qualify: { label: 'What counts as a wall (Simple)', spec: 'DEC · criteria-led',
      rule: 'GATE on the absolute tier floor (= "major": big enough to move THIS asset). Among floor-clearing buckets, show every wall that is also >= 0.30 of the LARGEST in-view wall (relative-to-largest, NOT relative-to-total). Rank by notional.',
      relativeToLargest: 0.30,
      rationale: 'Earlier draft gated on >=15% of in-view TOTAL — fragile: it depends on zoom/timeframe and on a very liquid asset a genuinely large wall can fall under 15% of a huge total and vanish. The absolute tier floor is the honest definition of major; relative-to-largest only trims clutter (a weak-but-above-floor wall next to a giant) and scales with the dominant wall, so a true giant never disappears.' },
    display: { label: 'Simple-chart display rule', spec: 'DEC · widget-2',
      bothSides: true,
      showAllQualifying: true,
      softCapPerSide: 3,
      multipleReason: 'Multiple-per-side is required by the TP/SL purpose: a stop is placed BEYOND a zone and a target BEFORE one, so the trader must see the zone being cleared AND the next one out. One-per-side serves glance-risk but breaks stop/target placement.',
      roles: 'none — no "magnet"/"nearest" labels (needs fuzzy logic, unclear word). Size + position carry importance; bigger bar = more pull, self-evident.',
      colour: 'neutral slate; side read by region (below mark = long liqs, above = short liqs). Direction carried by the read words ("risk below / fuel above"), not red/green.',
      interaction: 'Tap a wall -> it rings on the chart and a Lucid TIP slots in BELOW the timeframe switcher (not a full drawer). Tip = verdict + plain read + slim who-bar (cohort) + Ask Lucid. Same content level as the shipped drawer, lighter container.',
      rationale: 'Both sides because each answers a different job (below = downside risk/stop-sweep, above = upside fuel/target) and Simple users are often still deciding direction. Floor-gate defines major; relative-to-largest + soft-cap-3/side keep it clean. Full ladder + composition + planner stay in Pro / Risk tab.',
      persona: { s2: 'Glance: risk below, fuel above, and where to set stop/target.', s7: 'n/a (Simple read).' } },
  },

  /* ── GROUP: stressS04 — Instrument › Stress tab (spec 5-7-5 §1.4) ─────────
     Three primitives (crowded / underwater / near-liquidation) → first-match state ladder. */
  stressS04: {
    definitions: {
      label: 'Risk-term definitions — surface tooltips read from here', spec: '5-7-5 §1.4',
      vulnerable: { term: 'Vulnerable', def: 'Open notional whose liquidation price sits within the near band of the current mark — a realistic adverse move would force it out.', how: 'Sum of position notional where distance-to-liquidation ≤ 1.0 normal daily move (≈3% fallback). Mark-priced.' },
      underwater: { term: 'Unrealized loss', def: 'Open notional currently sitting at a loss — entry worse than mark, not yet realized.', how: 'unrealized-loss notional ÷ vulnerable notional = the % shown; mark-priced, before fees.' },
      crowding: { term: 'Crowding', def: 'How one-sided positioning is versus its own recent normal.', how: 'side notional ÷ its 30d median; flagged at ≥2×, or when one side ≥65% of open interest.' },
      liquidationDistance: { term: 'Liquidation distance', def: 'How close the nearest large forced-exit cluster sits, in units of a normal daily move.', how: 'price gap to the cluster ÷ one normal daily move; ≤0.5 = critical, ≤1.0 = near.' },
      leverage: { term: 'Leverage', def: 'Notional-weighted average leverage of open positions, vs its baseline.', how: 'Σ(position notional × leverage) ÷ Σ notional; high-lev share = % of OI above 10×. MVP-seed.' },
    },
    primitives: {
      label: 'Stress primitives', spec: 'TH-S04-*',
      threshold: { crowdedSideShare: 0.65, crowdedBaselineMult: 2.0, underwaterElevated: 0.40, underwaterCritical: 0.60, nearDailyMoves: 1.0, criticalDailyMoves: 0.5, nearPctFallback: 0.03, criticalPctFallback: 0.015 },
      rationale: 'Crowded = side ≥65% of notional, or cohort ≥2× its 30d median. Underwater elevated ≥40% / critical ≥60%. '
        + 'Distance "near" ≤1.0 / "critical" ≤0.5 normal daily moves (percent fallback 3% / 1.5%). Each primitive is measured separately and never collapsed into one vague score.',
    },
    stateLadder: {
      label: 'Stress state', spec: '5-7-5 §1.4 (first-match)',
      threshold: { criticalNotionalUsd: 25e6 },
      ladder: [
        ['critical', 'distance ≤0.5 daily move AND vulnerable ≥ $25M AND underwater ≥60%'],
        ['elevated', '≥2 primitives elevated'],
        ['watch',    'exactly 1 primitive elevated'],
        ['normal',   '0 primitives elevated'],
      ],
      rationale: 'Risk-first: Critical requires all three (very close + material size + majority underwater) — the '
        + 'genuine cascade setup. Below that, count elevated primitives. Default view shows the highest-stress side, not a browse choice.',
      persona: { s2: 'Where a sharp move gets amplified by forced flow — fade/avoid.', s7: 'Survival read: is this market fragile right now.' },
    },
  },

  cohortPlaybook: {
    label: 'Cohort playbook — borrowed settings (Instrument › Traders)', spec: 'derived from S01 bias + S03 walls',
    entry: { term: 'Entry', def: 'Where the cohort is positioned from — the notional-weighted entry of their open positions in this instrument.', how: 'Σ(position notional × entry) ÷ Σ notional for the cohort; surfaced as the dominant Entry Wall band. Not a median — large positions weigh more.' },
    stopLoss: { term: 'Stop-loss', def: 'Where the cohort gets forced out — their nearest large forced-exit (liquidation) cluster.', how: 'the Forced-Exit Wall on that side: the price band holding the most of their liquidation prices (S03). Observed, not advice.' },
    takeProfit: { term: 'Take-profit', def: 'Where the cohort tends to take profit — inferred from prior position reductions.', how: 'the Possible Profit-Taking Area (S03): a band where the cohort repeatedly reduced before. Inferred, lower confidence.' },
    direction: { term: 'Direction', def: 'The cohort net side and how one-sided it is.', how: 'long notional ÷ total notional for the cohort (S01 bias); shown as % long or short.' },
    leverage: { term: 'Leverage', def: 'The cohort typical leverage.', how: 'median leverage of the cohort open positions. MVP-seed.' },
    pnlBasis: { term: 'PnL basis', def: 'On the instrument page, trader PnL is UNREALIZED — profit on the open position here. Realized track-record PnL lives on the trader profile.', how: 'unrealized = (mark − entry) × signed size; realized = closed-trade PnL over the window.' },
    rationale: 'Entry is volume-weighted (not median) so a few large players are not hidden by many tiny ones; stop = the real forced-exit cluster, not a fixed %; take-profit is explicitly inferred and labelled lower-confidence. Instrument page ranks by unrealized (this position); the profile ranks by realized (track record).',
  },

  /* ── GROUP: trajectoryS05 — Wallet › Performance (spec 5-7-5 §2.1) ────────*/
  trajectoryS05: {
    qualifyingWindow: { label: 'Track-record qualification', spec: 'TH-S05-*',
      threshold: { activeDays: 30, trades: 20, maxDrawdown: 0.25, unprovenDays: 14, unprovenTrades: 20 },
      rationale: 'Proven = smallest of {30d,90d,all} with ≥30 active days, ≥20 trades, ≤25% drawdown, no liquidation in '
        + 'that window. Decouples "proven" from the display window so a low-frequency but good wallet is not stuck at Unproven; '
        + 'an old liquidation outside the window does not permanently block the label but is always shown.',
      persona: { s7: 'Is this wallet becoming more/less worth studying — the core copy-discovery read.', s2: 'Secondary; S2 trade their own ideas.' },
    },
    drawdownBands: { label: 'Drawdown plain-language', inputs: ['max_drawdown_pct'], threshold: { shallow: 0.15, deep: 0.25 },
      classify: function (dd) { return dd < this.threshold.shallow ? 'shallow' : dd < this.threshold.deep ? 'moderate' : 'deep'; },
      rationale: '<15% shallow, <25% moderate, ≥25% deep. 25% is the spec\'s controlled-downside line (TH-S05-CONFIRMED-DRAWDOWN); '
        + 'shown as words, never a Sharpe-style ratio the demand side will not read.' },
  },

  /* ── GROUP: riskBehaviorS06 — Wallet › Risk (spec 5-7-5 §2.2) ─────────────
     Compares today vs the wallet's OWN usual range (p25–p75), with stability floors. */
  riskBehaviorS06: {
    driftBands: { label: 'Drift vs usual range', spec: 'TH-S06-DRIFT-*',
      rule: 'Normal = inside p25–p75; Watch = <1 IQR out; Elevated = 1–2 IQR out; Much-higher = >2 IQR out.',
      floors: { concentrationPct: 10, leverageX: 1.0, newPairPct: 8, frequencyPerDay: 2, drawdownPct: 5 },
      minSamples: { d30: 120, d90: 360 },
      rationale: 'Compares a wallet to ITSELF, not a universal threshold — "riskier than its own normal." Stability floors '
        + 'stop false drift when a wallet is very consistent (e.g. leverage always 4.9–5.1× → tiny IQR; a 1.0× floor keeps 6× at "Watch," not "much higher").',
      persona: { s7: 'Is a wallet I copy acting out of character — the Law-5 risk read.', s2: 'Context when studying a leader.' },
    },
  },

  /* ── GROUP: capitalFlowS07 — Wallet › Capital (spec 5-7-5 §2.3) ───────────*/
  capitalFlowS07: {
    materiality: { label: 'Meaningful funding / trade', spec: 'TH-S07-*',
      threshold: { fundingDustUsd: 2000, fundingEquityPct: 0.05, tradeDustUsd: 1000, tradeEquityPct: 0.02, matchCapDays: 7 },
      rationale: 'Funding event ≥ max($2K, 5% equity); paired trade ≥ max($1K, 2% equity); match cap 7d. Equity-relative so '
        + 'it fires for normal-size leaders, not only whales (the old $50K floor made S07 whale-only). Beyond 7d causality is too weak to claim.',
    },
    matchConfidence: { label: 'Funding→trade confidence', spec: 'TH-S07-*-PAIRING',
      rule: 'Above normal = sequence starts ≤24h AND first trade ≥5% equity; Moderate = ≤7d AND ≥2% equity; Weak = otherwise.',
      rationale: 'Tighter time + bigger first trade = stronger inference that the funding fed the trade. Never claims the money '
        + 'went into a specific instrument — correlation, shown with confidence, not causation.' },
  },

  /* ── GROUP: walletTaxonomy — Copy / Wallet labels (spec 5-7-1) ────────────
     Three independent labels per eligible wallet: capitalSize × performanceType × tradingStyle.
     Eligibility: ≥14d history, ≥5 completed positions, user_account, capital basis > 0. */
  walletTaxonomy: {
    capitalSize: {
      label: 'Capital size', spec: '5-7-1 §6', inputs: ['median_perp_account_value (30d)'],
      bands: [ ['micro', 0, 1000], ['small', 1000, 10000], ['mid', 10000, 100000], ['large', 100000, 1000000], ['whale', 1000000, Infinity] ],
      display: { micro: 'Micro · <$1K', small: 'Small · $1K–10K', mid: 'Mid · $10K–100K', large: 'Large · $100K–1M', whale: 'Whale · $1M+' },
      rationale: 'Median Hyperliquid PERP account value only — never volume, notional, spot, or estimated net worth. Decade-style '
        + '×10 bands ($1K/$10K/$100K/$1M) are legible and map to real desk sizes (retail → fund → whale).',
      persona: { s2: 'Whale entries = size that can move a market.', s7: 'Filter leaders to a size whose behavior you can mirror.' },
    },
    performanceType: {
      label: 'Performance type', spec: '5-7-1 §7 (first-match decision tree)',
      values: ['new_blood', 'full_rekt', 'degen_winner', 'one_shot_winner', 'smart_money', 'rising_star', 'unproven'],
      display: {
        new_blood:       { label: 'New blood',       plain: 'Too new to judge — under 30 days of evidence.' },
        full_rekt:       { label: 'Full rekt',       plain: 'Lost ≥10% recently and losses outweigh wins.' },
        degen_winner:    { label: 'Degen winner',    plain: 'Profitable, but the ride is violent.' },
        one_shot_winner: { label: 'One-shot winner', plain: 'Profit mostly from one or a few wins.' },
        smart_money:     { label: 'Smart money',     plain: 'Strong 90d, controlled drawdown, spread gains.' },
        rising_star:     { label: 'Rising star',     plain: 'Strong recent 30d — no mature 90d proof yet.' },
        unproven:        { label: 'Unproven',        plain: 'Enough data, but no clear edge either way.' },
      },
      threshold: {
        fullRekt:    { return90: -0.10, profitFactor: 1.00, return30: -0.10 },
        degen90:     { drawdown: 0.35, profitFactor: 1.50, ddToReturn: 2.5 },
        degen30:     { drawdown: 0.30, profitFactor: 1.30, ddToReturn: 2.5, sizeOutlier: 5.0 },
        oneShot30:   { return: 0.20, top1WinShare: 0.50, profitConc: 0.70 },
        smart90:     { return: 0.15, profitFactor: 1.50, drawdown: 0.35, posWeekRate: 0.50, profitConc: 0.65, ddToReturn: 2.5 },
        rising30:    { return: 0.15, profitFactor: 1.30, drawdown: 0.30, profitConc: 0.65, ddToReturn: 2.5 },
      },
      order: 'new_blood (30d not ready) → full_rekt → degen_winner → one_shot_winner → smart_money → rising_star → else unproven',
      rationale: 'Evaluated in order, first match wins. Risk overrides shape: degen_winner is tested BEFORE one_shot_winner so a '
        + 'risky-but-profitable wallet is flagged risky, not flattered. smart_money requires the full mature 90d bar (≥15% return, '
        + 'PF≥1.5, ≤35% DD, ≥50% positive weeks, ≤65% concentration); rising_star is the same shape on 30d without 90d proof. '
        + 'Display is plain-language expectancy only — never raw Sharpe/ratios (demand side reads win-rate & PnL, and win-rate ≠ profit).',
      persona: { s7: 'The spine of Copy discovery — who is worth studying, stated honestly.', s2: 'Cohort lens on who is positioned where.' },
    },
    tradingStyle: {
      label: 'Trading style', spec: '5-7-1 §8 (first-match decision tree)',
      values: ['inactive', 'unavailable', 'scalper', 'day_trader', 'swing_trader', 'position_trader'],
      display: { scalper: 'Scalper', day_trader: 'Day trader', swing_trader: 'Swing trader', position_trader: 'Position trader' },
      threshold: {
        inactiveDays: 30, unavailableMinPositions: 10,
        scalper: { medianHoldMin: 5, p25HoldMin: 2, perDay: 50, sameInstrPerDay: 20 },
        dayTrader: { perDay: 5, medianHoldHours: 6 },
        swingTraderMaxDays: 7,
      },
      order: 'inactive (≥30d idle) → unavailable (<10 positions) → scalper → day_trader → swing_trader → else position_trader',
      rationale: 'Holding period + turnover only — never profit quality. First-match cascade from fastest to slowest. Drives copy '
        + 'expectations: a scalper and a position trader need very different mirror settings.',
      persona: { s7: 'Match a leader\'s cadence to what you can realistically copy.', s2: 'Know if a cohort is fast or slow money.' },
    },
  },

  /* ── GROUP: clusterActors — wallet-level cohort membership (spec 5-7-1 §9) ─
     Derived from the 3D label combination; a wallet can belong to 0, 1, or many. */
  clusterActors: {
    label: 'Cluster actors', spec: '5-7-1 §9',
    smart_money:     { from: 'performance=smart_money AND style∈{day,swing,position}', meaning: 'quality actor' },
    whale_moves:     { from: 'capital=whale AND performance∈{smart,rising,unproven,degen,one_shot} AND style∈{day,swing,position}', meaning: 'capital actor (full_rekt excluded)' },
    rising_money:    { from: 'capital∈{small,mid,large} AND performance=rising_star AND style∈{day,swing}', meaning: 'emerging actor' },
    full_rekt_crowd: { from: 'performance=full_rekt AND style active', meaning: 'vulnerable crowd actor' },
    rationale: 'Cohort families are the product-facing cut of the raw taxonomy: Smart Money = quality, Whale = capital impact, '
      + 'Rising = emerging, Full-Rekt = fragility. A full_rekt whale enters full_rekt_crowd, NOT whale_moves — poor performance '
      + 'overrides size so we never present a losing whale as a capital signal to follow.',
    persona: { s2: 'The Everyone/Smart/Whale columns in Positioning + heatmap conviction.', s7: 'Who to study (Smart) vs what to fade (Full-Rekt).' },
  },

  /* ── GROUP: leaderGate — Copy leader eligibility (spec 08-3 §"Three-Gate") ─*/
  leaderGate: {
    winRate: { label: 'Leader win-rate gate', spec: '08-3 Three-Gate (line 1176)', threshold: { minWinRate: 0.55, window: '90d' },
      rationale: 'A wallet must clear ≥55% win rate over 90d to be promoted to a copy "Leader." This is the eligibility gate, '
        + 'NOT a quality score — and per spec win rate must always be shown WITH expectancy (win rate ≠ profitability).',
      persona: { s7: 'Separates an opted-in Leader from a merely-observed wallet.', s2: 'n/a — S2 do not gate on this.' } },
  },

  /* ── GROUP: leverage — venue caps + tier-gated warnings (spec 08-3 §3.3/§5) */
  leverage: {
    venueCaps: { label: 'Per-instrument max leverage', spec: '08-3 §3.3 (marginTableId → marginTiers)',
      reference: { BTC: 40, ETH: 25, SOL: 20, altcoin: 10 }, note: 'Tiered DOWN by notional (e.g. BTC 40×→20× above $150M). Fetch per-instrument; never hardcode in production.',
      rationale: 'Venue-imposed ceiling from Hyperliquid, not an Arx preference. The app\'s DISCOVER_LEV table is the demo mirror of this.',
      persona: { s2: 'The max-leverage chip on each market.', s7: 'Caps mirrored copy leverage.' } },
    warningTiers: { label: 'High-leverage warning gates', spec: '08-3 §3.6/§Identity', threshold: { guidedAck: 10, cooldown: 25, hardCap: 40, t1: 5, t2: 10, t3: 25 },
      rationale: '>10× (guided users) requires an "I understand" acknowledgment; >25× adds a 5-second confirm cooldown; 40× is the hard cap. '
        + 'Warning trigger also scales by skill tier (T1 5× / T2 10× / T3 25×). These are gates, not blocks — Arx never recommends a leverage number.',
      persona: { s2: 'Mostly T3 — warned only at 25×.', s7: 'Guided — warned at 10×, cooldown at 25×.' } },
  },

  /* ── GROUP: walletDetail — Copy/Wallet-detail card thresholds ─────────────
     Mix of spec-backed and app heuristics; each entry marks which. */
  walletDetail: {
    trackRecordFilter: { label: 'Track-record filter (Copy · My filters)', spec: '08-2-1 §7.3 + S05 qualifying window',
      threshold: { activeDormantDays: 30, win30d: { days: 30, positions: 20 }, win90d: { days: 90, positions: 50 } },
      rationale: 'Two eligibility gates for S7, above Risk. ACTIVE = days_since_last_fill < 30 (08-2-1 §8.4 inactive line + 08-4 "dormant 30d → copy auto-pauses") — never copy dead capital. MIN HISTORY = window readiness: 30d+ needs ≥30 days & ≥20 completed positions, 90d+ needs ≥90 days & ≥50 positions. These are eligibility, not return-chasing (spec §6.5 still bans PnL/win-rate filters). App derives from weeks/tradesOf proxies until real days_of_history / completed_position_count fields are wired.',
      persona: { s7: 'Don\'t copy a dormant or unproven wallet — the two cheapest mistakes.', s2: 'n/a.' } },
    winRateBands: { label: 'Win-rate plain-language', spec: 'APP HEURISTIC (display only; 55% line ← 08-3 leader gate)',
      threshold: { profitableMost: 0.55, halfTime: 0.45 },
      classify: function (wr) { return wr >= this.threshold.profitableMost ? 'Profitable on most trades' : wr >= this.threshold.halfTime ? 'Profitable about half the time' : 'Profitable under half the time'; },
      rationale: '≥55% / ≥45% / else — turns a raw win-rate into expectancy words. 55% aligns with the leader gate; 45% marks the coin-flip band. '
        + 'Always paired with biggest-gain context so a high win-rate that loses big is not read as "good."',
      persona: { s7: 'Honest read of "wins often" without implying profit.', s2: 'Context on a studied wallet.' } },
    leverageVerdict: { label: 'Wallet leverage verdict', spec: 'APP HEURISTIC',
      threshold: { ok: 5, watch: 10, chronicHigh: 12 },
      classify: function (lev) { return lev <= this.threshold.ok ? 'within reason' : lev <= this.threshold.watch ? 'moderate' : 'high'; },
      rationale: '≤5× ok / ≤10× watch / >10× high; ≥12× tagged "chronically high — extreme vs peers." App heuristic for the risk card; '
        + 'distinct from the trade-ticket warning gates (those are about the USER\'s order, this judges a wallet\'s habit).',
      persona: { s7: 'Is this leader a leverage cowboy.', s2: 'Risk texture of a cohort.' } },
    peerPercentile: { label: 'Peer-percentile bands', spec: 'APP HEURISTIC', threshold: { good: 66, mid: 40 },
      classify: function (p) { return p >= this.threshold.good ? 'up' : p >= this.threshold.mid ? 'mid' : 'down'; },
      rationale: '≥66 good / ≥40 mid / else low — colors the "vs its cohort" bars. Thirds split for a quick top/middle/bottom read among same-type wallets.',
      persona: { s7: 'Ranks a leader within its own performance class.' } },
    bookConcentration: { label: 'Top-position concentration flag', spec: 'APP HEURISTIC (echoes S04 crowding intuition)', threshold: { caution: 0.60 },
      test: function (topPctOfBook) { return topPctOfBook >= this.threshold.caution; },
      rationale: '≥60% of the book in one position → caution tint. One big position dominates the wallet\'s fate; a concentration warning, not a verdict.',
      persona: { s7: 'Single-bet risk in a wallet you might copy.', s2: 'Concentration texture.' } },
    earlyConsensus: { label: 'Copier crowd state', spec: 'APP HEURISTIC', threshold: { consensus: 600 },
      classify: function (copiers, early) { return early ? 'few copiers for this standing' : copiers > this.threshold.consensus ? 'consensus pick' : 'moderate following'; },
      rationale: '>600 copiers = "consensus pick"; "early" = high standing but few copiers (an edge before the crowd). Seed number for the demo; '
        + 'real cut should be a percentile of the copier distribution.',
      persona: { s7: 'Am I early to this leader or late to a crowded one.' } },
    expectancy: { label: 'Expectancy verdict', spec: 'APP HEURISTIC (satisfies 08-2-1 §7.1 "plain-language only")',
      rule: 'win-rate band × biggest-gain-share → "skill-shaped" (gains spread) vs "concentrated in one trade".',
      threshold: { spreadMax: 0.12, concentratedMin: 0.50 },
      rationale: 'Combines win frequency with profit spread so we never show win-rate alone. ≤12% biggest-gain share = well-spread/skill-shaped; '
        + '≥50% = one-trade-carried. Directly implements the spec\'s display constraint (no raw Sharpe, never win-rate without expectancy).',
      persona: { s7: 'The honest "is this skill or one lucky trade" read.' } },
  },

  /* ── GROUP: copyBench — benchmark every PnL is judged against ─────────────*/
  copyBench: {
    btcReturn: { label: 'BTC-PERP benchmark', spec: 'APP HEURISTIC (demo values; real = live BTC return)',
      reference: { '24H': 1.2, '7D': 4.8, '30D': 9.5, '90D': 31.0 },
      rationale: 'Every leader return is shown against BTC over the same window — "beat the benchmark" framing. Demo values; production pulls live BTC-PERP return.',
      persona: { s7: 'Did this leader actually beat just holding BTC.', s2: 'Relative-strength context.' } },
  },

  /* ── GROUP: heatmapColor — pulse tile shading (spec: none — visual) ───────*/
  heatmapColor: {
    coverage: { label: 'Heatmap coverage & tail CTA', spec: 'APP UX DECISION (no spec)', threshold: { topN: 10 },
      rationale: 'The combined tiles represent the asset class\'s total OI (perps) / volume (spot) over the window — each box\'s AREA is its '
        + 'share of that total. We show the TOP 10 by size, not the whole long tail: a proportional treemap on a phone turns the smallest '
        + 'ranks into illegible slivers. Everything past top-10 collapses into one distinct "See all" call-to-action box below the grid '
        + '(NOT a proportional tile — a fixed CTA), which routes to the full Browse list for that class. So the map stays legible while '
        + 'still honestly labeled "Top 10 · sized by OI".',
      persona: { s2: 'Glance the 8 that matter; tap the CTA to scan the full class.', s7: 'Same — the dominant markets at a glance.' } },
    ramp: { label: 'Regime tile color ramp', spec: 'APP VISUAL (no spec)', threshold: { floorPct: 42, ceilPct: 100 },
      clampPerClass: { Crypto: 10, PreIPO: 8, Stocks: 5, Commodities: 5, Fx: 3 },
      rationale: 'Tile mixes regime mint/coral over surface from 42%→100% by |Δ| / per-class clamp. Floor 42% so weak moves still read (not washed-out); '
        + 'clamp differs by class because a 6% move is huge in FX but normal in crypto — keeps color comparable within a class.',
      persona: { s2: 'Instant "what moved hard" scan.', s7: 'Same — glance read.' } },
  },

  /* ── GROUP: sentiment — instrument gauge (derived from S01) ───────────────*/
  sentiment: {
    gauge: { label: 'Sentiment 0–100 gauge', spec: 'APP HEURISTIC (linear map of S01 bias_index)',
      compute: function (biasIndex) { return Math.round((biasIndex + 100) / 2); },
      rationale: 'Maps bias_index (−100…+100) to a 0–100 gauge for the instrument overview. Pure rescale of S01 — no new data, just a friendlier dial.',
      persona: { s2: 'One-glance lean before the detailed bias tab.', s7: 'Plain mood read.' } },
  },

  /* ── GROUP: wallsGeometry — instrument wall placement (demo offsets) ──────*/
  wallsGeometry: {
    offsets: { label: 'Wall price offsets (demo)', spec: 'APP PLACEHOLDER (real walls = S03 bucket model)',
      reference: { entry: 0.977, forcedDown: 0.949, profit: 1.035, forcedUp: 1.056 },
      rationale: 'arxSignalsFor places demo walls at fixed % offsets off mark so the instrument tabs render per-asset. PLACEHOLDER — real S03 '
        + 'builds walls from the live position-bucket model (wallsS03.qualify), not fixed offsets. Flagged so it is replaced, not trusted.',
      persona: { s2: 'Visual price map only until real S03 lands.', s7: 'n/a.' } },
  },

  /* ── GROUP: smartMap — which symbols show the smart-money lean (curation) ─*/
  smartMap: {
    leanBadge: { label: 'Smart-money lean badge eligibility', spec: 'APP CURATION (demo)',
      rationale: 'A curated set of symbols carries the ◆ smart-money lean badge in market rows. Demo curation standing in for the real '
        + 'per-instrument cluster contribution (08-2-3). Replace with live cohort presence, do not extend the hardcoded list.',
      persona: { s2: 'Hints where proven money is active.', s7: 'Discovery hook into who is there.' } },
  },

  /* ── GROUP: copyRiskRails — Copy setup parameters (spec 08-4 §3.4–3.5) ────
     Asset-Ratio mirroring. Two onboarding decisions + three pre-filled safety toggles. */
  copyRiskRails: {
    onboardingParams: {
      label: 'Five onboarding parameters', spec: '08-4 §3.4',
      params: {
        copyCapital:      { ui: 'Copy Capital',       internal: 'Allocated Capital',           decision: true,  range: 'floor $50 · ceiling = leader equity' },
        lossLimit:        { ui: 'Loss Limit',          internal: 'Account-Level Drawdown Stop', decision: true,  defaultPct: 50,           rangePct: [20, 75] },
        assetRatio:       { ui: 'Copy ratio',          internal: 'Asset Ratio',                 decision: false, default: 'auto',          range: '≤ 100% (above 1:1 self-inflicts slippage)' },
        leverageCap:      { ui: 'Leverage Cap',        internal: 'Max Leverage',                decision: false, default: 'Follow Leader', rangeX: [1, 40] },
        positionSizeLimit:{ ui: 'Position Size Limit', internal: 'Per-Trade Max',               decision: false, defaultPct: 70,           rangePct: [20, 100] },
      },
      rationale: 'Asset-Ratio mirroring: the leaderboard % return becomes the follower\'s realized % — preserves the mental model and '
        + 'keeps custody in their account. Loss Limit 50% sits ABOVE quality leaders\' 25–40% MaxDD so it catches blowups without firing '
        + 'in ordinary recovery. Position Size Limit 70% lets through 30–50% conviction trades, clips all-in outliers. Ratio caps at 100% '
        + 'because above 1:1 a follower moves the venue price the leader didn\'t.',
      persona: { s7: 'THE copy decision surface — two real choices, three safety pre-fills.', s2: 'n/a — S2 lead, they don\'t copy.' },
    },
    slippageCaps: {
      label: 'Entry / Exit slippage caps', spec: '08-4 §3.5 + C2/C3',
      threshold: { entryFallbackPct: 0.5, entryRangePct: [0.1, 2.0], exitFallbackPct: 1.0, exitRangePct: [0.1, 5.0], bypassFallbackPct: 1.0, bypassThinBookPct: 5.0, precisionBps: 1 },
      rationale: 'The only Advanced params with a system fallback when OFF — "no cap at all" (thin-book fill 5%+ off) is worse than a '
        + 'wrong cap. Exit (1.0%) wider than entry (0.5%) because exits happen in stress on half-depth books. Loss Limit and venue '
        + 'liquidation BYPASS the user cap (1.0% fallback → 5% if thin) — a tight close cap must never trap a forced exit beyond the configured loss.',
      persona: { s7: '"Rather miss a trade than chase a bad fill" — execution-quality guard.', s2: 'n/a.' },
    },
    lossLimitMechanics: {
      label: 'Loss Limit mechanics', spec: '08-4 §3.4.2 + C8',
      threshold: { evalCadenceSec: 30, loosenCooldownHrs: 24, fires: 'equity ≤ Allocated × (1 − loss%)' },
      rationale: 'Evaluated every 30s AND on every fill (30s catches gradual decay, per-fill catches cascades). Tightening is immediate; '
        + 'LOOSENING needs a 24h cooldown — protects against panic-loosening mid-drawdown. A cascade can travel between checks, so realized '
        + 'loss can exceed the limit; disclosed up front as "a target, not a guarantee."',
      persona: { s7: 'The mandatory safety floor — cannot be turned off.', s2: 'n/a.' },
    },
    copyCapitalBounds: {
      label: 'Copy Capital bounds', spec: '08-4 C5',
      threshold: { hardFloorUsd: 50, ratioWarnPct: 3, recommendedPct: 10, hardCeiling: 'leader equity' },
      rationale: 'Hard floor $50 and leader-equity ceiling are hard blocks. The <3%-of-leader-equity mirror-rate cliff is recoverable — '
        + 'warn with quantified copy, allow proceed. Recommended ≥10% keeps realized-vs-stated tracking tight.',
      persona: { s7: 'Sizing guard so a tiny allocation doesn\'t silently mis-mirror.' },
    },
  },

  /* ── GROUP: copyExecution — realized-vs-stated + execution (spec 08-4) ────*/
  copyExecution: {
    divergenceBand: {
      label: 'Realized-vs-stated divergence', spec: '08-4 C6 (CANONICAL — supersedes app heuristic)',
      threshold: { tightPp: 1.5, midBandPp: [2, 4], thinPp: 4 },
      rationale: 'Spec target: realized tracks stated within ≤1.5pp at ≥10% allocation; 2–4pp at 3–10%; 4pp+ below 3%. NOTE — the app '
        + 'currently shows "~55% capture / ~92% kept", which CONTRADICTS this spec (it models a small pp DIVERGENCE from fees+slippage+latency, '
        + 'not a 45% haircut). Wire copier-PnL projections to this band; retire the 55%/92% figures.',
      persona: { s7: 'Honest "what copiers actually keep" — small gap, not a haircut.', s2: 'n/a.' },
    },
    twap: {
      label: 'TWAP execution slicing', spec: 'APP HEURISTIC (large-order execution)',
      threshold: { sliceSec: 30, maxSlippagePctPerSlice: 3 },
      rationale: '30-second slices, max 3% slippage each — lowers market impact on large orders. App heuristic; calibrate vs real book depth.',
      persona: { s2: 'Large manual orders.', s7: 'n/a (copy uses limit-at-leader-price).' },
    },
    triggerPriority: {
      label: 'Close trigger priority', spec: '08-4 §3.4.3',
      order: 'first-to-fire wins (idempotent): leader mirrored close · user SL/TP · Loss Limit · venue liquidation',
      rationale: 'Closes are idempotent so there is no conflict resolution — whichever fires first wins. Each layer catches what others miss '
        + '(SL lets many-small-losses through; Loss Limit lets a single gap-move liquidate between ticks).',
      persona: { s7: 'Why "my SL and the loss limit both exist" — different scopes.' },
    },
  },

};

/* ── Runtime classifiers (decision trees from the spec) ───────────────────── */
var ARX_CLASSIFY = {
  capitalSize: function (medianPerpUsd) {
    var b = ARX_LOGIC.walletTaxonomy.capitalSize.bands;
    for (var i = 0; i < b.length; i++) if (medianPerpUsd >= b[i][1] && medianPerpUsd < b[i][2]) return b[i][0];
    return 'micro';
  },
  biasBucket: function (biasIndex) {
    var sub = ARX_LOGIC.biasS01.buckets.subIndecisive;
    if (biasIndex > -20 && biasIndex < 20) { for (var j = 0; j < sub.length; j++) if (biasIndex >= sub[j][0] && biasIndex < sub[j][1]) return sub[j][2]; }
    var b = ARX_LOGIC.biasS01.buckets.bands;
    for (var i = 0; i < b.length; i++) if (biasIndex >= b[i][0] && biasIndex < b[i][1]) return b[i][2];
    return biasIndex >= 100 ? 'Very Bullish' : 'Very Bearish';
  },
  drawdownBand: function (dd) { return ARX_LOGIC.trajectoryS05.drawdownBands.classify(dd); },
  winRateBand: function (wr) { return ARX_LOGIC.walletDetail.winRateBands.classify(wr); },
  leverageVerdict: function (lev) { return ARX_LOGIC.walletDetail.leverageVerdict.classify(lev); },
  sentiment: function (biasIndex) { return ARX_LOGIC.sentiment.gauge.compute(biasIndex); },
};

/* Resolve the single pip a heatmap tile should show (risk-first priority). */
function arxHeatmapPip(sig, m, f) {
  if (!sig) return null;
  var G = ARX_LOGIC.heatmap, order = ['divergence', 'crowded', 'conviction'];
  for (var i = 0; i < order.length; i++) { var d = G[order[i]]; if (d.test(sig, m, f)) return { key: order[i], glyph: d.glyph, label: d.label, short: d.short, full: d.full }; }
  return null;
}

var ARX_SIGNAL_DEFS = ARX_LOGIC;  // back-compat alias
Object.assign(window, { ARX_LOGIC, ARX_SIGNAL_DEFS, ARX_CLASSIFY, arxHeatmapPip });
