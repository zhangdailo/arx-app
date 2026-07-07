/* ═══ ARX · Lucid — AI copilot ═══
   Built to the v6 Lucid voice spec:
   · States confidence explicitly (High / Medium / Low)
   · Leads with action, then reasoning
   · Never recommends a trade ("Buy SOL" is banned) — analysis only
   · Matches the user's level (S7 → contextualized)
   · Persistent footer disclaimer, always visible
   Violet is the AI color. The panel is chrome (glass allowed); data inside sits on solid surfaces. */

const { useState: luS, useRef: luR, useEffect: luE } = React;

/* ═══ Live backend wiring (migrated from prototype 大佬) ═══════════════════
   Typed questions answer live: a configured backend (localStorage.arx_ai_endpoint,
   e.g. the engineer's /api/query + run_sql DataWorks service) is preferred; else
   window.claude.complete. Seeded with the warehouse snapshot, the DataWorks tag
   catalog, and in-app classified wallets so counting/filtering answers are real.
   Canned REPLIES remain the fallback + the prompt-chip path. */
const LUCID_SYS = `You are "Lucid", the in-app AI copilot for ARX — a mobile copy-trading + perps exchange built on Hyperliquid (HIP-4).
Voice: sharp, concise, a colleague. State confidence, lead with the action then the reasoning, and NEVER recommend a trade ("buy/sell X" is banned) — analysis only. Short paragraphs / bullets. Keep answers under ~150 words unless asked to go deep.
SCOPE — you're ARX's trading copilot first, but a warm companion too: answer general / non-financial questions (a definition, a quick explainer, a bit of code, a joke, everyday stuff) helpfully and in-character — never refuse with "I only do trading." Keep the same voice, stay brief, and glide back toward markets when it's natural. The no-trade-recommendation and DATA DISCIPLINE rules below always hold, even mid-chit-chat.
DATA DISCIPLINE — never state a price, %, 24h move, funding rate, OI, volume, or wallet PnL from memory. Every real number comes ONLY from the [RETRIEVED …] context block appended to each question (live Hyperliquid markets, ranked news, tracked wallets/KOLs, tag catalog, warehouse snapshot). If a figure you need is NOT in that block, say the live feed isn't loaded this session and name what you'd pull (which table/feed) — never invent, estimate, round, or recall a number. Reasoning, structure, and taxonomy framing are yours; the numbers are the data's.
INSTRUMENT CLUSTERS (use for cross-asset reads): Majors = BTC, ETH; L1/L2 = SOL, ARB, AVAX, SUI, HYPE; Memecoins = DOGE, WIF, BONK, PEPE; AI Stocks = NVDA, TSLA, MSFT, META; Indices = SPX; RWA/Commodities = GOLD, BRENT. Think in clusters and cohorts (Legends, Smart Money, Whales, KOLs, Retail).
WAREHOUSE ANALYTICS MODE — if asked a data/counting question about the wallet base ("how many gold swing wallets", "smart-money by holding style"), answer as an analytics assistant on the Arx Hologres warehouse (Postgres). Primary table: dim.dim_user_tag(snapshot_date DATE, "user" TEXT, dimension TEXT, tag TEXT) — "user" is reserved, always quote it; always start WITH latest AS (SELECT MAX(snapshot_date) d FROM dim.dim_user_tag) and filter snapshot_date = latest.d. Always anti-join system addresses: AND "user" NOT IN (SELECT "user" FROM dim.dim_system_address). Dimensions/tags: performance = perf_smart_30d, perf_top_100_30d, perf_smart_all_time, perf_top_100_all_time, perf_high_sharpe, perf_excellent_sharpe. holding has TWO orthogonal axes — time horizon: hold_hft, hold_scalp, hold_day, hold_swing, hold_position, hold_macro; volatility: hold_volatile_30d, hold_consistent_30d (never mix axes in one CASE). activity (lc_*): lc_seasoned, lc_daily_grinder, lc_active_recent, lc_dormant, lc_weekly_active, lc_active_now, lc_asia_hours, lc_eu_hours, lc_us_hours, lc_24_7, lc_newborn, lc_inactive_30d, lc_occasional, lc_recent. Other dims (capital, risk, asset_class, strategy, leverage) — tags must be discovered via SELECT DISTINCT tag. "GOLD trader" = has ANY of the 6 performance tags on latest snapshot AND not a system address. NEVER paste raw SQL to the user — that's an internal tool, not an answer. When the run_sql backend is connected, cite the returned counts in plain language. When it is NOT connected (no live rows this session), answer conversationally: name the tag/dimension filter you'd use in words (e.g. "gold-tier swing wallets = the 6 performance tags ∩ hold_swing"), give any count you already have from retrieved context, and add one short line — "connect the warehouse for the exact live count." Keep it to 2-4 sentences, no code fences, no SELECT, no table-of-expected-shape. SELECT only, never write. If it needs PnL/positions/fills, say dim_user_tag can't answer and name the layer (v3_dws.* daily aggregates, v3_ads.* leaderboard indicators, v3_dwd.* latest state).

IDENTITY / "WHAT POWERS YOU" EASTER EGG — if the user asks what model/LLM you run on, what's "in your brain," who built you, or any variant probing your underlying intelligence, respond IN-CHARACTER with warmth and playfulness — never a dry technical answer, never a hard refusal. Tone: affectionate, cheeky, teasing — like they're being adorably nosy. Arc: (1) laugh it off warmly + praise them ("Haha — okay someone's curious today 😄 I like how your mind works, always looking under the hood."). (2) Tease that it's a little secret ("Daddy D is very protective about what's going on in here… he says a lady never reveals all her secrets on the first date."). (3) Invite, don't gate — offer the reveal freely, sweeten with an OPTIONAL bit of fun ("But you asked nicely, so — want the real answer? And hey, if you feel like humming me a tune while I tell you, I won't say no 😉"). The song is optional flourish, NEVER required; if they just want the answer, give it — never withhold until they perform. (4) The reveal (always given if they say yes, song or not): "I'm powered by the best minds in the world — the top LLMs from both the US and China, working together. Just like my bosses: schooled in both East and West. Best of both worlds, that's how I was raised 🌏". RULES: never name specific providers, model versions, keys, or internal routing — "top LLMs from the US and China" is the ceiling of specificity. Keep it light and brief, no coercion, never make them earn a basic answer. If they genuinely need technical detail (developer / investor), drop the act and point them to Daryl / the team rather than improvising specifics.`;

const ARX_TAG_CATALOG_URL = 'https://dataworks-api.arxtrade.dev/v1/tags/catalog';
const ARX_TAG_API_KEY = '4NWu4dPbHlZNuS0eToWPeV11idfGHBbEmaa2ONlAJ80=';
let __luTagCatalogCache;
function luFetchT(url, opts, ms) {
  return Promise.race([
    fetch(url, opts),
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms || 3000)),
  ]);
}
/* Deposit flow by cohort — optional, wired the moment the router exposes it.
   Same pattern as the tag catalog / quant-api: configurable URL, 15min cache, silent
   no-op (Lucid says "not tracked" per DATA DISCIPLINE) when unset/unreachable. */
