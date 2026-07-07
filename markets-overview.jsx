/* ═══════════════════════════════════════════════════════════════════════════
   Markets › Overview — merged IA: Bento cockpit + Tabbed drill-ins
   Questions/metrics/visuals/filters are catalogued in signal-defs.jsx › ARX_LOGIC.marketsOverview.
   Grounded in D.instruments + discover helpers. Reuses WalletFunding (money flow),
   AssetGlyph, NumberRoll. New widgets: unified MarketMap (OI/Volume/Liquidations),
   TopMovers, nested Positioning matrix, TradingFlow (CVD), Catalysts.
   ═══════════════════════════════════════════════════════════════════════════ */
const { useState: moS } = React;

/* ── dataset: derive overview fields from real instruments ── */
function moHash(s){ let h=2166136261; s=String(s); for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619);} return ((h>>>0)%1000)/1000; }
function moNum(s){ if(typeof s!=='string') return 1e8; const x=/([\d.]+)\s*([BMK]?)/.exec(s.replace(/[$,]/g,'')); if(!x) return 1e8; return (+x[1])*(x[2]==='B'?1e9:x[2]==='M'?1e6:x[2]==='K'?1e3:1); }
/* deterministic cohort long-share % (mirrors discover.pmBias seeding) */
function moBias(sym, who){ let h=0; for(let i=0;i<sym.length;i++) h=(h*31+sym.charCodeAt(i)+who.charCodeAt(0))>>>0; const base=50+((h%80)-40); const skew=who==='smart'?9:who==='whale'?4:who==='rising'?6:who==='rekt'?-6:0; return Math.max(8, Math.min(92, Math.round(base+skew))); }
const MO = (function(){
  const flat = (typeof discFlat==='function') ? discFlat() : [];
  return flat.map(m=>{
    const hz=moHash(m.sym), oiUsd=moNum(m.oi), volUsd=moNum(m.vol), up=m.deltaPct>=0;
    return {
      sym:m.sym, name:(m.name||m.sym).replace(/-PERP|-USD/,''), cls:m.cat, price:m.price, move:m.deltaPct,
      oiUsd, volUsd, oi:m.oi, vol:m.vol,
      oiD: +((up?1:-1)*(2+hz*16)).toFixed(1),
      volD: +(((up?1:-0.6))*(4+Math.abs(m.deltaPct)*3+hz*22)).toFixed(0),
      liq: Math.max(1, Math.round((oiUsd/1e8)*(Math.abs(m.deltaPct)+1)*(0.6+hz))),
      crowd:moBias(m.sym,'everyone'), smart:moBias(m.sym,'smart'), whale:moBias(m.sym,'whale'), rising:moBias(m.sym,'rising'), rekt:moBias(m.sym,'rekt'),
      buy: Math.max(30, Math.min(72, Math.round(50+(moBias(m.sym,'smart')-50)*0.5+(hz*10-5)))),
      fund:(typeof discFunding==='function')?discFunding(m.sym):0,
      spark:m.spark,
    };
  });
})();
const MO_CLASSES = [['all','All'],['Crypto','Crypto'],['Stocks','Stocks'],['Commodities','Commodities'],['PreIPO','Pre-IPO'],['Fx','FX']];
const MO_COHORTS = [['crowd','Everyone',''],['smart','Smart money','◆'],['whale','Whales','🐋'],['rising','Rising money','↗'],['rekt','Full-rekt','☠']];
const MO_WINS = ['15m','1H','4H','24H'];
const MO_CLABEL = { Crypto:'Crypto', Stocks:'Stocks', Commodities:'Commodities', PreIPO:'Pre-IPO', Fx:'FX' };

/* ── helpers ── */
/* Liquidity tier — RELATIVE to the asset class, not an absolute $ line.
   Thin = bottom 25% of its class by open interest · Deep = top 25% · OK = middle. */
function moTier(m){ const peers=MO.filter(x=>x.cls===m.cls).map(x=>x.oiUsd).sort((a,b)=>a-b); const n=peers.length; const below=peers.filter(v=>v<m.oiUsd).length; const pct=n>1?below/(n-1)*100:100; if(pct>=75) return {t:'Deep', c:'var(--text-secondary)'}; if(pct<25) return {t:'Thin', c:'var(--regime-trans-mid)'}; return {t:'OK', c:'var(--text-tertiary)'}; }
function moSign(v,d){ return (v>=0?'+':'−')+Math.abs(v).toFixed(d==null?2:d); }
function moPrice(p){ if(p>=1000) return '$'+p.toLocaleString(undefined,{maximumFractionDigits:0}); if(p>=1) return '$'+p.toFixed(2); return '$'+p.toPrecision(3); }
function moUsd(n){ if(n>=1e9) return '$'+(n/1e9).toFixed(1)+'B'; if(n>=1e6) return '$'+Math.round(n/1e6)+'M'; return '$'+Math.round(n/1e3)+'K'; }
function moLean(m,c){ return m[c]!=null?m[c]:m.crowd; }
function moOf(cls){ return MO.filter(m=>cls==='all'||m.cls===cls); }
/* ── LIVE overlay: patch MO crypto entries from Hyperliquid (markPx · prevDayPx → 24h move · OI · funding).
   Stocks/RWA stay seeded (no free live perp feed). Mutates the MO singleton each render; idempotent.
   Falls back silently to seed when live data is unavailable/disabled. ── */
function useLiveMO(){
  const quant = (typeof useQuantMarkets==='function') ? useQuantMarkets() : null;
  const ctxs = (typeof useHLAssetCtxs==='function') ? useHLAssetCtxs() : null;
  const mids = (typeof useHLAllMids==='function') ? useHLAllMids() : null;
  // Prefer the real warehouse (quant-api): live mark, prev-day, OI$, 24h $vol, funding.
  const Q = quant && quant.ok ? quant.data : null;
  if (Q){
    MO.forEach(m=>{
      const q = Q[m.sym]; if(!q) return;
      m.price = q.mark;
      m.move = q.deltaPct;
      m.oiD = +((m.move>=0?1:-1)*(2+Math.min(14,Math.abs(m.move)))).toFixed(1);
      m.volD = +((m.move>=0?1:-1)*(4+Math.abs(m.move)*1.5)).toFixed(0);
      if(q.oiUsd>0){ m.oiUsd = q.oiUsd; m.oi = moUsd(q.oiUsd); }
      if(q.volUsd>0){ m.volUsd = q.volUsd; m.vol = moUsd(q.volUsd); }
      if(q.funding!=null) m.fund = q.funding;
      m.live = true;
    });
  }
  if (ctxs){
    MO.forEach(m=>{
      if (m.live) return;                       // quant already covered it
      const c = ctxs[m.sym]; if(!c) return;
      const mid = parseFloat((mids && mids[m.sym]) || c.markPx || 0); if(!(mid>0)) return;
      const prev = c.prevDayPx || mid;
      m.price = mid;
      m.move = prev ? ((mid-prev)/prev)*100 : m.move;
      m.oiD = +((m.move>=0?1:-1)*(2+Math.min(14,Math.abs(m.move)))).toFixed(1);
      m.volD = +((m.move>=0?1:-1)*(4+Math.abs(m.move)*1.5)).toFixed(0);
      if(c.openInterest>0){ m.oiUsd = c.openInterest*mid; m.oi = moUsd(m.oiUsd); }
      if(c.volume24>0){ m.volUsd = c.volume24; m.vol = moUsd(c.volume24); }
      if(c.funding!=null) m.fund = c.funding;
      m.live = true;
    });
  }
  return (Q ? Object.keys(Q).length : 0) + (ctxs ? Object.keys(ctxs).length : 0);
}
/* Live stocks via Finnhub (real US-equity quotes). PreIPO/Commodities/FX have no free
   real-time feed, so they stay modeled. Crypto is covered by useLiveMO (Hyperliquid). */
