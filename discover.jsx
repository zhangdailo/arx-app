/* ═══ ARX · Discover modules (Phase: consumer-pattern build) ═══
   Patterns lifted from Dreamcash/Robinhood (Simple) + Hyperliquid (Pro), reskinned
   to Arx tokens — dark Midnight, Violet brand, regime green/red on DATA ONLY (never pink
   as branding, never casino energy). Shared across Home + Markets + Trade.
     · WhatIfSpotlight  — "$100 → $X" leverage scrubber WITH the honest downside flip
     · Heatmap          — market movements grid (regime-shaded)
     · MarketPositioning— smart-money long/short split
     · TickerTape       — scrolling movers strip
     · SpotlightCards   — horizontal asset cards with leverage badge
     · AmountKeypad     — amount-first numeric entry (the consumer-trading interaction)
     · watchlist        — localStorage star + helpers */

const { useState: dS, useEffect: dE, useRef: dR } = React;

/* ── flat instrument lookup + canonical leverage caps ── */
const DISCOVER_LEV = { BTC:40, ETH:40, SOL:20, HYPE:20, GOLD:10, OIL:10, 'S&P':10, NVDA:10, TSLA:10, MSTR:10, OPENAI:5, SPACEX:5, STRIPE:5, EUR:50, GBP:50, JPY:50, SILVER:10, COPPER:10, NATGAS:10 };
/* Asset-class taxonomy — display order + labels, and spot-eligibility (spot is crypto-only for now). */
const MARKET_CLASSES = [['Crypto','Crypto'],['Stocks','Stocks'],['PreIPO','Pre-IPO'],['Commodities','Commodities'],['Fx','Forex']];
const SPOT_CLASSES = ['Crypto'];
function discClassOf(sym){ for(const k in D.instruments){ if((D.instruments[k]||[]).some(m=>m.sym===sym)) return k; } return 'Crypto'; }
function discByClass(cls){ return (D.instruments[cls]||[]).map(m=>({...m, cat:cls})); }
function discFlat() { const out=[]; for (const k in D.instruments) D.instruments[k].forEach(m=>out.push({...m, cat:k})); return out; }
function discFind(sym) { return discFlat().find(m=>m.sym===sym) || null; }
function discPrice(p) {
  if (typeof p!=='number') return p;
  if (p>=1000) return '$'+p.toLocaleString(undefined,{maximumFractionDigits:0});
  if (p>=10)   return '$'+p.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
  return '$'+p.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:4});
}

