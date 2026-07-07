/* ═══ ARX · Extras — RWA fundamentals · position management · slide-to-trade · settings ═══
   Closes plan items #3 (RWA-rich detail), #4 (order/liquidation states + manage), #6 (slide-to-trade),
   #8 (transfer · app-lock · fee/funding history). Arx tokens throughout — regime colour on data only. */

const { useState: xS, useRef: xR } = React;

/* ─────────── #3 · RWA fundamentals + related assets ─────────── */
const ARX_FUND = {
  GOLD:   { tag:'Commodity · spot-settled', rows:[['Spot benchmark','XAU/USD'],['Contract','100 oz equiv'],['Session','24 / 5'],['52-wk range','$3,980 – $4,910']] },
  SILVER: { tag:'Commodity · spot-settled', rows:[['Spot benchmark','XAG/USD'],['Gold ratio','75.5'],['Session','24 / 5'],['52-wk range','$58 – $96']] },
  OIL:    { tag:'Commodity · WTI crude',    rows:[['Benchmark','WTI'],['Contract','1,000 bbl'],['Session','24 / 5'],['52-wk range','$66 – $94']] },
  NATGAS: { tag:'Commodity · Henry Hub',    rows:[['Benchmark','Henry Hub'],['Contract','10,000 MMBtu'],['Session','24 / 5'],['52-wk range','$1.8 – $3.6']] },
  COPPER: { tag:'Commodity · HG',           rows:[['Benchmark','COMEX HG'],['Contract','25,000 lb'],['Session','24 / 5'],['52-wk range','$3.9 – $5.2']] },
  'S&P':  { tag:'Index · cash-settled',     rows:[['Index','S&P 500'],['Constituents','500'],['Index P/E','24.6'],['52-wk range','5,100 – 6,900']] },
  NVDA:   { tag:'US equity · NASDAQ',       rows:[['Market cap','$2.9T'],['P/E (ttm)','58.2'],['EPS (ttm)','$20.40'],['Next earnings','Aug 27']] },
};
const ARX_RELATED = {
  GOLD:['SILVER','COPPER','OIL'], SILVER:['GOLD','COPPER','NATGAS'], OIL:['NATGAS','GOLD','S&P'],
  NATGAS:['OIL','COPPER','SILVER'], COPPER:['SILVER','GOLD','OIL'], 'S&P':['NVDA','GOLD','OIL'],
  NVDA:['S&P','BTC','ETH'], BTC:['ETH','SOL','HYPE'], ETH:['BTC','SOL','HYPE'], SOL:['HYPE','ETH','BTC'],
  HYPE:['SOL','ETH','BTC'], EUR:['GBP','JPY'], GBP:['EUR','JPY'], JPY:['EUR','GBP'],
};

