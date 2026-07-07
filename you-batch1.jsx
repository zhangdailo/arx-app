/* ═══ ARX · You — Batch 1 (Identity · Quick-nav · Copies & allocation) ═══
   Additive components folded into YouScreen per YOU_IA_AUDIT / YOU_IA_SPEC.
   - YouQuickNav   : sticky in-page jump-nav (persona-aware default chip)
   - YouCopies     : the NEW "Copies & allocation" hub section (S7's missing default)
   Nothing here removes existing You features; it adds the identity/hub spine. */

const { useState: ybS, useEffect: ybE, useRef: ybR } = React;

/* find the scrollable ancestor + smooth-scroll to a section anchor (scrollIntoView is banned) */
function ybScrollToSec(key){
  const el = document.querySelector('[data-you-sec="'+key+'"]');
  if (!el) return;
  let sc = el.parentElement;
  while (sc && sc !== document.body){ const oy = getComputedStyle(sc).overflowY; if ((oy==='auto'||oy==='scroll') && sc.scrollHeight > sc.clientHeight) break; sc = sc.parentElement; }
  if (!sc || sc === document.body) { return; }
  const top = el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 56;
  const start = sc.scrollTop, dist = top - start, t0 = Date.now(), dur = 420;
  // setInterval tween — rAF is throttled inside the CSS-transform-scaled device frame.
  if (window.__ybScrollTween) clearInterval(window.__ybScrollTween);
  window.__ybScrollTween = setInterval(() => {
    const p = Math.min(1, (Date.now()-t0)/dur);
    const e = p<.5 ? 2*p*p : 1-Math.pow(-2*p+2,2)/2;
    sc.scrollTop = start + dist*e;
    if (p>=1) { clearInterval(window.__ybScrollTween); window.__ybScrollTween = null; }
  }, 16);
}