function useLiveStocksMO(){
  const syms = MO.filter(m=>m.cls==='Stocks').map(m=>m.sym);
  const fh = (typeof useFinnhubQuotes==='function') ? useFinnhubQuotes(syms) : null;
  if (fh){
    MO.forEach(m=>{
      if(m.cls!=='Stocks') return;
      const q = fh[m.sym]; if(!q || !(q.price>0)) return;
      m.price = q.price;
      if(q.change!=null) m.move = q.change;
      m.oiD = +((m.move>=0?1:-1)*(2+Math.min(14,Math.abs(m.move)))).toFixed(1);
      m.volD = +((m.move>=0?1:-1)*(4+Math.abs(m.move)*1.5)).toFixed(0);
      m.live = true;
    });
  }
  return fh ? Object.keys(fh).length : 0;
}
function moWeighted(list,c){ let t=0,a=0; list.forEach(m=>{t+=m.oiUsd; a+=moLean(m,c)*m.oiUsd;}); return t?Math.round(a/t):50; }
/* Heatmap tile colour — a VIVID, YOUNG diverging scale (TradingView / Coin360 idiom but fresher),
   theme-INDEPENDENT so the data layer reads identically in light & dark while the FRAME adapts to
   the app. Tiles run between a fresh spring-mint (up) and a coral (down) through a cool slate centre;
   a high saturation FLOOR keeps even small moves clearly coloured (no muddy / aged forest-green or
   brick-red), and lightness stays in a band where white ink holds. Tile hues are a deliberate
   data-viz palette (brighter than the DS --regime-*-mid chrome ink) — the legend/scale-key below
   uses the same two so they stay in sync. Raw hex: the Arx DS has no achromatic neutral (doc'd gap). */
const TILE_SLATE='#2A2E3C';                 /* diverging centre · cool slate, dark enough for white ink in ANY theme */
const TILE_UP='var(--regime-up-mid)';                     /* up · fresh vivid spring mint (younger than --regime-up-mid) */
const TILE_DN='var(--regime-down-mid)';                     /* down · fresh vivid coral (younger than --regime-down-mid) */
const TILE_INK='var(--text-primary)';                    /* tile ink — white on vivid fills */
const TILE_INK_DIM='var(--text-tertiary)';   /* secondary tile ink */
function moDiv(signed, max){
  const t=Math.max(-1,Math.min(1,(signed||0)/(max||1))), mag=Math.abs(t);
  const NEUT='color-mix(in oklab, var(--text-tertiary) 40%, var(--surface-elevated))';
  if (mag<0.04) return NEUT;
  return `color-mix(in oklab, ${t>=0?TILE_UP:TILE_DN} ${(42+mag*34).toFixed(0)}%, ${NEUT})`;
}
function moMoveCol(v){ return moDiv(v,10); }
function moLeanCol(l){ return moDiv(l-50,30); }
function moLiqCol(m){ return moDiv((m.move>=0?1:-1)*Math.min(1,m.liq/40),1); }
function moSquarify(data,W,H){
  const out=[]; const total=data.reduce((s,d)=>s+d.v,0)||1; let items=data.map(d=>({d,_a:d.v/total*W*H})); let rect={x:0,y:0,w:W,h:H};
  const worst=(row,side)=>{const s=row.reduce((a,r)=>a+r._a,0);const mx=Math.max.apply(null,row.map(r=>r._a));const mn=Math.min.apply(null,row.map(r=>r._a));const s2=s*s;return Math.max(side*side*mx/s2,s2/(side*side*mn));};
  const lay=(row,rect,vert)=>{const s=row.reduce((a,r)=>a+r._a,0);if(vert){const rw=s/rect.h;let yy=rect.y;row.forEach(r=>{const rh=r._a/rw;out.push(Object.assign({},r.d,{x:rect.x,y:yy,w:rw,h:rh}));yy+=rh;});return {x:rect.x+rw,y:rect.y,w:rect.w-rw,h:rect.h};}else{const rh=s/rect.w;let xx=rect.x;row.forEach(r=>{const rw=r._a/rh;out.push(Object.assign({},r.d,{x:xx,y:rect.y,w:rw,h:rh}));xx+=rw;});return {x:rect.x,y:rect.y+rh,w:rect.w,h:rect.h-rh};}};
  let row=[],rem=items.slice();
  while(rem.length){const vert=rect.w>=rect.h,side=vert?rect.h:rect.w,nx=rem[0];if(!row.length){row.push(nx);rem.shift();continue;}if(worst(row.concat([nx]),side)<=worst(row,side)){row.push(nx);rem.shift();}else{rect=lay(row,rect,vert);row=[];}}
  if(row.length)lay(row,rect,rect.w>=rect.h); return out;
}

/* ── shared bits ── */
function MoChev({ size=13, color='var(--text-tertiary)', dir='r' }){ const p=dir==='d'?'6 9 12 15 18 9':'9 6 15 12 9 18'; return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points={p}/></svg>; }
function MoEyebrow({ children, dot }){ return <div style={{display:'flex', alignItems:'center', gap:6, margin:'0 0 9px'}}>{dot&&<span className="arx-breath" style={{width:6,height:6,borderRadius:'50%',background:dot}}/>}<span style={{font:'700 9px var(--font-body)', letterSpacing:'.08em', textTransform:'uppercase', color:'var(--text-tertiary)'}}>{children}</span></div>; }
/* ── DS-BOUND segmented primitive — the ONLY place a control's active state is defined.
   Selected = DS chip tokens (--chip-bg-selected thumb on --chip-bg track, --chip-fg text),
   i.e. a neutral elevated thumb, never a solid violet fill. Every Overview pill/segment routes
   through this so the active treatment can't drift per-control. Bold violet stays L1-nav only. ── */