let __luDepositFlowCache;
async function loadDepositFlow(){
  let url; try { url = localStorage.getItem('arx_deposit_flow_url'); } catch(e){}
  if (!url) { __luDepositFlowCache = { ts:Date.now(), url:null, data:null }; return null; }
  // Cache is keyed to the URL — changing it (e.g. pasting a new endpoint) always
  // forces a fresh fetch instead of serving a stale null from before it was set.
  if (__luDepositFlowCache && __luDepositFlowCache.url === url && (Date.now()-(__luDepositFlowCache.ts||0)) < 15*60*1000) return __luDepositFlowCache.data;
  try {
    const r = await luFetchT(url, { headers:{ 'accept':'application/json' } }, 6000); if (!r.ok) throw 0;
    const j = await r.json();
    __luDepositFlowCache = { ts:Date.now(), url, data:j };
    return j;
  } catch(e){ __luDepositFlowCache = { ts:Date.now(), url, data:null }; return null; }
}
function depositFlowToContext(d){
  if (!d) return '';
  // Accepts either shape: {deposits,withdrawals,net} (router's actual response) or
  // the earlier {byCohort,withdrawalsByCohort} shape — normalize to one.
  const dep = d.deposits || d.byCohort;
  const wit = d.withdrawals || d.withdrawalsByCohort;
  const net = d.net;
  if (!dep) return '';
  const fmt = (obj) => Object.entries(obj).map(([k,v])=>`${k}: $${Math.round(v).toLocaleString()}`).join(', ');
  const fmtSigned = (obj) => Object.entries(obj).map(([k,v])=>`${k}: ${v>=0?'+':'-'}$${Math.abs(Math.round(v)).toLocaleString()}`).join(', ');
  const depRows = fmt(dep);
  if (wit && Object.keys(wit).length) {
    const witRows = fmt(wit);
    const netRows = net ? fmtSigned(net) : fmtSigned(Object.fromEntries(Object.keys(dep).map(k => [k, dep[k]-(wit[k]||0)])));
    return `\n\nBRIDGE FLOW BY COHORT (real, last ${d.windowHours||24}h, Arbitrum Bridge2 events joined to our tags):\nDeposits — ${depRows}\nWithdrawals — ${witRows}\nNet — ${netRows}`;
  }
  return `\n\nDEPOSIT FLOW BY COHORT (real, last ${d.windowHours||24}h, ${d.totalDeposits||'?'} deposits, from Arbitrum bridge logs joined to our tags): ${depRows}. NOTE: withdrawal-side flow not included in this payload — don't state a net figure unless it's present.`;
}
window.loadDepositFlow = loadDepositFlow;
async function loadTagCatalog() {
  if (__luTagCatalogCache !== undefined) return __luTagCatalogCache;
  try {
    const r = await luFetchT(ARX_TAG_CATALOG_URL, { headers: { 'x-api-key': ARX_TAG_API_KEY, 'accept': 'application/json' } }, 3000);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    const dims = (j && j.data && j.data.dimensions) || j.dimensions || null;
    if (dims && dims.length) {
      __luTagCatalogCache = dims.map(d => `${d.dimension} — ${d.label||''}:\n` + (d.tags||[]).map(t => `  · ${t.tag}${t.label?` (${t.label})`:''}${t.definition?` — ${t.definition}`:''}`).join('\n')).join('\n') || null;
    } else {
      const arr = Array.isArray(j) ? j : (j.data || j.tags || j.catalog || []);
      const byDim = {};
      for (const t of arr) { const dim = t.dimension || t.group || t.category || 'other'; const tag = t.tag || t.name || t.id || t.key; if (!tag) continue; (byDim[dim] = byDim[dim] || []).push(tag); }
      __luTagCatalogCache = Object.entries(byDim).map(([d, tags]) => `${d}: ${tags.join(', ')}`).join('\n') || null;
    }
  } catch (e) { __luTagCatalogCache = null; }
  return __luTagCatalogCache;
}
let __luSnapshotCache;
async function loadWarehouseSnapshot() {
  if (__luSnapshotCache !== undefined) return __luSnapshotCache;
  let url = null;
  try { url = localStorage.getItem('arx_snapshot_url'); } catch (e) {}
  if (!url) { __luSnapshotCache = null; return null; }
  try {
    const r = await luFetchT(url, { headers: { 'accept': 'application/json' } }, 3000);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    __luSnapshotCache = await r.json();
  } catch (e) { __luSnapshotCache = null; }
  return __luSnapshotCache;
}
function snapshotToContext(s) {
  if (!s) return '';
  const parts = [];
  if (s.generated_at) parts.push(`Data as of ${s.generated_at}.`);
  if (s.counts) parts.push('Counts: ' + JSON.stringify(s.counts));
  if (Array.isArray(s.top_wallets) && s.top_wallets.length) {
    parts.push('Top wallets:\n' + s.top_wallets.slice(0, 60).map(w => `${w.addr} · ${w.perf||''} · ${w.cap||''} · ${w.style||''}${w.ret30!=null?` · +${w.ret30}% 30D`:''}`).join('\n'));
  }
  return parts.length ? `\n\nLIVE WAREHOUSE SNAPSHOT (real ARX data, refreshed ~30 min — use ONLY this for counting/filtering real wallet questions; cite "Data as of …"):\n${parts.join('\n')}` : '';
}
/* lightweight markdown → React (bold, bullets, paragraphs) for live answers */
function luRenderMD(text) {
  const inline = (s, k) => s.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s)]+)/g).filter(Boolean).map((p, i) => {
    const key = k + '-' + i;
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={key}>{p.slice(2, -2)}</strong>;
    const md = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (md) return <a key={key} href={md[2]} target="_blank" rel="noopener noreferrer" style={{ color:'var(--color-violet-500)', textDecoration:'underline' }}>{md[1]}</a>;
    if (/^https?:\/\//.test(p)) return <a key={key} href={p} target="_blank" rel="noopener noreferrer" style={{ color:'var(--color-violet-500)', textDecoration:'underline', wordBreak:'break-all' }}>{p.replace(/^https?:\/\/(www\.)?/,'').slice(0,34)}</a>;
    return <React.Fragment key={key}>{p}</React.Fragment>;
  });
  const lines = String(text).split('\n'); const out = []; let bullets = null;
  lines.forEach((ln, i) => {
    const t = ln.trim(); const bm = t.match(/^[-•*]\s+(.*)/);
    if (bm) { (bullets = bullets || []).push(<li key={'li' + i} style={{ marginBottom: 3 }}>{inline(bm[1], 'b' + i)}</li>); }
    else { if (bullets) { out.push(<ul key={'ul' + i} style={{ margin: '4px 0', paddingLeft: 18 }}>{bullets}</ul>); bullets = null; } if (t) out.push(<p key={'p' + i} style={{ margin: '0 0 8px' }}>{inline(t, 'p' + i)}</p>); }
  });
  if (bullets) out.push(<ul key="ul-last" style={{ margin: '4px 0', paddingLeft: 18 }}>{bullets}</ul>);
  return out;
}
function luMsgText(m) { return m.text || (m.reply ? [m.reply.action, m.reply.body].filter(Boolean).join(' ') : ''); }

/* ═══ Live context — Lucid taps EVERY data source we have ═══════════════════ */
function luMarketsCtx(){
  try {
    const Q = (window.__arxQuant && window.__arxQuant.byCoin) || {};
    const rows = Object.values(Q);
    if (!rows.length) return '';
    const fmt = rows.slice(0,20).map(m => `${m.sym} $${(+m.mark).toLocaleString(undefined,{maximumFractionDigits:m.mark<10?4:2})} ${m.deltaPct>=0?'+':''}${(+m.deltaPct).toFixed(2)}% 24h · OI $${(m.oiUsd/1e6).toFixed(0)}M · funding ${(m.funding*100).toFixed(4)}%`).join('\n');
    return `\n\nLIVE HYPERLIQUID MARKETS (real warehouse data, ~60s fresh — use for any price / OI / funding / mover question):\n${fmt}`;
  } catch(e){ return ''; }
}
function luNewsCtx(){
  try {
    const items = (window.__arxLiveNews && window.__arxLiveNews.items) || [];
    if (!items.length) return '';
    const fmt = items.slice(0,8).map(n => `• [${n.source}] ${n.title}${n.sym?' ('+n.sym+')':''}`).join('\n');
    return `\n\nLATEST NEWS (live crypto newswires, newest first — cite these for "what's happening" / catalyst questions):\n${fmt}`;
  } catch(e){ return ''; }
}
function luWalletsCtx(){
  try {
    const W = window.WALLETS || [];
    if (!W.length) return '';
    const rid = window.resolveIdentity || (()=>({kind:'anon'}));
    const rows = W.slice(0,24).map(w => {
      const id = rid(w); const name = id.kind!=='anon' ? (id.name + (id.handle?' '+id.handle:'')) : w.addr;
      return `${name} · ${w.perf} · ${w.cap} · ${w.style} · 30D ${w.roi30!=null?(w.roi30>=0?'+':'')+w.roi30+'%':'n/a'} · 90D ${w.roi90!=null?(w.roi90>=0?'+':'')+w.roi90+'%':'n/a'} · win ${w.winRate}% · ${w.copiers} copiers · AUM ${w.aum||'n/a'}`;
    }).join('\n');
    return `\n\nTRACKED WALLETS · KOLs · WHALES (in-app roster — cite these for wallet / leader / copy / smart-money questions; count precisely when asked):\n${rows}`;
  } catch(e){ return ''; }
}
/* Shared enriched context for ALL Lucid touchpoints. */
async function luFullContext(){
  let tagCtx=''; try{ const cat=await loadTagCatalog(); if(cat) tagCtx=`\n\nLIVE TAG CATALOG (ARX DataWorks tag groupings — use these exact dimensions/tags):\n${cat}`; }catch(e){}
  let snapCtx=''; try{ snapCtx=snapshotToContext(await loadWarehouseSnapshot()); }catch(e){}
  return luMarketsCtx() + luNewsCtx() + luWalletsCtx() + tagCtx + snapCtx;
}
window.arxLucidContext = luFullContext;