/* ═══ Watchlist — localStorage star ═══ */
function arxWatchGet() { try { return JSON.parse(localStorage.getItem('arx-watchlist')||'["SOL","HYPE"]'); } catch(e){ return []; } }
function arxWatchSet(list) { try { localStorage.setItem('arx-watchlist', JSON.stringify(list)); window.dispatchEvent(new Event('arx-watchlist')); } catch(e){} }
function arxWatchToggle(sym) { const l=arxWatchGet(); arxWatchSet(l.includes(sym)? l.filter(s=>s!==sym) : [sym,...l]); }
function useWatchlist() {
  const [list, setList] = dS(arxWatchGet);
  dE(()=>{ const h=()=>setList(arxWatchGet()); window.addEventListener('arx-watchlist', h); return ()=>window.removeEventListener('arx-watchlist', h); }, []);
  return list;
}
function WatchStar({ sym, size=18 }) {
  const list = useWatchlist();
  const on = list.includes(sym);
  return (
    <button onClick={(e)=>{ e.stopPropagation(); arxWatchToggle(sym); }} aria-label={on?'Unwatch':'Watch'} style={{background:'none', border:'none', cursor:'pointer', padding:4, display:'inline-flex', flexShrink:0}}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill={on?'var(--color-violet-500)':'none'} stroke={on?'var(--color-violet-500)':'var(--text-tertiary)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2.5 15 8.6 21.7 9.6 16.8 14.3 18 21 12 17.8 6 21 7.2 14.3 2.3 9.6 9 8.6"/>
      </svg>
    </button>
  );
}

/* ═══ What-if Spotlight — the Dreamcash hook, made honest ═══
   Shows what a leveraged position WOULD have done — both directions. Teaches leverage
   by showing the symmetry: the same dial that triples a gain triples a loss. */
const ARX_WHATIF_MOVE = { SOL:23.23, BTC:9.1, ETH:7.4, HYPE:31.2, NVDA:12.0, GOLD:4.2, OIL:5.1 };
function WhatIfSpotlight({ sym='SOL', stake=100, onTrade }) {
  const [aSym, setASym] = dS(sym);
  const [lev, setLev] = dS(10);
  const m = discFind(aSym) || { sym:aSym, price:214.6, deltaPct:4.2, spark:[8,10,9,12,13,15,14,17,19,21], name:aSym+'-PERP' };
  const cap = DISCOVER_LEV[aSym] || 20;
  const levels = [2,5,10,20].filter(x=>x<=cap);
  const baseMove = ARX_WHATIF_MOVE[aSym] != null ? ARX_WHATIF_MOVE[aSym] : +(Math.abs(m.deltaPct||4)*4).toFixed(2);
  const move = baseMove/100;
  const upVal = stake*(1+move*lev);
  const downVal = Math.max(0, stake*(1-move*lev));
  const gain = upVal-stake, loss = stake-downVal;
  const wiped = (move*lev)>=1;
  const data = m.spark || [8,10,9,12,13,15,14,17,19,21];
  const min=Math.min(...data), max=Math.max(...data), rng=(max-min)||1;
  const W=300, H=110, pts=data.map((v,i)=>[i/(data.length-1)*W, H-6-((v-min)/rng)*(H-16)]);
  const path = pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
  const entryY = pts[Math.floor(pts.length*0.42)][1], markY = pts[pts.length-1][1];

  return (
    <div className="arx-arrive" style={{margin:'4px 20px 8px', borderRadius:18, overflow:'hidden',
      background:'var(--surface-elevated)', border:'.5px solid var(--border-default)'}}>
      <div style={{padding:'15px 16px 4px'}}>
        <div style={{display:'flex', alignItems:'baseline', gap:10}}>
          <span className="num" style={{font:'600 26px var(--font-mono)', color:'var(--text-tertiary)'}}>${stake}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2.4" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          <span className="num" style={{font:'700 30px var(--font-mono)', color:'var(--regime-up-mid)', letterSpacing:'-.02em'}}>${upVal.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
        </div>
        <div style={{font:'400 12.5px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.45, marginTop:8}}>
          A <b style={{color:'var(--text-primary)'}}>{lev}× long on {aSym}</b> a day ago would be up <b style={{color:'var(--regime-up-mid)'}}>+${gain.toLocaleString(undefined,{maximumFractionDigits:2})}</b> today.
        </div>
      </div>

      {/* asset switcher — recomputes from each market */}
      <div style={{display:'flex', gap:6, padding:'10px 16px 0', overflowX:'auto', scrollbarWidth:'none'}}>
        {['SOL','BTC','ETH','HYPE','NVDA','GOLD'].map(s=>(
          <button key={s} onClick={()=>setASym(s)} className="arx-press" style={{flexShrink:0, height:28, padding:'0 12px', borderRadius:999, cursor:'pointer', border:'.5px solid '+(aSym===s?'var(--color-violet-500)':'var(--border-default)'), background: aSym===s?'rgba(124,91,255,.12)':'transparent', color: aSym===s?'var(--color-violet-500)':'var(--text-secondary)', font:`${aSym===s?700:600} 11.5px var(--font-body)`}}>{s}</button>
        ))}
      </div>

      {/* leverage scrubber */}
      <div style={{display:'flex', gap:6, padding:'12px 16px 6px'}}>
        {levels.map(l => (
          <button key={l} onClick={()=>setLev(l)} className="arx-press" style={{flex:1, height:34, borderRadius:10, cursor:'pointer', border:'none',
            background: lev===l ? 'var(--color-violet-500)' : 'var(--glass-control-bg)',
            color: lev===l ? '#fff' : 'var(--text-secondary)', font:`${lev===l?700:600} 13px var(--font-mono)`}}>{l}×</button>
        ))}
      </div>

      {/* chart with entry / mark guides */}
      <div style={{position:'relative', padding:'4px 16px 0'}}>
        <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{display:'block'}}>
          <defs><linearGradient id="wifill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgba(45,212,155,.32)"/><stop offset="1" stopColor="rgba(45,212,155,0)"/></linearGradient></defs>
          <line x1="0" x2={W} y1={entryY} y2={entryY} stroke="var(--text-tertiary)" strokeWidth="1" strokeDasharray="3 3"/>
          <line x1="0" x2={W} y1={markY} y2={markY} stroke="var(--regime-up-mid)" strokeWidth="1" strokeDasharray="3 3"/>
          <path d={`${path} L ${W} ${H} L 0 ${H} Z`} fill="url(#wifill)"/>
          <path d={path} fill="none" stroke="var(--regime-up-mid)" strokeWidth="2"/>
        </svg>
        <span style={{position:'absolute', left:18, top:entryY-9, font:'600 8.5px var(--font-body)', color:'var(--text-tertiary)', background:'var(--surface-modal)', padding:'2px 6px', borderRadius:5}}>Entry</span>
        <span style={{position:'absolute', right:18, top:markY-9, font:'600 8.5px var(--font-body)', color:'#fff', background:'var(--regime-up-dark)', padding:'2px 6px', borderRadius:5}}>Mark</span>
      </div>

      {/* the honest flip-side — the line Dreamcash leaves out */}
      <div style={{display:'flex', alignItems:'center', gap:8, margin:'10px 16px 0', padding:'9px 12px', borderRadius:11,
        background:'rgba(242,106,106,.08)', border:'.5px solid rgba(242,106,106,.18)'}}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--regime-down-mid)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9.5" x2="12" y2="13.5"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <span style={{flex:1, font:'400 11.5px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.4}}>
          The other way, that {lev}× {wiped?'wipes the':'cuts it to'} <b className="num" style={{color:'var(--regime-down-mid)', fontWeight:600}}>{wiped?`full −$${stake}`:`−$${loss.toLocaleString(undefined,{maximumFractionDigits:2})}`}</b>. Leverage cuts both ways.
        </span>
      </div>

      {/* asset row + CTA */}
      <div style={{display:'flex', alignItems:'center', gap:11, padding:'14px 16px'}}>
        <AssetGlyph sym={aSym} size={32}/>
        <div style={{flex:1, minWidth:0}}>
          <div style={{font:'600 14px var(--font-body)'}}>{aSym}</div>
          <div className="num" style={{font:'500 12px var(--font-mono)', color:'var(--regime-up-mid)', marginTop:1}}>{discPrice(m.price)} · +{baseMove.toFixed(2)}%</div>
        </div>
        <button onClick={()=>onTrade && onTrade(aSym)} className="arx-press" style={{height:38, padding:'0 20px', borderRadius:12, border:'none', cursor:'pointer',
          background:'var(--color-violet-500)', color:'#fff', font:'700 13.5px var(--font-body)', boxShadow:'0 6px 18px rgba(124,91,255,.32)'}}>Trade {aSym}</button>
      </div>
    </div>
  );
}

/* ═══ Heatmap — market movements, regime-shaded (no pink) ═══ */
function regimeTile(pct) {
  const up = pct>=0, mag = Math.min(1, Math.abs(pct)/6);
  const a = 0.10 + mag*0.34;
  return up ? `rgba(45,212,155,${a.toFixed(2)})` : `rgba(242,106,106,${a.toFixed(2)})`;
}
function Heatmap({ onOpen }) {
  const [kind, setKind] = dS('perp');
  const cats = [['Crypto','Crypto'],['Stocks','Stocks'],['PreIPO','Pre-IPO'],['Commodities','Commodities']];
  const spotOnly = ['Crypto'];
  const showCats = kind==='spot' ? cats.filter(([k])=>spotOnly.includes(k)) : cats;
  const suffix = kind==='perp' ? '-PERP' : '/USDC';
  return (
    <>
      <SectionHeader>Heatmap · 24h</SectionHeader>
      {/* spot / perps */}
      <div style={{display:'flex', gap:8, padding:'0 20px 8px'}}>
        {[['perp','Perps'],['spot','Spot']].map(([id,l])=>(
          <button key={id} onClick={()=>setKind(id)} className="arx-press" style={{height:28, padding:'0 14px', borderRadius:999, cursor:'pointer',
            background: kind===id?'rgba(124,91,255,.14)':'transparent', border:'.5px solid '+(kind===id?'var(--color-violet-500)':'var(--border-default)'),
            color: kind===id?'var(--color-violet-700)':'var(--text-secondary)', font:`${kind===id?700:600} 12px var(--font-body)`}}>{l}</button>
        ))}
      </div>
      {showCats.map(([ck,cl])=>{
        const top = (D.instruments[ck]||[]).slice().sort((a,b)=>Math.abs(b.deltaPct)-Math.abs(a.deltaPct)).slice(0,3);
        if(!top.length) return null;
        return (
          <div key={ck} style={{padding:'0 20px 10px'}}>
            <div style={{font:'600 9.5px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.07em', margin:'4px 0 6px'}}>{cl}</div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8}}>
              {top.map(m=>{ const pos=m.deltaPct>=0; return (
                <button key={m.sym} onClick={()=>onOpen && onOpen({...m, cat:ck})} className="arx-press" style={{
                  border:'.5px solid var(--border-default)', borderRadius:13, padding:'11px 9px', cursor:'pointer',
                  background:regimeTile(m.deltaPct), display:'flex', flexDirection:'column', alignItems:'center', gap:6}}>
                  <AssetGlyph sym={m.sym} size={24}/>
                  <span style={{font:'600 10.5px var(--font-body)', color:'var(--text-primary)'}}>{m.sym}</span>
                  <span className="num" style={{font:'700 11.5px var(--font-mono)', color: pos?'var(--regime-up-dark)':'var(--regime-down-dark)'}}>{pos?'▲':'▼'} {Math.abs(m.deltaPct).toFixed(2)}%</span>
                </button>
              );})}
            </div>
          </div>
        );
      })}
    </>
  );
}