function MoSegBase({ items, val, onPick, h=26, fs=11, pad=12, gap=0 }){
  return <div style={{display:'inline-flex', gap, background:'var(--chip-bg)', borderRadius:999, padding:2}}>
    {items.map(([id,l])=>{const on=val===id; return <button key={id} onClick={()=>onPick(id)} className="arx-press" style={{height:h, padding:`0 ${pad}px`, border:'none', cursor:'pointer', borderRadius:999, background:on?'color-mix(in oklab, var(--color-violet-500) 18%, var(--surface-base))':'transparent', color:on?'color-mix(in oklab, var(--color-violet-500) 60%, var(--text-primary))':'var(--text-tertiary)', font:`${on?700:500} ${fs}px var(--font-body)`, whiteSpace:'nowrap'}}>{l}</button>;})}
  </div>;
}
function MoSeg({ items, val, onPick }){ return <MoSegBase items={items} val={val} onPick={onPick}/>; }
function MoWindowPick({ val, onPick }){ return <MoSegBase items={MO_WINS.map(w=>[w,w])} val={val} onPick={onPick} h={24} fs={10.5} pad={11}/>; }
function MoClassTabs({ val, onPick, inst='perp' }){
  const items = inst==='spot' ? MO_CLASSES.filter(([k])=>k==='all'||k==='Crypto') : MO_CLASSES;
  return <div style={{display:'flex', gap:16, padding:'0 20px', overflowX:'auto', scrollbarWidth:'none'}}>{items.map(([k,l])=>(<button key={k} onClick={()=>onPick(k)} style={{background:'none', border:'none', cursor:'pointer', whiteSpace:'nowrap', paddingBottom:8, borderBottom:'2px solid '+(val===k?'var(--color-violet-500)':'transparent'), color:val===k?'var(--text-primary)':'var(--text-tertiary)', font:`${val===k?600:500} 13px var(--font-body)`}}>{l}</button>))}</div>;
}
function MoCohorts({ val, onPick, which=['crowd','smart','whale','rekt'], label }){
  const items = MO_COHORTS.filter(([id])=>which.includes(id)).map(([id,l,ic])=>[id,(ic?ic+' ':'')+l]);
  return <div style={{display:'flex', alignItems:'center', gap:8, overflowX:'auto', scrollbarWidth:'none', padding:'0 20px'}}>
    {label && <span style={{flexShrink:0, font:'600 8.5px var(--font-body)', letterSpacing:'.06em', textTransform:'uppercase', color:'var(--text-tertiary)'}}>{label}</span>}
    <MoSegBase items={items} val={val} onPick={onPick} h={28} fs={11.5} pad={13}/>
  </div>;
}
function MoBias({ longPct, h=20, r=8, marks }){ const top = marks?7:0; return <div style={{position:'relative', height:h+top}}>{marks&&marks.map((mk,i)=>(<span key={i} title={mk.label} style={{position:'absolute', top:0, left:`calc(${mk.long}% - 3.5px)`, width:0, height:0, borderLeft:'3.5px solid transparent', borderRight:'3.5px solid transparent', borderTop:`5.5px solid ${mk.color}`, filter:'drop-shadow(0 0 1px var(--surface-base))'}}/>))}<div style={{position:'absolute', left:0, right:0, top, bottom:0}}><div style={{position:'absolute', inset:'3px 0', borderRadius:r, overflow:'hidden', display:'flex', background:'var(--surface-modal)'}}><div style={{width:longPct+'%', background:'var(--regime-up-mid)'}}/><div style={{width:(100-longPct)+'%', background:'var(--regime-down-mid)'}}/></div><div style={{position:'absolute', left:'50%', top:0, bottom:0, width:1.5, background:'var(--surface-base)'}}/></div></div>; }
function MoMag({ pct, col }){ return <span style={{display:'block', height:6, borderRadius:999, background:'var(--surface-modal)', overflow:'hidden'}}><span style={{display:'block', height:'100%', width:pct+'%', background:col, borderRadius:999}}/></span>; }
function MoTitle({ children, sub, right }){ return <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', padding:'0 20px 12px', gap:10}}><div style={{minWidth:0}}><div style={{font:'800 19px var(--font-brand)', letterSpacing:'-.01em', color:'var(--text-primary)'}}>{children}</div>{sub&&<div style={{font:'500 12px var(--font-body)', color:'var(--text-tertiary)', marginTop:3, lineHeight:1.4}}>{sub}</div>}</div>{right}</div>; }
function MoRoll({ value, format, style }){ return (typeof NumberRoll!=='undefined') ? <NumberRoll value={value} format={format} style={style}/> : <span className="num" style={style}>{format(value)}</span>; }

/* ═══ DAY READ — scope-aware market conditions (perp vs spot) ═══ */
function MoDayRead({ inst='perp' }){
  const spot = inst==='spot';
  const set = spot ? MO.filter(m=>m.cls==='Crypto') : MO;
  const n=set.length||1, up=set.filter(m=>m.move>=0).length, totOI=set.reduce((s,m)=>s+m.oiUsd,0), totVol=set.reduce((s,m)=>s+m.volUsd,0);
  const brPct=Math.round(up/n*100), wfund=set.reduce((s,m)=>s+m.fund*m.oiUsd,0)/(totOI||1), avgMv=set.reduce((s,m)=>s+m.move,0)/n;
  const upc='var(--regime-up-mid)', dnc='var(--regime-down-mid)';
  // Volatility: real realized dispersion of the LIVE 24h moves we're actually holding (stdev, ×-normalized).
  const liveSet = set.filter(m=>m.live);
  const volReal = liveSet.length>=3 ? (()=>{ const mean=liveSet.reduce((s,m)=>s+m.move,0)/liveSet.length; const varr=liveSet.reduce((s,m)=>s+Math.pow(m.move-mean,2),0)/liveSet.length; return Math.sqrt(varr); })() : null;
  const liqReal = (typeof useQuantLiq==='function') ? useQuantLiq() : null;
  const facts = spot
    ? [['Breadth',brPct+'% up', brPct>=50?upc:dnc],['Volume',moUsd(totVol),'var(--text-primary)'],['Markets',String(set.length),'var(--text-primary)'],['Avg move',moSign(avgMv,1)+'%', avgMv>=0?upc:dnc]]
    : [['Breadth',brPct+'% up', brPct>=50?upc:dnc],['Funding · mkt',moSign(wfund*100,3)+'bps', wfund>=0?'var(--text-primary)':dnc],
       ['Volatility', volReal!=null?volReal.toFixed(1)+'% 24h':'—','var(--text-primary)'],
       ['Liquidations', liqReal!=null?liqReal.toLocaleString():'—','var(--text-primary)']];
  return <div style={{margin:'0 16px', borderRadius:14, border:'.5px solid var(--border-default)', background:'var(--surface-elevated)', display:'flex'}}>{facts.map(([k,v,c],i)=>(<div key={k} style={{flex:1, padding:'10px 11px', borderLeft:i?'.5px solid var(--border-default)':'none'}}><div style={{font:'600 8px var(--font-body)', letterSpacing:'.04em', textTransform:'uppercase', color:'var(--text-tertiary)', whiteSpace:'nowrap'}}>{k}</div><div className="num" style={{font:'700 13px var(--font-mono)', color:c, marginTop:3}}>{v}</div></div>))}</div>;
}

/* ═══ MARKET MAP — OI / Volume / Liquidations ═══ */
function MoMarketMap({ inst='perp', metric:mp, lockMetric, simple, bare, win:winProp, height=300, onOpen, onSeeAll }){
  const [cls,setCls]=moS('all'); const [coh,setCoh]=moS('crowd'); const [winInner,setWin]=moS('24H'); const win=winProp!=null?winProp:winInner; const [metric,setMetric]=moS(mp||'oi'); const [winOpen,setWinOpen]=moS(false);
  const spot = inst==='spot';   // type is controlled by the shared Layer-2 scope, not a local toggle
  const M = lockMetric?mp : (simple||bare)?'oi' : spot?'vol' : metric;
  const wf = ({'15m':0.18,'1H':0.4,'4H':0.72,'24H':1})[win]||1;          // window scales the live deltas
  const mv=(m)=>m.move*wf, oid=(m)=>m.oiD*wf, vd=(m)=>Math.round(m.volD*wf), lq=(m)=>Math.max(1,Math.round(m.liq*wf));
  const sizeOf=(m)=> M==='vol'?m.volUsd:M==='liq'?lq(m):m.oiUsd;
  const scope = moOf(spot?'Crypto':cls);
  // Mobile readability cap: 8 tiles keeps the smallest legible; the rest live behind the See-all CTA.
  const MAX=8, ranked=scope.slice().sort((a,b)=>sizeOf(b)-sizeOf(a)), list=ranked.slice(0,MAX), tail=Math.max(0,ranked.length-MAX);
  const clsName = spot ? 'spot markets' : (cls==='all' ? 'markets' : MO_CLABEL[cls].toLowerCase());
  const tmRef = React.useRef(null);
  const [tmW, setTmW] = moS(0);
  React.useLayoutEffect(()=>{ const el=tmRef.current; if(!el) return; const w=el.clientWidth; if(w && Math.abs(w-tmW)>0.5) setTmW(w); });
  // Minimum-area floor: small tiles (XRP/DOGE/AVAX) keep enough size to stay legible
  // instead of collapsing to clipped slivers. Floors each tile at ~5.5% of total area.
  const W=tmW||334, H=height;
  const rawTot=list.reduce((s,m)=>s+sizeOf(m),0)||1, minV=rawTot*0.055;
  const cells=moSquarify(list.map(m=>Object.assign({},m,{v:Math.max(sizeOf(m),minV)})),W,H);
  const colorOf=(m)=> M==='liq'?moLiqCol(m): (coh!=='crowd')?moLeanCol(moLean(m,coh)) : M==='vol'?moMoveCol(vd(m)) : moMoveCol(oid(m));
  // class-level aggregates (merged back from legacy heatmap)
  const agOI=scope.reduce((s,m)=>s+m.oiUsd,0), agVol=scope.reduce((s,m)=>s+m.volUsd,0), agF=scope.reduce((s,m)=>s+m.fund*m.oiUsd,0)/(agOI||1), agOiD=scope.reduce((s,m)=>s+oid(m),0)/(scope.length||1), agBr=Math.round(scope.filter(m=>m.move>=0).length/(scope.length||1)*100), agMv=scope.reduce((s,m)=>s+mv(m),0)/(scope.length||1);
  const cells4 = spot
    ? [['Volume',moUsd(agVol)],['Markets',String(scope.length)],['Breadth',agBr+'% up', agBr>=50?'var(--regime-up-mid)':'var(--regime-down-mid)'],['Avg move',moSign(agMv,1)+'%', agMv>=0?'var(--regime-up-mid)':'var(--regime-down-mid)']]
    : [['OI',moUsd(agOI)],['Volume',moUsd(agVol)],['Funding',moSign(agF,3)+'%', agF>=0?'var(--regime-up-mid)':'var(--regime-down-mid)'],['Net OI Δ',moSign(agOiD,1)+'%', agOiD>=0?'var(--regime-up-mid)':'var(--regime-down-mid)']];
  return (
    <div>
      {/* collapsible window (default 24H, tap to expand). Title + window owned by the widget shell when `bare`. */}
      {!bare && <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px 10px', minHeight:28}}>
        <span style={{font:'600 15px var(--font-brand)', letterSpacing:'-.01em', color:'var(--text-primary)'}}>Heatmap</span>
        <MoWindowPick val={win} onPick={setWin}/>
      </div>}
      {!simple && !bare && <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px 10px'}}>
        {!lockMetric ? (spot ? <MoEyebrow>Spot · sized by volume</MoEyebrow> : <MoSeg items={[['oi','OI'],['vol','Volume'],['liq','Liquidations']]} val={metric} onPick={setMetric}/>) : <MoEyebrow>{M==='liq'?'Liquidations heatmap':M==='vol'?'Volume heatmap':'Open interest heatmap'}</MoEyebrow>}
      </div>}
      {!simple && !bare && <MoClassTabs val={spot?'Crypto':cls} onPick={setCls} inst={spot?'spot':'perp'}/>}
      {!simple && !bare && M!=='liq' && !spot && <div style={{padding:'11px 0 0'}}><MoCohorts val={coh} onPick={setCoh} which={['crowd','smart','whale']} label="Cohort"/></div>}
      {M==='liq' && <><div style={{margin:'12px 16px 0', display:'flex', height:9, borderRadius:999, overflow:'hidden', gap:3}}><div style={{width:'68%', background:'var(--regime-up-mid)', borderRadius:'999px 3px 3px 999px'}}/><div style={{width:'32%', background:'var(--regime-down-mid)', borderRadius:'3px 999px 999px 3px'}}/></div><div style={{margin:'6px 20px 0', display:'flex', justifyContent:'space-between', font:'600 10px var(--font-mono)'}}><span style={{color:'var(--regime-up-mid)'}}>Shorts squeezed $97M</span><span style={{color:'var(--regime-down-mid)'}}>Longs flushed $45M</span></div></>}
      {/* class-level aggregates live in the Market conditions widget now — only shown in the standalone (non-bare) map */}
      {!bare && (spot || cls!=='all') && <div style={{margin:'12px 16px 0'}}>
        <div style={{font:'600 8px var(--font-body)', color:'var(--text-tertiary)', letterSpacing:'.05em', textTransform:'uppercase', margin:'0 0 6px 4px'}}>{spot?'Crypto spot':MO_CLABEL[cls]} · {win}</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:1, background:'var(--border-default)', borderRadius:11, overflow:'hidden'}}>
          {cells4.map(([k,v,c])=>(<div key={k} style={{background:'var(--surface-elevated)', padding:'8px 9px'}}><div style={{font:'600 8px var(--font-body)', color:'var(--text-tertiary)', letterSpacing:'.04em', textTransform:'uppercase', whiteSpace:'nowrap'}}>{k}</div><div className="num" style={{font:'600 12.5px var(--font-mono)', color:c||'var(--text-primary)', marginTop:3}}>{v}</div></div>))}
        </div>
      </div>}
      <div style={{margin:'10px 16px 0', borderRadius:18, border:'.5px solid var(--border-default)', background:'var(--surface-elevated)', padding:5, boxShadow:'0 1px 2px rgba(0,0,0,.06)'}}>
        <div ref={tmRef} style={{position:'relative', width:'100%', height:H}}>
          {cells.map(m=>{
            const big=m.w>=104&&m.h>=76, tiny=!big&&(m.w<80||m.h<50);
            // text scales with the tile: clamp to the smaller constraining dimension
            const tFs=Math.max(10.5, Math.min(20, Math.round(Math.min(m.w/4.6, m.h/4.9)))), vFs=Math.max(10, Math.round(tFs*0.8)), sFs=Math.max(8.5, Math.round(tFs*0.55));
            const showVal=m.h>=36, showSub=m.h>=64 && m.w>=64;
            // Single metric per lens (colour encodes it): OI→OIΔ% · Volume→VolΔ% · Liquidations→$ + side · cohort overlay→long-share.
            const isCohort = coh!=='crowd' && M!=='liq';
            const lean=moLean(m,coh);
            const primary = isCohort ? ((lean>=50?lean:100-lean)+'% '+(lean>=50?'long':'short'))
              : M==='liq' ? ('$'+lq(m)+'M')
              : M==='vol' ? (moSign(vd(m),0)+'%')
              : (moSign(oid(m),1)+'%');
            const secondary = isCohort ? (M==='vol'?'Vol '+moUsd(m.volUsd):'OI '+moUsd(m.oiUsd))
              : M==='liq' ? (m.move>=0?'shorts squeezed':'longs flushed')
              : M==='vol' ? ('Vol '+moUsd(m.volUsd))
              : ('OI '+moUsd(m.oiUsd));
            return (
              <button key={m.sym} onClick={()=>onOpen&&onOpen(m)} className="arx-press" style={{position:'absolute', left:m.x+1.5, top:m.y+1.5, width:m.w-3, height:m.h-3, border:'none', borderRadius:12, padding:tiny?'3px 5px':'6px 8px', cursor:'pointer', background:colorOf(m), boxShadow:'none', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:big?2:0, overflow:'hidden', textAlign:'center'}}>
                <span style={{font:`600 ${tFs}px var(--font-brand)`, color:TILE_INK, letterSpacing:'-.005em', lineHeight:1.06, whiteSpace:'nowrap'}}>{m.sym}</span>
                {showVal&&<span className="num" style={{font:`600 ${vFs}px var(--font-mono)`, color:(primary[0]==='−'?'var(--regime-down-mid)':primary[0]==='+'?'var(--regime-up-mid)':'var(--text-primary)'), lineHeight:1.12, whiteSpace:'nowrap'}}>{primary}</span>}
                {showSub&&<span className="num" style={{font:`500 ${sFs}px var(--font-mono)`, color:TILE_INK_DIM, marginTop:1, whiteSpace:'nowrap'}}>{secondary}</span>}
              </button>
            );
          })}
        </div>
      </div>
      {(()=>{ const fixed = M!=='liq' && coh==='crowd';
        const cfg = M==='liq' ? {a:'Longs flushed', b:'Shorts squeezed'}
          : coh!=='crowd' ? {a:'Short', b:'Long'}
          : M==='vol' ? {a:'−10%', b:'+10%'}
          : {a:'−10%', b:'+10%'};
        const grad=`linear-gradient(90deg, color-mix(in oklab, ${TILE_DN} 86%, ${TILE_SLATE}), ${TILE_SLATE} 50%, color-mix(in oklab, ${TILE_UP} 86%, ${TILE_SLATE}))`;
        return (
      <div style={{display:'flex', alignItems:'center', gap:7, padding:'10px 20px 0', font:'500 8.5px var(--font-mono)', color:'var(--text-tertiary)'}}>
        <span>{cfg.a}</span><span style={{flex:1, height:6, borderRadius:999, background:grad}}/><span>{cfg.b}</span>
        {fixed && <span style={{flexShrink:0, font:'500 8px var(--font-body)', color:'var(--text-tertiary)', paddingLeft:2}}>fixed scale</span>}
      </div>); })()}
      <div style={{margin:'8px 20px 0', display:'flex', flexWrap:'wrap', gap:'2px 12px', justifyContent:'center', font:'500 9px var(--font-body)', color:'var(--text-tertiary)'}}>
        <span><b style={{color:'var(--text-secondary)'}}>Area</b> {M==='vol'?'24h volume':M==='liq'?'$ liquidated':'open interest'}</span>
        <span><b style={{color:'var(--text-secondary)'}}>Color</b> {M==='liq'?'squeeze side':coh==='smart'?'smart lean':coh==='whale'?'whale lean':M==='vol'?'volume Δ (±10%)':'OI Δ (±10%)'}</span>
      </div>
      {tail>0 && onSeeAll && <button onClick={()=>onSeeAll()} className="arx-press" style={{display:'flex', alignItems:'center', justifyContent:'center', gap:5, width:'calc(100% - 32px)', margin:'10px 16px 0', padding:'9px', borderRadius:11, cursor:'pointer', border:'.5px solid var(--border-default)', background:'var(--surface-base)', color:'var(--color-violet-300)', font:'600 12px var(--font-body)'}}>See all {clsName}<MoChev size={11} color="var(--color-violet-300)"/></button>}
    </div>
  );
}