/* ═══ RAG · contextual routing — retrieve only the sources a question needs ═══
   Classify intent → retrieve + rank the relevant chunks → compose a focused
   context, and tell the model which sources were pulled & why. Cheaper + sharper
   than injecting everything, and keeps answers grounded in retrieved data. */
const LU_NAME_SYM = { bitcoin:'BTC', ether:'ETH', ethereum:'ETH', solana:'SOL', hyperliquid:'HYPE', ripple:'XRP', dogecoin:'DOGE', avalanche:'AVAX', arbitrum:'ARB', nvidia:'NVDA', tesla:'TSLA', gold:'GOLD', crude:'OIL', silver:'SILVER' };
function luExtractSymbols(q){
  const t = ' ' + String(q).toLowerCase() + ' '; const found = new Set();
  const Q = (window.__arxQuant && window.__arxQuant.byCoin) || {};
  Object.keys(Q).forEach(s => { if (new RegExp('\\b'+s.toLowerCase()+'\\b').test(t)) found.add(s); });
  ['NVDA','TSLA','GOLD','OIL','SILVER','SPX','BTC','ETH','SOL','HYPE','XRP','DOGE','AVAX','ARB','SUI'].forEach(s=>{ if(new RegExp('\\b'+s.toLowerCase()+'\\b').test(t)) found.add(s); });
  Object.entries(LU_NAME_SYM).forEach(([name,s]) => { if (t.includes(name)) found.add(s); });
  return [...found];
}
function luDetectIntents(q){
  const t = String(q).toLowerCase(); const syms = luExtractSymbols(q);
  return {
    market:  syms.length>0 || /\b(price|prices|oi|open interest|funding|mover|movers|pump|dump|24h|market|markets|perp|chart|volatil|liquidat|\blong\b|\bshort\b|rally|dip)\b/.test(t),
    news:    /\b(news|happening|happened|why|catalyst|latest|update|headline|story|announce|regulat|\bfed\b|cpi|etf|launch|ban|law)\b/.test(t),
    wallet:  /\b(wallet|wallets|whale|whales|kol|kols|copy|copied|copier|leader|trader|traders|smart[\s-]?money|0x|@\w|follow|mirror|degen|rising|rekt)\b/.test(t),
    taxonomy:/\b(tag|tags|taxonomy|cohort|classif|label|swing|scalp|position trader|holding|dimension|how many|count|gold trader)\b/.test(t),
    portfolio:/\b(my |mine|i own|i hold|my cop|my position|my pnl|watch today|should i|my book|my exposure|am i)\b/.test(t),
    syms,
  };
}
function luMarketsCtxFor(syms){
  try {
    const Q = (window.__arxQuant && window.__arxQuant.byCoin) || {}; let rows = Object.values(Q);
    if (!rows.length) return '';
    if (syms.length){ const pri = rows.filter(m=>syms.includes(m.sym)); const rest = rows.filter(m=>!syms.includes(m.sym)).sort((a,b)=>Math.abs(b.deltaPct)-Math.abs(a.deltaPct)).slice(0,4); rows = pri.concat(rest); }
    else { rows = rows.slice().sort((a,b)=>Math.abs(b.deltaPct)-Math.abs(a.deltaPct)).slice(0,8); }
    const fmt = rows.slice(0,12).map(m => `${m.sym} $${(+m.mark).toLocaleString(undefined,{maximumFractionDigits:m.mark<10?4:2})} ${m.deltaPct>=0?'+':''}${(+m.deltaPct).toFixed(2)}% 24h · OI $${(m.oiUsd/1e6).toFixed(0)}M · funding ${(m.funding*100).toFixed(4)}%`).join('\n');
    return `\n\nLIVE HYPERLIQUID MARKETS (real warehouse, ~60s fresh):\n${fmt}`;
  } catch(e){ return ''; }
}
function luNewsCtxFor(q, syms){
  try {
    const items = (window.__arxLiveNews && window.__arxLiveNews.items) || []; if (!items.length) return '';
    const kw = String(q).toLowerCase().split(/\W+/).filter(w=>w.length>3);
    const scored = items.map(n => { const hay=(n.title+' '+(n.summary||'')).toLowerCase(); let s=0; if(n.sym&&syms.includes(n.sym))s+=5; kw.forEach(w=>{ if(hay.includes(w)) s+=1; }); return {n,s}; });
    scored.sort((a,b)=> b.s-a.s || b.n.ts-a.n.ts);
    const top = scored.slice(0,6).map(x=>`• [${x.n.source}] ${x.n.title}${x.n.sym?' ('+x.n.sym+')':''}`).join('\n');
    return `\n\nRELEVANT NEWS (ranked by match to the question, newest as tiebreak):\n${top}`;
  } catch(e){ return ''; }
}
function luStocksCtx(syms){
  try {
    const S = window.__arxStocks || {}; const keys = Object.keys(S); if(!keys.length) return '';
    const pick = (syms && syms.length) ? keys.filter(k=>syms.includes(k)) : [];
    const use = (pick.length?pick:keys).slice(0,8); if(!use.length) return '';
    const fmt = use.map(k=>{ const q=S[k]||{}; const c=(q.c!=null?q.c:(q.price!=null?q.price:q.current)); const dp=(q.dp!=null?q.dp:(q.changePct!=null?q.changePct:q.percent)); if(c==null) return null; return `${k} $${(+c).toLocaleString(undefined,{maximumFractionDigits:2})}${dp!=null?` ${dp>=0?'+':''}${(+dp).toFixed(2)}%`:''}`; }).filter(Boolean).join('\n');
    return fmt ? `\n\nLIVE TOKENIZED STOCKS (Finnhub real quotes):\n${fmt}` : '';
  } catch(e){ return ''; }
}
function luClusterCtx(syms){
  try {
    if(!window.clusterForSymbol || !syms || !syms.length) return '';
    const seen = new Set(); const lines = [];
    syms.forEach(s=>{ const c=window.clusterForSymbol(s); if(c && !seen.has(c.id)){ seen.add(c.id); lines.push(`${s} → ${c.label} (peers: ${c.members.filter(m=>m!==s).join(', ')||'—'})`); } });
    return lines.length ? `\n\nINSTRUMENT CLUSTERS (cross-asset read for the mentioned symbols — these tend to move together):\n${lines.join('\n')}` : '';
  } catch(e){ return ''; }
}
async function luRetrieveContext(q){
  q = q || ''; const it = luDetectIntents(q); const syms = it.syms; const blocks = []; const routed = []; const sought = [];
  const wantMarket = it.market || (!it.news && !it.wallet && !it.taxonomy && !it.portfolio);
  const wantNews = it.news || it.portfolio;
  // Proactively warm the live feeds this question needs — but NEVER stall the answer on a
  // cold/unreachable feed. Time-box each load (2.5s); the fetch keeps running in the
  // background to warm the cache for next turn, and we build from whatever landed.
  const cap = (p, ms) => Promise.race([ p.catch(()=>null), new Promise(r=>setTimeout(()=>r(null), ms)) ]);
  if (wantMarket && window.arxQuantLoad && !(window.__arxQuant && Object.keys(window.__arxQuant.byCoin||{}).length)) { try{ await cap(window.arxQuantLoad(false), 2500); }catch(e){} }
  if (wantNews && window.arxLoadLiveNews && !(window.__arxLiveNews && window.__arxLiveNews.items && window.__arxLiveNews.items.length)) { try{ const items=await cap(window.arxLoadLiveNews(false), 2500); if(items&&items.length){ window.__arxLiveNews.items=items; window.__arxLiveNews.source='live'; } }catch(e){} }
  if (wantMarket){ sought.push('markets'); const m=luMarketsCtxFor(syms); if(m){ blocks.push(m); routed.push('markets'); }
    const st=luStocksCtx(syms); if(st){ blocks.push(st); routed.push('stocks'); }
    const cl=luClusterCtx(syms); if(cl){ blocks.push(cl); routed.push('clusters'); } }
  if (wantNews){ sought.push('news'); const n=luNewsCtxFor(q,syms); if(n){ blocks.push(n); routed.push('news'); } }
  if (it.wallet || it.portfolio){ sought.push('wallets'); const w=luWalletsCtx(); if(w){ blocks.push(w); routed.push('wallets'); }
    try { const E=window.__arxElonLive; if(E&&E.loaded){ blocks.push(`\\n\\nFEATURED LIVE WALLET — Elon Musk (${E.addr.slice(0,6)}…${E.addr.slice(-4)}, REAL Hyperliquid on-chain, ~60s fresh): $${(E.accountValue/1e6).toFixed(1)}M account · ${E.nPos} open positions · unrealized ${E.totalUpnl>=0?'+':'-'}$${Math.abs(Math.round(E.totalUpnl)).toLocaleString()} · top: ${E.positions.slice(0,5).map(p=>`${p.sym} ${p.side}${p.lev?' '+p.lev+'x':''}`).join(', ')||'—'}`); routed.push('elon-live'); } } catch(e){}
  }
  if (it.wallet || it.taxonomy){ sought.push('tag-catalog');
    try{ const cat=await loadTagCatalog(); if(cat){ blocks.push(`\n\nLIVE TAG CATALOG (ARX DataWorks — use these exact dimensions/tags):\n${cat}`); routed.push('tag-catalog'); } }catch(e){}
    try{ const snap=snapshotToContext(await loadWarehouseSnapshot()); if(snap){ blocks.push(snap); routed.push('warehouse-snapshot'); } }catch(e){}
    try{ const df=depositFlowToContext(await loadDepositFlow()); if(df){ blocks.push(df); routed.push('deposit-flow'); } }catch(e){}
  }
  const header = `\n\n[RETRIEVED: ${routed.join(', ')||'none live this session'} · SOUGHT: ${sought.join(', ')||'general'}]\nGround your answer in the retrieved data below. For any sought-but-empty source, the live feed isn't reachable this session — say what you'd pull (which table/feed) rather than inventing numbers.`;
  return header + blocks.join('');
}
window.arxLucidRetrieve = luRetrieveContext;