/* sticky quick-nav chip row — turns the long hub into tab-like access */
function YouQuickNav({ persona }) {
  const chips = persona==='s2'
    ? [['overview','Overview'],['pnl','PnL'],['copies','Copies'],['holdings','Holdings'],['earn','→ Earn']]
    : [['overview','Overview'],['copies','Copies'],['pnl','PnL'],['holdings','Holdings'],['earn','→ Earn']];
  const [active, setActive] = ybS(persona==='s2' ? 'holdings' : 'copies');
  return (
    <div style={{position:'sticky', top:0, zIndex:20, background:'var(--surface-base)', padding:'8px 0 8px'}}>
      <div style={{display:'flex', gap:7, overflowX:'auto', padding:'0 20px', scrollbarWidth:'none'}}>
        {chips.map(([id,l])=>{
          const on = active===id;
          return (
            <button key={id} onClick={()=>{ setActive(id); ybScrollToSec(id); }} className="arx-press" style={{
              flexShrink:0, height:30, padding:'0 14px', borderRadius:999, cursor:'pointer', whiteSpace:'nowrap',
              background: on ? 'color-mix(in srgb, var(--color-violet-500) 13%, var(--surface-base))' : 'transparent',
              border:'none', color: on ? 'var(--color-violet-700)' : 'var(--text-tertiary)', font:`${on?700:600} 12.5px var(--font-body)`,
            }}>{l}</button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Copies & allocation — the S7 hub default; per-leader PnL + always-on loss-limit headroom ── */
const YOU_COPIES = [
  { handle:'@HsakaTrades', seed:'hsaka', verified:true, capital:600, pnl:+340.10, headroom:14, leader30:'+62.4%', status:'active' },
  { handle:'Rays of Dai Lo', seed:'rays', verified:true, capital:400, pnl:+92.40, headroom:31, leader30:'+33.1%', status:'active' },
  { handle:'frostbyte.eth', seed:'frost', verified:false, capital:200, pnl:-58.20, headroom:6, leader30:'−7.2%', status:'paused', reason:'Loss-limit hit · auto-paused' },
];

function HeadroomMeter({ pct }) {
  // pct = % of room left before the loss cap. Low = danger.
  const danger = pct <= 8, warn = pct <= 20;
  const col = danger ? 'var(--regime-down-mid)' : warn ? 'var(--regime-trans-mid)' : 'var(--regime-up-mid)';
  const fill = Math.max(4, Math.min(100, pct));
  return (
    <div style={{display:'flex', flexDirection:'column', gap:4, minWidth:124}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:10}}>
        <span style={{font:'500 9px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.04em', whiteSpace:'nowrap'}}>Loss-limit room</span>
        <span className="num" style={{font:'700 10.5px var(--font-mono)', color:col, flexShrink:0}}>{pct}%</span>
      </div>
      <div style={{height:5, borderRadius:999, background:'var(--glass-control-bg)', overflow:'hidden'}}>
        <div style={{width:fill+'%', height:'100%', borderRadius:999, background:col, transition:'width .5s cubic-bezier(.2,.7,.2,1)'}}/>
      </div>
    </div>
  );
}

function YouCopies({ persona, onToast }) {
  const total = YOU_COPIES.reduce((s,c)=>s+c.pnl,0);
  const open = (c)=>{ if (window.__arxOpenSub) window.__arxOpenSub('copyDetails',{ f:{ x:c.handle, addr:c.handle, copyValue:c.capital, pnl:c.pnl } }); else onToast && onToast('Open '+c.handle); };
  return (
    <div data-you-sec="copies">
      <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', padding:'8px 20px 6px'}}>
        <span className="arx-eyebrow-pill">Copies &amp; allocation</span>
        <span className="num" style={{font:'700 12px var(--font-mono)', color: total>=0?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{total>=0?'+':'−'}${Math.abs(total).toFixed(2)}</span>
      </div>
      {YOU_COPIES.map((c,i)=>(
        <button key={i} onClick={()=>open(c)} className="arx-row-press" style={{width:'100%', display:'flex', flexDirection:'column', gap:11, padding:'14px 20px', borderBottom:'.5px solid var(--border-default)', background:'none', border:'none', cursor:'pointer', textAlign:'left', opacity:c.status==='paused'?0.7:1}}>
          <div style={{display:'flex', alignItems:'center', gap:12, width:'100%'}}>
            <PersonAvatar seed={c.seed} size={40}/>
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:'flex', alignItems:'center', gap:6}}>
                <span style={{font:'700 13.5px var(--font-body)', color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{c.handle}</span>
                {c.verified && <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--color-violet-500)" style={{flexShrink:0}}><path d="M12 2l2.4 1.8 3-.3 1 2.8 2.6 1.5-.8 2.9.8 2.9-2.6 1.5-1 2.8-3-.3L12 22l-2.4-1.8-3 .3-1-2.8L3 16.4l.8-2.9L3 10.6l2.6-1.5 1-2.8 3 .3z"/><path d="M9.5 12.5l1.8 1.8 3.5-3.8" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <div style={{font:'500 10.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:1}}>
                ${c.capital} copied · leader 30d <span style={{color: c.leader30.startsWith('−')?'var(--regime-down-mid)':'var(--regime-up-mid)'}}>{c.leader30}</span>
              </div>
              {c.status==='paused' && <div style={{font:'600 9.5px var(--font-body)', color:'var(--regime-down-mid)', marginTop:3, display:'inline-flex', alignItems:'center', gap:4}}>⏸ {c.reason}</div>}
            </div>
            <span className="num" style={{font:'700 14px var(--font-mono)', flexShrink:0, whiteSpace:'nowrap', color: c.pnl>=0?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{c.pnl>=0?'+':'−'}${Math.abs(c.pnl).toFixed(2)}</span>
          </div>
          <div style={{paddingLeft:52, width:'100%'}}><HeadroomMeter pct={c.headroom}/></div>
        </button>
      ))}
      <button onClick={()=>window.__arxGoTab && window.__arxGoTab('wallets')} className="arx-press" style={{display:'flex', alignItems:'center', justifyContent:'center', gap:6, width:'calc(100% - 40px)', margin:'10px 20px 0', height:40, borderRadius:12, cursor:'pointer', background:'var(--glass-control-bg)', border:'.5px solid var(--border-default)', color:'var(--color-violet-500)', font:'700 12.5px var(--font-body)'}}>
        + Add a copy
      </button>
    </div>
  );
}

Object.assign(window, { YouQuickNav, YouCopies, ybScrollToSec });
