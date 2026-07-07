// arx/hl-client.jsx — Hyperliquid live-data client (browser-only, no backend)
//
// What this gives us:
//   - hlPost(body)              ← POST helper to https://api.hyperliquid.xyz/info
//   - HLBus.subscribe(sub, cb)  ← singleton WebSocket, auto-reconnects, multi-sub
//   - useHLAllMids()            ← live mid prices for every perp { "BTC": "73212.5", … }
//   - useHLAssetCtxs()          ← assetCtxs (24h vol, OI, funding, prevDayPx) refreshed every 30s
//   - useHLTopMarkets(n)        ← derived live top-N markets by 24h vol
//   - useHLLiveStatus()         ← boolean: are we receiving live updates?
//
// All hooks fall back gracefully — if HL is unreachable, they return null/empty
// and the screens use their existing demo data. The prototype never breaks.

const HL_REST = 'https://api.hyperliquid.xyz/info';
const HL_WS   = 'wss://api.hyperliquid.xyz/ws';

// ───────────────────────────────────────────────────────────────
// POST helper
// ───────────────────────────────────────────────────────────────
async function hlPost(body, opts = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), opts.timeout || 8000);
  try {
    const r = await fetch(HL_REST, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!r.ok) throw new Error('HL HTTP ' + r.status);
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}

// ───────────────────────────────────────────────────────────────
// Singleton WebSocket bus
//
// Why singleton: every screen that wants live prices subscribes to the same
// connection. Cheap on the wire (one WS), expensive if we churn (reconnect
// time). We keep it alive across navigation.
// ───────────────────────────────────────────────────────────────
const HLBus = (() => {
  let ws = null;
  let connected = false;
  let pingTimer = null;
  // channel → Set<cb>
  const subs = new Map();
  // subscription messages to (re)send on connect
  const wanted = new Set();

  function ensureConnected() {
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;
    try {
      ws = new WebSocket(HL_WS);
    } catch (e) {
      scheduleReconnect();
      return;
    }
    ws.onopen = () => {
      connected = true;
      announce();
      for (const sub of wanted) sendSub(sub);
      // Heartbeat — HL doesn't strictly require it but keeps NATs alive
      clearInterval(pingTimer);
      pingTimer = setInterval(() => {
        if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ method: 'ping' }));
      }, 25000);
    };
    ws.onclose = () => {
      connected = false; announce();
      clearInterval(pingTimer);
      scheduleReconnect();
    };
    ws.onerror = () => { /* close will fire */ };
    ws.onmessage = (ev) => {
      let msg;
      try { msg = JSON.parse(ev.data); } catch (e) { return; }
      // HL message shape: { channel: 'allMids' | 'l2Book' | ..., data: ... }
      if (msg && msg.channel) {
        const handlers = subs.get(msg.channel);
        if (handlers) for (const cb of handlers) {
          try { cb(msg.data); } catch (e) { console.warn('HL handler error', e); }
        }
      }
    };
  }
  function scheduleReconnect() {
    setTimeout(ensureConnected, 1500);
  }
  function sendSub(sub) {
    if (ws?.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ method: 'subscribe', subscription: sub }));
  }
  function announce() {
    window.dispatchEvent(new CustomEvent('hl:status', { detail: { connected }}));
  }

  return {
    subscribe(sub, cb) {
      const key = sub.type;
      if (!subs.has(key)) subs.set(key, new Set());
      subs.get(key).add(cb);
      wanted.add(sub);
      ensureConnected();
      sendSub(sub);
      return () => {
        subs.get(key)?.delete(cb);
        // We deliberately don't unsubscribe on the wire — keeping the channel
        // open for other mounts is cheaper than churn. The set is cleaned up
        // when the page unloads.
      };
    },
    isConnected() { return connected; },
  };
})();

