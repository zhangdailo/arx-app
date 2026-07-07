/* ═══ ARX · Elon featured wallet — live Hyperliquid on-chain data ═══════════
   Pulls REAL clearinghouseState for the demo "Elon Musk" wallet from Hyperliquid's
   public /info endpoint (no key, CORS-open). Display name + photo stay exactly as
   they are — only the numbers are live. Exposed on window.__arxElonLive for Lucid
   context and any wallet UI that wants to read it. Refreshes every 60s. */
const ARX_ELON_ADDR = '0xECB63caA47c7c4E77F60f1cE858Cf28dC2B82b00';
window.__arxElonLive = window.__arxElonLive || { addr: ARX_ELON_ADDR, loaded:false };
async function arxLoadElon(){
  try {
    const c = new AbortController(); const to = setTimeout(()=>c.abort(), 7000);
    const r = await fetch('https://api.hyperliquid.xyz/info', {
      method:'POST', headers:{'content-type':'application/json'},
      body: JSON.stringify({ type:'clearinghouseState', user: ARX_ELON_ADDR }), signal:c.signal });
    clearTimeout(to);
    const j = await r.json();
    const av = parseFloat((j && j.marginSummary && j.marginSummary.accountValue) || '0');
    const aps = (j && j.assetPositions) || [];
    const positions = aps.map(p => {
      const po = p.position || {}; const sz = parseFloat(po.szi || '0');
      return { sym: po.coin, side: sz>=0?'LONG':'SHORT', notional: Math.abs(parseFloat(po.positionValue||'0')),
        lev: (po.leverage && po.leverage.value) || null, upnl: parseFloat(po.unrealizedPnl||'0') };
    }).filter(p => p.notional > 0).sort((a,b) => b.notional - a.notional);
    const totalUpnl = positions.reduce((s,p) => s + p.upnl, 0);
    if (av > 0 || positions.length) {
      window.__arxElonLive = { addr: ARX_ELON_ADDR, loaded:true, accountValue: av, nPos: positions.length,
        positions: positions.slice(0, 8), totalUpnl, ts: Date.now() };
      try { window.dispatchEvent(new Event('arx-elon-live')); } catch(e){}
    }
  } catch(e){ /* offline → stays loaded:false, UI keeps its seeded display */ }
  return window.__arxElonLive;
}
window.arxLoadElon = arxLoadElon;
try { arxLoadElon(); setInterval(arxLoadElon, 60000); } catch(e){}
