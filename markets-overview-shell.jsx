/* ═══════════════════════════════════════════════════════════════════════════
   Markets › Overview — FLAT, registry-driven, customizable.
   Each widget renders in full inside a <MoWidget> shell (label · sub · controls).
   Users show/hide + reorder via the Customize sheet; prefs persist.
   Capital-momentum story order: orient → field → find → [arrives→deploys→commits→unwinds] → explain.
   Globals from markets-overview.jsx. Export: MarketsOverview.
   ═══════════════════════════════════════════════════════════════════════════ */
const { useState: mosS } = React;

/* ── WIDGET REGISTRY — single source of truth (order · label · tier · visibility) ──
   tier: 'mvp' = the true 6 · 'plus' = 2 additional (built, default OFF)
   core: can't be hidden · perpOnly: auto-hidden in Spot scope */
const MO_WIDGETS = [
  { id:'dayread',     label:'Market conditions', sub:'whole-market snapshot',                tier:'mvp',  core:true,  defaultOn:true },
  { id:'map',         label:'Heatmap',           sub:'sized by OI · coloured by 24h move',  tier:'mvp',  core:true,  defaultOn:true, hasWindow:true },
  { id:'movers',      label:'Top movers',        sub:'biggest moves, quality-gated',         tier:'mvp',  defaultOn:true },
  { id:'moneyflow',   label:'Money flow',        sub:'capital arriving on-chain',            tier:'mvp',  defaultOn:true,  perpOnly:false },
  { id:'tradingflow', label:'Trading flow',      sub:'taker buy vs sell pressure',           tier:'plus', defaultOn:false, perpOnly:true },
  { id:'positioning', label:'Positioning',       sub:'smart money vs the crowd',             tier:'mvp',  defaultOn:true,  perpOnly:true },
  { id:'liquidations',label:'Liquidations',      sub:'forced exits · squeeze side',         tier:'plus', defaultOn:false, perpOnly:true },
  { id:'catalysts',   label:'Catalysts',         sub:'what just moved the tape',             tier:'mvp',  defaultOn:true },
];
const MO_DEF_ORDER = MO_WIDGETS.map(w=>w.id);

/* ── prefs (order + hidden), persisted ── */
function moLoadPrefs(){
  const defHidden = {}; MO_WIDGETS.forEach(w=>{ if(w.defaultOn===false) defHidden[w.id]=true; });
  try { const raw = localStorage.getItem('arx-ov-prefs');
    if(!raw) return { order: MO_DEF_ORDER.slice(), hidden: defHidden };
    const p = JSON.parse(raw);
    return { order: Array.isArray(p.order)&&p.order.length?p.order:MO_DEF_ORDER.slice(), hidden: p.hidden||defHidden };
  } catch(e){ return { order: MO_DEF_ORDER.slice(), hidden: defHidden }; }
}
function moSavePrefs(p){ try { localStorage.setItem('arx-ov-prefs', JSON.stringify(p)); } catch(e){} }

/* ── widget shell — consistent label header (+ optional inline control via `right`) ── */
function MoWidget({ w, right, children }){
  return (
    <section className="arx-arrive" style={{margin:'0 0 18px'}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, padding:'0 16px 9px', minHeight:24}}>
        <div style={{font:'600 16px var(--font-brand)', letterSpacing:'-.01em', color:'var(--text-primary)'}}>{w.label}</div>
        {right}
      </div>
      {children}
    </section>
  );
}

/* ── one widget body by id (existing components, unchanged) ── */
function MoWidgetBody({ id, inst, win, winFlow, setWinFlow, onOpen, onNews, onSeeAll }){
  switch(id){
    case 'dayread':      return <MoDayRead inst={inst}/>;
    case 'map':          return <MoHeatmap inst={inst} win={win} onOpen={onOpen} onSeeAll={onSeeAll}/>;
    case 'movers':       return <MoMovers inst={inst} limit={10} onOpen={onOpen} onSeeAll={onSeeAll}/>;
    case 'moneyflow':    return (typeof WalletFunding!=='undefined' ? <WalletFunding embed win={winFlow} setWin={setWinFlow}/> : <div style={{padding:'0 20px', color:'var(--text-tertiary)', font:'400 12px var(--font-body)'}}>Money flow</div>);
    case 'tradingflow':  return <MoTradingFlow inst={inst}/>;
    case 'positioning':  return <MoPositioning inst={inst} onOpen={onOpen}/>;
    case 'liquidations': return <MoMarketMap inst={inst} metric="liq" lockMetric bare height={240} onOpen={onOpen}/>;
    case 'catalysts':    return <MoCatalysts onOpen={onNews}/>;
    default: return null;
  }
}