function RwaFundamentals({ sym }) {
  const f = ARX_FUND[sym];
  if (!f) return null;
  return (
    <>
      <SectionHeader>Fundamentals</SectionHeader>
      <div style={{margin:'2px 20px 4px', borderRadius:14, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', overflow:'hidden'}}>
        <div style={{padding:'10px 14px', borderBottom:'.5px solid var(--border-default)', font:'600 10px var(--font-body)', color:'var(--color-violet-500)', textTransform:'uppercase', letterSpacing:'.06em'}}>{f.tag}</div>
        {f.rows.map(([k,v],i)=>(
          <div key={k} style={{display:'flex', justifyContent:'space-between', padding:'10px 14px', borderTop:i?'.5px solid var(--border-default)':'none'}}>
            <span style={{font:'500 13px var(--font-body)', color:'var(--text-secondary)'}}>{k}</span>
            <span className="num" style={{font:'600 13px var(--font-mono)', color:'var(--text-primary)'}}>{v}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function RelatedAssets({ sym, onOpen }) {
  const rel = (ARX_RELATED[sym] || []).map(s => (window.discFind ? window.discFind(s) : null)).filter(Boolean);
  if (!rel.length) return null;
  return (
    <>
      <SectionHeader>Related markets</SectionHeader>
      <div style={{display:'flex', gap:10, overflowX:'auto', padding:'2px 20px 8px', scrollbarWidth:'none'}}>
        {rel.map(m => {
          const pos = m.deltaPct>=0;
          return (
            <button key={m.sym} onClick={()=>onOpen && onOpen(m)} className="arx-press" style={{
              flex:'0 0 120px', background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', borderRadius:14, padding:12, textAlign:'left', cursor:'pointer'}}>
              <AssetGlyph sym={m.sym} size={26}/>
              <div style={{font:'600 13px var(--font-body)', marginTop:8}}>{m.sym}</div>
              <div className="num" style={{font:'500 11.5px var(--font-mono)', color:'var(--text-secondary)', marginTop:2}}>{window.discPrice?window.discPrice(m.price):'$'+m.price}</div>
              <div className="num" style={{font:'600 11.5px var(--font-mono)', color: pos?'var(--regime-up-mid)':'var(--regime-down-mid)', marginTop:2}}>{pos?'+':'−'}{Math.abs(m.deltaPct).toFixed(2)}%</div>
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ─────────── #4 · order / position states + manage sheet ─────────── */
const ORDER_STATE = {
  pending:    ['var(--regime-trans-mid)','rgba(251,191,36,.16)','Pending'],
  partial:    ['var(--regime-range-mid)','rgba(59,130,246,.14)','Partial fill'],
  filled:     ['var(--regime-up-mid)','rgba(45,212,155,.14)','Filled'],
  failed:     ['var(--regime-down-mid)','rgba(242,106,106,.14)','Failed'],
  liquidated: ['var(--regime-crisis-mid)','rgba(242,106,106,.20)','Liquidated'],
  canceled:   ['var(--text-tertiary)','rgba(120,120,128,.14)','Canceled'],
};
function OrderStateBadge({ state }) {
  const [ink,bg,label] = ORDER_STATE[state] || ORDER_STATE.pending;
  return <span style={{font:'700 9px var(--font-body)', color:ink, background:bg, padding:'2px 7px', borderRadius:999, letterSpacing:'.03em', whiteSpace:'nowrap'}}>{label}</span>;
}

/* full-screen position manager: add margin · partial close · close */
function PositionManageSheet({ p, onClose, onToast }) {
  const [tab, setTab] = xS('margin');     // margin | reduce
  const [addAmt, setAddAmt] = xS(200);
  const [reducePct, setReducePct] = xS(50);
  const pp = p || { sym:'SOL', dir:'LONG', lev:'6×', size:'$3,420', entry:'$182.41', liq:'$168.20', pnl:'+$284.10', margin:'$570' };
  const long = pp.dir==='LONG';
  const liqAfter = (parseFloat((pp.liq||'$168').replace(/[$,]/g,'')) * (long?0.97:1.03)).toFixed(2);
  return (
    <Sheet onClose={onClose} maxHeight="82%" zIndex={75}>
        {/* position header */}
        <div style={{display:'flex', alignItems:'center', gap:12, padding:'8px 20px 14px'}}>
          <AssetGlyph sym={pp.sym} size={38}/>
          <div style={{flex:1}}>
            <div style={{font:'700 16px var(--font-body)'}}>{pp.sym}-PERP <span style={{font:'700 10px var(--font-body)', marginLeft:4, color: long?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{pp.dir} {pp.lev}</span></div>
            <div className="num" style={{font:'500 11.5px var(--font-mono)', color:'var(--text-tertiary)', marginTop:2}}>Size {pp.size} · entry {pp.entry}</div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <div className="num" style={{font:'700 15px var(--font-mono)', color:(pp.pnl||'+').startsWith('+')?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{pp.pnl}</div>
            <button onClick={()=>window.__arxOpenSub && window.__arxOpenSub('pnlShare',{pos:pp})} aria-label="Share PnL" style={{width:32, height:32, borderRadius:9, border:'none', cursor:'pointer', background:'rgba(124,91,255,.14)', display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-violet-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            </button>
          </div>
        </div>
        {/* liquidation strip */}
        <div style={{display:'flex', margin:'0 20px 14px', borderRadius:12, overflow:'hidden', border:'.5px solid var(--border-default)'}}>
          {[['Liq. price',pp.liq||'$168.20'],['Margin',pp.margin||'$570'],['Distance','11.2%']].map(([k,v],i)=>(
            <div key={k} style={{flex:1, padding:'10px 12px', borderLeft:i?'.5px solid var(--border-default)':'none', background:'var(--surface-elevated)'}}>
              <div style={{font:'500 9px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.04em'}}>{k}</div>
              <div className="num" style={{font:'600 13px var(--font-mono)', marginTop:3, color: k==='Distance'?'var(--regime-up-mid)':'var(--text-primary)'}}>{v}</div>
            </div>
          ))}
        </div>
        {/* tab switch */}
        <div style={{display:'flex', gap:6, margin:'0 20px 14px', background:'var(--glass-control-bg)', borderRadius:11, padding:3, height:40}}>
          {[['margin','Add margin'],['reduce','Reduce']].map(([id,l])=>(
            <button key={id} onClick={()=>setTab(id)} style={{flex:1, borderRadius:8, border:'none', cursor:'pointer', background: tab===id?'var(--surface-elevated)':'transparent', color: tab===id?'var(--text-primary)':'var(--text-secondary)', font:`${tab===id?700:500} 13px var(--font-body)`}}>{l}</button>
          ))}
        </div>
        {tab==='margin' ? (
          <div style={{padding:'0 20px 8px'}}>
            <div className="num" style={{textAlign:'center', font:'500 40px var(--font-mono)', letterSpacing:'-.03em'}}>${addAmt}</div>
            <div style={{textAlign:'center', font:'500 12px var(--font-body)', color:'var(--text-tertiary)', marginBottom:14}}>Moves liquidation to <span className="num" style={{color:'var(--regime-up-mid)'}}>${liqAfter}</span> — further away</div>
            <div style={{display:'flex', gap:8}}>
              {[100,200,500,'Max'].map(v=>(
                <button key={v} onClick={()=>setAddAmt(v==='Max'?840:v)} className="arx-press" style={{flex:1, height:38, borderRadius:11, cursor:'pointer', background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', color:'var(--text-primary)', font:'600 13px var(--font-body)'}}>{v==='Max'?'Max':'$'+v}</button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{padding:'0 20px 8px'}}>
            <div className="num" style={{textAlign:'center', font:'500 40px var(--font-mono)', letterSpacing:'-.03em'}}>{reducePct}%</div>
            <div style={{textAlign:'center', font:'500 12px var(--font-body)', color:'var(--text-tertiary)', marginBottom:14}}>Closes <span className="num" style={{color:'var(--text-primary)'}}>${(3420*reducePct/100).toFixed(0)}</span> of your position at market</div>
            <div style={{display:'flex', gap:8}}>
              {[25,50,75,100].map(v=>(
                <button key={v} onClick={()=>setReducePct(v)} className="arx-press" style={{flex:1, height:38, borderRadius:11, cursor:'pointer', background: reducePct===v?'var(--color-violet-500)':'var(--surface-elevated)', border:'.5px solid '+(reducePct===v?'var(--color-violet-500)':'var(--border-default)'), color: reducePct===v?'#fff':'var(--text-primary)', font:'600 13px var(--font-body)'}}>{v}%</button>
              ))}
            </div>
          </div>
        )}
        <div style={{padding:'14px 20px calc(20px + env(safe-area-inset-bottom))'}}>
          <SlideToConfirm
            label={tab==='margin' ? `Slide to add $${addAmt} margin` : (reducePct===100 ? 'Slide to close position' : `Slide to reduce ${reducePct}%`)}
            tone={tab==='reduce' && reducePct===100 ? 'down' : 'violet'}
            onConfirm={()=>{ onToast && onToast(tab==='margin' ? `Added $${addAmt} margin — liquidation moved to $${liqAfter}` : (reducePct===100?`${pp.sym} position closed`:`Reduced ${pp.sym} by ${reducePct}%`)); onClose && onClose(); }}/>
        </div>
    </Sheet>
  );
}

/* ─────────── #6 · slide-to-trade ─────────── */
function SlideToConfirm({ label, onConfirm, tone='violet' }) {
  const [x, setX] = xS(0);
  const [done, setDone] = xS(false);
  const trackRef = xR(null);
  const dragging = xR(false);
  const TH = 56, PAD = 5, KN = TH - PAD*2;
  const ink = tone==='down' ? 'var(--regime-down-mid)' : tone==='up' ? 'var(--regime-up-mid)' : 'var(--color-violet-500)';
  const knobGrad = tone==='down' ? 'linear-gradient(180deg,#ff6f86,#e23a59)'
                 : tone==='up'   ? 'linear-gradient(180deg,#2fd49a,#0fa86c)'
                 :                  'linear-gradient(180deg,#8a6bff,#6f4ce0)';
  const knobGlow = tone==='down' ? 'rgba(255,77,106,.42)' : tone==='up' ? 'rgba(20,184,123,.42)' : 'rgba(124,91,255,.45)';
  const fillTint = tone==='down' ? 'rgba(255,77,106,.26)' : tone==='up' ? 'rgba(20,184,123,.26)' : 'rgba(124,91,255,.26)';
  const prog = x/120;
  const onMove = (clientX) => {
    if (!dragging.current || done) return;
    const t = trackRef.current; if (!t) return;
    const r = t.getBoundingClientRect();
    let nx = Math.max(0, Math.min(clientX - r.left - TH/2, r.width - TH));
    setX(nx);
    if (nx >= r.width - TH - 6) { setDone(true); dragging.current=false; setTimeout(()=>onConfirm && onConfirm(), 160); }
  };
  return (
    <div ref={trackRef} style={{position:'relative', height:TH, borderRadius:16, background:'var(--surface-elevated)', boxShadow:'0 1px 3px rgba(20,18,40,.10), inset 0 0 0 .5px var(--border-default)', overflow:'hidden', touchAction:'none'}}>
      <style>{`@keyframes arxSlideShimmer{0%{background-position:120% 0}100%{background-position:-120% 0}}`}</style>
      {/* sweep fill behind the knob */}
      <div style={{position:'absolute', left:0, top:0, bottom:0, width: done?'100%':(x+TH+PAD)+'px', borderRadius:16, background: done?ink:`linear-gradient(90deg, transparent, ${fillTint})`, transition: done?'width 180ms ease, background 180ms ease':'none', zIndex:1, pointerEvents:'none'}}/>
      {/* label — shimmer while idle, solid on done */}
      {done ? (
        <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', font:'700 14.5px var(--font-body)', color:'#fff', zIndex:2, pointerEvents:'none'}}>✓ Confirmed</div>
      ) : (
        <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', font:'600 14.5px var(--font-body)', zIndex:2, pointerEvents:'none', opacity: Math.max(0.25, 1-prog*1.2),
          color:'transparent', background:'linear-gradient(100deg, var(--text-tertiary) 30%, #fff 50%, var(--text-tertiary) 70%)', backgroundSize:'220% 100%', WebkitBackgroundClip:'text', backgroundClip:'text', animation:'arxSlideShimmer 2.4s linear infinite'}}>{label}</div>
      )}
      {/* floating glass knob */}
      <div
        onPointerDown={e=>{ dragging.current=true; e.currentTarget.setPointerCapture(e.pointerId); }}
        onPointerMove={e=>onMove(e.clientX)}
        onPointerUp={()=>{ dragging.current=false; if(!done) setX(0); }}
        style={{position:'absolute', top:PAD, left:PAD, width:KN, height:KN, borderRadius:14, background:knobGrad, display:'flex', alignItems:'center', justifyContent:'center', cursor:'grab', zIndex:3, boxShadow:`0 5px 14px ${knobGlow}, 0 2px 6px rgba(0,0,0,.4), inset 0 2px 1px rgba(255,255,255,.6)`, transform:`translateX(${done?'calc('+(trackRef.current?trackRef.current.clientWidth-TH:300)+'px)':x+'px'})`, transition: dragging.current?'none':'transform 200ms cubic-bezier(.32,.72,0,1)', touchAction:'none'}}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">{done ? <polyline points="20 6 9 17 4 12"/> : <polyline points="9 6 15 12 9 18"/>}</svg>
      </div>
    </div>
  );
}

/* ─────────── #8 · transfer · app-lock · fee/funding history ─────────── */
function TransferFlow({ onClose, onToast }) {
  const [dir, setDir] = xS('toPerps');   // toPerps | toSpot
  const [amt, setAmt] = xS('500');
  const from = dir==='toPerps' ? 'Spot wallet' : 'Perps account';
  const to   = dir==='toPerps' ? 'Perps account' : 'Spot wallet';
  return (
    <SubShell title="Transfer" onBack={onClose}>
      <div style={{padding:'8px 20px 0'}}>
        <div style={{borderRadius:16, overflow:'hidden', border:'.5px solid var(--border-default)'}}>
          <div style={{display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:'var(--surface-elevated)'}}>
            <div style={{width:34, height:34, borderRadius:10, background:'var(--glass-control-bg)', display:'flex', alignItems:'center', justifyContent:'center', font:'700 13px var(--font-body)', color:'var(--text-secondary)'}}>↑</div>
            <div style={{flex:1}}><div style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em'}}>From</div><div style={{font:'600 14px var(--font-body)', marginTop:2}}>{from}</div></div>
          </div>
          <button onClick={()=>setDir(dir==='toPerps'?'toSpot':'toPerps')} className="arx-press" style={{position:'relative', display:'flex', alignItems:'center', justifyContent:'center', width:'100%', height:1, border:'none', background:'var(--border-default)', cursor:'pointer'}}>
            <span style={{position:'absolute', width:32, height:32, borderRadius:'50%', background:'var(--color-violet-500)', display:'flex', alignItems:'center', justifyContent:'center'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10l5-5 5 5"/><path d="M7 14l5 5 5-5"/></svg>
            </span>
          </button>
          <div style={{display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:'var(--surface-elevated)'}}>
            <div style={{width:34, height:34, borderRadius:10, background:'var(--glass-control-bg)', display:'flex', alignItems:'center', justifyContent:'center', font:'700 13px var(--font-body)', color:'var(--text-secondary)'}}>↓</div>
            <div style={{flex:1}}><div style={{font:'500 10px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em'}}>To</div><div style={{font:'600 14px var(--font-body)', marginTop:2}}>{to}</div></div>
          </div>
        </div>
        <div className="num" style={{textAlign:'center', font:'500 46px var(--font-mono)', letterSpacing:'-.03em', margin:'24px 0 2px'}}>${amt}</div>
        <div style={{textAlign:'center', font:'500 12px var(--font-body)', color:'var(--text-tertiary)', marginBottom:16}}>USDC available <span className="num">$9,214.10</span></div>
        <div style={{display:'flex', gap:8, marginBottom:18}}>
          {['100','500','1000','Max'].map(v=>(
            <button key={v} onClick={()=>setAmt(v==='Max'?'9214':v)} className="arx-press" style={{flex:1, height:40, borderRadius:11, cursor:'pointer', background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', color:'var(--text-primary)', font:'600 13px var(--font-body)'}}>{v==='Max'?'Max':'$'+v}</button>
          ))}
        </div>
        <div style={{font:'400 11px var(--font-body)', color:'var(--text-tertiary)', textAlign:'center', marginBottom:16, lineHeight:1.5}}>Internal transfer · no network fee · instant</div>
        <SlideToConfirm label={`Slide to transfer $${amt}`} onConfirm={()=>{ onToast && onToast(`Transferred $${amt} to ${to.toLowerCase()}`); onClose && onClose(); }}/>
      </div>
    </SubShell>
  );
}

function HistoryScreen({ onBack }) {
  const [seg, setSeg] = xS('fees');
  const FEES = [['Trade fee','SOL-PERP open','−$0.42','2h ago'],['Trade fee','BTC-PERP close','−$1.18','5h ago'],['Trade fee','GOLD-PERP open','−$0.31','1d ago'],['Withdrawal','USDC → Arbitrum','−$0.90','2d ago']];
  const FUND = [['Funding','SOL-PERP long','−$2.14','8h ago','down'],['Funding','SOL-PERP long','+$1.02','16h ago','up'],['Funding','ETH-PERP short','+$0.88','1d ago','up'],['Funding','BTC-PERP long','−$3.40','1d ago','down']];
  return (
    <SubShell title="Fees & funding" onBack={onBack}>
      <div style={{display:'flex', gap:6, margin:'4px 20px 6px', background:'var(--glass-control-bg)', borderRadius:11, padding:3, height:40}}>
        {[['fees','Fees'],['funding','Funding']].map(([id,l])=>(
          <button key={id} onClick={()=>setSeg(id)} style={{flex:1, borderRadius:8, border:'none', cursor:'pointer', background: seg===id?'var(--surface-elevated)':'transparent', color: seg===id?'var(--text-primary)':'var(--text-secondary)', font:`${seg===id?700:500} 13px var(--font-body)`}}>{l}</button>
        ))}
      </div>
      {seg==='fees' ? (<>
        <div style={{display:'flex', justifyContent:'space-between', padding:'10px 20px 4px'}}>
          <span style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)'}}>30-day fees</span>
          <span className="num" style={{font:'600 13px var(--font-mono)', color:'var(--text-primary)'}}>−$18.42</span>
        </div>
        {FEES.map((r,i)=>(
          <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'12px 20px', borderTop:'.5px solid var(--border-default)'}}>
            <div style={{flex:1}}><div style={{font:'600 13.5px var(--font-body)'}}>{r[0]}</div><div style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:2}}>{r[1]} · {r[3]}</div></div>
            <span className="num" style={{font:'600 13px var(--font-mono)', color:'var(--text-secondary)'}}>{r[2]}</span>
          </div>
        ))}
      </>) : (<>
        <div style={{display:'flex', justifyContent:'space-between', padding:'10px 20px 4px'}}>
          <span style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)'}}>Net funding · 30d</span>
          <span className="num" style={{font:'600 13px var(--font-mono)', color:'var(--regime-down-mid)'}}>−$3.64</span>
        </div>
        {FUND.map((r,i)=>(
          <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'12px 20px', borderTop:'.5px solid var(--border-default)'}}>
            <div style={{flex:1}}><div style={{font:'600 13.5px var(--font-body)'}}>{r[1]}</div><div style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)', marginTop:2}}>{r[0]} · {r[3]}</div></div>
            <span className="num" style={{font:'600 13px var(--font-mono)', color: r[4]==='up'?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{r[2]}</span>
          </div>
        ))}
      </>)}
      <div style={{textAlign:'center', font:'500 12px var(--font-body)', color:'var(--text-tertiary)', padding:'18px 0'}}>You're caught up</div>
    </SubShell>
  );
}

/* App-lock toggle group (rendered inline in You preferences) */
function useAppLock() {
  const [on, setOn] = xS(()=>{ try{ return localStorage.getItem('arx-app-lock')==='1'; }catch(e){ return false; } });
  const toggle = ()=>{ setOn(v=>{ const nv=!v; try{ localStorage.setItem('arx-app-lock', nv?'1':'0'); }catch(e){} return nv; }); };
  return [on, toggle];
}
function PrefToggleRow({ label, value, on, onToggle }) {
  return (
    <div style={{width:'100%', display:'flex', alignItems:'center', gap:10, padding:'13px 20px'}}>
      <span style={{flex:1, font:'500 15px var(--font-body)', color:'var(--text-primary)'}}>{label}</span>
      {value && <span style={{font:'500 13px var(--font-body)', color:'var(--text-tertiary)', marginRight:4}}>{value}</span>}
      <button onClick={onToggle} aria-label={label} style={{width:46, height:28, borderRadius:14, border:'none', cursor:'pointer', background: on?'var(--regime-up-mid)':'var(--glass-control-bg-strong)', position:'relative', transition:'background 200ms', flexShrink:0}}>
        <span style={{position:'absolute', top:3, left: on?21:3, width:22, height:22, borderRadius:'50%', background:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,.3)', transition:'left 200ms'}}/>
      </button>
    </div>
  );
}

/* ─────────── TradingView-style chart — for the asset detail page ─────────── */
function TradingViewChart({ sym='SOL', positive=true }) {
  const [tf, setTf] = xS('1D');
  const [kind, setKind] = xS('candles');   // candles | line
  const N = 46, W = 360, H = 250, volH = 36, chartH = H - volH - 14;
  const seed0 = (sym+tf).split('').reduce((a,c)=>a+c.charCodeAt(0), 7) % 99991 || 13;
  let s = seed0;
  const rnd = () => { s = (s*9301+49297) % 233280; return s/233280; };
  const candles = []; let p = 100 + (seed0 % 40);
  for (let i=0;i<N;i++){ const o=p; const drift=(positive?0.18:-0.12); const ch=(rnd()-0.5+drift)*3.6; const c=Math.max(12,o+ch); const hi=Math.max(o,c)+rnd()*1.8; const lo=Math.min(o,c)-rnd()*1.8; candles.push([o,hi,lo,c,0.25+rnd()]); p=c; }
  const all = candles.flatMap(c=>[c[1],c[2]]); const min=Math.min(...all), max=Math.max(...all), rng=(max-min)||1;
  const cw = W/N, bw = cw*0.62;
  const y = v => 6 + (1-(v-min)/rng)*(chartH-12);
  const last = candles[N-1][3], lastUp = candles[N-1][3] >= candles[N-1][0];
  const linePath = candles.map((c,i)=>(i?'L':'M')+(i*cw+cw/2).toFixed(1)+' '+y(c[3]).toFixed(1)).join(' ');
  const ma = candles.map((c,i)=>{ const w=candles.slice(Math.max(0,i-6),i+1); return w.reduce((a,x)=>a+x[3],0)/w.length; });
  const maPath = ma.map((v,i)=>(i?'L':'M')+(i*cw+cw/2).toFixed(1)+' '+y(v).toFixed(1)).join(' ');
  const maxVol = Math.max(...candles.map(c=>c[4]))||1;
  const gridVals = [0,0.25,0.5,0.75,1].map(f=>min+rng*f);
  return (
    <div style={{margin:'2px 16px 6px', borderRadius:16, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', overflow:'hidden'}}>
      {/* toolbar */}
      <div style={{display:'flex', alignItems:'center', gap:6, padding:'9px 12px', borderBottom:'.5px solid var(--border-default)'}}>
        <span style={{font:'700 12px var(--font-body)', color:'var(--text-primary)'}}>{sym}/USD</span>
        <span style={{flex:1}}/>
        {[['candles','▦'],['line','〰']].map(([id,gl])=>(
          <button key={id} onClick={()=>setKind(id)} aria-label={id} style={{width:28, height:24, borderRadius:7, cursor:'pointer', border:'none', background: kind===id?'var(--glass-control-bg-strong)':'transparent', color: kind===id?'var(--text-primary)':'var(--text-tertiary)', font:'600 12px var(--font-mono)'}}>{gl}</button>
        ))}
      </div>
      {/* chart */}
      <div style={{position:'relative'}}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{display:'block', height:H}}>
          {gridVals.map((v,i)=>(<line key={i} x1="0" x2={W} y1={y(v)} y2={y(v)} stroke="var(--border-default)" strokeWidth="1" strokeDasharray="2 5"/>))}
          {/* MA */}
          <path d={maPath} fill="none" stroke="var(--color-violet-500)" strokeWidth="1.2" opacity="0.7"/>
          {kind==='candles' ? candles.map((c,i)=>{ const [o,hi,lo,cl]=c; const up=cl>=o; const col=up?'var(--regime-up-mid)':'var(--regime-down-mid)'; const x=i*cw+cw/2;
            return (<g key={i} stroke={col} fill={col}><line x1={x} x2={x} y1={y(hi)} y2={y(lo)} strokeWidth="1"/><rect x={x-bw/2} y={Math.min(y(o),y(cl))} width={bw} height={Math.max(1.2,Math.abs(y(o)-y(cl)))} rx="0.5"/></g>);
          }) : (<>
            <path d={`${linePath} L ${W} ${H-volH-8} L 0 ${H-volH-8} Z`} fill={positive?'rgba(45,212,155,.12)':'rgba(242,106,106,.12)'}/>
            <path d={linePath} fill="none" stroke={positive?'var(--regime-up-mid)':'var(--regime-down-mid)'} strokeWidth="1.8"/>
          </>)}
          {/* volume */}
          {candles.map((c,i)=>{ const up=c[3]>=c[0]; const vh=(c[4]/maxVol)*volH; const x=i*cw+cw/2;
            return (<rect key={'v'+i} x={x-bw/2} y={H-2-vh} width={bw} height={vh} rx="0.5" fill={up?'var(--regime-up-mid)':'var(--regime-down-mid)'} opacity="0.28"/>);
          })}
          <line x1="0" x2={W} y1={y(last)} y2={y(last)} stroke="var(--color-violet-500)" strokeWidth="1" strokeDasharray="3 3"/>
        </svg>
        {/* price axis */}
        <div style={{position:'absolute', top:0, right:6, bottom:volH, display:'flex', flexDirection:'column', justifyContent:'space-between', pointerEvents:'none'}}>
          {[...gridVals].reverse().map((v,i)=>(<span key={i} className="num" style={{font:'500 8.5px var(--font-mono)', color:'var(--text-tertiary)'}}>{v.toFixed(1)}</span>))}
        </div>
        <span className="num" style={{position:'absolute', right:6, top:`calc(${y(last)/H*100}% - 8px)`, background:'var(--color-violet-500)', color:'#fff', font:'600 9px var(--font-mono)', padding:'1px 5px', borderRadius:4}}>{last.toFixed(2)}</span>
      </div>
      {/* timeframes */}
      <div style={{display:'flex', gap:4, padding:'8px 12px', borderTop:'.5px solid var(--border-default)'}}>
        {['15m','1H','4H','1D','1W'].map(r=>(
          <button key={r} onClick={()=>setTf(r)} style={{flex:1, height:28, borderRadius:8, cursor:'pointer', border:'none', background: tf===r?'var(--glass-control-bg-strong)':'transparent', color: tf===r?'var(--text-primary)':'var(--text-tertiary)', font:`${tf===r?700:500} 11px var(--font-mono)`}}>{r}</button>
        ))}
      </div>
    </div>
  );
}

/* ─────────── Pair selector — Bitget-style nav: search · Spot/Perps · asset class · ranked by volume ─────────── */
function arxVolNum(v){ if(typeof v!=='string') return 0; const m=v.replace(/[$,]/g,'').match(/([\d.]+)\s*([BMK]?)/i); if(!m) return 0; return parseFloat(m[1])*({B:1e9,M:1e6,K:1e3,'':1}[(m[2]||'').toUpperCase()]||1); }
const PAIR_CLASSES = [['Crypto','Crypto'],['Stocks','Stocks'],['PreIPO','Pre-IPO'],['Commodities','Commodities'],['Fx','Forex']];
const PAIR_LEV = { BTC:40, ETH:40, SOL:20, HYPE:20, GOLD:10, OIL:10, 'S&P':10, NVDA:10, TSLA:10, MSTR:10, OPENAI:5, SPACEX:5, STRIPE:5, EUR:50, GBP:50, JPY:50, SILVER:10, COPPER:10, NATGAS:10 };
function PairSelector({ market='perp', sym, onSelect, onClose }) {
  const [mkt, setMkt] = xS(market);
  const [q, setQ] = xS('');
  const inputRef = xR(null);
  React.useEffect(()=>{ const t=setTimeout(()=>inputRef.current&&inputRef.current.focus(), 80); return ()=>clearTimeout(t); }, []);
  const flat = []; for (const k in D.instruments) (D.instruments[k]||[]).forEach(m=>flat.push({...m, cat:k}));
  const ql = q.trim().toLowerCase();
  const match = (m)=> !ql || m.sym.toLowerCase().includes(ql) || (m.name||'').toLowerCase().includes(ql);
  const label = (m)=> mkt==='perp' ? m.sym+'-PERP' : m.sym+'/USDC';
  const pick = (m)=>{ onSelect && onSelect({ sym:m.sym, market:mkt }); onClose && onClose(); };
  const Row = (m)=>{
    const posv=m.deltaPct>=0; const pr=typeof m.price==='number'?m.price.toLocaleString(undefined,{minimumFractionDigits:m.price<10?4:2,maximumFractionDigits:m.price<10?4:2}):m.price;
    return (
      <button key={m.sym} onClick={()=>pick(m)} className="arx-row-press" style={{display:'flex', alignItems:'center', gap:11, width:'100%', padding:'10px 20px', background: m.sym===sym?'rgba(124,91,255,.06)':'none', border:'none', cursor:'pointer', textAlign:'left'}}>
        <AssetGlyph sym={m.sym} size={30}/>
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:'flex', alignItems:'center', gap:6}}><span style={{font:'600 13.5px var(--font-body)', color:'var(--text-primary)', whiteSpace:'nowrap'}}>{label(m)}</span>{mkt==='perp' && <span style={{font:'600 8.5px var(--font-mono)', color:'var(--text-tertiary)', background:'var(--glass-control-bg)', padding:'1px 5px', borderRadius:5, flexShrink:0}}>{PAIR_LEV[m.sym]||20}×</span>}</div>
          <div className="num" style={{font:'500 10.5px var(--font-mono)', color:'var(--text-tertiary)', marginTop:2, whiteSpace:'nowrap'}}>Vol {m.vol}</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div className="num" style={{font:'600 13px var(--font-mono)', color:'var(--text-primary)'}}>{pr}</div>
          <div className="num" style={{font:'500 11px var(--font-mono)', color: posv?'var(--regime-up-mid)':'var(--regime-down-mid)', marginTop:2}}>{posv?'+':'−'}{Math.abs(m.deltaPct).toFixed(2)}%</div>
        </div>
      </button>
    );
  };
  return (
    <div onClick={onClose} style={{position:'absolute', inset:0, zIndex:80, display:'flex', flexDirection:'column', background:'var(--surface-base)'}}>
      <div onClick={e=>e.stopPropagation()} style={{display:'flex', flexDirection:'column', height:'100%', background:'var(--surface-base)', animation:'arxSearchDrop 300ms cubic-bezier(.32,.72,0,1) both'}}>
        {/* search */}
        <div style={{display:'flex', alignItems:'center', gap:10, padding:'calc(12px + env(safe-area-inset-top)) 16px 12px'}}>
          <div style={{flex:1, display:'flex', alignItems:'center', gap:9, height:44, borderRadius:14, padding:'0 12px', background:'var(--surface-elevated)', border:'.5px solid var(--border-strong)'}}>
            <IconSearch size={16} color="var(--text-tertiary)"/>
            <input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)} placeholder="Search markets — BTC, gold, NVDA…" style={{flex:1, minWidth:0, border:'none', background:'none', outline:'none', font:'500 14px var(--font-body)', color:'var(--text-primary)'}}/>
          </div>
          <button onClick={onClose} style={{background:'none', border:'none', cursor:'pointer', font:'600 14px var(--font-body)', color:'var(--color-violet-500)', padding:'0 2px'}}>Cancel</button>
        </div>
        {/* Spot / Perps — horizontal options (not a sliding tab) */}
        <div style={{display:'flex', gap:8, margin:'0 20px 6px'}}>
          {[['perp','Perps'],['spot','Spot']].map(([id,l])=>(
            <button key={id} onClick={()=>setMkt(id)} className="arx-press" style={{height:32, padding:'0 16px', borderRadius:999, cursor:'pointer', background: mkt===id?'rgba(124,91,255,.14)':'transparent', border:'.5px solid '+(mkt===id?'var(--color-violet-500)':'var(--border-default)'), color: mkt===id?'var(--color-violet-700)':'var(--text-secondary)', font:`${mkt===id?700:600} 12.5px var(--font-body)`}}>{l}</button>
          ))}
        </div>
        <div style={{flex:1, overflowY:'auto', paddingBottom:'calc(20px + env(safe-area-inset-bottom))'}}>
          {/* Lucid card */}
          <button onClick={()=>{ window.__arxOpenLucid && window.__arxOpenLucid({ contextLabel:'On markets · which to trade', intro:{ action:"Tell me your read and I'll point you to a market.", body:'I can compare spot vs perps for an asset, surface where smart money is active, or match a market to the current regime. I won\u2019t tell you what to buy.' }, chips:[ {label:'Spot or perps for me?', reply:{conf:'medium', action:'Depends on whether you want leverage and can watch it.', body:'Spot = you own it, no liquidation, hold as long as you like. Perps = leverage and shorting, but funding and forced-close risk. New or hands-off → spot.', note:'Guidance, not advice.'}}, {label:'Where is smart money active?', reply:{conf:'medium', action:'SOL and HYPE are seeing the most smart-money flow today.', body:'That\u2019s positioning, not a signal — a crowded side can still reverse.', data:[['SOL','net long','up'],['HYPE','net long','up']]}} ] }); }} className="arx-press" style={{display:'flex', alignItems:'center', gap:11, width:'calc(100% - 40px)', margin:'6px 20px 4px', padding:'12px 14px', borderRadius:15, cursor:'pointer', textAlign:'left', background:'linear-gradient(150deg, rgba(124,91,255,.14), rgba(124,91,255,.03) 75%)', border:'.5px solid rgba(124,91,255,.3)'}}>
            <LucidOrb size={28}/>
            <div style={{flex:1, minWidth:0}}>
              <div style={{font:'700 12.5px var(--font-body)', color:'var(--text-primary)'}}>Not sure which market?</div>
              <div style={{font:'500 11.5px var(--font-body)', color:'var(--text-secondary)', marginTop:2, lineHeight:1.4}}>Ask Lucid — spot vs perps, smart-money flow, regime fit.</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-violet-500)" strokeWidth="2.4" strokeLinecap="round" style={{flexShrink:0}}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
          {/* asset-class groups, ranked by volume — spot shows crypto only */}
          {PAIR_CLASSES.filter(([cat])=> mkt==='perp' || SPOT_CLASSES.includes(cat)).map(([cat,label2])=>{
            const rows=(D.instruments[cat]||[]).map(m=>({...m,cat})).filter(match).sort((a,b)=>arxVolNum(b.vol)-arxVolNum(a.vol));
            if(!rows.length) return null;
            return (
              <div key={cat}>
                <div style={{padding:'14px 20px 2px', font:'600 10px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.08em'}}>{label2} · by volume</div>
                {rows.map(Row)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FundingCountdown({ rate='+0.0084%' }) {
  const [t, setT] = xS(()=> (8*3600) - Math.floor((Date.now()/1000) % (8*3600)));
  React.useEffect(()=>{ const id=setInterval(()=>setT(v=> v>0 ? v-1 : 8*3600-1), 1000); return ()=>clearInterval(id); }, []);
  const hh=String(Math.floor(t/3600)).padStart(2,'0'), mm=String(Math.floor(t%3600/60)).padStart(2,'0'), ss=String(t%60).padStart(2,'0');
  return <span className="num" style={{font:'inherit', color:'inherit'}}>{rate} <span style={{color:'var(--text-tertiary)'}}>{hh}:{mm}:{ss}</span></span>;
}

/* ─────────── Lifecycle-aware Trade state — CTA + banners + gating per stage ─────────── */
/* ─────────── Lifecycle — single ordered source of truth (0 → exit) ───────────
   Each stage drives equity figure, can-trade gating, the primary CTA, and the
   ticket/home banners. Consumed by the header balance pill, WalletSheet, Trade. */
const ARX_LIFECYCLE = [
  { id:'first_install',        label:'First install',          equity:0,        delta:0,    canTrade:false, cta:'Add funds', gate:'Add funds to start trading', banner:null },
  { id:'connected_no_deposit', label:'Created · no deposit',   equity:0,        delta:0,    canTrade:false, cta:'Add funds',      gate:'Add funds to trade', banner:{tone:'violet', text:'Add funds to place your first trade — start with as little as $50.'} },
  { id:'funded_no_trade',      label:'Funded · no trade',      equity:500,      delta:0,    canTrade:true,  first:true, cta:'Make first trade', banner:{tone:'violet', text:'Funds in. Your first trade — guardrails are on. Start small.'} },
  { id:'first_trade',          label:'First-trade explore',    equity:512.40,   delta:12.40, canTrade:true,  first:true, banner:null },
  { id:'copying',              label:'Copying active',         equity:3420.50,  delta:284.10, canTrade:true,  banner:null },
  { id:'portfolio_monitor',    label:'Portfolio monitor',      equity:24837.42, delta:1204.18, canTrade:true,  banner:null },
  { id:'power_daily',          label:'Power · daily',          equity:48210.18, delta:2106.40, canTrade:true,  banner:null },
  { id:'risk_stress',          label:'Risk / liquidation',     equity:18402.10, delta:-2140.00, canTrade:true,  warn:true, banner:{tone:'down', text:'A position is near liquidation. Consider reducing before adding risk.'} },
  { id:'dormant_return',       label:'Dormant return',         equity:21940.00, delta:540.00, canTrade:true,  banner:{tone:'note', text:'Welcome back — prices moved while you were away. Re-check your levels.'} },
  { id:'active',               label:'Active trading',         equity:24837.42, delta:1204.18, canTrade:true,  banner:null },
];
const ARX_STAGE = Object.fromEntries(ARX_LIFECYCLE.map(s => [s.id, s]));
function arxStageState(stage){ return ARX_STAGE[stage] || ARX_STAGE.active; }
function arxStageEquity(stage){ return arxStageState(stage).equity; }
function arxFmtUSD(n){ return '$' + Number(n||0).toLocaleString(undefined, { minimumFractionDigits: (n%1?2:0), maximumFractionDigits:2 }); }
function arxTradeStage(stage){ return arxStageState(stage); }
function useLifecycleStage(){
  const [s,setS] = xS(()=>{ try{ return localStorage.getItem('arx-lifecycle')||'active'; }catch(e){ return 'active'; } });
  React.useEffect(()=>{ const h=()=>{ try{ setS(localStorage.getItem('arx-lifecycle')||'active'); }catch(e){} }; window.addEventListener('arx-demo', h); return ()=>window.removeEventListener('arx-demo', h); }, []);
  return s;
}
const TONE_MAP = { violet:['var(--color-violet-500)','rgba(124,91,255,.10)','rgba(124,91,255,.28)'], down:['var(--regime-down-mid)','rgba(242,106,106,.10)','rgba(242,106,106,.28)'], note:['var(--regime-range-mid)','rgba(59,130,246,.10)','rgba(59,130,246,.26)'] };
function TicketBanner({ banner, onAct }){
  if(!banner) return null;
  const [ink,bg,bd] = TONE_MAP[banner.tone] || TONE_MAP.violet;
  return (
    <div className="arx-arrive" style={{display:'flex', alignItems:'center', gap:10, margin:'0 16px 10px', padding:'10px 13px', borderRadius:12, background:bg, border:'.5px solid '+bd}}>
      <span style={{width:6, height:6, borderRadius:'50%', background:ink, flexShrink:0, boxShadow:'0 0 8px '+ink}}/>
      <span style={{flex:1, font:'500 12px var(--font-body)', color:'var(--text-secondary)', lineHeight:1.4}}>{banner.text}</span>
      {banner.tone==='down' && <button onClick={onAct} style={{flexShrink:0, height:28, padding:'0 12px', borderRadius:9, border:'none', cursor:'pointer', background:ink, color:'#fff', font:'700 11.5px var(--font-body)'}}>Reduce</button>}
    </div>
  );
}

/* Open positions the ticket should be aware of (Add / Reduce / Close / Flip) */
const ARX_POSITIONS = {
  SOL: { dir:'LONG', lev:'6×', size:'$3,420', pnl:'+$284.10', entry:'$182.41', liq:'$168.20', margin:'$570' },
  ETH: { dir:'SHORT', lev:'4×', size:'$1,860', pnl:'−$42.30', entry:'$3,910.20', liq:'$4,120.00', margin:'$465' },
  BTC: { dir:'LONG', lev:'10×', size:'$120K', pnl:'−$2,140', entry:'$66,180', liq:'$62,180', margin:'$12K' },
};
function PositionStrip({ sym, onManage, onToast }){
  const p = ARX_POSITIONS[sym]; if(!p) return null;
  const long = p.dir==='LONG'; const up = (p.pnl||'+').startsWith('+');
  return (
    <div style={{margin:'0 16px 12px', borderRadius:14, background:'var(--surface-elevated)', border:'.5px solid var(--border-default)', padding:'11px 13px'}}>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <span style={{font:'600 9px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.06em'}}>Your position</span>
        <span style={{font:'700 10px var(--font-body)', color: long?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{p.dir} {p.lev}</span>
        <span style={{flex:1}}/>
        <span className="num" style={{font:'700 13px var(--font-mono)', color: up?'var(--regime-up-mid)':'var(--regime-down-mid)'}}>{p.pnl}</span>
      </div>
      <div className="num" style={{font:'500 10.5px var(--font-mono)', color:'var(--text-tertiary)', marginTop:4}}>Size {p.size} · entry {p.entry} · liq {p.liq}</div>
      <div style={{display:'flex', gap:6, marginTop:10}}>
        {[['Add','add'],['Reduce','reduce'],['Close','close'],['Flip','flip']].map(([l,a])=>(
          <button key={a} onClick={()=> a==='add' ? (onToast&&onToast('Add to '+sym+' — set size below')) : a==='flip' ? (onToast&&onToast('Flip '+sym+' '+(long?'to short':'to long'))) : (onManage&&onManage(p,sym))} className="arx-press" style={{flex:1, height:32, borderRadius:9, cursor:'pointer', border:'.5px solid '+(a==='close'?'rgba(242,106,106,.4)':'var(--border-default)'), background: a==='add'?'rgba(124,91,255,.12)':'transparent', color: a==='close'?'var(--regime-down-mid)':a==='add'?'var(--color-violet-500)':'var(--text-secondary)', font:'600 11.5px var(--font-body)'}}>{l}</button>
        ))}
      </div>
    </div>
  );
}

/* ─────────── Wallet sheet — balance · breakdown · history · state CTA (opened from header) ─────────── */
function WalletSheet({ stage, onClose, onToast }) {
  const liveStage = (window.useLifecycleStage ? window.useLifecycleStage() : 'active');
  const st = stage || liveStage;
  const cfg = (window.arxStageState ? window.arxStageState(st) : { canTrade:true, equity:24837.42, delta:1204.18 });
  const funded = (cfg.equity || 0) > 0;
  const eqStr = window.arxFmtUSD ? window.arxFmtUSD(cfg.equity) : '$0.00';
  const dpct = cfg.equity ? (cfg.delta/cfg.equity*100) : 0;
  const avail = (cfg.equity*0.37), inPos = (cfg.equity*0.58), copying = (cfg.equity*0.05);
  const sub = (id)=>{ onClose&&onClose(); window.__arxOpenSub&&window.__arxOpenSub(id); };
  return (
    <Sheet onClose={onClose} maxHeight="86%" zIndex={75}>
        {/* wallet identity — address · copy · QR · self-custody · network */}
        <div style={{display:'flex', alignItems:'center', gap:11, padding:'6px 20px 12px', borderBottom:'.5px solid var(--border-default)'}}>
          <span style={{width:38, height:38, borderRadius:'50%', flexShrink:0, background:'linear-gradient(135deg,#9880FF,#5436D9)', display:'flex', alignItems:'center', justifyContent:'center', font:'700 13px var(--font-body)', color:'#fff'}}>SC</span>
          <div style={{flex:1, minWidth:0}}>
            <div style={{display:'flex', alignItems:'center', gap:6}}>
              <span className="num" style={{font:'600 13.5px var(--font-mono)', color:'var(--text-primary)'}}>0x4b2e…91ac</span>
              <button onClick={()=>onToast&&onToast('Address copied')} aria-label="Copy address" style={{background:'none', border:'none', cursor:'pointer', padding:2, display:'flex'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15"/></svg>
              </button>
              <button onClick={()=>onToast&&onToast('Receive · show QR')} aria-label="QR code" style={{background:'none', border:'none', cursor:'pointer', padding:2, display:'flex'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><line x1="14" y1="14" x2="14" y2="21"/><line x1="18" y1="14" x2="21" y2="14"/><line x1="21" y1="18" x2="21" y2="21"/></svg>
              </button>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:8, marginTop:3}}>
              <span style={{display:'inline-flex', alignItems:'center', gap:4, font:'600 9px var(--font-body)', color:'var(--regime-up-mid)'}}><span className="arx-breath" style={{width:5, height:5, borderRadius:'50%', background:'var(--regime-up-mid)'}}/>Live on Hyperliquid</span>
              <span style={{font:'500 9px var(--font-body)', color:'var(--text-tertiary)'}}>· self-custody · keys never leave you</span>
            </div>
          </div>
        </div>
        <div style={{padding:'14px 20px 0'}}>
          <div style={{font:'500 11px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.05em'}}>Total equity</div>
          <div className="num" style={{font:'600 34px var(--font-mono)', letterSpacing:'-.02em', marginTop:4}}>{eqStr}</div>
          {funded && cfg.delta!==0 && <div className="num" style={{font:'600 12px var(--font-mono)', color: cfg.delta>=0?'var(--regime-up-mid)':'var(--regime-down-mid)', marginTop:2}}>{cfg.delta>=0?'+':'−'}{window.arxFmtUSD(Math.abs(cfg.delta))} · {cfg.delta>=0?'+':'−'}{Math.abs(dpct).toFixed(2)}% today</div>}
          {!funded && <div style={{font:'500 12.5px var(--font-body)', color:'var(--text-secondary)', marginTop:6, lineHeight:1.5}}>Your money hub. Add funds to start — as little as $50.</div>}
        </div>
        {funded && (
          <div style={{display:'flex', margin:'16px 20px 0', padding:'12px 0', borderTop:'.5px solid var(--border-default)', borderBottom:'.5px solid var(--border-default)'}}>
            {[['Available',avail],['In positions',inPos],['Copying',copying]].map(([k,v],i)=>(
              <div key={k} style={{flex:1, paddingLeft:i?12:0, borderLeft:i?'.5px solid var(--border-default)':'none'}}>
                <div style={{font:'500 9.5px var(--font-body)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'.04em'}}>{k}</div>
                <div className="num" style={{font:'600 13.5px var(--font-mono)', marginTop:3}}>{window.arxFmtUSD(v)}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{display:'flex', gap:10, padding:'16px 20px 8px'}}>
          {!funded ? (
            <button onClick={()=>{ onToast&&onToast('Add funds — start with $50'); }} className="arx-press" style={{flex:1, height:48, borderRadius:14, border:'none', cursor:'pointer', background:'var(--color-violet-500)', color:'#fff', font:'700 15px var(--font-body)', boxShadow:'var(--shadow-execute)'}}>Add funds</button>
          ) : (<>
            <button onClick={()=>{ onToast&&onToast('Deposit — fund your Arx wallet'); }} className="arx-press" style={{flex:1, height:46, borderRadius:13, border:'none', cursor:'pointer', background:'var(--color-violet-500)', color:'#fff', font:'600 14px var(--font-body)'}}>Deposit</button>
            <button onClick={()=>{ onToast&&onToast('Withdraw — USDC to wallet'); }} className="arx-press" style={{flex:1, height:46, borderRadius:13, cursor:'pointer', background:'transparent', color:'var(--text-primary)', border:'.5px solid var(--border-strong)', font:'600 14px var(--font-body)'}}>Withdraw</button>
            <button onClick={()=>sub('transfer')} className="arx-press" style={{flex:1, height:46, borderRadius:13, cursor:'pointer', background:'transparent', color:'var(--text-primary)', border:'.5px solid var(--border-strong)', font:'600 14px var(--font-body)'}}>Transfer</button>
          </>)}
        </div>
        {[['Trading history','Fills · orders · positions','history'],['Fees & funding','30-day breakdown','history'],['Account & security','Passkeys · app lock','you']].map(([k,v,id])=>(
          <button key={k} onClick={()=> id==='you' ? (onClose&&onClose(), window.__arxGoTab&&window.__arxGoTab('you')) : sub(id)} className="arx-row-press" style={{display:'flex', alignItems:'center', gap:12, width:'100%', padding:'14px 20px', background:'none', border:'none', borderTop:'.5px solid var(--border-default)', cursor:'pointer', textAlign:'left'}}>
            <div style={{flex:1}}><div style={{font:'600 14px var(--font-body)', color:'var(--text-primary)'}}>{k}</div><div style={{font:'400 11.5px var(--font-body)', color:'var(--text-tertiary)', marginTop:2}}>{v}</div></div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round"><polyline points="9 6 15 12 9 18"/></svg>
          </button>
        ))}
    </Sheet>
  );
}

Object.assign(window, {
  RwaFundamentals, RelatedAssets, OrderStateBadge, PositionManageSheet, SlideToConfirm,
  TransferFlow, HistoryScreen, useAppLock, PrefToggleRow, ARX_FUND, TradingViewChart, PairSelector, FundingCountdown,
  arxTradeStage, useLifecycleStage, TicketBanner, PositionStrip, ARX_POSITIONS, WalletSheet, ARX_LIFECYCLE, arxStageState, arxStageEquity, arxFmtUSD,
});