/* ═══ MARKET HEATMAP — Arx DS MarketHeatmap (canonical "D · Deeper" scale) ═══
   Birds-eye "what's moving": sized by OI/volume, tinted by the windowed price move.
   Replaces the bespoke tile colouring with the DS canonical CVD-safe scale. */
function MoHeatmap({ inst='perp', win='24H', onOpen, onSeeAll }){
  const spot = inst==='spot';
  const [cls,setCls]=moS('all');
  const [metric,setMetric]=moS('oi');               // size source
  const M = spot ? 'vol' : metric;
  const wf = ({'15m':0.18,'1H':0.4,'4H':0.72,'24H':1})[win]||1;   // window scales the move
  const scope = moOf(spot?'Crypto':cls);
  const MAX=8;
  const ranked = scope.slice().sort((a,b)=> (M==='vol'? b.volUsd-a.volUsd : b.oiUsd-a.oiUsd));
  const tail = Math.max(0, ranked.length-MAX);
  const picked = ranked.slice(0,MAX);
  // Minimum-area floor so the smallest tiles (DOGE/AVAX/SUI/XRP) stay legible (label + value)
  // instead of collapsing into clipped slivers. Floors each at ~6.5% of total area.
  const wOf = (m)=> M==='vol'?m.volUsd:m.oiUsd;
  const rawTot = picked.reduce((s,m)=>s+wOf(m),0)||1, minW = rawTot*0.065;
  const items = picked.map(m=>({ symbol:m.sym, weight: Math.max(wOf(m), minW), deltaPct:+(m.move*wf).toFixed(2) }));
  // canonical DS scale: stretch saturation to the data's actual range (not a fixed ±8%)
  const maxAbs = (typeof ArxHeat!=='undefined' && ArxHeat.autoMaxAbs) ? ArxHeat.autoMaxAbs(items.map(x=>x.deltaPct)) : Math.max(2, Math.round(8*wf));
  const bySym = {}; scope.forEach(m=>{ bySym[m.sym]=m; });
  const tmRef=React.useRef(null); const [tmW,setTmW]=moS(0);
  React.useLayoutEffect(()=>{ const el=tmRef.current; if(!el) return; const w=el.clientWidth; if(w&&Math.abs(w-tmW)>0.5) setTmW(w); });
  const clsName = spot ? 'spot markets' : (cls==='all'?'markets':MO_CLABEL[cls].toLowerCase());
  return (
    <div>
      {!spot
        ? <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px 10px'}}><MoSeg items={[['oi','OI'],['vol','Volume']]} val={metric} onPick={setMetric}/></div>
        : <div style={{padding:'0 20px 10px'}}><MoEyebrow>Spot · sized by volume</MoEyebrow></div>}
      <MoClassTabs val={spot?'Crypto':cls} onPick={setCls} inst={spot?'spot':'perp'}/>
      <div ref={tmRef} style={{margin:'10px 16px 0'}}>
        {typeof MarketHeatmap!=='undefined'
          ? <MarketHeatmap items={items} width={tmW||340} height={300} maxAbs={maxAbs} maxTiles={MAX} onTap={(sym)=>{ const m=bySym[sym]; if(m&&onOpen) onOpen(m); }}/>
          : <div style={{height:300, display:'grid', placeItems:'center', color:'var(--text-tertiary)', font:'400 12px var(--font-body)'}}>Heatmap loading…</div>}
      </div>
      {typeof HeatLegend!=='undefined' && <div style={{margin:'10px 20px 0'}}><HeatLegend maxAbs={maxAbs} marker={items.length?items.reduce((s,x)=>s+x.deltaPct,0)/items.length:0} label={win==='24H'?'24h move':win+' move'}/></div>}
      <div style={{margin:'8px 20px 0', display:'flex', flexWrap:'wrap', gap:'2px 12px', justifyContent:'center', font:'500 9px var(--font-body)', color:'var(--text-tertiary)'}}>
        <span><b style={{color:'var(--text-secondary)'}}>Area</b> {M==='vol'?'24h volume':'open interest'}</span>
        <span><b style={{color:'var(--text-secondary)'}}>Color</b> {win==='24H'?'24h':win} price move</span>
      </div>
      {tail>0 && onSeeAll && <button onClick={()=>onSeeAll()} className="arx-press" style={{display:'flex', alignItems:'center', justifyContent:'center', gap:5, width:'calc(100% - 32px)', margin:'10px 16px 0', padding:'9px', borderRadius:11, cursor:'pointer', border:'.5px solid var(--border-default)', background:'var(--surface-base)', color:'var(--color-violet-300)', font:'600 12px var(--font-body)'}}>See all {clsName}<MoChev size={11} color="var(--color-violet-300)"/></button>}
    </div>
  );
}

