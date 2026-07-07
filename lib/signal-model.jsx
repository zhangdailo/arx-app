// arx/signal-model.jsx — foundation for the signals pipeline (Recs 1, 3, 5, 7, 9, 11).
// Purely additive: a structured signal-object model, the 5-7-5 catalogue, the
// 5-7-3 instrument clusters, the 5-7-1 cohort actors, and 5-2-4 metric labels.
// Screens wire into this incrementally; nothing here mutates existing UI.

// ── 5-7-1 · Cohort actors ──────────────────────────────────────
const ARX_COHORTS = {
  legends:     { id: 'legends',     label: 'Legends',      desc: 'Top performing wallets, 30d' },
  smart_money: { id: 'smart_money', label: 'Smart Money',  desc: '90d-proven, controlled drawdown' },
  whales:      { id: 'whales',      label: 'Whales',       desc: 'Largest capital wallets' },
  kols:        { id: 'kols',        label: 'KOLs',         desc: 'Wallets linked to public X identities' },
  retail:      { id: 'retail',      label: 'Retail',       desc: 'Broad non-labelled flow' },
};

// ── 5-7-3 · Instrument cluster maps ────────────────────────────
const ARX_CLUSTERS = {
  majors:    { id: 'majors',    label: 'Majors',        members: ['BTC','ETH'] },
  l1l2:      { id: 'l1l2',      label: 'L1 / L2',       members: ['SOL','ARB','AVAX','SUI','HYPE'] },
  memecoins: { id: 'memecoins', label: 'Memecoins',     members: ['DOGE','WIF','BONK','PEPE'] },
  ai_stocks: { id: 'ai_stocks', label: 'AI Stocks',     members: ['NVDA','TSLA','MSFT','META'] },
  indices:   { id: 'indices',   label: 'Indices',       members: ['SPX'] },
  rwa:       { id: 'rwa',       label: 'RWA / Commod.',  members: ['GOLD','BREN','BRENT'] },
};
function clusterForSymbol(sym) {
  for (const k in ARX_CLUSTERS) if (ARX_CLUSTERS[k].members.includes(sym)) return ARX_CLUSTERS[k];
  return null;
}

// ── 5-7-5 · Signals catalogue ──────────────────────────────────
// Each type: id, label, icon, category, and how confidence is framed.
const ARX_SIGNAL_CATALOGUE = {
  compression:     { id: 'compression',     label: 'Compression',        icon: '🪤', category: 'regime',  blurb: 'Volatility coiling — expansion likely' },
  regime_shift:    { id: 'regime_shift',    label: 'Regime shift',       icon: '🔀', category: 'regime',  blurb: 'Trading regime changed' },
  whale_rotation:  { id: 'whale_rotation',  label: 'Whale rotation',     icon: '🐋', category: 'flow',    blurb: 'Large wallets rotating exposure' },
  funding_flip:    { id: 'funding_flip',    label: 'Funding flip',       icon: '💱', category: 'flow',    blurb: 'Funding crossed zero' },
  liq_cluster:     { id: 'liq_cluster',     label: 'Liquidation cluster',icon: '🧨', category: 'risk',    blurb: 'Dense liquidation level nearby' },
  cohort_net:      { id: 'cohort_net',      label: 'Cohort positioning', icon: '🧭', category: 'flow',    blurb: 'Net long/short of a cohort' },
  conviction:      { id: 'conviction',      label: 'Conviction shift',   icon: '📈', category: 'signal',  blurb: 'Network conviction moved' },
  cluster_flow:    { id: 'cluster_flow',    label: 'Cluster flow',       icon: '🗺️', category: 'flow',    blurb: 'Capital rotating across a cluster' },
};

// ── 5-2-4 · Canonical metric labels (display + unit) ───────────
const ARX_METRICS = {
  realized_return_30d: { label: 'Realized return (30D)', unit: '%' },
  realized_return_90d: { label: 'Realized return (90D)', unit: '%' },
  max_drawdown:        { label: 'Max realized drawdown', unit: '%' },
  profit_factor:       { label: 'Profit factor',         unit: 'x' },
  sharpe:              { label: 'Sharpe ratio',          unit: '' },
  positions_90d:       { label: 'Positions (90D)',       unit: '' },
  aum:                 { label: 'AUM',                   unit: 'USDC' },
};

// ── 5-7-0 · Structured signal object factory ───────────────────
// makeSignal({...}) → canonical shape the surface layer renders. confidence
// 0..100; actors = cohort ids; ts = epoch ms.
function makeSignal({ type, instrument, confidence = 50, actors = [], regime = null, text = '', ts = Date.now() }) {
  const cat = ARX_SIGNAL_CATALOGUE[type] || { label: type, icon: '•', category: 'signal', blurb: '' };
  return {
    type, instrument,
    cluster: clusterForSymbol(instrument)?.id || null,
    confidence: Math.max(0, Math.min(100, Math.round(confidence))),
    actors,
    regime,
    text: text || cat.blurb,
    ts,
    meta: cat,
  };
}

Object.assign(window, {
  ARX_COHORTS, ARX_CLUSTERS, clusterForSymbol,
  ARX_SIGNAL_CATALOGUE, ARX_METRICS, makeSignal,
});