/* ═══ Market positioning — smart-money long/short split ═══ */
function MarketPositioning({ sym='SOL', longPct=64 }) {
  const shortPct = 100-longPct;
  return (
    <>
      <SectionHeader>Smart-money positioning · {sym}</SectionHeader>
      <div style={{margin:'2px 20px 4px', padding:'14px 16px', background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:16}}>
        <div style={{display:'flex', height:10, borderRadius:999, overflow:'hidden', gap:3}}>
          <div style={{width:longPct+'%', background:'var(--regime-up-mid)', borderRadius:'999px 3px 3px 999px'}}/>
          <div style={{width:shortPct+'%', background:'var(--regime-down-mid)', borderRadius:'3px 999px 999px 3px'}}/>
        </div>
        <div style={{display:'flex', justifyContent:'space-between', marginTop:10}}>
          <div><div className="num" style={{font:'700 16px var(--font-mono)', color:'var(--regime-up-mid)'}}>{longPct}%</div><div style={{font:'500 10.5px var(--font-body)', color:'var(--text-tertiary)'}}>Long</div></div>
          <div style={{textAlign:'right'}}><div className="num" style={{font:'700 16px var(--font-mono)', color:'var(--regime-down-mid)'}}>{shortPct}%</div><div style={{font:'500 10.5px var(--font-body)', color:'var(--text-tertiary)'}}>Short</div></div>
        </div>
        <div style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:10, lineHeight:1.4}}>Net long — the wallets you can audit lean with the move. Positioning, not a signal.</div>
      </div>
    </>
  );
}