// ───────────────────────────────────────────────────────────────
// Live-data flag — flipped by the Tweaks panel. When off, every hook
// returns null/empty so screens render their ARX_DATA fallback.
// ───────────────────────────────────────────────────────────────
function useLiveDataEnabled() {
  const [v, setV] = React.useState(() => window.__ARX_LIVE !== false);
  React.useEffect(() => {
    const h = () => setV(window.__ARX_LIVE !== false);
    window.addEventListener('arx:live-changed', h);
    return () => window.removeEventListener('arx:live-changed', h);
  }, []);
  return v;
}

// ───────────────────────────────────────────────────────────────
// Hook · live mid prices  { "BTC": "73212.5", "ETH": "3841.2", … }
// ───────────────────────────────────────────────────────────────
function useHLAllMids() {
  const live = useLiveDataEnabled();
  const [mids, setMids] = React.useState({});
  React.useEffect(() => {
    if (!live) return;
    return HLBus.subscribe({ type: 'allMids' }, (data) => {
      // allMids data shape: { mids: { "BTC": "73212.5", … } }
      if (data && data.mids) setMids(data.mids);
    });
  }, [live]);
  return live ? mids : {};
}

// ───────────────────────────────────────────────────────────────
// Hook · asset contexts (24h vol, OI, funding, prevDayPx)
// Polled every 30s via REST. Returns the parsed shape:
//   [ {name, szDecimals, …}, {dayNtlVlm, openInterest, prevDayPx, funding, ...} ]
//   for each asset, indexed in parallel.
// We collapse to a friendly object keyed by symbol.
// ───────────────────────────────────────────────────────────────
function useHLAssetCtxs() {
  const live = useLiveDataEnabled();
  const [data, setData] = React.useState(null);
  React.useEffect(() => {
    if (!live) { setData(null); return; }
    let mounted = true;
    const fetchIt = async () => {
      try {
        const r = await hlPost({ type: 'metaAndAssetCtxs' });
        if (!mounted) return;
        if (!Array.isArray(r) || r.length < 2) return;
        const universe = r[0]?.universe || [];
        const ctxs     = r[1] || [];
        const merged = {};
        for (let i = 0; i < universe.length; i++) {
          const u = universe[i]; const c = ctxs[i];
          if (!u || !c) continue;
          merged[u.name] = {
            symbol:      u.name,
            szDecimals:  u.szDecimals,
            volume24:    parseFloat(c.dayNtlVlm || '0'),
            openInterest:parseFloat(c.openInterest || '0'),
            funding:     parseFloat(c.funding || '0'),
            prevDayPx:   parseFloat(c.prevDayPx || '0'),
            markPx:      parseFloat(c.markPx || c.midPx || '0'),
            oraclePx:    parseFloat(c.oraclePx || '0'),
          };
        }
        setData(merged);
      } catch (e) { /* fall back */ }
    };
    fetchIt();
    const id = setInterval(fetchIt, 10000);
    return () => { mounted = false; clearInterval(id); };
  }, [live]);
  return live ? data : null;
}

// ───────────────────────────────────────────────────────────────
// Hook · top N markets by 24h volume, merged with live mids
// Returns the same shape as ARX_DATA.topMarkets so screens can drop it in:
//   { symbol, name, price, change, vol, spark }
// (spark stays the demo walk for now — separate hook would compute real
//  candles via candleSnapshot, but design-wise per-card sparklines look
//  identical so it isn't worth the request cost on first paint.)
// ───────────────────────────────────────────────────────────────
function useHLTopMarkets(n = 4) {
  const ctxs = useHLAssetCtxs();
  const mids = useHLAllMids();
  return React.useMemo(() => {
    if (!ctxs) return null;
    const arr = Object.values(ctxs).sort((a, b) => b.volume24 - a.volume24).slice(0, n);
    return arr.map(c => {
      const live = parseFloat(mids[c.symbol] || c.markPx || 0);
      const prev = c.prevDayPx || live;
      const change = prev ? ((live - prev) / prev) * 100 : 0;
      return {
        symbol: c.symbol,
        name: HL_NAME_MAP[c.symbol] || c.symbol,
        price: formatPrice(live),
        change,
        vol: formatLargeUSD(c.volume24),
        spark: makeProxySpark(c.symbol, change),
        live: true,
      };
    });
  }, [ctxs, mids, n]);
}