/* ── Customize sheet — show/hide + reorder (up/down) · reset ── */
function MoCustomize({ prefs, setPrefs, onClose }){
  const ordered = prefs.order.map(id=>MO_WIDGETS.find(w=>w.id===id)).filter(Boolean);
  const move = (i,d)=>{ const o=prefs.order.slice(); const j=i+d; if(j<0||j>=o.length) return; const t=o[i]; o[i]=o[j]; o[j]=t; const np={...prefs, order:o}; setPrefs(np); moSavePrefs(np); };
  const toggle = (id)=>{ const h={...prefs.hidden}; h[id]=!h[id]; const np={...prefs, hidden:h}; setPrefs(np); moSavePrefs(np); };
  const reset = ()=>{ const np={order:MO_DEF_ORDER.slice(), hidden:{}}; setPrefs(np); moSavePrefs(np); };
  return (
    <GlassSheet onClose={onClose}>
      <div style={{padding:'6px 20px 24px'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4}}>
          <div style={{font:'700 18px var(--font-body)'}}>Customize overview</div>
          <button onClick={reset} style={{background:'none', border:'none', cursor:'pointer', font:'600 12.5px var(--font-body)', color:'var(--color-violet-500)'}}>Reset</button>
        </div>
        <div style={{font:'400 12px var(--font-body)', color:'var(--text-tertiary)', marginBottom:14, lineHeight:1.4}}>Show, hide, and reorder your widgets. Anchors can't be hidden.</div>
        {ordered.map((w,i)=>{
          const hidden = !!prefs.hidden[w.id];
          return (
            <div key={w.id} style={{display:'flex', alignItems:'center', gap:12, padding:'11px 0', borderBottom:'.5px solid var(--border-default)'}}>
              <div style={{display:'flex', flexDirection:'column', gap:2}}>
                <button onClick={()=>move(i,-1)} disabled={i===0} className="arx-press" style={{background:'none', border:'none', cursor:i===0?'default':'pointer', opacity:i===0?.3:1, padding:0, color:'var(--text-secondary)'}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg></button>
                <button onClick={()=>move(i,1)} disabled={i===ordered.length-1} className="arx-press" style={{background:'none', border:'none', cursor:i===ordered.length-1?'default':'pointer', opacity:i===ordered.length-1?.3:1, padding:0, color:'var(--text-secondary)'}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg></button>
              </div>
              <div style={{flex:1, minWidth:0, opacity:hidden?.5:1}}>
                <div style={{display:'flex', alignItems:'center', gap:7}}>
                  <span style={{font:'600 14px var(--font-body)', color:'var(--text-primary)'}}>{w.label}</span>
                  {w.tier==='plus' && <span style={{font:'600 8.5px var(--font-body)', letterSpacing:'.06em', textTransform:'uppercase', color:'var(--color-violet-500)', background:'rgba(124,91,255,.12)', padding:'1px 6px', borderRadius:999}}>+ extra</span>}
                  {w.core && <span style={{font:'600 8.5px var(--font-body)', letterSpacing:'.06em', textTransform:'uppercase', color:'var(--text-tertiary)'}}>anchor</span>}
                </div>
                <div style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{w.sub}</div>
              </div>
              {/* show/hide toggle (iOS switch) */}
              <button onClick={()=>!w.core && toggle(w.id)} disabled={w.core} className="arx-press" aria-label={hidden?'Show':'Hide'} style={{flexShrink:0, width:44, height:26, borderRadius:999, border:'none', cursor:w.core?'default':'pointer', padding:2, background: (!hidden)?'var(--color-violet-500)':'var(--surface-modal)', opacity:w.core?.55:1, transition:'background 180ms'}}>
                <span style={{display:'block', width:22, height:22, borderRadius:'50%', background:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,.25)', transform:(!hidden)?'translateX(18px)':'translateX(0)', transition:'transform 180ms'}}/>
              </button>
            </div>
          );
        })}
      </div>
    </GlassSheet>
  );
}

/* ── PUBLIC: the Markets Overview (flat + customizable) ── */
function MarketsOverview({ inst='perp', onOpen, onNews, onSeeAll }){
  const __mLive = window.useLiveMO ? window.useLiveMO() : 0;
  const __sLive = window.useLiveStocksMO ? window.useLiveStocksMO() : 0;
  const [prefs,setPrefs]=mosS(moLoadPrefs);
  const [custOpen,setCustOpen]=mosS(false);
  const [win,setWin]=mosS('24H');            // map window (15m–24H)
  const [winFlow,setWinFlow]=mosS('24H');    // money-flow window (24H–30D, slower cadence)
  const spot = inst==='spot';
  // each widget's header control lives in the shell `right` slot so every window reads as one pattern
  const rightFor = (w)=>{
    if(w.id==='dayread')   return <span style={{display:'inline-flex', alignItems:'center', gap:5, font:'600 9.5px var(--font-body)', letterSpacing:'.05em', textTransform:'uppercase', color:'var(--text-tertiary)'}}><span className="arx-breath" style={{width:6, height:6, borderRadius:'50%', background:'var(--regime-up-mid)'}}/>Live · now</span>;
    if(w.id==='map')       return <MoWindowPick val={win} onPick={setWin}/>;
    if(w.id==='moneyflow') return <MoSegBase items={[['24H','24H'],['7D','7D'],['30D','30D']]} val={winFlow} onPick={setWinFlow} h={24} fs={10.5} pad={11}/>;
    return null;
  };
  const list = prefs.order
    .map(id=>MO_WIDGETS.find(w=>w.id===id)).filter(Boolean)
    .filter(w=>!prefs.hidden[w.id])
    .filter(w=>!(spot && w.perpOnly));
  return (
    <div>
      {list.map(w=>(
        <MoWidget key={w.id} w={w} right={rightFor(w)}>
          <MoWidgetBody id={w.id} inst={inst} win={win} winFlow={winFlow} setWinFlow={setWinFlow} onOpen={onOpen} onNews={onNews} onSeeAll={onSeeAll}/>
        </MoWidget>
      ))}
      <button onClick={()=>setCustOpen(true)} className="arx-press" style={{display:'flex', alignItems:'center', justifyContent:'center', gap:7, width:'calc(100% - 40px)', margin:'2px 20px 34px', padding:'13px', borderRadius:13, cursor:'pointer', border:'.5px dashed var(--border-strong)', background:'var(--surface-base)', color:'var(--text-secondary)', font:'600 13px var(--font-body)'}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        Customize overview
      </button>
      {custOpen && <MoCustomize prefs={prefs} setPrefs={setPrefs} onClose={()=>setCustOpen(false)}/>}
    </div>
  );
}

Object.assign(window, { MarketsOverview, MoWidget, MO_WIDGETS, MoCustomize });