/* ═══ Ticker tape — scrolling movers strip ═══ */
function TickerTape() {
  const items = discFlat();
  const Chip = ({ m }) => (
    <span style={{flexShrink:0, display:'inline-flex', alignItems:'center', gap:6, padding:'0 4px'}}>
      <span style={{font:'700 11.5px var(--font-body)', color:'var(--text-primary)'}}>{m.sym}</span>
      <span className="num" style={{font:'600 11.5px var(--font-mono)', color: m.deltaPct>=0?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{m.deltaPct>=0?'▲':'▼'}{Math.abs(m.deltaPct).toFixed(2)}%</span>
      <span style={{flexShrink:0, width:1, height:12, background:'var(--border-default)', marginLeft:6}}/>
    </span>
  );
  return <Ticker label="Live markets · 24h movers" duration={26} items={items} renderChip={(m)=><Chip m={m}/>}/>;
}

/* ═══ Spotlight cards — horizontal asset cards with leverage badge ═══ */
function SpotlightCards({ syms, onOpen }) {
  const items = (syms || ['BTC','ETH','SOL','HYPE','NVDA']).map(discFind).filter(Boolean);
  return (
    <div style={{display:'flex', gap:10, overflowX:'auto', padding:'2px 20px 6px', scrollbarWidth:'none'}}>
      {items.map(m => {
        const pos = m.deltaPct>=0;
        return (
          <button key={m.sym} onClick={()=>onOpen && onOpen(m)} className="arx-press" style={{
            flex:'0 0 138px', background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:16, padding:14, textAlign:'left', cursor:'pointer'}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <AssetGlyph sym={m.sym} size={30}/>
              <span style={{font:'600 9.5px var(--font-mono)', color:'var(--color-violet-500)', background:'rgba(124,91,255,.12)', padding:'2px 7px', borderRadius:7}}>{DISCOVER_LEV[m.sym]||20}×</span>
            </div>
            <div style={{font:'600 14px var(--font-body)', marginTop:10}}>{m.sym}</div>
            <div className="num" style={{font:'500 12px var(--font-mono)', color:'var(--text-secondary)', marginTop:2}}>{discPrice(m.price)}</div>
            <div className="num" style={{font:'600 12.5px var(--font-mono)', color: pos?'var(--regime-up-mid)':'var(--regime-down-mid)', marginTop:3}}>{pos?'+':'−'}{Math.abs(m.deltaPct).toFixed(2)}%</div>
          </button>
        );
      })}
    </div>
  );
}

/* ═══ AmountKeypad — amount-first numeric entry (Robinhood/Dreamcash) ═══ */
function AmountKeypad({ value, onChange, available=840, min=1.10 }) {
  const press = (k) => {
    let v = value==='0' ? '' : value;
    if (k==='⌫') { v = v.slice(0,-1); }
    else if (k==='.') { if (!v.includes('.')) v = (v||'0')+'.'; }
    else { if (v.includes('.') && v.split('.')[1].length>=2) return; v = v + k; }
    onChange(v===''?'0':v);
  };
  const pct = (f) => onChange(String(Math.floor(available*f)));
  const num = parseFloat(value||0);
  const below = num>0 && num<min;
  const keys = ['1','2','3','4','5','6','7','8','9','.','0','⌫'];
  return (
    <div style={{margin:'0 20px 12px'}}>
      <div style={{display:'flex', gap:8, marginBottom:10}}>
        {[['25%',.25],['50%',.5],['75%',.75],['Max',1]].map(([l,f]) => (
          <button key={l} onClick={()=>pct(f)} className="arx-press" style={{flex:1, height:34, borderRadius:999, cursor:'pointer', border:'.5px solid var(--border-default)',
            background:'var(--surface-elevated)', color:'var(--text-primary)', font:'600 12.5px var(--font-body)'}}>{l}</button>
        ))}
      </div>
      {below && <div style={{textAlign:'center', font:'600 11.5px var(--font-body)', color:'var(--regime-down-mid)', marginBottom:8}}>Minimum trade is ${min.toFixed(2)}</div>}
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:2}}>
        {keys.map(k => (
          <button key={k} onClick={()=>press(k)} className="arx-row-press" style={{height:48, borderRadius:12, cursor:'pointer', border:'none', background:'transparent',
            color:'var(--text-primary)', font:`${k==='⌫'?500:600} 21px var(--font-mono)`, display:'flex', alignItems:'center', justifyContent:'center'}}>
            {k==='⌫' ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 5H8.5L3 12l5.5 7H21a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z"/><line x1="17" y1="9.5" x2="12" y2="14.5"/><line x1="12" y1="9.5" x2="17" y2="14.5"/></svg> : k}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══ IOSDecimalPad — native-style iOS system keypad, docked to the screen bottom ═══
   Replaces the inline keypad: slides up over content (covering the tab bar, like the
   real keyboard), iOS decimal-pad layout + styling, with a keyboard accessory toolbar
   (presets + Done). Render as a sibling of <Screen> so bottom:0 docks to the phone. */
function IOSDecimalPad({ value, onChange, available=840, min=1.10, open=true, onDone, qty, sym }) {
  if (!open) return null;
  const press = (k) => {
    let v = value==='0' ? '' : value;
    if (k==='⌫') { v = v.slice(0,-1); }
    else if (k==='.') { if (!v.includes('.')) v = (v||'0')+'.'; }
    else { if (v.includes('.') && v.split('.')[1].length>=2) return; v = v + k; }
    onChange(v===''?'0':v);
  };
  const pct = (f) => onChange(String(Math.floor(available*f)));
  const num = parseFloat(value||0);
  const below = num>0 && num<min;
  const keys = ['1','2','3','4','5','6','7','8','9','.','0','⌫'];
  const Key = ({ k }) => {
    const isAction = k==='⌫';
    return (
      <button onClick={()=>press(k)} aria-label={k==='⌫'?'Delete':k} style={{
        height:46, borderRadius:8, cursor:'pointer', border:'none',
        background:isAction?'transparent':'var(--ioskbd-key)',
        boxShadow:isAction?'none':'0 1px 0 var(--ioskbd-key-shadow)',
        color:'var(--ioskbd-ink)', font:`400 25px var(--font-body)`,
        display:'flex', alignItems:'center', justifyContent:'center', WebkitTapHighlightColor:'transparent',
        transition:'background 90ms', userSelect:'none'
      }}
      onPointerDown={e=>{ if(!isAction) e.currentTarget.style.background='var(--ioskbd-key-active)'; else e.currentTarget.style.background='rgba(120,120,128,.18)'; }}
      onPointerUp={e=>{ e.currentTarget.style.background=isAction?'transparent':'var(--ioskbd-key)'; }}
      onPointerLeave={e=>{ e.currentTarget.style.background=isAction?'transparent':'var(--ioskbd-key)'; }}>
        {k==='⌫'
          ? <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--ioskbd-ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 5H8.5L3 12l5.5 7H21a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z"/><line x1="17" y1="9.5" x2="12" y2="14.5"/><line x1="12" y1="9.5" x2="17" y2="14.5"/></svg>
          : k}
      </button>
    );
  };
  return (
    <React.Fragment>
      {/* tap-anywhere-outside scrim — dismisses the keypad */}
      <div onClick={onDone} style={{position:'absolute', left:0, right:0, top:0, bottom:0, zIndex:69, background:'transparent'}}/>
      <div style={{position:'absolute', left:0, right:0, bottom:0, zIndex:70, animation:'arxInterrupt 300ms cubic-bezier(.32,.72,0,1)'}}>
      {/* keyboard accessory toolbar — presets + live total + Done */}
      <div style={{display:'flex', alignItems:'center', gap:6, padding:'8px 10px', background:'var(--ioskbd-accessory)', borderTop:'.5px solid var(--border-default)'}}>
        {[['25%',.25],['50%',.5],['75%',.75],['Max',1]].map(([l,f]) => (
          <button key={l} onClick={()=>pct(f)} className="arx-press" style={{flex:1, height:32, borderRadius:8, cursor:'pointer', border:'.5px solid var(--border-default)',
            background:'var(--surface-elevated)', color:'var(--text-primary)', font:'600 12px var(--font-body)'}}>{l}</button>
        ))}
        <button onClick={onDone} className="arx-press" style={{flexShrink:0, height:32, padding:'0 16px', borderRadius:8, cursor:'pointer', border:'none',
          background:'var(--color-violet-500)', color:'#fff', font:'700 13px var(--font-body)'}}>Done</button>
      </div>
      {below && <div style={{textAlign:'center', font:'600 11.5px var(--font-body)', color:'var(--regime-down-mid)', padding:'6px 0 0', background:'var(--ioskbd-bg)'}}>Minimum trade is ${min.toFixed(2)}</div>}
      {/* the keypad */}
      <div style={{background:'var(--ioskbd-bg)', padding:'7px 6px calc(8px + env(safe-area-inset-bottom)) 6px', display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'6px 6px'}}>
        {keys.map(k => <Key key={k} k={k}/>)}
      </div>
      <div style={{height:18, background:'var(--ioskbd-bg)'}}/>
    </div>
    </React.Fragment>
  );
}



function WFTrend({ series, mode }){
  const w=320, h=64, pad=8, n=series.length;
  const mx=Math.max.apply(null, series.map(s=>Math.max(s.inn, Math.abs(s.net))))||1;
  const xx=i=> pad + (n>1? i/(n-1):0)*(w-2*pad);
  if(mode==='gross'){
    const mid=h-12, bw=Math.max(4,(w-2*pad)/n*0.46);
    return (
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{display:'block'}}>
        <line x1={pad} y1={mid} x2={w-pad} y2={mid} stroke="var(--border-default)" strokeWidth="1"/>
        {series.map((s,i)=>{ const cx=xx(i); const inH=(s.inn/mx)*(mid-4); const outH=(s.out/mx)*(mid-4); return (
          <g key={i}>
            <rect x={cx-bw/2} y={mid-inH} width={bw} height={inH} rx="1.5" fill="var(--regime-up-mid)" opacity=".88"/>
            <rect x={cx-bw/2} y={mid} width={bw} height={Math.min(outH,10)} rx="1.5" fill="var(--regime-down-mid)" opacity=".7"/>
          </g>); })}
      </svg>
    );
  }
  const top=h-10;
  const yy=v=> top - (v/mx)*(top-pad);
  const pts=series.map((s,i)=>[xx(i), yy(s.net)]);
  const ld=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
  const ad=ld+` L${w-pad},${top} L${pad},${top} Z`;
  const lp=pts[pts.length-1];
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{display:'block'}}>
      <defs><linearGradient id="wf-net" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--regime-up-mid)" stopOpacity=".30"/><stop offset="1" stopColor="var(--regime-up-mid)" stopOpacity="0"/></linearGradient></defs>
      <path d={ad} fill="url(#wf-net)"/>
      <path d={ld} fill="none" stroke="var(--regime-up-mid)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={lp[0]} cy={lp[1]} r="3" fill="var(--regime-up-mid)"/>
    </svg>
  );
}

function WalletFunding({ embed, win:winProp, setWin:setWinProp }={}){
  const [winI, setWinI] = dS('24H');
  const win = winProp!=null ? winProp : winI;
  const setWin = setWinProp || setWinI;
  const [lens, setLens] = dS('performance');
  const [tmode, setTmode] = dS('net');
  const [open, setOpen] = dS(null);
  const [defs, setDefs] = dS(false);
  const upc='var(--regime-up-mid)', dnc='var(--regime-down-mid)';
  const WIN={
    '24H':{net:249,inn:312,out:63,prev:177,delta:72,label:'hourly',
      trend:[{net:6,inn:14,out:8},{net:9,inn:18,out:9},{net:7,inn:15,out:8},{net:12,inn:22,out:10},{net:16,inn:27,out:11},{net:21,inn:33,out:12},{net:28,inn:42,out:14},{net:34,inn:50,out:16}]},
    '7D':{net:1040,inn:1380,out:340,prev:880,delta:160,label:'daily',
      trend:[{net:90,inn:150,out:60},{net:120,inn:190,out:70},{net:110,inn:175,out:65},{net:150,inn:230,out:80},{net:160,inn:240,out:80},{net:140,inn:215,out:75},{net:170,inn:255,out:85}]},
    '30D':{net:3120,inn:4200,out:1080,prev:3650,delta:-530,label:'weekly',
      trend:[{net:520,inn:760,out:240},{net:610,inn:880,out:270},{net:480,inn:720,out:240},{net:560,inn:820,out:260},{net:430,inn:680,out:250},{net:520,inn:780,out:260}]},
  };
  const W=WIN[win], dUp=W.delta>=0;
  const f = win==='24H'?1: win==='7D'?4.2:13;
  const fmtM=v=>(v>=0?'+$':'−$')+Math.abs(Math.round(v))+'M';
  // Real tracked-wallet flow proxy for 24H (our own roster's account-value deltas —
  // NOT market-wide). 7D/30D stay modeled since we have no history for those windows yet.
  const [trackedTick, setTrackedTick] = dS(0);
  dE(() => { const h=()=>setTrackedTick(x=>x+1); window.addEventListener('arx-flow-live', h); return ()=>window.removeEventListener('arx-flow-live', h); }, []);
  const TF = window.__arxTrackedFlow;
  const realFlow = (win==='24H' && TF && TF.ready && TF.nWallets>0) ? TF : null;
  const headlineNet = realFlow ? realFlow.net/1e6 : W.net;
  const headlineInn = realFlow ? realFlow.inn/1e6 : W.inn;
  const headlineOut = realFlow ? realFlow.out/1e6 : W.out;
  const flowLabel = realFlow ? `Net flow · ${realFlow.nWallets} tracked wallets${realFlow.simulated?' · warming up':''}` : `Net deposits onto Hyperliquid (modeled)`;
  const SEG={
    performance:[
      {nm:'Smart money', col:'var(--regime-up-mid)', base:118, share:42, up:true, spark:[20,28,24,34,42,54,70,100], dest:[['Crypto',72],['Stocks',20],['Commodities',8]], top:'SOL · BTC · NVDA', def:'Consistent gains, controlled risk — proven over 90 days.'},
      {nm:'Rising star', col:'var(--color-violet-500)', base:46, share:17, up:true, spark:[40,46,44,52,58,55,64,72], dest:[['Crypto',88],['Stocks',12]], top:'alts · SOL · SUI', def:'Hot last 30 days — no long track record yet.'},
      {nm:'Degen winner', col:'var(--regime-trans-mid)', base:33, share:12, up:true, spark:[30,52,28,60,35,68,40,74], dest:[['Crypto',94],['FX',6]], top:'HYPE · memes', def:'Profitable, but the ride is violent.'},
      {nm:'One-shot winner', col:'var(--regime-trans-mid)', base:21, share:8, up:true, spark:[20,22,24,90,40,38,36,34], dest:[['Crypto',80],['Stocks',20]], top:'concentrated', def:'Most of the profit came from one big win.'},
      {nm:'New blood', col:'var(--regime-range-mid)', base:24, share:9, up:true, spark:[10,20,30,38,46,54,62,70], dest:[['Crypto',76],['FX',24]], top:'exploring', def:'Too new to judge — under 30 days of evidence.'},
      {nm:'Unproven', col:'var(--text-tertiary)', base:18, share:7, up:true, spark:[50,48,52,50,49,51,50,50], dest:[['Crypto',70],['FX',30]], top:'mixed, no lean', def:'No clear edge yet, either way.'},
      {nm:'Full rekt', col:'var(--regime-down-mid)', base:-12, share:5, up:false, spark:[60,55,48,52,46,50,44,42], dest:[['Withdrawing',100]], top:'net leaving', def:'Wins often — loses big when wrong.'},
    ],
    size:[
      {nm:'Whale', sub:'$1M+', col:'var(--color-violet-600)', base:84, share:34, up:true, spark:[30,36,34,42,50,58,70,92], dest:[['Crypto',64],['Commodities',26],['Stocks',10]], top:'BTC · GOLD · SOL', def:'Single deposits above $1M — size that can move a market.'},
      {nm:'Large', sub:'$100K–1M', col:'var(--color-violet-400)', base:74, share:30, up:true, spark:[40,44,48,52,58,62,68,80], dest:[['Crypto',74],['Stocks',26]], top:'BTC · NVDA', def:'Serious capital — funds and high-net-worth desks.'},
      {nm:'Mid', sub:'$10K–100K', col:'var(--color-frost-400)', base:48, share:20, up:true, spark:[50,52,55,54,58,60,62,64], dest:[['Crypto',86],['FX',14]], top:'SOL · alts', def:'Active individual traders sizing up.'},
      {nm:'Small', sub:'$1K–10K', col:'var(--color-frost-300)', base:24, share:10, up:true, spark:[44,46,48,50,52,54,55,57], dest:[['Crypto',90],['Stocks',10]], top:'majors · alts', def:'Engaged retail with real skin in the game.'},
      {nm:'Micro', sub:'<$1K', col:'var(--text-tertiary)', base:14, share:6, up:true, spark:[40,42,44,46,48,50,52,54], dest:[['Crypto',94],['Stocks',6]], top:'majors', def:'Smallest wallets — broad participation signal.'},
    ],
  };
  const segs=SEG[lens];
  const winToggle = (
    <CompactSelector options={['24H','7D','30D']} value={win} onChange={(v)=>{setWin(v);setOpen(null);}}/>
  );
  return (
    <>
      {/* embed: window lives in the Overview widget-shell header (shared collapsed picker), so render no control row here */}
      {embed
        ? null
        : <>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'30px 20px 4px'}}>
              <span className="arx-eyebrow-pill">Wallet funding</span>
              {winToggle}
            </div>
            <div style={{padding:'0 20px 12px', font:'500 10.5px var(--font-body)', color:'var(--text-tertiary)'}}>Capital deposited onto <b style={{color:'var(--text-secondary)'}}>Hyperliquid</b> — observed on-chain. Leads positioning.</div>
          </>}
      {/* TIER 1 — net headline + thin in/out + trendline */}
      <div style={{margin:'0 20px', borderRadius:16, border:'.5px solid var(--border-default)', background:'linear-gradient(140deg, color-mix(in oklab, var(--regime-up-mid) 12%, var(--surface-elevated)), var(--surface-elevated) 62%)', padding:'14px 15px'}}>
        <div style={{font:'600 9px var(--font-body)', letterSpacing:'.06em', textTransform:'uppercase', color:'var(--text-tertiary)'}}>{flowLabel} · {win}</div>
        <div style={{display:'flex', alignItems:'flex-end', gap:10, marginTop:5}}>
          <NumberRoll value={headlineNet} format={v=>(v>=0?'+$':'−$')+Math.abs(Math.round(v))+'M'} style={{font:'800 26px var(--font-brand)', letterSpacing:'-.02em', lineHeight:1, color:upc}}/>
          <span className="num" style={{font:'700 11px var(--font-mono)', color: dUp?upc:dnc, paddingBottom:3}}>{dUp?'▲':'▼'} {fmtM(W.delta)} vs prev</span>
        </div>
        {/* thin gross in/out validation line */}
        <div style={{display:'flex', alignItems:'center', gap:12, marginTop:8, font:'600 10px var(--font-mono)'}}>
          <span style={{color:upc}}>↑ {fmtM(headlineInn).replace(/^[+−]/,'')} in</span>
          <span style={{color:dnc}}>↓ {fmtM(headlineOut).replace(/^[+−]/,'')} out</span>
          <span style={{color:'var(--text-tertiary)', fontWeight:500, fontFamily:'var(--font-body)'}}>{realFlow ? 'from tracked-wallet polling, not market-wide' : `${dUp?'accelerating':'cooling'} vs prev ${win} (modeled)`}</span>
        </div>
        {/* trendline */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', margin:'12px 0 2px'}}>
          <span style={{font:'600 9px var(--font-body)', letterSpacing:'.05em', textTransform:'uppercase', color:'var(--text-tertiary)'}}>Flow over {win}</span>
          <div style={{display:'flex', background:'var(--surface-base)', border:'.5px solid var(--border-default)', borderRadius:999, padding:2}}>
            {[['net','Net'],['gross','In / Out']].map(([k,l])=>(<button key={k} onClick={()=>setTmode(k)} style={{height:20, padding:'0 9px', border:'none', cursor:'pointer', borderRadius:999, background: tmode===k?'color-mix(in oklab, var(--color-violet-500) 18%, var(--surface-base))':'transparent', color: tmode===k?'color-mix(in oklab, var(--color-violet-500) 60%, var(--text-primary))':'var(--text-tertiary)', font:'700 9px var(--font-body)'}}>{l}</button>))}
          </div>
        </div>
        <WFTrend series={W.trend} mode={tmode}/>
        <div style={{display:'flex', justifyContent:'space-between', font:'600 8px var(--font-body)', color:'var(--text-tertiary)', marginTop:3}}><span>−{win}</span><span>{W.label} · now</span></div>
      </div>
      {/* TIER 2 — lens toggle: Performance ⇄ Size */}
      <div style={{display:'flex', alignItems:'center', gap:8, padding:'22px 20px 8px'}}>
        <span style={{font:'700 13px var(--font-body)', color:'var(--text-primary)'}}>By segment</span>
        <button onClick={()=>setDefs(!defs)} className="arx-press" style={{width:18, height:18, borderRadius:'50%', border:'.5px solid var(--border-strong)', background:'none', cursor:'pointer', color:'var(--text-tertiary)', font:'700 10px var(--font-body)', display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1}}>i</button>
        <div style={{marginLeft:'auto', display:'flex', background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:999, padding:2}}>
          {[['performance','Performance'],['size','Size']].map(([k,l])=>(<button key={k} onClick={()=>{setLens(k);setOpen(null);}} style={{height:24, padding:'0 12px', border:'none', cursor:'pointer', borderRadius:999, background: lens===k?'color-mix(in oklab, var(--color-violet-500) 18%, var(--surface-base))':'transparent', color: lens===k?'color-mix(in oklab, var(--color-violet-500) 60%, var(--text-primary))':'var(--text-secondary)', font:'700 11px var(--font-body)'}}>{l}</button>))}
        </div>
      </div>
      {defs && <div style={{margin:'0 20px 8px', borderRadius:12, border:'.5px solid var(--border-default)', background:'var(--surface-base)', padding:'11px 13px', display:'flex', flexDirection:'column', gap:8}}>
        {segs.map(s=>(
          <div key={s.nm} style={{display:'flex', gap:8, alignItems:'flex-start'}}>
            <span style={{width:8, height:8, borderRadius:2, flexShrink:0, marginTop:3, background:s.col}}/>
            <div><span style={{font:'700 10.5px var(--font-body)', color:'var(--text-secondary)'}}>{s.nm}{s.sub?' ('+s.sub+')':''}</span> <span style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.4}}>— {s.def}</span></div>
          </div>
        ))}
      </div>}
      {/* segment rows: amount · Δ vs prev · share bar · mini-trend; tap → destination */}
      {segs.map((s,i)=>{
        const amt=s.base*f, dd=s.base*0.3*f, mxk=Math.max.apply(null,s.spark), isOpen=open===i;
        return (
          <div key={s.nm} style={{margin:'8px 20px 0', borderRadius:14, border:'.5px solid '+(isOpen?'var(--border-strong)':'var(--border-default)'), background:'var(--surface-elevated)', overflow:'hidden'}}>
            <button onClick={()=>setOpen(isOpen?null:i)} className="arx-row-press" style={{width:'100%', background:'none', border:'none', cursor:'pointer', textAlign:'left', padding:'13px 14px'}}>
              <div style={{display:'flex', alignItems:'center', gap:9}}>
                <span style={{width:8, height:8, borderRadius:3, flexShrink:0, background:s.col}}/>
                <div style={{minWidth:0}}>
                  <div style={{font:'700 12.5px var(--font-body)', color:'var(--text-primary)'}}>{s.nm}{s.sub && <span style={{font:'500 9.5px var(--font-body)', color:'var(--text-tertiary)'}}> {s.sub}</span>}</div>
                  <div style={{font:'500 9.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:1}}>{s.share}% of net flow</div>
                </div>
                <div style={{marginLeft:'auto', textAlign:'right'}}>
                  <div className="num" style={{font:'800 16px var(--font-brand)', letterSpacing:'-.01em', color: s.up?upc:dnc}}>{fmtM(amt)}</div>
                  <div className="num" style={{font:'700 9.5px var(--font-mono)', marginTop:2, color: s.up?upc:dnc}}>{s.up?'▲':'▼'} {fmtM(s.up?dd:-dd)} vs prev</div>
                </div>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0, transform:isOpen?'rotate(90deg)':'none', transition:'transform 200ms'}}><polyline points="9 6 15 12 9 18"/></svg>
              </div>
              {/* share bar */}
              <div style={{height:5, borderRadius:999, background:'var(--surface-base)', marginTop:10, overflow:'hidden'}}><span style={{display:'block', height:'100%', width:s.share+'%', background:s.col, borderRadius:999}}/></div>
              {/* mini trend over window */}
              <div style={{display:'flex', alignItems:'flex-end', gap:2, height:18, marginTop:9}}>
                {s.spark.map((h,j)=>{ const last=j===s.spark.length-1; const c=s.up?(last?upc:'color-mix(in oklab, '+upc+' 55%, transparent)'):(last?dnc:'color-mix(in oklab, '+dnc+' 55%, transparent)'); return <span key={j} style={{flex:1, borderRadius:1.5, minHeight:2, height:Math.max(8,h/mxk*100)+'%', background:c}}/>; })}
              </div>
            </button>
            {/* TIER 3 — destination */}
            {isOpen && (
              <div style={{padding:'2px 14px 13px', borderTop:'.5px solid var(--border-default)', background:'var(--surface-base)'}}>
                <div style={{font:'600 9px var(--font-body)', letterSpacing:'.05em', textTransform:'uppercase', color:'var(--text-tertiary)', margin:'11px 0 8px'}}>Where it's going</div>
                {s.dest.map(([cls,pct])=>(
                  <div key={cls} style={{display:'flex', alignItems:'center', gap:9, marginBottom:7}}>
                    <span style={{width:74, flexShrink:0, font:'600 11px var(--font-body)', color:'var(--text-secondary)'}}>{cls}</span>
                    <span style={{flex:1, height:6, borderRadius:999, background:'var(--surface-elevated)', overflow:'hidden'}}><span style={{display:'block', height:'100%', width:pct+'%', background:s.col, borderRadius:999}}/></span>
                    <span className="num" style={{width:34, textAlign:'right', font:'600 10.5px var(--font-mono)', color:'var(--text-tertiary)'}}>{pct}%</span>
                  </div>
                ))}
                <div style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', marginTop:8}}>Top markets: <b style={{color:'var(--text-secondary)', fontWeight:600}}>{s.top}</b></div>
              </div>
            )}
          </div>
        );
      })}
      <div style={{margin:'12px 20px 0', font:'500 9.5px var(--font-body)', color:'var(--text-tertiary)', lineHeight:1.5}}>Net is the signal; in / out shows churn. Deltas compare to the prior {win}. Segments are on-chain labels — tap ⓘ for definitions.</div>
    </>
  );
}

Object.assign(window, { WalletFunding }, {
  WhatIfSpotlight, Heatmap, MarketPositioning, TickerTape, SpotlightCards, AmountKeypad, IOSDecimalPad,
  WatchStar, useWatchlist, arxWatchGet, arxWatchToggle, DISCOVER_LEV, discFind, discFlat, discPrice,
  MARKET_CLASSES, SPOT_CLASSES, discClassOf, discByClass,
});