// ───────────────────────────────────────────────────────────────
// Hook · live status (header dot)
// ───────────────────────────────────────────────────────────────
function useHLLiveStatus() {
  const [connected, setConnected] = React.useState(() => HLBus.isConnected());
  React.useEffect(() => {
    const h = (e) => setConnected(e.detail.connected);
    window.addEventListener('hl:status', h);
    return () => window.removeEventListener('hl:status', h);
  }, []);
  return connected;
}

// ───────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────
const HL_NAME_MAP = {
  BTC: 'Bitcoin',  ETH: 'Ethereum', SOL: 'Solana', ARB: 'Arbitrum',
  AVAX: 'Avalanche', SUI: 'Sui', SEI: 'Sei', APT: 'Aptos',
  DOGE: 'Dogecoin', LINK: 'Chainlink', LTC: 'Litecoin', NEAR: 'Near',
  XRP: 'Ripple',   ADA: 'Cardano', DOT: 'Polkadot', MATIC: 'Polygon',
  BNB: 'Binance',  TIA: 'Celestia', INJ: 'Injective', AAVE: 'Aave',
  PEPE: 'Pepe',    WIF: 'dogwifhat', BONK: 'Bonk', HYPE: 'Hyperliquid',
};

function formatPrice(p) {
  if (!isFinite(p) || p === 0) return '—';
  if (p >= 1000)   return p.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (p >= 1)     return p.toLocaleString('en-US', { maximumFractionDigits: 4 });
  if (p >= 0.01)  return p.toFixed(4);
  return p.toPrecision(4);
}
function formatLargeUSD(v) {
  if (!isFinite(v)) return '—';
  if (v >= 1e9) return '$' + (v / 1e9).toFixed(2) + 'B';
  if (v >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M';
  if (v >= 1e3) return '$' + (v / 1e3).toFixed(1) + 'K';
  return '$' + v.toFixed(0);
}
// Make a proxy sparkline shaped like the change direction. Deterministic per
// symbol so it doesn't jitter on every render.
function makeProxySpark(symbol, change) {
  let h = 0; for (let i = 0; i < symbol.length; i++) h = (h * 31 + symbol.charCodeAt(i)) % 9973;
  const out = []; let v = 100;
  for (let i = 0; i < 24; i++) {
    h = (h * 9301 + 49297) % 233280;
    const r = (h / 233280 - 0.5);
    v += r * 2.5 + (change >= 0 ? 0.4 : -0.35);
    out.push(v);
  }
  return out;
}

// ───────────────────────────────────────────────────────────────
// LIVE dot indicator — pulsing green when connected, gray when not
// ───────────────────────────────────────────────────────────────
function HLLiveDot({ size = 8, label = false }) {
  // Live data is the base assumption across the app now — the pulsing
  // indicator is retired. Kept as a no-op so existing call sites stay valid.
  return null;
}

// ───────────────────────────────────────────────────────────────
// Hook · HL leaderboard
// Returns the leaderboard, with each row enriched with the chosen window's
// PnL / ROI / volume + a deterministic avatar color + short address.
// windowKey: 'day' | 'week' | 'month' | 'allTime'
// sortKey:   'roi' | 'pnl' | 'vlm'
// ───────────────────────────────────────────────────────────────
function useHLLeaderboard({ windowKey = 'month', sortKey = 'roi', limit = 40 } = {}) {
  const live = useLiveDataEnabled();
  const [raw, setRaw] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (!live) { setRaw(null); setLoading(false); return; }
    let mounted = true;
    setLoading(true);
    setError(null);
    const fetchIt = async () => {
      try {
        const r = await hlPost({ type: 'leaderboard' });
        if (!mounted) return;
        if (!r || !Array.isArray(r.leaderboardRows)) {
          // Some HL deployments return shape { leaderboardRows: [...] }; others
          // return the array directly. Handle both.
          if (Array.isArray(r)) setRaw(r);
          else setError('Unexpected response shape');
        } else {
          setRaw(r.leaderboardRows);
        }
      } catch (e) {
        setError(e.message || 'Network error');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchIt();
    // Leaderboard changes slowly — refresh every 10s for visible liveness
    const id = setInterval(fetchIt, 10000);
    return () => { mounted = false; clearInterval(id); };
  }, [live]);

  const rows = React.useMemo(() => {
    if (!live || !raw) return null;
    const enriched = raw.map(r => {
      const wp = (r.windowPerformances || []).reduce((acc, [k, v]) => { acc[k] = v; return acc; }, {});
      const win = wp[windowKey] || {};
      return {
        address:   r.ethAddress,
        name:      r.displayName || (r.ethAddress ? (r.ethAddress.slice(0, 6) + '…' + r.ethAddress.slice(-4)) : ''),
        shortAddr: r.ethAddress ? r.ethAddress.slice(0, 6) + '…' + r.ethAddress.slice(-4) : '',
        accountValue: parseFloat(r.accountValue || '0'),
        pnl:  parseFloat(win.pnl || '0'),
        roi:  parseFloat(win.roi || '0') * 100,
        vlm:  parseFloat(win.vlm || '0'),
        prize: r.prize || 0,
      };
    });
    const sorted = [...enriched].sort((a, b) => {
      if (sortKey === 'pnl')  return b.pnl - a.pnl;
      if (sortKey === 'vlm')  return b.vlm - a.vlm;
      return b.roi - a.roi;
    });
    return sorted.slice(0, limit);
  }, [raw, windowKey, sortKey, limit, live]);

  return { rows, loading: live && loading, error };
}

// ───────────────────────────────────────────────────────────────
// Hook · clearinghouseState (open positions for a wallet)
// Returns null until loaded or if disabled.
// ───────────────────────────────────────────────────────────────
function useHLClearinghouseState(address) {
  const live = useLiveDataEnabled();
  const [data, setData] = React.useState(null);
  React.useEffect(() => {
    if (!live || !address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setData(null); return;
    }
    let mounted = true;
    const fetchIt = async () => {
      try {
        const r = await hlPost({ type: 'clearinghouseState', user: address });
        if (mounted) setData(r);
      } catch (e) {
        if (mounted) setData(null);
      }
    };
    fetchIt();
    const id = setInterval(fetchIt, 10000);  // refresh every 10s
    return () => { mounted = false; clearInterval(id); };
  }, [address, live]);
  return data;
}

// Deterministic avatar color from address — gives every wallet a stable hue
function avatarColorFromAddress(addr) {
  if (!addr) return { bg: '#D7C2FF', face: '?' };
  let h = 0;
  for (let i = 2; i < Math.min(addr.length, 12); i++) h = (h * 31 + addr.charCodeAt(i)) % 360;
  const palette = ['#FFD89E','#FFC04A','#A1F0A4','#9FC7FF','#FFB3D1','#D7C2FF','#FFB69E','#B5F5E8','#F5C6FF','#C7E89E'];
  return { bg: palette[h % palette.length], face: addr.slice(2, 4).toUpperCase() };
}

Object.assign(window, {
  useLiveDataEnabled, useHLLeaderboard, useHLClearinghouseState,
  useHyperbotKOLs, useHyperbotSmartWhales, enrichRowIdentity,
  avatarColorFromAddress,
});

// ═══════════════════════════════════════════════════════════════
// HYPERBOT KOL + SMART-WHALE IDENTITY ENRICHMENT
// /api/leaderboard/kol         → X handle map (Machi, etc.)
// /api/leaderboard/smart/recommend → community whale labels
// ═══════════════════════════════════════════════════════════════

const HYPERBOT_KOL_FALLBACK = [
  { twitterName: 'Machi Big Brother', username: 'machibigbrother', address: '0xf3f496c9486be5924a93d67e98298733bb47057c',  accountTotalValue: 12400000, totalPnl: 3800000, winRate: 0.62 },
  { twitterName: 'James Wynn',        username: 'JamesWynnReal',   address: '0xc62df97dcf96324adf4ed7b8e7fbf91cb89bf6f1',  accountTotalValue:  8200000, totalPnl: 2100000, winRate: 0.58 },
  { twitterName: 'qwatio',            username: 'qwatio',          address: '0x2aab3badd6a5daa388da47de4c72a6fa618a6265',  accountTotalValue:  5400000, totalPnl: 1700000, winRate: 0.71 },
  { twitterName: 'CBB',               username: 'CryptoBullDude',  address: '0x31ca8395cf6629a4d4f5b5a59cf24f72cd35b5e9',  accountTotalValue:  3200000, totalPnl:  980000, winRate: 0.55 },
  { twitterName: 'Eugene Ng Ah Sio',  username: 'EugeneNgAhSio',   address: '0x7d8146cf21e8d7cbe46054e01588207b51198729',  accountTotalValue:  2800000, totalPnl:  720000, winRate: 0.68 },
];
const HYPERBOT_SMART_FALLBACK = [
  { address: '0x000000000000000000000000000000000000aa01', label: '30-Loss Long Whale' },
  { address: '0x000000000000000000000000000000000000aa02', label: 'Largest ZEC Short'  },
  { address: '0x000000000000000000000000000000000000aa03', label: 'BTC Mega Bull'      },
  { address: '0x000000000000000000000000000000000000aa04', label: 'SOL Cycle Top Picker' },
];

function mapByAddr(arr) {
  const m = new Map();
  for (const it of arr || []) {
    const a = (it.address || '').toLowerCase();
    if (a) m.set(a, it);
  }
  return m;
}

function useHyperbotKOLs() {
  const live = useLiveDataEnabled();
  const [map, setMap] = React.useState(() => mapByAddr(HYPERBOT_KOL_FALLBACK));
  React.useEffect(() => {
    if (!live) return;
    let mounted = true;
    const fetchIt = async () => {
      try {
        const r = await fetch('https://hyperbot.network/api/leaderboard/kol', { mode: 'cors' });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const data = await r.json();
        const arr = Array.isArray(data) ? data : (data?.data || data?.leaderboard || []);
        if (!mounted || !arr.length) return;
        setMap(mapByAddr(arr));
      } catch (e) { /* keep fallback */ }
    };
    fetchIt();
    const id = setInterval(fetchIt, 60000);
    return () => { mounted = false; clearInterval(id); };
  }, [live]);
  return map;
}

function useHyperbotSmartWhales() {
  const live = useLiveDataEnabled();
  const [map, setMap] = React.useState(() => mapByAddr(HYPERBOT_SMART_FALLBACK));
  React.useEffect(() => {
    if (!live) return;
    let mounted = true;
    const fetchIt = async () => {
      try {
        const r = await fetch('https://hyperbot.network/api/leaderboard/smart/recommend', { mode: 'cors' });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const data = await r.json();
        const arr = Array.isArray(data) ? data : (data?.data || data?.recommend || []);
        if (!mounted || !arr.length) return;
        setMap(mapByAddr(arr));
      } catch (e) { /* keep fallback */ }
    };
    fetchIt();
    const id = setInterval(fetchIt, 300000);
    return () => { mounted = false; clearInterval(id); };
  }, [live]);
  return map;
}

function enrichRowIdentity(row, kolMap, whaleMap) {
  const a = (row.address || '').toLowerCase();
  const kol = kolMap?.get(a);
  const whale = whaleMap?.get(a);
  return {
    ...row,
    kol: kol ? {
      displayName: kol.twitterName,
      handle: kol.username,
      avatarUrl: `https://unavatar.io/twitter/${kol.username}`,
      twitterUrl: `https://x.com/${kol.username}`,
      verified: true,
    } : null,
    whaleLabel: whale ? whale.label : null,
  };
}

Object.assign(window, {
  hlPost, HLBus,
  useHLAllMids, useHLAssetCtxs, useHLTopMarkets, useHLLiveStatus,
  HLLiveDot, HL_NAME_MAP, formatPrice, formatLargeUSD,
});