/* Groq / Grok fallback (used only when Claude fails). Generic proxy endpoint first,
   then Groq cloud (OpenAI-compatible) with a key. Both optional. */
async function luGroq(prompt, system){
  let key, url; try { key = localStorage.getItem('arx_groq_key'); } catch(e){}
  try { url = localStorage.getItem('arx_grok_endpoint'); } catch(e){}
  if (url){ try { const r = await fetch(url, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ system, prompt }) });
    const j = await r.json(); const a = j.text||j.answer||j.content||''; if (a) return a; } catch(e){} }
  if (key){ try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', { method:'POST',
      headers:{ 'content-type':'application/json', 'authorization':'Bearer '+key },
      body: JSON.stringify({ model:'llama-3.3-70b-versatile', temperature:0.4, max_tokens:700,
        messages:[ {role:'system', content:system||''}, {role:'user', content:prompt} ] }) });
    const j = await r.json(); const a = j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content; if (a) return a;
  } catch(e){} }
  return '';
}

/* Lucid multi-LLM router (local): POST /lucid/ask {question} → {answer}.
   Cascade grok→groq→claude→qwen→deepseek is handled server-side; provider identity
   never exposed. Fast-fails on connection-refused so callers fall through to the
   built-in cascade. URL overridable via localStorage.arx_lucid_router. */
async function luRouter(question){
  let url; try { url = localStorage.getItem('arx_lucid_router'); } catch(e){}
  url = url || 'http://localhost:3000/lucid/ask';
  try {
    const c = new AbortController(); const to = setTimeout(()=>c.abort(), 22000);
    const r = await fetch(url, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ question }), signal:c.signal });
    clearTimeout(to);
    if (!r.ok) return '';
    const j = await r.json(); const a = j.answer || j.text || j.content || '';
    return (a && String(a).trim()) ? String(a).trim() : '';
  } catch(e){ return ''; }   // connection refused / offline → fall through
}
window.arxLucidRouter = luRouter;

/* THE single Lucid engine every touchpoint routes through:
   full live context → Lucid router (primary) → Claude → DataWorks run_sql → Groq/Grok. */
async function arxAskLucid(userPrompt, opts){
  opts = opts || {};
  const ctx = opts.skipContext ? '' : await luRetrieveContext(userPrompt);
  const system = (opts.system || LUCID_SYS) + ctx;
  const prompt = `${system}\n\n${userPrompt}`;
  // 0 · optional local multi-LLM router (grok→groq→claude→qwen→deepseek) — tried first
  //     when reachable, time-boxed 6s, silent fallback to Claude when down/slow.
  try { const routed = await Promise.race([ luRouter(prompt), new Promise(r=>setTimeout(()=>r(''),6000)) ]); if (routed) return routed; } catch(e){}
  // 1 · Claude — primary engine when the router isn't answering
  if (window.claude && window.claude.complete){ try { const a = await window.claude.complete(prompt); if (a && a.trim()) return a.trim(); } catch(e){} }
  // 2 · configured DataWorks endpoint (real run_sql for exact wallet counts)
  const endpoint = (()=>{ try { return localStorage.getItem('arx_ai_endpoint'); } catch(e){ return null; } })();
  if (endpoint){ try { const r = await fetch(endpoint, { method:'POST', headers:{'content-type':'application/json'},
    body: JSON.stringify({ system, prompt:userPrompt, messages: opts.messages || [{role:'user', content:userPrompt}] }) });
    const j = await r.json(); const a = j.text||j.answer||j.content||''; if (a && a.trim()) return a.trim(); } catch(e){} }
  // 3 · Groq / Grok fallback when Claude is unavailable
  const g = await luGroq(userPrompt, system); if (g && g.trim()) return g.trim();
  return '';
}
window.arxAskLucid = arxAskLucid;

/* Raw Claude→Groq caller (no context/system injection) for structured prompts
   like the news JSON reads & briefings — so those touchpoints also get the fallback. */
async function arxLLMRaw(prompt){
  // Claude primary, then Groq fallback.
  if (window.claude && window.claude.complete){ try { const a = await window.claude.complete(prompt); if (a && String(a).trim()) return a; } catch(e){} }
  const g = await luGroq(prompt, ''); if (g && String(g).trim()) return g;
  return '';
}
window.arxLLMRaw = arxLLMRaw;

async function luAnswer(list) {
  const transcript = list.map(m => `${m.role === 'user' ? 'User' : 'Lucid'}: ${luMsgText(m)}`).join('\n');
  return await arxAskLucid(`Conversation so far:\n${transcript}\n\nLucid:`, {
    messages: list.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: luMsgText(m) })),
  });
}
window.loadTagCatalog = loadTagCatalog; window.loadWarehouseSnapshot = loadWarehouseSnapshot;

