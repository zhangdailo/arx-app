/* ═══ ARX · Quant API client (real Hyperliquid warehouse data) ═══════════════
   Live, CORS-enabled warehouse: quant-api.arxtrade.dev (X-API-Key).
   Endpoints used:
     GET /v1/markets/perp/coins                  → 452 listed perps
     GET /v1/markets/perp/{coin}/asset-ctx       → latest mark/oracle/mid, prev-day,
                                                    24h $vol, OI (coin), funding, premium
     GET /v1/markets/perp/{coin}/daily           → 90d EOD bars (vol, fills, users, OI, liq)
   We fetch asset-ctx for a curated working set (the symbols the app actually shows),
   compute 24h change + OI$ + liquidity tier, cache 60s, and expose a React hook.
   Falls back silently to seeded data when offline — never throws into the UI. */

const ARX_QUANT_BASE = 'https://quant-api.arxtrade.dev';
const ARX_QUANT_KEY  = 'L4jmBzJnDoW6V8X1qdOVGi40NcZ/3kg8MHymaLZ7TVk=';
const ARX_QUANT_TTL  = 60 * 1000;

// Working set — the perps the cockpit / movers / heatmap surface. (Pre-IPO & commodities
// like OPENAI/ANTHRP/URANIUM aren't on HL, so they stay seeded.)
const ARX_QUANT_COINS = ['BTC','ETH','SOL','HYPE','XRP','DOGE','AVAX','SUI','ARB','LINK','LTC','BNB','APT','OP','SEI','TIA','WIF','PEPE','INJ','NEAR'];

function arxQNum(v){ const n = parseFloat(v); return Number.isFinite(n) ? n : 0; }
function arxQuantFetch(path, ms){
  const c = new AbortController(); const to = setTimeout(()=>c.abort(), ms||8000);
  return fetch(ARX_QUANT_BASE+path, { headers:{ 'X-API-Key':ARX_QUANT_KEY, 'accept':'application/json' }, signal:c.signal })
    .then(r=> r.ok ? r.json() : Promise.reject(r.status))
    .finally(()=>clearTimeout(to));
}

// normalize one asset-ctx row → the shape the app consumes
function arxMapAssetCtx(d){
  if (!d) return null;
  const mark = arxQNum(d.mark_px_usd), prev = arxQNum(d.prev_day_px_usd);
  const chg = prev ? ((mark - prev) / prev) * 100 : 0;
  const oiUsd = arxQNum(d.open_interest_coin) * mark;
  const volUsd = arxQNum(d.day_ntl_vlm_usd);
  return {
    sym: d.coin, mark, prevDay: prev, deltaPct: chg,
    oiUsd, volUsd, funding: arxQNum(d.funding_rate), premium: arxQNum(d.premium),
    ts: d.snapshot_time ? Date.parse(d.snapshot_time) : Date.now(),
  };
}

// global store + pub/sub so any screen re-renders when real data lands
window.__arxQuant = window.__arxQuant || { byCoin:{}, ts:0, loading:false, ok:false };
const arxQuantSubs = new Set();
function arxQuantNotify(){ arxQuantSubs.forEach(fn=>{ try{ fn(); }catch(e){} }); }

async function arxQuantLoad(force){
  const S = window.__arxQuant;
  if (!force && S.ts && (Date.now()-S.ts) < ARX_QUANT_TTL && S.ok) return S.byCoin;
  if (S.loading) return S.byCoin;
  S.loading = true; arxQuantNotify();
  try {
    // fetch asset-ctx for the working set, capped concurrency (5 at a time)
    const coins = ARX_QUANT_COINS.slice(); const map = {};
    const worker = async () => { while (coins.length){ const coin = coins.shift();
      try { const j = await arxQuantFetch(`/v1/markets/perp/${coin}/asset-ctx`, 7000);
        const row = j && j.data ? (Array.isArray(j.data)? j.data[j.data.length-1] : j.data) : null;
        const m = arxMapAssetCtx(row); if (m) map[coin] = m;
      } catch(e){} } };
    await Promise.all([worker(),worker(),worker(),worker(),worker()]);
    if (Object.keys(map).length){ S.byCoin = map; S.ts = Date.now(); S.ok = true; }
  } catch(e){} 
  S.loading = false; arxQuantNotify();
  return S.byCoin;
}

// React hook — kicks a load on first use, refreshes every 60s, returns {data, ok, loading}
function useQuantMarkets(){
  const [,bump] = React.useState(0);
  React.useEffect(()=>{
    const fn = ()=>bump(x=>x+1); arxQuantSubs.add(fn);
    arxQuantLoad(false);
    const id = setInterval(()=>arxQuantLoad(false), ARX_QUANT_TTL);
    return ()=>{ arxQuantSubs.delete(fn); clearInterval(id); };
  },[]);
  const S = window.__arxQuant;
  return { data: S.byCoin, ok: S.ok, loading: S.loading };
}
// merge real fields into a seeded market row when we have live data for it
function arxQuantMerge(seedRow){
  const live = (window.__arxQuant.byCoin||{})[seedRow.sym];
  if (!live) return seedRow;
  return { ...seedRow, price: live.mark, deltaPct: live.deltaPct, _live:true,
    oiUsd: live.oiUsd, volUsd: live.volUsd, funding: live.funding };
}

Object.assign(window, { arxQuantLoad, useQuantMarkets, arxQuantMerge, ARX_QUANT_COINS });

/* ── Real daily liquidations (sum of the last completed day's `liq` field across our
   working-set coins) — powers the Market conditions "Liquidated" stat with warehouse
   data instead of a placeholder. Cached 5 min; falls back to null (UI hides the stat
   rather than showing a fake number) when unreachable. ── */
window.__arxQuantLiq = window.__arxQuantLiq || { total:null, ts:0 };
async function arxQuantLoadLiq(){
  const S = window.__arxQuantLiq;
  if (S.total!=null && (Date.now()-S.ts) < 5*60*1000) return S.total;
  try {
    const coins = ARX_QUANT_COINS.slice(0, 10); let sum = 0; let got = false;
    const worker = async () => { while (coins.length){ const coin = coins.shift();
      try { const j = await arxQuantFetch(`/v1/markets/perp/${coin}/daily`, 7000);
        const rows = j && j.data; const last = Array.isArray(rows) ? rows[rows.length-1] : rows;
        const n = last && last.n_liquidations;
        if (n!=null) { sum += arxQNum(n); got = true; }
      } catch(e){} } };
    await Promise.all([worker(),worker(),worker(),worker()]);
    if (got) { S.total = sum; S.ts = Date.now(); return sum; }
  } catch(e){}
  return S.total;
}
function useQuantLiq(){
  const [v, setV] = React.useState(window.__arxQuantLiq.total);
  React.useEffect(()=>{ let on=true; arxQuantLoadLiq().then(x=>{ if(on) setV(x); }); return ()=>{on=false}; }, []);
  return v;
}
Object.assign(window, { arxQuantLoadLiq, useQuantLiq });
