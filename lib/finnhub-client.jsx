// arx/finnhub-client.jsx — live US-equity quotes via Finnhub (free tier).
//
// Budget discipline: free tier = 60 req/min. We stay well under (5–10% of
// headroom max) via:
//   • a hard client-side rate limiter (MAX_PER_MIN, conservative)
//   • a shared quote cache (QUOTE_TTL) so repeat reads don't spend calls
//   • batching: one poll cycle fetches the small set of visible symbols
//
// CORS: Finnhub serves Access-Control-Allow-Origin:* for /quote, so the
// browser can call it directly with ?token=. (Key is visible client-side —
// fine for a prototype; rotate before public launch.)

const FINNHUB_TOKEN = 'd8ggcnhr01qlgcujb4n0d8ggcnhr01qlgcujb4ng';
const FINNHUB_BASE  = 'https://finnhub.io/api/v1';
const QUOTE_TTL     = 30000;   // ms — a symbol's quote is reused for 30s
const MAX_PER_MIN   = 45;      // hard cap (free tier 60) → ~25% headroom

// Which ARX symbols map to a Finnhub-quotable US-equity ticker. Commodities
// / indices (GOLD, SPX, BRENT) need a paid plan, so they stay static.
const FINNHUB_SYMBOL_MAP = {
  NVDA: 'NVDA', TSLA: 'TSLA', AAPL: 'AAPL', MSFT: 'MSFT', AMZN: 'AMZN',
  META: 'META', GOOGL: 'GOOGL', COIN: 'COIN', MSTR: 'MSTR', AMD: 'AMD',
};

// ── Rate limiter ──────────────────────────────────────────────
const _callTimes = [];
function _canCall() {
  const now = Date.now();
  while (_callTimes.length && now - _callTimes[0] > 60000) _callTimes.shift();
  return _callTimes.length < MAX_PER_MIN;
}
function _recordCall() { _callTimes.push(Date.now()); }

// ── Quote cache ───────────────────────────────────────────────
const _quoteCache = new Map();  // ticker -> { t, data }

async function fetchQuote(ticker) {
  const cached = _quoteCache.get(ticker);
  if (cached && Date.now() - cached.t < QUOTE_TTL) return cached.data;
  if (!_canCall()) return cached ? cached.data : null;  // budget guard
  try {
    _recordCall();
    const r = await fetch(`${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(ticker)}&token=${FINNHUB_TOKEN}`);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    // Finnhub quote: { c: current, d: change, dp: %change, h, l, o, pc }
    if (j && typeof j.c === 'number' && j.c > 0) {
      const data = { price: j.c, change: j.dp, high: j.h, low: j.l, prevClose: j.pc };
      _quoteCache.set(ticker, { t: Date.now(), data });
      return data;
    }
  } catch (e) { /* keep any cached value, else null */ }
  return cached ? cached.data : null;
}

// ── Hook: live quotes for a set of ARX symbols ─────────────────
// Returns a map { ARXSYM: { price, change } } merged from Finnhub where
// available. Symbols without a Finnhub mapping are simply absent (callers
// fall back to their static data).
function useFinnhubQuotes(symbols) {
  const live = (typeof useLiveDataEnabled === 'function') ? useLiveDataEnabled() : true;
  const [map, setMap] = React.useState({});
  const key = (symbols || []).join(',');
  React.useEffect(() => {
    if (!live) return;
    let mounted = true;
    const tickers = (symbols || [])
      .map(s => [s, FINNHUB_SYMBOL_MAP[s]])
      .filter(([, t]) => t);
    if (!tickers.length) return;
    const poll = async () => {
      const out = {};
      for (const [sym, ticker] of tickers) {
        const q = await fetchQuote(ticker);
        if (q) out[sym] = q;
      }
      if (mounted && Object.keys(out).length) { setMap(prev => ({ ...prev, ...out })); try { window.__arxStocks = Object.assign(window.__arxStocks || {}, out); } catch(e){} }
    };
    poll();
    const id = setInterval(poll, QUOTE_TTL);
    return () => { mounted = false; clearInterval(id); };
  }, [key, live]);
  return map;
}

// Format a Finnhub price like our static strings (thousands sep, 2dp).
function fmtQuote(n) {
  if (n == null || !isFinite(n)) return null;
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

Object.assign(window, {
  FINNHUB_SYMBOL_MAP, useFinnhubQuotes, fmtQuote, fetchQuote,
});