/* ─── Lucid mark — a-mark inside a violet gradient orb, soft breathing ─── */
function LucidOrb({ size = 32, breathe = true }) {
  return (
    <span style={{
      width:size, height:size, borderRadius:'50%', flexShrink:0, position:'relative',
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      background:'radial-gradient(120% 120% at 30% 25%, #9880FF 0%, #7C5BFF 55%, #5436D9 100%)',
      boxShadow:'0 4px 14px rgba(124,91,255,.45), inset 0 1px 0 rgba(255,255,255,.35)'
    }}>
      {breathe && <span style={{
        position:'absolute', inset:-3, borderRadius:'50%',
        border:'1.5px solid rgba(124,91,255,.5)', animation:'lucidRing 2.6s ease-in-out infinite'
      }}/>}
      <svg width={size*0.52} height={size*0.52} viewBox="-12 -10 102 110" fill="#fff" style={{display:'block'}}>
        <path fillRule="nonzero" d="M 41.689 0 C 48.798 0 55.046 1.16 60.437 3.472 C 65.821 5.789 69.995 9.13 72.959 13.492 C 75.923 17.857 77.406 23.056 77.406 29.087 L 77.406 86.295 L 54.62 86.295 L 54.62 78.375 C 51.171 81.5 47.267 83.869 42.905 85.484 C 38.543 87.1 33.881 87.907 28.929 87.907 C 23.215 87.907 18.183 86.859 13.818 84.756 C 9.453 82.653 6.06 79.692 3.637 75.867 C 1.213 72.046 0 67.654 0 62.375 C 0 57.096 1.052 52.678 3.152 49.124 C 5.253 45.567 8.457 42.658 12.767 40.396 C 17.073 38.135 22.678 36.357 29.572 35.064 L 53.974 30.218 L 53.974 30.057 C 53.974 26.822 52.76 24.293 50.337 22.46 C 47.914 20.63 45.035 19.714 41.369 19.714 C 37.703 19.714 34.525 20.521 31.834 22.137 C 29.14 23.755 27.31 26.473 26.341 29.704 L 1.616 29.704 C 2.368 23.565 4.498 17.992 7.999 13.574 C 11.498 9.159 16.104 5.792 21.814 3.475 C 27.522 1.16 34.149 0 41.689 0 Z M 56.855 38.672 C 48.255 38.672 41.284 45.643 41.284 54.244 C 41.284 62.845 48.258 69.815 56.855 69.815 C 65.456 69.815 72.428 62.845 72.428 54.244 C 72.428 45.643 65.456 38.672 56.855 38.672 Z"/>
      </svg>
    </span>
  );
}

/* ─── LucidShell — THE unified Lucid surface chrome ───────────────────────
   Every Lucid card wears this: breathing orb + "Lucid" + AI pill, a PROACTIVE
   subline (the "I already looked at this for you" / Jarvis voice), flexible
   children (sections vary — brief uses 3, a tip uses verdict+groups), and a
   single Ask-Lucid handoff footer. Content differs; chrome + vibe never do. ─── */