/* ═══ TOP MOVERS ═══ */
function MoMovers({ inst='perp', limit=10, compact, onOpen, onSeeAll }){
  const [metric,setMetric]=moS('gainers'); const [cls,setCls]=moS('all'); const [deepOnly,setDeepOnly]=moS(false);
  let rows=moOf(cls).slice();
  if(deepOnly) rows=rows.filter(m=>moTier(m).t!=='Thin');
  const key=(m)=>metric==='oi'?m.oiD:metric==='vol'?m.volD:m.move;
  if(metric==='losers') rows.sort((a,b)=>key(a)-key(b)); else rows.sort((a,b)=>key(b)-key(a));
  rows=rows.slice(0,compact?5:limit);
  return (
    <div>
      <div style={{display:'flex', alignItems:'center', gap:8, padding:'0 20px 0'}}>
        <div style={{display:'flex', gap:7, overflowX:'auto', scrollbarWidth:'none'}}>
          {[['gainers','Gainers'],['losers','Losers'],['oi','OI Δ']].map(([id,l])=>{const on=metric===id;return <button key={id} onClick={()=>setMetric(id)} className="arx-press" style={{flexShrink:0, height:30, padding:'0 14px', borderRadius:999, cursor:'pointer', background:on?'color-mix(in oklab, var(--color-violet-500) 16%, var(--surface-base))':'transparent', border:'.5px solid '+(on?'color-mix(in oklab, var(--color-violet-500) 42%, transparent)':'var(--border-default)'), color:on?'color-mix(in oklab, var(--color-violet-500) 60%, var(--text-primary))':'var(--text-secondary)', font:`${on?700:600} 12.5px var(--font-body)`}}>{l}</button>;})}
        </div>
        <button onClick={()=>setDeepOnly(!deepOnly)} className="arx-press" aria-pressed={deepOnly} style={{marginLeft:'auto', flexShrink:0, display:'inline-flex', alignItems:'center', gap:5, height:28, padding:'0 11px', borderRadius:999, cursor:'pointer', background:deepOnly?'color-mix(in oklab, var(--color-violet-500) 16%, var(--surface-base))':'transparent', border:'.5px solid '+(deepOnly?'color-mix(in oklab, var(--color-violet-500) 42%, transparent)':'var(--border-default)'), color:deepOnly?'color-mix(in oklab, var(--color-violet-500) 60%, var(--text-primary))':'var(--text-tertiary)', font:`${deepOnly?700:600} 11px var(--font-body)`, whiteSpace:'nowrap'}}>
          <span style={{width:8, height:8, borderRadius:'50%', border:'1.5px solid currentColor', background:deepOnly?'currentColor':'transparent', flexShrink:0}}/>Hide thin
        </button>
      </div>
      <div style={{margin:compact?'12px 16px 0':'14px 16px 0', borderRadius:16, border:'.5px solid var(--border-default)', background:'var(--surface-elevated)', overflow:'hidden'}}>
        {rows.map((m,i)=>{const lt=moTier(m), oiUp=m.oiD>=0; const val=metric==='oi'?moSign(m.oiD,1)+'%':metric==='vol'?moSign(m.volD,0)+'%':moSign(m.move)+'%'; const vc=(metric==='oi'?m.oiD:metric==='vol'?m.volD:m.move)>=0?'var(--regime-up-mid)':'var(--regime-down-mid)'; const sub=moPrice(m.price)+' · '+moSign(m.move)+'% · '+(metric==='vol'?'Vol '+moUsd(m.volUsd):'OI '+moUsd(m.oiUsd)+' '+(oiUp?'▲':'▼')+Math.abs(m.oiD).toFixed(0)+'%');
          return (
            <button key={m.sym} onClick={()=>onOpen&&onOpen(m)} className="arx-row-press" style={{display:'flex', alignItems:'center', gap:11, width:'100%', padding:'10px 13px', boxShadow:i?'inset 0 .5px 0 var(--border-default)':'none', background:'none', border:'none', cursor:'pointer', textAlign:'left'}}>
              <span className="num" style={{width:14, font:'700 11px var(--font-mono)', color:'var(--text-tertiary)', flexShrink:0}}>{i+1}</span>
              <AssetGlyph sym={m.sym} size={30}/>
              <div style={{flex:1, minWidth:0}}>
                <div style={{display:'flex', alignItems:'center', gap:6}}><span style={{font:'700 13.5px var(--font-brand)', color:'var(--text-primary)'}}>{m.sym}</span><span title={m.live?'Live data':'Modeled'} style={{width:6, height:6, borderRadius:'50%', background:m.live?'var(--regime-up-mid)':'var(--text-tertiary)', flexShrink:0}}/><span style={{font:'600 8.5px var(--font-body)', color:lt.c, background:'color-mix(in oklab, '+lt.c+' 14%, transparent)', padding:'1px 6px', borderRadius:999}}>{lt.t}</span></div>
                <div className="num" style={{font:'500 9.5px var(--font-mono)', color:'var(--text-tertiary)', marginTop:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{sub}</div>
              </div>
              <div className="num" style={{font:'700 14px var(--font-mono)', color:vc, flexShrink:0}}>{val}</div>
              <MoChev/>
            </button>
          );})}
      </div>
      {!compact && <button onClick={()=>onSeeAll&&onSeeAll()} className="arx-press" style={{display:'flex', alignItems:'center', justifyContent:'center', gap:5, width:'calc(100% - 32px)', margin:'10px 16px 0', padding:'9px', borderRadius:11, cursor:'pointer', border:'.5px solid var(--border-default)', background:'var(--surface-base)', color:'var(--color-violet-300)', font:'600 12px var(--font-body)'}}>See all markets<MoChev size={11} color="var(--color-violet-300)"/></button>}
      {!compact && <div style={{margin:'8px 20px 0', font:'500 10.5px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.45}}>Ranked by {metric==='oi'?'open-interest change':'24h move'} · whole market{deepOnly?' · deep books only':''}. <span style={{color:'var(--regime-trans-mid)'}}>Thin</span> = bottom 25% of its asset class by open interest, shallow book — size carefully.</div>}
    </div>
  );
}

/* ═══ POSITIONING — one drill-down: market → asset class → top-10 instruments.
   Smart money + whales shown INLINE on each instrument (no separate cohort table). ═══ */
function MoPositioning({ inst='perp', onOpen }){
  const [open,setOpen]=moS(null);   // default collapsed — class rows first, drill in for the cohort matrix
  const liveCtx = window.useHLAssetCtxs ? window.useHLAssetCtxs() : null;
  const liveOI = (m)=>{ const c = liveCtx && liveCtx[m.sym]; return (c && c.openInterest>0 && c.markPx>0) ? c.openInterest*c.markPx : m.oiUsd; };
  const all=moOf('all');
  const up='var(--regime-up-mid)', dn='var(--regime-down-mid)';
  const violetInk='color-mix(in oklab, var(--color-violet-500) 60%, var(--text-primary))';
  const mkt=moWeighted(all,'crowd'), smartMkt=moWeighted(all,'smart');
  const mktCol = mkt>=50?up:dn;
  const sd = smartMkt - mkt;
  const verdict = Math.abs(sd)<6 ? 'Smart money is sitting with the crowd.' : sd>0 ? 'Smart money leans more long than the crowd.' : 'Smart money leans more short than the crowd.';
  const classes=['Crypto','Stocks','Commodities','PreIPO','Fx'].map(ck=>{const list=MO.filter(m=>m.cls===ck);if(!list.length)return null;const b=moWeighted(list,'crowd'),sm=moWeighted(list,'smart');return {ck,cl:MO_CLABEL[ck],b,sm,oi:list.reduce((s,m)=>s+liveOI(m),0),div:(sm>=50)!==(b>=50)||Math.abs(sm-b)>=14,list:list.slice().sort((a,b2)=>b2.oiUsd-a.oiUsd).slice(0,10)};}).filter(Boolean);
  const pct=(v)=>v>=50?v:100-v, dir=(v)=>v>=50?'long':'short', col=(v)=>v>=50?up:dn;
  return (
    <div>
      {/* MARKET OVERVIEW — overall long/short + a one-line smart-vs-crowd read (no breakdown table) */}
      <div style={{margin:'0 16px', borderRadius:16, border:'.5px solid var(--border-default)', background:'linear-gradient(140deg, color-mix(in oklab, var(--color-violet-500) 9%, var(--surface-elevated)), var(--surface-elevated) 60%)', padding:16}}>
        <div style={{font:'600 9px var(--font-body)', letterSpacing:'.06em', textTransform:'uppercase', color:'var(--text-tertiary)'}}>Market · share of open interest long</div>
        <div style={{display:'flex', alignItems:'flex-end', gap:8, margin:'8px 0 12px'}}>
          <MoRoll value={pct(mkt)} format={v=>Math.round(v)+'%'} style={{font:'700 30px var(--font-brand)', letterSpacing:'-.02em', lineHeight:1, color:mktCol}}/>
          <span style={{font:'600 14px var(--font-body)', color:mktCol, paddingBottom:3}}>{dir(mkt)}</span>
          <span className="num" style={{font:'500 11px var(--font-mono)', color:'var(--text-tertiary)', paddingBottom:4, marginLeft:'auto'}}>{all.length} markets</span>
        </div>
        <MoBias longPct={mkt} h={16}/>
        <div style={{display:'flex', alignItems:'baseline', gap:8, marginTop:12}}>
          <span style={{flexShrink:0, font:'700 11px var(--font-body)', color:violetInk}}>◆</span>
          <span style={{font:'500 11.5px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.35}}>{verdict}</span>
        </div>
      </div>
      {/* BY ASSET CLASS — the one table; expand → top 10 instruments with smart + whales inline */}
      <div style={{padding:'20px 16px 12px'}}><span style={{font:'700 13px var(--font-body)', color:'var(--text-primary)'}}>By asset class</span></div>
      <div style={{margin:'0 16px', borderRadius:16, border:'.5px solid var(--border-default)', background:'var(--surface-elevated)', overflow:'hidden'}}>
        {classes.map((c,i)=>{const isO=open===c.ck;return (
          <div key={c.ck} style={{borderTop:i?'.5px solid var(--border-default)':'none'}}>
            <button onClick={()=>setOpen(isO?null:c.ck)} className="arx-row-press" style={{width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'none', border:'none', cursor:'pointer', textAlign:'left'}}>
              <div style={{flex:'0 0 84px', minWidth:0}}><div style={{display:'flex', alignItems:'center', gap:4}}><span style={{font:'700 12.5px var(--font-body)', color:'var(--text-primary)'}}>{c.cl}</span>{c.div&&<span title="smart money opposes the crowd" style={{font:'700 10px var(--font-body)', color:'var(--regime-trans-mid)'}}>⟂</span>}</div><div className="num" style={{font:'600 8.5px var(--font-mono)', color:'var(--text-tertiary)', marginTop:2}}>OI {moUsd(c.oi)}</div></div>
              <div style={{flex:1}}><MoBias longPct={c.b} h={16}/></div>
              <span className="num" style={{flex:'0 0 64px', textAlign:'right', font:'600 11px var(--font-mono)', color:col(c.b)}}>{pct(c.b)}% {dir(c.b)}</span>
              <MoChev dir={isO?'d':'r'}/>
            </button>
            {isO && <div style={{borderTop:'.5px solid var(--border-default)', background:'var(--surface-base)', padding:'4px 0 8px'}}>
              <div style={{display:'grid', gridTemplateColumns:'60px 1fr 1fr 1fr 1fr', gap:4, padding:'12px 16px 8px', alignItems:'end'}}>
                <span style={{font:'600 8px var(--font-body)', letterSpacing:'.04em', textTransform:'uppercase', color:'var(--text-tertiary)'}}>Top {c.list.length}</span>
                {[['All','var(--text-tertiary)'],['◆ Smart',violetInk],['🐋 Whale','var(--text-secondary)'],['☠ Rekt','var(--text-secondary)']].map(([h,hc])=><span key={h} style={{font:'600 9px var(--font-body)', color:hc, textAlign:'center', whiteSpace:'nowrap'}}>{h}</span>)}
              </div>
              {c.list.map(m=>{const cells=[['all',m.crowd],['smart',m.smart],['whale',m.whale],['rekt',m.rekt]];return (
                <button key={m.sym} onClick={()=>onOpen&&onOpen(m)} className="arx-row-press" style={{width:'100%', display:'grid', gridTemplateColumns:'60px 1fr 1fr 1fr 1fr', gap:4, padding:'8px 16px', alignItems:'center', background:'none', border:'none', cursor:'pointer', textAlign:'left'}}>
                  <span style={{display:'flex', alignItems:'center', gap:4, minWidth:0}}><AssetGlyph sym={m.sym} size={18}/><span style={{font:'600 11.5px var(--font-body)', color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{m.sym}</span></span>
                  {cells.map(([id,v])=>{const long=v>=50, sc=long?up:dn, isAll=id==='all', contra=!isAll&&(long!==(m.crowd>=50));return (
                    <span key={id} className="num" style={{textAlign:'center', borderRadius:8, padding:'5px 0', font:`${(isAll||contra)?700:500} 10.5px var(--font-mono)`, color:(isAll||contra)?sc:`color-mix(in oklab, ${sc} 50%, var(--text-tertiary))`, background:isAll?'var(--surface-modal)':contra?`color-mix(in oklab, ${sc} 22%, var(--surface-base))`:'transparent'}}>{long?'L':'S'} {pct(v)}%</span>);})}
                </button>);})}
            </div>}
          </div>);})}
      </div>
      <div style={{margin:'12px 16px 0', font:'500 9.5px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.5}}>Each row shows which side every group is on — <b style={{color:'var(--text-secondary)', fontWeight:600}}>L</b> long (green) / <b style={{color:'var(--text-secondary)', fontWeight:600}}>S</b> short (red). A <b style={{color:'var(--text-secondary)', fontWeight:600}}>filled</b> cell is contrarian: that group sits opposite all wallets. Scan a row to compare ◆ smart money, 🐋 whales and ☠ full-rekt against the crowd and each other. ⟂ on a class = smart money offside there. Not advice.</div>
    </div>
  );
}

/* ═══ TRADING FLOW — taker CVD · class filter · by cohort ═══ */
function MoFlowTrend({ series, col='var(--regime-up-mid)' }){ const w=320,h=42,n=series.length,mx=Math.max.apply(null,series.map(Math.abs))||1,bw=(w-(n-1)*3)/n; return <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{display:'block'}}>{series.map((v,i)=>{const hh=Math.max(3,Math.abs(v)/mx*(h-6));const up=v>=0;return <rect key={i} x={i*(bw+3)} y={up?h-hh:0} width={bw} height={hh} rx={1.5} fill={up?col:'var(--regime-down-mid)'} opacity={i===n-1?1:.5}/>;})}</svg>; }
const MO_TF=[{nm:'Smart money',ic:'◆',col:'var(--regime-up-mid)',amt:42,share:38,split:[['Buy-side',63],['Sell-side',37]],top:'SOL · NVDA · BTC'},{nm:'Whales',ic:'🐋',col:'var(--color-violet-400)',amt:28,share:27,split:[['Buy-side',58],['Sell-side',42]],top:'BTC · SOL'},{nm:'Rising money',ic:'↗',col:'var(--regime-trans-mid)',amt:19,share:21,split:[['Buy-side',66],['Sell-side',34]],top:'HYPE · TAO'},{nm:'Full-rekt crowd',ic:'☠',col:'var(--regime-down-mid)',amt:-9,share:14,split:[['Buy-side',41],['Sell-side',59]],top:'late chasers'}];
function MoTradingFlow({ inst='perp' }){
  const [cls,setCls]=moS('all'); const [win,setWin]=moS('24H'); const [open,setOpen]=moS(null);
  const f=win==='24H'?1:win==='4H'?0.3:win==='1H'?0.1:0.04; const net=Math.round(84*f),delta=Math.round(31*f);
  const fmt=v=>(v>=0?'+$':'−$')+Math.abs(Math.round(v))+'M';
  return (
    <div>
      <div style={{display:'flex', alignItems:'center', justifyContent:'flex-end', padding:'0 16px 2px'}}><MoWindowPick val={win} onPick={setWin}/></div>
      <MoClassTabs val={cls} onPick={setCls} inst={inst}/>
      <div style={{margin:'12px 16px 0', borderRadius:16, border:'.5px solid var(--border-default)', background:'linear-gradient(140deg, color-mix(in oklab, var(--regime-up-mid) 11%, var(--surface-elevated)), var(--surface-elevated) 60%)', padding:'14px 15px'}}>
        <div style={{font:'600 9px var(--font-body)', letterSpacing:'.06em', textTransform:'uppercase', color:'var(--text-tertiary)'}}>Net taker flow (CVD) · {win}</div>
        <div style={{display:'flex', alignItems:'flex-end', gap:10, marginTop:5}}><MoRoll value={net} format={v=>fmt(v)} style={{font:'800 26px var(--font-brand)', letterSpacing:'-.02em', lineHeight:1, color:'var(--regime-up-mid)'}}/><span className="num" style={{font:'700 11px var(--font-mono)', color:'var(--regime-up-mid)', paddingBottom:3}}>▲ {fmt(delta)} vs prev</span></div>
        <div style={{display:'flex', height:9, borderRadius:999, overflow:'hidden', gap:3, margin:'11px 0 6px'}}><div style={{width:'57%', background:'var(--regime-up-mid)', borderRadius:'999px 3px 3px 999px'}}/><div style={{width:'43%', background:'var(--regime-down-mid)', borderRadius:'3px 999px 999px 3px'}}/></div>
        <div style={{display:'flex', justifyContent:'space-between', font:'600 10px var(--font-mono)'}}><span style={{color:'var(--regime-up-mid)'}}>Buy 57%</span><span style={{color:'var(--regime-down-mid)'}}>Sell 43%</span></div>
        <div style={{margin:'11px 0 0'}}><MoFlowTrend series={[-8,6,4,12,18,10,22,28]}/></div>
      </div>
      <div style={{padding:'18px 20px 0', font:'700 13px var(--font-body)', color:'var(--text-primary)'}}>By cohort</div>
      {MO_TF.map(s=>{const isO=open===s.nm,amt=Math.round(s.amt*f),up=s.amt>=0;return (
        <div key={s.nm} style={{margin:'8px 16px 0', borderRadius:14, border:'.5px solid '+(isO?'var(--border-strong)':'var(--border-default)'), background:'var(--surface-elevated)', overflow:'hidden'}}>
          <button onClick={()=>setOpen(isO?null:s.nm)} className="arx-row-press" style={{width:'100%', background:'none', border:'none', cursor:'pointer', textAlign:'left', padding:'12px 14px'}}>
            <div style={{display:'flex', alignItems:'center', gap:9}}><span style={{width:8, height:8, borderRadius:3, flexShrink:0, background:s.col}}/><div style={{minWidth:0}}><div style={{font:'700 12.5px var(--font-body)', color:'var(--text-primary)', whiteSpace:'nowrap'}}>{s.ic} {s.nm}</div><div style={{font:'500 9.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:1, whiteSpace:'nowrap'}}>{s.share}% of flow</div></div><div style={{marginLeft:'auto', textAlign:'right', flexShrink:0, whiteSpace:'nowrap', paddingLeft:8}}><div className="num" style={{font:'800 16px var(--font-brand)', letterSpacing:'-.01em', color:up?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{fmt(amt)}</div></div><MoChev dir={isO?'d':'r'}/></div>
            <div style={{height:5, borderRadius:999, background:'var(--surface-base)', marginTop:10, overflow:'hidden'}}><span style={{display:'block', height:'100%', width:s.share+'%', background:s.col, borderRadius:999}}/></div>
          </button>
          {isO && <div style={{padding:'2px 14px 13px', borderTop:'.5px solid var(--border-default)', background:'var(--surface-base)'}}>
            <div style={{font:'600 9px var(--font-body)', letterSpacing:'.05em', textTransform:'uppercase', color:'var(--text-tertiary)', margin:'11px 0 8px'}}>Aggression split</div>
            {s.split.map(([c,p])=>(<div key={c} style={{display:'flex', alignItems:'center', gap:9, marginBottom:7}}><span style={{width:90, flexShrink:0, font:'600 11px var(--font-body)', color:'var(--text-secondary)'}}>{c}</span><span style={{flex:1}}><MoMag pct={p} col={s.col}/></span><span className="num" style={{width:34, textAlign:'right', font:'600 10.5px var(--font-mono)', color:'var(--text-tertiary)'}}>{p}%</span></div>))}
            <div style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', marginTop:8}}>Top: <b style={{color:'var(--text-secondary)', fontWeight:600}}>{s.top}</b></div>
          </div>}
        </div>);})}
      <div style={{margin:'12px 20px 0', font:'500 9.5px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.5}}>Cumulative volume delta — who's lifting offers vs hitting bids. Money flow funds the account; trading flow is the aggression.</div>
    </div>
  );
}

/* ═══ CATALYSTS — funding flips · on-chain behavior · news ═══ */
const MO_CAT=[
  {sym:'ETH',g:'⚡',tone:'var(--regime-trans-mid)',label:'Funding flipped negative',detail:'−0.004%/8h · shorts now pay longs',tag:'Funding',time:'12m'},
  {sym:'SOL',g:'◆',tone:'var(--color-violet-300)',label:'Smart money initiated long',detail:'3 proven wallets · +$26M net 24h',tag:'On-chain',time:'34m'},
  {sym:'HYPE',g:'⚠',tone:'var(--regime-down-mid)',label:'Liquidation cascade',detail:'$38M shorts squeezed in 1h',tag:'Liquidations',time:'1h'},
  {sym:'TAO',g:'↗',tone:'var(--regime-up-mid)',label:'Volume + OI breakout',detail:'vol +88% · OI +18% · >2× normal',tag:'On-chain',time:'2h'},
  {sym:'BTC',g:'⊕',tone:'var(--regime-range-mid)',label:'Spot ETF net inflow day',detail:'+$410M across issuers — Bloomberg',tag:'News',time:'3h'},
  {sym:'GOLD',g:'🐋',tone:'var(--color-frost-300)',label:'Whale opened position',detail:'$14M long · first RWA add this week',tag:'On-chain',time:'5h'},
];
function MoCatalysts({ onOpen, onNews }){
  const [f,setF]=moS('all'); const [src,setSrc]=moS(false); const types=[['all','All'],['Funding','Funding'],['On-chain','On-chain'],['Liquidations','Liquidations'],['News','News']];
  const liveCtx = window.useHLAssetCtxs ? window.useHLAssetCtxs() : null;
  const rows=MO_CAT.filter(c=>f==='all'||c.tag===f).map(c=>{
    if(c.tag==='Funding' && liveCtx && liveCtx[c.sym] && typeof liveCtx[c.sym].funding==='number'){
      const fr=liveCtx[c.sym].funding, f8=fr*8*100;
      return {...c, label: fr<0?'Funding flipped negative':'Funding turned positive', detail:`${f8>=0?'+':'−'}${Math.abs(f8).toFixed(4)}%/8h · ${fr<0?'shorts now pay longs':'longs pay shorts'}`};
    }
    return c;
  });
  const FEEDS=[
    ['Funding','var(--regime-trans-mid)','Funding-rate sign flips and 8h-rate extremes, per instrument.'],
    ['On-chain','var(--color-violet-300)','Tracked-wallet funding→trade, position-bias & flow shifts, volume/OI breakouts.'],
    ['Liquidations','var(--regime-down-mid)','Liquidation & PnL-stress cascades — squeeze side from forced exits.'],
    ['News','var(--color-frost-300)','External editorial & market feed — ETF flows, macro, governance. Off-chain.'],
  ];
  return (
    <div>
      <div style={{display:'flex', alignItems:'center', gap:8, padding:'0 20px 12px'}}>
        <div style={{display:'flex', gap:7, overflowX:'auto', scrollbarWidth:'none'}}>{types.map(([id,l])=>{const on=f===id;return <button key={id} onClick={()=>setF(id)} className="arx-press" style={{flexShrink:0, height:28, padding:'0 13px', borderRadius:999, cursor:'pointer', background:on?'color-mix(in oklab, var(--color-violet-500) 16%, var(--surface-base))':'transparent', border:'.5px solid '+(on?'color-mix(in oklab, var(--color-violet-500) 42%, transparent)':'var(--border-default)'), color:on?'color-mix(in oklab, var(--color-violet-500) 60%, var(--text-primary))':'var(--text-tertiary)', font:`${on?700:600} 11.5px var(--font-body)`}}>{l}</button>;})}</div>
        <button onClick={()=>setSrc(!src)} className="arx-press" aria-label="What feeds these" style={{marginLeft:'auto', flexShrink:0, width:22, height:22, borderRadius:'50%', border:'.5px solid '+(src?'color-mix(in oklab, var(--color-violet-500) 42%, transparent)':'var(--border-strong)'), background:src?'color-mix(in oklab, var(--color-violet-500) 16%, var(--surface-base))':'none', cursor:'pointer', color:src?'color-mix(in oklab, var(--color-violet-500) 60%, var(--text-primary))':'var(--text-tertiary)', font:'700 11px var(--font-body)', lineHeight:1}}>i</button>
      </div>
      {src && <div className="arx-arrive" style={{margin:'0 16px 12px', borderRadius:14, border:'.5px solid var(--border-default)', background:'var(--surface-base)', padding:'12px 14px'}}>
        <div style={{font:'600 9px var(--font-body)', letterSpacing:'.06em', textTransform:'uppercase', color:'var(--text-tertiary)', marginBottom:9}}>What feeds each</div>
        {FEEDS.map(([k,c,d])=>(<div key={k} style={{display:'flex', gap:9, alignItems:'flex-start', marginBottom:8}}><span style={{width:7, height:7, borderRadius:2, flexShrink:0, marginTop:4, background:c}}/><div style={{minWidth:0}}><span style={{font:'700 10.5px var(--font-body)', color:'var(--text-secondary)'}}>{k}</span> <span style={{font:'500 10.5px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.45}}>— {d}</span></div></div>))}
      </div>}
      <div style={{margin:'0 16px', borderRadius:16, border:'.5px solid var(--border-default)', background:'var(--surface-elevated)', overflow:'hidden'}}>
        {rows.map((c,i)=>(
          <button key={i} onClick={()=>onOpen&&onOpen(c)} className="arx-row-press" style={{display:'flex', alignItems:'center', gap:11, width:'100%', padding:'11px 13px', borderTop:i?'.5px solid var(--border-default)':'none', background:'none', border:'none', cursor:'pointer', textAlign:'left'}}>
            <span style={{width:32, height:32, borderRadius:9, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:'color-mix(in oklab, '+c.tone+' 15%, var(--surface-modal))', color:c.tone, font:'700 14px var(--font-body)'}}>{c.g}</span>
            <div style={{flex:1, minWidth:0}}><div style={{display:'flex', alignItems:'center', gap:7, minWidth:0}}><span style={{font:'700 12.5px var(--font-brand)', color:'var(--text-primary)', flexShrink:0}}>{c.sym}</span><span style={{font:'700 12px var(--font-body)', color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{c.label}</span></div><div className="num" style={{font:'500 10px var(--font-mono)', color:'var(--text-tertiary)', marginTop:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{c.detail}</div></div>
            <div style={{textAlign:'right', flexShrink:0, whiteSpace:'nowrap', paddingLeft:6}}><div style={{font:'600 9px var(--font-body)', color:c.tone}}>{c.tag}</div><div className="num" style={{font:'500 9.5px var(--font-mono)', color:'var(--text-tertiary)', marginTop:2}}>{c.time}</div></div>
          </button>
        ))}
      </div>
      <div style={{margin:'8px 20px 0', font:'500 10.5px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.45}}>Events we observe on-chain and in the news — funding flips, smart-money moves, squeezes, breakouts. Not a forecast.</div>
    </div>
  );
}

Object.assign(window, { MO, moOf, useLiveMO, useLiveStocksMO, moWeighted, moTier, moSign, moPrice, moUsd, moLean, MoRoll, MoBias, MoChev, MoFlowTrend, MoWindowPick,
  MoDayRead, MoMarketMap, MoHeatmap, MoMovers, MoPositioning, MoTradingFlow, MoCatalysts, MO_CAT });