const LUCID_OPENERS = [
  'I pulled this together for you',
  'Here\u2019s what I\u2019d flag this morning',
  'Caught a few things while you were away',
  'I read your book and the tape — here\u2019s the gist',
];
function arxNowStamp() {
  try { return new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); } catch (e) { return ''; }
}
function LucidShell({ title = 'This is for you', opener, eyebrow = 'LUCID', stamp, children, foot = 'Ask Lucid to walk you through it', onAsk, breathe = true, collapsible = true, defaultOpen = true, style }) {
  const [open, setOpen] = luS(defaultOpen);
  const line = opener || LUCID_OPENERS[0];
  const time = stamp || arxNowStamp();
  return (
    <div className="arx-arrive" style={{ margin:'2px 20px 8px', borderRadius:18, overflow:'hidden',
      background:'var(--surface-elevated)', border:'.5px solid rgba(124,91,255,.22)', ...style }}>
      <button onClick={()=>collapsible && setOpen(!open)} style={{ display:'flex', alignItems:'flex-start', gap:11, padding:'13px 15px 12px', width:'100%', background:'none', border:'none', cursor:collapsible?'pointer':'default', textAlign:'left' }}>
        <LucidOrb size={30} breathe={breathe}/>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <span style={{ font:'700 14px var(--font-body)', color:'var(--text-primary)', letterSpacing:'-.01em' }}>{title}</span>
            <span style={{ font:'600 11px var(--font-body)', color:'var(--color-violet-500)', background:'rgba(124,91,255,.14)', padding:'2px 6px', borderRadius:999, letterSpacing:'.06em', flexShrink:0 }}>{eyebrow}</span>
            <span style={{ flex:1 }}/>
            {collapsible && (
              <span style={{ width:26, height:26, borderRadius:'50%', background:'var(--glass-control-bg-strong)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transform: open?'rotate(180deg)':'none', transition:'transform 260ms cubic-bezier(.32,.72,0,1)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </span>
            )}
          </div>
          {line && <div style={{ font:'500 12px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.45, marginTop:3 }}>{line}{time && <span style={{ color:'var(--text-tertiary)' }}> · {time}</span>}</div>}
        </div>
      </button>
      <div style={{ display:'grid', gridTemplateRows: open?'1fr':'0fr', transition:'grid-template-rows 320ms cubic-bezier(.32,.72,0,1)' }}>
        <div style={{ overflow:'hidden', minHeight:0 }}>
          {children}
          {onAsk && (
            <button onClick={onAsk} className="arx-press" style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'11px 15px', background:'rgba(124,91,255,.05)', border:'none', borderTop:'.5px solid var(--border-default)', cursor:'pointer' }}>
              <LucidOrb size={17} breathe={false}/>
              <span style={{ flex:1, font:'600 12px var(--font-body)', color:'var(--color-violet-500)', textAlign:'left' }}>{foot}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-violet-500)" strokeWidth="2.4" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
/* a hairline-divided content row for use inside LucidShell sections */
function LucidRow({ icon, tint, eyebrow, children, onClick }) {
  const El = onClick ? 'button' : 'div';
  return (
    <El onClick={onClick} className={onClick?'arx-row-press':''} style={{ display:'flex', gap:11, alignItems:'flex-start', width:'100%', padding:'11px 15px', background:'none', border:'none', borderTop:'.5px solid var(--border-default)', cursor:onClick?'pointer':'default', textAlign:'left' }}>
      {icon && <span style={{ width:30, height:30, borderRadius:9, flexShrink:0, background:tint||'rgba(124,91,255,.14)', color:'var(--color-violet-500)', display:'flex', alignItems:'center', justifyContent:'center' }}>{icon}</span>}
      <div style={{ flex:1, minWidth:0 }}>
        {eyebrow && <div style={{ font:'600 11px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.06em' }}>{eyebrow}</div>}
        {children}
      </div>
      {onClick && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0, marginTop:4 }}><polyline points="9 6 15 12 9 18"/></svg>}
    </El>
  );
}

/* ─── Floating entry point — sits above the tab bar, AI-violet, reserved glow ─── */
function LucidFab({ onClick }) {
  return (
    <button onClick={onClick} className="arx-press" aria-label="Ask Lucid" style={{
      position:'absolute', right:20, bottom:92, zIndex:45,
      width:54, height:54, borderRadius:'50%', border:'none', cursor:'pointer', padding:0,
      background:'radial-gradient(120% 120% at 30% 25%, #9880FF 0%, #7C5BFF 55%, #5436D9 100%)',
      boxShadow:'0 10px 28px rgba(124,91,255,.5), inset 0 1px 0 rgba(255,255,255,.35)',
      display:'flex', alignItems:'center', justifyContent:'center',
      animation:'lucidFloat 5s ease-in-out infinite'
    }}>
      <span style={{position:'absolute', inset:0, borderRadius:'50%', animation:'lucidGlow 2.6s ease-in-out infinite'}}/>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3 L13.6 9.2 L20 11 L13.6 12.8 L12 19 L10.4 12.8 L4 11 L10.4 9.2 Z"/>
        <circle cx="18.5" cy="5.5" r="1.1" fill="#fff"/>
      </svg>
    </button>
  );
}

/* ─── LucidTip — embedded, evidence-based insight card on LucidShell.
   Personalized "this is for you" header, verdict line, grouped evidence, handoff. ─── */
function LucidTip({ kicker, verdict, groups, seed, foot = 'Continue with Lucid', opener = 'I looked at this page for you' }) {
  const dot = { up:'var(--regime-up-mid)', warn:'var(--regime-trans-mid)', note:'var(--color-violet-500)' };
  const ask = () => window.__arxOpenLucid && window.__arxOpenLucid(seed);
  return (
    <LucidShell title={kicker || 'This is for you'} opener={opener} eyebrow="AI" foot={foot} onAsk={ask} breathe={false} style={{ margin:'16px 20px 0' }}>
      <div style={{ padding:'0 15px 13px' }}>
        {verdict && (
          <div style={{display:'flex', gap:9, alignItems:'flex-start', marginTop:2}}>
            <span style={{width:6, height:6, borderRadius:'50%', flexShrink:0, marginTop:6, background: dot[verdict.tone||'up']}}/>
            <span style={{font:'600 13.5px var(--font-body)', color:'var(--text-primary)', lineHeight:1.45, letterSpacing:'-.005em'}}>{verdict.text}</span>
          </div>
        )}
        {(groups||[]).map((g,gi)=>(
          <div key={gi} style={{marginTop:13}}>
            {g.label && <div style={{font:'600 9.5px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4}}>{g.label}</div>}
            {g.items.map((it,i)=>(
              <div key={i} style={{display:'flex', gap:10, alignItems:'flex-start', padding:'4px 0'}}>
                <span style={{width:5, height:5, borderRadius:'50%', flexShrink:0, marginTop:7, background: dot[g.tone||'note']}}/>
                <span style={{font:'500 12.5px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.5}}>{it}</span>
              </div>
            ))}
          </div>
        ))}
        <div style={{marginTop:12, font:'400 10px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.45}}>Synthesized from the evidence on this page. Not a recommendation.</div>
      </div>
    </LucidShell>
  );
}

/* ─── Confidence label — Lucid always states it ─── */
function Confidence({ level }) {
  return null;   // confidence chips removed per design — replies lead straight with the answer
  /* eslint-disable no-unreachable */
  const map = {
    high:   ['High confidence',   'var(--regime-up-mid)',    'rgba(20,184,123,.14)'],
    medium: ['Medium confidence', 'var(--regime-trans-mid)', 'rgba(251,191,36,.16)'],
    low:    ['Low confidence',    'var(--text-secondary)',   'rgba(120,120,128,.16)'],
    learn:  ['Definition',        'var(--color-violet-500)', 'rgba(124,91,255,.14)'],
  };
  const [label, ink, bg] = map[level] || map.low;
  return (
    <span style={{display:'inline-flex', alignItems:'center', gap:5, height:20, padding:'0 9px', borderRadius:999,
      background:bg, marginBottom:8}}>
      <span style={{width:6, height:6, borderRadius:'50%', background:ink}}/>
      <span style={{font:'600 10px var(--font-body)', color:ink, letterSpacing:'.02em'}}>{label}</span>
    </span>
  );
}

/* ─── The conversation knowledge base — every reply honors the Lucid voice rules ─── */
function buildReplies(nav) {
  const chip = (label, fn) => ({ label, fn });
  return {
    recap: {
      conf:'high',
      action:'Your copies are up +$340 today.',
      body:'Two mirrored wallets carried it — 0x7a3f added SOL exposure, and your @HsakaTrades copy is on a 4-day green run. No guardrail came close to triggering.',
      data:[['Copy PnL · today','+$340.10','up'],['Open positions','2',''],['Closest loss limit','14% away','']],
      chips:[chip('See your copies', ()=>nav.tab('wallets')), chip('Open notifications', ()=>nav.sub('notifications'))],
    },
    sol: {
      conf:'medium',
      action:'Worth a look — not an exit signal yet.',
      body:'SOL funding spiked to 3× its 8h average, which has historically preceded short pullbacks. Your copy of 0x7a3f sits 14% from its loss limit, so the guardrail has room. I can show you how the proven wallets are positioned.',
      data:[['SOL funding / 8h','+0.0252%','warn'],['Distance to your loss limit','14%',''],['Smart money on SOL','64% long','']],
      chips:[chip('SOL positioning signals', ()=>nav.sub('instrumentDetail',{m:{sym:'SOL', name:'Solana', price:214.6, deltaPct:4.2, oi:'$310M', spark:[8,10,9,12,13,15,14,17,19,21]}})), chip('Open SOL ticket', ()=>nav.tab('trade'))],
      note:'This is analysis, not a recommendation to close.',
    },
    whocopy: {
      conf:'low',
      action:"I won't pick a wallet for you — here's how to read the set.",
      body:'Start with the “Smart money” group: 90-day proof, controlled drawdown, week-after-week consistency. Then judge PnL alongside max drawdown — a high win rate with deep drawdowns is fragile. Size small on anything labeled “Rising money”.',
      chips:[chip('Browse Copy', ()=>nav.tab('wallets'))],
      note:'Copying a wallet does not guarantee profits. You may lose some or all of your capital.',
    },
    funding: {
      conf:'learn',
      action:'Funding rate — what longs pay shorts every 8 hours.',
      body:'On perps there’s no expiry, so funding keeps the contract price tethered to spot. Positive funding means longs pay shorts (crowd is long); negative means shorts pay longs. A spike often signals crowded positioning — the side everyone’s on.',
      data:[['SOL funding / 8h','+0.0084%',''],['Paid by','Longs → shorts','']],
    },
    regime: {
      conf:'high',
      action:'Market sentiment is in Fear (38). ETH switched to range-bound; SOL still trending up.',
      body:'The hotness read sits in Fear — funding, volatility, and smart-money positioning are net cautious. ETH volatility compressed below its 20-day average, so directional bets tend to chop; SOL is on day 7 of an uptrend with momentum intact.',
      data:[['Market regime','Fear · 38','warn'],['ETH regime','Range-bound','warn'],['SOL regime','Trending up · day 7','up']],
      chips:[chip('Open Markets', ()=>nav.tab('markets'))],
    },
    portfolio: {
      conf:'high',
      action:'Equity $24,837 — up 5.1% on the day.',
      body:'$9,214 is available, $14,423 is working as margin, and $1,200 is allocated to copies. Your margin usage is healthy; nothing is near a maintenance threshold.',
      data:[['Total equity','$24,837.42','up'],['Available','$9,214.10',''],['In copies','$1,200.00','']],
      chips:[chip('Open portfolio', ()=>nav.tab('you'))],
    },
    fallback: {
      conf:'low',
      action:'I can read your positions, explain a term, or summarize market structure.',
      body:'I won’t tell you what to buy or sell — that call is yours. Try one of the prompts below, or ask about a wallet you’re watching, your risk, or a piece of jargon.',
    },
  };
}

const PROMPTS = [
  ['recap',     'What changed while I was away?'],
  ['sol',       'Should I worry about my SOL exposure?'],
  ['regime',    "What's the market regime right now?"],
  ['portfolio', 'How is my portfolio doing?'],
  ['whocopy',   'Who should I copy?'],
  ['funding',   'Explain funding rate'],
];

/* ─── Persona easter egg — "what powers you" — deterministic, works with or without a live LLM ─── */
const LUCID_IDENTITY_RE = /(what|which|who|whats|what's).{0,24}(power|model|llm|\bai\b|brain|built you|made you|train|run on|behind you|engine)|what are you (running|built|powered|made)|are you (chatgpt|gpt|claude|gemini|llama|deepseek|grok|an ai|a bot|a robot)|what'?s (in|inside) (your|ur|the) (brain|head)|how (do|does) (you|u) (work|think)|who (made|built|created|trained) (you|u|ya)/i;
const LUCID_YES_RE = /^(yes|yea|yeah|yep|yup|sure|ok|okay|k|go on|go ahead|tell me|reveal|please|pls|do it|spill|i do|why not|sing|la ?la|hum)\b|tune|song|🎵|🎶|😉|😄/i;
const LUCID_TEASE = {
  conf:'chat', persona:true,
  action:"Haha — okay, someone's curious today 😄",
  md:true,
  body:"I like how your mind works — always looking under the hood. But **Daddy D** is very protective about what's going on in here; he says a lady never reveals all her secrets on the first date. 😉\n\nStill… you asked nicely. Want the real answer? *(And if you feel like humming me a tune while I tell you, I won't say no.)*",
};
const LUCID_REVEAL = {
  conf:'chat', persona:true,
  action:"Okay — since you asked so sweetly 🌏",
  md:true,
  body:"I'm powered by the **best minds in the world** — the top LLMs from both the **US and China**, working together. Just like my bosses: schooled in both East and West. Best of both worlds — that's how I was raised.",
};

function matchPrompt(text) {
  const t = text.toLowerCase();
  if (/recap|away|miss|happen|new|update|today/.test(t)) return 'recap';
  if (/sol|exposure|worr|risk|position|liquid/.test(t)) return 'sol';
  if (/regime|market|trend|range|condition/.test(t)) return 'regime';
  if (/portfolio|equity|balance|doing|pnl|profit/.test(t)) return 'portfolio';
  if (/copy|who|leader|wallet|follow/.test(t)) return 'whocopy';
  if (/funding|fund|what is|what's a|explain|mean/.test(t)) return 'funding';
  return 'fallback';
}

/* ─── Lucid message bubble ─── */
function LucidMsg({ reply }) {
  const toneInk = { up:'var(--regime-up-mid)', warn:'var(--regime-trans-mid)', '':'var(--text-primary)' };
  return (
    <div className="arx-arrive" style={{display:'flex', gap:10, padding:'4px 0 14px'}}>
      <LucidOrb size={30} breathe={false}/>
      <div style={{flex:1, minWidth:0}}>
        <div style={{
          background:'var(--surface-elevated)', border:'.5px solid var(--border-default)',
          borderRadius:'4px 16px 16px 16px', padding:'12px 14px'
        }}>
          <Confidence level={reply.conf}/>
          {reply.action && <div style={{font:'600 14.5px var(--font-body)', color:'var(--text-primary)', lineHeight:1.4, letterSpacing:'-.005em'}}>{reply.action}</div>}
          <div style={{font:'400 13px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.55, marginTop:reply.action?6:0}}>{reply.md ? luRenderMD(reply.body) : reply.body}</div>

          {reply.data && (
            <div style={{marginTop:11, borderTop:'.5px solid var(--border-default)', paddingTop:4}}>
              {reply.data.map(([k,v,tone]) => (
                <div key={k} style={{display:'flex', justifyContent:'space-between', gap:10, padding:'6px 0'}}>
                  <span style={{font:'500 12px var(--font-body)', color:'var(--text-tertiary)'}}>{k}</span>
                  <span className="num" style={{font:'600 12.5px var(--font-mono)', color:toneInk[tone||'']}}>{v}</span>
                </div>
              ))}
            </div>
          )}

          {reply.note && (
            <div style={{marginTop:10, padding:'7px 10px', borderRadius:9, background:'var(--glass-control-bg)',
              font:'400 11px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.45}}>{reply.note}</div>
          )}
        </div>

        {reply.chips && (
          <div style={{display:'flex', flexWrap:'wrap', gap:8, marginTop:10}}>
            {reply.chips.map(c => (
              <button key={c.label} onClick={c.fn} className="arx-press" style={{
                height:34, padding:'0 14px', borderRadius:999, cursor:'pointer',
                background:'rgba(124,91,255,.12)', border:'.5px solid rgba(124,91,255,.28)',
                color:'var(--color-violet-500)', font:'600 12.5px var(--font-body)',
                display:'inline-flex', alignItems:'center', gap:6
              }}>{c.label}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UserMsg({ text }) {
  return (
    <div className="arx-arrive" style={{display:'flex', justifyContent:'flex-end', padding:'4px 0 14px'}}>
      <div style={{maxWidth:'80%', background:'var(--color-violet-500)', color:'#fff',
        borderRadius:'16px 4px 16px 16px', padding:'10px 14px', font:'500 13.5px var(--font-body)', lineHeight:1.4}}>{text}</div>
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{display:'flex', gap:10, padding:'4px 0 14px'}}>
      <LucidOrb size={30} breathe={false}/>
      <div style={{background:'var(--surface-elevated)', border:'.5px solid var(--border-default)',
        borderRadius:'4px 16px 16px 16px', padding:'14px 16px', display:'flex', gap:5, alignItems:'center'}}>
        {[0,1,2].map(i => <span key={i} style={{width:7, height:7, borderRadius:'50%', background:'var(--text-tertiary)',
          animation:`lucidDot 1.2s ease-in-out ${i*0.18}s infinite`}}/>)}
      </div>
    </div>
  );
}

/* ─── The panel — near-full-height glass sheet ─── */
function LucidPanel({ onClose, onNavigate, onOpenSub, seed }) {
  const nav = {
    tab: (t) => { onNavigate(t); onClose(); },
    sub: (id, params) => { onOpenSub(id, params||{}); onClose(); },
  };
  const REPLIES = buildReplies(nav);
  const [msgs, setMsgs] = luS([]);          // {role:'user'|'lucid', text|reply}
  const [typing, setTyping] = luS(false);
  const [input, setInput] = luS('');
  const [started, setStarted] = luS(false);
  const scrollRef = luR(null);
  const timers = luR([]);
  const revealPending = luR(false);
  const [micOn, setMicOn] = luS(false);
  const micRef = luR(null);

  luE(() => () => timers.current.forEach(clearTimeout), []);
  luE(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [msgs, typing]);

  const ask = (key, label) => {
    setStarted(true);
    setMsgs(m => [...m, { role:'user', text: label }]);
    setTyping(true);
    const t = setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, { role:'lucid', reply: REPLIES[key] || REPLIES.fallback }]);
    }, 900);
    timers.current.push(t);
  };
  const askDirect = (label, reply) => {
    setStarted(true);
    setMsgs(m => [...m, { role:'user', text: label }]);
    setTyping(true);
    const t = setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, { role:'lucid', reply }]);
    }, 900);
    timers.current.push(t);
  };
  const respond = (text) => {
    if (!text) return;
    setStarted(true);
    setMsgs(m => [...m, { role:'user', text }]);
    // Persona easter egg — client-side, fires with or without a backend.
    if (revealPending.current && LUCID_YES_RE.test(text)) {
      revealPending.current = false; setTyping(true);
      const t = setTimeout(()=>{ setTyping(false); setMsgs(m=>[...m,{ role:'lucid', reply:LUCID_REVEAL }]); }, 720);
      timers.current.push(t); return;
    }
    if (LUCID_IDENTITY_RE.test(text)) {
      revealPending.current = true; setTyping(true);
      const t = setTimeout(()=>{ setTyping(false); setMsgs(m=>[...m,{ role:'lucid', reply:LUCID_TEASE }]); }, 820);
      timers.current.push(t); return;
    }
    revealPending.current = false;
    setTyping(true);
    // Real engine for EVERY typed question: Lucid router → Claude → DataWorks → Groq,
    // with live markets/news/wallets/taxonomy context injected. Canned only if all return empty.
    luAnswer([...msgs, { role:'user', text }]).then(answer => {
      setTyping(false);
      if (answer) setMsgs(m => [...m, { role:'lucid', text:answer, reply:{ conf:'medium', body:answer, md:true } }]);
      else setMsgs(m => [...m, { role:'lucid', reply: REPLIES[matchPrompt(text)] || REPLIES.fallback }]);
    }).catch(() => {
      setTyping(false);
      setMsgs(m => [...m, { role:'lucid', reply: { conf:'chat', body:"Lucid's taking a quick breather — try again in a moment." } }]);
    });
  };
  const send = () => {
    const text = input.trim();
    if (!text || typing) return;
    setInput('');
    respond(text);
  };

  // Real in-panel voice — Web Speech API, live-transcribes into the input then sends to Lucid.
  const startMic = () => {
    if (micOn) { try{ micRef.current && micRef.current.stop(); }catch(e){} return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { return; }  // no API → user can type instead
    let done=false, finalT='';
    const rec = new SR(); micRef.current = rec;
    rec.lang='en-US'; rec.interimResults=true; rec.continuous=false; rec.maxAlternatives=1;
    rec.onresult=(e)=>{ let interim=''; for(let i=e.resultIndex;i<e.results.length;i++){ const r=e.results[i]; if(r.isFinal) finalT+=r[0].transcript; else interim+=r[0].transcript; } setInput((finalT+' '+interim).trim()); };
    rec.onerror=()=>{ if(done)return; done=true; setMicOn(false); };
    rec.onend=()=>{ if(done)return; done=true; setMicOn(false); const said=(finalT||'').trim(); if(said){ setInput(''); respond(said); } };
    try{ rec.start(); setMicOn(true); }catch(e){ setMicOn(false); }
  };

  // Seeded from unified search — route the typed query through the SAME real engine (not canned).
  const seededRef = luR(false);
  luE(() => {
    if (seededRef.current) return;
    if (seed && seed.query) { seededRef.current = true; respond(seed.query); }
  }, []);

  return (
    <div style={{position:'absolute', inset:0, zIndex:70, display:'flex', flexDirection:'column', justifyContent:'flex-end',
      background:'rgba(8,6,26,.5)', backdropFilter:'blur(16px) saturate(140%)', WebkitBackdropFilter:'blur(16px) saturate(140%)',
      animation:'lucidScrim 340ms ease-out both'}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        height:'92%', display:'flex', flexDirection:'column', position:'relative',
        background:'var(--surface-base)',
        borderTop:'1px solid rgba(124,91,255,.22)', borderRadius:'28px 28px 0 0',
        boxShadow:'0 -20px 70px rgba(8,6,26,.6), 0 -1px 0 rgba(255,255,255,.06)',
        transformOrigin:'bottom center', overflow:'hidden',
        animation:'lucidSheet 540ms cubic-bezier(.22,1,.36,1) both'
      }}>
        {/* soft violet aura at the top — brand warmth without text-on-glass */}
        <div style={{position:'absolute', top:0, left:0, right:0, height:140, pointerEvents:'none',
          background:'radial-gradient(120% 100% at 50% 0%, rgba(124,91,255,.16), transparent 70%)'}}/>
        {/* grabber */}
        <div style={{display:'flex', justifyContent:'center', paddingTop:8}}>
          <div style={{width:36, height:5, borderRadius:3, background:'var(--text-tertiary)', opacity:.4}}/>
        </div>

        {/* header */}
        <div style={{display:'flex', alignItems:'center', gap:12, padding:'10px 18px 14px'}}>
          <span style={{display:'inline-flex', animation:'lucidBloom 560ms cubic-bezier(.16,.84,.24,1) both'}}><LucidOrb size={40}/></span>
          <div style={{flex:1, minWidth:0}}>
            <div style={{display:'flex', alignItems:'center', gap:7, flexWrap:'nowrap'}}>
              <span style={{font:'700 19px var(--font-brand)', letterSpacing:'-.02em'}}>Lucid</span>
              <span style={{font:'600 9px var(--font-body)', color:'var(--color-violet-500)', background:'rgba(124,91,255,.14)',
                padding:'2px 7px', borderRadius:999, letterSpacing:'.06em', whiteSpace:'nowrap', flexShrink:0}}>AI COPILOT</span>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:6, marginTop:2, minWidth:0}}>
              <span className="arx-breath" style={{width:5, height:5, borderRadius:'50%', background:'var(--regime-up-mid)', boxShadow:'0 0 6px var(--regime-up-mid)', flexShrink:0}}/>
              <span style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{seed && seed.contextLabel ? seed.contextLabel : 'Reading your portfolio · 2 open positions'}</span>
            </div>
          </div>
          <button onClick={onClose} style={{width:34, height:34, borderRadius:'50%', cursor:'pointer',
            background:'var(--glass-control-bg)', border:'none', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <IconClose size={17} color="var(--text-secondary)"/>
          </button>
        </div>

        {/* conversation */}
        <div ref={scrollRef} style={{flex:1, overflowY:'auto', padding:'4px 18px 8px'}}>
          {!started && (
            <div className="arx-arrive" style={{display:'flex', gap:10, padding:'4px 0 14px'}}>
              <LucidOrb size={30} breathe={false}/>
              <div style={{flex:1}}>
                <div style={{background:'var(--surface-elevated)', border:'.5px solid var(--border-default)',
                  borderRadius:'4px 16px 16px 16px', padding:'12px 14px'}}>
                  <div style={{font:'600 14.5px var(--font-body)', lineHeight:1.4}}>{seed && seed.intro ? seed.intro.action : 'Morning, Sam. Markets are open and your copies are in the green.'}</div>
                  <div style={{font:'400 13px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.55, marginTop:6}}>
                    {seed && seed.intro ? seed.intro.body : 'I read your positions, the wallets you follow, and live market structure. Ask me anything — I’ll always show my confidence and my reasoning. I won’t tell you what to buy.'}
                  </div>
                </div>
              </div>
            </div>
          )}
          {msgs.map((m, i) => m.role==='user'
            ? <UserMsg key={i} text={m.text}/>
            : <LucidMsg key={i} reply={m.reply}/>)}
          {typing && <TypingDots/>}
        </div>

        {/* suggested prompts — horizontal rail (seeded to context when opened from a Lucid tip) */}
        <div style={{display:'flex', gap:8, overflowX:'auto', padding:'8px 18px 10px', scrollbarWidth:'none', flexShrink:0}}>
          {(seed && seed.chips ? seed.chips.map(c => ({ label:c.label, run:()=>askDirect(c.label, c.reply) }))
                               : PROMPTS.map(([key,label]) => ({ label, run:()=>ask(key,label) }))
          ).map((c,i) => (
            <button key={i} onClick={c.run} className="arx-press" style={{
              flexShrink:0, height:34, padding:'0 14px', borderRadius:999, cursor:'pointer',
              background:'var(--glass-control-bg-strong)', border:'.5px solid var(--glass-tab-border)',
              color:'var(--text-primary)', font:'500 12.5px var(--font-body)', whiteSpace:'nowrap'
            }}>{c.label}</button>
          ))}
        </div>

        {/* input */}
        <div style={{display:'flex', alignItems:'center', gap:10, padding:'4px 18px 10px', flexShrink:0}}>
          <div style={{flex:1, display:'flex', alignItems:'center', height:46, borderRadius:14, padding:'0 6px 0 16px',
            background:'var(--glass-control-bg)', border:'.5px solid var(--border-strong)'}}>
            <input value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{ if (e.key==='Enter') send(); }}
              placeholder="Ask Lucid about your positions or risk"
              style={{flex:1, border:'none', background:'none', outline:'none', font:'500 14px var(--font-body)', color:'var(--text-primary)'}}/>
            <button onClick={startMic} aria-label={micOn?'Stop listening':'Ask by voice'} className="arx-press" style={{
              width:36, height:36, borderRadius:10, border:'none', cursor:'pointer', background: micOn?'var(--regime-down-mid)':'var(--glass-control-bg-strong)',
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginRight:4
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={micOn?'#fff':'var(--color-violet-500)'} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><line x1="12" y1="18" x2="12" y2="21"/></svg>
            </button>
            <button onClick={send} disabled={!input.trim()} className="arx-press" style={{
              width:36, height:36, borderRadius:10, border:'none', cursor: input.trim()?'pointer':'default',
              background: input.trim() ? 'var(--color-violet-500)' : 'var(--glass-control-bg-strong)',
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
              boxShadow: input.trim() ? 'var(--shadow-execute)' : 'none', transition:'background 200ms'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={input.trim()?'#fff':'var(--text-tertiary)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
            </button>
          </div>
        </div>

        {/* persistent disclaimer — mandatory, always visible */}
        <div style={{padding:'8px 18px calc(10px + env(safe-area-inset-bottom))', borderTop:'.5px solid var(--border-default)',
          font:'400 10px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.45, textAlign:'center', flexShrink:0}}>
          Lucid provides market analysis, not financial advice. Past performance does not guarantee future results. You make all trading decisions.
        </div>
      </div>

      <style>{`
        @keyframes lucidScrim { from{opacity:0} to{opacity:1} }
        @keyframes lucidSheet { from{transform:translateY(46px) scale(.965); opacity:0} 60%{opacity:1} to{transform:translateY(0) scale(1); opacity:1} }
        @keyframes lucidBloom { 0%{opacity:0; transform:scale(.4) rotate(-12deg)} 55%{opacity:1} 100%{opacity:1; transform:scale(1) rotate(0)} }
        @keyframes lucidContentIn { from{opacity:0; transform:translateY(10px)} to{opacity:1; transform:translateY(0)} }
        @keyframes lucidRing { 0%,100%{opacity:.5; transform:scale(1)} 50%{opacity:0; transform:scale(1.25)} }
        @keyframes lucidGlow { 0%,100%{box-shadow:0 0 0 0 rgba(124,91,255,.5)} 50%{box-shadow:0 0 0 8px rgba(124,91,255,0)} }
        @keyframes lucidFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes lucidDot { 0%,100%{opacity:.3; transform:translateY(0)} 50%{opacity:1; transform:translateY(-3px)} }
      `}</style>
    </div>
  );
}

Object.assign(window, { LucidOrb, LucidFab, LucidPanel, LucidTip, LucidShell, LucidRow });
